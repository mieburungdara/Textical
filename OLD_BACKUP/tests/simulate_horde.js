const battleService = require('./server/src/services/battleService');
const prisma = require('./server/src/db');
const { execSync } = require('child_process');
const path = require('path');

/**
 * HORDE SIMULATOR CLI
 * Usage: node simulate_horde.js <userId> <monsterId1,monsterId2,...>
 * Example: node simulate_horde.js 1 6004,6004,6004
 */

async function run() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("Usage: node simulate_horde.js <userId> <monsterId1,monsterId2,...>");
        process.exit(1);
    }

    const userId = parseInt(args[0]);
    const monsterIds = args[1].split(',').map(id => parseInt(id.trim()));

    console.log(`\n⚔️  Starting Horde Simulation...`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`👾 Monsters: ${monsterIds.length} units (${monsterIds.join(', ')})`);

    try {
        // 1. Run the simulation
        const result = await battleService.startHordeBattle(userId, monsterIds);
        
        console.log(`\n🏁 Simulation Finished!`);
        console.log(`🏆 Result: ${result.result}`);
        console.log(`💾 View Replay: replays/view_${result.battleId}.json`);
        console.log(`💾 Debug Replay: replays/debug_${result.battleId}.json`);

        // 2. Automatically run the Python Audit Tool on the DEBUG file
        console.log(`\n🛡️  Running Replay Analyzer on Debug Data...`);
        const debugPath = path.join('replays', `debug_${result.battleId}.json`);
        
        try {
            const auditOutput = execSync(`python analyze_replay.py ${debugPath}`, { encoding: 'utf-8' });
            console.log(auditOutput);
        } catch (auditErr) {
            console.error("❌ Audit Tool failed to run:");
            console.log(auditErr.stdout || auditErr.message);
        }

    } catch (err) {
        console.error("\n❌ Simulation Error:");
        console.error(err.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();