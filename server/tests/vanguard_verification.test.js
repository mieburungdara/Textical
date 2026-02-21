const BattleSimulation = require('../src/logic/battleSimulation');

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

    test('Ally should take 0 damage and Vanguard should take 100% of final damage', async () => {
        // Calculation: 
        // Attacker Atk: 100
        // Ally Def: 20
        // Expected Final Damage: 80
        
        sim.rules.performAttack(attacker, ally);

        // Assertions
        // Ally (Mage) should stay at 100 HP (interception 100%)
        expect(ally.currentHealth).toBe(100); 
        
        // Vanguard should take the 80 damage: 200 - 80 = 120
        expect(vanguard.currentHealth).toBe(120);
    });
});
