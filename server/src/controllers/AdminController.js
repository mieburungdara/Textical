const prisma = require('../db');
const assetService = require('../services/assetService');

class AdminController {
    // --- Dashboard Stats ---
    async getDashboardStats(req, res) {
        try {
            const [userCount, heroCount, monsterCount, regionCount, itemCount] = await Promise.all([
                prisma.user.count(),
                prisma.hero.count(),
                prisma.monsterTemplate.count(),
                prisma.regionTemplate.count(),
                prisma.itemTemplate.count()
            ]);
            
            const recentUsers = await prisma.user.findMany({
                orderBy: { id: 'desc' },
                take: 5,
                select: {
                    id: true,
                    username: true,
                    silver: true,
                    gold: true,
                    energy: true,
                    isKnockedOut: true
                }
            });
            
            const activeTasks = await prisma.taskQueue.count({
                where: { status: 'RUNNING' }
            });
            
            res.json({
                success: true,
                data: {
                    users: userCount,
                    heroes: heroCount,
                    monsters: monsterCount,
                    regions: regionCount,
                    items: itemCount,
                    activeTasks,
                    recentUsers
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Users Management ---
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 50, search = '', sort = 'id-desc' } = req.query;
            const skip = (page - 1) * limit;
            
            // Parse sort parameter
            const [sortField, sortOrder] = sort.split('-');
            const orderBy = {};
            
            // Valid sort fields
            const validSortFields = ['id', 'silver', 'gold', 'energy', 'username'];
            if (validSortFields.includes(sortField)) {
                orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';
            } else {
                orderBy.id = 'desc';
            }
            
            const where = search ? {
                OR: [
                    { username: { contains: search } }
                ]
            } : {};
            
            const [users, total, heroCounts] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy,
                    select: {
                        id: true,
                        username: true,
                        silver: true,
                        gold: true,
                        energy: true,
                        maxEnergy: true,
                        currentRegion: true,
                        isInTavern: true,
                        premiumTierId: true,
                        guildId: true,
                        factionId: true,
                        isKnockedOut: true
                    }
                }),
                prisma.user.count({ where }),
                prisma.hero.groupBy({
                    by: ['userId'],
                    _count: { userId: true }
                })
            ]);
            
            // Create hero count map
            const heroCountMap = {};
            heroCounts.forEach(h => {
                heroCountMap[h.userId] = h._count.userId;
            });
            
            // Add hero count to users
            const usersWithHeroCount = users.map(user => ({
                ...user,
                heroCount: heroCountMap[user.id] || 0
            }));
            
