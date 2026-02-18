/**
 * StatCalculationEngine
 * Core stat calculation pipeline with layered processing.
 * Single Responsibility: calculate hero stats through a multi-layer pipeline.
 */
const BaseService = require('../BaseService');
const { 
    EnhancedStat, 
    StatModifier, 
    StatModifierType,
    GrowthCurveType,
    ConditionType 
} = require('../../logic/stat');
const StatCurveCalculator = require('./StatCurveCalculator');
const ElementalResolver = require('./ElementalResolver');
const SetBonusResolver = require('./SetBonusResolver');
const StatCapResolver = require('./StatCapResolver');
const StatCacheManager = require('./StatCacheManager');
const enhancedStatGrowthSystem = require('./EnhancedStatGrowthSystem');
const enhancedScalingComponent = require('./EnhancedScalingComponent');
const facilityResolver = require('../../logic/guild/FacilityEffectResolver');
const factionService = require('../factionService');
const StatLayerProcessor = require('./StatLayerProcessor');
const StatPredictionService = require('./StatPredictionService');
const HeroBondResolver = require('./HeroBondResolver');

/**
 * Calculation layers in order of application.
 * @enum {number}
 */
const CalculationLayer = {
    BASE: 0,
    GROWTH: 1,
    ALLOCATION: 2,
    TRAITS: 3,
    EQUIPMENT: 4,
    SET_BONUS: 5,
    ELEMENTAL: 6,
    SKILLS: 7,
    BUFFS: 8,
    GUILD: 9,
    BOND: 9.5,  // Hero Bond System - Party Synergy
    FACTION: 10,
    WORLD_EVENTS: 11,
    SCALING: 12,
    FINALIZE: 13
};

/**
 * Modifier priority levels.
 * @enum {number}
 */
const ModifierPriority = {
    BASE: 0,
    GROWTH: 5,
    ALLOCATION: 10,
    EQUIPMENT: 20,
    SET_BONUS: 25,
    SKILL: 25,
    BUFF: 30,
    GUILD: 35,
    BOND: 36,  // Hero Bond - between Guild and Faction
    FACTION: 40,
    EVENT: 45,
    CAP: 100
};

class StatCalculationEngine extends BaseService {
    /**
     * Create the calculation engine.
     * @param {Object} options - Configuration options.
     * @param {Object} [options.setBonus] - Set bonus resolver options.
     * @param {Object} [options.caps] - Stat cap resolver options.
     * @param {boolean} [options.cacheEnabled] - Whether caching is enabled.
     * @param {number} [options.cacheTTL] - Cache TTL in milliseconds.
     */
    constructor(options = {}) {
        super();
        this.elementalResolver = new ElementalResolver();
        this.setBonusResolver = new SetBonusResolver(options.setBonus);
        this.statCapResolver = new StatCapResolver(options.caps);
        this.cacheManager = new StatCacheManager({
            enabled: options.cacheEnabled,
            ttl: options.cacheTTL
        });
        this.cacheEnabled = this.cacheManager.enabled;
        this.predictionService = new StatPredictionService(this);
    }

