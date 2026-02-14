const userRepository = require('../../repositories/userRepository');
const guildRepository = require('../../repositories/guildRepository');
const GuildUtils = require('./GuildUtils');

/**
 * Service for handling guild members and roles.
 */
class GuildMemberService {
    async joinGuild(user, guildId) {
        if (user.guildId) throw new Error("Leave your current guild first.");
        
        const guild = await guildRepository.findById(guildId);
        if (!guild) throw new Error("Guild not found.");
        
        await userRepository.update(user.id, { 
            guildId: guild.id, 
            guildRole: "MEMBER" 
        });

        await GuildUtils.addHistory(guild.id, "MEMBER_JOINED", user.id, null, `${user.username} joined the guild`);
        return guild;
    }

    async leaveGuild(user) {
        if (!user.guildId) throw new Error("You are not in a guild.");
        if (user.guildRole === "MASTER") throw new Error("Transfer guild leadership before leaving.");

        const guildId = user.guildId;
        await userRepository.update(user.id, { guildId: null, guildRole: null });

        await GuildUtils.addHistory(guildId, "MEMBER_LEFT", user.id, null, `${user.username} left the guild`);
        return { success: true, message: "You have left the guild." };
    }

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

        await GuildUtils.addHistory(requester.guildId, "KICKED", requester.id, targetUserId, 
            `${requester.username} kicked ${targetUser.username}`);

        return { success: true, message: `${targetUser.username} has been kicked from the guild.` };
    }

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

        await GuildUtils.addHistory(requester.guildId, "PROMOTED", requester.id, targetUserId, 
            `${targetUser.username} was promoted to ${newRole} by ${requester.username}`);

        return { success: true, message: `${targetUser.username} promoted to ${newRole}.` };
    }

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

        await GuildUtils.addHistory(requester.guildId, "DEMOTED", requester.id, targetUserId, 
            `${targetUser.username} was demoted to ${newRole} by ${requester.username}`);

        return { success: true, message: `${targetUser.username} demoted to ${newRole}.` };
    }

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

        await userRepository.update(requester.id, { guildRole: "OFFICER" });
        await userRepository.update(targetUserId, { guildRole: "MASTER" });

        await GuildUtils.addHistory(requester.guildId, "TRANSFERRED", requester.id, targetUserId, 
            `${requester.username} transferred guild leadership to ${targetUser.username}`);

        return { success: true, message: `Leadership transferred to ${targetUser.username}.` };
    }

    async createInvite(user) {
        if (!["MASTER", "OFFICER"].includes(user.guildRole)) {
            throw new Error("Only officers can create invites.");
        }

        const inviteCode = GuildUtils.generateInviteCode();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invite = await guildRepository.createInvite({
            guildId: user.guildId,
            invitedBy: user.id,
            inviteCode,
            expiresAt
        });

        return { success: true, inviteId: invite.id, inviteCode, expiresAt };
    }

    async acceptInvite(user, inviteCode) {
        if (user.guildId) throw new Error("You are already in a guild. Leave first.");

        const invite = await guildRepository.findInviteByCode(inviteCode);
        if (!invite) throw new Error("Invalid invite code.");
        if (invite.status !== "PENDING") throw new Error("Invite is no longer valid.");
        if (new Date() > invite.expiresAt) throw new Error("Invite has expired.");

        await guildRepository.updateInviteStatus(invite.id, "ACCEPTED");

        await userRepository.update(user.id, { 
            guildId: invite.guildId, 
            guildRole: "MEMBER" 
        });

        await GuildUtils.addHistory(invite.guildId, "MEMBER_JOINED", user.id, null, 
            `${user.username} joined via invite code`);

        const guild = await guildRepository.findById(invite.guildId);
        return { success: true, guild };
    }

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
}

module.exports = new GuildMemberService();
