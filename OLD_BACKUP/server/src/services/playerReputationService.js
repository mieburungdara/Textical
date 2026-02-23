const BaseService = require('./BaseService');
const logger = require('../utils/logger');

/**
 * PlayerReputationService
 * Manages like/dislike reputation between players.
 * 
 * Features:
 * - Give like/dislike to players you've interacted with
 * - Optional comment with like/dislike
 * - Tier/badge system based on total likes/dislikes
 * - Validation to ensure interaction history exists
 */
class PlayerReputationService extends BaseService {
    constructor() {
        super();
        // Tier thresholds for likes (10+ tiers)
        this.LIKE_TIERS = [
            { tier: 0, min: 0, name: 'Newcomer', icon: '⭐' },
            { tier: 1, min: 10, name: 'Known Face', icon: '⭐⭐' },
            { tier: 2, min: 50, name: 'Trusted', icon: '⭐⭐⭐' },
            { tier: 3, min: 100, name: 'Reliable', icon: '🏅' },
            { tier: 4, min: 250, name: 'Veteran', icon: '🏅🏅' },
            { tier: 5, min: 500, name: 'Esteemed', icon: '🏅🏅🏅' },
            { tier: 6, min: 1000, name: 'Respected', icon: '👑' },
            { tier: 7, min: 2500, name: 'Distinguished', icon: '👑👑' },
            { tier: 8, min: 5000, name: 'Legendary', icon: '👑👑👑' },
            { tier: 9, min: 10000, name: 'Paragon', icon: '🌟' },
            { tier: 10, min: 25000, name: 'Celestial', icon: '🌟🌟' },
            { tier: 11, min: 50000, name: 'Divine', icon: '🌟🌟🌟' },
        ];

        // Tier thresholds for dislikes (same structure)
        this.DISLIKE_TIERS = this.LIKE_TIERS;
        
        // Maximum comment length
        this.MAX_COMMENT_LENGTH = 500;
    }

    /**
     * Calculate tier based on count
     */
    calculateTier(count, tiers) {
        let currentTier = tiers[0];
        for (let i = tiers.length - 1; i >= 0; i--) {
            if (count >= tiers[i].min) {
                currentTier = tiers[i];
                break;
            }
        }
        return currentTier;
    }

    /**
     * Get tier info
     */
    getTierInfo(count, type = 'like') {
        const tiers = type === 'like' ? this.LIKE_TIERS : this.DISLIKE_TIERS;
        const tier = this.calculateTier(count, tiers);
        
        // Determine if special badge should show
        let specialBadge = null;
        if (type === 'like' && count >= 1000) {
            // High like count - show Angel Wings potential
            specialBadge = 'ANGEL_WINGS';
        } else if (type === 'dislike' && count >= 100) {
            // High dislike count - show Devil Horns potential
            specialBadge = 'DEVIL_HORNS';
        }
        
        return {
            tier: tier.tier,
            name: tier.name,
            icon: tier.icon,
            count: count,
            specialBadge: specialBadge
        };
    }

