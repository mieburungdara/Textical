const CombatRules = require('../src/logic/combatRules');

describe('CombatRules Logic Tests', () => {
    
    test('Should calculate base damage correctly (Atk - Def)', () => {
        const attacker = { stats: { attack_damage: 50, crit_chance: 0 }, data: { element: 0 } };
        const defender = { stats: { defense: 10, dodge_rate: 0 }, data: { element: 0 } };
        
        const result = CombatRules.calculateDamage(attacker, defender);
        
        expect(result.damage).toBe(40);
        expect(result.isHit).toBe(true);
    });

    test('Fire should be strong against Nature (1.5x damage)', () => {
        const attacker = { stats: { attack_damage: 100, crit_chance: 0 }, data: { element: 1 } }; // Fire
        const defender = { stats: { defense: 0, dodge_rate: 0, res_fire: 1.5 }, data: { element: 2 } }; // Nature
        
        const result = CombatRules.calculateDamage(attacker, defender);
        
        expect(result.damage).toBe(150);
    });

    test('Damage should never be less than 1', () => {
        const attacker = { stats: { attack_damage: 5, crit_chance: 0 }, data: { element: 0 } };
        const defender = { stats: { defense: 100, dodge_rate: 0 }, data: { element: 0 } };
        
        const result = CombatRules.calculateDamage(attacker, defender);
        
        expect(result.damage).toBe(1);
    });
});
