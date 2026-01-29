const traitService = require('../services/traitService');

class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.race = data.race || "human";
        this.behavior = data.activeBehavior || "balanced"; 
        this.instanceId = data.instance_id; 
        this.stats = stats; 
        this.teamId = teamId;
        this.gridPos = pos;
        
        this.currentHealth = stats.health_max;
        this.currentMana = stats.mana_max;
        this._actionPoints = 0.0; // Private backing variable
        this.isDead = false;
        
        this.skillCooldowns = {};
        this.activeEffects = []; 
        this.weaponTraits = [];
        this.traits = data.traits || [];
        this.temporaryStats = {}; 
    }

    // Property Getter/Setter for Action Points to trigger hooks
    get currentActionPoints() { return this._actionPoints; }
    set currentActionPoints(val) {
        const old = this._actionPoints;
        this._actionPoints = val;
        // Trigger hook only for major changes (>= 1.0) to avoid tick noise
        if (Math.abs(val - old) >= 1.0) {
            // Context simulation should be passed here, but BattleUnit doesn't hold it.
            // We use global context or sim reference if available in the call stack.
        }
    }

    // Manual AP update with hook support
    modifyAP(amount, sim) {
        const old = this._actionPoints;
        this._actionPoints += amount;
        traitService.executeHook("onActionPointsChange", this, old, this._actionPoints, sim);
    }

    tick(delta) {
        if (this.isDead) return;
        const effectiveSpeed = this.getStat("speed");
        this._actionPoints += effectiveSpeed * delta;
    }

    getStat(key) {
        const base = this.stats[key] || 0;
        const mod = this.temporaryStats[key] || 0;
        return Math.max(0, base + mod);
    }

    applyEffect(effect, sim) {
        if (traitService.executeHook("onStatusApplied", this, effect, sim) === false) return;

        const existingIdx = this.activeEffects.findIndex(e => e.type === effect.type);
        if (existingIdx !== -1) {
            this.activeEffects[existingIdx] = effect;
            traitService.executeHook("onStatusRefreshed", this, effect, sim); // NEW
        } else {
            this.activeEffects.push(effect);
        }
    }

    removeEffect(type, sim) {
        const effect = this.activeEffects.find(e => e.type === type);
        if (effect) {
            this.activeEffects = this.activeEffects.filter(e => e.type !== type);
            traitService.executeHook("onStatusPurged", this, effect, sim);
        }
    }

    consumeMana(amount, sim) {
        this.currentMana = Math.max(0, this.currentMana - amount);
        traitService.executeHook("onManaSpend", this, amount, sim);
    }

    gainMana(amount, sim) {
        this.currentMana = Math.min(this.stats.mana_max, this.currentMana + amount);
        traitService.executeHook("onManaGain", this, amount, sim);
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
    }

    applyRegen(sim) {
        const regen = Math.floor(this.stats.health_max * 0.02);
        this.currentHealth = Math.min(this.stats.health_max, this.currentHealth + regen);
        if (regen > 0) {
            traitService.executeHook("onHealthRegen", this, regen, sim);
        }
        return regen;
    }

    isReady() { 
        if (this.activeEffects.some(e => e.type === "STUN" || e.type === "CRYSTALLIZED")) return false;
        return this._actionPoints >= 100.0; 
    }

    applyStatusDamage(sim) {
        let totalDot = 0;
        this.temporaryStats = {}; 

        this.activeEffects = this.activeEffects.filter(eff => {
            traitService.executeHook("onStatusTick", this, eff, sim);

            if (eff.type === "BURN" || eff.type === "POISON") {
                const dmg = eff.power || 5;
                this.takeDamage(dmg);
                totalDot += dmg;
            }

            if (eff.stat_mod) {
                for (const [sKey, sVal] of Object.entries(eff.stat_mod)) {
                    this.temporaryStats[sKey] = (this.temporaryStats[sKey] || 0) + sVal;
                }
            }

            if (eff.type === "CRYSTALLIZED") {
                this.temporaryStats.defense = (this.temporaryStats.defense || 0) + (this.stats.defense * 5);
            }

            eff.duration--;

            if (eff.duration <= 0) {
                traitService.executeHook("onStatusExpired", this, eff, sim);
                if (eff.type === "OVERCHARGE") {
                    this.applyEffect({ type: "STUN", duration: 3 }, sim);
                }
                return false;
            }
            return true;
        });
        return totalDot;
    }
}

module.exports = BattleUnit;
