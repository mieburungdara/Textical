const BaseService = require('../BaseService');

/**
 * GuildFacilityService
 * Orchestrates construction and upgrades of guild structures.
 */
class GuildFacilityService extends BaseService {
    /**
     * Calculates the cost for the next level of a facility.
     */
    calculateUpgradeCost(template, currentLevel) {
        return Math.floor(template.costBase * Math.pow(template.costMult, currentLevel));
    }

    /**
     * Constructs a new facility for a guild.
     */
    async constructFacility(userId, guildId, templateId) {
        const template = await this.db.guildFacilityTemplate.findUnique({ where: { id: templateId } });
        if (!template) throw new Error("Facility template not found.");

        const cost = template.costBase;

        return await this.runTransaction(async (tx) => {
            // 1. Check/Deduct Treasury (Logic handled in TreasuryService or manually)
            const guild = await tx.guild.findUnique({ where: { id: guildId } });
            if (guild.treasury < cost) throw new Error("Insufficient guild treasury.");

            await tx.guild.update({
                where: { id: guildId },
                data: { treasury: { decrement: cost } }
            });

            // 2. Create Facility
            const facility = await tx.guildFacility.create({
                data: { guildId, templateId, level: 1 }
            });

            this.log(`Facility Constructed: Guild ${guildId} built ${template.name}`, "Guild");
            return facility;
        });
    }

    /**
     * Upgrades an existing facility.
     */
    async upgradeFacility(userId, guildId, facilityId) {
        const facility = await this.db.guildFacility.findUnique({
            where: { id: facilityId },
            include: { template: true }
        });

        if (!facility || facility.guildId !== guildId) throw new Error("Facility not found.");

        const cost = this.calculateUpgradeCost(facility.template, facility.level);

        return await this.runTransaction(async (tx) => {
            const guild = await tx.guild.findUnique({ where: { id: guildId } });
            if (guild.treasury < cost) throw new Error("Insufficient guild treasury.");

            await tx.guild.update({
                where: { id: guildId },
                data: { treasury: { decrement: cost } }
            });

            const updated = await tx.guildFacility.update({
                where: { id: facilityId },
                data: { level: { increment: 1 } }
            });

            this.log(`Facility Upgraded: Guild ${guildId} upgraded ${facility.template.name} to Level ${updated.level}`, "Guild");
            return updated;
        });
    }
}

module.exports = new GuildFacilityService();
