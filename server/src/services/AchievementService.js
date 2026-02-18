const prisma = require('../db');
const logger = require('../utils/logger');


class AchievementService {
    constructor() {
        this.counterTriggers = {};
        this._initializeCounterTriggers();
    }

    _initializeCounterTriggers() {
        // Combat counters
        this.counterTriggers = {
            // Combat
            'monster_kill': { category: 'COMBAT', tiered: false },
            'boss_kill': { category: 'COMBAT', tiered: false },
            'battle_win': { category: 'COMBAT', tiered: false },
            'critical_hit': { category: 'COMBAT', tiered: false },
            'elemental_skill': { category: 'COMBAT', tiered: false },
            'damage_taken': { category: 'COMBAT', tiered: false },
            
            // Collection
            'items_collected': { category: 'COLLECTION', tiered: false },
            'rare_items': { category: 'COLLECTION', tiered: false },
            'epic_items': { category: 'COLLECTION', tiered: false },
            'legendary_items': { category: 'COLLECTION', tiered: false },
            
            // Economy
            'gold_earned': { category: 'ECONOMY', tiered: false },
            'gold_spent': { category: 'ECONOMY', tiered: false },
            'items_sold': { category: 'ECONOMY', tiered: false },
            'gacha_pulls': { category: 'ECONOMY', tiered: false },
            
            // Crafting
            'items_crafted': { category: 'CRAFTING', tiered: false },
            'legendary_crafted': { category: 'CRAFTING', tiered: false },
            'enhancements': { category: 'CRAFTING', tiered: false },
            
            // PvP
            'arena_wins': { category: 'PVP', tiered: false },
            'arena_rank': { category: 'PVP', tiered: false },
            'undefeated_streak': { category: 'PVP', tiered: false },
            
            // Exploration
            'regions_visited': { category: 'EXPLORATION', tiered: false },
            'dungeons_completed': { category: 'EXPLORATION', tiered: false },
            
            // Social
            'friends': { category: 'SOCIAL', tiered: false },
            'guild_join': { category: 'SOCIAL', tiered: false },
            'guild_created': { category: 'SOCIAL', tiered: false },
            
            // Special
            'first_login': { category: 'SPECIAL', tiered: false },
            'max_level': { category: 'SPECIAL', tiered: false },
        };
    }

    // Seed all 60 achievements from documentation
    async seedAchievements() {
        logger.info('[AchievementService] Seeding achievements...');
        
        const achievements = this._getAchievementData();
        
        for (const achievement of achievements) {
            try {
                await prisma.achievement.upsert({
                    where: { code: achievement.code },
                    update: achievement,
                    create: achievement
                });
            } catch (error) {
                logger.error(`[AchievementService] Error seeding achievement ${achievement.code}:`, error);
            }
        }
        
        logger.info(`[AchievementService] Seeded ${achievements.length} achievements`);
        return achievements.length;
    }

