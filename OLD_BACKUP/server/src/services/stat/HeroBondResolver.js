/**
 * HeroBondResolver
 * Handles party synergy bonuses based on class combinations, race synergies, and elemental bonds.
 * 
 * Bond Types:
 * - CLASS: Based on hero classes in party
 * - RACE: Based on hero races in party
 * - ELEMENTAL: Based on hero elemental affinities
 */
const BaseService = require('../BaseService');
const prisma = require('../../db');

class HeroBondResolver extends BaseService {
    constructor() {
        super();
        // Cache for bond templates
        this._bondTemplates = null;
    }

    /**
     * Get all active bond templates
     */
    async getBondTemplates() {
        if (!this._bondTemplates) {
            this._bondTemplates = await prisma.heroBond.findMany({
                where: { isActive: true }
            });
        }
        return this._bondTemplates;
    }

    /**
     * Refresh bond templates cache
     */
    async refreshBondTemplates() {
        this._bondTemplates = null;
        return this.getBondTemplates();
    }

    /**
     * Calculate active bonds for a user's party
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of active bond objects
     */
    async calculateActiveBonds(userId) {
        // Get all heroes in user's formation
        const partyHeroes = await this.getPartyHeroes(userId);
        
        if (partyHeroes.length < 2) {
            return []; // Need at least 2 heroes for bonds
        }

        const templates = await this.getBondTemplates();
        const activeBonds = [];

        // Check each template against the party
        for (const template of templates) {
            const matched = this.checkBondRequirement(template, partyHeroes);
            if (matched) {
                activeBonds.push({
                    bondId: template.id,
                    name: template.name,
                    description: template.description,
                    bondType: template.bondType,
                    bonuses: JSON.parse(template.bonuses),
                    heroIds: partyHeroes.map(h => h.id)
                });
            }
        }

        return activeBonds;
    }

    /**
     * Get heroes in user's active formation
     */
    async getPartyHeroes(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                formationPresets: {
                    include: {
                        slots: {
                            include: {
                                hero: {
                                    include: {
                                        combatClass: true,
                                        elementalAffinities: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!user || user.formationPresets.length === 0) {
            return [];
        }

        // Get first preset (default formation)
        const preset = user.formationPresets[0];
        return preset.slots.map(slot => slot.hero);
    }

    /**
     * Check if a bond requirement is met by the party
     */
    checkBondRequirement(template, partyHeroes) {
        const requirement = JSON.parse(template.requirement);
        
        switch (template.bondType) {
            case 'CLASS':
                return this.checkClassBond(requirement, partyHeroes);
            case 'RACE':
                return this.checkRaceBond(requirement, partyHeroes);
            case 'ELEMENTAL':
                return this.checkElementalBond(requirement, partyHeroes);
            default:
                return false;
        }
    }

    /**
     * Check class bond requirement
     * Requirement format: { classes: ["WARRIOR", "MAGE"], matchCount: 2 }
     */
    checkClassBond(requirement, partyHeroes) {
        const requiredClasses = requirement.classes || [];
        const matchCount = requirement.matchCount || requiredClasses.length;
        
        const partyClasses = partyHeroes.map(h => h.combatClass?.name?.toUpperCase()).filter(Boolean);
        
        let matches = 0;
        for (const requiredClass of requiredClasses) {
            if (partyClasses.includes(requiredClass.toUpperCase())) {
                matches++;
            }
        }
        
        return matches >= matchCount;
    }

    /**
     * Check race bond requirement
     * Requirement format: { race: "UNDEAD", count: 2 }
     */
    checkRaceBond(requirement, partyHeroes) {
        const requiredRace = requirement.race?.toUpperCase();
        const requiredCount = requirement.count || 2;
        
        const matchingRaceCount = partyHeroes.filter(h => 
            h.race && h.race.toUpperCase() === requiredRace
        ).length;
        
        return matchingRaceCount >= requiredCount;
    }

    /**
     * Check elemental bond requirement
     * Requirement format: { element: "FIRE", matchCount: 2 }
     */
    checkElementalBond(requirement, partyHeroes) {
        const requiredElement = requirement.element?.toUpperCase();
        const matchCount = requirement.matchCount || partyHeroes.length;
        
        // Get primary element from each hero
        const partyElements = partyHeroes.map(h => {
            // Check elemental affinities for primary element
            const affinity = h.elementalAffinities?.[0];
            return affinity?.elementType?.toUpperCase();
        }).filter(Boolean);
        
        let matches = 0;
        for (const element of partyElements) {
            if (element === requiredElement) {
                matches++;
            }
        }
        
        return matches >= matchCount;
    }

    /**
     * Apply bond bonuses to stats
     * @param {Object} stats - Stats object to apply bonuses to
     * @param {Array} activeBonds - Active bonds to apply
     * @param {Function} applyMod - applyMod function from stat calculation
     */
    applyBondBonuses(stats, activeBonds, applyMod) {
        for (const bond of activeBonds) {
            const bonuses = bond.bonuses;
            
            for (const [statKey, value] of Object.entries(bonuses)) {
                // Apply as PERCENT_ADD (flat percentage bonus)
                // Example: 0.05 = +5%
                applyMod(statKey, value, 1, `Bond:${bond.name}`, {
                    priority: 36 // Between GUILD (35) and FACTION (40)
                });
            }
        }
    }

    /**
     * Save active bonds to database
     * @param {number} userId - User ID
     * @param {Array} activeBonds - Active bonds to save
     */
    async saveActiveBonds(userId, activeBonds) {
        // Delete existing bonds for user
        await prisma.userHeroBond.deleteMany({
            where: { userId }
        });

        // Create new bonds
        for (const bond of activeBonds) {
            await prisma.userHeroBond.create({
                data: {
                    userId,
                    bondId: bond.bondId,
                    heroIds: JSON.stringify(bond.heroIds),
                    activated: true,
                    activatedAt: new Date()
                }
            });
        }
    }

    /**
     * Recalculate bonds for a user (called when party composition changes)
     * @param {number} userId - User ID
     */
    async recalculateBonds(userId) {
        const activeBonds = await this.calculateActiveBonds(userId);
        await this.saveActiveBonds(userId, activeBonds);
        
        // Invalidate stat cache for all heroes in party
        const heroes = await this.getPartyHeroes(userId);
        const statService = require('./statService');
        for (const hero of heroes) {
            statService.invalidateHeroCache(hero.id);
        }
        
        return activeBonds;
    }

    /**
     * Get bond bonuses for a specific hero
     * @param {number} heroId - Hero ID
     * @returns {Promise<Object>} Bond bonuses object
     */
    async getHeroBondBonuses(heroId) {
        // Get user's active bonds
        const hero = await prisma.hero.findUnique({
            where: { id: heroId },
            select: { userId: true }
        });

        if (!hero) {
            return {};
        }

        const activeBonds = await this.calculateActiveBonds(hero.userId);
        
        // Aggregate bonuses from all active bonds
        const aggregatedBonuses = {};
        for (const bond of activeBonds) {
            if (bond.heroIds.includes(heroId)) {
                for (const [statKey, value] of Object.entries(bond.bonuses)) {
                    aggregatedBonuses[statKey] = (aggregatedBonuses[statKey] || 0) + value;
                }
            }
        }

        return aggregatedBonuses;
    }
}

module.exports = new HeroBondResolver();
