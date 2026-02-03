const prisma = require('../db');
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
        if (!user.heroes || user.heroes.length < (reqs.min_heroes || 0)) throw new Error("You need more heroes to form a guild.");

        // 4. Creation & Transaction
        const guild = await guildRepository.create({ name, description, templateId });

        // Deduct Gold and Link User as MASTER
        await userRepository.updateGold(user.id, user.gold - (reqs.gold_cost || 0));
        await userRepository.update(user.id, { 
            guildId: guild.id, 
            guildRole: "MASTER" 
        });

        // Add history
        await this.addHistory(guild.id, "CREATED", user.id, null, `Guild '${name}' was created by ${user.username}`);

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
        
        await userRepository.update(user.id, { 
            guildId: guild.id, 
            guildRole: "MEMBER" 
        });

        // Add history
        await this.addHistory(guild.id, "MEMBER_JOINED", user.id, null, `${user.username} joined the guild`);

        return guild;
    }

    /**
     * Leave the current guild.
     */
    async leaveGuild(user) {
        if (!user.guildId) throw new Error("You are not in a guild.");
        if (user.guildRole === "MASTER") throw new Error("Transfer guild leadership before leaving.");

        const guildId = user.guildId;
        await userRepository.update(user.id, { guildId: null, guildRole: null });

        // Add history
        await this.addHistory(guildId, "MEMBER_LEFT", user.id, null, `${user.username} left the guild`);

        return { success: true, message: "You have left the guild." };
    }

    /**
     * Kick a member from the guild.
     */
    async kickMember(requester, targetUserId) {
        const targetUser = await userRepository.findById(targetUserId);
        
        if (!targetUser || targetUser.guildId !== requester.guildId) {
            throw new Error("User is not in your guild.");
        }
        if (targetUser.guildRole === "MASTER") {
            throw new Error("Cannot kick the guild master. Transfer leadership first.");
        }
        if (!["MASTER", "OFFICER"].includes(requester.guildRole)) {
            throw new Error("You don't have permission to kick members.");
        }
        if (requester.id === targetUserId) {
            throw new Error("Cannot kick yourself. Use leave instead.");
        }

        await userRepository.update(targetUserId, { guildId: null, guildRole: null });

        // Add history
        await this.addHistory(requester.guildId, "KICKED", requester.id, targetUserId, 
            `${requester.username} kicked ${targetUser.username}`);

        return { success: true, message: `${targetUser.username} has been kicked from the guild.` };
    }

    /**
     * Promote a member to a new role.
     */
    async promoteMember(requester, targetUserId, newRole) {
        const targetUser = await userRepository.findById(targetUserId);
        
        if (!targetUser || targetUser.guildId !== requester.guildId) {
            throw new Error("User is not in your guild.");
        }
        if (targetUser.guildRole === "MASTER") {
            throw new Error("Cannot promote the guild master.");
        }
        if (!["MASTER", "OFFICER"].includes(requester.guildRole)) {
            throw new Error("You don't have permission to promote members.");
        }
        
        const validRoles = ["RECRUIT", "MEMBER", "OFFICER", "MASTER"];
        const currentRoleIndex = validRoles.indexOf(targetUser.guildRole);
        const newRoleIndex = validRoles.indexOf(newRole);
        
        if (newRoleIndex <= currentRoleIndex) {
            throw new Error("Cannot promote to a lower or equal rank.");
        }

        await userRepository.update(targetUserId, { guildRole: newRole });

        // Add history
        await this.addHistory(requester.guildId, "PROMOTED", requester.id, targetUserId, 
            `${targetUser.username} was promoted to ${newRole} by ${requester.username}`);

        return { success: true, message: `${targetUser.username} promoted to ${newRole}.` };
    }

    /**
     * Demote a member to a lower role.
     */
    async demoteMember(requester, targetUserId) {
        const targetUser = await userRepository.findById(targetUserId);
        
        if (!targetUser || targetUser.guildId !== requester.guildId) {
            throw new Error("User is not in your guild.");
        }
        if (targetUser.guildRole === "MASTER") {
            throw new Error("Cannot demote the guild master.");
        }
        if (!["MASTER", "OFFICER"].includes(requester.guildRole)) {
            throw new Error("You don't have permission to demote members.");
        }
        if (requester.id === targetUserId) {
            throw new Error("Cannot demote yourself.");
        }

        const roleHierarchy = ["RECRUIT", "MEMBER", "OFFICER"];
        const currentIndex = roleHierarchy.indexOf(targetUser.guildRole);
        
        if (currentIndex <= 0) {
            throw new Error("Cannot demote below RECRUIT rank.");
        }

        const newRole = roleHierarchy[currentIndex - 1];
        await userRepository.update(targetUserId, { guildRole: newRole });

        // Add history
        await this.addHistory(requester.guildId, "DEMOTED", requester.id, targetUserId, 
            `${targetUser.username} was demoted to ${newRole} by ${requester.username}`);

        return { success: true, message: `${targetUser.username} demoted to ${newRole}.` };
    }

    /**
     * Transfer guild leadership to another member.
     */
    async transferLeadership(requester, targetUserId) {
        if (requester.guildRole !== "MASTER") {
            throw new Error("Only the guild master can transfer leadership.");
        }

        const targetUser = await userRepository.findById(targetUserId);
        
        if (!targetUser || targetUser.guildId !== requester.guildId) {
            throw new Error("User is not in your guild.");
        }
        if (targetUser.guildRole === "MASTER") {
            throw new Error("User is already the master.");
        }

        // Transfer master role
        await userRepository.update(requester.id, { guildRole: "OFFICER" });
        await userRepository.update(targetUserId, { guildRole: "MASTER" });

        // Add history
        await this.addHistory(requester.guildId, "TRANSFERRED", requester.id, targetUserId, 
            `${requester.username} transferred guild leadership to ${targetUser.username}`);

        return { success: true, message: `Leadership transferred to ${targetUser.username}.` };
    }

    /**
     * Update guild settings.
     */
    async updateGuildSettings(requester, settings) {
        if (requester.guildRole !== "MASTER") {
            throw new Error("Only the guild master can update settings.");
        }

        const updateData = {};
        if (settings.description !== undefined) updateData.description = settings.description;
        if (settings.marketTaxRate !== undefined) updateData.marketTaxRate = settings.marketTaxRate;
        if (settings.gatheringTaxRate !== undefined) updateData.gatheringTaxRate = settings.gatheringTaxRate;

        await guildRepository.update(requester.guildId, updateData);

        // Add history
        await this.addHistory(requester.guildId, "SETTINGS_UPDATED", requester.id, null, 
            `Guild settings updated by ${requester.username}`);

        return { success: true, settings: updateData };
    }

    /**
     * Deposit gold to guild treasury.
     */
    async depositTreasury(user, amount) {
        if (!user.guildId) throw new Error("You are not in a guild.");
        if (amount <= 0) throw new Error("Amount must be positive.");
        if (user.gold < amount) throw new Error("Insufficient gold.");

        await userRepository.updateGold(user.id, user.gold - amount);
        const guild = await guildRepository.update(user.guildId, {
            treasury: { increment: amount }
        });

        // Add history
        await this.addHistory(user.guildId, "TREASURY_DEPOSIT", user.id, null, 
            `${user.username} deposited ${amount} gold to treasury`);

        return guild;
    }

    /**
     * Withdraw gold from guild treasury.
     */
    async withdrawTreasury(requester, amount) {
        if (!["MASTER", "OFFICER"].includes(requester.guildRole)) {
            throw new Error("Only officers can withdraw from treasury.");
        }
        if (amount <= 0) throw new Error("Amount must be positive.");

        const guild = await guildRepository.findById(requester.guildId);
        if (guild.treasury < amount) throw new Error("Insufficient funds in treasury.");

        await guildRepository.update(requester.guildId, {
            treasury: { decrement: amount }
        });
        await userRepository.updateGold(requester.id, requester.gold + amount);

        // Add history
        await this.addHistory(requester.guildId, "TREASURY_WITHDRAW", requester.id, null, 
            `${requester.username} withdrew ${amount} gold from treasury`);

        return { success: true, remainingTreasury: guild.treasury - amount };
    }

    /**
     * Build a new facility.
     */
    async buildFacility(user, templateId) {
        if (!user.guildId) throw new Error("You are not in a guild.");

        const template = await guildRepository.getFacilityTemplateById(templateId);
        if (!template) throw new Error("Invalid facility template.");

        // Check if facility already exists
        const existingFacility = await prisma.guildFacility.findFirst({
            where: { guildId: user.guildId, templateId: templateId }
        });
        
        if (existingFacility) {
            throw new Error("This facility already exists. Upgrade it instead.");
        }

        const guild = await guildRepository.findById(user.guildId);
        const cost = template.costBase;
        if (guild.treasury < cost) throw new Error(`Insufficient treasury. Need ${cost} gold.`);

        // Deduct cost and add facility
        await guildRepository.update(user.guildId, {
            treasury: { decrement: cost }
        });
        
        await guildRepository.addFacility(user.guildId, templateId, 1);

        // Add history
        await this.addHistory(user.guildId, "FACILITY_BUILT", user.id, null, 
            `${user.username} built ${template.name}`);

        return { success: true, facility: { templateId, name: template.name, level: 1 } };
    }

    /**
     * Upgrade an existing facility.
     */
    async upgradeFacility(user, facilityId) {
        if (!user.guildId) throw new Error("You are not in a guild.");
        if (!["MASTER", "OFFICER"].includes(user.guildRole)) {
            throw new Error("Only officers can upgrade facilities.");
        }

        const facility = await guildRepository.getFacilityById(facilityId);
        if (!facility) throw new Error("Facility not found.");
        if (facility.guildId !== user.guildId) throw new Error("Facility doesn't belong to your guild.");

        const template = await guildRepository.getFacilityTemplateById(facility.templateId);
        const upgradeCost = Math.floor(template.costBase * Math.pow(template.costMult, facility.level));
        
        const guild = await guildRepository.findById(user.guildId);
        if (guild.treasury < upgradeCost) throw new Error(`Insufficient treasury. Need ${upgradeCost} gold.`);

        // Deduct cost and upgrade
        await guildRepository.update(user.guildId, {
            treasury: { decrement: upgradeCost }
        });
        
        await guildRepository.upgradeFacility(facilityId);

        // Add history
        await this.addHistory(user.guildId, "FACILITY_UPGRADED", user.id, null, 
            `${user.username} upgraded ${template.name} to level ${facility.level + 1}`);

        return { success: true, newLevel: facility.level + 1 };
    }

    /**
     * Create an invite code.
     */
    async createInvite(user) {
        if (!["MASTER", "OFFICER"].includes(user.guildRole)) {
            throw new Error("Only officers can create invites.");
        }

        const inviteCode = this.generateInviteCode();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const invite = await guildRepository.createInvite({
            guildId: user.guildId,
            invitedBy: user.id,
            inviteCode,
            expiresAt
        });

        return { success: true, inviteId: invite.id, inviteCode, expiresAt };
    }

    /**
     * Accept an invite code.
     */
    async acceptInvite(user, inviteCode) {
        if (user.guildId) throw new Error("You are already in a guild. Leave first.");

        const invite = await guildRepository.findInviteByCode(inviteCode);
        if (!invite) throw new Error("Invalid invite code.");
        if (invite.status !== "PENDING") throw new Error("Invite is no longer valid.");
        if (new Date() > invite.expiresAt) throw new Error("Invite has expired.");

        // Update invite status
        await guildRepository.updateInviteStatus(invite.id, "ACCEPTED");

        // Add user to guild
        await userRepository.update(user.id, { 
            guildId: invite.guildId, 
            guildRole: "MEMBER" 
        });

        // Add history
        await this.addHistory(invite.guildId, "MEMBER_JOINED", user.id, null, 
            `${user.username} joined via invite code`);

        const guild = await guildRepository.findById(invite.guildId);
        return { success: true, guild };
    }

    /**
     * Cancel an invite.
     */
    async cancelInvite(user, inviteId) {
        if (!["MASTER", "OFFICER"].includes(user.guildRole)) {
            throw new Error("Only officers can cancel invites.");
        }

        const invite = await guildRepository.findInviteById(inviteId);
        if (!invite) throw new Error("Invite not found.");
        if (invite.guildId !== user.guildId) throw new Error("Invite doesn't belong to your guild.");
        if (invite.status !== "PENDING") throw new Error("Invite is not pending.");

        await guildRepository.updateInviteStatus(inviteId, "CANCELLED");

        return { success: true, message: "Invite cancelled." };
    }

    /**
     * Get full guild information.
     */
    async getGuildInfo(guildId) {
        const guild = await guildRepository.findById(guildId);
        if (!guild) throw new Error("Guild not found.");
        return guild;
    }

    /**
     * Get current user's guild.
     */
    async getMyGuild(user) {
        if (!user.guildId) return null;
        return await guildRepository.findById(user.guildId);
    }

    /**
     * Search guilds by name.
     */
    async searchGuilds(query, page = 1, limit = 10) {
        return await guildRepository.search(query, page, limit);
    }

    /**
     * Disband the guild.
     */
    async disbandGuild(user) {
        if (user.guildRole !== "MASTER") {
            throw new Error("Only the guild master can disband.");
        }

        const guildId = user.guildId;

        // Delete all related records first (cascade cleanup)
        await prisma.guildInvite.deleteMany({ where: { guildId } });
        await prisma.guildHistory.deleteMany({ where: { guildId } });
        await prisma.guildFacility.deleteMany({ where: { guildId } });
        await prisma.guildPerk.deleteMany({ where: { guildId } });
        
        // Remove all members from guild
        await userRepository.removeFromGuild(guildId);

        // Delete guild
        await guildRepository.delete(guildId);

        return { success: true, message: "Guild disbanded." };
    }

    /**
     * Add history entry.
     */
    async addHistory(guildId, eventType, userId, targetUserId, description) {
        await prisma.guildHistory.create({
            data: {
                guildId,
                eventType,
                userId,
                targetUserId,
                description
            }
        });
    }

    /**
     * Generate unique invite code.
     */
    generateInviteCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}

module.exports = new GuildService();
