const prisma = require('../db');
const logger = require('../utils/logger');

/**
 * DungeonService
 * Handles all business logic for Dynamic Dungeon System
 */
class DungeonService {
    constructor() {
        this.RESET_TYPES = {
            DAILY: 'DAILY',
            WEEKLY: 'WEEKLY',
            NONE: 'NONE'
        };
        
        this.DIFFICULTY = {
            NORMAL: 'NORMAL',
            HARD: 'HARD',
            NIGHTMARE: 'NIGHTMARE',
            LEGENDARY: 'LEGENDARY'
        };
        
        this.MODIFIER_CATEGORIES = {
            DIFFICULTY: 'DIFFICULTY',
            ELEMENTAL: 'ELEMENTAL',
            SPECIAL: 'SPECIAL'
        };
    }

    // ==================== DUNGEON TEMPLATES ====================

    /**
     * Get all available dungeon templates
     */
    async getAllDungeons() {
        logger.debug('[DungeonService.getAllDungeons]');
        
        return prisma.dungeonTemplate.findMany({
            include: {
                floors: {
                    orderBy: { floorNumber: 'asc' },
                    include: {
                        modifiers: {
                            include: { modifier: true }
                        }
                    }
                }
            }
        });
    }

    /**
     * Get dungeon by key
     */
    async getDungeonByKey(dungeonKey) {
        logger.debug(`[DungeonService.getDungeonByKey] dungeonKey: ${dungeonKey}`);
        
        return prisma.dungeonTemplate.findUnique({
            where: { dungeonKey },
            include: {
                floors: {
                    orderBy: { floorNumber: 'asc' },
                    include: {
                        modifiers: {
                            include: { modifier: true }
                        }
                    }
                }
            }
        });
    }

    /**
     * Get dungeon by ID
     */
    async getDungeonById(dungeonId) {
        logger.debug(`[DungeonService.getDungeonById] dungeonId: ${dungeonId}`);
        
        return prisma.dungeonTemplate.findUnique({
            where: { id: dungeonId },
            include: {
                floors: {
                    orderBy: { floorNumber: 'asc' },
                    include: {
                        modifiers: {
                            include: { modifier: true }
                        }
                    }
                }
            }
        });
    }

    // ==================== DUNGEON MODIFIERS ====================

    /**
     * Get all available modifiers
     */
    async getAllModifiers() {
        logger.debug('[DungeonService.getAllModifiers]');
        
        return prisma.dungeonModifier.findMany();
    }

    /**
     * Get modifier by key
     */
    async getModifierByKey(modifierKey) {
        logger.debug(`[DungeonService.getModifierByKey] modifierKey: ${modifierKey}`);
        
        return prisma.dungeonModifier.findUnique({
            where: { modifierKey }
        });
    }

    // ==================== DUNGEON ENTRY ====================

