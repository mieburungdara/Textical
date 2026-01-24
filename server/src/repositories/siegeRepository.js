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
        return await prisma.siege.findUnique({
            where: { id },
            include: { region: true, attacker: true, defender: true }
        });
    }

    async updateStatus(id, status, winnerId = null, warLog = "[]") {
        return await prisma.siege.update({
            where: { id },
            data: { status, winnerGuildId: winnerId, warLog }
        });
    }

    async transferOwnership(regionId, newOwnerGuildId) {
        return await prisma.regionTemplate.update({
            where: { id: regionId },
            data: { ownerGuildId: newOwnerGuildId }
        });
    }
}

module.exports = new SiegeRepository();
