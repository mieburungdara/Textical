const BattleGrid = require('../src/logic/battleGrid');

describe('A* Pathfinding & Grid Tests', () => {
    
    test('Should find simple horizontal path', async () => {
        const grid = new BattleGrid(8, 8);
        const start = { x: 0, y: 0 };
        const target = { x: 2, y: 0 };
        
        const path = await grid.findPathAsync(start, target);
        
        expect(path).not.toBeNull();
        expect(path.length).toBeGreaterThan(1);
        expect(path[1]).toEqual({ x: 1, y: 0 });
    });

    test('Should avoid Wall (Terrain type 6)', async () => {
        const grid = new BattleGrid(8, 8);
        const start = { x: 0, y: 1 };
        const target = { x: 2, y: 1 };
        
        // Place a wall in the middle: (1, 1)
        grid.terrainGrid[1][1] = 6; 
        
        const path = await grid.findPathAsync(start, target);
        
        expect(path).not.toBeNull();
        expect(path.length).toBeGreaterThan(0);
        const hasWallInPath = path.some(p => p.x === 1 && p.y === 1);
        expect(hasWallInPath).toBe(false);
    });

    test('Distance calculation should be Chebyshev (Diagonal = 1)', () => {
        const grid = new BattleGrid(8, 8);
        const p1 = { x: 0, y: 0 };
        const p2 = { x: 1, y: 1 };
        
        expect(grid.getDistance(p1, p2)).toBe(1);
    });
});