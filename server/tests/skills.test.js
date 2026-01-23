const BattleGrid = require('../src/logic/battleGrid');

describe('Skill Area of Effect (AoE) Tests', () => {
    
    test('Square pattern size 1 should return 9 tiles (3x3)', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "SQUARE", 1);
        
        // 1 center + 8 surrounding = 9
        expect(tiles.length).toBe(9);
        
        // Check if (4, 4) is included
        const hasTopLeft = tiles.some(t => t.x === 4 && t.y === 4);
        expect(hasTopLeft).toBe(true);
    });

    test('Cross pattern size 1 should return 5 tiles', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "CROSS", 1);
        
        // 1 center + 4 sides = 5
        expect(tiles.length).toBe(5);
        
        // Diagonal (4, 4) should NOT be in a Cross
        const hasDiagonal = tiles.some(t => t.x === 4 && t.y === 4);
        expect(hasDiagonal).toBe(false);
    });

    test('Tiles should be clamped to grid boundaries', () => {
        const grid = new BattleGrid(8, 10);
        const center = { x: 0, y: 0 }; // Top-left corner
        
        const tiles = grid.getTilesInPattern(center, "SQUARE", 1);
        
        // Center (0,0), and neighbors (1,0), (0,1), (1,1) = 4 tiles total
        expect(tiles.length).toBe(4);
        
        // No negative coordinates allowed
        const hasNegative = tiles.some(t => t.x < 0 || t.y < 0);
        expect(hasNegative).toBe(false);
    });
});
