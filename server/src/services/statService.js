/**
 * EnhancedStatService
 * Orchestrates hero stat calculation with layered processing,
 * caching, real-time recalculation, and integration with supporting services.
 */
const BaseService = require('./BaseService');
const { 
    EnhancedStat, 
    StatModifier, 
    StatModifierType,
    GrowthCurveType,
    ConditionType 
} = require('../logic/statSystem');
const StatCurveCalculator = require('./stat/StatCurveCalculator');
const ElementalResolver = require('./stat/ElementalResolver');
const SetBonusResolver = require('./stat/SetBonusResolver');
const StatCapResolver = require('./stat/StatCapResolver');
const statGrowthSystem = require('./stat/StatGrowthSystem');
const scalingComponent = require('./stat/ScalingComponent');
const facilityResolver = require('../logic/guild/FacilityEffectResolver');
const factionService = require('./factionService');

/**
 * Calculation layers in order of application
 * @enum {number}
 */
const CalculationLayer = {
    BASE: 1,           // Hero base stats
    GROWTH: 2,         // Level/class growth
    ALLOCATION: 3,     // Stat allocation
    EQUIPMENT: 4,      // Equipment stats
    SET_BONUS: 5,      // Equipment set bonuses
    ELEMENTAL: 6,      // Elemental modifiers
    SKILLS: 7,         // Passive skills
    BUFFS: 8,          // Active buffs
    GUILD: 9,          // Guild facility buffs
    FACTION: 10,       // Faction perks
    EVENTS: 11,        // World event modifiers
    SCALING: 12,       // Apply attribute scaling
    CAPS: 13           // Apply caps (must be after scaling)
};

// Priority constants for stat modifiers
const ModifierPriority = {
    BASE: 0,
    GROWTH: 5,
    ALLOCATION: 10,
    EQUIPMENT: 20,
    SET_BONUS: 25,
    ELEMENTAL: 30,
    SKILLS: 35,
    BUFFS: 40,
    GUILD: 45,
    FACTION: 50,
    EVENTS: 55,
    SCALING: 60
};

class EnhancedStatService extends BaseService {
    /**
     * Create the enhanced stat service
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super();
        
        // Initialize supporting services
        this.elementalResolver = new ElementalResolver();
        this.setBonusResolver = new SetBonusResolver(options.setBonus);
        this.statCapResolver = new StatCapResolver(options.caps);
        
        // Cache configuration
        this.cacheEnabled = options.cacheEnabled !== false;
        this.statCache = new Map();
        this.cacheTTL = options.cacheTTL || 30000; // 30 seconds default
        
        // Cache key separator
        this.cacheKeySeparator = ':';
    }

    /**
     * Calculate complete hero stats with layered processing
     * @param {number} heroId - Hero ID
     * @param {Object} context - Calculation context
     * @returns {Object} Calculated stats with breakdown
     */
    async calculateHeroStats(heroId, context = {}) {
        const startTime = Date.now();
        const cacheKey = this._getCacheKey(heroId, context);
        
        // Check cache if enabled and not forcing recalculation
        if (this.cacheEnabled && !context.forceRecalculate) {
            const cached = this._getFromCache(cacheKey);
            if (cached && !this._isCacheExpired(cached)) {
                cached.fromCache = true;
                cached.calculationTime = Date.now() - startTime;
                return cached;
            }
        }

        // Fetch hero data with all necessary includes
        const heroData = await this._fetchHeroData(heroId);
        if (!heroData) {
            throw new Error('Hero not found');
        }

        // Initialize calculation context
        const calcContext = {
            ...context,
            heroId: heroId,
            level: heroData.unitLevel,
            classLevel: heroData.classLevel,
            combatClassId: heroData.combatClassId,
            elementalAffinity: heroData.elementalAffinities,
            activeBuffs: heroData.buffs,
            currentHour: context.currentHour || new Date().getHours(),
            regionType: context.regionType
        };

        // Layer 1: Initialize stats with base values
        const stats = this._initializeStats(heroData);
        const primary = this._initializePrimaryStats(heroData);

        // Layer 2: Apply growth curves
        this._applyGrowth(stats, primary, heroData, calcContext);

        // Layer 3: Apply stat allocation
        this._applyStatAllocation(primary, heroData, calcContext);

        // Create applyMod function for this calculation
        const applyMod = this._createApplyModifier(primary, stats, calcContext);

        // Layer 3.5: Apply trait stat bonuses
        await this._applyTraitStatBonuses(primary, heroData, calcContext, applyMod);

        // Layer 4: Apply equipment stats
        this._applyEquipment(stats, heroData.equipment, calcContext, applyMod);

        // Layer 5: Apply set bonuses
        await this._applySetBonuses(stats, heroData, calcContext, applyMod);

        // Layer 6: Apply elemental modifiers
        ElementalResolver.applyElementalModifiers(stats, heroData, applyMod);

        // Layer 7: Apply skill modifiers
        this._applySkills(stats, heroData.skills, applyMod);

        // Layer 8: Apply active buffs
        this._applyBuffs(stats, heroData.buffs, applyMod);

        // Layer 9: Apply guild facility buffs
        await this._applyGuildFacilities(stats, heroData, calcContext, applyMod);

        // Layer 10: Apply faction perks
        await this._applyFactionPerks(stats, heroData, calcContext, applyMod);

        // Layer 11: Apply world event modifiers
        await this._applyWorldEvents(stats, heroData, calcContext, applyMod);

        // Layer 12: Apply caps first
        this._finalizeStats(stats, primary, heroData, calcContext);
        
        // Layer 13: Apply attribute scaling (AFTER caps to allow proper limiting)
        scalingComponent.applyAttributeScaling(primary, stats, applyMod);

        // Get final values

        // Build result with breakdown
        const result = {
            ...finalStats,
            attributes: {
                str: primary.str.getValue(),
                dex: primary.dex.getValue(),
                int: primary.int.getValue(),
                vit: primary.vit.getValue(),
                luk: primary.luk?.getValue() || 0
            },
            calculationLayers: Object.keys(CalculationLayer),
            calculatedAt: new Date().toISOString(),
            calculationTime: Date.now() - startTime,
            fromCache: false
        };

        // Cache the result
        if (this.cacheEnabled) {
            this._storeInCache(cacheKey, result);
        }

        return result;
    }

