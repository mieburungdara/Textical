const BaseService = require('./BaseService');

/**
 * InnStorageService
 * Handles regional stash/vault mechanics.
 */
class InnStorageService extends BaseService {
    constructor() {
        super();
    }

    /**
     * Store an item in a regional vault
     */
    async storeItem(userId, regionId, itemInstanceId) {
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { currentRegion: true }
            });

            if (!user) throw new Error("User not found.");
            if (!user.currentRegion?.hasInn) {
                throw new Error("You can only access a vault inside an Inn.");
            }

            const item = await tx.inventoryItem.findFirst({
                where: { id: itemInstanceId, userId }
            });

            if (!item) throw new Error("Item not found in your inventory.");
            if (item.equippedIn) throw new Error("Cannot store equipped items.");

            // 1. Get or Create Regional Vault
            const vault = await tx.regionalVault.upsert({
                where: { userId_regionId: { userId, regionId } },
                update: {},
                create: { userId, regionId }
            });

            // 2. Link item to vault
            await tx.vaultItem.create({
                data: {
                    vaultId: vault.id,
                    itemInstanceId
                }
            });

            return {
                message: "Item stored successfully.",
                vaultId: vault.id,
                itemInstanceId
            };
        });
    }

    /**
     * Retrieve an item from a regional vault
     */
    async retrieveItem(userId, regionId, itemInstanceId) {
        return await this.runTransaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { currentRegion: true }
            });

            if (!user) throw new Error("User not found.");
            if (!user.currentRegion?.hasInn) {
                 throw new Error("You can only access a vault inside an Inn.");
            }

            const vaultItem = await tx.vaultItem.findFirst({
                where: { 
                    itemInstanceId,
                    vault: { userId, regionId }
                }
            });

            if (!vaultItem) {
                throw new Error("Item not found in this regional vault.");
            }

            // Remove from vault
            await tx.vaultItem.delete({
                where: { id: vaultItem.id }
            });

            return {
                message: "Item retrieved successfully.",
                itemInstanceId
            };
        });
    }

    /**
     * Get all items in a regional vault
     */
    async getVaultContents(userId, regionId) {
        return await this.db.regionalVault.findUnique({
            where: { userId_regionId: { userId, regionId } },
            include: {
                items: {
                    include: {
                        itemInstance: {
                            include: { template: true }
                        }
                    }
                }
            }
        });
    }
}

module.exports = new InnStorageService();
