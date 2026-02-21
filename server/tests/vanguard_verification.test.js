const BattleSimulation = require('../src/logic/battleSimulation');
const worldCycle = require('../src/services/world/WorldCycleService');

// Mock WorldCycle globally for the test file
worldCycle.getWorldState = async () => ({
    currentHour: 12,
    weatherType: 'CLEAR'
});

describe('VanguardTrait Verification', () => {
    let sim;
    let vanguard;
    let ally;
    let attacker;

    beforeEach(async () => {
        sim = new BattleSimulation(10, 10);
        
        // 1. Setup Vanguard (Protector)
        vanguard = await sim.addUnit({
            instance_id: "vanguard_1",
            name: "Vanguard",
            traits: ["vanguard"]
        }, 0, { x: 5, y: 5 }, { health_max: 200, defense: 50 });
        
        // 2. Setup Ally (Mage - the one being protected)
        ally = await sim.addUnit({
            instance_id: "mage_1",
            name: "Mage Ally",
            traits: []
        }, 0, { x: 5, y: 6 }, { health_max: 100, defense: 20 });
        
        // 3. Setup Attacker (Enemy)
        attacker = await sim.addUnit({
            instance_id: "enemy_1",
            name: "Enemy Slayer",
            traits: []
        }, 1, { x: 5, y: 7 }, { health_max: 100, attack_damage: 100 });

        // Ensure health is full
        vanguard.currentHealth = 200;
        ally.currentHealth = 100;
    });

    test('Ally and Vanguard should split final damage 50/50', async () => {
        // Calculation: 
        // Attacker Atk: 100
        // Ally Def: 20
        // Expected Final Damage: 80
        // Vanguard absorbed: 40
        // Ally takes: 40
        
        sim.rules.performAttack(attacker, ally);

        // Assertions
        // Ally (Mage) should take 40 damage: 100 - 40 = 60 HP
        expect(ally.currentHealth).toBe(60); 
        
        // Vanguard should take the 40 damage: 200 - 40 = 160 HP
        expect(vanguard.currentHealth).toBe(160);
    });
});
