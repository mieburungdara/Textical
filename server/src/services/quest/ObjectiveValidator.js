const BaseService = require('../BaseService');

/**
 * ObjectiveValidator
 * Checks if quest objectives are met and handles item consumption.
 */
class ObjectiveValidator extends BaseService {
    async validateAndConsume(userId, userQuest) {
        for (const obj of userQuest.quest.objectives) {
            if (obj.type === "GATHER") {
                const invItem = await this.db.inventoryItem.findFirst({
                    where: { 
                        userId, 
                        templateId: obj.targetId,
                        marketListing: null,
                        equippedIn: null
                    }
                });
                
                if (!invItem || invItem.quantity < obj.amount) {
                    throw new Error(`Objective incomplete: Need ${obj.amount}x [Item ${obj.targetId}].`);
                }
                
                // Consume quest items
                if (invItem.quantity === obj.amount) {
                    await this.db.inventoryItem.delete({ where: { id: invItem.id } });
                } else {
                    await this.db.inventoryItem.update({
                        where: { id: invItem.id },
                        data: { quantity: invItem.quantity - obj.amount }
                    });
                }
            }
            // Add KILL or other types here as needed
        }
        return true;
    }
}

module.exports = new ObjectiveValidator();