    /**
     * Check if two players have interaction history
     * Returns true if they have interacted (guild, trade, party, etc.)
     * Also returns the type of first interaction
     */
    async getInteractionDetails(fromUserId, toUserId) {
        const db = this.db;
        
        // Check if they're in the same guild
        const fromUser = await db.user.findUnique({
            where: { id: fromUserId },
            select: { guildId: true, username: true }
        });
        
        const toUser = await db.user.findUnique({
            where: { id: toUserId },
            select: { guildId: true, username: true }
        });
        
        // Same guild
        if (fromUser?.guildId && fromUser.guildId === toUser?.guildId) {
            return { hasInteraction: true, interactionType: 'GUILD' };
        }
        
        // Check trade history (market orders) - find earliest trade
        const tradeHistory = await db.marketOrder.findFirst({
            where: {
                OR: [
                    { creatorId: fromUserId, status: 'COMPLETED' },
                    { creatorId: toUserId, status: 'COMPLETED' }
                ]
            },
            orderBy: { createdAt: 'asc' },
            take: 1
        });
        if (tradeHistory) return { hasInteraction: true, interactionType: 'TRADE' };
        
        // Check PvP/loot sessions
        const lootSession = await db.lootSession.findFirst({
            where: {
                OR: [
                    { looterId: fromUserId, victimId: toUserId },
                    { looterId: toUserId, victimId: fromUserId }
                ]
            },
            orderBy: { createdAt: 'asc' },
            take: 1
        });
        if (lootSession) return { hasInteraction: true, interactionType: 'PVP' };
        
        // Check property guest relationship
        const propertyGuest = await db.propertyGuest.findFirst({
            where: {
                OR: [
                    { guestUserId: fromUserId, property: { userId: toUserId } },
                    { guestUserId: toUserId, property: { userId: fromUserId } }
                ]
            },
            orderBy: { createdAt: 'asc' },
            take: 1
        });
        if (propertyGuest) return { hasInteraction: true, interactionType: 'PROPERTY' };
        
        // Check friend relationship
        const friendRelation = await db.userFriend.findFirst({
            where: {
                OR: [
                    { userId: fromUserId, friendId: toUserId, status: 'ACCEPTED' },
                    { userId: toUserId, friendId: fromUserId, status: 'ACCEPTED' }
                ]
            },
            orderBy: { createdAt: 'asc' },
            take: 1
        });
        if (friendRelation) return { hasInteraction: true, interactionType: 'FRIEND' };
        
        return { hasInteraction: false, interactionType: null };
    }

    /**
     * Check if two players have interaction history
     * Returns true if they have interacted (guild, trade, party, etc.)
     */
    async hasInteractionHistory(fromUserId, toUserId) {
        const result = await this.getInteractionDetails(fromUserId, toUserId);
        return result.hasInteraction;
    }

