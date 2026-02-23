const prisma = require('../db');
const { buildPaginationArgs, buildPaginationMeta } = require('../utils/PaginationHelper');

class MarketRepository {
    /**
     * Create a new market order (listing).
     * @param {Object} data - Listing data (sellerId, regionId, templateId, itemInstanceId, quantity, pricePerUnit, type).
     * @returns {Promise<Object>} Created listing.
     */
    async createListing(data) {
        return await prisma.marketOrder.create({
            data: {
                creatorId: data.sellerId,
                regionId: data.regionId || 1, // Default region or from data
                templateId: data.templateId,
                itemInstanceId: data.itemInstanceId,
                initialQuantity: data.quantity,
                remainingQuantity: data.quantity,
                pricePerUnit: data.pricePerUnit,
                type: data.type || 'SELL',
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h expiry
            }
        });
    }

    /**
     * Find a listing by ID with seller and item info.
     * @param {number} id - Listing ID.
     * @returns {Promise<Object|null>}
     */
    async findListingById(id) {
        const listingId = parseInt(id);
        if (isNaN(listingId)) return null;
        return await prisma.marketOrder.findUnique({
            where: { id: listingId },
            select: {
                id: true,
                remainingQuantity: true,
                pricePerUnit: true,
                status: true,
                expiresAt: true,
                creatorId: true,
                creator: { select: { id: true, username: true } },
                itemInstance: { select: { id: true, templateId: true, currentDurability: true, quality: true } },
            }
        });
    }

    /**
     * Get active market orders with pagination.
     * @param {number|null} templateId - Filter by item template ID (optional).
     * @param {number} page - 1-indexed page number.
     * @param {number} limit - Items per page.
     * @returns {Promise<{ data: Object[], meta: Object }>}
     */
    async getActiveListings(templateId = null, page = 1, limit = 20) {
        const where = { status: 'OPEN', expiresAt: { gt: new Date() } };
        if (templateId) {
            where.templateId = parseInt(String(templateId), 10);
        }

        const { skip, take } = buildPaginationArgs(page, limit);

        const [data, total] = await prisma.$transaction([
            prisma.marketOrder.findMany({
                where,
                select: {
                    id: true,
                    remainingQuantity: true,
                    pricePerUnit: true,
                    expiresAt: true,
                    creatorId: true,
                    creator: { select: { username: true } },
                    itemInstance: { select: { id: true, quality: true, currentDurability: true } },
                    itemTemplate: { select: { id: true, name: true, type: true, rarity: true, iconPath: true } },
                },
                orderBy: { pricePerUnit: 'asc' },
                skip,
                take,
            }),
            prisma.marketOrder.count({ where }),
        ]);

        return { data, meta: buildPaginationMeta(page, limit, total) };
    }

    /**
     * Mark an order as sold/closed.
     * @param {number} id - Order ID.
     * @returns {Promise<Object>}
     */
    async markAsSold(id) {
        const orderId = parseInt(id);
        return await prisma.marketOrder.update({
            where: { id: orderId },
            data: { status: 'SOLD' },
        });
    }

    /**
     * Record a completed sale in history.
     * @param {Object} data - History data (sellerId, templateId, pricePerUnit, quantity, regionId).
     * @returns {Promise<Object>}
     */
    async addHistory(data) {
        return await prisma.itemSaleHistory.create({ data });
    }

    /**
     * Get the last N sale records for a specific item template.
     * @param {number} templateId - Item template ID.
     * @param {number} limit - Max records to return.
     * @returns {Promise<Object[]>}
     */
    async getHistory(templateId, limit = 20) {
        const tId = parseInt(templateId);
        return await prisma.itemSaleHistory.findMany({
            where: { templateId: tId },
            select: {
                id: true,
                pricePerUnit: true,
                quantity: true,
                soldAt: true,
                regionId: true,
            },
            orderBy: { soldAt: 'desc' },
            take: Math.min(100, parseInt(String(limit), 10) || 20),
        });
    }
}

module.exports = new MarketRepository();
