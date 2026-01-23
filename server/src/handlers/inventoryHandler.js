const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const inventoryRepository = require('../repositories/inventoryRepository');

class InventoryHandler {
    async handleEquip(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            const item = await inventoryRepository.findItemById(request.itemId, user.id);
            const hero = await heroRepository.findById(request.heroId);
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
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    async handleUnequip(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            const hero = await heroRepository.findById(request.heroId);
            const equipment = JSON.parse(hero.equipment || "{}");
            const itemId = equipment[request.slot];

            if (itemId) {
                await inventoryRepository.updateEquipStatus(itemId, false);
                delete equipment[request.slot];
                await heroRepository.updateLineage(hero.id, { equipment: JSON.stringify(equipment) });
            }

            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new InventoryHandler();