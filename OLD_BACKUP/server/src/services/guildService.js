const memberService = require('./guild/GuildMemberService');
const managementService = require('./guild/GuildManagementService');
const treasuryService = require('./guild/GuildTreasuryService');
const facilityService = require('./guild/GuildFacilityService');
const GuildUtils = require('./guild/GuildUtils');

/**
 * GuildService Facade
 * Delegates implementation to specialized sub-services for SRP adherence.
 */
class GuildService {
    // --- Core Management ---
    async createGuild(user, templateId, name, description) {
        return managementService.createGuild(user, templateId, name, description);
    }

    async addExp(guildId, amount) {
        return managementService.addExp(guildId, amount);
    }

    async updateGuildSettings(requester, settings) {
        return managementService.updateGuildSettings(requester, settings);
    }

    async getGuildInfo(guildId) {
        return managementService.getGuildInfo(guildId);
    }

    async getMyGuild(user) {
        return managementService.getMyGuild(user);
    }

    async searchGuilds(query, page, limit) {
        return managementService.searchGuilds(query, page, limit);
    }

    async disbandGuild(user) {
        return managementService.disbandGuild(user);
    }

    // --- Membership ---
    async joinGuild(user, guildId) {
        return memberService.joinGuild(user, guildId);
    }

    async leaveGuild(user) {
        return memberService.leaveGuild(user);
    }

    async kickMember(requester, targetUserId) {
        return memberService.kickMember(requester, targetUserId);
    }

    async promoteMember(requester, targetUserId, newRole) {
        return memberService.promoteMember(requester, targetUserId, newRole);
    }

    async demoteMember(requester, targetUserId) {
        return memberService.demoteMember(requester, targetUserId);
    }

    async transferLeadership(requester, targetUserId) {
        return memberService.transferLeadership(requester, targetUserId);
    }

    async createInvite(user) {
        return memberService.createInvite(user);
    }

    async acceptInvite(user, inviteCode) {
        return memberService.acceptInvite(user, inviteCode);
    }

    async cancelInvite(user, inviteId) {
        return memberService.cancelInvite(user, inviteId);
    }

    // --- Treasury ---
    async depositTreasury(user, amount) {
        return treasuryService.depositTreasury(user, amount);
    }

    async withdrawTreasury(requester, amount) {
        return treasuryService.withdrawTreasury(requester, amount);
    }

    // --- Facilities ---
    async buildFacility(user, templateId) {
        return facilityService.buildFacility(user, templateId);
    }

    async upgradeFacility(user, facilityId) {
        return facilityService.upgradeFacility(user, facilityId);
    }

    // --- Utilities & Legacy Hooks ---
    async addHistory(guildId, eventType, userId, targetUserId, description) {
        return GuildUtils.addHistory(guildId, eventType, userId, targetUserId, description);
    }

    generateInviteCode() {
        return GuildUtils.generateInviteCode();
    }

    async removeMembersFromGuild(guildId) {
        return managementService.removeMembersFromGuild(guildId);
    }
}

module.exports = new GuildService();
