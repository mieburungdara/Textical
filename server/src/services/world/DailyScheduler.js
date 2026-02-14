const cron = require('node-cron');
const territoryManager = require('./TerritoryManager');
const treasureDiscovery = require('./TreasureDiscoveryService');

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

        // Treasure Respawn: Runs every day at 00:05 (Asia/Singapore timezone)
        const treasureRespawnJob = cron.schedule('5 0 * * *', async () => {
            console.log("[CRON_SCHEDULER] Running treasure respawn check...");
            try {
                await treasureDiscovery.processRespawns();
                console.log("[CRON_SCHEDULER] Treasure respawn completed successfully.");
            } catch (error) {
                console.error("[CRON_SCHEDULER] Error during treasure respawn:", error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Singapore"
        });

        this.tasks.push({
            name: 'Daily Treasure Respawn',
            job: treasureRespawnJob,
            schedule: '5 0 * * *'
        });

        // Property Foreclosure: Runs every day at 00:10 (Asia/Singapore timezone)
        const PropertyService = require('../PropertyService');
        const propertyForeclosureJob = cron.schedule('10 0 * * *', async () => {
            console.log("[CRON_SCHEDULER] Running property foreclosure maintenance...");
            try {
                await PropertyService.processForeclosures();
                console.log("[CRON_SCHEDULER] Property foreclosure completed successfully.");
            } catch (error) {
                console.error("[CRON_SCHEDULER] Error during property foreclosure:", error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Singapore"
        });

        this.tasks.push({
            name: 'Daily Property Foreclosure',
            job: propertyForeclosureJob,
            schedule: '10 0 * * *'
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
