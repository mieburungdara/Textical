/**
 * AAA MarketAnalytics
 * Logic for calculating market trends and pricing benchmarks.
 */
class MarketAnalytics {
    /**
     * Calculates average price and volume for a specific class.
     */
    calculateAverages(historyRecords) {
        if (historyRecords.length === 0) return { avgPrice: 0, volume: 0 };

        const total = historyRecords.reduce((acc, curr) => acc + curr.price, 0);
        const avg = Math.floor(total / historyRecords.length);

        return {
            avgPrice: avg,
            volume: historyRecords.length,
            latestPrice: historyRecords[0].price,
            lowestPrice: Math.min(...historyRecords.map(r => r.price)),
            highestPrice: Math.max(...historyRecords.map(r => r.price))
        };
    }
}

module.exports = new MarketAnalytics();
