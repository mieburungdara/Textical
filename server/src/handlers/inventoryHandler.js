const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const repairService = require('../services/repairService');
const ErrorCodes = require('../constants/ErrorCodes');

class InventoryHandler {
    async handleEquip(ws, request) {
        try {
            // Input validation
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            if (!request.itemId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: "Item ID is required" 
                }));
                return;
            }
            
            if (!request.heroId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.HERO_NOT_FOUND,
                    message: "Hero ID is required" 
                }));
                return;
            }
            
            if (!request.slot) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.EQUIP_INVALID_SLOT,
                    message: "Equipment slot is required" 
                }));
                return;
            }
            
            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "User not found" 
                }));
                return;
            }
            
            const item = await inventoryRepository.findItemById(request.itemId, user.id);
            if (!item) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: "Item not found in inventory" 
                }));
                return;
            }
            
            const hero = await heroRepository.findById(request.heroId);
            if (!hero) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.HERO_NOT_FOUND,
                    message: "Hero not found" 
                }));
                return;
            }
            
            const equipment = JSON.parse(hero.equipment || "{}");

            if (equipment[request.slot]) {
                await inventoryRepository.updateEquipStatus(equipment[request.slot], false);
            }

            equipment[request.slot] = item.id;
            await heroRepository.updateLineage(hero.id, { equipment: JSON.stringify(equipment) });
            await inventoryRepository.updateEquipStatus(item.id, true);

            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }

    async handleUnequip(ws, request) {
        try {
            // Input validation
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            if (!request.heroId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.HERO_NOT_FOUND,
                    message: "Hero ID is required" 
                }));
                return;
            }
            
            if (!request.slot) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.EQUIP_INVALID_SLOT,
                    message: "Equipment slot is required" 
                }));
                return;
            }
            
            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "User not found" 
                }));
                return;
            }
            
            const hero = await heroRepository.findById(request.heroId);
            if (!hero) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.HERO_NOT_FOUND,
                    message: "Hero not found" 
                }));
                return;
            }
            
            const equipment = JSON.parse(hero.equipment || "{}");
            const itemId = equipment[request.slot];

            if (!itemId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.EQUIP_SLOT_EMPTY,
                    message: "No item in this slot to unequip" 
                }));
                return;
            }

            await inventoryRepository.updateEquipStatus(itemId, false);
            delete equipment[request.slot];
            await heroRepository.updateLineage(hero.id, { equipment: JSON.stringify(equipment) });

            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }

    /**
     * AAA REPAIR LOGIC:
     * Restores item durability in exchange for Gold.
     */
    async handleRepair(ws, request) {
        try {
            // Input validation
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            if (!request.itemId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: "Item ID is required" 
                }));
                return;
            }
            
            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "User not found" 
                }));
                return;
            }
            
            const item = await inventoryRepository.findItemById(request.itemId, user.id);
            if (!item) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: "Item not found in inventory" 
                }));
                return;
            }

            const result = await repairService.repair(user, item);
            
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: `Item repaired for ${result.cost} Gold.`
            }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }
}

module.exports = new InventoryHandler();