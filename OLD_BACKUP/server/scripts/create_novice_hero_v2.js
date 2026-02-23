const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Creating Novice Hero for player1 ---");
    
    // Find the Novice class
    const noviceClass = await prisma.classTemplate.findFirst({
        where: { name: 'Novice' }
    });
    
    if (!noviceClass) {
        console.error("Error: Novice class not found in ClassTemplate!");
        return;
    }
    
    // Create the hero
    const newHero = await prisma.hero.create({
        data: {
            name: 'New Recruit',
            userId: 1, // player1
            classId: noviceClass.id,
            unitLevel: 1,
            unitXp: 0,
            classLevel: 1,
            classXp: 0,
            hp_base: 100,
            damage_base: 10,
            str: 10,
            dex: 10,
            int: 10,
            vit: 10,
            luk: 5,
            vitality: 100,
            isMain: false,
            defense_base: 5,
            speed_base: 10
        }
    });
    
    console.log(`Successfully created hero: ${newHero.name} (ID: ${newHero.id}) for player1`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
