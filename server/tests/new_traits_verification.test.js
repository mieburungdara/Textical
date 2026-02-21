const BattleSimulation = require('../src/logic/battleSimulation');
const worldCycle = require('../src/services/world/WorldCycleService');

// Mock WorldCycle globally for the test file
worldCycle.getWorldState = async () => ({
    currentHour: 12,
    weatherType: 'CLEAR'
});

describe('New Traits Verification', () => {
    let sim;

    beforeEach(async () => {
        sim = new BattleSimulation(10, 10);
        // Use a deterministic random value that normally fails hit/crit unless bonuses apply
        jest.spyOn(Math, 'random').mockReturnValue(0.9);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Adrenaline Trait', () => {
        test('Lv2 should double damage at 0 HP (hypothetical edge case)', async () => {
            const unit = await sim.addUnit({
                instance_id: "adr_lv2",
                name: "Adrenaline Unit",
                traits: [{ name: "adrenaline", level: 2 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const victim = await sim.addUnit({
                instance_id: "victim",
                name: "Victim",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 500, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            // Set HP to 1 (99% missing)
            unit.currentHealth = 1;
            sim.rules.performAttack(unit, victim);
            
            // Expected: 1.0 + (0.99 * 1.0) = 1.99x DMG. 100 * 1.99 = 199 damage.
            // Victim HP: 500 - 199 = 301
            expect(victim.currentHealth).toBe(301);
        });
    });

    describe('Executioner Trait', () => {
        test('Lv3 should give +60% DMG if target <50% HP', async () => {
            const unit = await sim.addUnit({
                instance_id: "exe_lv3",
                name: "Executioner Unit",
                traits: [{ name: "executioner", level: 3 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const victim = await sim.addUnit({
                instance_id: "victim_low",
                name: "Victim Low",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 200, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            // Set victim HP to 80 (40% of 200, so < 50%)
            victim.currentHealth = 80;
            sim.rules.performAttack(unit, victim);
            
            // Expected: +60% DMG = 160 dmg. 80 - 160 = -80 (0 capped in takeDamage/isDead check)
            expect(victim.currentHealth).toBe(0);
        });
    });

    describe('Reflective Spikes Trait', () => {
        test('Lv2 should reflect 30% of damage', async () => {
            const unit = await sim.addUnit({
                instance_id: "ref_lv2",
                name: "Reflect Unit",
                traits: [{ name: "reflectivespikes", level: 2 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 500, 
                defense: 0, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const attacker = await sim.addUnit({
                instance_id: "atk",
                name: "Attacker",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });

            sim.rules.performAttack(attacker, unit);
            
            // Attacker deals 100. Unit reflects 30% = 30.
            // Attacker HP: 100 - 30 = 70
            expect(attacker.currentHealth).toBe(70);
        });
    });

    describe('Second Wind Trait', () => {
        test('Lv2 should heal 40% when HP falls below 25%', async () => {
            const unit = await sim.addUnit({
                instance_id: "sw_lv2",
                name: "Second Wind Unit",
                traits: [{ name: "secondwind", level: 2 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 100, 
                defense: 0, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const attacker = await sim.addUnit({
                instance_id: "atk_heavy",
                name: "Heavy Attacker",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 100, 
                attack_damage: 80, 
                crit_chance: 0,
                accuracy: 100 
            });

            // Initial HP 100. After hit 100 - 80 = 20. 20/100 = 20% (< 25%).
            // Second Wind triggers: Heal 40% of 100 = 40. Final HP: 20 + 40 = 60.
            sim.rules.performAttack(attacker, unit);
            
            expect(unit.currentHealth).toBe(60);
            
            // Second trigger check: should not trigger again
            unit.currentHealth = 20;
            sim.rules.performAttack(attacker, unit); // 20 - 80 = 0
            expect(unit.currentHealth).toBe(0);
        });
    });

    describe('Opportunist Trait', () => {
        test('Lv3 should hit and crit from back even with 0 base stats and 0.4 random', async () => {
            const unit = await sim.addUnit({
                instance_id: "opp_lv3",
                name: "Opportunist Unit",
                traits: [{ name: "opportunist", level: 3 }],
                facing: "NORTH"
            }, 0, { x: 5, y: 6 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 0 
            });
            
            const victim = await sim.addUnit({
                instance_id: "victim_back",
                name: "Victim Back",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 5 }, { 
                health_max: 500, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            // Prevent victim from turning around by overriding isReady
            victim.isReady = () => false;

            // Set random for hit check and crit check
            Math.random.mockReturnValueOnce(0.4); // Hit check (0.4 * 100 = 40 < 70)
            Math.random.mockReturnValueOnce(0.4); // Crit check (0.4 < 0.75)
            
            sim.rules.performAttack(unit, victim);
            
            // Expected: Hit Chance 70% (0.4 * 100 = 40 < 70 -> HIT)
            // Expected: Crit Chance 75% (0.4 < 0.75 -> CRIT)
            // Damage: 100 * 1.5 (BACK) * 1.5 (CRIT) = 225
            // victim HP: 500 - 225 = 275
            expect(victim.currentHealth).toBe(275);
        });
    });
});
