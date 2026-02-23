const BaseService = require('../BaseService');

/**
 * PriceIndexService
 * Orchestrates market data aggregation and trend analysis.
 */
class PriceIndexService extends BaseService {
    /**
     * Fetches chronological price points for an item in a specific region.
     */
    async getPriceHistory(templateId, regionId = null, limit = 50) {
        const where = { templateId };
        if (regionId) where.regionId = regionId;

        const history = await this.db.itemSaleHistory.findMany({
            where,
            orderBy: { soldAt: 'asc' }, // Ascending for chronological chart
            take: limit,
            include: { region: true }
        });

        return history.map(h => ({
            id: h.id,
            price: h.pricePerUnit,
            quantity: h.quantity,
            regionName: h.region.name,
            timestamp: h.soldAt
        }));
    }

    /**
     * Calculates current average price across all regions for an item.
     */
    async getGlobalAverage(templateId) {
        const history = await this.db.itemSaleHistory.findMany({
            where: { templateId },
            orderBy: { soldAt: 'desc' },
            take: 20
        });

        if (history.length === 0) return 0;
        const total = history.reduce((acc, curr) => acc + curr.pricePerUnit, 0);
        return Math.floor(total / history.length);
    }
}

module.exports = new PriceIndexService();
