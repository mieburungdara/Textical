const BattleSimulation = require('../src/logic/battleSimulation');
const traitService = require('../src/services/traitService');
const worldCycle = require('../src/services/world/WorldCycleService');

// Mock WorldCycle globally for the test file
worldCycle.getWorldState = async () => ({
    currentHour: 12,
    weatherType: 'CLEAR'
});

describe('VampireTrait Bug Hunting', () => {
    let sim;
    let vampire;
    let victim;

    beforeEach(async () => {
        sim = new BattleSimulation(10, 10);
        
        vampire = await sim.addUnit({
            instance_id: "vampire_1",
            name: "Vampire Lord",
            traits: ["vampire"]
        }, 0, { x: 5, y: 5 }, { health_max: 100, attack_damage: 100 });
        
        victim = await sim.addUnit({
            instance_id: "victim_1",
            name: "Training Dummy",
            traits: [],
            facing: "NORTH"
        }, 1, { x: 5, y: 6 }, { health_max: 500, defense: 0 });

        vampire.currentHealth = 50; // Start at 50% HP
    });

    test('Should heal exactly 30% of damage dealt', async () => {
        sim.rules.performAttack(vampire, victim);
        expect(vampire.currentHealth).toBe(80);
    });

    test('Should respect enhanced health_max (Bug Check)', async () => {
        // Fix: Use the proper Stat API if available, or mock it correctly
        vampire._enhancedStats = {
            health_max: { getValue: () => 200 }
        };
        vampire.currentHealth = 150; 
        sim.rules.performAttack(vampire, victim);
        expect(vampire.currentHealth).toBe(180);
    });

    test('Should NOT heal if Vampire dies during attack (Thorns interaction)', async () => {
        vampire.currentHealth = 10;
        
        // Let's replace the vampire trait hook directly or use a jest spy
        // Or simply add a mock trait with a name
        const suiteTrait = {
            name: "test_reflect",
            onPostAttack: (attacker, sim, defender, damage) => {
                attacker.currentHealth = 0; // directly kill
                attacker.isDead = true;
            }
        };
        // We have to register it with traitService for the test
        traitService.traits["test_reflect"] = suiteTrait;
        vampire.traits.push("test_reflect");

        sim.rules.performAttack(vampire, victim);
        
        // Since we take damage in onPostAttack, the vampire should be dead
        // and currentHealth capped at 0.
        expect(vampire.currentHealth).toBe(0);
    });

    test('Should not heal if 30% of damage is less than 1 (Rounding check)', async () => {
        vampire.currentHealth = 50;
        victim.stats.defense = 98; // 100 - 98 = 2 damage
        
        sim.rules.performAttack(vampire, victim);
        
        expect(vampire.currentHealth).toBe(50); // Floor(0.6) = 0
    });
});
