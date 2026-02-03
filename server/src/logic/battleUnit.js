const traitService = require('../services/traitService');
const { EnhancedStat } = require('./statSystem');

class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.race = data.race || "human";
        this.behavior = data.activeBehavior || "balanced"; 
        this.instanceId = data.instance_id; 
        this.stats = stats; 
        // Support both EnhancedStat objects and plain objects for backward compatibility
        this._enhancedStats = null;
        if (stats && typeof stats.getValue === 'function') {
            this._enhancedStats = stats;
        }
        this.teamId = teamId;
        this.gridPos = pos;
        this.facing = "SOUTH"; // Directional combat support
        
        // Initialize temporary stats before calling getStat
        this.temporaryStats = {}; 
        
        this.currentHealth = this.getStat("health_max") || stats.health_max;
        
        // Dynamic Resource Initialization
        const resType = data.resourceType || "MANA";
        const maxMana = this.getStat("mana_max") || stats.mana_max || 100;
        this.currentMana = (resType === "RAGE") ? 0 : maxMana; 
        this.currentRage = (resType === "RAGE") ? 0 : 0;
        this.currentEnergy = (resType === "ENERGY") ? 100 : 0;
        
        this._actionPoints = this.getStat("initiative") || stats.initiative || 0.0;
        this.isDead = false;
        
        this.skillCooldowns = {};
        this.activeEffects = [];
        
        // Skill Integration
        const allAbilities = data.abilities || [];
        this.activeSkills = allAbilities.filter(a => a.category === "ACTIVE");
        this.passiveSkills = allAbilities.filter(a => a.category === "PASSIVE");

        this.equippedItems = data.equippedItems || [];
        this.durabilityLoss = {};

        this.weaponTraits = [];
        this.traits = data.traits || [];
        this.temporaryStats = {}; 
        this.isStealthed = false;
        
        // Directional combat tracking
        this.lastAttackDirection = null;
        this.receivedAttackFrom = null;
    }

    recordDurabilityLoss(slotKey, amount = 1) {
        const item = this.equippedItems.find(i => i.slot === slotKey);
        if (item) {
            this.durabilityLoss[item.instanceId] = (this.durabilityLoss[item.instanceId] || 0) + amount;
        }
    }

    reveal(sim) {
        if (this.isStealthed) {
            this.removeEffect("STEALTH", sim);
        }
    }

    get currentActionPoints() { return this._actionPoints; }
    set currentActionPoints(val) { this._actionPoints = val; }

    modifyAP(amount, sim) {
        const old = this._actionPoints;
        this._actionPoints += amount;
        traitService.executeHook("onActionPointsChange", this, old, this._actionPoints, sim);
    }

    tick(delta, sim) {
        if (this.isDead) return;
        this.temporaryStats = {}; // Clear transient stats
        const old = this._actionPoints;
        const effectiveSpeed = this.getStat("speed");
        this._actionPoints += effectiveSpeed * delta;
        if (Math.floor(this._actionPoints) !== Math.floor(old)) {
            traitService.executeHook("onActionPointsChange", this, old, this._actionPoints, sim);
        }
    }

    /**
     * Get stat value with EnhancedStat support
     * Supports both EnhancedStat objects and plain stat objects
     */
    getStat(key) {
        // Check temporary stats first (overrides)
        if (this.temporaryStats && this.temporaryStats[key] !== undefined) {
            return Math.max(0, this.temporaryStats[key]);
        }
        
        // Check EnhancedStat object
        if (this._enhancedStats && typeof this._enhancedStats.getValue === 'function') {
            const stat = this._enhancedStats[key];
            if (stat && typeof stat.getValue === 'function') {
                return Math.max(0, stat.getValue());
            }
        }
        
        // Fallback to plain stats object
        const base = this.stats[key] || 0;
        const mod = this.temporaryStats[key] || 0;
        return Math.max(0, base + mod);
    }

    /**
     * Get action point cost for an action based on speed and action_speed
     */
    getActionPointCost(baseCost) {
        const actionSpeed = this.getStat("action_speed") || 1.0;
        return Math.max(1, Math.floor(baseCost / actionSpeed));
    }

    /**
     * Calculate hit chance against a target (stealth affects this)
     */
    getHitChanceAgainst(target) {
        let hitChance = 100;
        
        // Stealth penalty - attacker has reduced accuracy against stealthed target
        if (target.isStealthed) {
            const stealthLevel = target.getStat("stealth_level") || 50;
            hitChance -= Math.min(50, stealthLevel / 2);
        }
        
        // Apply trait hooks
        if (traitService.executeHook) {
            const mod = traitService.executeHook("onCalculateHitChance", this, target);
            if (mod && mod.hitChance !== undefined) {
                hitChance = mod.hitChance;
            }
        }
        
        return Math.max(0, Math.min(100, hitChance));
    }

    /**
     * Get directional combat bonus (back attack = crit, etc.)
     */
    getDirectionalBonus(attackerPos, defenderPos) {
        const dx = defenderPos.x - attackerPos.x;
        const dy = defenderPos.y - attackerPos.y;
        
        // Determine attack direction relative to defender's facing
        const relativePos = this.getRelativePosition(attackerPos, defenderPos);
        
        let bonuses = {
            damageMult: 1.0,
            critChanceBonus: 0,
            accuracyBonus: 0,
            bypassBlock: false
        };
        
        switch (relativePos) {
            case "BACK":
                bonuses.damageMult = 1.5; // Backstab bonus
                bonuses.critChanceBonus = 25; // Back attack crit bonus
                bonuses.accuracyBonus = 20;
                bonuses.bypassBlock = true;
                break;
            case "SIDE":
                bonuses.damageMult = 1.1;
                bonuses.critChanceBonus = 10;
                bonuses.accuracyBonus = 5;
                break;
            case "FRONT":
            default:
                bonuses.damageMult = 1.0;
                bonuses.critChanceBonus = 0;
                bonuses.accuracyBonus = 0;
                bonuses.bypassBlock = false;
        }
        
        // Apply trait hooks
        if (traitService.executeHook) {
            const mod = traitService.executeHook("onDirectionalBonus", this, bonuses, relativePos);
            if (mod) {
                bonuses = { ...bonuses, ...mod };
            }
        }
        
        return bonuses;
    }

    /**
     * Get relative position of attacker from defender's perspective
     */
    getRelativePosition(attackerPos, defenderPos) {
        const dx = attackerPos.x - defenderPos.x;
        const dy = attackerPos.y - defenderPos.y;
        
        // Check if attacker is behind (opposite of facing direction)
        const facing = this.facing || "SOUTH";
        
        const backPositions = {
            "NORTH": [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: -1, y: 1 }],
            "SOUTH": [{ x: 0, y: -1 }, { x: 1, y: -1 }, { x: -1, y: -1 }],
            "EAST": [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: -1, y: -1 }],
            "WEST": [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: -1 }]
        };
        
        const backSet = backPositions[facing] || backPositions["SOUTH"];
        
        if (backSet.some(pos => pos.x === dx && pos.y === dy)) {
            return "BACK";
        }
        
        // Check for side positions
        const sidePositions = {
            "NORTH": [{ x: -1, y: 0 }, { x: 1, y: 0 }],
            "SOUTH": [{ x: -1, y: 0 }, { x: 1, y: 0 }],
            "EAST": [{ x: 0, y: -1 }, { x: 0, y: 1 }],
            "WEST": [{ x: 0, y: -1 }, { x: 0, y: 1 }]
        };
        
        const sideSet = sidePositions[facing] || sidePositions["SOUTH"];
        if (sideSet.some(pos => pos.x === dx && pos.y === dy)) {
            return "SIDE";
        }
        
        return "FRONT";
    }

    /**
     * Get resource value based on type
     */
    getResourceValue(type) {
        switch (type.toUpperCase()) {
            case "MANA":
                return this.currentMana;
            case "RAGE":
                return this.currentRage;
            case "ENERGY":
                return this.currentEnergy;
            default:
                return this.currentMana;
        }
    }

    /**
     * Get max resource value based on type
     */
    getMaxResourceValue(type) {
        switch (type.toUpperCase()) {
            case "MANA":
                return this.getStat("mana_max");
            case "RAGE":
                return this.getStat("rage_max") || 100;
            case "ENERGY":
                return this.getStat("energy_max") || 100;
            default:
                return this.getStat("mana_max");
        }
    }

    /**
     * Consume resource
     */
    consumeResource(amount, type = "MANA", sim) {
        const resourceType = (type || "MANA").toUpperCase();
        
        switch (resourceType) {
            case "MANA":
                this.currentMana = Math.max(0, this.currentMana - amount);
                traitService.executeHook("onManaSpend", this, amount, sim);
                break;
            case "RAGE":
                this.currentRage = Math.max(0, this.currentRage - amount);
                traitService.executeHook("onRageSpend", this, amount, sim);
                break;
            case "ENERGY":
                this.currentEnergy = Math.max(0, this.currentEnergy - amount);
                traitService.executeHook("onEnergySpend", this, amount, sim);
                break;
        }
    }

    /**
     * Gain resource
     */
    gainResource(amount, type = "MANA", sim) {
        const resourceType = (type || "MANA").toUpperCase();
        const maxVal = this.getMaxResourceValue(resourceType);
        
        switch (resourceType) {
            case "MANA":
                this.currentMana = Math.min(maxVal, this.currentMana + amount);
                traitService.executeHook("onManaGain", this, amount, sim);
                break;
            case "RAGE":
                this.currentRage = Math.min(maxVal, this.currentRage + amount);
                traitService.executeHook("onRageGain", this, amount, sim);
                break;
            case "ENERGY":
                this.currentEnergy = Math.min(maxVal, this.currentEnergy + amount);
                traitService.executeHook("onEnergyGain", this, amount, sim);
                break;
        }
    }

    applyEffect(statusInstance, sim) {
        if (traitService.executeHook("onStatusApplied", this, statusInstance, sim) === false) return;

        const existingIdx = this.activeEffects.findIndex(e => e.type === statusInstance.type);
        if (existingIdx !== -1) {
            this.activeEffects[existingIdx] = statusInstance;
            traitService.executeHook("onStatusRefreshed", this, statusInstance, sim);
        } else {
            this.activeEffects.push(statusInstance);
            if (statusInstance.onApply) statusInstance.onApply(this, sim);
        }
    }

    removeEffect(type, sim) {
        const effect = this.activeEffects.find(e => e.type === type);
        if (effect) {
            this.activeEffects = this.activeEffects.filter(e => e.type !== type);
            if (effect.onExpire) effect.onExpire(this, sim);
            traitService.executeHook("onStatusPurged", this, effect, sim);
        }
    }

    consumeMana(amount, sim) {
        this.currentMana = Math.max(0, this.currentMana - amount);
        traitService.executeHook("onManaSpend", this, amount, sim);
    }

    consumeRage(amount, sim) {
        this.currentRage = Math.max(0, this.currentRage - amount);
        traitService.executeHook("onRageSpend", this, amount, sim);
    }

    consumeEnergy(amount, sim) {
        this.currentEnergy = Math.max(0, this.currentEnergy - amount);
        traitService.executeHook("onEnergySpend", this, amount, sim);
    }

    gainMana(amount, sim) {
        const maxMana = this.getStat("mana_max") || this.stats.mana_max || 100;
        this.currentMana = Math.min(maxMana, this.currentMana + amount);
        traitService.executeHook("onManaGain", this, amount, sim);
    }

    takeDamage(amount, sim) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;

        if (sim) {
            const resourceResolver = require('./rules/ResourceResolver');
            resourceResolver.handleCombatGain(this, "TAKE_DAMAGE", amount, sim);
        }
    }

    applyRegen(sim) {
        // HP Regen
        const hpRegen = this.getStat("hp_regen") || this.stats.hp_regen || 0;
        const maxHp = this.getStat("health_max") || this.stats.health_max;
        const regenAmount = hpRegen > 0 ? hpRegen : Math.floor(maxHp * 0.02);
        this.currentHealth = Math.min(maxHp, this.currentHealth + regenAmount);
        if (regenAmount > 0) traitService.executeHook("onHealthRegen", this, regenAmount, sim);

        // Dynamic Resource Regen
        const resourceResolver = require('./rules/ResourceResolver');
        resourceResolver.applyRegen(this, sim);
        
        return regenAmount;
    }

    isReady() { 
        if (this.activeEffects.some(e => e.type === "STUN" || e.type === "CRYSTALLIZED")) return false;
        return this._actionPoints >= 100.0; 
    }

    applyStatusDamage(sim) {
        let totalImpactCount = 0;

        this.activeEffects = this.activeEffects.filter(eff => {
            traitService.executeHook("onStatusTick", this, eff, sim);
            
            // AAA: Execute modular onTick logic
            if (eff.onTick) eff.onTick(this, sim);

            eff.duration--;

            if (eff.duration <= 0) {
                if (eff.onExpire) eff.onExpire(this, sim);
                traitService.executeHook("onStatusExpired", this, eff, sim);
                return false;
            }
            return true;
        });
        return totalImpactCount;
    }
}

module.exports = BattleUnit;