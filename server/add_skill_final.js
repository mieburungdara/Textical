const prisma = require('./src/db');

async function main() {
    try {
        const user = await prisma.user.findFirst({
            include: { heroes: true }
        });

        if (!user || user.heroes.length === 0) {
            console.log("No user or hero found.");
            return;
        }

        const hero = user.heroes[0];
        console.log(`Target Hero: ${hero.name} (ID: ${hero.id})`);

        // ID 9999 for "Ancient Fire Breath"
        const skillId = 9999; 
        
        let skill = await prisma.skillTemplate.findUnique({
            where: { id: skillId }
        });

        if (!skill) {
            console.log("Creating SkillTemplate (Ancient Fire Breath)...");
            skill = await prisma.skillTemplate.create({
                data: {
                    id: skillId,
                    name: "Ancient Fire Breath",
                    description: "Exhale a massive cone of primordial fire. Scorches everything in its path.",
                    category: "ACTIVE",
                    type: "DAMAGE",
                    manaCost: 75,
                }
            });
        } else {
             console.log(`Skill Template found: ${skill.name}`);
             // Ensure name is correct
             if (skill.name !== "Ancient Fire Breath") {
                 console.log("Updating skill name...");
                 skill = await prisma.skillTemplate.update({
                     where: { id: skillId },
                     data: { 
                         name: "Ancient Fire Breath",
                         description: "Exhale a massive cone of primordial fire. Scorches everything in its path."
                     }
                 });
             }
        }

        // Link to Hero
        const existingLink = await prisma.heroSkill.findUnique({
            where: {
                heroId_skillId: {
                    heroId: hero.id,
                    skillId: skillId
                }
            }
        });

        if (!existingLink) {
            await prisma.heroSkill.create({
                data: {
                    heroId: hero.id,
                    skillId: skillId,
                    isActive: true
                }
            });
            console.log(`Skill '${skill.name}' (ID: ${skill.id}) added to hero '${hero.name}'!`);
        } else {
            console.log(`Hero already has skill '${skill.name}'.`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
