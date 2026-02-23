const prisma = require('./src/db');

async function test() {
  try {
    await prisma.regionTemplate.upsert({
      where: { id: 0 },
      update: {},
      create: {
        id: 0,
        name: "A1",
        description: "Test",
        visualType: "OCEAN",
        traversalType: "BOAT",
        zoneType: "WATER",
        zoneLevel: 1,
        zoneColor: "AZURE",
        isSafeZone: true,
        gridX: 0,
        gridY: 0
      }
    });
    console.log("Success!");
  } catch (err) {
    console.log("ERROR OBJECT:");
    console.log(JSON.stringify(err, null, 2));
    console.log("ERROR MESSAGE:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
