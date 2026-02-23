const prisma = require('./src/db');

async function checkData() {
    const users = await prisma.user.findMany();
    const regions = await prisma.regionTemplate.findMany();
    
    console.log('=== USERS ===');
    users.forEach(u => {
        console.log(`ID: ${u.id}, Username: ${u.username}, CurrentRegion: ${u.currentRegion}`);
    });
    
    console.log('\n=== REGIONS ===');
    regions.forEach(r => {
        console.log(`ID: ${r.id}, Name: ${r.name}, ZoneType: ${r.zoneType}, GridX: ${r.gridX}, GridY: ${r.gridY}`);
    });
    
    await prisma.$disconnect();
}

checkData();
