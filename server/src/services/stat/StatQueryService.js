/**
 * StatQueryService.js
 * Manages complex stat queries, breakdowns, and analysis.
 * Single Responsibility: Provide detailed stat views and specific mechanics analysis.
 */
const BaseService = require('../BaseService');
const ElementalResolver = require('./ElementalResolver');
const SetBonusResolver = require('./SetBonusResolver');

class StatQueryService extends BaseService {
    /**
     * Create the query service.
     * @param {Object} calculationEngine - Reference to StatCalculationEngine.
     */
    constructor(calculationEngine) {
        super();
        this.calculationEngine = calculationEngine;
        this.elementalResolver = new ElementalResolver();
        this.setBonusResolver = new SetBonusResolver();
    }

    /**
     * Get elemental stats for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Elemental affinities, resistances, bonus damage.
     */
    async getElementalStats(heroId) {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const affinities = hero.elementalAffinities || [];
        const stats = await this.calculationEngine.calculateHeroStats(heroId);
        
        return {
            affinities: affinities.map(a => ({
                element: a.elementType || a.elementTypeId,
                bonusDamage: a.bonusDamage || 0,
                resistanceBonus: a.resistance || 0
            })),
            resistances: {
                fire: stats.fire_resistance || 0,
                water: stats.water_resistance || 0,
                earth: stats.earth_resistance || 0,
                wind: stats.wind_resistance || 0,
                light: stats.light_resistance || 0,
                dark: stats.dark_resistance || 0
            },
            bonusDamage: {
                fire: stats.fire_damage || 0,
                water: stats.water_damage || 0,
                earth: stats.earth_damage || 0,
                wind: stats.wind_damage || 0,
                light: stats.light_damage || 0,
                dark: stats.dark_damage || 0
            },
            equipmentBonuses: this.elementalResolver.getEquipmentElementalBonuses(hero.equipment || []),
            setBonuses: this.elementalResolver.getSetElementalBonuses(hero.equipment || [])
        };
    }

    /**
     * Get set bonuses for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Equipped sets, active bonuses, synergy info.
     */
    async getSetBonuses(heroId) {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const equipment = hero.equipment || [];
        const setData = this.setBonusResolver.registerSetBonuses(equipment);
        
        const setIds = [...new Set(equipment
            .map(eq => eq.itemInstance?.template?.setId)
            .filter(Boolean)
        )];
        
        if (setIds.length === 0) {
             return {
                sets: [],
                totalActiveBonuses: 0,
                totalSetCount: 0
            };
        }
        
        const setTemplates = await this.db.equipmentSetTemplate.findMany({
            where: { id: { in: setIds } },
            include: { setBonuses: { include: { stats: true, conditions: true } } }
        });
        
        const sets = [];
        for (const template of setTemplates) {
            const equippedPieces = equipment.filter(eq => 
                eq.itemInstance?.template?.setId === template.id
            );
            
            const activeBonuses = this.setBonusResolver.getActiveBonuses(
                setData,
                setTemplates,
                { equipment }
            ).filter(b => b.setId === template.id);
            
            sets.push({
                id: template.id,
                name: template.name,
                totalPieces: equippedPieces.length,
                pieces: equippedPieces.map(eq => ({
                    id: eq.itemInstanceId,
                    name: eq.itemInstance?.template?.name,
                    slot: eq.slot,
                    quality: eq.itemInstance?.quality
                })),
                activeBonuses: activeBonuses.map(b => ({
                    piecesRequired: b.piecesRequired,
                    bonus: b.bonus,
                    isActive: b.isActive
                })),
                synergyBonus: this._calculateSetSynergy(setData, template.id)
            });
        }
        
        return {
            sets,
            totalActiveBonuses: sets.reduce((sum, s) => 
                sum + s.activeBonuses.filter(b => b.isActive).length, 0),
            totalSetCount: setIds.length
        };
    }

    /**
     * Calculate set synergy bonus.
     * @param {Object} setData - Set data.
     * @param {number} setId - Set ID.
     * @returns {Object} Synergy result.
     * @private
     */
    _calculateSetSynergy(setData, setId) {
        return { multiplier: 1.0, notes: 'No synergy bonus' };
    }

