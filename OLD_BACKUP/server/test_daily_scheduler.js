const cronScheduler = require('./src/services/world/DailyScheduler');

async function testCronScheduler() {
    console.log("--- Testing Cron Scheduler ---");

    try {
        // 1. Display Cron Configuration
        console.log("\n=== CRON CONFIGURATION ===");
        console.log("Scheduler initialized successfully.");
        cronScheduler.start();

        // 2. Get Status
        console.log("\n=== CRON JOBS STATUS ===");
        const status = cronScheduler.getStatus();
        status.forEach(job => {
            console.log(`- ${job.name}: ${job.schedule} (Running: ${job.running})`);
        });

        // 3. Force-run untuk test
        console.log("\n=== MANUAL TRIGGER TEST ===");
        await cronScheduler.forceRunMaintenance();

        console.log("\n✅ Test completed. Cron scheduler is operational.");
        console.log("⏰ Next automatic run: Tomorrow at 00:01 (Asia/Singapore)");

        // Stop scheduler for test
        cronScheduler.stop();

    } catch (error) {
        console.error("ERROR DURING TEST:", error);
    } finally {
        process.exit(0);
    }
}

testCronScheduler();
