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

        const heroSkills = await this.db.heroSkill.findMany({
            where: { heroId, isActive: true },
            include: { skill: true }
        });

        const profile = {
            id: hero.id,
            name: hero.name,
            isMain: hero.isMain,
            totalStats: {
                HP: hero.hp_base,
                MP: 100, // Default base MP
                ATK: hero.damage_base,
                ARMOR: hero.defense_base,
                SPD: hero.speed_base,
                RANGE: hero.range_base,
                DEX: hero.dex,
                STR: hero.str,
                INT: hero.int,
                DEF: hero.def
            },
            activeTraits: [],
            equippedItems: [], // AAA: Tracking for Durability
            abilities: heroSkills.map(hs => ({
                id: hs.skill.id,
                name: hs.skill.name,
                category: hs.skill.category,
                type: hs.skill.type,
                // Refactored Metadata
                statKey: hs.skill.statKey,
                statValue: hs.skill.statValue,
                power: hs.skill.power,
                duration: hs.skill.duration,
                multiplier: hs.skill.multiplier,
                manaCost: hs.skill.manaCost
            }))
        };

        // Add class-based resource types if needed
        if (hero.combatClass && hero.combatClass.resourceType === "ENERGY") {
            profile.totalStats.MP = 100; // Energy max
        }

        hero.traits.forEach(t => profile.activeTraits.push(t.trait.name));

        for (const eq of hero.equipment) {
            const instance = eq.itemInstance;
            const item = instance.template;

            profile.equippedItems.push({
                instanceId: instance.id,
                slot: eq.slotKey,
                category: item.category
            });

            item.stats.forEach(s => {
                // Key standardization: Ensure we use uppercase keys consistently
                const key = s.statKey.toUpperCase();
                profile.totalStats[key] = (profile.totalStats[key] || 0) + s.statValue;
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
