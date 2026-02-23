const guildService = require('../services/guildService');
const userRepository = require('../repositories/userRepository');
const { emitEvent, emitError } = require('./BaseSocketHandler');

class GuildHandler {
    async handleCreateGuild(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const guild = await guildService.createGuild(user, request.templateId, request.name, request.description);
            
            // Sync user data
            const updatedUser = await userRepository.findById(ws.userId);
            emitEvent(ws, "guild:created", {
                user: updatedUser,
                guild: guild,
                message: `Guild '${guild.name}' established successfully!`
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleJoinGuild(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const guild = await guildService.joinGuild(user, request.guildId);
            
            const updatedUser = await userRepository.findById(ws.userId);
            emitEvent(ws, "guild:joined", {
                user: updatedUser,
                guild: guild,
                message: "You have joined the guild."
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleLeaveGuild(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            await guildService.leaveGuild(user);
            
            const updatedUser = await userRepository.findById(ws.userId);
            emitEvent(ws, "guild:left", {
                user: updatedUser,
                message: "You have left the guild."
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleKickMember(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            await guildService.kickMember(user, request.targetUserId);
            
            emitEvent(ws, "guild:member_kicked", {
                targetUserId: request.targetUserId
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handlePromoteMember(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            await guildService.promoteMember(user, request.targetUserId, request.newRole);
            
            emitEvent(ws, "guild:member_promoted", {
                userId: request.targetUserId,
                newRole: request.newRole
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleDemoteMember(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const result = await guildService.demoteMember(user, request.targetUserId);
            
            emitEvent(ws, "guild:member_demoted", {
                userId: request.targetUserId,
                newRole: result.newRole
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleTransferLeadership(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            await guildService.transferLeadership(user, request.targetUserId);
            
            emitEvent(ws, "guild:leadership_transferred", {
                newMasterId: request.targetUserId
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleUpdateSettings(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const result = await guildService.updateGuildSettings(user, request.settings);
            
            emitEvent(ws, "guild:settings_updated", {
                settings: result.settings
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleDepositTreasury(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            await guildService.depositTreasury(user, request.amount);
            
            const updatedUser = await userRepository.findById(ws.userId);
            emitEvent(ws, "guild:treasury_updated", {
                gold: updatedUser.gold,
                silver: updatedUser.silver
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleWithdrawTreasury(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const result = await guildService.withdrawTreasury(user, request.amount);
            
            emitEvent(ws, "guild:treasury_updated", {
                gold: Math.floor(result.remainingTreasury / 1000),
                silver: result.remainingTreasury % 1000
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleBuildFacility(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const result = await guildService.buildFacility(user, request.templateId);
            
            emitEvent(ws, "guild:facility_built", {
                facility: result.facility
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleUpgradeFacility(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const result = await guildService.upgradeFacility(user, request.facilityId);
            
            emitEvent(ws, "guild:facility_upgraded", {
                facilityId: request.facilityId,
                newLevel: result.newLevel
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleCreateInvite(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const result = await guildService.createInvite(user);
            
            emitEvent(ws, "guild:invite_created", {
                inviteCode: result.inviteCode,
                expiresAt: result.expiresAt.toISOString()
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleAcceptInvite(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const result = await guildService.acceptInvite(user, request.inviteCode);
            
            const updatedUser = await userRepository.findById(ws.userId);
            emitEvent(ws, "guild:invite_accepted", {
                user: updatedUser,
                guild: result.guild
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleCancelInvite(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            await guildService.cancelInvite(user, request.inviteId);
            
            emitEvent(ws, "guild:invite_cancelled", {
                inviteId: request.inviteId
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleGetGuildInfo(ws, request) {
        try {
            const guild = await guildService.getGuildInfo(request.guildId);
            emitEvent(ws, "guild:info", { guild });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleGetMyGuild(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            const guild = await guildService.getMyGuild(user);
            emitEvent(ws, "guild:my_info", { guild });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleSearchGuilds(ws, request) {
        try {
            const guilds = await guildService.searchGuilds(request.query, request.page, request.limit);
            emitEvent(ws, "guild:search_results", { guilds });
        } catch (e) {
            emitError(ws, e.message);
        }
    }

    async handleDisbandGuild(ws, request) {
        try {
            const user = await userRepository.findById(ws.userId);
            await guildService.disbandGuild(user);
            
            const updatedUser = await userRepository.findById(ws.userId);
            emitEvent(ws, "guild:disbanded", {
                user: updatedUser,
                message: "Guild has been disbanded."
            });
        } catch (e) {
            emitError(ws, e.message);
        }
    }
}

module.exports = new GuildHandler();
