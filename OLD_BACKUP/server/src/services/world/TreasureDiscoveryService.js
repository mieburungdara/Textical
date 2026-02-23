const prisma = require('../../db');
const questService = require('../questService'); // Correct path relative to services/world/
const inventoryService = require('../inventoryService'); // Correct path relative to services/world/

/**
 * TreasureDiscoveryService
 * Handles hidden treasure discovery mechanics with passive RNG + unit traits bonus.
 */
class TreasureDiscoveryService {
    
    /**
     * Attempt to discover hidden treasure in a region.
     * @param {number} userId 
     * @param {number} regionId 
     * @returns {Promise<{discovered: boolean, treasure?: object, message: string}>}
     */
    async attemptDiscovery(userId, regionId) {
        // 1. Find active treasures in region
        const activeTreasure = await prisma.hiddenTreasure.findFirst({
            where: {
                regionId,
                isActive: true,
                OR: [
                    { respawnAt: null },
                    { respawnAt: { lte: new Date() } }
                ]
            }
        });

        if (!activeTreasure) {
            return { discovered: false, message: "No hidden treasure available in this region." };
        }

        // 2. Get user's party units
        const userHeroes = await prisma.hero.findMany({
            where: { userId }
        });

        // 3. Calculate discovery chance
        const traitsBonus = this.calculateTraitsBonus(userHeroes);
        const finalChance = Math.min(1.0, activeTreasure.baseChance + traitsBonus);

        console.log(`[TREASURE] User ${userId} attempting discovery in Region ${regionId}`);
        console.log(`[TREASURE] Base Chance: ${(activeTreasure.baseChance * 100).toFixed(1)}%`);
        console.log(`[TREASURE] Traits Bonus: ${(traitsBonus * 100).toFixed(1)}%`);
        console.log(`[TREASURE] Final Chance: ${(finalChance * 100).toFixed(1)}%`);

        // 4. RNG Roll
        const roll = Math.random();
        const discovered = roll < finalChance;

        if (!discovered) {
            return { 
                discovered: false, 
                message: `You searched carefully but found nothing. (Roll: ${(roll * 100).toFixed(1)}%)` 
            };
        }

        // 5. Award treasure
        const reward = await this.claimTreasure(activeTreasure.id, userId);
        
        return {
            discovered: true,
            treasure: activeTreasure,
            reward,
            message: `You discovered a hidden ${activeTreasure.treasureType.toLowerCase()}!`
        };
    }

    /**
     * Calculate bonus discovery chance from unit traits.
     * @param {Array} heroes - User's hero array with templates
     * @returns {number} Total bonus (0.0 to 0.5)
     */
    calculateTraitsBonus(heroes) {
        let totalBonus = 0;

        for (const hero of heroes) {
            const race = hero.race; // Directly from Hero model
            
            // Treasure Hunter traits by unit race
            if (race === 'THIEF' || race === 'ROGUE') {
                totalBonus += 0.20; // +20% for Thief
            } else if (race === 'RANGER' || race === 'SCOUT') {
                totalBonus += 0.15; // +15% for Ranger
            } else if (race === 'ELF') {
                totalBonus += 0.10; // +10% for nature-attuned Elf
            }
        }

        // Cap total bonus at 50%
        return Math.min(0.50, totalBonus);
    }

    /**
     * Claim treasure and distribute rewards.
     * @param {number} treasureId 
     * @param {number} userId 
     * @returns {Promise<object>}
     */
    async claimTreasure(treasureId, userId) {
        const treasure = await prisma.hiddenTreasure.findUnique({
            where: { id: treasureId }
        });

        if (!treasure) {
            throw new Error("Treasure not found.");
        }

        // Generate loot based on treasure type
        const loot = this.generateLoot(treasure.treasureType);

        // 1. Award Silver
        if (loot.silver > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { silver: { increment: loot.silver } }
            });
        }

        // 2. Award Items (Try to find by name)
        const awardedItems = [];
        for (const itemName of loot.items) {
            const itemTemplate = await prisma.itemTemplate.findFirst({
                where: { name: itemName }
            });

            if (itemTemplate) {
                try {
                    await inventoryService.addItem(userId, itemTemplate.id, 1);
                    awardedItems.push(itemName);
                } catch (err) {
                    console.warn(`[TREASURE] Failed to add item '${itemName}' to User ${userId}:`, err.message);
                }
            } else {
                console.warn(`[TREASURE] Item '${itemName}' not found in database. Skipping.`);
            }
        }

        // 3. Update Quest Progress
        try {
            // Update specific treasure type quest (e.g., "Find 3 Herbs")
            await questService.updateQuestProgress(userId, 'FIND_TREASURE', treasure.treasureType);
            
            // Update generic treasure quest (e.g., "Find any 5 Treasures")
            await questService.updateQuestProgress(userId, 'FIND_TREASURE_ANY', 'ANY');
        } catch (err) {
            console.error(`[TREASURE] Failed to update quest progress for User ${userId}:`, err.message);
        }

        console.log(`[TREASURE] User ${userId} claimed treasure ${treasureId}. Silver: ${loot.silver}, Items: ${awardedItems.join(', ')}`);

        // 4. Set treasure cooldown
        const respawnDate = new Date();
        respawnDate.setDate(respawnDate.getDate() + treasure.cooldownDays);

        await prisma.hiddenTreasure.update({
            where: { id: treasureId },
            data: {
                lastDiscoveredAt: new Date(),
                lastDiscoveredBy: userId,
                respawnAt: respawnDate,
                isActive: false
            }
        });

        console.log(`[TREASURE] Treasure ${treasureId} will respawn on ${respawnDate.toISOString()}`);

        return {
            silver: loot.silver,
            items: awardedItems
        };
    }

    /**
     * Generate loot based on treasure type (placeholder).
     * TODO: Integrate dengan real loot table system.
     */
    generateLoot(treasureType) {
        const lootTables = {
            ARTIFACT: { silver: 500, items: ['Ancient Fragment', 'Old Scroll'] },
            HERB: { silver: 200, items: ['Rare Herb', 'Mystic Root'] },
            GOLD_CACHE: { silver: 1000, items: [] },
            CURSED_RELIC: { silver: 800, items: ['Cursed Amulet'], debuff: 'CURSED' }
        };

        return lootTables[treasureType] || { silver: 100, items: [] };
    }

    /**
     * Daily cron job: Reset respawned treasures.
     */
    async processRespawns() {
        const now = new Date();
        
        const respawned = await prisma.hiddenTreasure.updateMany({
            where: {
                isActive: false,
                respawnAt: { lte: now }
            },
            data: {
                isActive: true,
                lastDiscoveredAt: null,
                lastDiscoveredBy: null,
                respawnAt: null
            }
        });

        console.log(`[TREASURE] Respawned ${respawned.count} treasures.`);
        return respawned.count;
    }
}

module.exports = new TreasureDiscoveryService();
