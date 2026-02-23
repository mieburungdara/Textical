require('dotenv').config({ path: './server/.env' });
const OracleRunner = require('./OracleRunner');
const factory = require('./OracleFactory');
const prisma = require('../src/db');

async function runIndustrialSim() {
    console.log("==================================================");
    console.log("⚒️  ELDORIA INDUSTRIAL REVOLUTION SIMULATION");
    console.log("==================================================");

    const BOT_COUNT = 10;
    const SIM_HOURS = 100;

    await factory.cleanupBots();

    console.log(`🤖 Spawning ${BOT_COUNT} industrial bots...`);
    const bots = await factory.spawnBots(BOT_COUNT);

    const runner = new OracleRunner(bots);

    for (let hour = 1; hour <= SIM_HOURS; hour++) {
        await runner.runHour(hour);
        
        // AAA: Progress Snapshot every 20 hours
        if (hour % 20 === 0 || hour === SIM_HOURS) {
            console.log(`
📢 SNAPSHOT HOUR ${hour}: Checking industrial output...`);
            for (const bot of bots) {
                const user = await prisma.user.findUnique({
                    where: { id: bot.userId },
                    include: { inventory: { include: { template: true, equippedIn: true } } }
                });
                
                const tools = user.inventory.filter(i => (i.template.category === "PICKAXE" || i.template.category === "AXE") && i.equippedIn);
                const gear = user.inventory.filter(i => (i.template.category === "EQUIPMENT" || i.template.category === "WEAPON" || i.template.category === "ARMOR") && i.equippedIn);
                
                const toolStr = tools.map(t => `${t.template.name} (T${t.template.toolTier})`).join(", ");
                const gearStr = gear.map(g => `${g.template.name}`).join(", ");
                
                console.log(`   👤 ${user.username}:`);
                console.log(`      Tools: [${toolStr || 'None'}]`);
                console.log(`      Gear:  [${gearStr || 'None'}]`);
            }
        }
    }

    console.log("\n==================================================");
    console.log("🌟 INDUSTRIAL REVOLUTION COMPLETE");
    console.log("==================================================");
    process.exit(0);
}

runIndustrialSim().catch(e => {
    console.error(e);
    process.exit(1);
});
