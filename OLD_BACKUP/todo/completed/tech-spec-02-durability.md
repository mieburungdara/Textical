# 🛠️ Technical Specification: Module 02 (Durability & Loot)

## 1. Database Schema Updates
- **InventoryItem**:
    - `currentDurability`: Int (Default: 100).
    - `maxDurability`: Int (Default: 100).
    - `isTrash`: Boolean (Default: false). Jika true, item kehilangan stats aslinya dan nama berubah menjadi Trash.

## 2. Server Logic (Pseudocode)

### A. Zero Durability Visual Flag
```javascript
function getEquipmentData(hero) {
    return hero.equipment.map(item => ({
        ...item,
        isBroken: item.currentDurability <= 0, // Client uses this to highlight RED
        effectiveStats: item.currentDurability <= 0 ? zeroStats() : item.stats
    }));
}
```

### B. Trash Conversion (Non-Stackable)
```javascript
function createTrashFromItem(originalItem) {
    return {
        templateId: TRASH_ITEM_ID,
        name: `Trash (${originalItem.name})`,
        quantity: 1, // Forced to 1 because non-stackable
        isTrash: true,
        currentDurability: 0
    };
}
```

### C. Repair Cost Formula
```javascript
function getRepairCost(item) {
    const pointsToFix = item.maxDurability - item.currentDurability;
    const rarityMult = { 'COMMON': 1, 'RARE': 2, 'EPIC': 5, 'LEGENDARY': 10 };
    const levelMult = 1 + (item.level / 10);
    
    return Math.floor(pointsToFix * 10 * rarityMult[item.rarity] * levelMult);
}
```

---
*Catatan: Item Trash sengaja dibuat non-stackable untuk memberikan beban inventory bagi perampok di Red Zone.*