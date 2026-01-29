const EasyStar = require('easystarjs');

class BattleGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.terrainGrid = Array(height).fill().map(() => Array(width).fill(0));
        this.unitGrid = Array(height).fill().map(() => Array(width).fill(null));

        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.terrainGrid);
        this.easystar.setAcceptableTiles([0]); // Only 0 is walkable for this test
        this.easystar.enableDiagonals();
        this.easystar.enableSync(); 
    }

    updateObstacles(units) {
        this.easystar.stopAvoidingAllAdditionalPoints();
        units.forEach(u => {
            if (u && !u.isDead && u.gridPos) {
                this.easystar.avoidAdditionalPoint(u.gridPos.x, u.gridPos.y);
            }
        });
    }

    findPath(start, target) {
        if (!start || !target) return null;
        let pathFound = null;
        
        // Temporarily clear the blockage at the start and end point
        // so EasyStar doesn't think the unit is stuck or the target is a wall.
        this.easystar.stopAvoidingAdditionalPoint(start.x, start.y);
        this.easystar.stopAvoidingAdditionalPoint(target.x, target.y);
        
        this.easystar.findPath(start.x, start.y, target.x, target.y, (path) => {
            pathFound = path;
        });
        this.easystar.calculate(); 
        
        // Re-block them for other units
        this.easystar.avoidAdditionalPoint(start.x, start.y);
        this.easystar.avoidAdditionalPoint(target.x, target.y);
        
        return pathFound;
    }

    isTileOccupied(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.unitGrid[y] && this.unitGrid[y][x] !== null;
    }

    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        // Terrain ID 6 usually means WALL/Obstacle
        if (this.terrainGrid[y][x] === 6) return false;
        return this.unitGrid[y][x] === null;
    }

    getNeighbors(pos) {
        if (!pos) return [];
        const results = [];
        const directions = [
            {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}
        ];
        directions.forEach(d => {
            const next = { x: pos.x + d.x, y: pos.y + d.y };
            if (next.x >= 0 && next.x < this.width && next.y >= 0 && next.y < this.height) {
                results.push(next);
            }
        });
        return results;
    }

    getDistance(p1, p2) {
        if (!p1 || !p2) return 999;
        return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
    }

    /**
     * hasLineOfSight: Checks if two points have a clear path (no walls).
     */
    hasLineOfSight(p1, p2) {
        let x0 = p1.x; let y0 = p1.y;
        let x1 = p2.x; let y1 = p2.y;
        
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            // If we hit a wall/obstacle (Terrain ID 6)
            if (this.terrainGrid[y0][x0] === 6) return false;
            
            if (x0 === x1 && y0 === y1) break;
            
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
        return true;
    }

    getTilesInPattern(center, pattern, size) {
        if (!center) return [];
        const tiles = [center];
        if (pattern === "SQUARE") {
            for (let x = -size; x <= size; x++) {
                for (let y = -size; y <= size; y++) {
                    if (x === 0 && y === 0) continue;
                    const p = { x: center.x + x, y: center.y + y };
                    if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) tiles.push(p);
                }
            }
        }
        return tiles;
    }
}

module.exports = BattleGrid;
