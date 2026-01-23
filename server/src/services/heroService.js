const ItemDatabase = require('../logic/itemDatabase');

class HeroService {
    prepareBattleParty(user) {
        return user.heroes.map(h => {
            const base = JSON.parse(h.baseStats);
            const equipMapping = JSON.parse(h.equipment || "{}");
            const resolvedEquip = {};

            Object.entries(equipMapping).forEach(([slot, itemId]) => {
                const invItem = user.inventory.find(item => item.id === itemId);
                if (invItem) resolvedEquip[slot] = ItemDatabase.getItem(invItem.templateId);
            });

            return {
                id: h.id, templateId: h.templateId, name: h.name, race: h.race, gender: h.gender, 
                classTier: h.classTier, level: h.level, baseStats: base,
                naturalTraits: JSON.parse(h.naturalTraits), acquiredTraits: JSON.parse(h.acquiredTraits),
                activeBehavior: h.activeBehavior, equipment: resolvedEquip
            };
        });
    }
}

module.exports = new HeroService();
