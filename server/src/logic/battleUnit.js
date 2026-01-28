class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.race = data.race || "human";
        this.behavior = data.activeBehavior || "balanced"; // NEW: AAA Behavior support
        this.instanceId = data.instance_id; 
        this.stats = stats; 
        this.teamId = teamId;
        this.gridPos = pos;
        
        this.currentHealth = stats.health_max;
        this.currentMana = stats.mana_max;
        this.currentActionPoints = 0.0;
        this.isDead = false;
        
        this.skillCooldowns = {};
        this.activeEffects = []; 
        this.weaponTraits = [];
        this.temporaryStats = {}; // To store aura/buff modifiers
        
        if (data.equipment) {
            Object.values(data.equipment).forEach(item => {
                if (item.data && item.data.traits) {
                    this.weaponTraits = this.weaponTraits.concat(item.data.traits);
                }
            });
        }
    }

    tick(delta) {
        if (this.isDead) return;
        
        // AP calculation modified by speed debuffs/buffs
        const effectiveSpeed = this.getStat("speed");
        this.currentActionPoints += effectiveSpeed * delta;
    }

    getStat(key) {
        const base = this.stats[key] || 0;
        const mod = this.temporaryStats[key] || 0;
        return Math.max(0, base + mod);
    }

    applyEffect(effect) {
        // Simple stacking logic: replace if same type exists
        const existingIdx = this.activeEffects.findIndex(e => e.type === effect.type);
        if (existingIdx !== -1) {
            this.activeEffects[existingIdx] = effect;
        } else {
            this.activeEffects.push(effect);
        }
    }

    isReady() { 
        // Cannot act if STUNNED
        if (this.activeEffects.some(e => e.type === "STUN")) return false;
        return this.currentActionPoints >= 100.0; 
    }

    isSilenced() {
        return this.activeEffects.some(e => e.type === "SILENCE");
    }

    getProvokerId() {
        const provokedEff = this.activeEffects.find(e => e.type === "PROVOKED");
        return provokedEff ? provokedEff.provokerId : null;
    }

    applyStatusDamage() {
        let totalDot = 0;
        this.temporaryStats = {}; // Reset every tick to recalculate auras/buffs

        this.activeEffects = this.activeEffects.filter(eff => {
            // 1. Process DoT (BURN is fast/strong, POISON is slow/weak but lasts)
            if (eff.type === "BURN" || eff.type === "POISON") {
                const dmg = eff.power || 5;
                this.takeDamage(dmg);
                totalDot += dmg;
            }

            // 2. Process Stat Modifiers (Calculated in getStat)
            if (eff.stat_mod) {
                for (const [sKey, sVal] of Object.entries(eff.stat_mod)) {
                    this.temporaryStats[sKey] = (this.temporaryStats[sKey] || 0) + sVal;
                }
            }

            eff.duration--;
            return eff.duration > 0;
        });
        return totalDot;
    }
}

module.exports = BattleUnit;