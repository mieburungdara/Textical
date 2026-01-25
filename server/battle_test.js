const battleService = require('./src/services/battleService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("--- TESTING BATTLE ENGINE (ROBUST) ---");
    
    // Fetch data using exact model names from schema
    const user = await prisma.user.findFirst();
    const monster = await prisma.monsterTemplate.findFirst();

    if (!user || !monster) {
        console.log("❌ ERROR: Setup data missing. Run seed first.");
        process.exit(1);
    }

    console.log(`Battle Start: ${user.username} vs ${monster.name}`);
    console.log(`Initial Vitality: ${user.vitality}`);

    try {
        const battle = await battleService.startBattle(user.id, monster.id);
        
        console.log("BATTLE LOG SNIPPET:");
        console.log(battle.battleLog.slice(0, 5).join("\n"));
        console.log("...");
        console.log("RESULT:", battle.result);
        console.log("LOOT EARNED:", JSON.stringify(battle.loot));

        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
        console.log(`Vitality after battle: ${updatedUser.vitality} (Expected reduction by 5)`);

        if (updatedUser.vitality === user.vitality - 5) {
            console.log("✅ SUCCESS: Vitality consumed correctly.");
        }
    } catch (e) {
        console.log("❌ BATTLE ERROR:", e.message);
    }

    process.exit();
}

test();