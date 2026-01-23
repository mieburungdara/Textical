const BattleAI = require('../src/logic/battleAI');

describe('Battle AI Logic Tests', () => {

    // Mock Simulation Object
    const mockSim = {
        grid: {
            getDistance: (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)
        },
        units: []
    };

    const ai = new BattleAI(mockSim);

    test('Should target closest enemy by default', () => {
        const actor = { teamId: 0, gridPos: { x: 0, y: 0 }, data: {} };
        
        const enemyNear = { teamId: 1, gridPos: { x: 0, y: 1 }, isDead: false, currentHealth: 100 };
        const enemyFar = { teamId: 1, gridPos: { x: 0, y: 5 }, isDead: false, currentHealth: 100 };
        
        mockSim.units = [actor, enemyNear, enemyFar];
        
        const target = ai.findTarget(actor);
        
        expect(target).toBe(enemyNear);
    });

    test('Should ignore dead enemies', () => {
        const actor = { teamId: 0, gridPos: { x: 0, y: 0 }, data: {} };
        
        const enemyDead = { teamId: 1, gridPos: { x: 0, y: 1 }, isDead: true };
        const enemyAlive = { teamId: 1, gridPos: { x: 0, y: 5 }, isDead: false };
        
        mockSim.units = [actor, enemyDead, enemyAlive];
        
        const target = ai.findTarget(actor);
        
        expect(target).toBe(enemyAlive);
    });

    test('Should prioritize Lowest HP if configured', () => {
        const actor = { teamId: 0, gridPos: { x: 0, y: 0 }, data: { target_priority: 2 } }; // 2 = Lowest HP
        
        const enemyHighHP = { teamId: 1, gridPos: { x: 0, y: 1 }, isDead: false, currentHealth: 100 };
        const enemyLowHP = { teamId: 1, gridPos: { x: 0, y: 2 }, isDead: false, currentHealth: 10 };
        
        mockSim.units = [actor, enemyHighHP, enemyLowHP];
        
        const target = ai.findTarget(actor);
        
        expect(target).toBe(enemyLowHP);
    });
});