            res.json({
                success: true,
                data: {
                    users: usersWithHeroCount,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getUserById(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    heroes: true,
                    inventory: { include: { template: true } },
                    taskQueue: true,
                    activeQuests: true,
                    guild: true,
                    faction: true
                }
            });
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'User not found' 
                });
            }
            
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const data = req.body;
            
            // Handle null values properly
            const updateData = {};
            if (data.silver !== undefined) updateData.silver = Math.max(0, data.silver);
            if (data.gold !== undefined) updateData.gold = Math.max(0, data.gold);
            if (data.energy !== undefined) updateData.energy = Math.max(0, data.energy);
            if (data.maxEnergy !== undefined) updateData.maxEnergy = Math.max(1, data.maxEnergy);
            if (data.currentRegion !== undefined) updateData.currentRegion = Math.max(1, data.currentRegion);
            if (data.isInTavern !== undefined) updateData.isInTavern = data.isInTavern;
            if (data.isKnockedOut !== undefined) updateData.isKnockedOut = data.isKnockedOut;
            if (data.premiumTierId !== undefined) updateData.premiumTierId = data.premiumTierId;
            if (data.factionId !== undefined) updateData.factionId = data.factionId;
            if (data.guildId !== undefined) updateData.guildId = data.guildId;
            
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    username: true,
                    silver: true,
                    gold: true,
                    energy: true,
                    maxEnergy: true,
                    currentRegion: true,
                    isInTavern: true,
                    isKnockedOut: true,
                    premiumTierId: true,
                    factionId: true,
                    guildId: true
                }
            });
            
            res.json({ success: true, data: updatedUser });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            await prisma.user.delete({ where: { id: userId } });
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async adjustUserSilver(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const { amount } = req.body;
            
            if (typeof amount !== 'number') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Amount must be a number' 
                });
            }
            
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'User not found' 
                });
            }
            
            const newSilver = Math.max(0, user.silver + amount);
            
            await prisma.user.update({
                where: { id: userId },
                data: { silver: newSilver }
            });
            
            res.json({ 
                success: true, 
                message: `Silver adjusted: ${amount > 0 ? '+' : ''}${amount}. New balance: ${newSilver}`,
                newSilver
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Heroes Management ---
    async getHeroes(req, res) {
        try {
            // Log request details for debugging
            console.log('[AdminController] getHeroes request:', {
                query: req.query,
                headers: req.headers['user-agent'],
                ip: req.ip
            });
            
            const { page = 1, limit = 50, search = '', userId } = req.query;
            
            // Safeguard: Ignore search strings that look like URLs to prevent accidental filtering
            const safeSearch = (search && search.includes('http://') || search.includes('https://') || search.includes('localhost')) 
                ? '' 
                : search;
            if (safeSearch !== search) {
                console.log('[AdminController] Ignoring invalid search string:', search);
            }
            const skip = (page - 1) * limit;
            
            const where = {};
            if (safeSearch) {
                where.name = { contains: safeSearch };
            }
            if (userId) {
                where.userId = parseInt(userId);
            }
            
            const [heroes, total] = await Promise.all([
                prisma.hero.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        user: { select: { id: true, username: true } },
                        combatClass: true
                    }
                }),
                prisma.hero.count({ where })
            ]);
            
            res.json({
                success: true,
                data: {
                    heroes,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getHeroById(req, res) {
        try {
            const heroId = parseInt(req.params.id);
            const hero = await prisma.hero.findUnique({
                where: { id: heroId },
                include: {
                    user: { select: { id: true, username: true } },
                    combatClass: true,
                    equipment: true,
                    traits: true,
                    skills: true
                }
            });
            
            if (!hero) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Hero not found' 
                });
            }
            
            res.json({ success: true, data: hero });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Monsters Management ---
    async getMonsters(req, res) {
        try {
            const { page = 1, limit = 100, search = '', categoryId } = req.query;
            const skip = (page - 1) * limit;
            
            const where = {};
            if (search) {
                where.name = { contains: search };
            }
            if (categoryId && categoryId !== 'null' && categoryId !== '0') {
                where.categoryId = parseInt(categoryId);
            }
            
            const [monsters, total] = await Promise.all([
                prisma.monsterTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'asc' },
                    include: {
                        category: true,
                        traits: { include: { trait: true } }
                    }
                }),
                prisma.monsterTemplate.count({ where })
            ]);
            
            res.json(monsters); // Return flat array for simpler frontend handling
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getMonsterCategories(req, res) {
        try {
            const categories = await prisma.monsterCategory.findMany({
                orderBy: { name: 'asc' }
            });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateMonsterTemplate(req, res) {
        try {
            const id = req.params.id;
            const updated = await assetService.saveMonster(id, req.body);
            res.json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async createMonsterTemplate(req, res) {
        try {
            // Find next ID
            const lastMonster = await prisma.monsterTemplate.findFirst({
                orderBy: { id: 'desc' }
            });
            const nextId = (lastMonster ? lastMonster.id : 0) + 1;
            
            const created = await assetService.saveMonster(nextId, req.body);
            res.json({ success: true, data: created });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- Regions Management ---
    async getRegions(req, res) {
        try {
            const { page = 1, limit = 50, search = '' } = req.query;
            const skip = (page - 1) * limit;
            
            const where = search ? {
                OR: [
                    { name: { contains: search } }
                ]
            } : {};
            
            const [regions, total] = await Promise.all([
                prisma.regionTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        faction: true,
                        resources: true,
                        monsters: true
                    }
                }),
                prisma.regionTemplate.count({ where })
            ]);
            
            res.json({
                success: true,
                data: {
                    regions,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Items Management ---
    async getItems(req, res) {
        try {
            const { page = 1, limit = 50, search = '', category = '' } = req.query;
            const skip = (page - 1) * limit;
            
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ];
            }
            if (category) {
                where.category = category;
            }
            
            const [items, total] = await Promise.all([
                prisma.itemTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        stats: true,
                        traits: true,
                        equipSlots: true
                    }
                }),
                prisma.itemTemplate.count({ where })
            ]);
            
            res.json({
                success: true,
                data: {
                    items,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Quests Management ---
    async getQuests(req, res) {
        try {
            const { page = 1, limit = 50, search = '', category } = req.query;
            const skip = (page - 1) * limit;
            
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ];
            }
            if (category && category !== 'ALL') {
                where.category = category;
            }
            
            const [quests, total] = await Promise.all([
                prisma.questTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        questGiver: true,
                        turnInNpc: true,
                        faction: true,
                        stages: {
                            include: {
                                objectives: true,
                                rewards: true
                            }
                        }
                    }
                }),
                prisma.questTemplate.count({ where })
            ]);
            
            res.json({
                success: true,
                data: {
                    quests,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getQuestCategories(req, res) {
        try {
            const categories = await prisma.questTemplate.groupBy({
                by: ['category'],
                _count: { category: true }
            });
            
            const formatted = categories.map(c => ({
                id: c.category,
                name: c.category,
                count: c._count.category
            }));
            
            res.json({
                success: true,
                data: formatted
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async saveQuest(req, res) {
        try {
            const { id } = req.params;
            const quest = await assetService.saveQuest(id, req.body);
            res.json({ success: true, data: quest });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- Skills Management ---
    async getSkills(req, res) {
        try {
            const { page = 1, limit = 50, search = '' } = req.query;
            const skip = (page - 1) * limit;
            
            const where = search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {};
            
            const [skills, total] = await Promise.all([
                prisma.skillTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' }
                }),
                prisma.skillTemplate.count({ where })
            ]);
            
            res.json({
                success: true,
                data: {
                    skills,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Traits Management ---
    async getTraits(req, res) {
        try {
            const { page = 1, limit = 50, search = '', category = '' } = req.query;
            const skip = (page - 1) * limit;
            
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ];
            }
            if (category) {
                where.category = category;
            }
            
            const [traits, total] = await Promise.all([
                prisma.traitTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        stats: true
                    }
                }),
                prisma.traitTemplate.count({ where })
            ]);
            
            res.json({
                success: true,
                data: {
                    traits,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Factions Management ---
    async getFactions(req, res) {
        try {
            const { page = 1, limit = 50, search = '' } = req.query;
            const skip = (page - 1) * limit;
            
            const where = search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {};
            
            const [factions, total] = await Promise.all([
                prisma.faction.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' }
                }),
                prisma.faction.count({ where })
            ]);
            
            // Get member count for each faction
            const factionsWithCounts = await Promise.all(
                factions.map(async faction => {
                    const memberCount = await prisma.user.count({
                        where: { factionId: faction.id }
                    });
                    return { ...faction, memberCount };
                })
            );
            
            res.json({
                success: true,
                data: {
                    factions: factionsWithCounts,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Analytics Stats ---
    async getStatsSummary(req, res) {
        try {
            const [totalUsers, totalGold, totalSilver, totalHeroes, avgHeroLevel] = await Promise.all([
                prisma.user.count(),
                prisma.user.aggregate({ _sum: { gold: true } }),
                prisma.user.aggregate({ _sum: { silver: true } }),
                prisma.hero.count(),
                prisma.hero.aggregate({ _avg: { level: true } })
            ]);
            
            res.json({
                success: true,
                data: {
                    totalUsers,
                    totalGold: totalGold._sum.gold || 0,
                    totalSilver: totalSilver._sum.silver || 0,
                    totalHeroes,
                    avgHeroLevel: avgHeroLevel._avg.level || 0
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getEconomyStats(req, res) {
        try {
            const [userStats, guildStats] = await Promise.all([
                prisma.user.aggregate({
                    _sum: { gold: true, silver: true },
                    _avg: { gold: true, silver: true }
                }),
                prisma.guild.findMany({
                    select: {
                        vaultGold: true,
                        treasury: true
                    }
                })
            ]);
            
            // Calculate total guild gold
            const guildGold = guildStats.reduce((sum, g) => sum + (g.vaultGold || 0) + (g.treasury || 0), 0);
            
            res.json({
                success: true,
                data: {
                    totalGold: userStats._sum.gold || 0,
                    totalSilver: userStats._sum.silver || 0,
                    avgGold: userStats._avg.gold || 0,
                    avgSilver: userStats._avg.silver || 0,
                    guildGold: guildGold,
                    shopValue: 0
                }
            });
        } catch (error) {
            console.error('Economy stats error:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getActivityStats(req, res) {
        try {
            const { days = 30 } = req.query;
            const daysNum = parseInt(days);
            
            const labels = [];
            const newUsers = [];
            
            // Generate sample activity data since User model doesn't track creation/login dates
            for (let i = daysNum - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                labels.push(dateStr);
                // Random sample data for demo purposes
                newUsers.push(Math.floor(Math.random() * 5));
            }
            
            res.json({
                success: true,
                data: { labels, activePlayers: newUsers, newUsers }
            });
        } catch (error) {
            console.error('Activity stats error:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getHeroClassStats(req, res) {
        try {
            const heroClasses = await prisma.hero.groupBy({
                by: ['combatClassId'],
                _count: { combatClassId: true }
            });
            
            // Get class names
            const classIds = heroClasses.map(h => h.combatClassId).filter(id => id !== null);
            const classes = await prisma.combatClass.findMany({
                where: { id: { in: classIds } }
            });
            
            const classMap = {};
            classes.forEach(c => { classMap[c.id] = c.name; });
            
            const labels = heroClasses.map(h => classMap[h.combatClassId] || 'Unknown');
            const counts = heroClasses.map(h => h._count.combatClassId);
            
            res.json({
                success: true,
                data: { labels, counts }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getSkillsUsageStats(req, res) {
        try {
            // Placeholder - would need skill usage tracking table
            // For now, return top skills by hero count
            const topSkills = await prisma.skillTemplate.findMany({
                take: 10,
                orderBy: { id: 'asc' },
                select: { name: true }
            });
            
            const labels = topSkills.map(s => s.name);
            const counts = topSkills.map((_, i) => Math.floor(Math.random() * 100) + 10); // Placeholder
            
            res.json({
                success: true,
                data: { labels, counts }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getMonstersKilledStats(req, res) {
        try {
            // Placeholder - would need battle kill tracking
            const monsters = await prisma.monsterTemplate.findMany({
                take: 10,
                orderBy: { id: 'asc' },
                select: { name: true }
            });
            
            const labels = monsters.map(m => m.name);
            const counts = monsters.map((_, i) => Math.floor(Math.random() * 500) + 50); // Placeholder
            
            res.json({
                success: true,
                data: { labels, counts }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getRegionStats(req, res) {
        try {
            const regions = await prisma.regionTemplate.findMany({
                select: { name: true }
            });
            
            const labels = regions.map(r => r.name);
            const counts = regions.map(async r => {
                return await prisma.user.count({
                    where: { currentRegion: r.name }
                });
            });
            
            // Wait for all counts
            const resolvedCounts = await Promise.all(counts);
            
            res.json({
                success: true,
                data: { labels, counts: resolvedCounts }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getTopPlayers(req, res) {
        try {
            const topPlayers = await prisma.user.findMany({
                take: 10,
                orderBy: { gold: 'desc' },
                select: { id: true, username: true, gold: true, silver: true }
            });
            
            res.json({
                success: true,
                data: topPlayers
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getQuestStats(req, res) {
        try {
            // Placeholder - would need quest tracking table
            const quests = await prisma.questTemplate.findMany({
                take: 5,
                orderBy: { id: 'asc' },
                select: { id: true, name: true }
            });
            
            const questStats = quests.map(q => ({
                id: q.id,
                name: q.name,
                started: Math.floor(Math.random() * 100) + 10,
                completed: Math.floor(Math.random() * 80) + 5
            }));
            
            res.json({
                success: true,
                data: questStats
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async exportStats(req, res) {
        try {
            const { days = 30 } = req.query;
            
            const summary = await this.getStatsSummary(req, { json: () => ({ success: true, data: {} }) });
            const economy = await this.getEconomyStats(req, { json: () => ({ success: true, data: {} }) });
            const activity = await this.getActivityStats(req, { json: () => ({ success: true, data: {} }) });
            
            const exportData = {
                exportDate: new Date().toISOString(),
                period: `${days} days`,
                summary: summary,
                economy: economy,
                activity: activity
            };
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${Date.now()}.json`);
            res.json(exportData);
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Server Management ---
    async getServerHealth(req, res) {
        try {
            const os = require('os');
            
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();
            
            const healthData = {
                uptime: Math.floor(uptime),
                uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                memoryUsage: {
                    heapUsed: Number(Math.round(memoryUsage.heapUsed / 1024 / 1024)),
                    heapTotal: Number(Math.round(memoryUsage.heapTotal / 1024 / 1024)),
                    rss: Number(Math.round(memoryUsage.rss / 1024 / 1024))
                },
                systemMemory: {
                    total: Number(Math.round(os.totalmem() / 1024 / 1024 / 1024)),
                    free: Number(Math.round(os.freemem() / 1024 / 1024 / 1024))
                },
                cpuLoad: os.loadavg().map(n => Number(n.toFixed(2))),
                nodeVersion: process.version,
                platform: os.platform()
            };
            
            res.json({
                success: true,
                data: healthData
            });
        } catch (error) {
            console.error('Server health error:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getDatabaseStats(req, res) {
        try {
            const [userCount, heroCount, monsterCount, itemCount, questCount, guildCount] = await Promise.all([
                prisma.user.count(),
                prisma.hero.count(),
                prisma.monsterTemplate.count(),
                prisma.itemTemplate.count(),
                prisma.questTemplate.count(),
                prisma.guild.count()
            ]);
            
            res.json({
                success: true,
                data: {
                    tables: {
                        users: userCount,
                        heroes: heroCount,
                        monsters: monsterCount,
                        items: itemCount,
                        quests: questCount,
                        guilds: guildCount
                    },
                    totalRecords: userCount + heroCount + monsterCount + itemCount + questCount + guildCount
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Bulk Operations ---
    async bulkUpdateItems(req, res) {
        try {
            const { updates } = req.body;
            
            if (!Array.isArray(updates)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Updates must be an array' 
                });
            }
            
            const results = await Promise.all(
                updates.map(async (update) => {
                    const { id, ...data } = update;
                    return await prisma.itemTemplate.update({
                        where: { id: parseInt(id) },
                        data
                    });
                })
            );
            
            res.json({
                success: true,
                data: {
                    updated: results.length,
                    items: results
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async bulkCreateMonsters(req, res) {
        try {
            const { monsters } = req.body;
            
            if (!Array.isArray(monsters)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Monsters must be an array' 
                });
            }
            
            const results = await Promise.all(
                monsters.map(monster => 
                    prisma.monsterTemplate.create({ data: monster })
                )
            );
            
            res.json({
                success: true,
                data: {
                    created: results.length,
                    monsters: results
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async bulkPlayerAction(req, res) {
        try {
            const { userIds, action, amount } = req.body;
            
            if (!Array.isArray(userIds)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userIds must be an array' 
                });
            }
            
            let updateData = {};
            if (action === 'add_silver') updateData = { silver: { increment: amount } };
            else if (action === 'add_gold') updateData = { gold: { increment: amount } };
            else if (action === 'ban') updateData = { isBanned: true };
            else if (action === 'unban') updateData = { isBanned: false };
            
            const results = await Promise.all(
                userIds.map(userId => 
                    prisma.user.update({
                        where: { id: parseInt(userId) },
                        data: updateData
                    })
                )
            );
            
            res.json({
                success: true,
                data: {
                    affected: results.length,
                    action
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // --- Activity Logs ---
    async getAdminActionLogs(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            
            // Placeholder - would need admin action logging table
            res.json({
                success: true,
                data: {
                    logs: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    async getTransactionLogs(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            
            // Placeholder - would need transaction logging table
            res.json({
                success: true,
                data: {
                    transactions: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
}

module.exports = new AdminController();