    _getAchievementData() {
        return [
            // Combat Achievements (12)
            { code: 'COMBAT_001', name: 'First Blood', description: 'Win your first battle', category: 'COMBAT', icon: '⚔️', requirementType: 'counter', targetValue: 1, counterName: 'battle_win', rewardGold: 50, rewardTitle: 'Brawler', sortOrder: 1 },
            { code: 'COMBAT_002', name: 'Monster Slayer', description: 'Defeat 100 monsters', category: 'COMBAT', icon: '⚔️', requirementType: 'counter', targetValue: 100, counterName: 'monster_kill', rewardGold: 100, sortOrder: 2 },
            { code: 'COMBAT_003', name: 'Monster Hunter', description: 'Defeat 1,000 monsters', category: 'COMBAT', icon: '⚔️', requirementType: 'counter', targetValue: 1000, counterName: 'monster_kill', rewardGold: 500, rewardTitle: 'Hunter', sortOrder: 3 },
            { code: 'COMBAT_004', name: 'Monster Champion', description: 'Defeat 10,000 monsters', category: 'COMBAT', icon: '⚔️', requirementType: 'counter', targetValue: 10000, counterName: 'monster_kill', rewardGold: 2000, rewardGems: 50, rewardTitle: 'Champion', sortOrder: 4 },
            { code: 'COMBAT_005', name: 'Boss Killer', description: 'Defeat 10 boss monsters', category: 'COMBAT', icon: '👹', requirementType: 'counter', targetValue: 10, counterName: 'boss_kill', rewardGold: 500, sortOrder: 5 },
            { code: 'COMBAT_006', name: 'Boss Nemesis', description: 'Defeat 100 boss monsters', category: 'COMBAT', icon: '👹', requirementType: 'counter', targetValue: 100, counterName: 'boss_kill', rewardGold: 2500, rewardGems: 100, sortOrder: 6 },
            { code: 'COMBAT_007', name: 'Undefeated', description: 'Win 10 battles consecutively', category: 'COMBAT', icon: '🏆', requirementType: 'counter', targetValue: 10, counterName: 'undefeated_streak', rewardGold: 300, sortOrder: 7 },
            { code: 'COMBAT_008', name: 'War Machine', description: 'Win 50 battles consecutively', category: 'COMBAT', icon: '🏆', requirementType: 'counter', targetValue: 50, counterName: 'undefeated_streak', rewardGold: 1500, rewardTitle: 'Warrior', sortOrder: 8 },
            { code: 'COMBAT_009', name: 'Legendary Hero', description: 'Win 100 battles consecutively', category: 'COMBAT', icon: '🏆', requirementType: 'counter', targetValue: 100, counterName: 'undefeated_streak', rewardGold: 5000, rewardGems: 200, rewardTitle: 'Legend', sortOrder: 9 },
            { code: 'COMBAT_010', name: 'Critical Master', description: 'Land 100 critical hits', category: 'COMBAT', icon: '💥', requirementType: 'counter', targetValue: 100, counterName: 'critical_hit', rewardGold: 200, sortOrder: 10 },
            { code: 'COMBAT_011', name: 'Elemental Master', description: 'Use 500 elemental skills', category: 'COMBAT', icon: '🔥', requirementType: 'counter', targetValue: 500, counterName: 'elemental_skill', rewardGold: 500, sortOrder: 11 },
            { code: 'COMBAT_012', name: 'Tank', description: 'Receive 10,000 damage', category: 'COMBAT', icon: '🛡️', requirementType: 'counter', targetValue: 10000, counterName: 'damage_taken', rewardGold: 800, sortOrder: 12 },
            
            // Collection Achievements (7)
            { code: 'COLLECT_001', name: 'Pack Rat', description: 'Collect 100 items', category: 'COLLECTION', icon: '📦', requirementType: 'counter', targetValue: 100, counterName: 'items_collected', rewardGold: 50, sortOrder: 101 },
            { code: 'COLLECT_002', name: 'Hoarder', description: 'Collect 1,000 items', category: 'COLLECTION', icon: '📦', requirementType: 'counter', targetValue: 1000, counterName: 'items_collected', rewardGold: 500, sortOrder: 102 },
            { code: 'COLLECT_003', name: 'Treasure Collector', description: 'Collect 10 rare items', category: 'COLLECTION', icon: '💎', requirementType: 'counter', targetValue: 10, counterName: 'rare_items', rewardGold: 200, sortOrder: 103 },
            { code: 'COLLECT_004', name: 'Rare Collector', description: 'Collect 50 rare items', category: 'COLLECTION', icon: '💎', requirementType: 'counter', targetValue: 50, counterName: 'rare_items', rewardGold: 1000, rewardGems: 25, sortOrder: 104 },
            { code: 'COLLECT_005', name: 'Epic Collector', description: 'Collect 10 epic items', category: 'COLLECTION', icon: '🔮', requirementType: 'counter', targetValue: 10, counterName: 'epic_items', rewardGold: 500, rewardGems: 50, sortOrder: 105 },
            { code: 'COLLECT_006', name: 'Legendary Collector', description: 'Collect 5 legendary items', category: 'COLLECTION', icon: '🌟', requirementType: 'counter', targetValue: 5, counterName: 'legendary_items', rewardGold: 2000, rewardGems: 100, sortOrder: 106 },
            
            // Economy Achievements (9)
            { code: 'ECON_001', name: 'Small Fortune', description: 'Earn 10,000 gold', category: 'ECONOMY', icon: '💰', requirementType: 'counter', targetValue: 10000, counterName: 'gold_earned', rewardGold: 100, sortOrder: 201 },
            { code: 'ECON_002', name: 'Wealthy', description: 'Earn 100,000 gold', category: 'ECONOMY', icon: '💰', requirementType: 'counter', targetValue: 100000, counterName: 'gold_earned', rewardGold: 500, sortOrder: 202 },
            { code: 'ECON_003', name: 'Millionaire', description: 'Earn 1,000,000 gold', category: 'ECONOMY', icon: '💰', requirementType: 'counter', targetValue: 1000000, counterName: 'gold_earned', rewardGold: 2500, rewardGems: 50, sortOrder: 203 },
            { code: 'ECON_004', name: 'Tycoon', description: 'Earn 10,000,000 gold', category: 'ECONOMY', icon: '💰', requirementType: 'counter', targetValue: 10000000, counterName: 'gold_earned', rewardGold: 10000, rewardGems: 200, sortOrder: 204 },
            { code: 'ECON_005', name: 'First Sale', description: 'Sell items on market', category: 'ECONOMY', icon: '🏪', requirementType: 'counter', targetValue: 1, counterName: 'items_sold', rewardGold: 25, sortOrder: 205 },
            { code: 'ECON_006', name: 'Merchant', description: 'Sell 100 items on market', category: 'ECONOMY', icon: '🏪', requirementType: 'counter', targetValue: 100, counterName: 'items_sold', rewardGold: 300, sortOrder: 206 },
            { code: 'ECON_007', name: 'Master Merchant', description: 'Sell 1,000 items on market', category: 'ECONOMY', icon: '🏪', requirementType: 'counter', targetValue: 1000, counterName: 'items_sold', rewardGold: 1500, rewardTitle: 'Merchant', sortOrder: 207 },
            { code: 'ECON_008', name: 'Big Spender', description: 'Spend 10,000 gold', category: 'ECONOMY', icon: '💳', requirementType: 'counter', targetValue: 10000, counterName: 'gold_spent', rewardGold: 100, sortOrder: 208 },
            { code: 'ECON_009', name: 'Gambler', description: 'Use gacha/lottery 10 times', category: 'ECONOMY', icon: '🎰', requirementType: 'counter', targetValue: 10, counterName: 'gacha_pulls', rewardGems: 50, sortOrder: 209 },
            
            // Crafting Achievements (7)
            { code: 'CRAFT_001', name: 'Apprentice Crafter', description: 'Craft 10 items', category: 'CRAFTING', icon: '🔨', requirementType: 'counter', targetValue: 10, counterName: 'items_crafted', rewardGold: 50, sortOrder: 301 },
            { code: 'CRAFT_002', name: 'Journeyman Crafter', description: 'Craft 100 items', category: 'CRAFTING', icon: '🔨', requirementType: 'counter', targetValue: 100, counterName: 'items_crafted', rewardGold: 300, sortOrder: 302 },
            { code: 'CRAFT_003', name: 'Expert Crafter', description: 'Craft 500 items', category: 'CRAFTING', icon: '🔨', requirementType: 'counter', targetValue: 500, counterName: 'items_crafted', rewardGold: 1000, rewardTitle: 'Crafter', sortOrder: 303 },
            { code: 'CRAFT_004', name: 'Master Crafter', description: 'Craft 1,000 items', category: 'CRAFTING', icon: '🔨', requirementType: 'counter', targetValue: 1000, counterName: 'items_crafted', rewardGold: 3000, rewardGems: 100, rewardTitle: 'Master Smith', sortOrder: 304 },
            { code: 'CRAFT_005', name: 'Legendary Crafter', description: 'Craft 1 legendary item', category: 'CRAFTING', icon: '✨', requirementType: 'counter', targetValue: 1, counterName: 'legendary_crafted', rewardGold: 5000, rewardGems: 200, sortOrder: 305 },
            { code: 'CRAFT_006', name: 'First Enhancement', description: 'Enhance equipment 1 time', category: 'CRAFTING', icon: '⬆️', requirementType: 'counter', targetValue: 1, counterName: 'enhancements', rewardGold: 100, sortOrder: 306 },
            { code: 'CRAFT_007', name: 'Enhancement Master', description: 'Enhance equipment 50 times', category: 'CRAFTING', icon: '⬆️', requirementType: 'counter', targetValue: 50, counterName: 'enhancements', rewardGold: 800, sortOrder: 307 },
            
            // PvP Achievements (9)
            { code: 'PVP_001', name: 'First Duel', description: 'Win 1 arena match', category: 'PVP', icon: '⚡', requirementType: 'counter', targetValue: 1, counterName: 'arena_wins', rewardGold: 100, sortOrder: 401 },
            { code: 'PVP_002', name: 'Arena Fighter', description: 'Win 10 arena matches', category: 'PVP', icon: '⚡', requirementType: 'counter', targetValue: 10, counterName: 'arena_wins', rewardGold: 300, sortOrder: 402 },
            { code: 'PVP_003', name: 'Arena Veteran', description: 'Win 100 arena matches', category: 'PVP', icon: '⚡', requirementType: 'counter', targetValue: 100, counterName: 'arena_wins', rewardGold: 1500, rewardTitle: 'Duelist', sortOrder: 403 },
            { code: 'PVP_004', name: 'Arena Champion', description: 'Win 500 arena matches', category: 'PVP', icon: '⚡', requirementType: 'counter', targetValue: 500, counterName: 'arena_wins', rewardGold: 5000, rewardGems: 100, rewardTitle: 'Champion', sortOrder: 404 },
            { code: 'PVP_005', name: 'Undefeated PvP', description: 'Win 10 arena matches without losing', category: 'PVP', icon: '🛡️', requirementType: 'counter', targetValue: 10, counterName: 'undefeated_streak', rewardGold: 500, sortOrder: 405 },
            { code: 'PVP_006', name: 'Perfect Record', description: 'Win 50 arena matches without losing', category: 'PVP', icon: '🛡️', requirementType: 'counter', targetValue: 50, counterName: 'undefeated_streak', rewardGold: 2000, rewardTitle: 'Undefeated', sortOrder: 406 },
            { code: 'PVP_007', name: 'Rank Pioneer', description: 'Reach Silver rank', category: 'PVP', icon: '🥈', requirementType: 'counter', targetValue: 1, counterName: 'arena_rank', rewardGold: 500, sortOrder: 407 },
            { code: 'PVP_008', name: 'Rank Elite', description: 'Reach Gold rank', category: 'PVP', icon: '🥇', requirementType: 'counter', targetValue: 1, counterName: 'arena_rank', rewardGold: 2000, rewardGems: 50, sortOrder: 408 },
            { code: 'PVP_009', name: 'Rank Mythic', description: 'Reach Mythic rank', category: 'PVP', icon: '💫', requirementType: 'counter', targetValue: 1, counterName: 'arena_rank', rewardGold: 5000, rewardGems: 100, rewardTitle: 'Mythic', sortOrder: 409 },
            
            // Exploration Achievements (6)
            { code: 'EXPLORE_001', name: 'Traveler', description: 'Visit 3 regions', category: 'EXPLORATION', icon: '🗺️', requirementType: 'counter', targetValue: 3, counterName: 'regions_visited', rewardGold: 50, sortOrder: 501 },
            { code: 'EXPLORE_002', name: 'Explorer', description: 'Visit 10 regions', category: 'EXPLORATION', icon: '🗺️', requirementType: 'counter', targetValue: 10, counterName: 'regions_visited', rewardGold: 200, sortOrder: 502 },
            { code: 'EXPLORE_003', name: 'Adventurer', description: 'Visit 20 regions', category: 'EXPLORATION', icon: '🗺️', requirementType: 'counter', targetValue: 20, counterName: 'regions_visited', rewardGold: 800, rewardTitle: 'Adventurer', sortOrder: 503 },
            { code: 'EXPLORE_004', name: 'World Traveler', description: 'Visit all regions', category: 'EXPLORATION', icon: '🌍', requirementType: 'counter', targetValue: 1, counterName: 'regions_visited', rewardGold: 2000, rewardGems: 50, sortOrder: 504 },
            { code: 'EXPLORE_005', name: 'Dungeon Delver', description: 'Complete 10 dungeons', category: 'EXPLORATION', icon: '🏰', requirementType: 'counter', targetValue: 10, counterName: 'dungeons_completed', rewardGold: 300, sortOrder: 505 },
            { code: 'EXPLORE_006', name: 'Dungeon Master', description: 'Complete 100 dungeons', category: 'EXPLORATION', icon: '🏰', requirementType: 'counter', targetValue: 100, counterName: 'dungeons_completed', rewardGold: 2000, rewardTitle: 'Dungeon Master', sortOrder: 506 },
            
            // Social Achievements (6)
            { code: 'SOCIAL_001', name: 'Social Butterfly', description: 'Make 1 friend', category: 'SOCIAL', icon: '👥', requirementType: 'counter', targetValue: 1, counterName: 'friends', rewardGold: 25, sortOrder: 601 },
            { code: 'SOCIAL_002', name: 'Popular', description: 'Have 10 friends', category: 'SOCIAL', icon: '👥', requirementType: 'counter', targetValue: 10, counterName: 'friends', rewardGold: 200, sortOrder: 602 },
            { code: 'SOCIAL_003', name: 'Guild Member', description: 'Join a guild', category: 'SOCIAL', icon: '⚔️', requirementType: 'counter', targetValue: 1, counterName: 'guild_join', rewardGold: 50, sortOrder: 603 },
            { code: 'SOCIAL_004', name: 'Guild Leader', description: 'Create a guild', category: 'SOCIAL', icon: '👑', requirementType: 'counter', targetValue: 1, counterName: 'guild_created', rewardGold: 500, rewardTitle: 'Leader', sortOrder: 604 },
            
            // Special Achievements (4)
            { code: 'SPECIAL_001', name: 'Early Bird', description: 'First to login on launch day', category: 'SPECIAL', icon: '🌅', requirementType: 'event', targetValue: 1, counterName: 'first_login', rewardGems: 1000, rewardTitle: 'Pioneer', isHidden: true, sortOrder: 701 },
            { code: 'SPECIAL_002', name: 'Whale', description: 'Spend $100 in the game', category: 'SPECIAL', icon: '🐋', requirementType: 'counter', targetValue: 100, counterName: 'money_spent', rewardGems: 1000, rewardTitle: 'Whale', isHidden: true, sortOrder: 702 },
            { code: 'SPECIAL_003', name: 'Lucky', description: 'Get a lucky drop', category: 'SPECIAL', icon: '🍀', requirementType: 'event', targetValue: 1, counterName: 'lucky_drop', rewardGems: 500, isHidden: true, sortOrder: 703 },
            { code: 'SPECIAL_004', name: 'First Legacy', description: 'First hero reaches max level', category: 'SPECIAL', icon: '🏅', requirementType: 'event', targetValue: 1, counterName: 'max_level', rewardGold: 10000, rewardTitle: 'Legacy', sortOrder: 704 },
        ];
    }

