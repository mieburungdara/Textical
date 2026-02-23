const BattleSimulation = require('../src/logic/battleSimulation');
const worldCycle = require('../src/services/world/WorldCycleService');

// Mock WorldCycle
worldCycle.getWorldState = async () => ({ currentHour: 12, weatherType: 'CLEAR' });

describe('Hidden Legacy Traits Verification', () => {
    let sim;

    beforeEach(async () => {
        sim = new BattleSimulation(10, 10);
    });

    describe('Adrenaline Trait (Tiered)', () => {
        test('Lv3: 200% bonus damage at ~0 HP (100% missing)', async () => {
            const unit = await sim.addUnit({
                instance_id: "adr_lv3",
                name: "Berserker",
                traits: [{ name: "adrenaline", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100 });

            unit.currentHealth = 1; // 99% missing
            const traitService = require('../src/services/traitService');
            const result = traitService.executeHook("onPreAttack", unit, sim, null);
            
            // 1.0 + (0.99 * 2.0) = 2.98
            expect(result.dmgMult).toBeCloseTo(2.98);
        });
    });

    describe('Executioner Trait (Tiered)', () => {
        test('Lv3: +60% DMG if target < 50% HP', async () => {
            const attacker = await sim.addUnit({
                instance_id: "exe_atk",
                name: "Executioner",
                traits: [{ name: "executioner", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100 });

            const target = await sim.addUnit({
                instance_id: "exe_tgt",
                name: "Victim",
                traits: []
            }, 1, { x: 1, y: 2 }, { health_max: 100 });

            target.currentHealth = 40; // < 50%
            const traitService = require('../src/services/traitService');
            const result = traitService.executeHook("onPreAttack", attacker, sim, target);
            
            expect(result.dmgMult).toBe(1.6);
        });
    });

    describe('ReflectiveSpikes Trait (Tiered)', () => {
        test('Lv3: 50% true damage reflection', async () => {
            const defender = await sim.addUnit({
                instance_id: "ref_def",
                name: "Spiky",
                traits: [{ name: "reflectivespikes", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 500 });

            const attacker = await sim.addUnit({
                instance_id: "ref_atk",
                name: "Hammer",
                traits: []
            }, 1, { x: 1, y: 2 }, { health_max: 100, attack_damage: 100, accuracy: 100 });

            sim.rules.performAttack(attacker, defender);

            // 100 damage. 50% reflected = 50. attacker HP: 100 - 50 = 50
            expect(attacker.currentHealth).toBe(50);
        });
    });

    describe('SecondWind Trait (Tiered)', () => {
        test('Lv3: Heal 60% if HP < 35%', async () => {
            const unit = await sim.addUnit({
                instance_id: "sw_lv3",
                name: "Windy",
                traits: [{ name: "secondwind", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100, attack_damage: 10 });

            unit.currentHealth = 30; // < 35%
            const traitService = require('../src/services/traitService');
            // Trigger onPostHit
            traitService.executeHook("onPostHit", unit, sim, null, 10);
            
            // 30 + 60 = 90
            expect(unit.currentHealth).toBe(90);
            expect(unit._traitState.secondWind.used).toBe(true);
        });
    });
});
