const traitService = require('../services/traitService');
const { EnhancedStat } = require('./statSystem');
const UnitPotionHandler = require('./battle/UnitPotionHandler');

class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.race = data.race || "human";
        this.behavior = data.activeBehavior || "balanced"; 
        this.instanceId = data.instance_id;
        this.heroId = data.heroId || null;  // Link ke hero table
        this.stats = stats; 
        this._enhancedStats = (stats && typeof stats.getValue === 'function') ? stats : null;
        this.teamId = teamId;
        this.gridPos = pos;
        this.facing = "SOUTH";
        
        this.temporaryStats = {}; 
        const maxHp = this.getStat("health_max") || stats.health_max || 100;
        this.currentHealth = maxHp;
        
        const resType = data.resourceType || "MANA";
        const maxMana = this.getStat("mana_max") || stats.mana_max || 100;
        this.currentMana = (resType === "RAGE") ? 0 : maxMana; 
        this.currentRage = 0;
        this.currentEnergy = (resType === "ENERGY") ? 100 : 0;
        
        // AAA: Timeline-Based Action Readiness (Replaced legacy AP)
        this.nextActionTick = 0; 
        this.skillCooldowns = {}; // { skillId: readyAtTick }
        this.stuckTicks = 0;
        this.waitTicks = 0;
        this.moveCooldownTicks = 0;
        this.posHistory = [];

        this.isDead = false;
        this.activeEffects = [];
        
        const allAbilities = data.abilities || [];
        this.activeSkills = allAbilities.filter(a => a.category === "ACTIVE");
        this.passiveSkills = allAbilities.filter(a => a.category === "PASSIVE");

        this.equippedItems = data.equippedItems || [];
        this.durabilityLoss = {};
        this.traits = data.traits || [];
        this.isStealthed = false;
        
        // === AAA: Health Potion System ===
        this.potions = new UnitPotionHandler(this);
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

    setActionDelay(delay, sim) {
        if (!sim) {
            console.error(`[UNIT_ERR] setActionDelay called without sim for ${this.instanceId}`);
            return;
        }
        this.nextActionTick = sim.currentTick + delay;
    }

    setSkillCooldown(skillId, duration, sim) {
        if (!sim) return;
        this.skillCooldowns[skillId] = sim.currentTick + duration;
    }

    isSkillReady(skillId, sim) {
        if (!sim) return true; // Fail-safe
        const readyAt = this.skillCooldowns[skillId] || 0;
        return sim.currentTick >= readyAt;
    }

    tick(delta, sim) {
        if (this.isDead) return;
        this.temporaryStats = {}; 
    }

    isReady(sim) { 
        if (this.activeEffects.some(e => e.type === "STUN" || e.type === "CRYSTALLIZED")) return false;
        if (!sim) return true; // Fail-safe
        return sim.currentTick >= this.nextActionTick; 
    }

    getStat(key) {
        if (this.temporaryStats && this.temporaryStats[key] !== undefined) {
            return Math.max(0, this.temporaryStats[key]);
        }
        if (this._enhancedStats) {
            const stat = this._enhancedStats[key];
            if (stat && typeof stat.getValue === 'function') {
                return Math.max(0, stat.getValue());
            }
        }
        const base = this.stats[key] || 0;
        const mod = this.temporaryStats[key] || 0;
        return Math.max(0, base + mod);
    }

    getHitChanceAgainst(target) {
        let hitChance = 100;
        if (target.isStealthed) {
            const stealthLevel = target.getStat("stealth_level") || 50;
            hitChance -= Math.min(50, stealthLevel / 2);
        }
        if (traitService.executeHook) {
            const mod = traitService.executeHook("onCalculateHitChance", this, target);
            if (mod && mod.hitChance !== undefined) hitChance = mod.hitChance;
        }
        return Math.max(0, Math.min(100, hitChance));
    }

    getRelativePosition(attackerPos, defenderPos) {
        const dx = attackerPos.x - defenderPos.x;
        const dy = attackerPos.y - defenderPos.y;
        const facing = this.facing || "SOUTH";
        const backPositions = {
            "NORTH": [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: -1, y: 1 }],
            "SOUTH": [{ x: 0, y: -1 }, { x: 1, y: -1 }, { x: -1, y: -1 }],
            "EAST": [{ x: -1, y: 0 }, { x: -1, y: 1 }, { x: -1, y: -1 }],
            "WEST": [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: -1 }]
        };
        const backSet = backPositions[facing] || backPositions["SOUTH"];
        if (backSet.some(pos => pos.x === dx && pos.y === dy)) return "BACK";
        const sidePositions = {
            "NORTH": [{ x: -1, y: 0 }, { x: 1, y: 0 }],
            "SOUTH": [{ x: -1, y: 0 }, { x: 1, y: 0 }],
            "EAST": [{ x: 0, y: -1 }, { x: 0, y: 1 }],
            "WEST": [{ x: 0, y: -1 }, { x: 0, y: 1 }]
        };
        const sideSet = sidePositions[facing] || sidePositions["SOUTH"];
        if (sideSet.some(pos => pos.x === dx && pos.y === dy)) return "SIDE";
        return "FRONT";
    }

    getResourceValue(type) {
        switch (type.toUpperCase()) {
            case "MANA": return this.currentMana;
            case "RAGE": return this.currentRage;
            case "ENERGY": return this.currentEnergy;
            default: return this.currentMana;
        }
    }

    getMaxResourceValue(type) {
        switch (type.toUpperCase()) {
            case "MANA": return this.getStat("mana_max");
            case "RAGE": return this.getStat("rage_max") || 100;
            case "ENERGY": return this.getStat("energy_max") || 100;
            default: return this.getStat("mana_max");
        }
    }

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

    takeDamage(amount, sim) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
        if (sim) {
            const resourceResolver = require('./rules/ResourceResolver');
            resourceResolver.handleCombatGain(this, "TAKE_DAMAGE", amount, sim);
        }
    }

    applyRegen(sim) {
        const hpRegen = this.getStat("hp_regen") || this.stats.hp_regen || 0;
        const maxHp = this.getStat("health_max") || this.stats.health_max;
        const regenAmount = hpRegen;
        const oldHp = this.currentHealth;
        
        if (regenAmount > 0) {
            this.currentHealth = Math.min(maxHp, this.currentHealth + regenAmount);
            const actualGain = this.currentHealth - oldHp;
            
            if (actualGain > 0) {
                traitService.executeHook("onHealthRegen", this, actualGain, sim);
                if (sim && sim.logger) {
                    sim.logger.addEvent("HEAL", `${this.data.name} regenerated ${actualGain} HP`, {
                        targetId: this.instanceId,
                        amount: actualGain,
                        isRegen: true
                    });
                }
            }
        }
        
        const resourceResolver = require('./rules/ResourceResolver');
        resourceResolver.applyRegen(this, sim);
        return this.currentHealth - oldHp;
    }

    applyStatusDamage(sim) {
        this.activeEffects = this.activeEffects.filter(eff => {
            traitService.executeHook("onStatusTick", this, eff, sim);
            if (eff.onTick) eff.onTick(this, sim);
            eff.duration--;
            if (eff.duration <= 0) {
                if (eff.onExpire) eff.onExpire(this, sim);
                traitService.executeHook("onStatusExpired", this, eff, sim);
                return false;
            }
            return true;
        });
        return 0;
    }
    
    // === AAA: Health Potion System Proxies ===
    
    get potionUsedInBattle() { return this.potions.potionUsedInBattle; }
    
    isPotionReady(sim) { return this.potions.isReady(sim); }
    getCooldownRemaining(sim) { return this.potions.getCooldownRemaining(sim); }
    usePotion(sim) { return this.potions.usePotion(sim); }
    applyHeal(amount, sim) { return this.potions.applyHealToUnit(amount, sim); }
    calculatePotionHeal(alchemyLabLevel = 0) { return this.potions.calculateHeal(alchemyLabLevel); }
    getPotionsRemaining(inventoryQuantity) { return this.potions.getRemaining(inventoryQuantity); }
}

module.exports = BattleUnit;