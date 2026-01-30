/**
 * AAA InteractionHandler
 * Handles Buffs, Healing, and Gambling logic.
 */
class InteractionHandler {
    async handleGamble(prisma, userId, meta, bet) {
        if (!bet || bet < meta.minBet || bet > meta.maxBet) throw new Error("Invalid bet range.");

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < bet) throw new Error("Insufficient gold.");

            const won = Math.random() < meta.winChance;
            const delta = won ? Math.floor(bet * (meta.winMultiplier - 1)) : -bet;

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

    async handleBuff(prisma, heroId, userId, meta) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (user.gold < meta.costGold) throw new Error("Insufficient gold.");

            await tx.user.update({ where: { id: userId }, data: { gold: { decrement: meta.costGold } } });

            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + meta.durationSeconds);

            await tx.heroBuff.create({
                data: {
                    heroId, name: meta.buffName, statKey: meta.statKey,
                    statValue: meta.statValue, expiresAt
                }
            });

            return { success: true, message: `Received ${meta.buffName} buff.` };
        });
    }

    async handleHeal(prisma, heroId, userId, meta) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (meta.healCost > 0 && user.gold < meta.healCost) throw new Error("Insufficient gold.");

            if (meta.healCost > 0) {
                await tx.user.update({ where: { id: userId }, data: { gold: { decrement: meta.healCost } } });
            }

            await tx.hero.update({ where: { id: heroId }, data: { vitality: 100 } });
            return { success: true, message: "Healing complete." };
        });
    }
}

module.exports = new InteractionHandler();
