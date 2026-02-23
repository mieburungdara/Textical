const resolver = require('../../sim/OracleProgressionResolver');

async function runProgressionAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING PROGRESSION LOGIC AUDIT");
    console.log("--------------------------------------------------\n");

    const region = { visualType: "TOWN", zoneType: "GREEN" };

    // 1. Fresh Bot (Level 1, 0 Silver, No Items)
    const ctx1 = { level: 1, silver: 0, inventoryCount: 0, items: [] };
    const goal1 = resolver.resolveGoal(ctx1);
    console.log(`[1/3] Poor Fresh Bot Goal: ${goal1} (Expected: EARN_SILVER)`);

    // 2. Ready to Craft (Level 1, 1000 Silver, Has Iron)
    const ctx2 = { 
        level: 1, silver: 1000, inventoryCount: 1, 
        items: [{ template: { name: "Iron Ingot", category: "MATERIAL" }, quantity: 10, equippedIn: null }]
    };
    const goal2 = resolver.resolveGoal(ctx2);
    console.log(`[2/3] Material-Ready Bot Goal: ${goal2} (Expected: CRAFT_GEAR)`);

    // 3. Fully Geared (Level 5, 1000 Silver, Has Weapon)
    const ctx3 = { 
        level: 5, silver: 1000, inventoryCount: 1, 
        items: [{ template: { name: "Iron Sword", category: "EQUIPMENT" }, quantity: 1, equippedIn: { slot: "MAIN_HAND" } }]
    };
    const goal3 = resolver.resolveGoal(ctx3);
    const action3 = resolver.resolveActionForGoal(goal3, region);
    console.log(`[3/3] Geared Bot Action: ${action3} (Expected: GATHER - Safe XP in Green)`);

    // VERDICT
    if (goal1 === "EARN_SILVER" && goal2 === "CRAFT_GEAR" && action3 === "GATHER") {
        console.log("\n🌟 FINAL VERDICT: PROGRESSION LOGIC PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runProgressionAudit().catch(err => console.error(err));
