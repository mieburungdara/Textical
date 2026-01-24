const prisma = new (require('@prisma/client').PrismaClient)();

class JobService {
    /**
     * Adds experience to a specific job for a hero.
     * Handles leveling up and mastery point distribution.
     */
    async addJobExp(heroId, jobId, amount) {
        let progress = await prisma.heroJobProgress.findUnique({
            where: { heroId_jobId: { heroId, jobId } }
        });

        // 1. If hero doesn't have this job yet, unlock it
        if (!progress) {
            progress = await prisma.heroJobProgress.create({
                data: { heroId, jobId, level: 1, exp: 0 }
            });
        }

        let newExp = progress.exp + amount;
        let newLevel = progress.level;
        let newMasteryPoints = progress.masteryPoints;

        // 2. AAA Leveling Logic: 100 * level^1.5 EXP required
        while (newExp >= Math.floor(100 * Math.pow(newLevel, 1.5))) {
            newExp -= Math.floor(100 * Math.pow(newLevel, 1.5));
            newLevel++;
            
            // Gain 1 Mastery Point every 5 levels
            if (newLevel % 5 === 0) newMasteryPoints++;
            
            console.log(`[JOB] Hero ${heroId} reached ${jobId} Level ${newLevel}!`);
        }

        return await prisma.heroJobProgress.update({
            where: { id: progress.id },
            data: { exp: newExp, level: newLevel, masteryPoints: newMasteryPoints }
        });
    }

    /**
     * Set a job as the active profession for a hero.
     */
    async setActiveJob(heroId, jobId) {
        // Deactivate all jobs for this hero first
        await prisma.heroJobProgress.updateMany({
            where: { heroId },
            data: { isActive: false }
        });

        // Activate the chosen one
        return await prisma.heroJobProgress.update({
            where: { heroId_jobId: { heroId, jobId } },
            data: { isActive: true }
        });
    }
}

module.exports = new JobService();
