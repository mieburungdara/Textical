const prisma = require('../db');

async function seedZoneTypes() {
    console.log("🌍 CATEGORIZING WORLD REGIONS INTO ZONALITY (GREEN/BLUE/RED)...");

    const regions = await prisma.regionTemplate.findMany();

    for (const region of regions) {
        let zone = "GREEN";
        if (region.dangerLevel >= 8) zone = "RED";
        else if (region.dangerLevel >= 3) zone = "BLUE";

        // TOWN visualType always stays GREEN
        if (region.visualType === "TOWN") zone = "GREEN";

        await prisma.regionTemplate.update({
            where: { id: region.id },
            data: { zoneType: zone }
        });

        console.log(`   Region ${region.id} (${region.name}): Danger ${region.dangerLevel} -> ${zone}`);
    }

    console.log("✅ Success: World zonality mapping complete.");
}

seedZoneTypes().catch(err => console.error(err));
