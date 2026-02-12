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
        const userId = parseInt(id);
        if (isNaN(userId)) return null;
        return await prisma.user.findUnique({
            where: { id: userId },
            include: { heroes: true }
        });
    }

    async update(id, data) {
        const userId = parseInt(id);
        return await prisma.user.update({
            where: { id: userId },
            data
        });
    }

    async updateGold(id, amount) {
        const userId = parseInt(id);
        return await prisma.user.update({ where: { id: userId }, data: { gold: amount } });
    }

    async updateLocation(id, regionId) {
        const userId = parseInt(id);
        const rId = parseInt(regionId);
        return await this.db.user.update({ where: { id: userId }, data: { currentRegion: rId } });
    }

    /**
     * Update many users at once (used by guildService for mass updates)
     */
    async updateManyUsers(args) {
        return await this.db.user.updateMany(args);
    }
}

module.exports = new UserRepository();
