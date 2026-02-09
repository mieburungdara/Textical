const delayCalculator = require('../src/logic/simulation/DelayCalculator');

describe('DelayCalculator', () => {
    const mockUnit = (stats) => ({
        getStat: (key) => stats[key] || 0
    });

    test('High Move Speed should reduce Move Delay', () => {
        const slow = mockUnit({ move_speed: 50 });
        const normal = mockUnit({ move_speed: 100 });
        const fast = mockUnit({ move_speed: 200 });

        const delaySlow = delayCalculator.calculateMoveDelay(slow);
        const delayNormal = delayCalculator.calculateMoveDelay(normal);
        const delayFast = delayCalculator.calculateMoveDelay(fast);

        expect(delaySlow).toBe(100);   // (100/50) * 50 = 100
        expect(delayNormal).toBe(50); // (100/100) * 50 = 50
        expect(delayFast).toBe(25);   // (100/200) * 50 = 25
    });

    test('High Attack Speed should reduce Attack Delay', () => {
        const normal = mockUnit({ attack_speed: 1.0 });
        const fast = mockUnit({ attack_speed: 2.0 });

        const delayNormal = delayCalculator.calculateAttackDelay(normal);
        const delayFast = delayCalculator.calculateAttackDelay(fast);

        expect(delayNormal).toBe(100);
        expect(delayFast).toBe(50);
    });

    test('Higher DEX should reduce Skill Delay', () => {
        const base = mockUnit({ dex: 10 });
        const highDex = mockUnit({ dex: 100 });

        const delayBase = delayCalculator.calculateSkillDelay(base, { actionCost: 100 });
        const delayHigh = delayCalculator.calculateSkillDelay(highDex, { actionCost: 100 });

        expect(delayBase).toBe(95); // 100 * (1 - 0.05)
        expect(delayHigh).toBe(50); // 100 * (1 - 0.5) cap
    });
});