    /**
     * Give like or dislike to a player
     */
    async giveReputation(fromUserId, toUserId, type, comment = null) {
        logger.info('[PlayerReputationService.giveReputation]', {
            fromUserId,
            toUserId,
            type
        });

        // Validate type
        if (type !== 'LIKE' && type !== 'DISLIKE') {
            throw new Error('Invalid reputation type. Must be LIKE or DISLIKE');
        }

        // Cannot give reputation to yourself
        if (fromUserId === toUserId) {
            throw new Error('Cannot give reputation to yourself');
        }

        // Check if target user exists
        const targetUser = await this.db.user.findUnique({
            where: { id: toUserId },
            select: { id: true, username: true }
        });

        if (!targetUser) {
            throw new Error('Target user not found');
        }

        // Validate comment length
        if (comment && comment.length > this.MAX_COMMENT_LENGTH) {
            throw new Error(`Comment too long. Maximum ${this.MAX_COMMENT_LENGTH} characters`);
        }

        // Check interaction history
        const interaction = await this.getInteractionDetails(fromUserId, toUserId);
        if (!interaction.hasInteraction) {
            throw new Error('You can only give reputation to players you have interacted with (guild, trade, party, PvP, or friends)');
        }

        // Check if already gave reputation
        const existing = await this.db.playerReputation.findUnique({
            where: { fromUserId_toUserId: { fromUserId, toUserId } }
        });

        if (existing) {
            // If same type, just update comment (player changed their mind about comment)
            if (existing.type === type) {
                await this.db.playerReputation.update({
                    where: { id: existing.id },
                    data: { comment: comment }
                });
                
                logger.info('[PlayerReputationService.giveReputation] Updated comment', {
                    fromUserId,
                    toUserId,
                    type,
                    newComment: comment
                });
                
                return {
                    success: true,
                    message: `Updated comment for ${type.toLowerCase()}`,
                    type: type
                };
            }
            
            // If different type, update and adjust stats (player changed their mind)
            const oldType = existing.type;
            
            // Update the reputation
            await this.db.playerReputation.update({
                where: { id: existing.id },
                data: {
                    type: type,
                    comment: comment
                }
            });

            // Update stats for both users
            // Decrease old type count for recipient
            if (oldType === 'LIKE') {
                await this.db.playerReputationStats.update({
                    where: { userId: toUserId },
                    data: { totalLikes: { decrement: 1 } }
                });
            } else {
                await this.db.playerReputationStats.update({
                    where: { userId: toUserId },
                    data: { totalDislikes: { decrement: 1 } }
                });
            }

            // Increase new type count for recipient
            if (type === 'LIKE') {
                await this.db.playerReputationStats.update({
                    where: { userId: toUserId },
                    data: { totalLikes: { increment: 1 } }
                });
            } else {
                await this.db.playerReputationStats.update({
                    where: { userId: toUserId },
                    data: { totalDislikes: { increment: 1 } }
                });
            }

            logger.info('[PlayerReputationService.giveReputation] Updated reputation', {
                fromUserId,
                toUserId,
                oldType,
                newType: type
            });

            // Recalculate tiers
            await this.recalculateTiers(toUserId);

            return {
                success: true,
                message: `Changed reputation from ${oldType} to ${type}`,
                type: type
            };
        }

        // Create new reputation
        await this.db.playerReputation.create({
            data: {
                fromUserId: fromUserId,
                toUserId: toUserId,
                type: type,
                comment: comment,
                interactionType: interaction.interactionType
            }
        });

        // Update stats for recipient
        await this.db.playerReputationStats.upsert({
            where: { userId: toUserId },
            update: {
                totalLikes: type === 'LIKE' ? { increment: 1 } : undefined,
                totalDislikes: type === 'DISLIKE' ? { increment: 1 } : undefined
            },
            create: {
                userId: toUserId,
                totalLikes: type === 'LIKE' ? 1 : 0,
                totalDislikes: type === 'DISLIKE' ? 1 : 0
            }
        });

        // Recalculate tiers
        await this.recalculateTiers(toUserId);

        logger.info('[PlayerReputationService.giveReputation] Created new reputation', {
            fromUserId,
            toUserId,
            type
        });

        return {
            success: true,
            message: `Gave ${type.toLowerCase()} to ${targetUser.username}`,
            type: type
        };
    }

    /**
     * Remove reputation (unlike/undislike)
     */
    async removeReputation(fromUserId, toUserId) {
        logger.info('[PlayerReputationService.removeReputation]', {
            fromUserId,
            toUserId
        });

        const existing = await this.db.playerReputation.findUnique({
            where: { fromUserId_toUserId: { fromUserId, toUserId } }
        });

        if (!existing) {
            throw new Error('No reputation given to this player');
        }

        // Get recipient stats
        const stats = await this.db.playerReputationStats.findUnique({
            where: { userId: toUserId }
        });

        // Delete the reputation
        await this.db.playerReputation.delete({
            where: { id: existing.id }
        });

        // Update stats
        if (existing.type === 'LIKE' && stats) {
            await this.db.playerReputationStats.update({
                where: { userId: toUserId },
                data: { totalLikes: { decrement: 1 } }
            });
        } else if (existing.type === 'DISLIKE' && stats) {
            await this.db.playerReputationStats.update({
                where: { userId: toUserId },
                data: { totalDislikes: { decrement: 1 } }
            });
        }

        // Recalculate tiers
        await this.recalculateTiers(toUserId);

        return {
            success: true,
            message: 'Removed reputation'
        };
    }

