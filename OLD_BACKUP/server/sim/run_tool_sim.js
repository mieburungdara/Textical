const OracleRunner = require('./OracleRunner');
const factory = require('./OracleFactory');
const prisma = require('../src/db');

async function runToolSim() {
    console.log("==================================================");
    console.log("⚒️  ELDORIA TOOL-PROGRESSION SIMULATION");
    console.log("==================================================");

    const BOT_COUNT = 5;
    const SIM_HOURS = 50;

    await factory.cleanupBots();

    console.log(`🤖 Spawning ${BOT_COUNT} crafter bots...`);
    const bots = await factory.spawnBots(BOT_COUNT);

    const runner = new OracleRunner(bots);

    for (let hour = 1; hour <= SIM_HOURS; hour++) {
        await runner.runHour(hour);
        
        // AAA: Progress Check
        if (hour % 5 === 0 || hour === SIM_HOURS) {
            console.log(`\n📢 SNAPSHOT HOUR ${hour}: Checking tool tiers...`);
            for (const bot of bots) {
                const user = await prisma.user.findUnique({
                    where: { id: bot.userId },
                    include: { inventory: { include: { template: true, equippedIn: true } } }
                });
                const tools = user.inventory.filter(i => (i.template.category === "PICKAXE" || i.template.category === "AXE") && i.equippedIn);
                const tiers = tools.map(t => `${t.template.name} (T${t.template.toolTier})`).join(", ");
                console.log(`   👤 ${user.username}: [${tiers || 'No Tools Equipped'}]`);
            }
        }
    }

    console.log("\n==================================================");
    console.log("🌟 TOOL-PROGRESSION SIMULATION COMPLETE");
    console.log("==================================================");
    process.exit(0);
}

runToolSim().catch(e => {
    console.error(e);
    process.exit(1);
});