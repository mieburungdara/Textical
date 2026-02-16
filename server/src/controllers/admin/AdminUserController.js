const prisma = require('../../db');

/**
 * Controller for User and Hero management in the admin portal.
 */
class AdminUserController {
    // --- Users Management ---
    async getUsers(req, res) {
        try {
            const { page = 1, limit = 50, search = '', sort = 'id-desc' } = req.query;
            const skip = (page - 1) * limit;
            
            const [sortField, sortOrder] = sort.split('-');
            const orderBy = {};
            
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
            
            const heroCountMap = {};
            heroCounts.forEach(h => {
                heroCountMap[h.userId] = h._count.userId;
            });
            
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
            res.status(500).json({ success: false, error: error.message });
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
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const data = req.body;
            
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
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            await prisma.user.delete({ where: { id: userId } });
            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async adjustUserSilver(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const { amount } = req.body;
            
            if (typeof amount !== 'number') {
                return res.status(400).json({ success: false, error: 'Amount must be a number' });
            }
            
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
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
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- Heroes Management ---
    async getHeroes(req, res) {
        try {
            const { page = 1, limit = 50, search = '', userId } = req.query;
            
            const safeSearch = (search && (search.includes('http://') || search.includes('https://') || search.includes('localhost'))) 
                ? '' 
                : search;
            
            const skip = (page - 1) * limit;
            const where = {};
            if (safeSearch) where.name = { contains: safeSearch };
            if (userId) where.userId = parseInt(userId);
            
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
            res.status(500).json({ success: false, error: error.message });
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
                return res.status(404).json({ success: false, error: 'Hero not found' });
            }
            
            res.json({ success: true, data: hero });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateHero(req, res) {
        try {
            const heroId = parseInt(req.params.id);
            const updateData = req.body;
            
            // Build update object with only allowed fields
            const allowedFields = [
                'name', 'unitLevel', 'unitXp', 'classLevel', 'classXp', 'level', 'xp',
                'hp_base', 'damage_base', 'defense_base', 'speed_base', 'range_base',
                'str', 'dex', 'int', 'vit', 'luk',
                'fire_damage', 'water_damage', 'earth_damage', 'wind_damage', 'light_damage', 'dark_damage',
                'crit_chance', 'crit_damage', 'dodge_chance', 'block_chance', 'parry_chance',
                'hp_regen', 'mana_regen', 'vitality', 'isMain', 'userId'
            ];
            
            const dataToUpdate = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    dataToUpdate[field] = updateData[field];
                }
            }
            
            const hero = await prisma.hero.update({
                where: { id: heroId },
                data: dataToUpdate,
                include: {
                    user: { select: { id: true, username: true } },
                    combatClass: true
                }
            });
            
            res.json({ success: true, data: hero, message: 'Hero updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
  async getSkills(req, res) {
    try {
      const skills = await prisma.skillTemplate.findMany({
        orderBy: { id: 'asc' }
      });
      res.json({ success: true, data: skills });
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addHeroSkill(req, res) {
    try {
      const { id } = req.params;
      const { skillId } = req.body;
      
      if (!skillId) {
        return res.status(400).json({ success: false, error: 'skillId is required' });
      }

      const hero = await prisma.hero.findUnique({ where: { id: parseInt(id) } });
      if (!hero) {
        return res.status(404).json({ success: false, error: 'Hero not found' });
      }

      const skill = await prisma.skillTemplate.findUnique({ where: { id: skillId } });
      if (!skill) {
        return res.status(404).json({ success: false, error: 'Skill not found' });
      }

      const heroSkill = await prisma.heroSkill.create({
        data: {
          heroId: parseInt(id),
          skillId: skillId,
          unlockedAt: new Date(),
          isActive: true
        }
      });

      res.json({ success: true, data: heroSkill });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ success: false, error: 'Skill already exists on this hero' });
      }
      console.error('Error adding hero skill:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async removeHeroSkill(req, res) {
    try {
      const { id, skillId } = req.params;

      const heroSkill = await prisma.heroSkill.findFirst({
        where: {
          heroId: parseInt(id),
          skillId: parseInt(skillId)
        }
      });

      if (!heroSkill) {
        return res.status(404).json({ success: false, error: 'Hero skill not found' });
      }

      await prisma.heroSkill.delete({
        where: { id: heroSkill.id }
      });

      res.json({ success: true, message: 'Skill removed successfully' });
    } catch (error) {
      console.error('Error removing hero skill:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AdminUserController();
