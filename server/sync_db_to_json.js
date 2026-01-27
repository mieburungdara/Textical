const assetService = require('./src/services/assetService');

async function sync() {
    try {
        await assetService.loadAllAssets();
        console.log("SUCCESS: All database entities mirrored to server/public/assets/raw/");
        process.exit(0);
    } catch (e) {
        console.error("FAILED:", e.message);
        process.exit(1);
    }
}

sync();
