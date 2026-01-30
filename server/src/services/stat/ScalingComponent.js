/**
 * AAA ScalingComponent
 * Handles primary to secondary attribute mapping.
 */
class ScalingComponent {
    applyAttributeScaling(primary, stats, applyMod) {
        const s = primary.str.getValue();
        const d = primary.dex.getValue();
        const i = primary.int.getValue();
        const v = primary.vit.getValue();

        applyMod('attack_damage', s * 0.5, 0, "Attribute:STR");
        applyMod('block_power', s * 0.01, 0, "Attribute:STR");
        applyMod('accuracy', d * 2, 0, "Attribute:DEX");
        applyMod('dodge_rate', d * 0.5, 0, "Attribute:DEX");
        applyMod('speed', d * 0.1, 0, "Attribute:DEX");
        applyMod('skill_power', i * 1.5, 0, "Attribute:INT");
        applyMod('mana_max', i * 5, 0, "Attribute:INT");
        applyMod('health_max', v * 10, 0, "Attribute:VIT");
        applyMod('tenacity', v * 0.5, 0, "Attribute:VIT");
    }
}

module.exports = new ScalingComponent();