    // Get or create player achievement progress
    async getOrCreateProgress(userId, achievementCode) {
        let progress = await prisma.playerAchievement.findUnique({
            where: {
                userId_achievementCode: { userId, achievementCode }
            }
        });

        if (!progress) {
            progress = await prisma.playerAchievement.create({
                data: {
                    userId,
                    achievementCode,
                    currentValue: 0,
                    isCompleted: false,
                    currentTier: 0,
                    unlockedTiers: '[]',
                    rewardsClaimed: false,
                    isDiscovered: false
                }
            });
        }

        return progress;
    }

    // Update achievement progress for a player
    async updateProgress(userId, counterName, amount = 1, data = {}) {
        logger.debug(`[AchievementService] updateProgress: userId=${userId}, counterName=${counterName}, amount=${amount}`);
        
        try {
            // Find all achievements that track this counter
            const achievements = await prisma.achievement.findMany({
                where: {
                    counterName,
                    isActive: true
                }
            });

            if (achievements.length === 0) {
                return [];
            }

            const updatedAchievements = [];

            for (const achievement of achievements) {
                // Get or create player progress
                const progress = await this.getOrCreateProgress(userId, achievement.code);

                // Skip if already completed
                if (progress.isCompleted) {
                    continue;
                }

                // Check if hidden achievement should be discovered
                let isDiscovered = progress.isDiscovered;
                if (achievement.isHidden && !isDiscovered) {
                    // Discover hidden achievements when progress starts
                    isDiscovered = true;
                }

                // Update progress
                const newValue = progress.currentValue + amount;
                
                // Check if completed
                const isCompleted = newValue >= achievement.targetValue;
                const completedAt = isCompleted && !progress.isCompleted ? new Date() : progress.completedAt;

                await prisma.playerAchievement.update({
                    where: { id: progress.id },
                    data: {
                        currentValue: newValue,
                        isCompleted,
                        completedAt,
                        isDiscovered,
                        discoveredAt: isDiscovered && !progress.discoveredAt ? new Date() : progress.discoveredAt,
                        updatedAt: new Date()
                    }
                });

                if (isCompleted && !progress.isCompleted) {
                    updatedAchievements.push({
                        achievement,
                        progress: { ...progress, isCompleted: true, currentValue: newValue }
                    });
                    
                    logger.info(`[AchievementService] Achievement completed: ${achievement.code} for user ${userId}`);
                }
            }

            return updatedAchievements;
        } catch (error) {
            logger.error(`[AchievementService] Error updating progress:`, error);
            throw error;
        }
    }

