const BaseService = require('../BaseService');
const koManager = require('../vitality/KOManager');
const lootService = require('../logistics/LootService');
const bountyService = require('../social/BountyService');
const siegeService = require('../guild/SiegeService');
const ecosystemService = require('../EcosystemService');
const infamyService = require('../InfamyService');
const dailyTaskService = require('../DailyTaskService');

// SRP Managers
const expManager = require('./ExpManager');
const lootDistributor = require('./LootDistributor');
const permadeathManager = require('./PermadeathManager');
const battleConsumables = require('./BattleConsumableService');

class RewardProcessor extends BaseService {
    async process(userId, battleResult, monsterTemplate, partyCount, hour = 12) {
        let lootEarned = [];
        let heroResults = [];
        let potionUsedTotal = 0;

        const isNight = hour < 6 || hour >= 20;

        // 1. Calculate Potion Consumption
        if (battleResult.initialUnits) {
            potionUsedTotal = battleConsumables.calculatePotionsUsed(
                battleResult.initialUnits.filter(u => u.teamId === 0)
            );
        }

        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { region: { include: { territory: true } } }
        });
        const zoneType = user.region.zoneType;
        const baseDangerLevel = user.region.dangerLevel || 1;

        // Danger Level Scaling
        let dangerLevel = baseDangerLevel;
        if (user.region.territory && user.region.territory.siegeStatus === "UNDER_SIEGE") {
            dangerLevel = Math.min(6, baseDangerLevel + 1);
        }

        const xpMultiplier = 1 + (dangerLevel - 1) * 0.15;
        const goldMultiplier = 1 + (dangerLevel - 1) * 0.10;
        
        const ecoMods = ecosystemService.getModifiers(user.region.ecologicalStress || 0);
        const lootChanceModifier = (1 + (dangerLevel - 1) * 0.05) * ecoMods.dropRateMult; 

        // 2. Bounty & Pvp Coordination
        let isBountyKill = false;
        if (battleResult.victimUserId && battleResult.winner === 0) {
            const bounty = await this.db.bounty.findFirst({
                where: { targetId: battleResult.victimUserId, status: "OPEN" }
            });
            if (bounty) {
                isBountyKill = true;
                await this.runTransaction(async (tx) => {
                    await bountyService.claimBounty(tx, battleResult.victimUserId, userId);
                });
            }
        }

        // 3. Permadeath Processing
        if (zoneType === "RED" || zoneType === "BLACK" || isBountyKill) {
            for (const unit of battleResult.initialUnits.filter(u => u.teamId === 0)) {
                if (unit.isDead) {
                    await permadeathManager.executePermadeath(unit.data.db_id, zoneType);
                }
            }
        }

        // 4. Outcome Processing
        if (battleResult.winner === 0) { 
            // VICTORY
            if (battleResult.victimUserId && user.region.territory && user.region.territory.siegeStatus === "UNDER_SIEGE" && user.guildId) {
                await this.runTransaction(async (tx) => {
                    await siegeService.applyBattleResult(tx, user.guildId, user.region.territory.id);
                });
            }

            // Experience and Durability
            heroResults = await expManager.distributeExp(
                userId, 
                battleResult.rewards.exp || 0, 
                xpMultiplier, 
                partyCount, 
                battleResult.initialUnits.filter(u => u.teamId === 0).map(u => ({ ...u, zoneType }))
            );

            // Loot and Gold
            lootEarned = await lootDistributor.distributeLoot(
                userId, 
                monsterTemplate, 
                lootChanceModifier, 
                isNight, 
                zoneType
            );

            await lootDistributor.distributeGold(
                userId, 
                battleResult.rewards.gold || 0, 
                goldMultiplier
            );

            // Side Effects (Ecosystem, Daily Tasks, World Bosses)
            if (monsterTemplate && !battleResult.victimUserId) {
                await ecosystemService.reportActivity(user.regionId);
                await dailyTaskService.reportProgress(userId, "KILL", monsterTemplate.id, 1);
            }

            if (battleResult.killed_monsters && battleResult.killed_monsters.length > 0) {
                const bossManager = require('../BossManager');
                const killRegionId = user.region ? user.region.id : 0;
                for (const mobId of battleResult.killed_monsters) {
                    await bossManager.handleBossDeath(mobId, killRegionId, userId);
                }
            }

            // PvP Victory Effects (Loot Sessions & Infamy)
            if (battleResult.victimUserId) {
                const victimWagon = await this.db.wagon.findUnique({ where: { userId: battleResult.victimUserId } });
                if (isBountyKill) {
                    await lootService.startLootSession(userId, battleResult.victimUserId, victimWagon ? victimWagon.id : null);
                } else if (victimWagon) {
                    await lootService.startLootSession(userId, battleResult.victimUserId, victimWagon.id);
                }

                if (!isBountyKill) {
                    await infamyService.addInfamy(userId, 10);
                }
            }
        } else {
            // DEFEAT
            if (zoneType === "BLUE") {
                await this._handleBlueZoneDefeat(userId);
            } else if (zoneType === "RED") {
                await this.db.wagonItem.deleteMany({ where: { wagon: { userId } } });
                await this.db.wagon.deleteMany({ where: { userId } });
            }
        }

        // 5. Finalize Consumables
        if (potionUsedTotal > 0) {
            await battleConsumables.deductPotions(userId, potionUsedTotal);
        }

        return { lootEarned, heroResults, potionsUsed: potionUsedTotal };
    }

    async _handleBlueZoneDefeat(userId) {
        await koManager.setKnockedOut(userId, 3);
        const items = await this.db.inventoryItem.findMany({
            where: { userId, equippedIn: { isNot: null } }
        });

        for (const item of items) {
            const penalty = Math.ceil(item.maxDurability * 0.10);
            await this.db.inventoryItem.update({
                where: { id: item.id },
                data: { currentDurability: { decrement: penalty } }
            });
        }
    }
}

module.exports = new RewardProcessor();

module.exports = new RewardProcessor();