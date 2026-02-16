const prisma = require('../../db');

/**
 * KOManager
 * Logic for managing user knockout status and recovery windows.
 */
class KOManager {
    /**
     * Puts a user into a knockout state.
     */
    async setKnockedOut(userId, durationMins = 3) {
        const until = new Date();
        until.setMinutes(until.getMinutes() + durationMins);

        return await prisma.user.update({
            where: { id: userId },
            data: {
                isKnockedOut: true,
                knockedOutUntil: until
            }
        });
    }

    /**
     * Checks if a user is currently knocked out.
     */
    async isKnockedOut(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isKnockedOut: true, knockedOutUntil: true }
        });

        if (!user || !user.isKnockedOut) return false;

        const now = new Date();
        if (now >= user.knockedOutUntil) {
            // Auto-recovery starts
            await this.startRecovery(userId);
            return false;
        }

        return true;
    }

    /**
     * Transitions user from KO to Recovery window (1 minute).
     */
    async startRecovery(userId) {
        const recoveryUntil = new Date();
        recoveryUntil.setSeconds(recoveryUntil.getSeconds() + 60);

        return await prisma.user.update({
            where: { id: userId },
            data: {
                isKnockedOut: false,
                recoveryUntil: recoveryUntil
            }
        });
    }

    /**
     * Checks if user is in the 1-minute peace recovery window.
     */
    async isInRecovery(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { recoveryUntil: true }
        });

        if (!user || !user.recoveryUntil) return false;

        const now = new Date();
        return now < user.recoveryUntil;
    }
}

module.exports = new KOManager();
