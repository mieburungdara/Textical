const EasyStar = require('easystarjs');

class BattleGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.terrainGrid = Array(height).fill().map(() => Array(width).fill(0));
        this.unitGrid = Array(height).fill().map(() => Array(width).fill(null));

        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.terrainGrid);
        this.easystar.setAcceptableTiles([0, 1, 2, 3]);
        this.easystar.enableDiagonals();
        
        this.easystar.setTileCost(1, 3.0); // Mud
        this.easystar.setTileCost(2, 2.0); // Snow
        this.easystar.setTileCost(3, 5.0); // Lava
    }

    updateObstacles(units) {
        this.easystar.removeAllAdditionalPoints();
        units.forEach(u => {
            if (!u.isDead) this.easystar.avoidAdditionalPoint(u.gridPos.x, u.gridPos.y);
        });
    }

    findPath(start, target, callback) {
        this.easystar.stopAvoidingAdditionalPoint(start.x, start.y);
        this.easystar.findPath(start.x, start.y, target.x, target.y, callback);
        this.easystar.calculate();
        this.easystar.avoidAdditionalPoint(start.x, start.y);
    }

    isTileOccupied(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.unitGrid[y][x] !== null;
    }

    getDistance(p1, p2) {
        return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
    }

    getTilesInPattern(center, pattern, size) {
        const tiles = [center];
        if (pattern === "SQUARE") {
            for (let x = -size; x <= size; x++) {
                for (let y = -size; y <= size; y++) {
                    if (x === 0 && y === 0) continue;
                    const p = { x: center.x + x, y: center.y + y };
                    if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) tiles.push(p);
                }
            }
        } else if (pattern === "CROSS") {
            for (let i = 1; i <= size; i++) {
                const directions = [{x:i,y:0},{x:-i,y:0},{x:0,y:i},{x:0,y:-i}];
                directions.forEach(d => {
                    const p = { x: center.x + d.x, y: center.y + d.y };
                    if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) tiles.push(p);
                });
            }
        } else if (pattern === "CIRCLE") {
            for (let x = -size; x <= size; x++) {
                for (let y = -size; y <= size; y++) {
                    if (x === 0 && y === 0) continue;
                    if (Math.abs(x) + Math.abs(y) <= size) {
                        const p = { x: center.x + x, y: center.y + y };
                        if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) tiles.push(p);
                    }
                }
            }
        }
        return tiles;
    }
}

module.exports = BattleGrid;
