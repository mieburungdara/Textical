const fs = require('fs');
const prisma = require('./src/db');

async function test() {
  const maps = JSON.parse(fs.readFileSync('../plans/MAPS.json', 'utf8'));
  
  // Pick a few test cases from different zones
  const testCases = [
    { zone: 'WATER', index: 10, x: 10, y: 0 },
    { zone: 'WATER', index: 110, x: 0, y: 1 },
    { zone: 'YELLOW', index: 0, x: 12, y: 3 }, // I need to find where YELLOW starts
  ];

  // Let's actually find the first coordinate of each zone
  const results = [];
  for (const zoneKey in maps) {
    const zone = maps[zoneKey];
    if (zone.coordinates && zone.coordinates.length > 0) {
      const first = zone.coordinates[0];
      const id = first.x * 100 + first.y;
      const region = await prisma.regionTemplate.findUnique({ where: { id } });
      
      results.push({
        zone: zoneKey,
        source: `x=${first.x}, y=${first.y}`,
        db: region ? `name=${region.name}, gridX=${region.gridX}, gridY=${region.gridY}` : 'NOT FOUND',
        match: region ? (region.gridX === first.x && region.gridY === first.y) : false
      });
    }
  }

  const count = await prisma.regionTemplate.count();
  console.log(JSON.stringify({ results, totalInDB: count }, null, 2));
  await prisma.$disconnect();
}

test().catch(console.error);
