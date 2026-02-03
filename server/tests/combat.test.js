const CombatRules = require('../src/logic/combatRules');

describe('CombatRules Logic Tests', () => {
    
    // Mock getStat method for test objects
    const createMockCharacter = (stats) => {
        return {
            getStat: (statName) => {
                return stats[statName] || 0;
            }
        };
    };
    
    test('Should calculate base damage correctly (Atk - Def)', () => {
        const attacker = createMockCharacter({
            attack_damage: 50,
            crit_chance: 0,
            accuracy: 100,
            crit_damage: 1.5,
            armor_penetration: 0
        });
        
        const defender = createMockCharacter({
            defense: 10,
            dodge_rate: 0,
            block_chance: 0,
            block_power: 0.5
        });
        
        const result = CombatRules.calculateDamage(attacker, defender);
        
        expect(result.damage).toBe(40);
        expect(result.isMiss).toBe(false);
    });

    test('Fire should be strong against Nature (1.5x damage)', () => {
        const attacker = createMockCharacter({
            attack_damage: 100,
            crit_chance: 0,
            accuracy: 100,
            crit_damage: 1.5,
            armor_penetration: 0
        });
        
        const defender = createMockCharacter({
            defense: 0,
            dodge_rate: 0,
            block_chance: 0,
            block_power: 0.5
        });
        
        const result = CombatRules.calculateDamage(attacker, defender, 1.5, 1); // Fire element with 1.5x multiplier
        
        expect(result.damage).toBe(150);
    });

    test('Damage should never be less than 1', () => {
        const attacker = createMockCharacter({
            attack_damage: 5,
            crit_chance: 0,
            accuracy: 100,
            crit_damage: 1.5,
            armor_penetration: 0
        });
        
        const defender = createMockCharacter({
            defense: 100,
            dodge_rate: 0,
            block_chance: 0,
            block_power: 0.5
        });
        
        const result = CombatRules.calculateDamage(attacker, defender);
        
        expect(result.damage).toBe(1);
    });
});
