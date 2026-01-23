const guildRepository = require('../repositories/guildRepository');
const userRepository = require('../repositories/userRepository');

class GuildService {
    /**
     * Creates a new player-run guild.
     */
    async createGuild(user, templateId, name, description) {
        // 1. Validation: Already in a guild?
        if (user.guildId) throw new Error("You are already a member of a guild.");

        // 2. Validation: Name uniqueness
        const existing = await guildRepository.findByName(name);
        if (existing) throw new Error("Guild name is already taken.");

        // 3. Validation: Requirements from Template
        const template = await guildRepository.getTemplateById(templateId);
        if (!template) throw new Error("Invalid guild template.");

        const reqs = JSON.parse(template.creationReqs || "{}");
        
        if (user.gold < (reqs.gold_cost || 0)) throw new Error("Insufficient Gold to create this guild.");
        if (user.fame < (reqs.min_fame || 0)) throw new Error("Insufficient Fame to lead this organization.");
        if (user.heroes.length < (reqs.min_heroes || 0)) throw new Error("You need more heroes to form a guild.");

        // 4. Creation & Transaction
        const guild = await guildRepository.create({ name, description, templateId });

        // Deduct Gold and Link User as MASTER
        await userRepository.updateGold(user.id, user.gold - (reqs.gold_cost || 0));
        await userRepository.update(user.id, { 
            guildId: guild.id, 
            guildRole: "MASTER" 
        });

        console.log(`[GUILD] '${name}' created by ${user.username}`);
        return guild;
    }

    /**
     * Handles experience gain and leveling up.
     */
    async addExp(guildId, amount) {
        const guild = await guildRepository.findById(guildId);
        let newExp = guild.exp + amount;
        let newLevel = guild.level;

        // AAA Leveling Formula: Level * 5000 XP
        while (newExp >= newLevel * 5000) {
            newExp -= newLevel * 5000;
            newLevel++;
            console.log(`[GUILD] ${guild.name} reached Level ${newLevel}!`);
        }

        return await guildRepository.update(guildId, { exp: newExp, level: newLevel });
    }

    async joinGuild(user, guildId) {
        if (user.guildId) throw new Error("Leave your current guild first.");
        
        const guild = await guildRepository.findById(guildId);
        if (!guild) throw new Error("Guild not found.");

        // Future: Check for member capacity based on guild level
        
        return await userRepository.update(user.id, { 
            guildId: guild.id, 
            guildRole: "MEMBER" 
        });
    }
}

module.exports = new GuildService();
