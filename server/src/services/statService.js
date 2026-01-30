const BaseService = require('./BaseService');
const { Stat, StatModifier } = require('../logic/statSystem');
const statGrowthSystem = require('./stat/StatGrowthSystem');
const scalingComponent = require('./stat/ScalingComponent');

/**
 * StatService
 * The thin orchestrator for hero stat calculation.
 * Uses inheritance (BaseService) and composition (ScalingComponent).
 */
class StatService extends BaseService {
    async calculateHeroStats(heroId, context = "GLOBAL") {
        const now = new Date();

        const heroData = await this.db.hero.findUnique({
            where: { id: heroId },
            include: { 
                user: true,
                combatClass: true,
                skills: { where: { isActive: true }, include: { skill: true } },
                buffs: { where: { expiresAt: { gt: now } } },
                equipment: { include: { itemInstance: { include: { template: { include: { stats: true } } } } } }
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

        // --- AAA WORLD EVENT INTEGRATION ---
        if (heroData.user) {
            const activeEvents = await this.db.activeEvent.findMany({
                where: { regionId: heroData.user.currentRegion, expiresAt: { gt: now } },
                include: { template: true }
            });

            for (const ae of activeEvents) {
                const eventMeta = JSON.parse(ae.template.metadata);
                // Apply Stat Bonuses (e.g., stat_int_bonus)
                Object.entries(eventMeta).forEach(([key, val]) => {
                    if (key.startsWith("stat_")) {
                        const statKey = key.replace("stat_", "").replace("_bonus", "");
                        applyMod(statKey, val, 0, `Event:${ae.template.name}`);
                    }
                    // Apply Multipliers (e.g., combat_def_mult)
                    if (key.endsWith("_mult")) {
                        const statKey = key.replace("combat_", "").replace("_mult", "");
                        if (stats[statKey]) applyMod(statKey, val - 1.0, 1, `Event:${ae.template.name}`);
                    }
                });
            }
        }

        // 2. Composition: Equipment
        this._applyEquipment(heroData.equipment, context, applyMod);

        // 3. Composition: Buffs
        heroData.buffs.forEach(b => applyMod(b.statKey, b.statValue, b.isPercent ? 1 : 0, `Buff:${b.name}`));

        // 4. Composition: Skills
        this._applySkills(heroData.skills, applyMod);

        // 5. Composition: Class Growth
        statGrowthSystem.applyGrowth(stats, heroData.combatClass, heroData.classLevel);

        // 6. Composition: Attribute Scaling (Modular Logic)
        scalingComponent.applyAttributeScaling(primary, stats, applyMod);

        // 7. Finalize
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
            const item = eq.itemInstance.template;
            let valid = true;
            if (item.category === "PICKAXE" && context !== "MINING") valid = false;
            if (item.category === "AXE" && context !== "LUMBERING") valid = false;
            if (item.category === "FISHING_ROD" && context !== "FISHING") valid = false;
            if (item.category === "HERBALISM_SICKLE" && context !== "HERBALISM") valid = false;

            if (valid) {
                item.stats.forEach(s => applyMod(s.statKey, s.statValue, 0, `Equip:${item.name}`));
            }
        }
    }

    _applySkills(skills, applyMod) {
        for (const hs of skills) {
            if (hs.skill.category === "PASSIVE") {
                try {
                    const meta = JSON.parse(hs.skill.metadata);
                    if (meta.statKey && meta.statValue) applyMod(meta.statKey, meta.statValue, 0, `Skill:${hs.skill.name}`);
                } catch (e) {}
            }
        }
    }
}

module.exports = new StatService();