    /**
     * Get reputation stats for a user
     */
    async getUserReputationStats(userId) {
        let stats = await this.db.playerReputationStats.findUnique({
            where: { userId: userId }
        });

        // Create default stats if not exists
        if (!stats) {
            stats = await this.db.playerReputationStats.create({
                data: { userId: userId }
            });
        }

        // Get tier info
        const likeTier = this.getTierInfo(stats.totalLikes, 'like');
        const dislikeTier = this.getTierInfo(stats.totalDislikes, 'dislike');

        // Determine active special badges
        let activeBadges = [];
        
        // Angel Wings: likes > 1000 AND likes > dislikes * 2
        if (stats.totalLikes > 1000 && stats.totalLikes > stats.totalDislikes * 2) {
            activeBadges.push({
                type: 'ANGEL_WINGS',
                icon: '❤️',
                name: 'Angel Wings',
                description: 'Trusted and loved by the community'
            });
        }
        
        // Devil Horns: dislikes > 100 AND dislikes > likes * 2
        if (stats.totalDislikes > 100 && stats.totalDislikes > stats.totalLikes * 2) {
            activeBadges.push({
                type: 'DEVIL_HORNS',
                icon: '😈',
                name: 'Devil Horns',
                description: 'Known for negative behavior'
            });
        }

        return {
            userId: stats.userId,
            totalLikes: stats.totalLikes,
            totalDislikes: stats.totalDislikes,
            likeTier: likeTier,
            dislikeTier: dislikeTier,
            activeBadges: activeBadges,
            netReputation: stats.totalLikes - stats.totalDislikes
        };
    }

