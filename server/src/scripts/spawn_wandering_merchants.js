const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function spawnWanderers() {
    console.log("--- EXECUTING WANDERING MERCHANT SPAWN CYCLE ---");

    // 1. Get all wandering NPCs
    const wandererTemplates = await prisma.nPCTemplate.findMany();
    const activeWanderers = wandererTemplates.filter(n => {
        try {
            return JSON.parse(n.metadata).isWanderer === true;
        } catch (e) { return false; }
    });

    // 2. Get all non-town regions
    const regions = await prisma.regionTemplate.findMany({
        where: { visualType: { not: "TOWN" } }
    });

    if (regions.length === 0) {
        console.log("   No non-town regions found. Skipping spawn.");
        return;
    }

    // 3. Cleanup existing temporary NPCs
    await prisma.regionNPC.deleteMany({ where: { isTemporary: true } });

    // 4. Randomly spawn each wanderer
    for (const w of activeWanderers) {
        // 20% chance to spawn in ANY valid region
        if (Math.random() < 0.2) {
            const targetRegion = regions[Math.floor(Math.random() * regions.length)];
            const expires = new Date();
            expires.setHours(expires.getHours() + 4); // Stays for 4 hours

            await prisma.regionNPC.create({
                data: {
                    regionId: targetRegion.id,
                    npcId: w.id,
                    isTemporary: true,
                    expiresAt: expires,
                    spawnChance: 1.0
                }
            });

            console.log(`   🌟 ${w.name} has appeared in ${targetRegion.name}!`);
        } else {
            console.log(`   ${w.name} is still hiding in the shadows...`);
        }
    }

    console.log("✅ Spawn Cycle Complete.");
}

spawnWanderers()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