    /**
     * Calculate stats with detailed breakdown for UI
     * @param {number} heroId - Hero ID
     * @param {Object} context - Calculation context
     * @returns {Object} Stats with detailed breakdown
     */
    async calculateStatsWithBreakdown(heroId, context = {}) {
        const stats = await this.calculateHeroStats(heroId, context);
        
        // Get detailed breakdowns for each stat
        const breakdowns = {};
        
        // Rebuild stats with EnhancedStat objects for breakdown
        const heroData = await this._fetchHeroData(heroId);
        const statObjects = this._initializeStats(heroData);
        
        // Get breakdown from stat objects
        Object.entries(statObjects).forEach(([key, stat]) => {
            if (stat.getDetailedBreakdown) {
                breakdowns[key] = stat.getDetailedBreakdown(context);
            }
        });

        return {
            ...stats,
            breakdowns: breakdowns
        };
    }

    /**
     * Get stats at a specific level (for prediction)
     * @param {number} heroId - Hero ID
     * @param {number} targetLevel - Target level
     * @param {Object} options - Options for prediction
     * @returns {Object} Predicted stats
     */
    async predictStatsAtLevel(heroId, targetLevel, options = {}) {
        const currentStats = await this.calculateHeroStats(heroId, options);
        const heroData = await this._fetchHeroData(heroId);
        
        const predicted = { ...currentStats };
        predicted.attributes = { ...currentStats.attributes };
        predicted.predictedLevel = targetLevel;
        predicted.isPrediction = true;

        // Calculate growth from current to target level
        const levelDiff = targetLevel - heroData.unitLevel;
        
        if (levelDiff > 0) {
            // Apply growth curve to stats
            const classTemplate = heroData.combatClass;
            
            Object.entries(predicted).forEach(([key, value]) => {
                if (typeof value === 'number' && !['unitLevel', 'classLevel'].includes(key)) {
                    const growthRate = this._getGrowthRate(key, classTemplate);
                    if (growthRate > 0) {
                        const growthBonus = StatCurveCalculator.calculateLinear(
                            0, growthRate * levelDiff, targetLevel
                        );
                        predicted[key] = value + growthBonus;
                    }
                }
            });

            // Apply primary stat growth
            const statAllocation = heroData.heroStatAllocation;
            if (statAllocation) {
                const growthConfig = {
                    type: GrowthCurveType.LINEAR,
                    rate: 1
                };
                
                ['str', 'dex', 'int', 'vit', 'luk'].forEach(attr => {
                    const allocated = statAllocation[`${attr}Allocated`] || 0;
                    const growthBonus = StatCurveCalculator.calculateGrowthToLevel(
                        allocated, 
                        heroData.unitLevel, 
                        targetLevel,
                        growthConfig
                    );
                    predicted.attributes[attr] += growthBonus;
                });
            }
        }

        // Apply caps at target level
        const caps = this.statCapResolver.getCaps({
            ...heroData,
            unitLevel: targetLevel
        });
        
        const capped = this.statCapResolver.applyAllCaps(predicted, caps);
        Object.assign(predicted, capped.stats);

        return predicted;
    }

    /**
     * Invalidate cache for a hero
     * @param {number} heroId - Hero ID to invalidate
     */
    invalidateHeroCache(heroId) {
        const prefix = `hero:${heroId}`;
        this.statCache.forEach((value, key) => {
            if (key.startsWith(prefix)) {
                this.statCache.delete(key);
            }
        });
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.statCache.clear();
        this.setBonusResolver.clearCache();
    }

