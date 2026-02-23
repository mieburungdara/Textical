const prisma = new (require('@prisma/client').PrismaClient)();

class JobService {
    /**
     * Adds experience to a hero's single, specialized job.
     */
    async addJobExp(heroId, amount) {
        const hero = await prisma.hero.findUnique({
            where: { id: heroId },
            include: { job: true }
        });

        if (!hero || !hero.jobId) throw new Error("Hero does not have a specialized job assigned.");

        let newExp = hero.jobExp + amount;
        let newLevel = hero.jobLevel;
        let newMasteryPoints = hero.masteryPoints;

        // AAA Leveling Logic: 100 * level^1.5 EXP
        while (newExp >= Math.floor(100 * Math.pow(newLevel, 1.5))) {
            newExp -= Math.floor(100 * Math.pow(newLevel, 1.5));
            newLevel++;
            
            // Gain 1 Mastery Point every 5 levels
            if (newLevel % 5 === 0) newMasteryPoints++;
            
            console.log(`[JOB] Specialist ${hero.name} reached ${hero.job.name} Level ${newLevel}!`);
        }

        return await prisma.hero.update({
            where: { id: heroId },
            data: { 
                jobExp: newExp, 
                jobLevel: newLevel, 
                masteryPoints: newMasteryPoints 
            }
        });
    }

    /**
     * Permanent Job Assignment (The hero focuses on this forever)
     */
    async assignPermanentJob(heroId, jobId) {
        const hero = await prisma.hero.findUnique({ where: { id: heroId } });
        if (hero.jobId) throw new Error("Hero already has a specialized profession.");

        return await prisma.hero.update({
            where: { id: heroId },
            data: { 
                jobId: jobId,
                jobLevel: 1,
                jobExp: 0,
                jobRank: "APPRENTICE"
            }
        });
    }
}

module.exports = new JobService();