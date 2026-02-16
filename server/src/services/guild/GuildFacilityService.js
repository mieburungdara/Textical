const prisma = require('../../db');
const guildRepository = require('../../repositories/guildRepository');
const GuildUtils = require('./GuildUtils');
const AppError = require('../../utils/AppError');
const ErrorCodes = require('../../constants/ErrorCodes');

/**
 * Service for handling guild facilities construction and upgrades.
 */
class GuildFacilityService {
    async buildFacility(user, templateId) {
        if (!user.guildId) {
            throw new AppError(ErrorCodes.GUILD_NOT_IN_GUILD, 'You are not in a guild.');
        }

        const template = await guildRepository.getFacilityTemplateById(templateId);
        if (!template) {
            throw new AppError(ErrorCodes.GUILD_INVALID_FACILITY, 'Invalid facility template.');
        }

        const existingFacility = await prisma.guildFacility.findFirst({
            where: { guildId: user.guildId, templateId: templateId }
        });
        
        if (existingFacility) {
            throw new AppError(ErrorCodes.GUILD_FACILITY_EXISTS, 'This facility already exists. Upgrade it instead.');
        }

        const guild = await guildRepository.findById(user.guildId);
        const cost = template.costBase;
        if (guild.treasury < cost) {
            throw new AppError(ErrorCodes.GUILD_TREASURY_INSUFFICIENT, `Insufficient treasury. Need ${cost} gold.`, {
                context: { required: cost, available: guild.treasury }
            });
        }

        await guildRepository.update(user.guildId, {
            treasury: { decrement: cost }
        });
        
        await guildRepository.addFacility(user.guildId, templateId, 1);

        await GuildUtils.addHistory(user.guildId, "FACILITY_BUILT", user.id, null, 
            `${user.username} built ${template.name}`);

        return { success: true, facility: { templateId, name: template.name, level: 1 } };
    }

    async upgradeFacility(user, facilityId) {
        if (!user.guildId) {
            throw new AppError(ErrorCodes.GUILD_NOT_IN_GUILD, 'You are not in a guild.');
        }
        if (!["MASTER", "OFFICER"].includes(user.guildRole)) {
            throw new AppError(ErrorCodes.GUILD_OFFICER_ONLY, 'Only officers can upgrade facilities.');
        }

        const facility = await guildRepository.getFacilityById(facilityId);
        if (!facility) {
            throw new AppError(ErrorCodes.GUILD_FACILITY_NOT_FOUND, 'Facility not found.');
        }
        if (facility.guildId !== user.guildId) {
            throw new AppError(ErrorCodes.GUILD_FACILITY_NOT_YOURS, "Facility doesn't belong to your guild.");
        }

        const template = await guildRepository.getFacilityTemplateById(facility.templateId);
        const upgradeCost = Math.floor(template.costBase * Math.pow(template.costMult, facility.level));
        
        const guild = await guildRepository.findById(user.guildId);
        if (guild.treasury < upgradeCost) {
            throw new AppError(ErrorCodes.GUILD_TREASURY_INSUFFICIENT, `Insufficient treasury. Need ${upgradeCost} gold.`, {
                context: { required: upgradeCost, available: guild.treasury }
            });
        }

        await guildRepository.update(user.guildId, {
            treasury: { decrement: upgradeCost }
        });
        
        await guildRepository.upgradeFacility(facilityId);

        await GuildUtils.addHistory(user.guildId, "FACILITY_UPGRADED", user.id, null, 
            `${user.username} upgraded ${template.name} to level ${facility.level + 1}`);

        return { success: true, newLevel: facility.level + 1 };
    }
}

module.exports = new GuildFacilityService();
