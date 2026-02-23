const BaseService = require('../BaseService');

class PermadeathManager extends BaseService {
    /**
     * Execute permadeath logic for a hero based on zone rules.
     * @param {number} heroId - Hero ID.
     * @param {string} zoneType - Zone type (RED, BLACK, etc.)
     */
    async executePermadeath(heroId, zoneType = "GREEN") {
        const hero = await this.db.hero.findUnique({ where: { id: heroId } });
        if (!hero) return;

        // BLACK ZONE: Everybody dies (including Main)
        if (zoneType === 'BLACK') {
             // Handle Main Hero in Black Zone: Respawn Naked in Royal City
             if (hero.isMain) {
                await this.db.heroEquipment.deleteMany({ where: { heroId: hero.id } });
                await this.db.inventoryItem.deleteMany({ 
                    where: { 
                        userId: hero.userId,
                        isSoulbound: false 
                    } 
                });
                
                this.log(`BLACK ZONE DEATH: Main Hero ${hero.name} stripped and respawning.`, "Death");
                return;
             }
        }

        // RED ZONE: Main Hero Survives with Inventory Loss
        if (zoneType === 'RED' && hero.isMain) {
            // Naked Immortality: Strip and Penalty
            await this.db.heroEquipment.deleteMany({ where: { heroId: hero.id } });
            
            // Wipe Inventory as per Red Zone rules
            await this.db.inventoryItem.deleteMany({ 
                where: { 
                    userId: hero.userId,
                    isSoulbound: false
                } 
            });

            const penalty = Math.floor(hero.unitXp * 0.10);
            await this.db.hero.update({
                where: { id: hero.id },
                data: { unitXp: { decrement: penalty } }
            });
            this.log(`RED ZONE SURVIVAL: Main Hero ${hero.name} stripped and penalized.`, "Death");
            return;
        }

        // Standard Permadeath for non-main units or if not in special survival mode
        if (hero.isMain) {
            // Fallback for Green/Blue/Yellow
             const penalty = Math.floor(hero.unitXp * 0.05);
             await this.db.hero.update({
                where: { id: hero.id },
                data: { unitXp: { decrement: penalty } }
            });
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
            
            // Handle children relations if any
            await this.db.hero.updateMany({ where: { fatherId: heroId }, data: { fatherId: null } });
            await this.db.hero.updateMany({ where: { motherId: heroId }, data: { motherId: null } });

            await this.db.hero.delete({ where: { id: heroId } });
            this.log(`Universal Permadeath Triggered: Hero ${hero.name} deleted forever.`, "Death");
        }
    }
}

module.exports = new PermadeathManager();
