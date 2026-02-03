const prisma = require('../db');
const bcrypt = require('bcryptjs');

class UserRepository {
    async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            return await prisma.user.create({ data: { username, password: hashedPassword, gold: 500 } });
        } catch (e) { return null; }
    }

    async findByUsername(username) {
        return await prisma.user.findUnique({
            where: { username },
            include: { heroes: true, inventory: true, guild: true }
        });
    }

    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
            include: { heroes: true }
        });
    }

    async update(id, data) {
        return await prisma.user.update({
            where: { id },
            data
        });
    }

    async updateGold(userId, amount) {
        return await prisma.user.update({ where: { id: userId }, data: { gold: amount } });
    }

    async updateLocation(userId, regionId) {
        return await prisma.user.update({ where: { id: userId }, data: { currentRegion: regionId } });
    }

    async removeFromGuild(guildId) {
        return await prisma.user.updateMany({
            where: { guildId },
            data: { guildId: null, guildRole: null }
        });
    }
}

module.exports = new UserRepository();
