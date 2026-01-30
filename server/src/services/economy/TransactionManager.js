/**
 * AAA TransactionManager
 * Core component for handling gold movements and audit trail integrity.
 */
class TransactionManager {
    /**
     * Credits gold to a user and records it in the ledger.
     */
    async addGold(tx, userId, amount, type, sourceId = null, sourceType = null) {
        if (amount <= 0) return;

        const user = await tx.user.update({
            where: { id: userId },
            data: { gold: { increment: amount } }
        });

        await tx.transactionLedger.create({
            data: {
                userId,
                type,
                currencyTier: "GOLD",
                amountDelta: amount,
                newBalance: user.gold,
                sourceId,
                sourceType
            }
        });

        return user;
    }

    /**
     * Debits gold from a user and records it in the ledger.
     */
    async removeGold(tx, userId, amount, type, sourceId = null, sourceType = null) {
        if (amount <= 0) return;

        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user.gold < amount) throw new Error("Insufficient gold.");

        const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { gold: { decrement: amount } }
        });

        await tx.transactionLedger.create({
            data: {
                userId,
                type,
                currencyTier: "GOLD",
                amountDelta: -amount,
                newBalance: updatedUser.gold,
                sourceId,
                sourceType
            }
        });

        return updatedUser;
    }
}

module.exports = new TransactionManager();
