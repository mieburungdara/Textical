const prisma = require('../../db');

/**
 * PvpService
 * Handles PvP permission logic, flagging, and territory-based overrides.
 */
class PvpService {
    /**
     * Checks if an attacker can initiate PvP against a target in a specific region.
     * @param {number} attackerId 
     * @param {number} targetId 
     * @param {number} regionId 
     * @returns {Promise<{allowed: boolean, reason?: string}>}
     */
    async canInitiatePvp(attackerId, targetId, regionId) {
        if (attackerId === targetId) {
            return { allowed: false, reason: "You cannot attack yourself." };
        }

        const region = await prisma.regionTemplate.findUnique({
            where: { id: regionId },
            include: { territory: true }
        });

        if (!region) {
            return { allowed: false, reason: "Invalid region." };
        }

        // 1. Territory Struggle Override (Crucial for Faction/Guild War)
        // If the region is currently under siege, PvP is allowed regardless of base mode.
        if (region.territory && region.territory.siegeStatus === 'UNDER_SIEGE') {
            return { allowed: true, reason: "Region is currently under siege. PvP enabled." };
        }

        // 2. Base PvP Mode Logic
        switch (region.pvpMode) {
            case 'SAFE':
                return { allowed: false, reason: "This is a safe zone. PvP is not allowed." };

            case 'CONSENT':
                const attacker = await prisma.user.findUnique({ where: { id: attackerId } });
                const target = await prisma.user.findUnique({ where: { id: targetId } });
                
                if (!attacker.isPvpFlagged) {
                    return { allowed: false, reason: "You must enable PvP Flag to attack others here." };
                }
                if (!target.isPvpFlagged) {
                    return { allowed: false, reason: "Target is not flagged for PvP." };
                }
                return { allowed: true };

            case 'RESTRICTED':
                // Allowed, but might incur reputation penalties (handled in RewardProcessor/ReputationService)
                return { allowed: true, note: "Criminal penalties may apply." };

            case 'OPEN':
                return { allowed: true };

            default:
                return { allowed: false, reason: "Unknown PvP policy." };
        }
    }

    /**
     * Toggles PvP flag for a user.
     * @param {number} userId 
     * @param {boolean} status 
     */
    async setPvpFlag(userId, status) {
        return await prisma.user.update({
            where: { id: userId },
            data: { isPvpFlagged: status }
        });
    }
}

module.exports = new PvpService();
