const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SiegeRepository {
    async findActiveSieges() {
        return await prisma.siege.findMany({
            where: { status: "ACTIVE" },
            include: { region: true, attacker: { include: { members: true } }, defender: { include: { members: true } } }
        });
    }

    async getSiegeById(id) {
        const siegeId = parseInt(id);
        if (isNaN(siegeId)) return null;
        return await prisma.siege.findUnique({
            where: { id: siegeId },
            include: { region: true, attacker: true, defender: true }
        });
    }

    async updateStatus(id, status, winnerId = null, warLog = "[]") {
        const siegeId = parseInt(id);
        const winner = winnerId ? parseInt(winnerId) : null;
        return await prisma.siege.update({
            where: { id: siegeId },
            data: { status, winnerGuildId: winner, warLog }
        });
    }

    async transferOwnership(regionId, newOwnerGuildId) {
        const rId = parseInt(regionId);
        const gId = parseInt(newOwnerGuildId);
        return await prisma.regionTemplate.update({
            where: { id: rId },
            data: { ownerGuildId: gId }
        });
    }
}

module.exports = new SiegeRepository();
