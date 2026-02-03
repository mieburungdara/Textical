/**
 * StatCapResolver
 * Handles stat cap application with soft caps (diminishing returns) and hard caps (absolute limits).
 * Supports cap exemptions for certain stats.
 */
class StatCapResolver {
    /**
     * Cap types
     * @enum {string}
     */
    static CapType = {
        HARD: 'hard',     // Absolute limit, cannot exceed
        SOFT: 'soft',     // Diminishing returns, can exceed but with reduced effect
        PERCENT: 'percent' // Percentage-based cap (0-100 for rates)
    };

    /**
     * Create a new StatCapResolver
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.globalCaps = options.globalCaps || this._getDefaultGlobalCaps();
        this.levelScaling = options.levelScaling !== false;
        this.softCapFactor = options.softCapFactor || 0.1; // Diminishing returns factor
    }

    /**
     * Default global caps for common stats
     * @returns {Object} Default caps configuration
     */
    _getDefaultGlobalCaps() {
        return {
            // Primary attributes
            str: { max: 255, type: 'hard' },
            dex: { max: 255, type: 'hard' },
            int: { max: 255, type: 'hard' },
            vit: { max: 255, type: 'hard' },
            luk: { max: 255, type: 'hard' },
            
            // Combat stats
            health_max: { max: 99999, type: 'hard' },
            mana_max: { max: 9999, type: 'hard' },
            attack_damage: { max: 99999, type: 'hard' },
            defense: { max: 99999, type: 'hard' },
            crit_chance: { max: 1.0, type: 'percent' }, // 100% max
            crit_damage: { max: 5.0, type: 'hard' }, // 500% max
            accuracy: { max: 100, type: 'percent' },
            dodge_rate: { max: 0.95, type: 'percent' }, // 95% max
            block_chance: { max: 0.75, type: 'percent' },
            parry_chance: { max: 0.5, type: 'percent' },
            
            // Speed stats
            speed: { max: 255, type: 'hard' },
            attack_speed: { max: 5.0, type: 'hard' }, // Attacks per second
            
            // Resistance caps (90% max for resistances)
            fire_resistance: { max: 0.9, type: 'percent' },
            water_resistance: { max: 0.9, type: 'percent' },
            earth_resistance: { max: 0.9, type: 'percent' },
            wind_resistance: { max: 0.9, type: 'percent' },
            light_resistance: { max: 0.9, type: 'percent' },
            dark_resistance: { max: 0.9, type: 'percent' },
            
            // Utility stats
            lifesteal_rate: { max: 1.0, type: 'percent' },
            spell_vamp: { max: 1.0, type: 'percent' },
            tenacity: { max: 1.0, type: 'percent' },
            
            // Elemental damage (no cap)
            fire_damage: { max: Infinity, type: 'hard', exempt: true },
            water_damage: { max: Infinity, type: 'hard', exempt: true },
            earth_damage: { max: Infinity, type: 'hard', exempt: true },
            wind_damage: { max: Infinity, type: 'hard', exempt: true },
            light_damage: { max: Infinity, type: 'hard', exempt: true },
            dark_damage: { max: Infinity, type: 'hard', exempt: true }
        };
    }

    /**
     * Get caps for a specific hero with level scaling
     * @param {Object} heroData - Hero data with level info
     * @param {Object} options - Additional options
     * @returns {Object} Caps configuration for this hero
     */
    getCaps(heroData, options = {}) {
        const caps = { ...this.globalCaps };
        const level = heroData.unitLevel || 1;
        const classTemplate = heroData.combatClass;

        // Apply level-based scaling for certain caps
        if (this.levelScaling && !options.skipLevelScaling) {
            const levelMultiplier = 1 + (level - 1) * 0.1;
            
            // Scale health and mana caps with level
            if (caps.health_max) {
                caps.health_max.max = Math.floor(caps.health_max.max * levelMultiplier);
            }
            if (caps.mana_max) {
                caps.mana_max.max = Math.floor(caps.mana_max.max * levelMultiplier);
            }
            if (caps.attack_damage) {
                caps.attack_damage.max = Math.floor(caps.attack_damage.max * levelMultiplier);
            }
            if (caps.defense) {
                caps.defense.max = Math.floor(caps.defense.max * levelMultiplier);
            }
        }

        // Apply class modifiers
        if (classTemplate?.statAllocationTemplate) {
            const statCaps = JSON.parse(classTemplate.statAllocationTemplate.statCaps || '{}');
            Object.entries(statCaps).forEach(([statKey, cap]) => {
                if (caps[statKey]) {
                    caps[statKey].max = cap;
                }
            });
        }

        // Override with options
        if (options.overrideCaps) {
            Object.assign(caps, options.overrideCaps);
        }

        // Apply exemptions from options
        if (options.exemptStats) {
            options.exemptStats.forEach(statKey => {
                if (caps[statKey]) {
                    caps[statKey].exempt = true;
                }
            });
        }

        return caps;
    }

