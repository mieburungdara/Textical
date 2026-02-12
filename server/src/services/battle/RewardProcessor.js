const BaseService = require('../BaseService');
const progressionService = require('../progressionService');
const inventoryService = require('../inventoryService');
const consumableService = require('../consumableService');
const koManager = require('../vitality/KOManager');
const lootService = require('../logistics/LootService');
const bountyService = require('../social/BountyService');
const siegeService = require('../guild/SiegeService');

class RewardProcessor extends BaseService {
    /**
     * AAA: Health Potion System - Calculate total potions used in battle
     * @param {Array} units - Battle units (player team)
     * @returns {number} Total potions used
     */
    _calculatePotionsUsed(units) {
        if (!units) return 0;
        return units.reduce((total, unit) => {
            return total + (unit.potionUsedInBattle || 0);
        }, 0);
    }

    /**
     * AAA: Deduct potions from inventory after battle
     * @param {number} userId 
     * @param {number} totalUsed 
     */
    async _deductPotions(userId, totalUsed) {
        if (totalUsed <= 0) return;
        
        try {
            await consumableService.consumeItem(userId, consumableService.ITEM_IDS.HEALTH_POTION, totalUsed);
            this.log(`Deducted ${totalUsed} Health Potion(s) from user ${userId}`, "POTION");
        } catch (error) {
            this.log(`Failed to deduct potions: ${error.message}`, "POTION_ERROR");
            // Could trigger compensation or notification here if needed
        }
    }

    async process(userId, battleResult, monsterTemplate, partyCount) {
        let lootEarned = [];
        let heroResults = [];
        let potionUsedTotal = 0;

        // AAA: Calculate potions used (from initial units tracking)
        if (battleResult.initialUnits) {
            potionUsedTotal = this._calculatePotionsUsed(battleResult.initialUnits.filter(u => u.teamId === 0));
        }

        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { region: { include: { territory: true } } }
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
            // VICTORY LOGIC
            const totalExp = battleResult.rewards.exp || 0;
            const heroShare = Math.floor(totalExp / partyCount);

            // AAA: Siege Integration
            if (battleResult.victimUserId && user.region.territory && user.region.territory.siegeStatus === "UNDER_SIEGE" && user.guildId) {
                await this.runTransaction(async (tx) => {
                    await siegeService.applyBattleResult(tx, user.guildId, user.region.territory.id);
                });
            }

            // Fetch survivors (those not deleted by permadeath)
            const heroes = await this.db.hero.findMany({
                where: { formationSlots: { some: { preset: { userId } } } }
            });

            for (const hero of heroes) {
                // If hero died in RED, they were either deleted or stripped. 
                // If they were stripped (isMain), they still get XP? 
                // Spec says: "Victory Irrelevance: Jika Unit Utama mati tapi timnya menang, Unit Utama tetap kehilangan equipment dan tetap terkena penalti XP."
                
                const simUnit = battleResult.initialUnits.find(u => u.data.db_id === hero.id);
                
                if (simUnit && simUnit.isDead && zoneType === "RED" && hero.isMain) {
                    // Penalty already applied in _executePermadeath
                    // Main unit does NOT get XP if dead, even if team wins.
                    continue; 
                }

                const progression = await progressionService.addHeroExperience(hero.id, heroShare);

                // Persist Durability Loss
                if (simUnit && simUnit.durabilityLoss) {
                    for (const [instanceId, loss] of Object.entries(simUnit.durabilityLoss)) {
                        if (loss > 0) {
                            await this.db.inventoryItem.update({
                                where: { id: parseInt(instanceId) },
                                data: { currentDurability: { decrement: loss } }
                            });
                        }
                    }
                }

                heroResults.push({
                    id: hero.id,
                    name: hero.name,
                    xpGained: heroShare,
                    totalXp: progression.hero.unitXp,
                    unitLevel: progression.hero.unitLevel,
                    classLevel: progression.hero.classLevel,
                    leveledUp: progression.unitLeveledUp || progression.classLeveledUp
                });
            }

            // Process Loot
            for (const entry of monsterTemplate.loot) {
                if (Math.random() < entry.chance) {
                    try {
                        await inventoryService.addItem(userId, entry.itemId, 1);
                        lootEarned.push({ templateId: entry.itemId, quantity: 1 });
                    } catch (e) { /* Inventory full */ }
                }
            }

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

        // AAA: Deduct potions AFTER reward processing
        if (potionUsedTotal > 0) {
            await this._deductPotions(userId, potionUsedTotal);
        }

        return { lootEarned, heroResults, potionsUsed: potionUsedTotal };
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