const prisma = require('../db');

class LootService {
    /**
     * AAA High-Fidelity Loot Generation
     * @param {number} monsterId - The ID of the defeated monster
     * @param {number} heroId - The hero who dealt the killing blow (for tool checks)
     */
    async generateMonsterLoot(monsterId, heroId = null) {
        const monster = await prisma.monsterTemplate.findUnique({
            where: { id: monsterId },
            include: { loot: true }
        });

        if (!monster) return [];

        // 1. Get Hero Equipment for Tool Bonuses
        let skinnerKnife = null;
        let butcherCleaver = null;

        if (heroId) {
            const equipment = await prisma.heroEquipment.findMany({
                where: { heroId },
                include: { itemInstance: { include: { template: true } } }
            });

            skinnerKnife = equipment.find(e => e.itemInstance.template.category === "SKINNER_KNIFE");
            butcherCleaver = equipment.find(e => e.itemInstance.template.category === "BUTCHER_CLEAVER");
        }

        const lootResults = [];

        // 2. Process Standard Loot Entries
        for (const entry of monster.loot) {
            const item = await prisma.itemTemplate.findUnique({ where: { id: entry.itemId } });
            if (!item) continue;

            // --- AAA TOOL LOGIC ---
            let yieldMultiplier = 1.0;
            let chanceMultiplier = 1.0;

            // Skinner Knife Logic: Boosts Leather (Item ID 2600s)
            if (skinnerKnife && item.id >= 2600 && item.id < 2700) {
                const tier = skinnerKnife.itemInstance.template.toolTier || 0;
                const multipliers = [1.1, 1.25, 1.5, 2.0, 3.0];
                yieldMultiplier = multipliers[tier] || 1.0;
                chanceMultiplier = 1.2; // 20% higher drop chance
            }

            // Butcher Cleaver Logic: Boosts Meat (Item ID 3700s)
            if (butcherCleaver && item.id >= 3700 && item.id < 3800) {
                const tier = butcherCleaver.itemInstance.template.toolTier || 0;
                const multipliers = [1.1, 1.25, 1.5, 2.0, 3.0];
                yieldMultiplier = multipliers[tier] || 1.0;
                chanceMultiplier = 1.2;
            }

            // 3. Roll for drop
            const finalChance = entry.chance * chanceMultiplier;
            if (Math.random() < finalChance) {
                const isBandit = monster.race === 'HUMANOID' || monster.name.toLowerCase().includes('bandit');
                lootResults.push({
                    id: item.id, // Using 'id' to match RewardService expectation
                    itemId: item.id,
                    name: item.name,
                    quantity: Math.max(1, Math.floor(yieldMultiplier)),
                    isStolen: isBandit
                });
            }
        }

        // 4. AAA SPECIAL BUTCHERY: Manual Meat Harvest
        // If monster is MEATABLE and hero has Cleaver, roll for meat even if not in standard loot table?
        // Let's stick to the loot table for now, but ensure we add meat to the tables in the next step.

        return lootResults;
    }

    /**
     * Generate loot for multiple monsters, applying zone-specific rules
     * @param {Array<number>} monsterIds - List of monster IDs
     * @param {string} zoneType - Zone type (GREEN, BLUE, RED, BLACK)
     * @returns {Array} List of loot items with options
     */
    async generateLoot(monsterIds, zoneType = "GREEN") {
        const allLoot = [];
        for (const monsterId of monsterIds) {
            const drops = await this.generateMonsterLoot(monsterId);
            allLoot.push(...drops);
        }

        // Apply Zone Rules
        if (zoneType === 'BLACK') {
            return allLoot.map(item => ({ ...item, isSoulbound: true }));
        }

        return allLoot;
    }
}

module.exports = new LootService();
