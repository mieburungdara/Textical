const userRepository = require('../repositories/userRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const enchantmentService = require('../services/enchantmentService');
const ErrorCodes = require('../constants/ErrorCodes');
const logger = require('../utils/logger');

class EnchantmentHandler {
    /**
     * Handle apply enchantment request
     */
    async handleApplyEnchantment(ws, request) {
        try {
            // Input validation
            if (!request.account) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: 'Account is required'
                }));
                return;
            }

            if (!request.itemId) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: 'Item ID is required'
                }));
                return;
            }

            if (!request.enchantmentId) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVALID_INPUT,
                    message: 'Enchantment ID is required'
                }));
                return;
            }

            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: 'User not found'
                }));
                return;
            }

            // Verify item belongs to user
            const item = await inventoryRepository.findItemById(request.itemId, user.id);
            if (!item) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: 'Item not found in inventory'
                }));
                return;
            }

            const result = await enchantmentService.applyEnchantment(
                user.id,
                request.itemId,
                request.enchantmentId
            );

            // Get updated user info
            const updatedUser = await userRepository.findByUsername(request.account);

            ws.send(JSON.stringify({
                type: 'enchantment_result',
                success: result.success,
                message: result.message,
                enchantmentName: result.enchantmentName,
                level: result.level,
                silverCost: result.silverCost,
                user: updatedUser
            }));

            logger.info(`[EnchantmentHandler] Enchantment applied`, {
                userId: user.id,
                itemId: request.itemId,
                enchantmentId: request.enchantmentId,
                success: result.success
            });

        } catch (error) {
            logger.error(`[EnchantmentHandler] Error applying enchantment`, {
                error: error.message,
                stack: error.stack
            });

            ws.send(JSON.stringify({
                type: 'error',
                code: error.code || ErrorCodes.INVALID_INPUT,
                message: error.message
            }));
        }
    }

    /**
     * Handle get enchantment preview request
     */
    async handleGetEnchantmentPreview(ws, request) {
        try {
            if (!request.account) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: 'Account is required'
                }));
                return;
            }

            if (!request.itemId) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: 'Item ID is required'
                }));
                return;
            }

            if (!request.enchantmentId) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVALID_INPUT,
                    message: 'Enchantment ID is required'
                }));
                return;
            }

            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: 'User not found'
                }));
                return;
            }

            // Verify item belongs to user
            const item = await inventoryRepository.findItemById(request.itemId, user.id);
            if (!item) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: 'Item not found in inventory'
                }));
                return;
            }

            const preview = await enchantmentService.getEnchantmentPreview(
                request.itemId,
                request.enchantmentId
            );

            ws.send(JSON.stringify({
                type: 'enchantment_preview',
                ...preview
            }));

        } catch (error) {
            logger.error(`[EnchantmentHandler] Error getting preview`, {
                error: error.message,
                stack: error.stack
            });

            ws.send(JSON.stringify({
                type: 'error',
                code: error.code || ErrorCodes.INVALID_INPUT,
                message: error.message
            }));
        }
    }

    /**
     * Handle get available enchantments request
     */
    async handleGetAvailableEnchantments(ws, request) {
        try {
            const enchantments = await enchantmentService.getAvailableEnchantments();

            ws.send(JSON.stringify({
                type: 'available_enchantments',
                enchantments
            }));

        } catch (error) {
            logger.error(`[EnchantmentHandler] Error getting enchantments`, {
                error: error.message,
                stack: error.stack
            });

            ws.send(JSON.stringify({
                type: 'error',
                code: ErrorCodes.INVALID_INPUT,
                message: error.message
            }));
        }
    }

    /**
     * Handle get item enchantments request
     */
    async handleGetItemEnchantments(ws, request) {
        try {
            if (!request.account) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: 'Account is required'
                }));
                return;
            }

            if (!request.itemId) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: 'Item ID is required'
                }));
                return;
            }

            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: 'User not found'
                }));
                return;
            }

            // Verify item belongs to user
            const item = await inventoryRepository.findItemById(request.itemId, user.id);
            if (!item) {
                ws.send(JSON.stringify({
                    type: 'error',
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: 'Item not found in inventory'
                }));
                return;
            }

            const enchantments = await enchantmentService.getItemEnchantments(request.itemId);

            ws.send(JSON.stringify({
                type: 'item_enchantments',
                itemId: request.itemId,
                enchantments
            }));

        } catch (error) {
            logger.error(`[EnchantmentHandler] Error getting item enchantments`, {
                error: error.message,
                stack: error.stack
            });

            ws.send(JSON.stringify({
                type: 'error',
                code: ErrorCodes.INVALID_INPUT,
                message: error.message
            }));
        }
    }
}

module.exports = new EnchantmentHandler();
