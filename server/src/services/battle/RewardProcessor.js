const BaseService = require('../BaseService');
const progressionService = require('../progressionService');
const inventoryService = require('../inventoryService');
const koManager = require('../vitality/KOManager');

class RewardProcessor extends BaseService {
    async process(userId, battleResult, monsterTemplate, partyCount) {
        let lootEarned = [];
        let heroResults = [];

        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { region: true }
        });
        const zoneType = user.region.zoneType;

        // --- 1. PROCESS INDIVIDUAL UNIT DEATHS (AAA: UNIVERSAL PERMADEATH) ---
        if (zoneType === "RED") {
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
                await this.db.user.update({
                    where: { id: userId },
                    data: { gold: { increment: battleResult.rewards.gold } }
                });
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