    // Complete an achievement
    async completeAchievement(userId, achievementCode) {
        logger.info(`[AchievementService] Completing achievement: ${achievementCode} for user ${userId}`);
        
        const achievement = await prisma.achievement.findUnique({
            where: { code: achievementCode }
        });

        if (!achievement) {
            throw new Error(`Achievement not found: ${achievementCode}`);
        }

        const progress = await this.getOrCreateProgress(userId, achievementCode);

        if (progress.isCompleted) {
            throw new Error('Achievement already completed');
        }

        await prisma.playerAchievement.update({
            where: { id: progress.id },
            data: {
                isCompleted: true,
                completedAt: new Date(),
                currentValue: achievement.targetValue,
                updatedAt: new Date()
            }
        });

        return achievement;
    }

    // Claim rewards for a completed achievement
    async claimReward(userId, achievementCode) {
        logger.info(`[AchievementService] Claiming reward: ${achievementCode} for user ${userId}`);
        
        const achievement = await prisma.achievement.findUnique({
            where: { code: achievementCode }
        });

        if (!achievement) {
            throw new Error(`Achievement not found: ${achievementCode}`);
        }

        const progress = await prisma.playerAchievement.findUnique({
            where: {
                userId_achievementCode: { userId, achievementCode }
            }
        });

        if (!progress) {
            throw new Error('No progress found for this achievement');
        }

        if (!progress.isCompleted) {
            throw new Error('Achievement not completed');
        }

        if (progress.rewardsClaimed) {
            throw new Error('Rewards already claimed');
        }

        // Grant rewards
        const rewards = {
            gold: achievement.rewardGold || 0,
            gems: achievement.rewardGems || 0,
            items: achievement.rewardItems ? JSON.parse(achievement.rewardItems) : [],
            title: achievement.rewardTitle
        };

        // Update user currency
        if (rewards.gold > 0 || rewards.gems > 0) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            await prisma.user.update({
                where: { id: userId },
                data: {
                    gold: user.gold + rewards.gold,
                    // Note: gems would need premiumTier or separate gem field
                }
            });
        }

