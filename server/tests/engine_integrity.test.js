const BattleSimulation = require('../src/logic/battleSimulation');

/**
 * AAA Engine Integrity Stress Test
 * Designed to catch "Cannot read property of undefined" and other crash-vulnerabilities.
 */
describe('Textical Engine Integrity', () => {
    
    test('Should handle units with missing traits or race without crashing', () => {
        const sim = new BattleSimulation(50, 50);
        
        // Spawning unit with NULL traits and race
        const unit = sim.addUnit({
            instance_id: "broken_unit",
            name: "The Glitch",
            race: null,
            traits: null,
            skills: []
        }, 0, { x: 10, y: 10 }, { health_max: 100, speed: 10, defense: 5 });

        expect(() => {
            sim.processTick();
        }).not.toThrow();
    });

    test('Should handle AOE skills targeting edges of the map', () => {
        const sim = new BattleSimulation(50, 50);
        const unit = sim.addUnit({ name: "Caster", skills: [] }, 0, { x: 0, y: 0 }, { health_max: 100, mana_max: 100 });
        
        const bigAoeSkill = {
            id: 999,
            name: "Supernova",
            aoe_pattern: "SQUARE",
            aoe_size: 10,
            damage_multiplier: 1.0
        };

        expect(() => {
            // Cast on corner (0,0) with large AOE
            sim.rules.performSkill(unit, bigAoeSkill, { x: 0, y: 0 });
        }).not.toThrow();
    });

    test('Should handle simultaneous deaths and adjacency sensing', () => {
        const sim = new BattleSimulation(50, 50);
        
        // Two units with Thorns killing each other
        const u1 = sim.addUnit({ name: "Thorn 1", traits: ["thorns"] }, 0, { x: 25, y: 25 }, { health_max: 1, attack_damage: 100 });
        const u2 = sim.addUnit({ name: "Thorn 2", traits: ["thorns"] }, 1, { x: 25, y: 26 }, { health_max: 1, attack_damage: 100 });

        expect(() => {
            sim.rules.performAttack(u1, u2);
            sim.rules.resolveDeaths();
        }).not.toThrow();
    });

    test('Should handle null targets in AI decision loop', () => {
        const sim = new BattleSimulation(50, 50);
        const loneUnit = sim.addUnit({ name: "Lonely" }, 0, { x: 10, y: 10 }, { health_max: 100, speed: 10 });

        expect(() => {
            sim.ai.decideAction(loneUnit);
        }).not.toThrow();
    });
});
