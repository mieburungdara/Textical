/**
 * AAA InteractionHandler (Strict Relational)
 * Handles Buffs, Healing, and Gambling logic using TransactionManager.
 */
const transactionManager = require('../economy/TransactionManager');
const resolver = require('../../logic/economy/CurrencyResolver');

class InteractionHandler {
    async handleGamble(prisma, userId, npc, bet) {
        // Gambling properties are now explicit on npc object
        const minBet = 100; // Hardcoded fallback or could be another column
        if (!bet || bet < minBet) throw new Error(`Minimum bet is ${minBet}.`);

        const betSilver = BigInt(bet);

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            const userTotalSilver = resolver.getTotalSilver(user);
            if (userTotalSilver < betSilver) throw new Error(`Insufficient funds. Need ${betSilver} silver, have: ${userTotalSilver}`);

            const won = Math.random() < (npc.betWinChance || 0.4);
            const deltaSilver = won ? BigInt(Math.floor(bet * ((npc.betMultiplier || 2.0) - 1))) : -betSilver;

            if (won) {
                await transactionManager.addCurrency(tx, userId, deltaSilver, "GAMBLE_WIN", npc.id, "NPC");
            } else {
                await transactionManager.removeCurrency(tx, userId, deltaSilver, "GAMBLE_LOSS", npc.id, "NPC");
            }

            return {
                success: won,
                message: won ? `Fortune smiles! You won ${deltaSilver} silver!` : `Lost ${betSilver} silver.`,
                newBalance: userTotalSilver + deltaSilver
            };
        });
    }

    async handleBuff(prisma, heroId, userId, npc) {
        // Buff properties (now we'd ideally have a sub-model, but for now we use columns)
        const costSilver = BigInt(300); // Example fallback
        
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            const userTotalSilver = resolver.getTotalSilver(user);
            if (userTotalSilver < costSilver) throw new Error(`Insufficient funds. Need ${costSilver} silver, have: ${userTotalSilver}`);

            await transactionManager.removeCurrency(tx, userId, costSilver, "BUFF", heroId, "HERO_BUFF");

            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + 1800); // 30 mins

            await tx.heroBuff.create({
                data: {
                    heroId, name: `Blessing of ${npc.name}`, statKey: "vit",
                    statValue: 10, expiresAt
                }
            });

            return { success: true, message: `Received blessing from ${npc.name}.` };
        });
    }

    async handleHeal(prisma, heroId, userId, npc) {
        const costSilver = BigInt(npc.healCost || 0);

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            const userTotalSilver = resolver.getTotalSilver(user);
            
            if (costSilver > 0 && userTotalSilver < costSilver) {
                throw new Error(`Insufficient funds. Need ${costSilver} silver, have: ${userTotalSilver}`);
            }

            if (costSilver > 0) {
                await transactionManager.removeCurrency(tx, userId, costSilver, "HEAL", heroId, "HERO");
            }

            await tx.hero.update({ where: { id: heroId }, data: { vitality: 100 } });
            return { success: true, message: "Your strength is restored." };
        });
    }
}

module.exports = new InteractionHandler();
