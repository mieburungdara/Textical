const BaseService = require('../BaseService');
const rotationEngine = require('../../logic/economy/StockRotationEngine');

/**
 * ShopInventoryService
 * Orchestrates periodic restocking and stock retrieval for NPC shops.
 */
class ShopInventoryService extends BaseService {
    /**
     * Triggers a global restock for all NPCs across all regions.
     */
    async restockAllShops() {
        // 1. Fetch all regions with resources
        const regions = await this.db.regionTemplate.findMany({
            include: { resources: true }
        });

        // 2. Fetch all traders
        const traders = await this.db.nPCTemplate.findMany({
            where: { type: { in: ["TRADER", "MERCHANT"] } },
            include: { shopItems: { include: { item: true } }, regions: true }
        });

        const restockResults = [];

        return await this.runTransaction(async (tx) => {
            for (const trader of traders) {
                // NPCs can be in multiple regions (mapped via regions array)
                for (const regionMapping of trader.regions) {
                    const region = regions.find(r => r.id === regionMapping.regionId);
                    if (!region) continue;

                    const stocks = rotationEngine.rotateStock(trader, region);

                    for (const stock of stocks) {
                        await tx.shopStock.upsert({
                            where: { 
                                npcId_regionId_templateId: { 
                                    npcId: stock.npcId, 
                                    regionId: stock.regionId, 
                                    templateId: stock.templateId 
                                } 
                            },
                            update: { 
                                quantity: stock.quantity, 
                                nextRestock: stock.nextRestock 
                            },
                            create: stock
                        });
                    }
                    restockResults.push({ trader: trader.name, region: region.name, items: stocks.length });
                }
            }
            return restockResults;
        });
    }

    /**
     * Gets the current dynamic stock for an NPC in a specific region.
     */
    async getNPCCurrentStock(npcId, regionId) {
        return await this.db.shopStock.findMany({
            where: { npcId, regionId },
            include: { itemTemplate: true }
        });
    }
}

module.exports = new ShopInventoryService();
