const BaseTrait = require('../BaseTrait');

class ArcaneMasterTrait extends BaseTrait {
    constructor() { super('arcanemaster'); }

    /**
     * Integrasi 1: Penambah Damage Skill
     */
    onPreAttack(attacker, target, sim, skill) {
        // Jika sedang menggunakan skill (bukan serangan biasa)
        if (skill) {
            return { dmgMult: 1.5 }; // Damage skill naik 50%
        }
        return {};
    }

    /**
     * Integrasi 2: Peluang Reset Cooldown
     */
    onPostAction(unit, sim, skill) {
        if (skill && Math.random() < 0.20) {
            // Reset masa tunggu skill yang baru saja dipakai
            unit.skillCooldowns[skill.id] = 0;
            
            sim.logger.addEvent("VFX", `${unit.data.name} memanipulasi waktu untuk mereset ${skill.name}!`, { 
                actor_id: unit.instanceId,
                vfx: "arcane_reset" 
            });
        }
    }
}

module.exports = ArcaneMasterTrait;
