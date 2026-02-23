const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking models...");
        console.log("prisma.hero:", !!prisma.hero);
        console.log("prisma.classTemplate:", !!prisma.classTemplate);
        console.log("prisma.statAllocationTemplate:", !!prisma.statAllocationTemplate);
        
        const count = await prisma.statAllocationTemplate.count();
        console.log("statAllocationTemplate count:", count);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
