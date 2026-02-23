const BaseService = require('./BaseService');

/**
 * GamblingService
 * Handles Inn-based dice gambling (guess 1-6).
 */
class GamblingService extends BaseService {
    constructor() {
        super();
        this.WIN_MULTIPLIER = 5; // Payout: 5x the bet
    }

    /**
     * Play a round of dice gambling
     * @param {number} userId - The player's ID
     * @param {number} betAmount - Amount of Silver to bet
     * @param {number} guess - The guessed number (1-6)
     */
    async playDice(userId, betAmount, guess) {
        if (guess < 1 || guess > 6) {
            throw new Error("Guess must be between 1 and 6.");
        }

        if (betAmount <= 0) {
            throw new Error("Bet amount must be greater than 0.");
        }

        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { currentRegion: true }
            });

            if (!user) throw new Error("User not found.");
            if (!user.currentRegion?.hasInn) {
                throw new Error("You can only gamble inside an Inn.");
            }

            if (user.currency < betAmount) {
                throw new Error("Insufficient Silver.");
            }

            // Deduct bet
            await tx.user.update({
                where: { id: userId },
                data: { currency: { decrement: betAmount } }
            });

            // Role the dice
            const result = Math.floor(Math.random() * 6) + 1;
            const isWin = (result === guess);
            const payout = isWin ? betAmount * this.WIN_MULTIPLIER : 0;

            if (isWin) {
                await tx.user.update({
                    where: { id: userId },
                    data: { currency: { increment: payout } }
                });
            }

            // Log the result
            const log = await tx.gamblingLog.create({
                data: {
                    userId,
                    betAmount,
                    guess,
                    result,
                    isWin,
                    payout
                }
            });

            // Create transaction ledger record
            await tx.transactionLedger.create({
                data: {
                    userId,
                    amount: isWin ? payout - betAmount : -betAmount,
                    type: "GAMBLING",
                    description: `Diced (Guess: ${guess}, Result: ${result})`,
                    balanceAfter: user.currency - betAmount + payout
                }
            });

            return {
                result,
                isWin,
                payout,
                newBalance: user.currency - betAmount + payout,
                logId: log.id
            };
        });
    }

    async getRecentLogs(userId, limit = 10) {
        return await this.db.gamblingLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}

module.exports = new GamblingService();
