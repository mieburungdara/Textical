const prisma = require('./server/src/db');

async function main() {
    try {
        // Step 1: Check existing heroes
        const existingHeroes = await prisma.hero.count();
        console.log('Existing heroes:', existingHeroes);

        // Step 2: Check existing combat classes
        const existingClasses = await prisma.classTemplate.count();
        console.log('Existing combat classes:', existingClasses);
        
        let combatClass;
        if (existingClasses === 0) {
            // Create a test combat class
            console.log('Creating test combat class...');
            combatClass = await prisma.classTemplate.create({
                data: {
                    name: 'Test Class',
                    description: 'A simple test combat class',
                    baseHealth: 100,
                    baseMana: 50,
                    baseStrength: 10,
                    baseAgility: 5,
                    baseIntelligence: 5
                }
            });
            console.log('Created combat class:', combatClass);
        } else {
            // Use existing first combat class
            combatClass = await prisma.classTemplate.findFirst();
            console.log('Using existing combat class:', combatClass);
        }

        // Step 3: Create a test hero
        const newHero = await prisma.hero.create({
            data: {
                name: 'Test Hero ' + Date.now(),
                unitLevel: 1,
                unitXp: 0,
                userId: 1, // First test user
                classId: combatClass.id
            }
        });
        console.log('Created test hero:', newHero);

        // Step 4: Verify creation
        const heroesAfter = await prisma.hero.count();
        console.log('Heroes after creation:', heroesAfter);

        const allHeroes = await prisma.hero.findMany({
            include: {
                user: { select: { id: true, username: true } },
                combatClass: { select: { id: true, name: true } }
            }
        });
        console.log('All heroes:', JSON.stringify(allHeroes, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
