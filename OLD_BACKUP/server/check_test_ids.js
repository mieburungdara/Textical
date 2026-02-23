const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const ids = [998, 999];
    console.log('Checking live database for IDs:', ids);
    
    const regions = await prisma.regionTemplate.findMany({
        where: {
            id: { in: ids }
        }
    });
    
    console.log('Database result:', JSON.stringify(regions, null, 2));
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
