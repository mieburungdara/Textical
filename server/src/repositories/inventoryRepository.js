const prisma = require('../db');
const { buildPaginationArgs, buildPaginationMeta } = require('../utils/PaginationHelper');

class InventoryRepository {
    /**
     * Add an item to user's inventory. Stacks if item is stackable (no uniqueData).
     * @param {number} userId - The owner user ID.
     * @param {string|number} templateId - Item template ID or name.
     * @param {number} quantity - Quantity to add.
     * @returns {Promise<Object>} The inventory item.
     */
    async addItem(userId, templateId, quantity = 1) {
        // Resolve templateId (could be a name string)
        let tId;
        if (typeof templateId === 'string' && isNaN(parseInt(templateId))) {
            const template = await prisma.itemTemplate.findFirst({ where: { name: templateId }, select: { id: true } });
            tId = template?.id;
        } else {
            tId = parseInt(templateId);
        }
        if (!tId) throw new Error(`Item template not found: ${templateId}`);

        // Stack if the same item exists and is not equipped
        const existing = await prisma.inventoryItem.findFirst({
            where: { userId, templateId: tId, equippedIn: null },
            select: { id: true, quantity: true },
        });
        if (existing) {
            return await prisma.inventoryItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
            });
        }
        return await prisma.inventoryItem.create({ data: { userId, templateId: tId, quantity } });
    }

    /**
     * Get paginated inventory for a user.
     * @param {number} userId - Owner ID.
     * @param {number} page - Page number (1-indexed).
     * @param {number} limit - Items per page.
     * @returns {Promise<{ data: Object[], meta: Object }>}
     */
    async getByUser(userId, page = 1, limit = 50) {
        const uId = parseInt(userId);
        const { skip, take } = buildPaginationArgs(page, limit);
        const where = { userId: uId, isTrash: false };

        const [data, total] = await prisma.$transaction([
            prisma.inventoryItem.findMany({
                where,
                include: { template: true },
                orderBy: { id: 'desc' },
                skip,
                take,
            }),
            prisma.inventoryItem.count({ where }),
        ]);

        return { data, meta: buildPaginationMeta(page, limit, total) };
    }

    /**
     * Find a single inventory item by ID and optional owner check.
     * @param {number} id - Item ID.
     * @param {number} userId - Owner ID.
     * @returns {Promise<Object|null>}
     */
    async findItemById(id, userId) {
        const itemId = parseInt(id);
        const uId = parseInt(userId);
        return await prisma.inventoryItem.findFirst({
            where: { id: itemId, userId: uId },
            include: { template: true },
        });
    }

    /**
     * Transfer item to a new owner.
     * @param {number} id - Item ID.
     * @param {number} newUserId - New owner ID.
     * @returns {Promise<Object>}
     */
    async updateOwner(id, newUserId) {
        const itemId = parseInt(id);
        const uId = parseInt(newUserId);
        return await prisma.inventoryItem.update({
            where: { id: itemId },
            data: { userId: uId },
        });
    }

    /**
     * Update item quantity, deletes the item if quantity reaches 0.
     * @param {number} id - Item ID.
     * @param {number} quantity - New quantity.
     * @returns {Promise<Object|null>}
     */
    async updateQuantity(id, quantity) {
        const itemId = parseInt(id);
        if (quantity <= 0) return await prisma.inventoryItem.delete({ where: { id: itemId } });
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { quantity } });
    }

    /**
     * Update item durability.
     * @param {number} id - Item ID.
     * @param {number} durability - New durability value.
     * @returns {Promise<Object>}
     */
    async updateDurability(id, durability) {
        const itemId = parseInt(id);
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { currentDurability: durability } });
    }

    /**
     * Mark/unmark an item as trash.
     * @param {number} id - Item ID.
     * @param {boolean} isTrash - Trash status.
     * @returns {Promise<Object>}
     */
    async markAsTrash(id, isTrash) {
        const itemId = parseInt(id);
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { isTrash } });
    }
}

module.exports = new InventoryRepository();
