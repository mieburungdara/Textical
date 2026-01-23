const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        return await prisma.marketListing.findUnique({
            where: { id },
            include: { itemInstance: true, seller: true }
        });
    }

    async getActiveListings(templateId = null) {
        const where = { isSold: false, expiresAt: { gt: new Date() } };
        if (templateId) where.templateId = templateId;
        
        return await prisma.marketListing.findMany({
            where,
            include: { itemTemplate: true, itemInstance: true },
            orderBy: { pricePerUnit: 'asc' }
        });
    }

    async markAsSold(id) {
        return await prisma.marketListing.update({
            where: { id },
            data: { isSold: true }
        });
    }

    async addHistory(data) {
        return await prisma.marketHistory.create({ data });
    }

    async getHistory(templateId) {
        return await prisma.marketHistory.findMany({
            where: { templateId },
            orderBy: { soldAt: 'desc' },
            take: 20
        });
    }
}

module.exports = new MarketRepository();
