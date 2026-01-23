const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

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
            include: { heroes: true, inventory: true }
        });
    }

    async updateGold(userId, amount) {
        return await prisma.user.update({ where: { id: userId }, data: { gold: amount } });
    }
}

module.exports = new UserRepository();
