const BaseService = require('./BaseService');

/**
 * ManaChargingService (v1.0)
 * Logic for charging mana-related items in high static intensity regions.
 * Includes soul gem and battery charging mechanics.
 * 
 * @extends BaseService
 */
class ManaChargingService extends BaseService {
    /**
     * Charges a specific item in the user's inventory if conditions are met.
     * Requires the user to be in a region with manaStaticIntensity > 1.5.
     * 
     * @param {string} userId - The unique identifier of the user.
     * @param {string} userItemId - The ID of the item instance in user inventory.
     * @returns {Promise<Object>} The result of the charging operation.
     */
    async chargeItem(userId, userItemId) {
        return await this.runTransaction(async (tx) => {
            // 1. Fetch User and Current Region
            const user = await tx.user.findUnique({
                where: { id: userId },
                include: { region: true }
            });

            if (!user || !user.region) {
                throw new Error("User or region not found.");
            }

            const region = user.region;
            const intensity = region.manaStaticIntensity || 1.0;

            if (intensity < 1.5) {
                throw new Error(`Mana intensity too low (${intensity.toFixed(1)}). Need at least 1.5.`);
            }

            // 2. Fetch the Item Instance
            const itemInstance = await tx.inventoryItem.findUnique({
                where: { id: userItemId },
                include: { item: true }
            });

            if (!itemInstance || itemInstance.userId !== userId) {
                throw new Error("Item not found in your inventory.");
            }

            // 3. Define Charging Logic (Mapping Empty -> Full)
            const CHARGE_MAP = {
                "EMPTY_SOUL_GEM": "CHARGED_SOUL_GEM",
                "EMPTY_MANA_BATTERY": "CHARGED_MANA_BATTERY"
            };

            const targetTemplateKey = CHARGE_MAP[itemInstance.item.code];
            if (!targetTemplateKey) {
                throw new Error(`Item ${itemInstance.item.name} cannot be charged here.`);
            }

            // 4. Find Target Template
            const targetTemplate = await tx.itemTemplate.findFirst({
                where: { code: targetTemplateKey }
            });

            if (!targetTemplate) {
                throw new Error(`Missing template for ${targetTemplateKey}. Please contact administrator.`);
            }

            // 5. Perform the Swap
            // Consume 1 empty item
            if (itemInstance.quantity > 1) {
                await tx.inventoryItem.update({
                    where: { id: userItemId },
                    data: { quantity: { decrement: 1 } }
                });
            } else {
                await tx.inventoryItem.delete({
                    where: { id: userItemId }
                });
            }

            // Add 1 charged item
            // Check if we can stack it (simplified: always create instance for gems/batteries as they might have quality)
            const newItem = await tx.inventoryItem.create({
                data: {
                    userId,
                    templateId: targetTemplate.id,
                    quantity: 1,
                    quality: itemInstance.quality, // Maintain quality
                    powerScale: itemInstance.powerScale * (1 + (intensity - 1.5) * 0.1) // Bonus power from intensity
                }
            });

            return {
                success: true,
                message: `Successfully charged ${itemInstance.item.name} into ${targetTemplate.name}!`,
                newItem
            };
        });
    }
}

module.exports = new ManaChargingService();