    /**
     * Get equipment stats for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Equipment stat bonuses, quality modifiers, durability impact.
     */
    async getEquipmentStats(heroId) {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const equipment = hero.equipment || [];
        const qualityMultipliers = {
            'COMMON': 1.0,
            'UNCOMMON': 1.1,
            'RARE': 1.15,
            'EPIC': 1.25,
            'MASTERWORK': 1.3,
            'LEGENDARY': 1.5
        };
        
        const equipmentStats = [];
        let totalBonuses = {};
        
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            if (!instance) continue;
            
            const template = instance.template;
            const maxDurability = instance.maxDurability || 100;
            const durabilityFactor = Math.max(0.5, instance.currentDurability / maxDurability);
            const qualityMult = qualityMultipliers[instance.quality] || 1.0;
            const powerScale = instance.powerScale || 1.0;
            const totalMultiplier = qualityMult * powerScale * durabilityFactor;
            
            const bonuses = {};
            
            template.stats?.forEach(s => {
                bonuses[s.statKey] = {
                    base: s.statValue,
                    qualityModifier: qualityMult,
                    durabilityImpact: durabilityFactor,
                    final: s.statValue * totalMultiplier,
                    source: `Equip:${template.name}`
                };
            });
            
            equipmentStats.push({
                slot: eq.slot,
                itemId: instance.id,
                name: template.name,
                quality: instance.quality,
                durability: {
                    current: instance.currentDurability,
                    max: maxDurability,
                    percentage: (instance.currentDurability / maxDurability) * 100,
                    status: instance.currentDurability >= maxDurability * 0.8 ? 'Good' :
                            instance.currentDurability >= maxDurability * 0.5 ? 'Damaged' :
                            instance.currentDurability >= maxDurability * 0.25 ? 'Poor' : 'Broken'
                },
                qualityModifier: qualityMult,
                powerScale: powerScale,
                totalMultiplier: totalMultiplier,
                bonuses,
                isBroken: instance.currentDurability <= 0
            });
            
            Object.entries(bonuses).forEach(([key, value]) => {
                totalBonuses[key] = (totalBonuses[key] || 0) + value.final;
            });
            
            // Add gem socket bonuses
            if (instance.socket && instance.socket.gem) {
                const gem = instance.socket.gem;
                const gemBonus = {};
                
                if (gem.statValue > 0) {
                    gemBonus[gem.statKey] = {
                        base: gem.statValue,
                        qualityModifier: 1.0,
                        durabilityImpact: 1.0,
                        final: gem.statValue,
                        source: `Gem:${gem.name}`
                    };
                }
                
                if (gem.percentValue > 0) {
                    const percentKey = gem.statKey + '_percent';
                    gemBonus[percentKey] = {
                        base: gem.percentValue,
                        qualityModifier: 1.0,
                        durabilityImpact: 1.0,
                        final: gem.percentValue,
                        source: `Gem:${gem.name}`
                    };
                }
                
                equipmentStats[equipmentStats.length - 1].gemSocket = {
                    hasGem: true,
                    gemName: gem.name,
                    element: gem.element,
                    tier: gem.tier,
                    bonuses: gemBonus
                };
                
                Object.entries(gemBonus).forEach(([key, value]) => {
                    totalBonuses[key] = (totalBonuses[key] || 0) + value.final;
                });
            } else {
                equipmentStats[equipmentStats.length - 1].gemSocket = {
                    hasGem: false
                };
            }
        }
        
        return {
            equipment: equipmentStats,
            totalBonuses,
            summary: {
                totalItems: equipmentStats.length,
                brokenItems: equipmentStats.filter(e => e.isBroken).length,
                averageQuality: equipmentStats.reduce((sum, e) => 
                    sum + e.qualityModifier, 0) / (equipmentStats.length || 1)
            }
        };
    }

    /**
     * Get stat capabilities for a hero (now uses fixed growth system).
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Stat caps and growth info.
     */
    async getStatCapabilities(heroId) {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }

        const caps = this.calculationEngine.statCapResolver.getCaps(hero);
        const currentStats = await this.calculationEngine.calculateHeroStats(heroId);
        
        // Get growth info from class
        const growthInfo = this.calculationEngine.getGrowthInfo(hero.combatClass?.name);
        
        return {
            growthSystem: 'fixed',
            level: hero.unitLevel,
            class: hero.combatClass?.name,
            statCaps: caps.primary || {},
            growthRates: growthInfo?.statGrowth || {},
            currentStats: {
                str: currentStats.str || 0,
                dex: currentStats.dex || 0,
                int: currentStats.int || 0,
                vit: currentStats.vit || 0,
                luk: currentStats.luk || 0
            },
            availablePoints: 0, // No manual allocation in fixed growth
            totalSpent: 0,
            message: 'Stats are now automatically calculated based on class and level'
        };
    }
}

module.exports = StatQueryService;
