/**
 * AAA InventoryManager
 * Logic for handling multi-stacking, slot overflows, and stack limits.
 */
class InventoryManager {
    /**
     * Calculates the necessary DB operations to add a quantity of items.
     * Respects maxStack and fills existing slots before creating new ones.
     */
    async resolveStackingOps(tx, userId, templateId, quantity) {
        const template = await tx.itemTemplate.findUnique({ where: { id: templateId } });
        if (!template) throw new Error("Item template not found.");

        const maxStack = template.maxStack || 1;
        let remainingToAdd = quantity;
        const operations = [];

        // 1. Find existing non-full stacks
        const existingStacks = await tx.inventoryItem.findMany({
            where: { userId, templateId, quantity: { lt: maxStack } },
            orderBy: { quantity: 'desc' } // Fill fullest stacks first
        });

        for (const stack of existingStacks) {
            if (remainingToAdd <= 0) break;
            const spaceInStack = maxStack - stack.quantity;
            const amountToFill = Math.min(remainingToAdd, spaceInStack);

            operations.push(tx.inventoryItem.update({
                where: { id: stack.id },
                data: { quantity: { increment: amountToFill } }
            }));

            remainingToAdd -= amountToFill;
        }

        // 2. Create new stacks for overflow
        while (remainingToAdd > 0) {
            const amountForNewStack = Math.min(remainingToAdd, maxStack);
            operations.push(tx.inventoryItem.create({
                data: {
                    userId,
                    templateId,
                    quantity: amountForNewStack
                }
            }));
            remainingToAdd -= amountForNewStack;
        }

        return operations;
    }

    /**
     * Predicts how many NEW slots will be required to add a quantity.
     * Used for capacity validation.
     */
    async predictRequiredNewSlots(tx, userId, templateId, quantity) {
        const template = await tx.itemTemplate.findUnique({ where: { id: templateId } });
        const maxStack = template.maxStack || 1;
        
        // 1. Check existing space
        const existingStacks = await tx.inventoryItem.findMany({
            where: { userId, templateId, quantity: { lt: maxStack } }
        });

        let totalSpaceInExisting = 0;
        existingStacks.forEach(s => totalSpaceInExisting += (maxStack - s.quantity));

        if (quantity <= totalSpaceInExisting) return 0;

        const overflow = quantity - totalSpaceInExisting;
        return Math.ceil(overflow / maxStack);
    }
}

module.exports = new InventoryManager();