        // Grant title if exists
        if (rewards.title) {
            const titleService = require('./TitleService');
            await titleService.grantTitle(userId, rewards.title, 'ACHIEVEMENT', achievementCode);
        }

        // Mark rewards as claimed
        await prisma.playerAchievement.update({
            where: { id: progress.id },
            data: {
                rewardsClaimed: true,
                claimedAt: new Date(),
                updatedAt: new Date()
            }
        });

        return { success: true, rewards };
    }

    // Get all progress for a player
    async getProgress(userId) {
        const achievements = await prisma.achievement.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        const playerProgress = await prisma.playerAchievement.findMany({
            where: { userId }
        });

        const completed = [];
        const inProgress = [];
        const locked = [];

        // Get user's max level for checking requirements
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                heroes: {
                    orderBy: { level: 'desc' },
                    take: 1
                }
            }
        });

        const userLevel = user?.heroes[0]?.level || 1;

        for (const achievement of achievements) {
            const progress = playerProgress.find(p => p.achievementCode === achievement.code);
            
            // Check if locked
            const isLocked = this._isLocked(achievement, playerProgress, userLevel);

            if (!progress) {
                if (isLocked) {
                    locked.push(this._formatLocked(achievement));
                } else {
                    inProgress.push(this._formatInProgress(achievement, 0));
                }
            } else if (progress.isCompleted) {
                completed.push(this._formatCompleted(progress, achievement));
            } else {
                inProgress.push(this._formatInProgress(progress, achievement));
            }
        }

        // Get titles
        const titleService = require('./TitleService');
        const titles = await titleService.getTitles(userId);

        return {
            completed,
            inProgress,
            locked,
            titles,
            totalProgress: completed.length,
            totalAchievements: achievements.length
        };
    }

    _isLocked(achievement, playerProgress, userLevel) {
        // Check level requirement
        if (userLevel < achievement.minLevel) {
            return true;
        }

        // Check prerequisite
        if (achievement.prereqCode) {
            const prereq = playerProgress.find(
                p => p.achievementCode === achievement.prereqCode
            );
            if (!prereq?.isCompleted) {
                return true;
            }
        }

        return false;
    }

    _formatCompleted(progress, achievement) {
        return {
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            currentValue: progress.currentValue,
            targetValue: achievement.targetValue,
            completedAt: progress.completedAt,
            rewardsClaimed: progress.rewardsClaimed,
            title: achievement.rewardTitle
        };
    }

    _formatInProgress(achievement, currentValue) {
        return {
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            currentValue: currentValue,
            targetValue: achievement.targetValue,
            progressPercent: Math.min(100, Math.floor((currentValue / achievement.targetValue) * 100))
        };
    }

    _formatLocked(achievement) {
        return {
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            requirement: achievement.prereqCode ? `Complete ${achievement.prereqCode}` : null,
            minLevel: achievement.minLevel
        };
    }

    // Get all achievements
    async getAllAchievements(category = null) {
        const where = { isActive: true };
        if (category) {
            where.category = category;
        }

        return prisma.achievement.findMany({
            where,
            orderBy: { sortOrder: 'asc' }
        });
    }

    // Get specific achievement
    async getAchievement(code) {
        return prisma.achievement.findUnique({
            where: { code }
        });
    }

    // Get achievements by category
    async getAchievementsByCategory(category) {
        return prisma.achievement.findMany({
            where: {
                category,
                isActive: true
            },
            orderBy: { sortOrder: 'asc' }
        });
    }
}

module.exports = new AchievementService();
