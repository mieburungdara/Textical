const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const formationService = require('./formationService');
const vitalityService = require('./vitalityService');
const inventoryService = require('./inventoryService');

class BattleService {
    constructor() {
        this.BATTLE_VITALITY_COST = 5;
    }

    async startBattle(userId, monsterTemplateId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { formationPresets: { include: { slots: true } } }
        });

        const monster = await prisma.monsterTemplate.findUnique({
            where: { id: monsterTemplateId },
            include: { loot: true }
        });

        const party = await formationService.getPartyProfile(user.formationPresets[0].id);
        await vitalityService.syncUserVitality(userId);
        await vitalityService.consumeVitality(userId, this.BATTLE_VITALITY_COST);

        let battleLog = [];
        let monsterHp = monster.hp_base;
        let heroes = party.map(p => ({
            id: p.profile.name,
            hp: 100,
            stats: p.profile.totalStats,
            isDead: false,
            grid: p.grid
        }));

        while (monsterHp > 0 && heroes.some(h => !h.isDead)) {
            for (const hero of heroes.filter(h => !h.isDead)) {
                monsterHp -= (hero.stats.ATK || 5);
                if (monsterHp <= 0) break;
            }
            if (monsterHp <= 0) break;
            
            const target = heroes.filter(h => !h.isDead).sort((a, b) => a.grid.y - b.grid.y)[0];
            if (target) {
                target.hp -= monster.damage_base;
                if (target.hp <= 0) target.isDead = true;
            }
        }

        const result = monsterHp <= 0 ? "VICTORY" : "DEFEAT";
        let lootEarned = [];

        if (result === "VICTORY") {
            for (const entry of monster.loot) {
                if (Math.random() < entry.chance) {
                    // Try to add loot, but if inventory is full, it's lost! (Realistic)
                    try {
                        await inventoryService.addItem(userId, entry.itemId, 1);
                        lootEarned.push({ templateId: entry.itemId, quantity: 1 });
                    } catch (e) {
                        battleLog.push("[INVENTORY] Inventory full! Loot lost.");
                    }
                }
            }
        }

        return { result, battleLog, loot: lootEarned };
    }
}

module.exports = new BattleService();