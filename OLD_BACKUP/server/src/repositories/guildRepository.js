const prisma = require('../db');

class GuildRepository {
    async create(data) {
        return await prisma.guild.create({
            data: {
                name: data.name,
                description: data.description,
                templateId: data.templateId,
                vaultGold: 0,
                treasury: 0,
                marketTaxRate: 0.0,
                gatheringTaxRate: 0.0
            }
        });
    }

    async findById(id) {
        const guildId = parseInt(id);
        if (isNaN(guildId)) return null;
        return await prisma.guild.findUnique({
            where: { id: guildId },
            include: { 
                members: true, 
                template: true,
                facilities: true,
                perks: true
            }
        });
    }

    async findByName(name) {
        return await prisma.guild.findUnique({ where: { name } });
    }

    async getTemplateById(id) {
        const templateId = parseInt(id);
        if (isNaN(templateId)) return null;
        return await prisma.guildTemplate.findUnique({ 
            where: { id: templateId },
            include: { creationReqs: true }
        });
    }

    async update(id, data) {
        const guildId = parseInt(id);
        return await prisma.guild.update({
            where: { id: guildId },
            data
        });
    }

    async delete(id) {
        const guildId = parseInt(id);
        return await prisma.guild.delete({ where: { id: guildId } });
    }

    async search(query, page = 1, limit = 10) {
        return await prisma.guild.findMany({
            where: {
                name: {
                    contains: query
                }
            },
            include: {
                template: true,
                _count: {
                    select: { members: true }
                }
            },
            take: limit,
            skip: (parseInt(page) - 1) * parseInt(limit)
        });
    }

    async getFacilityTemplateById(id) {
        const templateId = parseInt(id);
        if (isNaN(templateId)) return null;
        return await prisma.guildFacilityTemplate.findUnique({ where: { id: templateId } });
    }

    async getFacilityById(id) {
        const facilityId = parseInt(id);
        if (isNaN(facilityId)) return null;
        return await prisma.guildFacility.findUnique({ 
            where: { id: facilityId },
            include: { template: true }
        });
    }

    async addFacility(guildId, templateId, level) {
        return await prisma.guildFacility.create({
            data: {
                guildId: parseInt(guildId),
                templateId: parseInt(templateId),
                level: parseInt(level)
            }
        });
    }

    async upgradeFacility(id) {
        const facilityId = parseInt(id);
        return await prisma.guildFacility.update({
            where: { id: facilityId },
            data: {
                level: { increment: 1 }
            }
        });
    }

    async createInvite(data) {
        return await prisma.guildInvite.create({
            data: {
                guildId: parseInt(data.guildId),
                invitedBy: parseInt(data.invitedBy),
                inviteCode: data.inviteCode,
                expiresAt: data.expiresAt,
                status: "PENDING"
            }
        });
    }

    async findInviteByCode(inviteCode) {
        return await prisma.guildInvite.findUnique({
            where: { inviteCode },
            include: { guild: true }
        });
    }

    async findInviteById(id) {
        const inviteId = parseInt(id);
        if (isNaN(inviteId)) return null;
        return await prisma.guildInvite.findUnique({
            where: { id: inviteId }
        });
    }

    async updateInviteStatus(id, status) {
        const inviteId = parseInt(id);
        return await prisma.guildInvite.update({
            where: { id: inviteId },
            data: { status }
        });
    }

    async getGuildHistory(id, limit = 50) {
        const guildId = parseInt(id);
        return await prisma.guildHistory.findMany({
            where: { guildId },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit)
        });
    }
}

module.exports = new GuildRepository();
