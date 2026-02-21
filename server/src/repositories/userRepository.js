const prisma = require('../db');
const bcrypt = require('bcryptjs');

// ─── Shared include shapes ───────────────────────────────────────────────────

/** Full hero data needed during gameplay (equipment, traits, buffs). */
const HERO_FULL_INCLUDE = {
    equipment: {
        include: {
            itemInstance: { include: { template: true } }
        }
    },
    traits: true,
    buffs: true,
};

/** Minimal user data for gameplay session (heroes + inventory + guild). */
const USER_FULL_INCLUDE = {
    heroes: { include: HERO_FULL_INCLUDE },
    inventory: {
        where: { isTrash: false },
        include: { template: true },
        orderBy: { id: 'desc' },
        take: 200,
    },
    guild: true,
};

// ─── UserRepository ──────────────────────────────────────────────────────────

class UserRepository {
    /**
     * Create a new user account.
     * @param {string} username - Unique username.
     * @param {string} password - Plain-text password (will be hashed).
     * @returns {Promise<Object|null>} Created user or null if username taken.
     */
    async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            return await prisma.user.create({ data: { username, password: hashedPassword, gold: 500 } });
        } catch (e) { return null; }
    }

    /**
     * Find user by username — lightweight, for auth/middleware only.
     * Does NOT include any relations.
     * @param {string} username - Username to look up.
     * @returns {Promise<Object|null>}
     */
    async findByUsername(username) {
        return await prisma.user.findUnique({ where: { username } });
    }

    /**
     * Find user by username — full profile for gameplay.
     * Includes heroes (with equipment+traits), inventory, and guild.
     * @param {string} username - Username to look up.
     * @returns {Promise<Object|null>}
     */
    async findByUsername_full(username) {
        return await prisma.user.findUnique({
            where: { username },
            include: USER_FULL_INCLUDE,
        });
    }

    /**
     * Find user by ID — lightweight, no relations.
     * @param {number} id - User ID.
     * @returns {Promise<Object|null>}
     */
    async findById(id) {
        const userId = parseInt(id);
        if (isNaN(userId)) return null;
        return await prisma.user.findUnique({ where: { id: userId } });
    }

    /**
     * Find user by ID — full profile for gameplay.
     * @param {number} id - User ID.
     * @returns {Promise<Object|null>}
     */
    async findById_full(id) {
        const userId = parseInt(id);
        if (isNaN(userId)) return null;
        return await prisma.user.findUnique({
            where: { id: userId },
            include: USER_FULL_INCLUDE,
        });
    }

    /**
     * Update arbitrary user fields.
     * @param {number} id - User ID.
     * @param {Object} data - Fields to update.
     * @returns {Promise<Object>}
     */
    async update(id, data) {
        const userId = parseInt(id);
        return await prisma.user.update({ where: { id: userId }, data });
    }

    /**
     * Update user gold amount.
     * @param {number} id - User ID.
     * @param {number} amount - New gold total.
     * @returns {Promise<Object>}
     */
    async updateGold(id, amount) {
        const userId = parseInt(id);
        return await prisma.user.update({ where: { id: userId }, data: { gold: amount } });
    }

    /**
     * Move user to a new region.
     * @param {number} id - User ID.
     * @param {number} regionId - New region ID.
     * @returns {Promise<Object>}
     */
    async updateLocation(id, regionId) {
        const userId = parseInt(id);
        const rId = parseInt(regionId);
        return await prisma.user.update({ where: { id: userId }, data: { currentRegion: rId } });
    }

    /**
     * Batch update multiple users.
     * @param {Object} args - Prisma updateMany args.
     * @returns {Promise<{ count: number }>}
     */
    async updateManyUsers(args) {
        return await prisma.user.updateMany(args);
    }
}

module.exports = new UserRepository();
