const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * FormationService
 * Manages the 3x3 tactical grid and hero stat calculation.
 * Enforces unique positioning and aggregates Dual-Wield traits.
 */
class FormationService {
    /**
     * Updates a formation preset with new hero positions.
     * @param {number} userId 
     * @param {number} presetId 
     * @param {Array} slots Array of { heroId, gridX, gridY }
     */
    async updateFormation(userId, presetId, slots) {
        // 1. Basic Validation
        if (slots.length > 9) throw new Error("A formation cannot exceed 9 heroes.");
        
        const preset = await prisma.formationPreset.findUnique({
            where: { id: presetId }
        });
        if (!preset || preset.userId !== userId) throw new Error("Invalid preset.");

        // 2. Clear old slots and Validate boundaries
        const usedPositions = new Set();
        const usedHeroes = new Set();

        for (const slot of slots) {
            if (slot.gridX < 0 || slot.gridX > 2 || slot.gridY < 0 || slot.gridY > 2) {
                throw new Error(`Invalid grid position: [${slot.gridX}, ${slot.gridY}]. Must be 0-2.`);
            }
            
            const posKey = `${slot.gridX},${slot.gridY}`;
            if (usedPositions.has(posKey)) throw new Error("Multiple heroes cannot occupy the same slot.");
            if (usedHeroes.has(slot.heroId)) throw new Error("A hero cannot be in two places at once.");
            
            usedPositions.add(posKey);
            usedHeroes.add(slot.heroId);
        }

        // 3. Atomic Update
        return await prisma.$transaction([
            prisma.formationSlot.deleteMany({ where: { presetId: presetId } }),
            prisma.formationSlot.createMany({
                data: slots.map(s => ({
                    presetId: presetId,
                    heroId: s.heroId,
                    gridX: s.gridX,
                    gridY: s.gridY
                }))
            })
        ]);
    }

    /**
     * Calculates the full combat profile of a hero, 
     * including Dual-Wield trait aggregation.
     */
    async getHeroCombatProfile(heroId) {
        const hero = await prisma.hero.findUnique({
            where: { id: heroId },
            include: {
                equipment: {
                    include: {
                        itemInstance: {
                            include: {
                                template: {
                                    include: {
                                        stats: true,
                                        traits: { include: { trait: true } }
                                    }
                                }
                            }
                        }
                    }
                },
                combatClass: true,
                traits: { include: { trait: true } }
            }
        });

        const profile = {
            name: hero.name,
            totalStats: {},
            activeTraits: [] // Aggregated from Main-Hand, Off-Hand, and Hero
        };

        // 1. Add Base Hero Traits
        hero.traits.forEach(t => profile.activeTraits.push(t.trait.name));

        // 2. Aggregate Equipment Stats & Traits
        for (const eq of hero.equipment) {
            const item = eq.itemInstance.template;
            
            // Add Stats
            item.stats.forEach(s => {
                profile.totalStats[s.statKey] = (profile.totalStats[s.statKey] || 0) + s.statValue;
            });

            // Add Traits (Dual-Wield Aggregation)
            item.traits.forEach(t => {
                profile.activeTraits.push({
                    name: t.trait.name,
                    sourceSlot: eq.slotKey
                });
            });
        }

        return profile;
    }

    /**
     * Gets the full party profile for a preset.
     */
    async getPartyProfile(presetId) {
        const slots = await prisma.formationSlot.findMany({
            where: { presetId },
            include: { hero: true }
        });

        const party = [];
        for (const slot of slots) {
            const profile = await this.getHeroCombatProfile(slot.heroId);
            party.push({
                grid: { x: slot.gridX, y: slot.gridY },
                profile
            });
        }
        return party;
    }
}

module.exports = new FormationService();
