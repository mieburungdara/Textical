const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GuildRepository {
    async create(data) {
        return await prisma.guild.create({
            data: {
                name: data.name,
                description: data.description,
                templateId: data.templateId,
                vaultGold: 0,
                unlockedPerks: JSON.stringify([]),
                facilities: JSON.stringify({})
            }
        });
    }

    async findById(id) {
        return await prisma.guild.findUnique({
            where: { id },
            include: { members: true, template: true }
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
}

module.exports = new GuildRepository();
