const fs = require('fs');
const path = require('path');

const mapsDir = path.join(__dirname, 'plans', 'maps');
const outputFile = path.join(__dirname, 'client', 'assets', 'data', 'regions.json');

if (!fs.existsSync(mapsDir)) {
    console.error(`Maps directory not found: ${mapsDir}`);
    process.exit(1);
}

const metaPath = path.join(mapsDir, '_meta.json');
if (!fs.existsSync(metaPath)) {
    console.error(`Meta file not found: ${metaPath}`);
    process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const tileTypes = meta.tileTypes || [];

const regionData = {};

/** @param {string} tileType */
tileTypes.forEach(tileType => {
    const filePath = path.join(mapsDir, `${tileType}.json`);
    if (!fs.existsSync(filePath)) {
        console.warn(`Tile file not found: ${filePath}`);
        return;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const defaults = content.defaults || {};
    const coords = content.coordinates || [];

    /** @param {any} coord */
    coords.forEach(coord => {
        const rid = coord.regionId !== undefined ? coord.regionId : (coord.x * 35 + coord.y);
        
        regionData[rid] = {
            id: rid,
            gridX: coord.x,
            gridY: coord.y,
            name: coord.name || defaults.name || `${tileType} Region`,
            type: coord.visualType || defaults.visualType || tileType,
            lore: coord.description || defaults.description || '',
            history: coord.flavorText || defaults.flavorText || '',
            tips: coord.specialization ? [`Specialization: ${coord.specialization}`] : (defaults.specialization ? [`Specialization: ${defaults.specialization}`] : [])
        };
    });
});

fs.writeFileSync(outputFile, JSON.stringify(regionData, null, '\t'));
console.log(`Successfully generated ${Object.keys(regionData).length} regions in ${outputFile}`);
