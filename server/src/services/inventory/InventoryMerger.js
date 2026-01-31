/**
 * AAA InventoryMerger
 * Logic for consolidating partial stacks into full stacks.
 * Ensures data conservation and relational integrity.
 */
class InventoryMerger {
    /**
     * Consolidates all stackable items for a user.
     * Skips items that are equipped or listed on the market.
     */
    async consolidateStacks(tx, userId) {
        // 1. Fetch all stackable items that are NOT locked (not equipped, not listed)
        const items = await tx.inventoryItem.findMany({
            where: { 
                userId,
                equippedIn: null,
                marketOrders: { none: {} }
            },
            include: { template: true }
        });

        // 2. Group by templateId
        const groups = {};
        items.forEach(item => {
            if (!groups[item.templateId]) groups[item.templateId] = [];
            groups[item.templateId].push(item);
        });

        for (const templateId in groups) {
            const stackGroup = groups[templateId];
            const maxStack = stackGroup[0].template.maxStack || 1;

            // Only merge if there are multiple rows and it's stackable
            if (stackGroup.length <= 1 || maxStack <= 1) continue;

            const totalQty = stackGroup.reduce((acc, curr) => acc + curr.quantity, 0);
            
            // 3. Wipe existing rows for this specific template to rebuild them
            await tx.inventoryItem.deleteMany({
                where: { 
                    userId, 
                    templateId: parseInt(templateId),
                    equippedIn: null,
                    marketOrders: { none: {} }
                }
            });

            // 4. Redistribute total quantity into consolidated stacks
            let remaining = totalQty;
            while (remaining > 0) {
                const qty = Math.min(remaining, maxStack);
                await tx.inventoryItem.create({
                    data: {
                        userId,
                        templateId: parseInt(templateId),
                        quantity: qty
                    }
                });
                remaining -= qty;
            }
        }
    }
}

module.exports = new InventoryMerger();
