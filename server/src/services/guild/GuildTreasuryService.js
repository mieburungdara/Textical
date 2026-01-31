const BaseService = require('../BaseService');
const transactionManager = require('../economy/TransactionManager');

/**
 * GuildTreasuryService
 * Orchestrates guild wealth and territorial upkeep.
 */
class GuildTreasuryService extends BaseService {
    constructor() {
        super();
        this.BASE_TERRITORY_UPKEEP = 1000; // Gold per region per day
    }

    async deposit(userId, guildId, amount) {
        return await this.runTransaction(async (tx) => {
            // Deduct from user
            await transactionManager.removeGold(tx, userId, amount, "GUILD_DEPOSIT", guildId, "GUILD");
            // Add to guild
            return await tx.guild.update({
                where: { id: guildId },
                data: { treasury: { increment: amount } }
            });
        });
    }

    async withdraw(userId, guildId, amount) {
        // AAA: Permission Check (Leader only)
        const guild = await this.db.guild.findUnique({
            where: { id: guildId },
            include: { members: { where: { id: userId } } }
        });
        if (!guild || guild.members.length === 0) throw new Error("Unauthorized.");
        if (guild.treasury < amount) throw new Error("Insufficient guild treasury.");

        return await this.runTransaction(async (tx) => {
            await tx.guild.update({
                where: { id: guildId },
                data: { treasury: { decrement: amount } }
            });
            await transactionManager.addGold(tx, userId, amount, "GUILD_WITHDRAW", guildId, "GUILD");
        });
    }

    /**
     * Processes daily upkeep for all territories.
     * Relinquishes control if a guild cannot pay.
     */
    async processDailyUpkeep() {
        const territories = await this.db.territory.findMany({
            include: { guild: true }
        });

        for (const t of territories) {
            const cost = this.BASE_TERRITORY_UPKEEP;
            
            if (t.guild.treasury < cost) {
                this.log(`Guild ${t.guild.name} failed upkeep for Region ${t.regionId}. Relinquishing.`, "Conquest");
                await this.db.territory.delete({ where: { id: t.id } });
            } else {
                await this.db.guild.update({
                    where: { id: t.guildId },
                    data: { treasury: { decrement: cost } }
                });
                await this.db.territory.update({
                    where: { id: t.id },
                    data: { lastUpkeepAt: new Date() }
                });
            }
        }
    }
}

module.exports = new GuildTreasuryService();
