const BaseService = require('../BaseService');
const fortificationResolver = require('../../logic/guild/SiegeFortificationResolver');

/**
 * SiegeService
 * Orchestrates territorial warfare lifecycle.
 */
class SiegeService extends BaseService {
    constructor() {
        super();
        this.SIEGE_DECLARATION_COST = 500000; // 500k Silver
        this.SIEGE_DURATION_HOURS = 24;
    }

    /**
     * Declares a siege on a territory.
     */
    async declareSiege(attackerGuildId, regionId) {
        const territory = await this.db.territory.findUnique({
            where: { regionId },
            include: { guild: true }
        });

        if (!territory) throw new Error("This region is not a claimable territory.");
        if (territory.guildId === attackerGuildId) throw new Error("You cannot siege your own territory.");
        if (territory.siegeStatus === "UNDER_SIEGE") throw new Error("This territory is already under siege.");

        const attackerGuild = await this.db.guild.findUnique({ where: { id: attackerGuildId } });
        if (attackerGuild.treasury < this.SIEGE_DECLARATION_COST) throw new Error("Insufficient guild treasury.");

        return await this.runTransaction(async (tx) => {
            // 1. Deduct Treasury
            await tx.guild.update({
                where: { id: attackerGuildId },
                data: { treasury: { decrement: this.SIEGE_DECLARATION_COST } }
            });

            // 2. Mark Territory
            await tx.territory.update({
                where: { id: territory.id },
                data: { siegeStatus: "UNDER_SIEGE" }
            });

            // 3. Create Siege Record
            const endsAt = new Date();
            endsAt.setHours(endsAt.getHours() + this.SIEGE_DURATION_HOURS);

            const siege = await tx.siege.create({
                data: {
                    territoryId: territory.id,
                    attackerGuildId,
                    status: "ACTIVE",
                    endsAt
                }
            });

            // 4. Log Event
            await tx.siegeLog.create({
                data: {
                    siegeId: siege.id,
                    event: `Guild ${attackerGuild.name} has declared a siege on Region ${regionId}!`
                }
            });

            this.log(`Siege declared by Guild ${attackerGuildId} on Region ${regionId}`, "Siege");
            return siege;
        });
    }

    /**
     * Processes a battle result within a sieged territory.
     */
    async applyBattleResult(tx, winnerGuildId, territoryId) {
        const siege = await tx.siege.findFirst({
            where: { territoryId, status: "ACTIVE" }
        });

        if (!siege) return;

        // If attacker won, damage fortification
        if (winnerGuildId === siege.attackerGuildId) {
            await this._damageFortification(tx, siege);
        }
    }

    async _damageFortification(tx, siege) {
        const territory = await tx.territory.findUnique({ where: { id: siege.territoryId } });
        const damage = fortificationResolver.resolveDamage(territory.maxFortification);
        
        const newFort = Math.max(0, territory.fortification - damage);

        await tx.territory.update({
            where: { id: territory.id },
            data: { fortification: newFort }
        });

        await tx.siegeLog.create({
            data: {
                siegeId: siege.id,
                event: `Attacker victory! Fortification reduced to ${newFort}.`
            }
        });

        if (newFort === 0) {
            await this._finalizeConquest(tx, siege);
        }
    }

    async _finalizeConquest(tx, siege) {
        // Mark Siege as WON
        await tx.siege.update({
            where: { id: siege.id },
            data: { status: "WON" }
        });

        // Update Territory Ownership
        await tx.territory.update({
            where: { id: siege.territoryId },
            data: {
                guildId: siege.attackerGuildId,
                siegeStatus: "PEACE",
                fortification: 100, // Starts fragile
                capturedAt: new Date()
            }
        });

        this.log(`Territory ${siege.territoryId} CONQUERED by Guild ${siege.attackerGuildId}`, "Conquest");
    }

    /**
     * Retrieves active siege for a territory.
     */
    async getActiveSiege(territoryId) {
        return await this.db.siege.findFirst({
            where: { territoryId, status: "ACTIVE" },
            include: { attackerGuild: true }
        });
    }
}

module.exports = new SiegeService();
