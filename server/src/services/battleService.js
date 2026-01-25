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

        let turn = 1;
        while (monsterHp > 0 && heroes.some(h => !h.isDead)) {
            battleLog.push(`--- Turn ${turn} ---`);
            
            // HEROES ATTACK
            for (const hero of heroes.filter(h => !h.isDead)) {
                const damage = hero.stats.ATK || 5;
                monsterHp -= damage;
                battleLog.push(`[HERO] ${hero.id} attacks Monster for ${damage} damage. (Monster HP: ${Math.max(0, monsterHp)})`);
                if (monsterHp <= 0) break;
            }

            if (monsterHp <= 0) break;

            // MONSTER ATTACKS
            const target = heroes.filter(h => !h.isDead).sort((a, b) => a.grid.y - b.grid.y)[0];
            if (target) {
                const mDamage = monster.damage_base;
                target.hp -= mDamage;
                battleLog.push(`[MONSTER] Monster attacks ${target.id} for ${mDamage} damage! (HERO HP: ${Math.max(0, target.hp)})`);
                if (target.hp <= 0) {
                    target.isDead = true;
                    battleLog.push(`[SYSTEM] ${target.id} has fallen!`);
                }
            }
            turn++;
        }

        const result = monsterHp <= 0 ? "VICTORY" : "DEFEAT";
        let lootEarned = [];

        if (result === "VICTORY") {
            for (const entry of monster.loot) {
                if (Math.random() < entry.chance) {
                    try {
                        await inventoryService.addItem(userId, entry.itemId, 1);
                        lootEarned.push({ templateId: entry.itemId, quantity: 1 });
                    } catch (e) {
                        battleLog.push("[SYSTEM] Inventory full! Loot lost.");
                    }
                }
            }
        }

        return { result, battleLog, loot: lootEarned };
    }
}

module.exports = new BattleService();
