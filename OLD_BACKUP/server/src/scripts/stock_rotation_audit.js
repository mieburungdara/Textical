const engine = require('../logic/economy/StockRotationEngine');

async function runStockRotationAudit() {
    console.log("--------------------------------------------------");
    console.log("🔄 STARTING STOCK ROTATION AUDIT");
    console.log("--------------------------------------------------\n");

    const npcTrader = {
        id: 101,
        shopItems: [
            { item: { id: 2101, category: "MATERIAL", name: "Iron Ore" }, stock: 20 },
            { item: { id: 7001, category: "EQUIPMENT", name: "Bronze Sword" }, stock: 10 }
        ]
    };

    const regionMine = {
        id: 2, name: "Iron Mine", dangerLevel: 2, zoneType: "GREEN",
        resources: [{ itemId: 2101 }]
    };

    // 1. Test Rotation
    console.log("[1/1] Testing rotation in Iron Mine...");
    const rotated = engine.rotateStock(npcTrader, regionMine);

    console.log(`   Items Rotated: ${rotated.length}`);
    rotated.forEach(s => {
        console.log(`      Item: ${s.templateId} | Qty: ${s.quantity}`);
    });

    // Iron Ore: 20 * 1.5 = 30
    // Sword: 10 * 1.0 = 10
    const oreStock = rotated.find(s => s.templateId === 2101).quantity;
    const swordStock = rotated.find(s => s.templateId === 7001).quantity;

    // VERDICT
    if (oreStock === 30 && swordStock === 10) {
        console.log("\n🌟 FINAL VERDICT: STOCK ROTATION LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: ROTATION LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runStockRotationAudit().catch(err => console.error(err));
