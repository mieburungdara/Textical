const BattleSimulation = require('../src/logic/battleSimulation');
const worldCycle = require('../src/services/world/WorldCycleService');

// Mock WorldCycle globally for the test file
worldCycle.getWorldState = async () => ({
    currentHour: 12,
    weatherType: 'CLEAR'
});

describe('Tiered Traits Verification', () => {
    let sim;

    beforeEach(async () => {
        sim = new BattleSimulation(10, 10);
        jest.spyOn(Math, 'random').mockReturnValue(0.9);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('LifeSteal Tiered Scaling', () => {
        test('Level 1 should heal 15%', async () => {
            const unit = await sim.addUnit({
                instance_id: "ls_lv1",
                name: "LS Lv1",
                traits: [{ name: "lifesteal", level: 1 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const victim = await sim.addUnit({
                instance_id: "ls_dummy",
                name: "Dummy",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 500, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            unit.currentHealth = 50;
            sim.rules.performAttack(unit, victim);
            
            // 15% of 100 = 15. 50 + 15 = 65
            expect(unit.currentHealth).toBe(65);
        });

        test('Level 2 should heal 30%', async () => {
            const unit = await sim.addUnit({
                instance_id: "ls_lv2",
                name: "LS Lv2",
                traits: [{ name: "lifesteal", level: 2 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const victim = await sim.addUnit({
                instance_id: "ls_dummy_2",
                name: "Dummy",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 500, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            unit.currentHealth = 50;
            sim.rules.performAttack(unit, victim);
            
            // 30% of 100 = 30. 50 + 30 = 80
            expect(unit.currentHealth).toBe(80);
        });

        test('Level 3 should heal 50%', async () => {
            const unit = await sim.addUnit({
                instance_id: "ls_lv3",
                name: "LS Lv3",
                traits: [{ name: "lifesteal", level: 3 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const victim = await sim.addUnit({
                instance_id: "ls_dummy_3",
                name: "Dummy",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 500, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            unit.currentHealth = 40;
            sim.rules.performAttack(unit, victim);
            
            // 50% of 100 = 50. 40 + 50 = 90
            expect(unit.currentHealth).toBe(90);
        });

        test('Highest Win: Trait Lv1 (15%) vs Stat (40%) -> Should heal 40%', async () => {
            const unit = await sim.addUnit({
                instance_id: "ls_highest",
                name: "LS Highest",
                traits: [{ name: "lifesteal", level: 1 }],
                facing: "SOUTH"
            }, 0, { x: 5, y: 5 }, { 
                health_max: 100, 
                attack_damage: 100, 
                lifesteal_base: 0.40, 
                crit_chance: 0,
                accuracy: 100 
            });
            
            const victim = await sim.addUnit({
                instance_id: "ls_dummy_4",
                name: "Dummy",
                traits: [],
                facing: "NORTH"
            }, 1, { x: 5, y: 6 }, { 
                health_max: 500, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            unit.currentHealth = 40;
            sim.rules.performAttack(unit, victim);
            
            // max(15%, 40%) = 40%. 40% of 100 = 40. 40 + 40 = 80
            expect(unit.currentHealth).toBe(80);
        });
    });

    describe('Vanguard Tiered Scaling', () => {
        test('Level 1 should absorb 30%', async () => {
            const v = await sim.addUnit({
                instance_id: "v_lv1",
                name: "V Lv1",
                traits: [{ name: "vanguard", level: 1 }]
            }, 0, { x: 5, y: 5 }, { 
                health_max: 200, 
                defense: 0, 
                crit_chance: 0,
                accuracy: 100 
            });

            const ally = await sim.addUnit({
                instance_id: "ally_1",
                name: "Ally",
                traits: []
            }, 0, { x: 5, y: 6 }, { 
                health_max: 100, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            const attacker = await sim.addUnit({
                instance_id: "atk_1",
                name: "Atk",
                traits: []
            }, 1, { x: 5, y: 7 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });

            sim.rules.performAttack(attacker, ally);

            // Damage 100. Absorb 30% = 30. Remaining = 70.
            expect(v.currentHealth).toBe(170); // 200 - 30
            expect(ally.currentHealth).toBe(30); // 100 - 70
        });

        test('Level 2 should absorb 50%', async () => {
            const v = await sim.addUnit({
                instance_id: "v_lv2",
                name: "V Lv2",
                traits: [{ name: "vanguard", level: 2 }]
            }, 0, { x: 5, y: 5 }, { 
                health_max: 200, 
                defense: 0, 
                crit_chance: 0,
                accuracy: 100 
            });

            const ally = await sim.addUnit({
                instance_id: "ally_2",
                name: "Ally",
                traits: []
            }, 0, { x: 5, y: 6 }, { 
                health_max: 100, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            const attacker = await sim.addUnit({
                instance_id: "atk_2",
                name: "Atk",
                traits: []
            }, 1, { x: 5, y: 7 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });

            sim.rules.performAttack(attacker, ally);

            // Damage 100. Absorb 50% = 50. Remaining = 50.
            expect(v.currentHealth).toBe(150); // 200 - 50
            expect(ally.currentHealth).toBe(50); // 100 - 50
        });

        test('Level 3 should absorb 70%', async () => {
            const v = await sim.addUnit({
                instance_id: "v_lv3",
                name: "V Lv3",
                traits: [{ name: "vanguard", level: 3 }]
            }, 0, { x: 5, y: 5 }, { 
                health_max: 200, 
                defense: 0, 
                crit_chance: 0,
                accuracy: 100 
            });

            const ally = await sim.addUnit({
                instance_id: "ally_3",
                name: "Ally",
                traits: []
            }, 0, { x: 5, y: 6 }, { 
                health_max: 100, 
                defense: 0, 
                crit_chance: 0,
                dodge_rate: 0 
            });

            const attacker = await sim.addUnit({
                instance_id: "atk_3",
                name: "Atk",
                traits: []
            }, 1, { x: 5, y: 7 }, { 
                health_max: 100, 
                attack_damage: 100, 
                crit_chance: 0,
                accuracy: 100 
            });

            sim.rules.performAttack(attacker, ally);

            // Damage 100. Absorb 70% = 70. Remaining = 30.
            expect(v.currentHealth).toBe(130); // 200 - 70
            expect(ally.currentHealth).toBe(70); // 100 - 30
        });
    });
});
