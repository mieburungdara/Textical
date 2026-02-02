const BaseService = require('../BaseService');

/**
 * LootService
 * Orchestrates looting windows and ensures cargo destruction upon interruption.
 */
class LootService extends BaseService {
    /**
     * Starts a 1-minute looting session for a winner.
     */
    async startLootSession(looterId, victimId, wagonId = null) {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + 60);

        return await this.db.lootSession.create({
            data: {
                looterId,
                victimId,
                wagonId,
                expiresAt
            }
        });
    }

    /**
     * Checks if a user has an active looting session.
     */
    async getActiveSession(userId) {
        const now = new Date();
        return await this.db.lootSession.findFirst({
            where: {
                looterId: userId,
                isActive: true,
                expiresAt: { gt: now }
            },
            include: { wagon: true }
        });
    }

    /**
     * Interrupts an active looting session and destroys associated cargo.
     */
    async interruptSession(userId) {
        const session = await this.getActiveSession(userId);
        if (!session) return;

        return await this.runTransaction(async (tx) => {
            // 1. Mark session as inactive
            await tx.lootSession.update({
                where: { id: session.id },
                data: { isActive: false }
            });

            // 2. Destroy Wagon/Cargo if linked
            if (session.wagonId) {
                await tx.wagonItem.deleteMany({ where: { wagonId: session.wagonId } });
                await tx.wagon.delete({ where: { id: session.wagonId } });
                this.log(`Loot Interruption: Wagon ${session.wagonId} destroyed due to attack on looter ${userId}.`, "Loot");
            }

            // Note: In Red Zone, we might also destroy the drop-pool items from the victim's corpse.
            // For now, focusing on the Wagon as per primary specification.
            
            return { interrupted: true };
        });
    }
}

module.exports = new LootService();
