const prisma = require('../db');

async function fixOverlap() {
    console.log("Purging conflicting legacy classes (IDs 2001, 2002)...");
    
    // First, ensure no heroes are pointing to them (Reset them to Novice if they exist)
    await prisma.hero.updateMany({
        where: { classId: { in: [2001, 2002] } },
        data: { classId: 1001 }
    });

    // Delete the classes
    await prisma.classTemplate.deleteMany({
        where: { id: { in: [2001, 2002] } }
    });

    console.log("Overlap fixed.");
}

fixOverlap().catch(err => console.error(err));
