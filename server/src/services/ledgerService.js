const prisma = new (require('@prisma/client').PrismaClient)();

class LedgerService {
    /**
     * Records a financial transaction in the audit ledger.
     * @param {number} userId - The user performing the transaction.
     * @param {string} type - Action type (e.g., "MARKET_BUY", "QUEST_REWARD").
     * @param {string} tier - Currency tier ("COPPER", "SILVER", "GOLD", "PLATINUM", "MITHRIL").
     * @param {number} delta - Amount gained (positive) or spent (negative).
     * @param {object} metadata - Optional extra context for auditing.
     */
    async log(userId, type, tier, delta, metadata = {}) {
        // 1. Get current balance for the tier
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                copper: true,
                silver: true,
                gold: true,
                platinum: true,
                mithril: true
            }
        });

        if (!user) return;

        const balanceKey = tier.toLowerCase();
        const currentBalance = user[balanceKey] || 0;

        // 2. Record the ledger entry
        return await prisma.transactionLedger.create({
            data: {
                userId,
                type,
                currencyTier: tier,
                amountDelta: delta,
                newBalance: currentBalance, // The balance AFTER the action (assumes log is called after update)
                metadata: JSON.stringify(metadata)
            }
        });
    }
}

module.exports = new LedgerService();
