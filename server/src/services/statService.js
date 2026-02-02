const BaseService = require('./BaseService');
const { Stat, StatModifier } = require('../logic/statSystem');
const statGrowthSystem = require('./stat/StatGrowthSystem');
const scalingComponent = require('./stat/ScalingComponent');
const facilityResolver = require('../logic/guild/FacilityEffectResolver');
const factionService = require('./factionService');

/**
 * StatService
 * The thin orchestrator for hero stat calculation.
 * Enhanced with Guild Facility and Faction Perk support.
 */
class StatService extends BaseService {
    async calculateHeroStats(heroId, context = "GLOBAL") {
        const now = new Date();

        const heroData = await this.db.hero.findUnique({
            where: { id: heroId },
            include: { 
                user: { include: { guild: { include: { facilities: { include: { template: true } } } } } },
                combatClass: true,
                skills: { where: { isActive: true }, include: { skill: true } },
                buffs: { where: { expiresAt: { gt: now } } },
                equipment: { 
                    include: { 
                        itemInstance: { 
                            include: { 
                                template: { 
                                    include: { 
                                        stats: true,
                                        traits: { include: { trait: { include: { stats: true } } } }
                                    } 
                                },
                                instanceTraits: { include: { trait: { include: { stats: true } } } }
                            } 
                        } 
                    } 
                }
            }
        });

        if (!heroData) throw new Error("Hero not found");

        // 1. Init
        const primary = {
            str: new Stat(heroData.str || 10), dex: new Stat(heroData.dex || 10),
            int: new Stat(heroData.int || 10), vit: new Stat(heroData.vit || 10)
        };

        const stats = this._initializeSecondaryStats(heroData);

        const applyMod = (statKey, val, type, src) => {
            if (val != null) {
                if (stats[statKey]) stats[statKey].addModifier(new StatModifier(val, type, src));
                else if (primary[statKey]) primary[statKey].addModifier(new StatModifier(val, type, src));
            }
        };

        // 2. AAA WORLD EVENT INTEGRATION
        if (heroData.user) {
            const activeEvents = await this.db.activeEvent.findMany({
                where: { regionId: heroData.user.currentRegion, expiresAt: { gt: now } },
                include: { template: true }
            });

            for (const ae of activeEvents) {
                const t = ae.template;
                applyMod('int', t.statIntBonus, 0, `Event:${t.name}`);
                if (t.combatAtkMult) applyMod('attack_damage', t.combatAtkMult - 1.0, 1, `Event:${t.name}`);
                if (t.combatDefMult) applyMod('defense', t.combatDefMult - 1.0, 1, `Event:${t.name}`);
            }
        }

        // 3. AAA GUILD FACILITY INTEGRATION
        if (heroData.user && heroData.user.guild) {
            const guildBuffs = facilityResolver.resolveTotalBuffs(heroData.user.guild.facilities);
            for (const [statKey, val] of Object.entries(guildBuffs)) {
                applyMod(statKey, val, 1, `GuildFacility`);
            }
        }

        // 4. AAA FACTION PERK INTEGRATION (New)
        if (heroData.user && heroData.user.factionId) {
            const factionPerks = await factionService.getActivePerks(heroData.user.id);
            factionPerks.forEach(p => {
                // Faction perks apply PERCENTAGE bonuses
                applyMod(p.key, p.value, 1, `FactionRank`);
            });
        }

        // 5. Composition: Equipment
        this._applyEquipment(heroData.equipment, context, applyMod);

        // 6. Composition: Buffs
        heroData.buffs.forEach(b => applyMod(b.statKey, b.statValue, b.isPercent ? 1 : 0, `Buff:${b.name}`));

        // 7. Composition: Skills
        heroData.skills.forEach(hs => {
            if (hs.skill.category === "PASSIVE") {
                applyMod(hs.skill.statKey, hs.skill.statValue, 0, `Skill:${hs.skill.name}`);
            }
        });

        // 8. Composition: Class Growth
        statGrowthSystem.applyGrowth(stats, heroData.combatClass, heroData.classLevel);

        // 9. Composition: Attribute Scaling
        scalingComponent.applyAttributeScaling(primary, stats, applyMod);

        // 10. Finalize
        const finalStats = Object.fromEntries(Object.entries(stats).map(([k, s]) => [k, s.getValue()]));
        finalStats.attributes = { 
            str: primary.str.getValue(), dex: primary.dex.getValue(), 
            int: primary.int.getValue(), vit: primary.vit.getValue() 
        };

        return finalStats;
    }

    _initializeSecondaryStats(h) {
        return {
            health_max: new Stat(h.hp_base || 100), mana_max: new Stat(h.mana_base || 20),
            attack_damage: new Stat(h.damage_base || 10), defense: new Stat(h.defense_base || 0),
            speed: new Stat(h.speed_base || 5), attack_range: new Stat(h.range_base || 1),
            dodge_rate: new Stat(h.dodge_chance || 0), crit_chance: new Stat(h.crit_chance || 0.05),
            crit_damage: new Stat(h.crit_damage || 1.5), hp_regen: new Stat(h.hp_regen || 0),
            mana_regen: new Stat(h.mana_regen || 2), block_chance: new Stat(h.block_chance || 0),
            accuracy: new Stat(h.accuracy_base || 100), armor_penetration: new Stat(h.ar_pen_base || 0),
            skill_power: new Stat(h.skill_power_base || 10), tenacity: new Stat(h.tenacity_base || 0),
            block_power: new Stat(h.block_power_base || 0.5), initiative: new Stat(h.initiative_base || 0),
            lifesteal_rate: new Stat(h.lifesteal_base || 0)
        };
    }

    _applyEquipment(equipment, context, applyMod) {
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            const item = instance.template;
            
            // AAA: Durability Filter - Broken items give 0 stats
            if (instance.currentDurability <= 0) continue;

            let valid = true;
            if (item.category === "PICKAXE" && context !== "MINING") valid = false;
            if (item.category === "AXE" && context !== "LUMBERING") valid = false;
            if (item.category === "FISHING_ROD" && context !== "FISHING") valid = false;
            if (item.category === "HERBALISM_SICKLE" && context !== "HERBALISM") valid = false;

            if (valid) {
                const scale = instance.powerScale || 1.0;

                // 1. Base Template Stats (Scaled by Quality)
                item.stats.forEach(s => applyMod(s.statKey, s.statValue * scale, 0, `Equip:${item.name} (${instance.quality})`));

                // 2. AAA: Template-Based Traits (Not scaled by instance quality usually)
                item.traits.forEach(it => {
                    it.trait.stats.forEach(ts => {
                        applyMod(ts.statKey, ts.statValue, 0, `Trait:${it.trait.name}`);
                    });
                });

                // 3. AAA: Instance-Based Traits (Magical Affixes)
                instance.instanceTraits.forEach(it => {
                    it.trait.stats.forEach(ts => {
                        applyMod(ts.statKey, ts.statValue, 0, `Affix:${it.trait.name}`);
                    });
                });
            }
        }
    }
}

module.exports = new StatService();