    /**
     * Apply soft cap with diminishing returns
     * @param {number} value - Raw stat value
     * @param {Object} capConfig - Cap configuration
     * @returns {number} Capped value with diminishing returns applied
     */
    _applySoftCap(value, capConfig) {
        const threshold = capConfig.softThreshold || capConfig.max * 0.5;
        const factor = capConfig.softFactor || this.softCapFactor;

        if (value <= threshold) {
            return value;
        }

        // Diminishing returns formula
        const overThreshold = value - threshold;
        const reducedValue = overThreshold * (1 - factor);
        
        return threshold + reducedValue;
    }

    /**
     * Apply hard cap
     * @param {number} value - Stat value
     * @param {number} max - Maximum allowed value
     * @returns {number} Capped value
     */
    _applyHardCap(value, max) {
        return Math.min(value, max);
    }

    /**
     * Apply percentage cap (0-100 or 0-1 range)
     * @param {number} value - Percentage value
     * @param {number} max - Maximum percentage (1.0 = 100%)
     * @returns {number} Capped percentage
     */
    _applyPercentCap(value, max) {
        return Math.max(0, Math.min(value, max));
    }

    /**
     * Apply caps to a single stat value
     * @param {string} statKey - Stat key name
     * @param {number} value - Raw stat value
     * @param {Object} capConfig - Cap configuration for this stat
     * @returns {Object} Result with capped value and metadata
     */
    applyCap(statKey, value, capConfig) {
        // Check exemption
        if (capConfig.exempt) {
            return {
                value: value,
                capped: false,
                reason: 'exempt',
                originalValue: value
            };
        }

        const capType = capConfig.type || 'hard';
        let cappedValue = value;
        let applied = false;

        switch (capType) {
            case StatCapResolver.CapType.SOFT:
                cappedValue = this._applySoftCap(value, capConfig);
                if (cappedValue !== value) {
                    applied = true;
                }
                break;
            
            case StatCapResolver.CapType.PERCENT:
                cappedValue = this._applyPercentCap(value, capConfig.max);
                if (cappedValue !== value) {
                    applied = true;
                }
                break;
            
            case StatCapResolver.CapType.HARD:
            default:
                cappedValue = this._applyHardCap(value, capConfig.max);
                if (cappedValue !== value) {
                    applied = true;
                }
                break;
        }

        return {
            value: cappedValue,
            capped: applied,
            reason: applied ? capType : null,
            originalValue: value,
            capValue: capConfig.max,
            capType: capType
        };
    }

    /**
     * Apply caps to all stats
     * @param {Object} stats - Stats object with raw values
     * @param {Object} caps - Caps configuration
     * @param {Object} options - Options for cap application
     * @returns {Object} Capped stats with breakdown
     */
    applyAllCaps(stats, caps, options = {}) {
        const cappedStats = {};
        const breakdown = {};

        Object.entries(stats).forEach(([statKey, value]) => {
            const capConfig = caps[statKey];
            
            if (capConfig) {
                const result = this.applyCap(statKey, value, capConfig);
                cappedStats[statKey] = result.value;
                
                if (result.capped || options.includeAll) {
                    breakdown[statKey] = result;
                }
            } else {
                // No cap defined, use value as-is
                cappedStats[statKey] = value;
            }
        });

        return {
            stats: cappedStats,
            breakdown: breakdown
        };
    }

    /**
     * Get cap info for a stat without applying
     * @param {string} statKey - Stat key name
     * @param {Object} caps - Caps configuration
     * @returns {Object} Cap information
     */
    getCapInfo(statKey, caps) {
        const capConfig = caps[statKey];
        
        if (!capConfig) {
            return {
                hasCap: false,
                statKey: statKey
            };
        }

        return {
            hasCap: true,
            statKey: statKey,
            maxValue: capConfig.max,
            capType: capConfig.type,
            isExempt: capConfig.exempt || false,
            softThreshold: capConfig.softThreshold || capConfig.max * 0.5,
            softFactor: capConfig.softFactor || this.softCapFactor
        };
    }

    /**
     * Calculate effective value with caps (for display purposes)
     * @param {number} rawValue - Raw stat value
     * @param {string} statKey - Stat key name
     * @param {Object} caps - Caps configuration
     * @returns {Object} Effective value info
     */
    getEffectiveValue(rawValue, statKey, caps) {
        const capConfig = caps[statKey];
        
        if (!capConfig || capConfig.exempt) {
            return {
                raw: rawValue,
                effective: rawValue,
                percentOfCap: rawValue / capConfig.max,
                isCapped: false
            };
        }

        const capped = this.applyCap(statKey, rawValue, capConfig);
        
        return {
            raw: rawValue,
            effective: capped.value,
            percentOfCap: rawValue / capConfig.max,
            isCapped: capped.capped,
            cappedAt: capped.reason === 'soft' 
                ? capConfig.softThreshold + (rawValue - capConfig.softThreshold) * (1 - this.softCapFactor)
                : capConfig.max
        };
    }
}

module.exports = StatCapResolver;