    /**
     * Calculate complete hero stats with layered processing.
     * @param {number} heroId - Hero ID.
     * @param {Object} context - Calculation context.
     * @returns {Promise<Object>} Calculated stats with breakdown.
     */
    async calculateHeroStats(heroId, context = {}) {
        const startTime = Date.now();
        
        const heroData = context.mockHeroData || await this.fetchHeroData(heroId);
        if (!heroData) {
            throw new Error('Hero not found');
        }

        const cacheKey = this.cacheManager.getCacheKey(heroId, context);
        
        if (this.cacheEnabled && !context.forceRecalculate && !context.mockHeroData) {
            const cached = this.cacheManager.get(cacheKey);
            if (cached && !this.cacheManager.isExpired(cached)) {
                cached.fromCache = true;
                cached.calculationTime = Date.now() - startTime;
                return cached;
            }
        }

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
        StatLayerProcessor.applyGrowth(stats, primary, heroData, calcContext, {
            enhancedStatGrowthSystem,
            ModifierPriority,
            StatCurveCalculator,
            StatModifier,
            StatModifierType,
            GrowthCurveType
        });

        // Layer 3: Apply stat allocation
        this._applyStatAllocation(primary, heroData, calcContext);

        // Create applyMod function for this calculation
        const applyMod = this._createApplyModifier(primary, stats, calcContext);

        // Layer 3.5: Apply trait stat bonuses
        await this._applyTraitStatBonuses(primary, heroData, calcContext, applyMod);

        // Layer 4: Apply equipment stats
        StatLayerProcessor.applyEquipment(stats, heroData.equipment, calcContext, applyMod, {
            applyDurabilityPenalty: this._applyDurabilityPenalty.bind(this)
        });

        // Layer 4.5: Apply gem socket bonuses
        this._applyGemSocketBonuses(stats, heroData, calcContext, applyMod);

        // Layer 5: Apply set bonuses
        await this._applySetBonuses(stats, heroData, calcContext, applyMod);

        // Layer 6: Apply elemental modifiers
        ElementalResolver.applyElementalModifiers(stats, heroData, applyMod);

        // Layer 7: Apply skill modifiers
        StatLayerProcessor.applySkills(stats, heroData.skills, applyMod);

        // Layer 8: Apply active buffs
        StatLayerProcessor.applyBuffs(stats, heroData.buffs, applyMod);

        // Layer 9: Apply guild facility buffs
        await this._applyGuildFacilities(stats, heroData, calcContext, applyMod);

        // Layer 9.5: Apply hero bond bonuses
        await this._applyHeroBonds(stats, heroData, calcContext, applyMod);

        // Layer 10: Apply faction perks
        await this._applyFactionPerks(stats, heroData, calcContext, applyMod);

        // Layer 11: Apply world event modifiers
        await this._applyWorldEvents(stats, heroData, calcContext, applyMod);

        // Layer 12: Apply attribute scaling
        enhancedScalingComponent.applyAttributeScaling(primary, stats, applyMod);
        enhancedScalingComponent.applyComplexScaling(primary, stats, applyMod);
        enhancedScalingComponent.applyJobScaling(heroData, stats, applyMod);

        // Layer 13: Finalize and apply caps (must be after scaling)
        const finalStats = this._finalizeStats(stats, primary, heroData, calcContext);

        const result = {
            ...finalStats,
            calculationLayers: Object.keys(CalculationLayer),
            calculatedAt: new Date().toISOString(),
            calculationTime: Date.now() - startTime,
            fromCache: false
        };

        if (this.cacheEnabled) {
            this.cacheManager.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Calculate stats with detailed breakdown for UI.
     * @param {number} heroId - Hero ID.
     * @param {Object} context - Calculation context.
     * @returns {Promise<Object>} Stats with detailed breakdown.
     */
    async calculateStatsWithBreakdown(heroId, context = {}) {
        const stats = await this.calculateHeroStats(heroId, context);
        
        const breakdowns = {};
        
        const heroData = await this.fetchHeroData(heroId);
        const statObjects = this._initializeStats(heroData);
        
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
     * Predict stats at a specific level.
     * @param {number} heroId - Hero ID.
     * @param {number} targetLevel - Target level.
     * @param {Object} options - Options for prediction.
     * @returns {Promise<Object>} Predicted stats.
     */
    async predictStatsAtLevel(heroId, targetLevel, options = {}) {
        return this.predictionService.predictStatsAtLevel(heroId, targetLevel, options);
    }

    /**
     * Invalidate cache for a hero.
     * @param {number} heroId - Hero ID to invalidate.
     */
    invalidateHeroCache(heroId) {
        this.cacheManager.invalidateHero(heroId);
    }

    /**
     * Clear all caches.
     */
    clearCache() {
        this.cacheManager.clear();
        this.setBonusResolver.clearCache();
    }

    /**
     * Bulk recalculation of all hero stats (Admin Tool).
     * @returns {Promise<Object>} Results with total, success, failed counts.
     */
    async recalculateAllHeroes() {
        const heroes = await this.db.hero.findMany({ select: { id: true } });
        const results = { total: heroes.length, success: 0, failed: 0 };

        for (const hero of heroes) {
            try {
                this.invalidateHeroCache(hero.id);
                await this.calculateHeroStats(hero.id);
                results.success++;
            } catch (err) {
                results.failed++;
            }
        }
        return results;
    }

    /**
     * Get stat formula and cap metadata for UI.
     * @returns {Object} Metadata including primary stats, growth curves, caps, formulas.
     */
    getStatMetadata() {
        return {
            primary: ['str', 'dex', 'int', 'vit', 'luk'],
            growthCurves: Object.keys(GrowthCurveType),
            caps: this.statCapResolver.getGlobalCaps(),
            formulas: enhancedScalingComponent.getFormulaMetadata()
        };
    }

    // =========================================================================
    // PRIVATE: Data Fetching
    // =========================================================================

    /**
     * Fetch hero data with all necessary includes.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object|null>} Hero data or null.
     */
    async fetchHeroData(heroId) {
        return await this.db.hero.findUnique({
            where: { id: heroId },
            include: {
                combatClass: true,
                statAllocation: true,
                skills: { include: { skill: true } },
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
                                instanceTraits: { include: { trait: { include: { stats: true } } } },
                                enchantments: {
                                    include: {
                                        enchantment: true
                                    }
                                },
                                socket: {
                                    include: {
                                        gem: true
                                    }
                                }
                            }
                        }
                    }
                },
                buffs: true,
                user: {
                    include: {
                        guild: { include: { facilities: true } }
                    }
                }
            }
        });
    }

    // =========================================================================
    // PRIVATE: Stat Initialization
    // =========================================================================

    /**
     * Initialize secondary stats with EnhancedStat objects.
     * @param {Object} heroData - Hero data from database.
     * @returns {Object} Map of stat key to EnhancedStat.
     * @private
     */
    _initializeStats(heroData) {
        const stats = {};
        const statKeys = [
            'health_max', 'mana_max', 'attack_damage', 'defense', 
            'speed', 'crit_chance', 'crit_damage', 'dodge_chance',
            'accuracy', 'block_chance', 'parry_chance', 'resistance',
            'hp_regen', 'mana_regen', 'block', 'parry', 'armor_penetration',
            'skill_power', 'tenacity', 'spell_vamp', 'block_power', 'initiative',
            'lifesteal_rate', 'item_find_chance', 'vitality_max', 'move_speed',
            'attack_speed', 'fire_damage', 'water_damage', 'earth_damage',
            'wind_damage', 'light_damage', 'dark_damage', 'fire_resistance',
            'water_resistance', 'earth_resistance', 'wind_resistance',
            'light_resistance', 'dark_resistance'
        ];

        statKeys.forEach(key => {
            // Default values for some stats, otherwise 0
            let baseValue = 0;
            let options = {};
            switch (key) {
                case 'health_max': baseValue = heroData.hp_base || 100; options = { max: 99999 }; break;
                case 'mana_max': baseValue = heroData.mana_base || 20; options = { max: 9999 }; break;
                case 'attack_damage': baseValue = heroData.damage_base || 10; options = { max: 99999 }; break;
                case 'defense': baseValue = heroData.defense_base || 0; options = { max: 99999 }; break;
                case 'speed': baseValue = heroData.speed_base || 5; options = { max: 255 }; break;
                case 'attack_range': baseValue = heroData.range_base || 1; options = { max: 10 }; break;
                case 'dodge_rate': baseValue = heroData.dodge_chance || 0; options = { max: 0.95, type: 'percent', isExempt: true }; break;
                case 'crit_chance': baseValue = heroData.crit_chance || 0.05; options = { max: 1.0, type: 'percent' }; break;
                case 'crit_damage': baseValue = heroData.crit_damage || 1.5; options = { max: 5.0, min: 1.0 }; break;
                case 'hp_regen': baseValue = heroData.hp_regen || 0; break;
                case 'mana_regen': baseValue = heroData.mana_regen || 2; break;
                case 'block_chance': baseValue = heroData.block_chance || 0; options = { max: 0.75, type: 'percent' }; break;
                case 'block': baseValue = heroData.block_base || 0; break;
                case 'parry': baseValue = heroData.parry_base || 0; break;
                case 'parry_chance': baseValue = heroData.parry_chance || 0; options = { max: 0.5, type: 'percent' }; break;
                case 'accuracy': baseValue = heroData.accuracy_base || 100; options = { max: 100, type: 'percent' }; break;
                case 'armor_penetration': baseValue = heroData.armor_penetration || 0; break;
                case 'skill_power': baseValue = heroData.skill_power_base || 10; options = { max: 99999 }; break;
                case 'tenacity': baseValue = heroData.tenacity_base || 0; options = { max: 1.0, type: 'percent' }; break;
                case 'spell_vamp': baseValue = heroData.spell_vamp || 0; options = { max: 1.0, type: 'percent' }; break;
                case 'block_power': baseValue = heroData.block_power_base || 0.5; break;
                case 'initiative': baseValue = heroData.initiative_base || 0; break;
                case 'lifesteal_rate': baseValue = heroData.lifesteal_base || 0; options = { max: 1.0, type: 'percent' }; break;
                case 'item_find_chance': baseValue = 0; options = { max: 5.0, type: 'percent' }; break;
                case 'vitality_max': baseValue = heroData.vitality_base || 100; break;
                case 'move_speed': baseValue = heroData.move_speed || 100; break;
                case 'attack_speed': baseValue = heroData.attack_speed || 1.0; break;
                // Elemental damage stats
                case 'fire_damage': options = { isExempt: true }; break;
                case 'water_damage': options = { isExempt: true }; break;
                case 'earth_damage': options = { isExempt: true }; break;
                case 'wind_damage': options = { isExempt: true }; break;
                case 'light_damage': options = { isExempt: true }; break;
                case 'dark_damage': options = { isExempt: true }; break;
                // Elemental resistance stats
                case 'fire_resistance': options = { max: 0.9, type: 'percent' }; break;
                case 'water_resistance': options = { max: 0.9, type: 'percent' }; break;
                case 'earth_resistance': options = { max: 0.9, type: 'percent' }; break;
                case 'wind_resistance': options = { max: 0.9, type: 'percent' }; break;
                case 'light_resistance': options = { max: 0.9, type: 'percent' }; break;
                case 'dark_resistance': options = { max: 0.9, type: 'percent' }; break;
            }
            stats[key] = new EnhancedStat(baseValue, { name: key, ...options });
        });

        return stats;
    }

    /**
     * Initialize primary stats.
     * @param {Object} heroData - Hero data from database.
     * @returns {Object} Map of primary stat key to EnhancedStat.
     * @private
     */
    _initializePrimaryStats(heroData) {
        const primary = {};
        const primaryKeys = ['str', 'dex', 'int', 'vit', 'luk'];

        primaryKeys.forEach(key => {
            const baseValue = heroData[key] || 10;
            primary[key] = new EnhancedStat(baseValue, { name: key, max: 255 });
        });

        return primary;
    }

    // =========================================================================
    // PRIVATE: Calculation Layers
    // =========================================================================

    /**
     * Apply stat allocation.
     * @param {Object} primary - Primary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @private
     */
    _applyStatAllocation(primary, heroData, context) {
        const allocation = heroData.statAllocation;
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
     * Create applyMod closure function for stat modification.
     * @param {Object} primary - Primary stats map.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} context - Calculation context.
     * @returns {Function} applyMod function.
     * @private
     */
    _createApplyModifier(primary, stats, context) {
        return (statKey, value, type, source, options = {}) => {
            if (value == null) return false;
            
            const target = stats[statKey] || primary[statKey];
            if (!target) {
                console.warn(`[StatCalculationEngine] Stat key not found: ${statKey}`);
                return false;
            }
            
            const mod = new StatModifier({
                value: value,
                type: type,
                source: source,
                priority: options.priority || ModifierPriority.BASE,
                condition: options.condition ? new ConditionType(options.condition) : null,
                isConditional: !!options.condition
            });
            target.addModifier(mod);
            return true;
        };
    }

    /**
     * Apply trait stat bonuses. Traits provide flat bonuses to primary stats.
     * Applied BEFORE equipment to allow equipment to scale with base stats.
     * @param {Object} primary - Primary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
     * @private
     */
    async _applyTraitStatBonuses(primary, heroData, context, applyMod) {
        const equipment = heroData.equipment || [];
        const traitIds = new Set();
        
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            if (!instance) continue;
            
            if (instance.currentDurability <= 0) continue;
            
            instance.template?.traits?.forEach(it => {
                if (it.traitId) traitIds.add(it.traitId);
            });
            
            instance.instanceTraits?.forEach(it => {
                if (it.traitId) traitIds.add(it.traitId);
            });
        }
        
        if (traitIds.size === 0) return;
        
        const traits = await this.db.traitTemplate.findMany({
            where: { id: { in: [...traitIds] } },
            include: { stats: true }
        });
        
        for (const trait of traits) {
            const traitBonuses = trait.stats || [];
            
            for (const traitStat of traitBonuses) {
                if (traitStat.conditionType && traitStat.conditionValue) {
                    const conditionMet = this._checkTraitCondition(
                        traitStat.conditionType,
                        traitStat.conditionValue,
                        heroData,
                        context
                    );
                    if (!conditionMet) break;
                }
                
                const primaryKey = traitStat.statKey.toLowerCase();
                if (primary[primaryKey]) {
                    primary[primaryKey].addModifier(new StatModifier({
                        value: traitStat.statValue,
                        type: StatModifierType.FLAT,
                        source: `Trait:${trait.name}`,
                        priority: 8
                    }));
                } else {
                    applyMod(traitStat.statKey, traitStat.statValue, 0, `Trait:${trait.name}`, {
                        priority: 8
                    });
                }
            }
        }
    }

    /**
     * Check if trait condition is met.
     * @param {string} conditionType - Condition type.
     * @param {string} conditionValue - Condition value.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @returns {boolean} Whether condition is met.
     * @private
     */
    _checkTraitCondition(conditionType, conditionValue, heroData, context) {
        switch (conditionType) {
            case 'CLASS': return heroData.combatClassId === conditionValue;
            case 'ELEMENT': return heroData.elementalAffinities?.some(e => e.element === conditionValue);
            case 'LEVEL_MIN': return heroData.unitLevel >= conditionValue;
            case 'LEVEL_MAX': return heroData.unitLevel <= conditionValue;
            case 'BUFF_ACTIVE': return context.activeBuffs?.some(b => b.name === conditionValue);
            case 'GUILD_MEMBER': return !!heroData.user?.guildId;
            case 'FACTION_MEMBER': return !!heroData.user?.factionId;
            default: return true;
        }
    }

    /**
     * Apply durability penalty for broken equipment.
     * @param {Object} stats - Secondary stats map.
     * @param {Function} applyMod - Modifier applicator.
     * @param {string} source - Penalty source label.
     * @private
     */
    _applyDurabilityPenalty(stats, applyMod, source) {
        for (const [key, stat] of Object.entries(stats)) {
            if (stat.getValue) {
                const currentValue = stat.getValue();
                const penalty = currentValue * 0.5;
                applyMod(key, -penalty, 0, source, {
                    priority: 100
                });
            }
        }
    }

    /**
     * Apply set bonuses.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
     * @private
     */
    async _applySetBonuses(stats, heroData, context, applyMod) {
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

        const setData = this.setBonusResolver.registerSetBonuses(equipment);
        const activeBonuses = this.setBonusResolver.getActiveBonuses(
            setData, setTemplates, heroData
        );

        this.setBonusResolver.applySetBonuses(stats, activeBonuses, applyMod);
    }

    /**
     * Apply gem socket bonuses from equipped items.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
     * @private
     */
    _applyGemSocketBonuses(stats, heroData, context, applyMod) {
        const equipment = heroData.equipment || [];
        
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            if (!instance || !instance.socket || !instance.socket.gem) continue;
            
            // Check if equipment is broken
            if (instance.currentDurability <= 0) continue;
            
            const gem = instance.socket.gem;
            
            // Apply flat bonus
            if (gem.statValue > 0) {
                applyMod(gem.statKey, gem.statValue, StatModifierType.FLAT, `Gem:${gem.name}`, {
                    priority: ModifierPriority.EQUIPMENT
                });
            }
            
            // Apply percentage bonus
            if (gem.percentValue > 0) {
                const percentStatKey = gem.statKey + '_percent';
                applyMod(percentStatKey, gem.percentValue, StatModifierType.PERCENT, `Gem:${gem.name}`, {
                    priority: ModifierPriority.EQUIPMENT
                });
            }
        }
    }

    /**
     * Apply guild facility buffs.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
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
     * Apply hero bond bonuses (party synergy).
     * @param {Object} stats - Secondary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
     * @private
     */
    async _applyHeroBonds(stats, heroData, context, applyMod) {
        if (!heroData.userId) return;

        try {
            // Get active bonds for the user's party
            const activeBonds = await HeroBondResolver.calculateActiveBonds(heroData.userId);
            
            if (activeBonds.length === 0) return;

            // Apply each bond's bonuses
            for (const bond of activeBonds) {
                // Check if this hero is part of this bond
                if (!bond.heroIds.includes(heroData.id)) continue;
                
                const bonuses = bond.bonuses;
                for (const [statKey, value] of Object.entries(bonuses)) {
                    // Apply as percentage modifier
                    applyMod(statKey, value, 1, `Bond:${bond.name}`, {
                        priority: ModifierPriority.BOND
                    });
                }
            }
        } catch (error) {
            console.error('[StatCalculationEngine] Error applying hero bonds:', error.message);
        }
    }

    /**
     * Apply faction perks.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
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
     * Apply world event modifiers.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
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
     * Finalize stats with caps.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} primary - Primary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @returns {Object} Finalized stats with attributes.
     * @private
     */
    _finalizeStats(stats, primary, heroData, context) {
        const caps = this.statCapResolver.getCaps(heroData, {
            skipLevelScaling: context.skipCapScaling
        });

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
}

module.exports = StatCalculationEngine;
module.exports.CalculationLayer = CalculationLayer;
module.exports.ModifierPriority = ModifierPriority;
