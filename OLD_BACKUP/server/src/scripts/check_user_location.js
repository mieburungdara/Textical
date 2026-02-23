const prisma = require('../db');

async function checkUserLocation() {
    try {
        const user = await prisma.user.findUnique({
            where: { id: 1 },
            select: {
                id: true,
                username: true,
                currentRegion: true
            }
        });

        console.log('=== USER LOCATION ===');
        console.log('User ID:', user.id);
        console.log('Username:', user.username);
        console.log('Current Region ID:', user.currentRegion);

        // Get region details
        const region = await prisma.regionTemplate.findUnique({
            where: { id: user.currentRegion },
            select: {
                id: true,
                name: true,
                visualType: true
            }
        });

        if (region) {
            console.log('Region Name:', region.name);
            console.log('Region Type:', region.visualType);
        } else {
            console.log('Region not found in database!');
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        await prisma.$disconnect();
        process.exit(1);
    }
}

checkUserLocation();
