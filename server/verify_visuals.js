const prisma = require('./src/db');

async function verify() {
    console.log("--- Starting Visual System Verification ---");
    
    // Check some samples representing different zones
    // Get one unique sample for each zoneType
    const zoneTypes = await prisma.regionTemplate.groupBy({
        by: ['zoneType']
    });

    for (const zone of zoneTypes) {
        const sample = await prisma.regionTemplate.findFirst({
            where: { zoneType: zone.zoneType },
            select: { id: true, zoneType: true, particleEffectPack: true, skyboxOverride: true, fogDensity: true }
        });

        if (sample) {
            console.log(`Zone ${sample.zoneType.padEnd(10)} (ID: ${sample.id.toString().padEnd(4)}): Particle=${(sample.particleEffectPack || 'None').padEnd(15)} Skybox=${(sample.skyboxOverride || 'Default').padEnd(15)} Fog=${sample.fogDensity}`);
        }
    }

    console.log("--- Verification Completed ---");
    process.exit(0);
}

verify().catch(err => {
    console.error(err);
    process.exit(1);
});