    /**
     * Get user's entry for a specific dungeon
     */
    async getUserDungeonEntry(userId, dungeonId) {
        logger.debug(`[DungeonService.getUserDungeonEntry] userId: ${userId}, dungeonId: ${dungeonId}`);
        
        return prisma.dungeonEntry.findUnique({
            where: {
                userId_dungeonId: { userId, dungeonId }
            },
            include: {
                dungeon: {
                    include: {
                        floors: {
                            orderBy: { floorNumber: 'asc' },
                            include: {
                                modifiers: {
                                    include: { modifier: true }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Get all dungeon entries for a user
     */
    async getUserDungeonEntries(userId) {
        logger.debug(`[DungeonService.getUserDungeonEntries] userId: ${userId}`);
        
        return prisma.dungeonEntry.findMany({
            where: { userId },
            include: {
                dungeon: {
                    include: {
                        floors: {
                            orderBy: { floorNumber: 'asc' }
                        }
                    }
                }
            },
            orderBy: { lastEnteredAt: 'desc' }
        });
    }

    /**
     * Enter a dungeon (create or update entry)
     */
    async enterDungeon(userId, dungeonId) {
        logger.info(`[DungeonService.enterDungeon] userId: ${userId}, dungeonId: ${dungeonId}`);
        
        // Check if dungeon exists
        const dungeon = await this.getDungeonById(dungeonId);
        if (!dungeon) {
            throw new Error('Dungeon not found');
        }
        
        // Check entry requirements
        if (dungeon.requiredQuestId) {
            // TODO: Check if user has completed required quest
            throw new Error('Required quest not completed');
        }
        
        if (dungeon.requiredAchievementId) {
            // TODO: Check if user has achieved required achievement
            throw new Error('Required achievement not unlocked');
        }
        
        // Check entry cost
        if (dungeon.entryCost > 0) {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            
            if (user.gold < dungeon.entryCost) {
                throw new Error(`Insufficient gold. Need ${dungeon.entryCost} gold.`);
            }
            
            // Deduct entry cost
            await prisma.user.update({
                where: { id: userId },
                data: { gold: user.gold - dungeon.entryCost }
            });
        }
        
        // Get or create dungeon entry
        let entry = await prisma.dungeonEntry.findUnique({
            where: {
                userId_dungeonId: { userId, dungeonId }
            }
        });
        
        if (!entry) {
            // Create new entry
            entry = await prisma.dungeonEntry.create({
                data: {
                    userId,
                    dungeonId,
                    currentFloor: 1,
                    highestFloor: 0,
                    attempts: 0,
                    completions: 0,
                    firstEnteredAt: new Date(),
                    lastEnteredAt: new Date()
                },
                include: {
                    dungeon: {
                        include: {
                            floors: {
                                orderBy: { floorNumber: 'asc' },
                                include: {
                                    modifiers: {
                                        include: { modifier: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            logger.info(`[DungeonService.enterDungeon] Created new entry for user ${userId} in dungeon ${dungeonId}`);
        } else {
            // Check if reset is needed
            const needsReset = this.checkResetNeeded(entry.lastResetAt, dungeon.resetType);
            
            if (needsReset) {
                entry = await prisma.dungeonEntry.update({
                    where: { id: entry.id },
                    data: {
                        currentFloor: 1,
                        lastEnteredAt: new Date(),
                        lastResetAt: new Date()
                    },
                    include: {
                        dungeon: {
                            include: {
                                floors: {
                                    orderBy: { floorNumber: 'asc' },
                                    include: {
                                        modifiers: {
                                            include: { modifier: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                logger.info(`[DungeonService.enterDungeon] Reset dungeon progress for user ${userId}`);
            } else {
                // Update last entered time
                entry = await prisma.dungeonEntry.update({
                    where: { id: entry.id },
                    data: { lastEnteredAt: new Date() },
                    include: {
                        dungeon: {
                            include: {
                                floors: {
                                    orderBy: { floorNumber: 'asc' },
                                    include: {
                                        modifiers: {
                                            include: { modifier: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        
        // Increment attempts
        await prisma.dungeonEntry.update({
            where: { id: entry.id },
            data: { attempts: entry.attempts + 1 }
        });
        
        return entry;
    }

    /**
     * Check if reset is needed based on reset type
     */
    checkResetNeeded(lastResetAt, resetType) {
        if (resetType === this.RESET_TYPES.NONE) {
            return false;
        }
        
        const now = new Date();
        const lastReset = new Date(lastResetAt);
        
        if (resetType === this.RESET_TYPES.DAILY) {
            // Reset if different day
            return now.toDateString() !== lastReset.toDateString();
        } else if (resetType === this.RESET_TYPES.WEEKLY) {
            // Reset if different week
            const nowWeek = this.getWeekNumber(now);
            const lastResetWeek = this.getWeekNumber(lastReset);
            return nowWeek !== lastResetWeek || now.getFullYear() !== lastReset.getFullYear();
        }
        
        return false;
    }

    /**
     * Get week number
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Complete a floor
     */
    async completeFloor(userId, dungeonId, floorNumber, rewards) {
        logger.info(`[DungeonService.completeFloor] userId: ${userId}, dungeonId: ${dungeonId}, floor: ${floorNumber}`);
        
        const entry = await this.getUserDungeonEntry(userId, dungeonId);
        if (!entry) {
            throw new Error('Dungeon entry not found');
        }
        
        if (entry.currentFloor !== floorNumber) {
            throw new Error('Invalid floor');
        }
        
        // Get current floor progress
        const floorProgress = JSON.parse(entry.floorProgress || '{}');
        const currentFloorProgress = floorProgress[floorNumber] || { kills: 0, bossesKilled: 0 };
        
        // Get the floor data
        const floor = entry.dungeon.floors.find(f => f.floorNumber === floorNumber);
        if (!floor) {
            throw new Error('Floor not found');
        }
        
        // Update floor progress
        currentFloorProgress.kills = (currentFloorProgress.kills || 0) + (floor.killCountRequired || 0);
        if (floor.bossRequired) {
            currentFloorProgress.bossesKilled = (currentFloorProgress.bossesKilled || 0) + 1;
        }
        floorProgress[floorNumber] = currentFloorProgress;
        
        // Check if floor is complete
        const isFloorComplete = currentFloorProgress.kills >= floor.killCountRequired;
        
        if (!isFloorComplete) {
            throw new Error('Floor not complete yet');
        }
        
        // Check if this was the last floor
        const isDungeonComplete = floorNumber >= entry.dungeon.totalFloors;
        
        // Calculate rewards
        const goldReward = Math.floor(entry.dungeon.baseGoldReward * floor.goldRewardScale);
        const xpReward = Math.floor(entry.dungeon.baseXpReward * floor.xpRewardScale);
        
        // Update entry
        const updateData = {
            floorProgress: JSON.stringify(floorProgress),
            totalGoldEarned: entry.totalGoldEarned + goldReward,
            totalXpEarned: entry.totalXpEarned + xpReward
        };
        
        if (isDungeonComplete) {
            updateData.completions = entry.completions + 1;
            updateData.completedAt = new Date();
            updateData.highestFloor = Math.max(entry.highestFloor, floorNumber);
        } else {
            // Advance to next floor
            updateData.currentFloor = floorNumber + 1;
            updateData.highestFloor = Math.max(entry.highestFloor, floorNumber);
        }
        
        const updatedEntry = await prisma.dungeonEntry.update({
            where: { id: entry.id },
            data: updateData,
            include: {
                dungeon: {
                    include: {
                        floors: {
                            orderBy: { floorNumber: 'asc' },
                            include: {
                                modifiers: {
                                    include: { modifier: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // Add rewards to user
        await prisma.user.update({
            where: { id: userId },
            data: {
                gold: { increment: goldReward }
            }
        });
        
        // TODO: Add XP to user's active hero
        
        logger.info(`[DungeonService.completeFloor] Floor ${floorNumber} completed. Gold: ${goldReward}, XP: ${xpReward}`);
        
        return {
            entry: updatedEntry,
            floorComplete: true,
            dungeonComplete: isDungeonComplete,
            rewards: {
                gold: goldReward,
                xp: xpReward
            }
        };
    }

    /**
     * Get floor details with modifiers applied
     */
    async getFloorDetails(userId, dungeonId, floorNumber) {
        logger.debug(`[DungeonService.getFloorDetails] userId: ${userId}, dungeonId: ${dungeonId}, floor: ${floorNumber}`);
        
        const entry = await this.getUserDungeonEntry(userId, dungeonId);
        if (!entry) {
            throw new Error('Dungeon entry not found');
        }
        
        const floor = entry.dungeon.floors.find(f => f.floorNumber === floorNumber);
        if (!floor) {
            throw new Error('Floor not found');
        }
        
        // Calculate combined modifiers
        const modifiers = floor.modifiers.map(fm => ({
            ...fm.modifier,
            stackCount: fm.stackCount
        }));
        
        // Calculate stat multipliers from modifiers
        const combinedMultipliers = this.combineModifiers(modifiers);
        
        return {
            floor,
            modifiers,
            statMultipliers: combinedMultipliers,
            monsterPool: JSON.parse(floor.monsterPoolIds || '[]'),
            spawnRates: {
                elite: floor.eliteSpawnRate,
                boss: floor.bossSpawnRate
            },
            levelScale: floor.monsterLevelScale,
            requirements: {
                killCount: floor.killCountRequired,
                bossRequired: floor.bossRequired
            },
            rewards: {
                goldScale: floor.goldRewardScale,
                xpScale: floor.xpRewardScale,
                lootBonus: floor.lootBonusScale
            }
        };
    }

    /**
     * Combine modifiers to get stat multipliers
     */
    combineModifiers(modifiers) {
        const multipliers = {
            damage: 1.0,
            hp: 1.0,
            defense: 1.0,
            speed: 1.0,
            goldBonus: 1.0,
            xpBonus: 1.0
        };
        
        for (const modifier of modifiers) {
            const stats = JSON.parse(modifier.statMultipliers || '{}');
            const stackCount = modifier.stackCount || 1;
            
            for (const [key, value] of Object.entries(stats)) {
                if (multipliers[key] !== undefined) {
                    // Apply multiplier with stack count (compounding)
                    multipliers[key] = Math.pow(value, stackCount);
                }
            }
        }
        
        return multipliers;
    }

    // ==================== SEED DATA ====================

    /**
     * Create seed modifiers
     */
    async seedModifiers() {
        logger.info('[DungeonService.seedModifiers] Creating dungeon modifiers');
        
        const modifiers = [
            // Difficulty Modifiers
            {
                modifierKey: 'ENRAGED',
                name: 'Enraged',
                description: 'Monsters deal 50% more damage but take 25% more damage',
                category: 'DIFFICULTY',
                statMultipliers: JSON.stringify({ damage: 1.5, hp: 1.0, defense: 1.0 }),
                statusEffects: JSON.stringify(['ENRAGED']),
                icon: '🔥',
                color: '#ff4444'
            },
            {
                modifierKey: 'FORTIFIED',
                name: 'Fortified',
                description: 'Monsters have 50% more HP but deal 25% less damage',
                category: 'DIFFICULTY',
                statMultipliers: JSON.stringify({ damage: 0.75, hp: 1.5, defense: 1.25 }),
                statusEffects: JSON.stringify([]),
                icon: '🛡️',
                color: '#4488ff'
            },
            {
                modifierKey: 'SWARM',
                name: 'Swarm',
                description: '50% more enemies but each has 50% less HP',
                category: 'DIFFICULTY',
                statMultipliers: JSON.stringify({ damage: 0.75, hp: 0.5, speed: 1.1 }),
                statusEffects: JSON.stringify([]),
                icon: '🪲',
                color: '#44ff44'
            },
            {
                modifierKey: 'ELITE',
                name: 'Elite Only',
                description: 'All enemies are elite with 100% more stats',
                category: 'DIFFICULTY',
                statMultipliers: JSON.stringify({ damage: 1.5, hp: 2.0, defense: 1.5 }),
                statusEffects: JSON.stringify(['ELITE']),
                icon: '⭐',
                color: '#ffaa00'
            },
            {
                modifierKey: 'BOSS_RUSH',
                name: 'Boss Rush',
                description: 'Every enemy is a boss. Good luck!',
                category: 'DIFFICULTY',
                statMultipliers: JSON.stringify({ damage: 2.0, hp: 3.0, defense: 2.0 }),
                statusEffects: JSON.stringify(['BOSS_AURA']),
                icon: '👹',
                color: '#ff0000'
            },
            // Elemental Modifiers
            {
                modifierKey: 'FIRE_REALM',
                name: 'Fire Realm',
                description: 'All enemies are Fire elemental with fire aura',
                category: 'ELEMENTAL',
                statMultipliers: JSON.stringify({ damage: 1.1, hp: 1.0 }),
                statusEffects: JSON.stringify(['BURNING']),
                icon: '🔥',
                color: '#ff6600'
            },
            {
                modifierKey: 'FROST_REALM',
                name: 'Frost Realm',
                description: 'All enemies are Ice elemental with chilling aura',
                category: 'ELEMENTAL',
                statMultipliers: JSON.stringify({ speed: 0.8, defense: 1.1 }),
                statusEffects: JSON.stringify(['FROZEN']),
                icon: '❄️',
                color: '#00ccff'
            },
            {
                modifierKey: 'VOID_REALM',
                name: 'Void Realm',
                description: 'All enemies are Void elemental. Reality bends...',
                category: 'ELEMENTAL',
                statMultipliers: JSON.stringify({ damage: 1.25, hp: 1.25 }),
                statusEffects: JSON.stringify(['VOID_TOUCH']),
                icon: '🕳️',
                color: '#9900ff'
            },
            {
                modifierKey: 'STORM_REALM',
                name: 'Storm Realm',
                description: 'Lightning fills the air. Everything is conductive.',
                category: 'ELEMENTAL',
                statMultipliers: JSON.stringify({ damage: 1.2, speed: 1.1 }),
                statusEffects: JSON.stringify(['SHOCKED']),
                icon: '⚡',
                color: '#ffee00'
            },
            // Special Modifiers
            {
                modifierKey: 'NO_HEALING',
                name: 'No Healing',
                description: 'All healing is disabled in this floor',
                category: 'SPECIAL',
                statMultipliers: JSON.stringify({ damage: 1.0, hp: 1.0 }),
                statusEffects: JSON.stringify(['NO_HEAL']),
                icon: '🚫',
                color: '#888888'
            },
            {
                modifierKey: 'TIME_ATTACK',
                name: 'Time Attack',
                description: 'Defeat enemies quickly. 50% more damage but 50% less time.',
                category: 'SPECIAL',
                statMultipliers: JSON.stringify({ damage: 1.5, hp: 0.8 }),
                statusEffects: JSON.stringify(['TIME_PRESSURE']),
                icon: '⏱️',
                color: '#ff00ff'
            },
            {
                modifierKey: 'SOLO_RUN',
                name: 'Solo Run',
                description: 'Only your main hero can be used',
                category: 'SPECIAL',
                statMultipliers: JSON.stringify({ damage: 1.25, hp: 1.25 }),
                statusEffects: JSON.stringify(['SOLO_MODE']),
                icon: '🧙',
                color: '#00ff88'
            },
            {
                modifierKey: 'EQUIPMENT_LOCK',
                name: 'Equipment Lock',
                description: 'No equipment bonuses. Pure skill only.',
                category: 'SPECIAL',
                statMultipliers: JSON.stringify({ damage: 0.8, defense: 0.8 }),
                statusEffects: JSON.stringify(['NO_EQUIP']),
                icon: '🔒',
                color: '#666666'
            }
        ];
        
        for (const modifier of modifiers) {
            await prisma.dungeonModifier.upsert({
                where: { modifierKey: modifier.modifierKey },
                update: modifier,
                create: modifier
            });
        }
        
        logger.info(`[DungeonService.seedModifiers] Created ${modifiers.length} modifiers`);
        return modifiers.length;
    }

    /**
     * Create seed dungeons
     */
    async seedDungeons() {
        logger.info('[DungeonService.seedDungeons] Creating dungeon templates');
        
        // First ensure modifiers exist
        await this.seedModifiers();
        
        const dungeons = [
            {
                dungeonKey: 'CRYSTAL_CAVERNS',
                name: 'Crystal Caverns',
                description: 'Deep beneath the mountains lies a network of crystal-filled caves inhabited by gemstone elementals.',
                difficulty: 'NORMAL',
                recommendedLevel: 5,
                recommendedItemPower: 100,
                entryCost: 0,
                minPartySize: 1,
                maxPartySize: 1,
                scenePath: 'res://scenes/dungeons/CrystalCaverns.tscn',
                baseGoldReward: 150,
                baseXpReward: 75,
                totalFloors: 3,
                isRepeatable: true,
                resetType: 'DAILY'
            },
            {
                dungeonKey: 'SHADOW_WARRENS',
                name: 'Shadow Warrens',
                description: 'A dark labyrinth where shadows come alive and hunt the unwary.',
                difficulty: 'HARD',
                recommendedLevel: 15,
                recommendedItemPower: 500,
                entryCost: 50,
                minPartySize: 1,
                maxPartySize: 3,
                scenePath: 'res://scenes/dungeons/ShadowWarrens.tscn',
                baseGoldReward: 500,
                baseXpReward: 250,
                totalFloors: 5,
                isRepeatable: true,
                resetType: 'DAILY'
            },
            {
                dungeonKey: 'INFERNO_PIT',
                name: 'Inferno Pit',
                description: 'A volcanic abyss where fire demons guard ancient treasures.',
                difficulty: 'NIGHTMARE',
                recommendedLevel: 30,
                recommendedItemPower: 1500,
                entryCost: 200,
                minPartySize: 2,
                maxPartySize: 4,
                scenePath: 'res://scenes/dungeons/InfernoPit.tscn',
                baseGoldReward: 2000,
                baseXpReward: 1000,
                totalFloors: 7,
                isRepeatable: true,
                resetType: 'WEEKLY'
            },
            {
                dungeonKey: 'VOID_RIFT',
                name: 'Void Rift',
                description: 'A tear in reality itself. Nothing escapes unchanged.',
                difficulty: 'LEGENDARY',
                recommendedLevel: 50,
                recommendedItemPower: 5000,
                entryCost: 1000,
                minPartySize: 4,
                maxPartySize: 8,
                scenePath: 'res://scenes/dungeons/VoidRift.tscn',
                baseGoldReward: 10000,
                baseXpReward: 5000,
                totalFloors: 10,
                isRepeatable: false,
                resetType: 'NONE'
            }
        ];
        
        for (const dungeon of dungeons) {
            const created = await prisma.dungeonTemplate.upsert({
                where: { dungeonKey: dungeon.dungeonKey },
                update: dungeon,
                create: dungeon
            });
            
            logger.info(`[DungeonService.seedDungeons] Created dungeon: ${dungeon.name}`);
        }
        
        return dungeons.length;
    }

    /**
     * Create seed floors for all dungeons
     */
    async seedFloors() {
        logger.info('[DungeonService.seedFloors] Creating dungeon floors');
        
        // Get all dungeons
        const dungeons = await prisma.dungeonTemplate.findMany();
        
        // Get modifiers
        const modifiers = await prisma.dungeonModifier.findMany();
        
        const floorConfigs = {
            CRYSTAL_CAVERNS: [
                { floorNumber: 1, name: 'Crystal Entrance', description: 'The glittering entrance to the caverns.', modifierKeys: [] },
                { floorNumber: 2, name: 'Gemstone Grotto', description: 'Deeper in, the crystals grow larger and more valuable.', modifierKeys: ['FIRE_REALM'] },
                { floorNumber: 3, name: 'The Heart of Crystal', description: 'A massive crystal beats at the center. Guard it well.', modifierKeys: ['ELITE'], bossRequired: true }
            ],
            SHADOW_WARRENS: [
                { floorNumber: 1, name: 'Dark Passage', description: 'The first corridor of shadows.', modifierKeys: [] },
                { floorNumber: 2, name: 'Twisting Maze', description: 'Easy to get lost in the darkness.', modifierKeys: ['NO_HEALING'] },
                { floorNumber: 3, name: 'Shadow Pool', description: 'A pool of pure shadow energy.', modifierKeys: ['SWARM'] },
                { floorNumber: 4, name: 'The Nest', description: 'Where the shadow beasts rest.', modifierKeys: ['FORTIFIED'] },
                { floorNumber: 5, name: 'Shadow Lord\'s Chamber', description: 'The final confrontation awaits.', modifierKeys: ['BOSS_RUSH'], bossRequired: true }
            ],
            INFERNO_PIT: [
                { floorNumber: 1, name: 'Volcanic Entrance', description: 'Heat rises from the depths below.', modifierKeys: ['FIRE_REALM'] },
                { floorNumber: 2, name: 'Lava Streams', description: 'River of molten rock block your path.', modifierKeys: ['TIME_ATTACK'] },
                { floorNumber: 3, name: 'Fire Elemental Chamber', description: 'Pure fire elementals guard this floor.', modifierKeys: ['ELITE', 'FIRE_REALM'], bossRequired: true },
                { floorNumber: 4, name: 'The Cinder Path', description: 'Ash fills the air, making it hard to breathe.', modifierKeys: ['SWARM', 'NO_HEALING'] },
                { floorNumber: 5, name: 'Demon Barracks', description: 'Fire demons prepare for battle.', modifierKeys: ['FORTIFIED'] },
                { floorNumber: 6, name: 'The Infernal Gate', description: 'The gate to the final floor burns with hellfire.', modifierKeys: ['BOSS_RUSH', 'TIME_ATTACK'] },
                { floorNumber: 7, name: 'The Fire Lord\'s Throne', description: 'The ultimate challenge. Defeat the Fire Lord!', modifierKeys: ['BOSS_RUSH', 'FIRE_REALM'], bossRequired: true }
            ],
            VOID_RIFT: [
                { floorNumber: 1, name: 'Reality\'s Edge', description: 'The boundary between worlds grows thin.', modifierKeys: [] },
                { floorNumber: 2, name: 'The Dissolution', description: 'Nothing is solid here.', modifierKeys: ['VOID_REALM'] },
                { floorNumber: 3, name: 'Temporal Anomaly', description: 'Time flows strangely in the void.', modifierKeys: ['TIME_ATTACK', 'VOID_REALM'] },
                { floorNumber: 4, name: 'The Nothing', description: 'Pure void. Even light is consumed.', modifierKeys: ['SWARM', 'VOID_REALM'] },
                { floorNumber: 5, name: 'Entropy\'s Reach', description: 'Everything decays in this place.', modifierKeys: ['NO_HEALING', 'VOID_REALM'] },
                { floorNumber: 6, name: 'The Void Temple', description: 'Ancient structure floating in nothingness.', modifierKeys: ['ELITE', 'VOID_REALM'], bossRequired: true },
                { floorNumber: 7, name: 'Dimensional Rift', description: 'Crossroads of infinite realities.', modifierKeys: ['BOSS_RUSH', 'VOID_REALM'] },
                { floorNumber: 8, name: 'The Abyss Stares Back', description: 'Something looks back from the void.', modifierKeys: ['FORTIFIED', 'VOID_REALM', 'TIME_ATTACK'] },
                { floorNumber: 9, name: 'Cosmic Horror', description: 'The final challenge approaches.', modifierKeys: ['BOSS_RUSH', 'ELITE', 'VOID_REALM'], bossRequired: true },
                { floorNumber: 10, name: 'The Void Throne', description: 'Sit upon the throne of nothing. Become legend.', modifierKeys: ['BOSS_RUSH', 'VOID_REALM', 'NO_HEALING'], bossRequired: true }
            ]
        };
        
        let floorCount = 0;
        
        for (const dungeon of dungeons) {
            const config = floorConfigs[dungeon.dungeonKey];
            if (!config) continue;
            
            for (const floorConfig of config) {
                // Find modifiers for this floor
                const floorModifiers = modifiers.filter(m => 
                    floorConfig.modifierKeys.includes(m.modifierKey)
                );
                
                // Create floor
                const floor = await prisma.dungeonFloor.upsert({
                    where: {
                        dungeonId_floorNumber: {
                            dungeonId: dungeon.id,
                            floorNumber: floorConfig.floorNumber
                        }
                    },
                    update: {
                        name: floorConfig.name,
                        description: floorConfig.description,
                        bossRequired: floorConfig.bossRequired || false,
                        killCountRequired: floorConfig.bossRequired ? 1 : 10
                    },
                    create: {
                        dungeonId: dungeon.id,
                        floorNumber: floorConfig.floorNumber,
                        name: floorConfig.name,
                        description: floorConfig.description,
                        bossRequired: floorConfig.bossRequired || false,
                        killCountRequired: floorConfig.bossRequired ? 1 : 10,
                        eliteSpawnRate: 0.1 + (floorConfig.floorNumber * 0.05),
                        bossSpawnRate: floorConfig.bossRequired ? 1.0 : 0.0,
                        monsterLevelScale: 1.0 + (floorConfig.floorNumber * 0.1),
                        goldRewardScale: 1.0 + (floorConfig.floorNumber * 0.2),
                        xpRewardScale: 1.0 + (floorConfig.floorNumber * 0.2)
                    }
                });
                
                // Create floor modifiers
                for (const modifier of floorModifiers) {
                    await prisma.dungeonFloorModifier.upsert({
                        where: {
                            floorId_modifierId: {
                                floorId: floor.id,
                                modifierId: modifier.id
                            }
                        },
                        update: {},
                        create: {
                            floorId: floor.id,
                            modifierId: modifier.id,
                            stackCount: 1
                        }
                    });
                }
                
                floorCount++;
            }
            
            logger.info(`[DungeonService.seedFloors] Created ${config.length} floors for ${dungeon.name}`);
        }
        
        logger.info(`[DungeonService.seedFloors] Total floors created: ${floorCount}`);
        return floorCount;
    }
}

module.exports = new DungeonService();
