const StatProcessor = require('../src/logic/statProcessor');
const { StatModifierType } = require('../src/logic/statSystem');

describe('StatProcessor Tests', () => {

    describe('Hero Stat Calculation', () => {
        test('Should calculate base stats correctly', () => {
            const heroData = {
                name: 'Test Hero',
                hp_base: 100,
                damage_base: 10,
                speed_base: 5,
                str: 10,
                dex: 12,
                int: 8
            };

            const stats = StatProcessor.calculateHeroStats(heroData).toObject();

            expect(stats.health_max).toBe(100);
            expect(stats.attack_damage).toBe(10);
            expect(stats.speed).toBe(5);
            expect(stats.strength).toBe(10);
            expect(stats.dexterity).toBe(12);
        });

        test('Should apply Job Multipliers (PERCENT_ADD)', () => {
            const heroData = {
                hp_base: 100,
                current_job: {
                    name: 'Warrior',
                    hp_mult: 1.5 // +50% HP
                }
            };

            const stats = StatProcessor.calculateHeroStats(heroData).toObject();

            // 100 * (1 + 0.5) = 150
            expect(stats.health_max).toBe(150);
        });

        test('Should combine Base + (Base * PercentMod) + FlatMod', () => {
            const heroData = {
                hp_base: 100,
                current_job: { name: 'Knight', hp_mult: 1.2 }, // +20%
                equipment: [
                    {
                        data: {
                            name: 'Plate Armor',
                            stats: [
                                { statKey: 'health_max', statValue: 50 }
                            ]
                        }
                    }
                ]
            };
            
            const stats = StatProcessor.calculateHeroStats(heroData).toObject();

            // Formula in statSystem.js:
            // value += flatSums; value *= (1 + percentAddTotal);
            // (100 + 50) * (1 + 0.2) = 150 * 1.2 = 180
            expect(stats.health_max).toBe(180);
        });

        test('Should handle negative modifiers', () => {
            const heroData = {
                speed_base: 10,
                buffs: [
                    { statKey: 'speed', statValue: -2, isPercent: false, name: 'Slow' }
                ]
            };

            const stats = StatProcessor.calculateHeroStats(heroData).toObject();

            expect(stats.speed).toBe(8);
        });
    });

    describe('Monster Stat Calculation', () => {
        test('Should calculate monster base stats correctly', () => {
            const monsterData = {
                name: 'Slime',
                hp_base: 50,
                damage_base: 5,
                defense_base: 2,
                speed_base: 3,
                crit_chance: 0.1
            };

            const stats = StatProcessor.calculateMonsterStats(monsterData).toObject();

            expect(stats.health_max).toBe(50);
            expect(stats.attack_damage).toBe(5);
            expect(stats.defense).toBe(2);
            expect(stats.speed).toBe(3);
            expect(stats.crit_chance).toBe(0.1);
        });

        test('Should apply monster traits', () => {
            const monsterData = {
                name: 'Elite Orc',
                hp_base: 200,
                traits: [
                    {
                        trait: {
                            name: 'Hardened',
                            stats: [
                                { statKey: 'defense', statValue: 10 },
                                { statKey: 'health_max', statValue: 0.2 } // PERCENT_ADD because < 1
                            ]
                        }
                    }
                ]
            };

            const stats = StatProcessor.calculateMonsterStats(monsterData).toObject();

            expect(stats.defense).toBe(10); // 0 base + 10 flat
            expect(stats.health_max).toBe(240); // 200 * 1.2
        });
    });
});