    /**
     * Get all comments for a user
     */
    async getUserComments(userId, limit = 20, offset = 0) {
        const comments = await this.db.playerReputation.findMany({
            where: {
                toUserId: userId,
                comment: { not: null }
            },
            include: {
                fromUser: {
                    select: { id: true, username: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        return comments.map(c => ({
            id: c.id,
            type: c.type,
            comment: c.comment,
            interactionType: c.interactionType,
            fromUserId: c.fromUserId,
            fromUsername: c.fromUser.username,
            createdAt: c.createdAt
        }));
    }

    /**
     * Get reputation given by user to others
     */
    async getGivenReputations(userId) {
        const reputations = await this.db.playerReputation.findMany({
            where: { fromUserId: userId },
            include: {
                toUser: {
                    select: { id: true, username: true }
                }
            }
        });

        return reputations.map(r => ({
            id: r.id,
            type: r.type,
            comment: r.comment,
            interactionType: r.interactionType,
            toUserId: r.toUserId,
            toUsername: r.toUser.username,
            createdAt: r.createdAt
        }));
    }

    /**
     * Recalculate tiers for a user
     */
    async recalculateTiers(userId) {
        const stats = await this.db.playerReputationStats.findUnique({
            where: { userId: userId }
        });

        if (!stats) return;

        const likeTier = this.calculateTier(stats.totalLikes, this.LIKE_TIERS);
        const dislikeTier = this.calculateTier(stats.totalDislikes, this.DISLIKE_TIERS);

        await this.db.playerReputationStats.update({
            where: { userId: userId },
            data: {
                likeTier: likeTier.tier,
                dislikeTier: dislikeTier.tier
            }
        });
    }

    /**
     * Check if current user can give reputation to target user
     */
    async canGiveReputation(fromUserId, toUserId) {
        // Cannot give to yourself
        if (fromUserId === toUserId) {
            return { canGive: false, reason: 'Cannot give reputation to yourself' };
        }

        // Check if target user exists
        const targetUser = await this.db.user.findUnique({
            where: { id: toUserId },
            select: { id: true }
        });

        if (!targetUser) {
            return { canGive: false, reason: 'Target user not found' };
        }

        // Check interaction history
        const hasInteraction = await this.hasInteractionHistory(fromUserId, toUserId);
        if (!hasInteraction) {
            return { 
                canGive: false, 
                reason: 'No interaction history. Must have guild membership, trade, party, PvP, or friend connection' 
            };
        }

        // Check existing reputation
        const existing = await this.db.playerReputation.findUnique({
            where: { fromUserId_toUserId: { fromUserId, toUserId } }
        });

        if (existing) {
            return { 
                canGive: true, 
                existingType: existing.type,
                existingComment: existing.comment,
                canChange: true,
                canUpdateComment: true
            };
        }

        return { canGive: true };
    }

    /**
     * Get list of users the current user has interacted with
     * This allows UI to show like/dislike buttons automatically
     */
    async getInteractableUsers(fromUserId) {
        const db = this.db;
        const interactableUsers = [];
        const processedUserIds = new Set();
        processedUserIds.add(fromUserId);

        // Get user info
        const currentUser = await db.user.findUnique({
            where: { id: fromUserId },
            select: { guildId: true, username: true }
        });

        // 1. Get users in same guild
        if (currentUser?.guildId) {
            const guildMembers = await db.user.findMany({
                where: {
                    guildId: currentUser.guildId,
                    id: { not: fromUserId }
                },
                select: { id: true, username: true }
            });
            for (const member of guildMembers) {
                if (!processedUserIds.has(member.id)) {
                    interactableUsers.push({
                        userId: member.id,
                        username: member.username,
                        interactionType: 'GUILD'
                    });
                    processedUserIds.add(member.id);
                }
            }
        }

        // 2. Get users traded with (completed market orders)
        const trades = await db.marketOrder.findMany({
            where: {
                OR: [
                    { creatorId: fromUserId, status: 'COMPLETED' },
                    { creatorId: { in: Array.from(processedUserIds) }, status: 'COMPLETED' }
                ]
            },
            select: { creatorId: true }
        });
        for (const trade of trades) {
            if (trade.creatorId !== fromUserId && !processedUserIds.has(trade.creatorId)) {
                const user = await db.user.findUnique({
                    where: { id: trade.creatorId },
                    select: { username: true }
                });
                if (user) {
                    interactableUsers.push({
                        userId: trade.creatorId,
                        username: user.username,
                        interactionType: 'TRADE'
                    });
                    processedUserIds.add(trade.creatorId);
                }
            }
        }

        // 3. Get users PvP'd with
        const pvpSessions = await db.lootSession.findMany({
            where: {
                OR: [
                    { looterId: fromUserId },
                    { victimId: fromUserId }
                ]
            },
            select: { looterId: true, victimId: true }
        });
        for (const session of pvpSessions) {
            const otherUserId = session.looterId === fromUserId ? session.victimId : session.looterId;
            if (!processedUserIds.has(otherUserId)) {
                const user = await db.user.findUnique({
                    where: { id: otherUserId },
                    select: { username: true }
                });
                if (user) {
                    interactableUsers.push({
                        userId: otherUserId,
                        username: user.username,
                        interactionType: 'PVP'
                    });
                    processedUserIds.add(otherUserId);
                }
            }
        }

        // 4. Get property guests/hosts
        const propertyRelations = await db.propertyGuest.findMany({
            where: {
                OR: [
                    { guestUserId: fromUserId },
                    { property: { userId: fromUserId } }
                ]
            },
            select: { guestUserId: true, property: { select: { userId: true } } }
        });
        for (const rel of propertyRelations) {
            const otherUserId = rel.guestUserId === fromUserId ? rel.property.userId : rel.guestUserId;
            if (!processedUserIds.has(otherUserId)) {
                const user = await db.user.findUnique({
                    where: { id: otherUserId },
                    select: { username: true }
                });
                if (user) {
                    interactableUsers.push({
                        userId: otherUserId,
                        username: user.username,
                        interactionType: 'PROPERTY'
                    });
                    processedUserIds.add(otherUserId);
                }
            }
        }

        // 5. Get friends
        const friends = await db.userFriend.findMany({
            where: {
                OR: [
                    { userId: fromUserId, status: 'ACCEPTED' },
                    { friendId: fromUserId, status: 'ACCEPTED' }
                ]
            },
            select: { userId: true, friendId: true }
        });
        for (const friend of friends) {
            const otherUserId = friend.userId === fromUserId ? friend.friendId : friend.userId;
            if (!processedUserIds.has(otherUserId)) {
                const user = await db.user.findUnique({
                    where: { id: otherUserId },
                    select: { username: true }
                });
                if (user) {
                    interactableUsers.push({
                        userId: otherUserId,
                        username: user.username,
                        interactionType: 'FRIEND'
                    });
                    processedUserIds.add(otherUserId);
                }
            }
        }

        // Now get reputation status for each user
        const results = [];
        for (const user of interactableUsers) {
            const existing = await db.playerReputation.findUnique({
                where: { fromUserId_toUserId: { fromUserId, toUserId: user.userId } }
            });
            results.push({
                ...user,
                hasGivenReputation: !!existing,
                givenType: existing?.type || null,
                comment: existing?.comment || null,
                canGiveReputation: true
            });
        }

        return results;
    }

    /**
     * Get leaderboard of top players by reputation
     */
    async getLeaderboard(type = 'likes', limit = 50) {
        const db = this.db;
        
        const orderByField = type === 'likes' ? 'totalLikes' : 'totalDislikes';
        const rankField = type === 'likes' ? 'likeTier' : 'dislikeTier';
        
        // Get top players by likes or dislikes
        const leaders = await db.playerReputationStats.findMany({
            orderBy: { [orderByField]: 'desc' },
            take: limit,
            include: {
                user: {
                    select: { username: true }
                }
            }
        });

        return leaders.map((stats, index) => {
            const tier = this.getTierInfo(stats[orderByField], type);
            return {
                rank: index + 1,
                userId: stats.userId,
                username: stats.user.username,
                [type]: stats[orderByField],
                tier: tier.name,
                tierIcon: tier.icon,
                netReputation: stats.totalLikes - stats.totalDislikes
            };
        });
    }

    /**
     * Get guild aggregate reputation
     */
    async getGuildReputation(guildId) {
        const db = this.db;
        
        // Get all guild members
        const members = await db.user.findMany({
            where: { guildId: guildId },
            select: { id: true, username: true }
        });

        if (members.length === 0) {
            return {
                guildId: guildId,
                memberCount: 0,
                totalLikes: 0,
                totalDislikes: 0,
                averageLikes: 0,
                averageDislikes: 0,
                averageNetReputation: 0,
                topMembers: []
            };
        }

        // Get reputation stats for all members
        const memberIds = members.map(m => m.id);
        const stats = await db.playerReputationStats.findMany({
            where: { userId: { in: memberIds } }
        });

        // Create map for quick lookup
        const statsMap = {};
        for (const s of stats) {
            statsMap[s.userId] = s;
        }

        let totalLikes = 0;
        let totalDislikes = 0;
        const memberStats = [];

        for (const member of members) {
            const s = statsMap[member.id] || { totalLikes: 0, totalDislikes: 0 };
            totalLikes += s.totalLikes;
            totalDislikes += s.totalDislikes;
            
            memberStats.push({
                userId: member.id,
                username: member.username,
                likes: s.totalLikes,
                dislikes: s.totalDislikes,
                netReputation: s.totalLikes - s.totalDislikes
            });
        }

        // Sort by net reputation descending
        memberStats.sort((a, b) => b.netReputation - a.netReputation);

        const memberCount = members.length;
        const averageLikes = Math.round(totalLikes / memberCount);
        const averageDislikes = Math.round(totalDislikes / memberCount);
        const averageNetReputation = Math.round((totalLikes - totalDislikes) / memberCount);

        return {
            guildId: guildId,
            memberCount: memberCount,
            totalLikes: totalLikes,
            totalDislikes: totalDislikes,
            averageLikes: averageLikes,
            averageDislikes: averageDislikes,
            averageNetReputation: averageNetReputation,
            topMembers: memberStats.slice(0, 10)
        };
    }
}

module.exports = new PlayerReputationService();
