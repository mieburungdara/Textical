const BaseService = require('../BaseService');
const progressionService = require('../progressionService');
const inventoryService = require('../inventoryService');
const koManager = require('../vitality/KOManager');
const lootService = require('../logistics/LootService');
const bountyService = require('../social/BountyService');

class RewardProcessor extends BaseService {
    async process(userId, battleResult, monsterTemplate, partyCount) {
        let lootEarned = [];
        let heroResults = [];

        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { region: true }
        });
        const zoneType = user.region.zoneType;

        // --- 0. AAA BOUNTY CHECK (Override Logic) ---
        let isBountyKill = false;
        if (battleResult.victimUserId && battleResult.winner === 0) {
            const bounty = await this.db.bounty.findFirst({
                where: { targetId: battleResult.victimUserId, status: "OPEN" }
            });
            if (bounty) {
                isBountyKill = true;
                // Confirm Claim via transaction
                await this.runTransaction(async (tx) => {
                    await bountyService.claimBounty(tx, battleResult.victimUserId, userId);
                });
            }
        }

        // --- 1. PROCESS INDIVIDUAL UNIT DEATHS (AAA: UNIVERSAL PERMADEATH) ---
        if (zoneType === "RED" || isBountyKill) {
            for (const unit of battleResult.initialUnits.filter(u => u.teamId === 0)) {
                if (unit.isDead) {
                    await this._executePermadeath(unit.data.db_id);
                }
            }
        }

        // --- 2. PROCESS BATTLE OUTCOME ---
        if (battleResult.winner === 0) { 
            // ... (rest of victory logic)
            // Process Gold
            if (battleResult.rewards.gold > 0) {
                const transactionManager = require('../economy/TransactionManager');
                await this.runTransaction(async (tx) => {
                    await transactionManager.addCurrency(tx, userId, battleResult.rewards.gold, "BATTLE_REWARD");
                });
            }

            // AAA: Loot Session Creation (PvP Victory or Bounty)
            if (battleResult.victimUserId) {
                const victimWagon = await this.db.wagon.findUnique({ where: { userId: battleResult.victimUserId } });
                
                // If it's a Bounty Kill, hunters can loot BOTH Wagon and Inventory
                // For now, let's trigger a specialized Loot Session if it's a bounty
                if (isBountyKill) {
                    await lootService.startLootSession(userId, battleResult.victimUserId, victimWagon ? victimWagon.id : null);
                    this.log(`Bounty Loot Session Created: User ${userId} is looting criminal User ${battleResult.victimUserId}.`, "Loot");
                } else if (victimWagon) {
                    await lootService.startLootSession(userId, battleResult.victimUserId, victimWagon.id);
                    this.log(`Loot Session Created: User ${userId} is now looting User ${battleResult.victimUserId}.`, "Loot");
                }
            }
        } else {
            // DEFEAT LOGIC (Entire Team Wiped or Fled)
            if (zoneType === "BLUE") {
                await this._handleBlueZoneDefeat(userId);
            } else if (zoneType === "RED") {
                // If entire team defeated in RED, and wagon exists, destroy it.
                await this.db.wagonItem.deleteMany({ where: { wagon: { userId } } });
                await this.db.wagon.deleteMany({ where: { userId } });
            }
        }

        return { lootEarned, heroResults };
    }

    async _executePermadeath(heroId) {
        const hero = await this.db.hero.findUnique({ where: { id: heroId } });
        if (!hero) return;

        if (hero.isMain) {
            // Naked Immortality: Strip and Penalty
            await this.db.heroEquipment.deleteMany({ where: { heroId: hero.id } });
            const penalty = Math.floor(hero.unitXp * 0.10);
            await this.db.hero.update({
                where: { id: hero.id },
                data: { unitXp: { decrement: penalty } }
            });
            this.log(`Naked Immortality Triggered: Hero ${hero.name} stripped and penalized.`, "Death");
        } else {
            // Permanent Deletion (Cleanup relations)
            await this.db.heroEquipment.deleteMany({ where: { heroId } });
            await this.db.formationSlot.deleteMany({ where: { heroId } });
            await this.db.heroSkill.deleteMany({ where: { heroId } });
            await this.db.heroBuff.deleteMany({ where: { heroId } });
            await this.db.heroTrait.deleteMany({ where: { heroId } });
            await this.db.heroClassMastery.deleteMany({ where: { heroId } });
            await this.db.heroOrder.deleteMany({ where: { heroId } });
            await this.db.taskQueue.deleteMany({ where: { heroId } });
            await this.db.tavernMercenary.deleteMany({ where: { heroId } });
            
            // Handle children relations if any (set to null)
            await this.db.hero.updateMany({ where: { fatherId: heroId }, data: { fatherId: null } });
            await this.db.hero.updateMany({ where: { motherId: heroId }, data: { motherId: null } });

            await this.db.hero.delete({ where: { id: heroId } });
            this.log(`Universal Permadeath Triggered: Hero ${hero.name} deleted forever.`, "Death");
        }
    }

    async _handleBlueZoneDefeat(userId) {
        // 1. Trigger Knockout
        await koManager.setKnockedOut(userId, 3); // 3 mins default

        // 2. Durability Penalty (10% of Max)
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