/**
 * AAA InteractionHandler (Strict Relational)
 * Handles Buffs, Healing, and Gambling logic using explicit columns.
 */
class InteractionHandler {
    async handleGamble(prisma, userId, npc, bet) {
        // Gambling properties are now explicit on npc object
        const minBet = 100; // Hardcoded fallback or could be another column
        if (!bet || bet < minBet) throw new Error(`Minimum bet is ${minBet}.`);

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < bet) throw new Error("Insufficient gold.");

            const won = Math.random() < (npc.betWinChance || 0.4);
            const delta = won ? Math.floor(bet * ((npc.betMultiplier || 2.0) - 1)) : -bet;

            await tx.user.update({
                where: { id: userId },
                data: { gold: { increment: delta } }
            });

            return {
                success: won,
                message: won ? `Fortune smiles! You won ${delta} gold!` : `Lost ${bet} gold.`,
                newBalance: user.gold + delta
            };
        });
    }

    async handleBuff(prisma, heroId, userId, npc) {
        // Buff properties (now we'd ideally have a sub-model, but for now we use columns)
        const cost = 300; // Example fallback
        
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < cost) throw new Error("Insufficient gold.");

            await tx.user.update({ where: { id: userId }, data: { gold: { decrement: cost } } });

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
        const cost = npc.healCost || 0;

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (cost > 0 && user.gold < cost) throw new Error("Insufficient gold.");

            if (cost > 0) {
                await tx.user.update({ where: { id: userId }, data: { gold: { decrement: cost } } });
            }

            await tx.hero.update({ where: { id: heroId }, data: { vitality: 100 } });
            return { success: true, message: "Your strength is restored." };
        });
    }
}

module.exports = new InteractionHandler();