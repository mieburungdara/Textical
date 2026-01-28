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
        this.traits = data.traits || []; // NEW: Store general traits (Hero/Monster)
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
        // Cannot act if STUNNED or CRYSTALLIZED
        if (this.activeEffects.some(e => e.type === "STUN" || e.type === "CRYSTALLIZED")) return false;
        return this.currentActionPoints >= 100.0; 
    }

    isSilenced() {
        return this.activeEffects.some(e => e.type === "SILENCE");
    }

    isStealth() {
        return this.activeEffects.some(e => e.type === "STEALTH");
    }

    removeEffect(type) {
        this.activeEffects = this.activeEffects.filter(e => e.type !== type);
    }

    applyStatusDamage() {
        let totalDot = 0;
        this.temporaryStats = {}; // Reset every tick to recalculate auras/buffs

        this.activeEffects = this.activeEffects.filter(eff => {
            // 1. Process DoT
            if (eff.type === "BURN" || eff.type === "POISON") {
                const dmg = eff.power || 5;
                this.takeDamage(dmg);
                totalDot += dmg;
            }

            // 2. Process Stat Modifiers
            if (eff.stat_mod) {
                for (const [sKey, sVal] of Object.entries(eff.stat_mod)) {
                    this.temporaryStats[sKey] = (this.temporaryStats[sKey] || 0) + sVal;
                }
            }

            // 3. Specialized Logic: CRYSTALLIZED (DEF +500%)
            if (eff.type === "CRYSTALLIZED") {
                this.temporaryStats.defense = (this.temporaryStats.defense || 0) + (this.stats.defense * 5);
            }

            // 4. Specialized Logic: OVERCHARGE (SPD +200%)
            if (eff.type === "OVERCHARGE") {
                this.temporaryStats.speed = (this.temporaryStats.speed || 0) + (this.stats.speed * 2);
            }

            eff.duration--;

            // Handle Expiration Logic
            if (eff.duration <= 0) {
                // OVERCHARGE Penalty: STUN after finish
                if (eff.type === "OVERCHARGE") {
                    this.applyEffect({ type: "STUN", duration: 3 });
                }
                return false;
            }
            return true;
        });
        return totalDot;
    }
}

module.exports = BattleUnit;