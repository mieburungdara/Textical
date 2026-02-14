const BaseService = require('./BaseService');

/**
 * NoticeBoardService
 * Handles monster spotting rumors and monster study buffs.
 */
class NoticeBoardService extends BaseService {
    constructor() {
        super();
        this.STUDY_BUFF_DURATION_MINUTES = 120; // 2 hours
        this.MAX_RECENT_SPOTTINGS = 10;
    }

    /**
     * Record a new monster spotting
     */
    async recordSpotting(regionId, monsterTemplateId, userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            select: { username: true }
        });

        if (!user) throw new Error("User not found.");

        return await this.db.monsterSpotting.create({
            data: {
                regionId,
                monsterTemplateId,
                discoveredByUserId: userId,
                discoveredByName: user.username
            }
        });
    }

    /**
     * Get recent spottings for a region's notice board
     */
    async getRegionalRumors(regionId) {
        return await this.db.monsterSpotting.findMany({
            where: { regionId },
            include: {
                monsterTemplate: {
                    select: { name: true, visualAsset: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: this.MAX_RECENT_SPOTTINGS
        });
    }

    /**
     * Study a monster to gain a combat buff
     * @param {number} userId 
     * @param {number} monsterTemplateId 
     */
    async studyMonster(userId, monsterTemplateId) {
        const expiresAt = new Date(Date.now() + this.STUDY_BUFF_DURATION_MINUTES * 60000);

        return await this.db.monsterStudyBuff.upsert({
            where: {
                // Assuming we add a composite unique key in Prisma later if needed, 
                // for now we'll just handle it by checking if one exists or using a user-id based approach
                // To keep it simple for this implementation:
                id: (await this.db.monsterStudyBuff.findFirst({
                    where: { userId, monsterTemplateId }
                }))?.id || -1
            },
            update: { expiresAt },
            create: {
                userId,
                monsterTemplateId,
                expiresAt,
                damageBonus: 0.10,
                defenseBonus: 0.10
            }
        });
    }

    /**
     * Get active study buffs for a user
     */
    async getActiveStudyBuffs(userId) {
        return await this.db.monsterStudyBuff.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() }
            },
            include: {
                monsterTemplate: { select: { name: true } }
            }
        });
    }
}

module.exports = new NoticeBoardService();
