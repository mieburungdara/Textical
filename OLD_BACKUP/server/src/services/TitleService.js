const prisma = require('../db');
const logger = require('../utils/logger');


class TitleService {
    // Grant a title to a player
    async grantTitle(userId, title, source = 'ACHIEVEMENT', sourceCode = null) {
        logger.info(`[TitleService] Granting title "${title}" to user ${userId}`);
        
        try {
            // Check if player already has this title
            const existing = await prisma.playerTitle.findUnique({
                where: {
                    userId_title: { userId, title }
                }
            });

            if (existing) {
                logger.debug(`[TitleService] User ${userId} already has title "${title}"`);
                return existing;
            }

            // Get title metadata
            const titleMeta = this._getTitleMetadata(title);

            // Create the title
            const newTitle = await prisma.playerTitle.create({
                data: {
                    userId,
                    title,
                    icon: titleMeta.icon,
                    badgeColor: titleMeta.badgeColor,
                    source,
                    sourceCode,
                    isActive: false, // Don't auto-equip
                    createdAt: new Date()
                }
            });

            logger.info(`[TitleService] Title "${title}" granted to user ${userId}`);
            return newTitle;
        } catch (error) {
            logger.error(`[TitleService] Error granting title:`, error);
            throw error;
        }
    }

    // Get all titles for a player
    async getTitles(userId) {
        return prisma.playerTitle.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Get player's active title
    async getActiveTitle(userId) {
        return prisma.playerTitle.findFirst({
            where: {
                userId,
                isActive: true
            }
        });
    }

    // Equip a title (make it active)
    async equipTitle(userId, titleId) {
        // First, deactivate all titles for this user
        await prisma.playerTitle.updateMany({
            where: { userId },
            data: { isActive: false }
        });

        // Activate the selected title
        const title = await prisma.playerTitle.update({
            where: { id: titleId },
            data: {
                isActive: true,
                activatedAt: new Date()
            }
        });

        logger.info(`[TitleService] User ${userId} equipped title "${title.title}"`);
        return title;
    }

    // Unequip current title
    async unequipTitle(userId) {
        await prisma.playerTitle.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false, activatedAt: null }
        });
    }

    // Get title metadata
    _getTitleMetadata(titleName) {
        const titleMetadata = {
            // Combat titles
            'Brawler': { icon: '🥊', badgeColor: '#cd7f32' }, // Bronze
            'Hunter': { icon: '🎯', badgeColor: '#cd7f32' },
            'Champion': { icon: '🏅', badgeColor: '#c0c0c0' }, // Silver
            'Warrior': { icon: '⚔️', badgeColor: '#c0c0c0' },
            'Legend': { icon: '🌟', badgeColor: '#ffd700' }, // Gold
            'God of War': { icon: '⚡', badgeColor: '#b9f2ff' }, // Diamond
            
            // Economy titles
            'Merchant': { icon: '🏪', badgeColor: '#cd7f32' },
            'Tycoon': { icon: '💰', badgeColor: '#ffd700' },
            'Billionaire': { icon: '🤑', badgeColor: '#b9f2ff' },
            
            // Crafting titles
            'Crafter': { icon: '🔨', badgeColor: '#cd7f32' },
            'Master Smith': { icon: '⚒️', badgeColor: '#ffd700' },
            'Artisan of Legends': { icon: '✨', badgeColor: '#b9f2ff' },
            
            // PvP titles
            'Duelist': { icon: '🤺', badgeColor: '#cd7f32' },
            'Undefeated': { icon: '🛡️', badgeColor: '#c0c0c0' },
            'Mythic': { icon: '💫', badgeColor: '#ffd700' },
            
            // Exploration titles
            'Adventurer': { icon: '🧭', badgeColor: '#cd7f32' },
            'Dungeon Master': { icon: '🏰', badgeColor: '#c0c0c0' },
            
            // Social titles
            'Leader': { icon: '👑', badgeColor: '#ffd700' },
            
            // Special titles
            'Pioneer': { icon: '🌅', badgeColor: '#ff6b6b' },
            'Whale': { icon: '🐋', badgeColor: '#ff69b4' },
            'Legacy': { icon: '🏆', badgeColor: '#ffd700' },
        };

        return titleMetadata[titleName] || { icon: '🎖️', badgeColor: '#ffffff' };
    }

    // Check if player has a specific title
    async hasTitle(userId, title) {
        const existing = await prisma.playerTitle.findUnique({
            where: {
                userId_title: { userId, title }
            }
        });
        return !!existing;
    }

    // Remove a title from a player
    async removeTitle(userId, title) {
        await prisma.playerTitle.delete({
            where: {
                userId_title: { userId, title }
            }
        });
        
        logger.info(`[TitleService] Title "${title}" removed from user ${userId}`);
    }

    // Get titles by source
    async getTitlesBySource(userId, source) {
        return prisma.playerTitle.findMany({
            where: {
                userId,
                source
            }
        });
    }
}

module.exports = new TitleService();
