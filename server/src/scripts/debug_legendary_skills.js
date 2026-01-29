const BattleSimulation = require('../logic/battleSimulation');
const traitService = require('../services/traitService');

async function runLegendaryAudit() {
    console.log("--------------------------------------------------");
    console.log("🌟 STARTING LEGENDARY SKILL AUDIT");
    console.log("--------------------------------------------------\n");

    const sim = new BattleSimulation(50, 50, "FOREST");

    // 1. Setup Units
    const hero = sim.addUnit({ 
        instance_id: "h1", name: "Kaelthas", traits: ["bloodlink", "arcanemaster"], team: 0 
    }, 0, {x:25, y:25}, {health_max:200, attack_damage:10, speed:100});

    const ally = sim.addUnit({ 
        instance_id: "a1", name: "Fragile Mage", team: 0 
    }, 0, {x:24, y:25}, {health_max:50, attack_damage:5, speed:0});

    const enemy = sim.addUnit({ 
        instance_id: "e1", name: "Giant Golem", team: 1 
    }, 1, {x:30, y:25}, {health_max:500, attack_damage:50, speed:0});

    sim.units.forEach(u => traitService.executeHook("onBattleStart", u, sim));

    // --- TEST 1: SHADOW FLICKER ---
    console.log("[1/4] Testing Shadow Flicker (Teleport)...");
    sim.logger.startTick(1);
    sim.rules.performSkill(hero, { name: "Shadow Flicker", mana_cost: 0 }, {x:29, y:25});
    sim.logger.commitTick(sim.units);
    console.log(`   Result: Position: [${hero.gridPos.x}, ${hero.gridPos.y}] | Stealthed: ${hero.isStealthed}`);

    // --- TEST 2: BLOOD LINK ---
    console.log("\n[2/4] Testing Blood Link (Damage Sharing)...");
    sim.logger.startTick(2);
    sim.rules.performSkill(hero, { name: "Blood Link", mana_cost: 0 }, {x:24, y:25});
    sim.rules.performAttack(enemy, ally); // Should trigger sharing
    sim.logger.commitTick(sim.units);
    console.log(`   Ally HP: ${ally.currentHealth} | Protector HP: ${hero.currentHealth}`);

    // --- TEST 3: GRAVITY ANCHOR ---
    console.log("\n[3/4] Testing Gravity Anchor (AP Drain)...");
    sim.logger.startTick(3);
    enemy.modifyAP(90, sim);
    sim.rules.performSkill(hero, { name: "Gravity Anchor", mana_cost: 0 }, {x:30, y:25});
    sim.logger.commitTick(sim.units);
    console.log(`   Enemy AP after Drain: ${enemy.currentActionPoints}`);

    // --- TEST 4: CHAIN OVERLOAD ---
    console.log("\n[4/4] Testing Chain Overload (Synergy)...");
    sim.logger.startTick(4);
    const Wet = require('../logic/status/definitions/Wet');
    enemy.applyEffect(new Wet(3), sim);
    sim.rules.performSkill(hero, { name: "Chain Overload", damage_multiplier: 1.0, mana_cost: 0 }, {x:30, y:25});
    sim.logger.commitTick(sim.units);

    console.log("\n--- ENGINE EVENT LOGS ---");
    sim.logger.getLogs().forEach(tick => {
        tick.events.forEach(e => {
            console.log(`   [T${tick.tick}] [${e.type}] ${e.msg}`);
        });
    });

    console.log("\nLegendary Audit Complete.");
}

runLegendaryAudit();