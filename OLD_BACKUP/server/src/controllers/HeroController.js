const BaseController = require('./BaseController');
const formationService = require('../services/formationService');
const prisma = require('../db');

class HeroController extends BaseController {
    async getHeroProfile(req, res) {
        await this.execute(res, async () => {
            const heroId = parseInt(req.params.id);
            if (isNaN(heroId)) return this.sendError(res, "Invalid Hero ID", 400);
            const profile = await formationService.getHeroCombatProfile(heroId);
            this.sendSuccess(res, profile);
        });
    }

    async getHeroes(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const heroes = await prisma.hero.findMany({
                where: { userId },
                include: { 
                    combatClass: true, 
                    equipment: true,
                    skills: {
                        where: { isActive: true },
                        include: { skill: true }
                    },
                    traits: {
                        include: { trait: true }
                    }
                }
            });

            // Transform heroes to flatten skill and trait structures
            const flattenedHeroes = heroes.map(hero => {
                const flatSkills = hero.skills.map(hs => hs.skill);
                const flatTraits = hero.traits.map(ht => ({
                    name: ht.trait.name,
                    level: ht.level || 1,
                    description: ht.trait.description || "",
                    category: ht.trait.category || "GENERAL"
                }));
                return {
                    ...hero,
                    skills: flatSkills,
                    passives: flatTraits
                };
            });

            this.sendSuccess(res, flattenedHeroes);
        });
    }
}

module.exports = new HeroController();
