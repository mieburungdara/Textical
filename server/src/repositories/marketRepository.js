const prisma = require('../db');

class MarketRepository {
    async createListing(data) {
        return await prisma.marketListing.create({
            data: {
                sellerId: data.sellerId,
                templateId: data.templateId,
                itemInstanceId: data.itemInstanceId,
                quantity: data.quantity,
                pricePerUnit: data.pricePerUnit,
                totalPrice: data.quantity * data.pricePerUnit,
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 Hours expiry
            }
        });
    }

    async findListingById(id) {
        const listingId = parseInt(id);
        if (isNaN(listingId)) return null;
        return await prisma.marketListing.findUnique({
            where: { id: listingId },
            include: { itemInstance: true, seller: true }
        });
    }

    async getActiveListings(templateId = null) {
        const where = { isSold: false, expiresAt: { gt: new Date() } };
        if (templateId) where.templateId = parseInt(templateId);
        
        return await prisma.marketListing.findMany({
            where,
            include: { itemTemplate: true, itemInstance: true },
            orderBy: { pricePerUnit: 'asc' }
        });
    }

    async markAsSold(id) {
        const listingId = parseInt(id);
        return await prisma.marketListing.update({
            where: { id: listingId },
            data: { isSold: true }
        });
    }

    async addHistory(data) {
        return await prisma.marketHistory.create({ data });
    }

    async getHistory(templateId) {
        const tId = parseInt(templateId);
        return await prisma.marketHistory.findMany({
            where: { templateId: tId },
            orderBy: { soldAt: 'desc' },
            take: 20
        });
    }
}

module.exports = new MarketRepository();
