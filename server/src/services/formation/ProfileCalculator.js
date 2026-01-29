const BaseService = require('../BaseService');

class ProfileCalculator extends BaseService {
    async getHeroCombatProfile(heroId) {
        const hero = await this.db.hero.findUnique({
            where: { id: heroId },
            include: {
                equipment: {
                    include: {
                        itemInstance: {
                            include: {
                                template: {
                                    include: {
                                        stats: true,
                                        traits: { include: { trait: true } }
                                    }
                                }
                            }
                        }
                    }
                },
                combatClass: true,
                traits: { include: { trait: true } }
            }
        });

        if (!hero) return null;

        const profile = {
            id: hero.id,
            name: hero.name,
            totalStats: {},
            activeTraits: []
        };

        hero.traits.forEach(t => profile.activeTraits.push(t.trait.name));

        for (const eq of hero.equipment) {
            const item = eq.itemInstance.template;
            item.stats.forEach(s => {
                profile.totalStats[s.statKey] = (profile.totalStats[s.statKey] || 0) + s.statValue;
            });
            item.traits.forEach(t => {
                profile.activeTraits.push({
                    name: t.trait.name,
                    sourceSlot: eq.slotKey
                });
            });
        }

        return profile;
    }
}

module.exports = new ProfileCalculator();
