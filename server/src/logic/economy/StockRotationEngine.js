const regionalSupplyResolver = require('./RegionalSupplyResolver');

/**
 * AAA StockRotationEngine
 * Pure logic for rotating NPC inventory and calculating current stock quantities.
 */
class StockRotationEngine {
    /**
     * Resolves the current stock for an NPC in a region.
     * @param {Object} npc - NPCTemplate with shopItems.
     * @param {Object} region - RegionTemplate with properties.
     * @returns {Array} List of stock objects to be saved.
     */
    rotateStock(npc, region) {
        if (!npc.shopItems || npc.shopItems.length === 0) return [];

        const potentialItems = npc.shopItems;
        const resultStock = [];

        // 1. Rotation Strategy: Select a subset or all
        // For now, let's say all shop items are present but quantities vary.
        // In a more complex system, we could random-pick based on item rarity.
        
        for (const shopItem of potentialItems) {
            const itemTemplate = shopItem.item;
            const multiplier = regionalSupplyResolver.calculateMultiplier(region, itemTemplate);
            
            // Base Quantity from shopItem config or default
            const baseQty = shopItem.stock !== -1 ? shopItem.stock : 20; 
            const finalQty = Math.floor(baseQty * multiplier);

            resultStock.push({
                npcId: npc.id,
                regionId: region.id,
                templateId: itemTemplate.id,
                quantity: finalQty,
                maxQuantity: Math.max(finalQty, 50),
                nextRestock: new Date(Date.now() + 3600000 * 6) // +6 hours
            });
        }

        return resultStock;
    }
}

module.exports = new StockRotationEngine();
