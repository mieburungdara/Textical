/**
 * AAA InventorySorter
 * Logic for ordering inventory items based on RPG standards.
 */
class InventorySorter {
    constructor() {
        this.CATEGORY_ORDER = {
            "EQUIPMENT": 1,
            "CONSUMABLE": 2,
            "MATERIAL": 3,
            "CURRENCY": 4,
            "QUEST": 5,
            "OTHER": 6
        };

        this.RARITY_ORDER = {
            "LEGENDARY": 1,
            "EPIC": 2,
            "RARE": 3,
            "UNCOMMON": 4,
            "COMMON": 5
        };
    }

    /**
     * Returns a comparator for sorting InventoryItem models.
     */
    getComparator() {
        return (a, b) => {
            // 1. Sort by Category
            const catA = this.CATEGORY_ORDER[a.template.category] || 99;
            const catB = this.CATEGORY_ORDER[b.template.category] || 99;
            if (catA !== catB) return catA - catB;

            // 2. Sort by Rarity
            const rarA = this.RARITY_ORDER[a.template.rarity] || 99;
            const rarB = this.RARITY_ORDER[b.template.rarity] || 99;
            if (rarA !== rarB) return rarA - rarB;

            // 3. Sort by Template ID
            if (a.templateId !== b.templateId) return a.templateId - b.templateId;

            // 4. Sort by Quantity (Descending)
            return b.quantity - a.quantity;
        };
    }
}

module.exports = new InventorySorter();
