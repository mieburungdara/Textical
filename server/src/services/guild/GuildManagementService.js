const prisma = require('../../db');
const guildRepository = require('../../repositories/guildRepository');
const userRepository = require('../../repositories/userRepository');
const transactionManager = require('../economy/TransactionManager');
const resolver = require('../../logic/economy/CurrencyResolver');
const GuildUtils = require('./GuildUtils');

/**
 * Service for core guild management (creation, leveling, settings).
 */
class GuildManagementService {
    async createGuild(user, templateId, name, description) {
        if (user.guildId) throw new Error("You are already a member of a guild.");

        const existing = await guildRepository.findByName(name);
        if (existing) throw new Error("Guild name is already taken.");

        const template = await guildRepository.getTemplateById(templateId);
        if (!template) throw new Error("Invalid guild template.");

        const reqs = JSON.parse(template.creationReqs || "{}");
        const costSilver = BigInt(reqs.gold_cost || 0);
        
        const userTotalSilver = resolver.getTotalSilver(user);
        if (userTotalSilver < costSilver) throw new Error("Insufficient funds to create this guild.");
        if (!user.heroes || user.heroes.length < (reqs.min_heroes || 0)) {
            throw new Error("You need more heroes to form a guild.");
        }

        const guild = await guildRepository.create({ name, description, templateId });

        await transactionManager.removeCurrency(prisma, user.id, costSilver, "GUILD_CREATION", guild.id, "GUILD");
        await userRepository.update(user.id, { 
            guildId: guild.id, 
            guildRole: "MASTER" 
        });

        await GuildUtils.addHistory(guild.id, "CREATED", user.id, null, `Guild '${name}' was created by ${user.username}`);

        console.log(`[GUILD] '${name}' created by ${user.username}`);
        return guild;
    }

    async addExp(guildId, amount) {
        const guild = await guildRepository.findById(guildId);
        let newExp = guild.exp + amount;
        let newLevel = guild.level;

        while (newExp >= newLevel * 5000) {
            newExp -= newLevel * 5000;
            newLevel++;
            console.log(`[GUILD] ${guild.name} reached Level ${newLevel}!`);
        }

        return await guildRepository.update(guildId, { exp: newExp, level: newLevel });
    }

    async updateGuildSettings(requester, settings) {
        if (requester.guildRole !== "MASTER") {
            throw new Error("Only the guild master can update settings.");
        }

        const updateData = {};
        if (settings.description !== undefined) updateData.description = settings.description;
        if (settings.marketTaxRate !== undefined) updateData.marketTaxRate = settings.marketTaxRate;
        if (settings.gatheringTaxRate !== undefined) updateData.gatheringTaxRate = settings.gatheringTaxRate;

        await guildRepository.update(requester.guildId, updateData);

        await GuildUtils.addHistory(requester.guildId, "SETTINGS_UPDATED", requester.id, null, 
            `Guild settings updated by ${requester.username}`);

        return { success: true, settings: updateData };
    }

    async getGuildInfo(guildId) {
        const guild = await guildRepository.findById(guildId);
        if (!guild) throw new Error("Guild not found.");
        return guild;
    }

    async getMyGuild(user) {
        if (!user.guildId) return null;
        return await guildRepository.findById(user.guildId);
    }

    async searchGuilds(query, page = 1, limit = 10) {
        return await guildRepository.search(query, page, limit);
    }

    async removeMembersFromGuild(guildId) {
        return await userRepository.updateManyUsers({
            where: { guildId },
            data: { guildId: null, guildRole: null }
        });
    }

    async disbandGuild(user) {
        if (user.guildRole !== "MASTER") {
            throw new Error("Only the guild master can disband.");
        }

        const guildId = user.guildId;

        await prisma.guildInvite.deleteMany({ where: { guildId } });
        await prisma.guildHistory.deleteMany({ where: { guildId } });
        await prisma.guildFacility.deleteMany({ where: { guildId } });
        await prisma.guildPerk.deleteMany({ where: { guildId } });
        
        await this.removeMembersFromGuild(guildId);
        await guildRepository.delete(guildId);

        return { success: true, message: "Guild disbanded." };
    }
}

module.exports = new GuildManagementService();
