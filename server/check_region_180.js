const prisma = require('./src/db');

(async () => {
  try {
    // Check region 180
    const region = await prisma.regionTemplate.findUnique({
      where: { id: 180 }
    });
    console.log('Region 180:', JSON.stringify(region, null, 2));
    
    // Check connections from region 180
    const connections = await prisma.regionConnection.findMany({
      where: { 
        OR: [
          { sourceRegionId: 180 },
          { targetRegionId: 180 }
        ]
      }
    });
    console.log('Connections from/to 180:', connections.length);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
