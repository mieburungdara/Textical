const prisma = require('../../db');
const guildRepository = require('../../repositories/guildRepository');
const transactionManager = require('../economy/TransactionManager');
const resolver = require('../../logic/economy/CurrencyResolver');
const GuildUtils = require('./GuildUtils');

/**
 * Service for handling guild treasury deposits and withdrawals.
 */
class GuildTreasuryService {
    async depositTreasury(user, amount) {
        if (!user.guildId) throw new Error("You are not in a guild.");
        if (amount <= 0) throw new Error("Amount must be positive.");
        
        const amountSilver = BigInt(amount);
        const userTotalSilver = resolver.getTotalSilver(user);
        if (userTotalSilver < amountSilver) {
            throw new Error(`Insufficient funds. Need ${amountSilver} silver, have: ${userTotalSilver}`);
        }

        await transactionManager.removeCurrency(prisma, user.id, amountSilver, "GUILD_TREASURY_DEPOSIT", user.guildId, "GUILD");
        const guild = await guildRepository.update(user.guildId, {
            treasury: { increment: amount }
        });

        await GuildUtils.addHistory(user.guildId, "TREASURY_DEPOSIT", user.id, null, 
            `${user.username} deposited ${amount} silver to treasury`);

        return guild;
    }

    async withdrawTreasury(requester, amount) {
        if (!["MASTER", "OFFICER"].includes(requester.guildRole)) {
            throw new Error("Only officers can withdraw from treasury.");
        }
        if (amount <= 0) throw new Error("Amount must be positive.");

        const guild = await guildRepository.findById(requester.guildId);
        if (guild.treasury < amount) throw new Error("Insufficient funds in treasury.");

        await guildRepository.update(requester.guildId, {
            treasury: { decrement: amount }
        });
        await transactionManager.addCurrency(prisma, requester.id, BigInt(amount), "GUILD_TREASURY_WITHDRAW", requester.guildId, "GUILD");

        await GuildUtils.addHistory(requester.guildId, "TREASURY_WITHDRAW", requester.id, null, 
            `${requester.username} withdrew ${amount} silver from treasury`);

        return { success: true, remainingTreasury: guild.treasury - amount };
    }
}

module.exports = new GuildTreasuryService();
