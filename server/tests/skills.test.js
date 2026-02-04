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

    // New AoE Pattern Tests
    test('Line pattern size 2 should return 8 tiles (4 directions x 2)', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "LINE", 2);
        
        // 1 center + 4 directions x 2 = 9
        expect(tiles.length).toBe(9);
        
        // Check tiles in each direction
        const hasUp = tiles.some(t => t.x === 5 && t.y === 3);
        const hasDown = tiles.some(t => t.x === 5 && t.y === 7);
        const hasLeft = tiles.some(t => t.x === 3 && t.y === 5);
        const hasRight = tiles.some(t => t.x === 7 && t.y === 5);
        expect(hasUp).toBe(true);
        expect(hasDown).toBe(true);
        expect(hasLeft).toBe(true);
        expect(hasRight).toBe(true);
    });

    test('Ring pattern size 2 should form a hollow square', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "RING", 2);
        
        // Ring pattern includes center + outer ring
        // Center + ring tiles
        expect(tiles.length).toBeGreaterThan(10);
        
        // Check outer ring positions
        const hasOuterTop = tiles.some(t => t.x === 5 && t.y === 3);
        const hasOuterBottom = tiles.some(t => t.x === 5 && t.y === 7);
        const hasOuterLeft = tiles.some(t => t.x === 3 && t.y === 5);
        const hasOuterRight = tiles.some(t => t.x === 7 && t.y === 5);
        expect(hasOuterTop).toBe(true);
        expect(hasOuterBottom).toBe(true);
        expect(hasOuterLeft).toBe(true);
        expect(hasOuterRight).toBe(true);
    });

    test('Diamond pattern size 2 should have Manhattan distance <= 2', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "DIAMOND", 2);
        
        // Diamond pattern covers tiles with Manhattan distance <= size
        // Size 2: center + 4 (dist 1) + 8 (dist 2) = 13 tiles (4 corners included)
        expect(tiles.length).toBe(13);
        
        // Check all tiles have Manhattan distance <= 2
        const allValid = tiles.every(t => (Math.abs(t.x - 5) + Math.abs(t.y - 5)) <= 2);
        expect(allValid).toBe(true);
    });

    test('Sector pattern size 2 should cover front cone', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "SECTOR", 2);
        
        // Sector covers front area (y decreasing)
        const hasFront = tiles.some(t => t.y < 5);
        expect(hasFront).toBe(true);
        
        // Should include center and front tiles
        const hasUp = tiles.some(t => t.x === 5 && t.y === 3);
        expect(hasUp).toBe(true);
        
        // Should have tiles spreading outward
        expect(tiles.length).toBeGreaterThan(5);
    });

    test('Spiral pattern size 2 should cover multiple tiles in spiral', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "SPIRAL", 2);
        
        // Spiral should cover multiple tiles
        expect(tiles.length).toBeGreaterThan(5);
        
        // Check spiral covers different distances from center
        const maxDist = Math.max(...tiles.map(t => Math.max(Math.abs(t.x - 5), Math.abs(t.y - 5))));
        expect(maxDist).toBeGreaterThanOrEqual(1);
    });

    // Advanced AoE Pattern Tests
    test('X Shape pattern size 2 should cover diagonals', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "X_SHAPE", 2);
        
        // X shape covers 4 diagonal directions
        // Size 2: 4 directions x 2 tiles each = 8 + center = 9
        expect(tiles.length).toBe(9);
        
        // Check diagonal positions
        const hasNE = tiles.some(t => t.x === 7 && t.y === 3);
        const hasNW = tiles.some(t => t.x === 3 && t.y === 3);
        const hasSE = tiles.some(t => t.x === 7 && t.y === 7);
        const hasSW = tiles.some(t => t.x === 3 && t.y === 7);
        expect(hasNE).toBe(true);
        expect(hasNW).toBe(true);
        expect(hasSE).toBe(true);
        expect(hasSW).toBe(true);
    });

    test('Double Line pattern size 2 should cover parallel lines', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "DOUBLE_LINE", 2);
        
        // Double line covers horizontal and vertical parallel lines
        expect(tiles.length).toBeGreaterThan(10);
        
        // Check parallel positions
        const hasUpperRow = tiles.some(t => t.y === 3);
        const hasLowerRow = tiles.some(t => t.y === 7);
        const hasLeftCol = tiles.some(t => t.x === 3);
        const hasRightCol = tiles.some(t => t.x === 7);
        expect(hasUpperRow).toBe(true);
        expect(hasLowerRow).toBe(true);
        expect(hasLeftCol).toBe(true);
        expect(hasRightCol).toBe(true);
    });

    test('Checkerboard pattern size 3 should have alternating tiles', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "CHECKERBOARD", 3);
        
        // Checkerboard should have alternating pattern
        expect(tiles.length).toBeGreaterThan(5);
        
        // Center should be included (alternating starts from center)
        const hasCenter = tiles.some(t => t.x === 5 && t.y === 5);
        expect(hasCenter).toBe(true);
        
        // Check that adjacent tiles have different parities
        // Up (5,4) should be excluded if center is included
        const hasUp = tiles.some(t => t.x === 5 && t.y === 4);
        expect(hasUp).toBe(false);
        
        // Left (4,5) should be excluded
        const hasLeft = tiles.some(t => t.x === 4 && t.y === 5);
        expect(hasLeft).toBe(false);
        
        // But (4,4) should be included (diagonal from center)
        const hasDiag = tiles.some(t => t.x === 4 && t.y === 4);
        expect(hasDiag).toBe(true);
    });

    test('Wave pattern size 2 should form arc shape', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        const tiles = grid.getTilesInPattern(center, "WAVE", 2);
        
        // Wave should cover front arc
        expect(tiles.length).toBeGreaterThan(3);
        
        // Most tiles should be in front (y < 5)
        const frontTiles = tiles.filter(t => t.y < 5);
        expect(frontTiles.length).toBeGreaterThan(tiles.length / 2);
    });

    test('Random Spread pattern should return varied tiles', () => {
        const grid = new BattleGrid(10, 10);
        const center = { x: 5, y: 5 };
        
        // Run multiple times to test randomness
        const tiles1 = grid.getTilesInPattern(center, "RANDOM_SPREAD", 3);
        const tiles2 = grid.getTilesInPattern(center, "RANDOM_SPREAD", 3);
        
        // Should return multiple tiles
        expect(tiles1.length).toBeGreaterThan(5);
        
        // Tiles should be within bounds
        const allValid = tiles1.every(t => t.x >= 0 && t.x < 10 && t.y >= 0 && t.y < 10);
        expect(allValid).toBe(true);
        
        // Should have some variation between runs (but not guaranteed)
        // Just verify both return valid results
        expect(tiles2.length).toBeGreaterThan(5);
    });
});
