const prisma = require('../db');


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
    /**
     * Moves or Places a single unit on the grid.
     */
        async moveUnit(userId, presetId, heroId, gridX, gridY) {
            // 1. Validation
            if (gridX < 0 || gridX > 49 || gridY < 25 || gridY > 49) throw new Error("Invalid territory.");
    
            const [preset, hero] = await Promise.all([
                prisma.formationPreset.findUnique({ where: { id: presetId } }),
                prisma.hero.findUnique({ where: { id: heroId } })
            ]);
    
            if (!preset || preset.userId !== userId) throw new Error("Unauthorized preset access.");
            if (!hero || hero.userId !== userId) throw new Error("Unauthorized hero ownership.");
    
            // 2. Atomic Move
            return await prisma.$transaction(async (tx) => {
                await tx.formationSlot.deleteMany({ where: { presetId, heroId } });
                await tx.formationSlot.deleteMany({ where: { presetId, gridX, gridY } });
                return await tx.formationSlot.create({
                    data: { presetId, heroId, gridX, gridY }
                });
            });
        }
    
        async removeUnit(userId, presetId, gridX, gridY) {
            const preset = await prisma.formationPreset.findUnique({ where: { id: presetId } });
            if (!preset || preset.userId !== userId) throw new Error("Unauthorized.");
    
            return await prisma.formationSlot.deleteMany({
                where: { presetId, gridX, gridY }
            });
        }
    
        async updateFormation(userId, presetId, slots) {
            // 1. Massive Grid Validation (50x50)
            if (slots.length > 2500) throw new Error("Formation cannot exceed 2500 units.");
    
            const preset = await prisma.formationPreset.findUnique({
                where: { id: presetId }
            });
            if (!preset || preset.userId !== userId) throw new Error("Invalid preset.");
    
            // SECURITY: Verify all heroes in batch belong to the user
            const heroIds = slots.map(s => s.heroId);
            const ownedCount = await prisma.hero.count({
                where: { id: { in: heroIds }, userId }
            });
            if (ownedCount !== heroIds.length) throw new Error("Unauthorized hero ownership in batch update.");
    
            // 2. Clear old slots and Validate boundaries        const usedPositions = new Set();
        const usedHeroes = new Set();

        for (const slot of slots) {
            // BOUNDARY: X (0-49), Y (25-49 for Player Territory)
            if (slot.gridX < 0 || slot.gridX > 49 || slot.gridY < 25 || slot.gridY > 49) {
                throw new Error(`Invalid grid position: [${slot.gridX}, ${slot.gridY}]. Player must stay in Rows 25-49.`);
            }
            
            const posKey = `${slot.gridX},${slot.gridY}`;
            if (usedPositions.has(posKey)) throw new Error("Multiple units cannot occupy the same slot.");
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
