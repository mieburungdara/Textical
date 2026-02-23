const BattleSimulation = require('../logic/battleSimulation');
const CheckTerrain = require('../logic/bt/nodes/conditions/CheckTerrain');
const CheckTrait = require('../logic/bt/nodes/conditions/CheckTrait');
const NearbyUnitsCount = require('../logic/bt/nodes/conditions/NearbyUnitsCount');
const b3 = require('behavior3js');

async function testEnvironmentConditions() {
    console.log("--------------------------------------------------");
    console.log("🔍 STARTING ENVIRONMENT & IDENTITY DEBUG TEST");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "VOLCANO");
    sim.logger.startTick(1);

    // 1. Setup Subject
    const hero = sim.addUnit({
        instance_id: "hero", name: "Fire Walker", race: "elf",
        traits: ["giant"], team: 0, pos: {x:25, y:25}
    }, 0, {x:25, y:25}, {health_max:100, speed:10});

    // 2. Setup Neighbors
    sim.addUnit({ instance_id: "mob1", name: "Imp A", team: 1, pos: {x:26, y:25} }, 1, {x:26, y:25}, {health_max:50});
    sim.addUnit({ instance_id: "mob2", name: "Imp B", team: 1, pos: {x:24, y:25} }, 1, {x:24, y:25}, {health_max:50});

    // 3. Setup Context
    const blackboard = new b3.Blackboard();
    blackboard.set('context', { unit: hero, sim: sim });
    const tick = { blackboard, tree: { id: 'test-tree' } };

    const runCheck = (NodeClass, name, props) => {
        const node = new NodeClass({ properties: props });
        node.initialize({ properties: props });
        const result = node.tick(tick);
        console.log(`   > ${name.padEnd(25)} | Result: ${result === b3.SUCCESS ? "TRUE" : "FALSE"}`);
    };

    // --- TEST TERRAIN ---
    console.log("[1/3] Testing Terrain Sensing...");
    runCheck(CheckTerrain, "Is on VOLCANO?", { terrainType: 'VOLCANO' });
    runCheck(CheckTerrain, "Is on FOREST?", { terrainType: 'FOREST' });

    // --- TEST TRAITS ---
    console.log("\n[2/3] Testing Identity (Traits)...");
    runCheck(CheckTrait, "Has 'Giant' trait?", { traitName: 'giant' });
    runCheck(CheckTrait, "Has 'Elf' race?", { traitName: 'elf' });
    runCheck(CheckTrait, "Has 'Vampire'?", { traitName: 'vampire' });

    // --- TEST SURROUNDINGS ---
    console.log("\n[3/3] Testing Proximity Sensing...");
    runCheck(NearbyUnitsCount, "Enemies nearby >= 2?", { range: 1, team: 'OTHER', minCount: 2 });
    runCheck(NearbyUnitsCount, "Allies nearby >= 1?", { range: 1, team: 'SAME', minCount: 1 });

    console.log("\n--- ENGINE TRACE LOGS ---");
    sim.logger.commitTick(sim.units);
    const logs = sim.logger.getLogs();
    logs[0].events.filter(e => e.msg.includes("[AI_TRACE]")).forEach(e => {
        console.log(`   LOG: ${e.msg}`);
    });

    console.log("\nEnvironmental Audit Complete.");
}

testEnvironmentConditions().catch(err => console.error(err));
