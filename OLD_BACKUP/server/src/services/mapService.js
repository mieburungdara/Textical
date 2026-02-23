class MapService {
    /**
     * Generates a tactical grid based on region and difficulty.
     */
    generateMap(width, height, dungeonId = "default") {
        const grid = Array(height).fill().map(() => Array(width).fill(0));

        if (dungeonId === "volcano") {
            // Create lava rivers
            for (let y = 0; y < height; y++) {
                grid[y][Math.floor(width / 2)] = 3; // LAVA
            }
        } else {
            // Default: Random some forest and lava for variety
            for (let i = 0; i < 5; i++) {
                const rx = Math.floor(Math.random() * width);
                const ry = Math.floor(Math.random() * height);
                grid[ry][rx] = Math.random() < 0.5 ? 3 : 5; // Lava or Forest
            }
        }

        return grid;
    }
}

module.exports = new MapService();
