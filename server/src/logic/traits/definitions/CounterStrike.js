const BaseTrait = require('../BaseTrait');

class CounterStrikeTrait extends BaseTrait {
    constructor() { super('counterstrike'); }

    /**
     * onPostHit: Dipicu tepat setelah unit menerima damage.
     * @param {BattleUnit} defender - Pemilik trait ini
     * @param {BattleUnit} attacker - Unit yang memukul
     */
    onPostHit(defender, attacker, damage, sim) {
        // Jangan counter jika diri sendiri sudah mati atau target sudah mati
        if (defender.currentHealth <= 0 || !attacker || attacker.currentHealth <= 0) return;

        // Cek peluang (misal: 30% chance)
        if (Math.random() < 0.30) {
            const dist = sim.grid.getDistance(defender.gridPos, attacker.gridPos);
            const range = defender.stats.attack_range || 1;

            // Hanya balas jika musuh dalam jangkauan
            if (dist <= range) {
                sim.logger.addEvent("REACTION", `${defender.data.name} membalas serangan ${attacker.data.name}!`, {
                    actor_id: defender.instanceId,
                    vfx: "counter_slash"
                });
                
                // Eksekusi serangan balik menggunakan rules standar
                sim.rules.performAttack(defender, attacker);
            }
        }
    }
}

module.exports = CounterStrikeTrait;
