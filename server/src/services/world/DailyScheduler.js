const cron = require('node-cron');
const territoryManager = require('./TerritoryManager');

/**
 * CronScheduler
 * Production-ready scheduler menggunakan node-cron.
 * Menjalankan maintenance tasks setiap hari pada waktu yang ditentukan.
 */
class CronScheduler {
    constructor() {
        this.tasks = [];
    }

    /**
     * Memulai semua scheduled tasks.
     */
    start() {
        console.log("[CRON_SCHEDULER] Initializing cron jobs...");

        // Daily Maintenance: Runs every day at 00:01 (Asia/Singapore timezone)
        const dailyMaintenanceJob = cron.schedule('1 0 * * *', async () => {
            console.log("[CRON_SCHEDULER] Running daily territory maintenance...");
            try {
                await territoryManager.processAllMaintenances();
                console.log("[CRON_SCHEDULER] Daily maintenance completed successfully.");
            } catch (error) {
                console.error("[CRON_SCHEDULER] Error during daily maintenance:", error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Singapore"
        });

        this.tasks.push({
            name: 'Daily Territory Maintenance',
            job: dailyMaintenanceJob,
            schedule: '1 0 * * *'
        });

        console.log("[CRON_SCHEDULER] Cron jobs started:");
        this.tasks.forEach(task => {
            console.log(`  - ${task.name}: ${task.schedule}`);
        });
    }

    /**
     * Menghentikan semua scheduled tasks.
     */
    stop() {
        console.log("[CRON_SCHEDULER] Stopping all cron jobs...");
        this.tasks.forEach(task => {
            task.job.stop();
        });
        this.tasks = [];
        console.log("[CRON_SCHEDULER] All cron jobs stopped.");
    }

    /**
     * Force-run maintenance (untuk testing atau admin trigger).
     */
    async forceRunMaintenance() {
        console.log("[CRON_SCHEDULER] Force-running territory maintenance...");
        await territoryManager.processAllMaintenances();
    }

    /**
     * Mendapatkan status semua cron jobs.
     */
    getStatus() {
        return this.tasks.map(task => ({
            name: task.name,
            schedule: task.schedule,
            running: task.job.getStatus() !== null
        }));
    }
}

module.exports = new CronScheduler();
