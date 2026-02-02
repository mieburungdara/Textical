/**
 * AAA ShortageDetector
 * Pure logic for identifying regional stock shortages.
 */
class ShortageDetector {
    constructor() {
        this.SHORTAGE_THRESHOLD = 0.20; // 20%
    }

    /**
     * Scans ShopStock records and returns items in shortage.
     * @param {Array} stockRecords - List of ShopStock entries.
     * @returns {Array} List of shortages with severity.
     */
    detect(stockRecords) {
        return stockRecords
            .filter(s => {
                const ratio = s.quantity / s.maxQuantity;
                return ratio <= this.SHORTAGE_THRESHOLD;
            })
            .map(s => ({
                npcId: s.npcId,
                regionId: s.regionId,
                templateId: s.templateId,
                currentQty: s.quantity,
                maxQty: s.maxQuantity,
                shortageQty: s.maxQuantity - s.quantity,
                severity: 1 - (s.quantity / s.maxQuantity) // 1.0 = completely empty
            }));
    }
}

module.exports = new ShortageDetector();
