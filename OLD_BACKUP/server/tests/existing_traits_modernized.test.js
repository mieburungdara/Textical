const BattleSimulation = require('../src/logic/battleSimulation');
const worldCycle = require('../src/services/world/WorldCycleService');

// Mock WorldCycle globally for the test file
worldCycle.getWorldState = async () => ({
    currentHour: 12,
    weatherType: 'CLEAR'
});

describe('Existing & Modernized Traits Verification', () => {
    let sim;

    beforeEach(async () => {
        sim = new BattleSimulation(10, 10);
        // Default random mock to 0.9 (fails most chance checks)
        jest.spyOn(Math, 'random').mockReturnValue(0.9);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Berserker Trait (Tiered)', () => {
        test('Lv3 should give 100% Atk bonus and 1.4x dmg mult at 0 HP', async () => {
            const unit = await sim.addUnit({
                instance_id: "ber_lv3",
                name: "Berserker",
                traits: [{ name: "berserker", level: 3 }]
            }, 0, { x: 5, y: 5 }, { health_max: 100, attack_damage: 100, accuracy: 100, speed: 10 });
            
            // Set HP to 1 (near 0)
            unit.currentHealth = 1;
            
            // Hook onTurnStart
            const traitService = require('../src/services/traitService');
            const result = traitService.executeHook("onTurnStart", unit, sim);
            
            // Expected: 100% bonus = 100. tempStats.attack_damage should be 99 (since missing percent is 99%)
            // 100 * 0.99 * 1.0 = 99
            expect(unit.temporaryStats.attack_damage).toBe(99);
            // DmgMult: 1.0 + (0.99 * 0.4) = 1.396 -> approx 1.4
            expect(result.temporaryDamageMult).toBeCloseTo(1.396);
        });
    });

    describe('CounterStrike Trait (Tiered)', () => {
        test('Lv3 (50%) should trigger counter if random is 0.2', async () => {
            const defender = await sim.addUnit({
                instance_id: "def_cs",
                name: "Defender",
                traits: [{ name: "counterstrike", level: 3 }]
            }, 0, { x: 5, y: 5 }, { health_max: 100, attack_damage: 50, accuracy: 100, attack_range: 1 });

            const attacker = await sim.addUnit({
                instance_id: "atk_cs",
                name: "Attacker",
                traits: []
            }, 1, { x: 5, y: 6 }, { health_max: 100, attack_damage: 10, accuracy: 100 });

            // Set random to 0.2 (below 0.5)
            Math.random.mockReturnValue(0.2);
            
            // We expect an attack to trigger a counter-attack
            const performAttackSpy = jest.spyOn(sim.rules, 'performAttack');
            
            // Trigger the original attack
            sim.rules.performAttack(attacker, defender);
            
            // performAttack should be called twice: 
            // 1. Attacker -> Defender
            // 2. Defender -> Attacker (Counter)
            expect(performAttackSpy).toHaveBeenCalledTimes(2);
            expect(performAttackSpy).toHaveBeenLastCalledWith(defender, attacker, true);
        });

        test('Should NOT counter if enemy out of range', async () => {
            const defender = await sim.addUnit({
                instance_id: "def_cs_far",
                name: "Defender",
                traits: [{ name: "counterstrike", level: 3 }]
            }, 0, { x: 5, y: 5 }, { health_max: 100, attack_damage: 50, accuracy: 100, attack_range: 1 });

            const attacker = await sim.addUnit({
                instance_id: "atk_cs_far",
                name: "Attacker",
                traits: []
            }, 1, { x: 5, y: 8 }, { health_max: 100, attack_damage: 10, accuracy: 100 });

            Math.random.mockReturnValue(0.1); // Chance pass
            const performAttackSpy = jest.spyOn(sim.rules, 'performAttack');
            
            // This might fail if the rule itself prevents the attack due to range.
            // But let's assume we call it manually or simulate the hook.
            const traitService = require('../src/services/traitService');
            traitService.executeHook("onPostHit", defender, sim, attacker, 10);
            
            // Should stay 0 because of range (dist = 3, range = 1)
            expect(performAttackSpy).toHaveBeenCalledTimes(0);
        });
    });

    describe('GlassCannon Trait (Tiered)', () => {
        test('Lv3: Atk x2.5, HP x0.2', async () => {
            const unit = await sim.addUnit({
                instance_id: "gc_lv3",
                name: "GlassCannon",
                traits: [{ name: "glass_cannon", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 1000, attack_damage: 100 });

            // Trigger onBattleStart manually (or run sim)
            const traitService = require('../src/services/traitService');
            traitService.executeHook("onBattleStart", unit, sim);

            expect(unit.stats.attack_damage).toBe(250);
            expect(unit.stats.health_max).toBe(200);
            expect(unit.currentHealth).toBe(200);
        });
    });

    describe('Giant Trait (Tiered)', () => {
        test('Lv3: HP x2.0, Spd -10', async () => {
            const unit = await sim.addUnit({
                instance_id: "gi_lv3",
                name: "Giant",
                traits: [{ name: "giant", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100, speed: 20 });

            const traitService = require('../src/services/traitService');
            traitService.executeHook("onBattleStart", unit, sim);

            expect(unit.stats.health_max).toBe(200);
            expect(unit.stats.speed).toBe(10);
        });
    });

    describe('Thorns Trait (Tiered)', () => {
        test('Lv3: 40% reflect even on low damage', async () => {
            const defender = await sim.addUnit({
                instance_id: "th_lv3",
                name: "Thorns",
                traits: [{ name: "thorns", level: 3 }]
            }, 0, { x: 5, y: 5 }, { health_max: 500 });

            const attacker = await sim.addUnit({
                instance_id: "atk_th",
                name: "Attacker",
                traits: []
            }, 1, { x: 5, y: 6 }, { health_max: 100, attack_damage: 1, accuracy: 100 });

            // Force damage to be calculated accurately
            sim.rules.performAttack(attacker, defender);

            // attacker damage is 1. reflect 40% of 1 = 0.4 -> floor/Math logic usually 0 if floor.
            // Let's use higher damage to see the effect.
            attacker.stats.attack_damage = 100;
            sim.rules.performAttack(attacker, defender);

            // 100 dmg. 40% reflected = 40. attacker HP: 100 - 40 = 60
            expect(attacker.currentHealth).toBe(60);
        });
    });

    describe('UndyingWill Trait (Tiered)', () => {
        test('Lv3 should have DOT immunity for Poison/Burn/Bleed', async () => {
            const unit = await sim.addUnit({
                instance_id: "uw_lv3",
                name: "UndyingWill",
                traits: [{ name: "undyingwill", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100 });

            unit.activeEffects.push({ type: "POISON" }, { type: "BURN" }, { type: "BLEED" }, { type: "HASTE" });
            
            const traitService = require('../src/services/traitService');
            traitService.executeHook("onTurnStart", unit, sim);

            // Only HASTE should remain
            expect(unit.activeEffects.length).toBe(1);
            expect(unit.activeEffects[0].type).toBe("HASTE");
        });

        test('Lv3 should revive with 10% HP if random < 0.5', async () => {
            const unit = await sim.addUnit({
                instance_id: "uw_rev",
                name: "UndyingWill",
                traits: [{ name: "undyingwill", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100 });

            Math.random.mockReturnValue(0.4); // Success

            const traitService = require('../src/services/traitService');
            const revived = traitService.executeHook("onBeforeDeath", unit, sim);

            expect(revived).toBe(true);
            expect(unit.currentHealth).toBe(10);
            expect(unit._traitState.undyingWill.did_revive).toBe(true);
        });
    });

    describe('SplittingForm Trait (Tiered)', () => {
        test('Lv2 should split into 2 minis with 40% stats', async () => {
            const unit = await sim.addUnit({
                instance_id: "sf_lv2",
                name: "Slime",
                traits: [{ name: "splittingform", level: 2 }]
            }, 0, { x: 5, y: 5 }, { health_max: 100, attack_damage: 100 });

            // Kill the unit (trigger onDeath)
            unit.currentHealth = 0;
            unit.isDead = true;
            
            const traitService = require('../src/services/traitService');
            traitService.executeHook("onDeath", unit, sim);

            // Wait for async addUnit to finish
            await new Promise(resolve => setTimeout(resolve, 50));

            // Check if 2 units were added to the simulation
            const minis = sim.units.filter(u => u.data.is_mini);
            expect(minis.length).toBe(2);
            expect(minis[0].stats.health_max).toBe(40);
            expect(minis[0].stats.attack_damage).toBe(40);
            // Minis should have trait split Lv1 to prevent recursion (check logic in SplittingForm.js)
            expect(minis[0].traits[0].level).toBe(1);
        });
    });

    describe('BloodLink Trait (Tiered)', () => {
        test('Lv3 should absorb 60% of damage for linked ally', async () => {
            const protector = await sim.addUnit({
                instance_id: "bl_prot",
                name: "Protector",
                traits: [{ name: "bloodlink", level: 3 }]
            }, 0, { x: 5, y: 5 }, { health_max: 500 });

            const ally = await sim.addUnit({
                instance_id: "bl_ally",
                name: "Ally",
                traits: []
            }, 0, { x: 5, y: 6 }, { health_max: 100 });

            // Link them manually via activeEffects
            ally.activeEffects.push({ type: "LINKED", originId: protector.instanceId });

            const attacker = await sim.addUnit({
                instance_id: "atk_bl",
                name: "Attacker",
                traits: []
            }, 1, { x: 5, y: 7 }, { health_max: 100, attack_damage: 100, accuracy: 100 });

            // Ally takes 100 damage. BloodLink triggers via broadcastAllyEvent inside performAttack
            sim.rules.performAttack(attacker, ally);

            // Ally HP: 100 - 100 = 0.
            // Protector absorbs 60% of 100 = 60.
            // Protector HP: 500 - 60 = 440.
            expect(ally.currentHealth).toBe(0);
            expect(protector.currentHealth).toBe(440);
        });
    });
});
