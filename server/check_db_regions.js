const prisma = require('./src/db');

async function check() {
    try {
        const count = await prisma.regionTemplate.count();
        console.log('Total regions:', count);
        
        const regions = await prisma.regionTemplate.findMany({ take: 5 });
        console.log('Sample regions:');
        regions.forEach(r => {
            console.log(`  ID: ${r.id}, Grid: (${r.gridX},${r.gridY}), Name: ${r.name}, Type: ${r.visualType}, Zone: ${r.zoneType}`);
        });
        
        // Check for landmark regions
        const landmarks = await prisma.regionTemplate.findMany({
            where: { landmarkName: { not: null } },
            take: 5
        });
        console.log('\nLandmark regions:');
        landmarks.forEach(r => {
            console.log(`  ID: ${r.id}, Grid: (${r.gridX},${r.gridY}), Name: ${r.name}, Landmark: ${r.landmarkName}`);
        });
        
        const connCount = await prisma.regionConnection.count();
        console.log('\nTotal connections:', connCount);
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