    /**
     * Fetch hero data with all necessary includes
     * @private
     */
    async _fetchHeroData(heroId) {
        return await this.db.hero.findUnique({
            where: { id: heroId },
            include: {
                user: { 
                    include: { 
                        guild: { 
                            include: { 
                                facilities: { 
                                    include: { template: true } 
                                } 
                            } 
                        } 
                    } 
                },
                combatClass: {
                    include: { statAllocationTemplate: true }
                },
                skills: { 
                    where: { isActive: true }, 
                    include: { skill: true } 
                },
                buffs: { 
                    where: { expiresAt: { gt: new Date() } } 
                },
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
                },
                elementalAffinities: true,
                heroStatAllocation: true
            }
        });
    }

    /**
     * Initialize secondary stats with EnhancedStat objects
     * @private
     */
    _initializeStats(heroData) {
        return {
            health_max: new EnhancedStat(heroData.hp_base || 100, { name: 'health_max', max: 99999 }),
            mana_max: new EnhancedStat(heroData.mana_base || 20, { name: 'mana_max', max: 9999 }),
            attack_damage: new EnhancedStat(heroData.damage_base || 10, { name: 'attack_damage', max: 99999 }),
            defense: new EnhancedStat(heroData.defense_base || 0, { name: 'defense', max: 99999 }),
            speed: new EnhancedStat(heroData.speed_base || 5, { name: 'speed', max: 255 }),
            attack_range: new EnhancedStat(heroData.range_base || 1, { name: 'attack_range', max: 10 }),
            dodge_rate: new EnhancedStat(heroData.dodge_chance || 0, { 
                name: 'dodge_rate', 
                max: 0.95, 
                type: 'percent',
                isExempt: true 
            }),
            crit_chance: new EnhancedStat(heroData.crit_chance || 0.05, { 
                name: 'crit_chance', 
                max: 1.0, 
                type: 'percent' 
            }),
            crit_damage: new EnhancedStat(heroData.crit_damage || 1.5, { 
                name: 'crit_damage', 
                max: 5.0,
                min: 1.0 
            }),
            hp_regen: new EnhancedStat(heroData.hp_regen || 0, { name: 'hp_regen' }),
            mana_regen: new EnhancedStat(heroData.mana_regen || 2, { name: 'mana_regen' }),
            block_chance: new EnhancedStat(heroData.block_chance || 0, { 
                name: 'block_chance', 
                max: 0.75, 
                type: 'percent' 
            }),
            accuracy: new EnhancedStat(heroData.accuracy_base || 100, { 
                name: 'accuracy', 
                max: 100, 
                type: 'percent' 
            }),
            armor_penetration: new EnhancedStat(heroData.ar_pen_base || 0, { name: 'armor_penetration' }),
            skill_power: new EnhancedStat(heroData.skill_power_base || 10, { name: 'skill_power', max: 99999 }),
            tenacity: new EnhancedStat(heroData.tenacity_base || 0, { 
                name: 'tenacity', 
                max: 1.0, 
                type: 'percent' 
            }),
            block_power: new EnhancedStat(heroData.block_power_base || 0.5, { name: 'block_power' }),
            initiative: new EnhancedStat(heroData.initiative_base || 0, { name: 'initiative' }),
            lifesteal_rate: new EnhancedStat(heroData.lifesteal_base || 0, { 
                name: 'lifesteal_rate', 
                max: 1.0, 
                type: 'percent' 
            }),
            // Elemental damage stats
            fire_damage: new EnhancedStat(0, { name: 'fire_damage', isExempt: true }),
            water_damage: new EnhancedStat(0, { name: 'water_damage', isExempt: true }),
            earth_damage: new EnhancedStat(0, { name: 'earth_damage', isExempt: true }),
            wind_damage: new EnhancedStat(0, { name: 'wind_damage', isExempt: true }),
            light_damage: new EnhancedStat(0, { name: 'light_damage', isExempt: true }),
            dark_damage: new EnhancedStat(0, { name: 'dark_damage', isExempt: true }),
            // Elemental resistance stats
            fire_resistance: new EnhancedStat(0, { name: 'fire_resistance', max: 0.9, type: 'percent' }),
            water_resistance: new EnhancedStat(0, { name: 'water_resistance', max: 0.9, type: 'percent' }),
            earth_resistance: new EnhancedStat(0, { name: 'earth_resistance', max: 0.9, type: 'percent' }),
            wind_resistance: new EnhancedStat(0, { name: 'wind_resistance', max: 0.9, type: 'percent' }),
            light_resistance: new EnhancedStat(0, { name: 'light_resistance', max: 0.9, type: 'percent' }),
            dark_resistance: new EnhancedStat(0, { name: 'dark_resistance', max: 0.9, type: 'percent' })
        };
    }

    /**
     * Initialize primary stats
     * @private
     */
    _initializePrimaryStats(heroData) {
        const allocation = heroData.heroStatAllocation;
        const baseStats = {
            str: heroData.str || 10,
            dex: heroData.dex || 10,
            int: heroData.int || 10,
            vit: heroData.vit || 10,
            luk: heroData.luk || 5
        };

        return {
            str: new EnhancedStat(baseStats.str, { name: 'str', max: 255 }),
            dex: new EnhancedStat(baseStats.dex, { name: 'dex', max: 255 }),
            int: new EnhancedStat(baseStats.int, { name: 'int', max: 255 }),
            vit: new EnhancedStat(baseStats.vit, { name: 'vit', max: 255 }),
            luk: new EnhancedStat(baseStats.luk || 5, { name: 'luk', max: 255 })
        };
    }

    /**
     * Apply growth curves to stats
     * @private
     */
    _applyGrowth(stats, primary, heroData, context) {
        statGrowthSystem.applyGrowth(stats, heroData.combatClass, context.level);
        
        // Apply growth curves for primary stats
        const allocation = heroData.heroStatAllocation;
        if (allocation && heroData.combatClass?.statAllocationTemplate) {
            const template = heroData.combatClass.statAllocationTemplate;
            
            ['str', 'dex', 'int', 'vit', 'luk'].forEach(attr => {
                const growthCurve = template[`${attr}GrowthCurve`] || GrowthCurveType.LINEAR;
                const growthFactor = template[`${attr}GrowthFactor`] || 1.0;
                
                // Calculate growth based on allocated points and level
                const allocated = allocation[`${attr}Allocated`] || 0;
                const curveConfig = {
                    type: growthCurve,
                    rate: growthFactor
                };
                
                const growthBonus = StatCurveCalculator.calculate(
                    0, context.level, curveConfig
                ) * allocated;
                
                // Add as a conditional modifier based on allocation
                if (growthBonus > 0 && primary[attr]) {
                    primary[attr].addModifier(new StatModifier({
                        value: growthBonus,
                        type: StatModifierType.FLAT,
                        source: `StatGrowth:${attr}`,
                        priority: ModifierPriority.GROWTH
                    }));
                }
            });
        }
    }

    /**
     * Apply stat allocation
     * @private
     */
    _applyStatAllocation(primary, heroData, context) {
        const allocation = heroData.heroStatAllocation;
        if (!allocation) return;

        ['str', 'dex', 'int', 'vit', 'luk'].forEach(attr => {
            const allocated = allocation[`${attr}Allocated`] || 0;
            if (allocated > 0) {
                primary[attr].addModifier(new StatModifier({
                    value: allocated,
                    type: StatModifierType.FLAT,
                    source: 'StatAllocation',
                    priority: ModifierPriority.ALLOCATION
                }));
            }
        });
    }

    /**
     * Create applyMod function
     * @private
     */
    _createApplyModifier(primary, stats, context) {
        return (statKey, value, type, source, options = {}) => {
            if (value == null) return false;
            
            const target = stats[statKey] || primary[statKey];
            if (!target) {
                console.warn(`[StatService] Stat key not found: ${statKey}`);
                return false;
            }
            
            const mod = new StatModifier({
                value: value,
                type: type,
                source: source,
                priority: options.priority || ModifierPriority.BASE,
                condition: options.condition || null,
                isConditional: !!options.condition
            });
            target.addModifier(mod);
            return true;
        };
    }

    /**
     * Apply trait stat bonuses
     * Traits provide flat bonuses to primary stats (STR, DEX, INT, VIT, LUK)
     * Applied BEFORE equipment to allow equipment to scale with base stats
     * @private
     */
    async _applyTraitStatBonuses(primary, heroData, context, applyMod) {
        // Get hero's traits from equipment
        const equipment = heroData.equipment || [];
        const traitIds = new Set();
        
        // Collect all unique trait IDs from equipment
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            if (!instance) continue;
            
            // Check durability - low durability reduces trait effectiveness
            if (instance.currentDurability <= 0) continue;
            
            // Template traits
            instance.template?.traits?.forEach(it => {
                if (it.traitId) traitIds.add(it.traitId);
            });
            
            // Instance traits (affixes)
            instance.instanceTraits?.forEach(it => {
                if (it.traitId) traitIds.add(it.traitId);
            });
        }
        
        if (traitIds.size === 0) return;
        
        // Fetch trait data
        const traits = await this.db.trait.findMany({
            where: { id: { in: [...traitIds] } },
            include: { stats: true }
        });
        
        // Apply trait stat bonuses
        for (const trait of traits) {
            const traitBonuses = trait.stats || [];
            let traitActive = true;
            
            for (const traitStat of traitBonuses) {
                // Check if this trait stat bonus has conditions
                if (traitStat.conditionType && traitStat.conditionValue) {
                    const conditionMet = this._checkTraitCondition(
                        traitStat.conditionType,
                        traitStat.conditionValue,
                        heroData,
                        context
                    );
                    if (!conditionMet) {
                        traitActive = false;
                        break;
                    }
                }
                
                // Apply the stat bonus
                const primaryKey = traitStat.statKey.toLowerCase();
                if (primary[primaryKey]) {
                    // Apply to primary stat
                    primary[primaryKey].addModifier(new StatModifier({
                        value: traitStat.statValue,
                        type: StatModifierType.FLAT,
                        source: `Trait:${trait.name}`,
                        priority: 8 // After stat allocation, before equipment
                    }));
                } else {
                    // Apply to secondary stat
                    applyMod(traitStat.statKey, traitStat.statValue, 0, `Trait:${trait.name}`, {
                        priority: 8
                    });
                }
            }
        }
    }

    /**
     * Check if trait condition is met
     * @private
     */
    _checkTraitCondition(conditionType, conditionValue, heroData, context) {
        switch (conditionType) {
            case 'CLASS':
                return heroData.combatClassId === conditionValue;
            case 'ELEMENT':
                return heroData.elementalAffinities?.some(e => e.element === conditionValue);
            case 'LEVEL_MIN':
                return heroData.unitLevel >= conditionValue;
            case 'LEVEL_MAX':
                return heroData.unitLevel <= conditionValue;
            case 'BUFF_ACTIVE':
                // Check if hero has active buff
                return context.activeBuffs?.some(b => b.name === conditionValue);
            case 'GUILD_MEMBER':
                return !!heroData.user?.guildId;
            case 'FACTION_MEMBER':
                return !!heroData.user?.factionId;
            default:
                return true;
        }
    }

    /**
     * Apply equipment stats with quality multipliers and durability penalties
     * @private
     */
    _applyEquipment(stats, equipment, context, applyMod) {
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            if (!instance) continue;
            
            // Check durability
            if (instance.currentDurability <= 0) {
                // Apply durability penalty - 50% stat reduction when broken
                this._applyDurabilityPenalty(stats, applyMod, `EquipBroken:${instance.template.name}`);
                continue;
            }
            
            // Calculate durability penalty factor (1.0 = full durability, 0.5 = broken)
            const maxDurability = instance.maxDurability || 100;
            const durabilityFactor = Math.max(0.5, instance.currentDurability / maxDurability);
            
            // Check context validity (tool usage)
            let valid = true;
            if (instance.template.category === "PICKAXE" && context.contextType !== "MINING") valid = false;
            if (instance.template.category === "AXE" && context.contextType !== "LUMBERING") valid = false;
            if (instance.template.category === "FISHING_ROD" && context.contextType !== "FISHING") valid = false;
            if (instance.template.category === "HERBALISM_SICKLE" && context.contextType !== "HERBALISM") valid = false;

            if (!valid) continue;

            // Quality multiplier
            const qualityMultipliers = {
                'COMMON': 1.0,
                'UNCOMMON': 1.1,
                'RARE': 1.15,
                'EPIC': 1.25,
                'MASTERWORK': 1.3,
                'LEGENDARY': 1.5
            };
            const qualityMult = qualityMultipliers[instance.quality] || 1.0;
            
            // Power scale from crafting
            const powerScale = instance.powerScale || 1.0;
            
            // Combined multiplier
            const totalMultiplier = qualityMult * powerScale * durabilityFactor;

            // Apply base template stats
            instance.template.stats?.forEach(s => {
                const finalValue = s.statValue * totalMultiplier;
                applyMod(s.statKey, finalValue, 0, `Equip:${instance.template.name}`, {
                    priority: 20
                });
            });

            // Apply template-based traits
            instance.template.traits?.forEach(it => {
                it.trait.stats?.forEach(ts => {
                    const finalValue = ts.statValue * totalMultiplier;
                    applyMod(ts.statKey, finalValue, 0, `Trait:${it.trait.name}`, {
                        priority: 15
                    });
                });
            });

            // Apply instance-based traits (magical affixes)
            instance.instanceTraits?.forEach(it => {
                it.trait.stats?.forEach(ts => {
                    const finalValue = ts.statValue * totalMultiplier;
                    applyMod(ts.statKey, finalValue, 0, `Affix:${it.trait.name}`, {
                        priority: 18
                    });
                });
            });
        }
    }

    /**
     * Apply durability penalty for broken equipment
     * @private
     */
    _applyDurabilityPenalty(stats, applyMod, source) {
        // Broken equipment provides 50% of its stats
        for (const [key, stat] of Object.entries(stats)) {
            if (stat.getValue) {
                const currentValue = stat.getValue();
                const penalty = currentValue * 0.5;
                applyMod(key, -penalty, 0, source, {
                    priority: 100 // High priority to override other modifiers
                });
            }
        }
    }

    /**
     * Apply set bonuses
     * @private
     */
    async _applySetBonuses(stats, heroData, context, applyMod) {
        // Fetch set templates if not included
        const equipment = heroData.equipment;
        const setIds = [...new Set(equipment
            .map(eq => eq.itemInstance?.template?.setId)
            .filter(Boolean)
        )];

        if (setIds.length === 0) return;

        const setTemplates = await this.db.equipmentSetTemplate.findMany({
            where: { id: { in: setIds } },
            include: { setBonuses: true }
        });

        // Register set bonuses
        const setData = this.setBonusResolver.registerSetBonuses(equipment);
        
        // Get active bonuses
        const activeBonuses = this.setBonusResolver.getActiveBonuses(
            setData, 
            setTemplates, 
            heroData
        );

        // Apply set bonuses
        this.setBonusResolver.applySetBonuses(stats, activeBonuses, applyMod);
    }

    /**
     * Apply skill modifiers
     * @private
     */
    _applySkills(stats, skills, applyMod) {
        skills.forEach(hs => {
            if (hs.skill.category === "PASSIVE" && hs.skill.statKey) {
                applyMod(hs.skill.statKey, hs.skill.statValue, hs.skill.isPercent ? 1 : 0, `Skill:${hs.skill.name}`, {
                    priority: 25
                });
            }
        });
    }

    /**
     * Apply active buffs
     * @private
     */
    _applyBuffs(stats, buffs, applyMod) {
        const now = new Date();
        
        buffs.forEach(b => {
            if (b.expiresAt && new Date(b.expiresAt) <= now) return;
            
            applyMod(b.statKey, b.statValue, b.isPercent ? 1 : 0, `Buff:${b.name}`, {
                priority: 30,
                condition: b.condition ? JSON.parse(b.condition) : null
            });
        });
    }

    /**
     * Apply guild facility buffs
     * @private
     */
    async _applyGuildFacilities(stats, heroData, context, applyMod) {
        if (!heroData.user?.guild?.facilities) return;

        const guildBuffs = facilityResolver.resolveTotalBuffs(heroData.user.guild.facilities);
        for (const [statKey, val] of Object.entries(guildBuffs)) {
            applyMod(statKey, val, 1, 'GuildFacility', {
                priority: 35
            });
        }
    }

    /**
     * Apply faction perks
     * @private
     */
    async _applyFactionPerks(stats, heroData, context, applyMod) {
        if (!heroData.user?.factionId) return;

        const factionPerks = await factionService.getActivePerks(heroData.user.id);
        factionPerks.forEach(p => {
            applyMod(p.key, p.value, 1, 'FactionRank', {
                priority: 40
            });
        });
    }

    /**
     * Apply world event modifiers
     * @private
     */
    async _applyWorldEvents(stats, heroData, context, applyMod) {
        if (!heroData.user) return;

        const now = new Date();
        const activeEvents = await this.db.activeEvent.findMany({
            where: { 
                regionId: heroData.user.currentRegion, 
                expiresAt: { gt: now } 
            },
            include: { template: true }
        });

        for (const ae of activeEvents) {
            const t = ae.template;
            applyMod('int', t.statIntBonus, 0, `Event:${t.name}`, {
                priority: 45
            });
            if (t.combatAtkMult) {
                applyMod('attack_damage', t.combatAtkMult - 1.0, 1, `Event:${t.name}`, {
                    priority: 45
                });
            }
            if (t.combatDefMult) {
                applyMod('defense', t.combatDefMult - 1.0, 1, `Event:${t.name}`, {
                    priority: 45
                });
            }
        }
    }

    /**
     * Finalize stats with caps
     * @private
     */
    _finalizeStats(stats, primary, heroData, context) {
        // Get caps for this hero
        const caps = this.statCapResolver.getCaps(heroData, {
            skipLevelScaling: context.skipCapScaling
        });

        // Apply caps to secondary stats
        const secondaryStats = {};
        Object.entries(stats).forEach(([key, stat]) => {
            if (stat.getValue) {
                const value = stat.getValue(context);
                const capConfig = caps[key];
                
                if (capConfig && !capConfig.exempt) {
                    const result = this.statCapResolver.applyCap(key, value, capConfig);
                    secondaryStats[key] = result.value;
                } else {
                    secondaryStats[key] = value;
                }
            }
        });

        // Apply caps to primary stats
        const finalAttributes = {};
        Object.entries(primary).forEach(([key, stat]) => {
            if (stat.getValue) {
                const value = stat.getValue(context);
                const capConfig = caps[key];
                
                if (capConfig && !capConfig.exempt) {
                    const result = this.statCapResolver.applyCap(key, value, capConfig);
                    finalAttributes[key] = result.value;
                } else {
                    finalAttributes[key] = value;
                }
            }
        });

        return {
            ...secondaryStats,
            attributes: finalAttributes
        };
    }

    /**
     * Get growth rate for a stat
     * @private
     */
    _getGrowthRate(statKey, classTemplate) {
        const growthMap = {
            health_max: classTemplate?.hpGrowth || 0,
            mana_max: classTemplate?.mpGrowth || 0,
            attack_damage: classTemplate?.atkGrowth || 0,
            defense: classTemplate?.defGrowth || 0,
            speed: classTemplate?.spdGrowth || 0
        };
        return growthMap[statKey] || 0;
    }

    /**
     * Get cache key
     * @private
     */
    _getCacheKey(heroId, context) {
        const parts = [`hero:${heroId}`];
        if (context.contextType) parts.push(`ctx:${context.contextType}`);
        if (context.regionId) parts.push(`reg:${context.regionId}`);
        return parts.join(this.cacheKeySeparator);
    }

    /**
     * Get from cache
     * @private
     */
    _getFromCache(key) {
        return this.statCache.get(key);
    }

    /**
     * Check if cache is expired
     * @private
     */
    _isCacheExpired(cached) {
        if (!cached || !cached.calculatedAt) return true;
        const age = Date.now() - new Date(cached.calculatedAt).getTime();
        return age > this.cacheTTL;
    }

    /**
     * Store in cache
     * @private
     */
    _storeInCache(key, value) {
        this.statCache.set(key, value);
    }

    // ============================================================================
    // API SERVICE METHODS - Additional methods for REST/Socket API
    // ============================================================================

    /**
     * Get stat history for a hero
     * @param {number} heroId - Hero ID
     * @param {Object} options - Pagination options
     * @returns {Object} Stat history with pagination
     */
    async getStatHistory(heroId, options = {}) {
        const { limit = 50, offset = 0 } = options;
        
        const history = await this.db.heroStatHistory.findMany({
            where: { heroId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
        
        const total = await this.db.heroStatHistory.count({
            where: { heroId }
        });
        
        return {
            history,
            pagination: { limit, offset, total }
        };
    }

    /**
     * Allocate stat points to a specific stat
     * @param {number} heroId - Hero ID
     * @param {string} statName - Stat name (str, dex, int, vit, luk)
     * @param {number} points - Points to allocate
     * @param {Object} options - Options
     * @returns {Object} Allocation result with updated stats
     */
    async allocateStat(heroId, statName, points, options = {}) {
        const hero = await this._fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const allocation = hero.heroStatAllocation;
        if (!allocation) {
            throw new Error('Stat allocation not initialized');
        }
        
        const availablePoints = allocation.availablePoints || 0;
        const currentAllocated = allocation[`${statName}Allocated`] || 0;
        
        // Check available points
        if (points > availablePoints) {
            throw new Error(`Insufficient points. Available: ${availablePoints}, Requested: ${points}`);
        }
        
        // Get caps
        const caps = this.statCapResolver.getCaps(hero);
        const statCap = caps[statName]?.max || 255;
        
        if (currentAllocated + points > statCap) {
            throw new Error(`Stat cap exceeded. Current: ${currentAllocated}, Cap: ${statCap}`);
        }
        
        // Update allocation
        const updatedAllocation = await this.db.heroStatAllocation.update({
            where: { id: allocation.id },
            data: {
                [`${statName}Allocated`]: currentAllocated + points,
                availablePoints: availablePoints - points
            }
        });
        
        // Record history
        await this.db.heroStatHistory.create({
            data: {
                heroId,
                changeType: 'ALLOCATION',
                statName,
                previousValue: currentAllocated,
                newValue: currentAllocated + points,
                notes: `Allocated ${points} points to ${statName}`
            }
        });
        
        // Invalidate cache
        this.invalidateHeroCache(heroId);
        
        // Return updated stats
        const updatedStats = await this.calculateStatsWithBreakdown(heroId);
        
        return {
            success: true,
            allocation: updatedAllocation,
            stats: updatedStats
        };
    }

    /**
     * Get stat capabilities for a hero
     * @param {number} heroId - Hero ID
     * @returns {Object} Stat caps, available points, growth info
     */
    async getStatCapabilities(heroId) {
        const hero = await this._fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const caps = this.statCapResolver.getCaps(hero);
        const allocation = hero.heroStatAllocation || {};
        
        const primaryStats = ['str', 'dex', 'int', 'vit', 'luk'];
        const statDetails = {};
        
        for (const stat of primaryStats) {
            const current = hero[stat] || 10;
            const allocated = allocation[`${stat}Allocated`] || 0;
            const cap = caps[stat]?.max || 255;
            
            statDetails[stat] = {
                base: current,
                allocated,
                currentTotal: current + allocated,
                cap,
                remaining: cap - (current + allocated),
                growthRate: hero.combatClass?.statAllocationTemplate?.[`${stat}GrowthFactor`] || 1.0,
                growthCurve: hero.combatClass?.statAllocationTemplate?.[`${stat}GrowthCurve`] || 'LINEAR'
            };
        }
        
        return {
            availablePoints: allocation.availablePoints || 0,
            totalSpent: primaryStats.reduce((sum, stat) => 
                sum + (allocation[`${stat}Allocated`] || 0), 0),
            statCaps: caps.primary || {},
            secondaryCaps: caps.secondary || {},
            attributes: statDetails,
            recommendedDistribution: this._getRecommendedDistribution(hero),
            levelScaling: {
                currentLevel: hero.unitLevel,
                pointsPerLevel: hero.combatClass?.statPointsPerLevel || 3,
                totalPointsFromLevels: (hero.unitLevel - 1) * (hero.combatClass?.statPointsPerLevel || 3)
            }
        };
    }

    /**
     * Get recommended stat distribution
     * @private
     */
    _getRecommendedDistribution(hero) {
        const className = hero.combatClass?.name?.toLowerCase() || '';
        
        const recommendations = {
            warrior: { str: 3, vit: 2, dex: 1, int: 0, luk: 1 },
            knight: { str: 2, vit: 3, dex: 1, int: 0, luk: 1 },
            mage: { int: 4, dex: 1, vit: 1, str: 0, luk: 1 },
            archer: { dex: 3, int: 1, vit: 1, str: 1, luk: 1 },
            rogue: { dex: 3, luk: 2, str: 1, vit: 1, int: 0 },
            paladin: { str: 2, vit: 2, int: 1, dex: 1, luk: 1 },
            default: { str: 1, vit: 1, dex: 1, int: 1, luk: 1 }
        };
        
        for (const [key, value] of Object.entries(recommendations)) {
            if (className.includes(key)) {
                return value;
            }
        }
        
        return recommendations.default;
    }

    /**
     * Get elemental stats for a hero
     * @param {number} heroId - Hero ID
     * @returns {Object} Elemental affinities, resistances, bonus damage
     */
    async getElementalStats(heroId) {
        const hero = await this._fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const elementalResolver = new ElementalResolver();
        const affinities = hero.elementalAffinities || [];
        
        // Get base resistances from stats
        const stats = await this.calculateHeroStats(heroId);
        
        const elementalData = {
            affinities: affinities.map(a => ({
                element: a.element,
                affinityLevel: a.affinityLevel,
                bonusDamage: elementalResolver.getAffinityBonus(a.element, a.affinityLevel),
                resistanceBonus: elementalResolver.getResistanceBonus(a.element, a.affinityLevel)
            })),
            resistances: {
                fire: stats.fire_resistance || 0,
                water: stats.water_resistance || 0,
                earth: stats.earth_resistance || 0,
                wind: stats.wind_resistance || 0,
                light: stats.light_resistance || 0,
                dark: stats.dark_resistance || 0
            },
            bonusDamage: {
                fire: stats.fire_damage || 0,
                water: stats.water_damage || 0,
                earth: stats.earth_damage || 0,
                wind: stats.wind_damage || 0,
                light: stats.light_damage || 0,
                dark: stats.dark_damage || 0
            },
            equipmentBonuses: elementalResolver.getEquipmentElementalBonuses(hero.equipment || []),
            setBonuses: elementalResolver.getSetElementalBonuses(hero.equipment || [])
        };
        
        return elementalData;
    }

    /**
     * Get set bonuses for a hero
     * @param {number} heroId - Hero ID
     * @returns {Object} Equipped sets, active bonuses, synergy info
     */
    async getSetBonuses(heroId) {
        const hero = await this._fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const equipment = hero.equipment || [];
        const setData = this.setBonusResolver.registerSetBonuses(equipment);
        
        const setIds = [...new Set(equipment
            .map(eq => eq.itemInstance?.template?.setId)
            .filter(Boolean)
        )];
        
        const setTemplates = await this.db.equipmentSetTemplate.findMany({
            where: { id: { in: setIds } },
            include: { setBonuses: true }
        });
        
        const sets = [];
        for (const template of setTemplates) {
            const equippedPieces = equipment.filter(eq => 
                eq.itemInstance?.template?.setId === template.id
            );
            
            const activeBonuses = this.setBonusResolver.getActiveBonuses(
                setData,
                setTemplates,
                { equipment }
            ).filter(b => b.setId === template.id);
            
            sets.push({
                id: template.id,
                name: template.name,
                totalPieces: equippedPieces.length,
                pieces: equippedPieces.map(eq => ({
                    id: eq.itemInstanceId,
                    name: eq.itemInstance?.template?.name,
                    slot: eq.slot,
                    quality: eq.itemInstance?.quality
                })),
                activeBonuses: activeBonuses.map(b => ({
                    piecesRequired: b.piecesRequired,
                    bonus: b.bonus,
                    isActive: b.isActive
                })),
                synergyBonus: this._calculateSetSynergy(setData, template.id)
            });
        }
        
        return {
            sets,
            totalActiveBonuses: sets.reduce((sum, s) => 
                sum + s.activeBonuses.filter(b => b.isActive).length, 0),
            totalSetCount: setIds.length
        };
    }

    /**
     * Calculate set synergy bonus
     * @private
     */
    _calculateSetSynergy(setData, setId) {
        return { multiplier: 1.0, notes: 'No synergy bonus' };
    }

    /**
     * Get equipment stats for a hero
     * @param {number} heroId - Hero ID
     * @returns {Object} Equipment stat bonuses, quality modifiers, durability impact
     */
    async getEquipmentStats(heroId) {
        const hero = await this._fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const equipment = hero.equipment || [];
        const qualityMultipliers = {
            'COMMON': 1.0,
            'UNCOMMON': 1.1,
            'RARE': 1.15,
            'EPIC': 1.25,
            'MASTERWORK': 1.3,
            'LEGENDARY': 1.5
        };
        
        const equipmentStats = [];
        let totalBonuses = {};
        
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            if (!instance) continue;
            
            const template = instance.template;
            const maxDurability = instance.maxDurability || 100;
            const durabilityFactor = Math.max(0.5, instance.currentDurability / maxDurability);
            const qualityMult = qualityMultipliers[instance.quality] || 1.0;
            const powerScale = instance.powerScale || 1.0;
            const totalMultiplier = qualityMult * powerScale * durabilityFactor;
            
            const bonuses = {};
            
            template.stats?.forEach(s => {
                bonuses[s.statKey] = {
                    base: s.statValue,
                    qualityModifier: qualityMult,
                    durabilityImpact: durabilityFactor,
                    final: s.statValue * totalMultiplier,
                    source: `Equip:${template.name}`
                };
            });
            
            equipmentStats.push({
                slot: eq.slot,
                itemId: instance.id,
                name: template.name,
                quality: instance.quality,
                durability: {
                    current: instance.currentDurability,
                    max: maxDurability,
                    percentage: (instance.currentDurability / maxDurability) * 100,
                    status: instance.currentDurability >= maxDurability * 0.8 ? 'Good' :
                            instance.currentDurability >= maxDurability * 0.5 ? 'Damaged' :
                            instance.currentDurability >= maxDurability * 0.25 ? 'Poor' : 'Broken'
                },
                qualityModifier: qualityMult,
                powerScale: powerScale,
                totalMultiplier: totalMultiplier,
                bonuses,
                isBroken: instance.currentDurability <= 0
            });
            
            Object.entries(bonuses).forEach(([key, value]) => {
                totalBonuses[key] = (totalBonuses[key] || 0) + value.final;
            });
        }
        
        return {
            equipment: equipmentStats,
            totalBonuses,
            summary: {
                totalItems: equipmentStats.length,
                brokenItems: equipmentStats.filter(e => e.isBroken).length,
                averageQuality: equipmentStats.reduce((sum, e) => 
                    sum + e.qualityModifier, 0) / (equipmentStats.length || 1)
            }
        };
    }

    /**
     * Compare stats with equipment preview
     * @param {number} heroId - Hero ID
     * @param {Object} previewEquipment - Preview equipment changes
     * @returns {Object} Current vs preview stats comparison
     */
    async compareStats(heroId, previewEquipment = {}) {
        const currentStats = await this.calculateStatsWithBreakdown(heroId);
        
        // Create mock hero data with preview equipment
        const hero = await this._fetchHeroData(heroId);
        const previewHero = {
            ...hero,
            equipment: previewEquipment
        };
        
        // Temporarily override _fetchHeroData logic
        const originalFetch = this._fetchHeroData.bind(this);
        this._fetchHeroData = () => Promise.resolve(previewHero);
        
        const previewStats = await this.calculateStatsWithBreakdown(heroId, {
            forceRecalculate: true
        });
        
        // Restore original method
        this._fetchHeroData = originalFetch;
        
        // Calculate differences
        const differences = {};
        
        const compareValues = (current, preview, prefix) => {
            Object.entries(current).forEach(([key, value]) => {
                if (typeof value === 'number' && typeof preview[key] === 'number') {
                    differences[`${prefix}${key}`] = {
                        current,
                        preview,
                        difference: preview[key] - current[key]
                    };
                }
            });
        };
        
        compareValues(currentStats, previewStats, '');
        
        if (currentStats.attributes && previewStats.attributes) {
            compareValues(currentStats.attributes, previewStats.attributes, 'attr_');
        }
        
        return {
            current: currentStats,
            preview: previewStats,
            differences,
            isImproved: Object.values(differences).some(d => d.difference > 0)
        };
    }
}

// Export
module.exports = new EnhancedStatService();
