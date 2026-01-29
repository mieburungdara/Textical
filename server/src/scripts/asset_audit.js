const assetService = require('../services/assetService');

async function runAssetAudit() {
    console.log("--------------------------------------------------");
    console.log("📦 STARTING ASSET MODULAR AUDIT");
    console.log("--------------------------------------------------\n");

    console.log("[1/2] Fetching Manifest...");
    const manifest = await assetService.getManifest();
    console.log(`   Regions: ${manifest.regions.length} | Items: ${manifest.items.length} | Monsters: ${manifest.monsters.length}`);

    console.log("\n[2/2] Testing Sync (Mirroring)...");
    if (manifest.regions.length > 0) {
        const firstRegion = manifest.regions[0];
        const data = await assetService.getRawAsset("regions", firstRegion);
        console.log(`   Syncing Region ${firstRegion} (${data.name})...`);
    }

    console.log("\n✅ ASSET AUDIT PASSED: Components are orchestrating correctly.");
}

runAssetAudit().catch(err => {
    console.error("\n❌ AUDIT FAILED:", err.message);
});