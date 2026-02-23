const BattleSimulation = require('../src/logic/battleSimulation');
const worldCycle = require('../src/services/world/WorldCycleService');

// Mock WorldCycle
worldCycle.getWorldState = async () => ({ currentHour: 12, weatherType: 'CLEAR' });

describe('Final Traits Modernization Verification', () => {
    let sim;

    beforeEach(async () => {
        sim = new BattleSimulation(10, 10);
        jest.spyOn(Math, 'random').mockReturnValue(0.9);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('ArcaneMaster Trait (Tiered)', () => {
        test('Lv3: 2.0x Skill Damage and 50% Reset Chance', async () => {
            const unit = await sim.addUnit({
                instance_id: "am_lv3",
                name: "Wizard",
                traits: [{ name: "arcanemaster", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100 });

            const traitService = require('../src/services/traitService');
            
            // 1. Check damage mult (Args: actor, sim, target, skill)
            const preAttack = traitService.executeHook("onPreAttack", unit, sim, null, { id: "fireball" });
            expect(preAttack.dmgMult).toBe(2.0);

            // 2. Check cooldown reset (Math.random < 0.5)
            Math.random.mockReturnValue(0.4); 
            unit.skillCooldowns["fireball"] = 5;
            traitService.executeHook("onPostAction", unit, sim, { id: "fireball", name: "Fireball" });
            expect(unit.skillCooldowns["fireball"]).toBe(0);
        });
    });

    describe('Coward Trait (Tiered)', () => {
        test('Lv3: +20 Speed at < 50% HP', async () => {
            const unit = await sim.addUnit({
                instance_id: "cow_lv3",
                name: "Cowardly",
                traits: [{ name: "coward", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100, speed: 10 });

            unit.currentHealth = 40; // < 50
            const traitService = require('../src/services/traitService');
            traitService.executeHook("onTickStart", unit, sim);
            
            expect(unit.temporaryStats.speed).toBe(20);
        });

        test('Lv3: 45% Panic chance (Math.random < 0.45)', async () => {
            const unit = await sim.addUnit({
                instance_id: "cow_pan",
                name: "LoneCoward",
                traits: [{ name: "coward", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100 });

            Math.random.mockReturnValue(0.4); // Success panic
            const traitService = require('../src/services/traitService');
            const canAct = traitService.executeHook("onBeforeAction", unit, sim);
            
            expect(canAct).toBe(false);
        });
    });

    describe('Disruptor Trait (Tiered)', () => {
        test('Lv3: +3 Move Range', async () => {
            const unit = await sim.addUnit({
                instance_id: "dis_lv3",
                name: "Disruptor",
                traits: [{ name: "disruptor", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100, move_range: 3 });

            const traitService = require('../src/services/traitService');
            traitService.executeHook("onBattleStart", unit, sim);
            
            expect(unit.stats.move_range).toBe(6);
        });
    });

    describe('Sharpshooter Trait (Tiered)', () => {
        test('Lv3: +4 Attack Range', async () => {
            const unit = await sim.addUnit({
                instance_id: "sha_lv3",
                name: "Sniper",
                traits: [{ name: "sharpshooter", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100, attack_range: 2 });

            const traitService = require('../src/services/traitService');
            traitService.executeHook("onBattleStart", unit, sim);
            
            expect(unit.stats.attack_range).toBe(6);
        });
    });

    describe('Thinker Trait (Tiered)', () => {
        test('Lv3: +25 Mana Regen', async () => {
            const unit = await sim.addUnit({
                instance_id: "thi_lv3",
                name: "Sage",
                traits: [{ name: "thinker", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100, mana_max: 100 });

            unit.currentMana = 10;
            const traitService = require('../src/services/traitService');
            traitService.executeHook("onTurnStart", unit, sim);
            
            expect(unit.currentMana).toBe(35);
        });
    });

    describe('TrueSight Trait (Tiered)', () => {
        test('Lv3: +50 Accuracy', async () => {
            const unit = await sim.addUnit({
                instance_id: "ts_lv3",
                name: "Overseer",
                traits: [{ name: "truesight", level: 3 }]
            }, 0, { x: 1, y: 1 }, { health_max: 100, accuracy: 100 });

            const traitService = require('../src/services/traitService');
            traitService.executeHook("onBattleStart", unit, sim);
            
            expect(unit.stats.accuracy).toBe(150);
        });
    });
});
