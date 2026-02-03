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
        return await prisma.guild.findUnique({
            where: { id },
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
        return await prisma.guildTemplate.findUnique({ where: { id } });
    }

    async update(id, data) {
        return await prisma.guild.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return await prisma.guild.delete({ where: { id } });
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
            skip: (page - 1) * limit
        });
    }

    async getFacilityTemplateById(id) {
        return await prisma.guildFacilityTemplate.findUnique({ where: { id } });
    }

    async getFacilityById(id) {
        return await prisma.guildFacility.findUnique({ 
            where: { id },
            include: { template: true }
        });
    }

    async addFacility(guildId, templateId, level) {
        return await prisma.guildFacility.create({
            data: {
                guildId,
                templateId,
                level
            }
        });
    }

    async upgradeFacility(facilityId) {
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
                guildId: data.guildId,
                invitedBy: data.invitedBy,
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

    async findInviteById(inviteId) {
        return await prisma.guildInvite.findUnique({
            where: { id: inviteId }
        });
    }

    async updateInviteStatus(inviteId, status) {
        return await prisma.guildInvite.update({
            where: { id: inviteId },
            data: { status }
        });
    }

    async getGuildHistory(guildId, limit = 50) {
        return await prisma.guildHistory.findMany({
            where: { guildId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}

module.exports = new GuildRepository();
