const fs = require('fs');
const path = require('path');

const worldPath = path.join(__dirname, 'src/data/world.json');
const worldData = JSON.parse(fs.readFileSync(worldPath, 'utf8'));

if (worldData.regions['998']) {
    console.log('Removing 998: Sylph Grove');
    delete worldData.regions['998'];
}
if (worldData.regions['999']) {
    console.log('Removing 999: Bandit Peak');
    delete worldData.regions['999'];
}

fs.writeFileSync(worldPath, JSON.stringify(worldData, null, 2));
console.log('world.json updated successfully.');
