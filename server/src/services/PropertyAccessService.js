const BaseService = require('./BaseService');

/**
 * PropertyAccessService (v11.0)
 * Manages guest permissions and access control for regional properties.
 * 
 * @extends BaseService
 */
class PropertyAccessService extends BaseService {
    /**
     * Add a guest to a property with specific permissions.
     * 
     * @param {number} ownerId - ID of the property owner.
     * @param {number} propertyId - ID of the property.
     * @param {number} guestUserId - ID of the user to be added as guest.
     * @param {string} permissions - Access level (REST_ONLY, WORKBENCH, FULL_ACCESS).
     */
    async addGuest(ownerId, propertyId, guestUserId, permissions = "REST_ONLY") {
        const property = await this.db.propertyInstance.findUnique({
            where: { id: propertyId }
        });

        if (!property || property.userId !== ownerId) {
            throw new Error("Access denied or property not found.");
        }

        return await this.db.propertyGuest.upsert({
            where: {
                propertyId_guestUserId: {
                    propertyId,
                    guestUserId
                }
            },
            update: { permissions },
            create: {
                propertyId,
                guestUserId,
                permissions
            }
        });
    }

    /**
     * Remove a guest's access from a property.
     * 
     * @param {number} ownerId - ID of the property owner.
     * @param {number} propertyId - ID of the property.
     * @param {number} guestUserId - ID of the guest to remove.
     */
    async removeGuest(ownerId, propertyId, guestUserId) {
        const property = await this.db.propertyInstance.findUnique({
            where: { id: propertyId }
        });

        if (!property || property.userId !== ownerId) {
            throw new Error("Access denied.");
        }

        return await this.db.propertyGuest.delete({
            where: {
                propertyId_guestUserId: {
                    propertyId,
                    guestUserId
                }
            }
        });
    }

    /**
     * Check if a user has sufficient access level for a property.
     * 
     * @param {number} userId - ID of the user trying to access.
     * @param {number} propertyId - ID of the property.
     * @param {string} requiredPermission - Required access level.
     * @returns {Promise<boolean>} True if access is granted.
     */
    async hasAccess(userId, propertyId, requiredPermission = "REST_ONLY") {
        const property = await this.db.propertyInstance.findUnique({
            where: { id: propertyId },
            include: { guests: { where: { guestUserId: userId } } }
        });

        if (!property) return false;
        if (property.userId === userId) return true; // Owner always has access

        const guestRecord = property.guests[0];
        if (!guestRecord) return false;

        const perms = ["REST_ONLY", "WORKBENCH", "FULL_ACCESS"];
        const userLevel = perms.indexOf(guestRecord.permissions);
        const requiredLevel = perms.indexOf(requiredPermission);

        return userLevel >= requiredLevel;
    }
}

module.exports = new PropertyAccessService();
