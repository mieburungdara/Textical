const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING NORMALIZED SKILL CODEX ---");

  const skills = [
    // Basic Skills
    { id: 9001, name: "First Aid", category: "ACTIVE", type: "HEAL", description: "Bandage.", power: 20 },
    { id: 9002, name: "Hardy", category: "PASSIVE", type: "BUFF", description: "Increases HP.", statKey: "health_max", statValue: 50 },
    { id: 9101, name: "Power Strike", category: "ACTIVE", type: "DAMAGE", description: "Heavy blow.", multiplier: 1.5 },
    { id: 9102, name: "Iron Skin", category: "PASSIVE", type: "BUFF", description: "+10 Def.", statKey: "defense", statValue: 10 },
    // Basic AoE Skills
    { id: 9201, name: "Line Storm", category: "ACTIVE", type: "DAMAGE", description: "Lightning strikes in a line pattern.", multiplier: 1.5, aoe_pattern: "LINE", aoe_size: 3, element: 2 },
    { id: 9202, name: "Divine Circle", category: "ACTIVE", type: "HEAL", description: "Holy light heals all allies in a ring.", power: 40, aoe_pattern: "RING", aoe_size: 2 },
    { id: 9203, name: "Earthquake", category: "ACTIVE", type: "DAMAGE", description: "Shakes the ground in a diamond pattern.", multiplier: 1.8, aoe_pattern: "DIAMOND", aoe_size: 2 },
    { id: 9204, name: "Whirlwind", category: "ACTIVE", type: "DAMAGE", description: "A spiraling tornado damages all in path.", multiplier: 1.2, aoe_pattern: "SPIRAL", aoe_size: 2 },
    { id: 9205, name: "Mass Shield", category: "ACTIVE", type: "BUFF", description: "Shield all allies in a sector.", aoe_pattern: "SECTOR", aoe_size: 2, statKey: "defense", statValue: 15 },
    // Advanced AoE Skills (Combo/Tiered)
    { id: 9301, name: "Thunderstorm", category: "ACTIVE", type: "DAMAGE", description: "Storm strikes in expanding rings, 3 hits over time.", multiplier: 0.8, aoe_pattern: "RING", aoe_size: 5, hits: 3, delay: 1, element: 2 },
    { id: 9302, name: "Blade Dance", category: "ACTIVE", type: "DAMAGE", description: "Rapid slashes in a circular area, 5 quick hits.", multiplier: 0.6, aoe_pattern: "CIRCLE", aoe_size: 2, hits: 5, delay: 0 },
    { id: 9303, name: "Meteor Swarm", category: "ACTIVE", type: "DAMAGE", description: "5 meteors strike random areas on the battlefield.", multiplier: 2.0, aoe_pattern: "RANDOM_SPREAD", aoe_size: 4, hits: 5, element: 3 },
    { id: 9304, name: "Chain Lightning", category: "ACTIVE", type: "DAMAGE", description: "Lightning jumps between enemies, hitting up to 5 targets.", multiplier: 1.2, aoe_pattern: "NEAREST_ENEMY", aoe_size: 4, jumps: 5, element: 2 },
    { id: 9305, name: "Cross Slash", category: "ACTIVE", type: "DAMAGE", description: "Diagonal X-shaped slash covering large area.", multiplier: 1.8, aoe_pattern: "X_SHAPE", aoe_size: 3 },
    { id: 9306, name: "Double Line", category: "ACTIVE", type: "DAMAGE", description: "Two parallel lines strike all enemies in path.", multiplier: 1.5, aoe_pattern: "DOUBLE_LINE", aoe_size: 2 },
    { id: 9307, name: "Checkerboard Nova", category: "ACTIVE", type: "DAMAGE", description: "Alternating tiles explode in a wide area.", multiplier: 1.3, aoe_pattern: "CHECKERBOARD", aoe_size: 3 },
    { id: 9308, name: "Wave Slash", category: "ACTIVE", type: "DAMAGE", description: "Arc-shaped wave pushes and damages enemies.", multiplier: 1.4, aoe_pattern: "WAVE", aoe_size: 2 },
    // Elemental Skills (Phase 1)
    // Fire Element
    { id: 9401, name: "Fireball", category: "ACTIVE", type: "DAMAGE", description: "Hurls a ball of fire at target.", multiplier: 1.8, aoe_pattern: "SQUARE", aoe_size: 1, element: 1 },
    { id: 9402, name: "Inferno", category: "ACTIVE", type: "DAMAGE", description: "Intense flames engulf surrounding area.", multiplier: 1.5, aoe_pattern: "RING", aoe_size: 2, element: 1 },
    { id: 9403, name: "Firestorm", category: "ACTIVE", type: "DAMAGE", description: "Massive storm of fire covers the battlefield.", multiplier: 1.2, aoe_pattern: "RING", aoe_size: 4, hits: 3, delay: 1, element: 1 },
    // Ice Element
    { id: 9404, name: "Ice Shard", category: "ACTIVE", type: "DAMAGE", description: "Launches sharp ice shards at target.", multiplier: 1.6, element: 4 },
    { id: 9405, name: "Frost Nova", category: "ACTIVE", type: "DAMAGE", description: "Freezes all enemies around caster.", multiplier: 1.2, aoe_pattern: "RING", aoe_size: 2, element: 4 },
    { id: 9406, name: "Blizzard", category: "ACTIVE", type: "DAMAGE", description: "Harsh winter storm damages all enemies.", multiplier: 1.0, aoe_pattern: "SQUARE", aoe_size: 5, element: 4 },
    // Lightning Element
    { id: 9407, name: "Zap", category: "ACTIVE", type: "DAMAGE", description: "Quick lightning strike on target.", multiplier: 1.7, element: 2 },
    { id: 9408, name: "Thunder", category: "ACTIVE", type: "DAMAGE", description: "Thunder strikes in a wide area.", multiplier: 1.4, aoe_pattern: "SQUARE", aoe_size: 3, element: 2 },
    // Poison Element
    { id: 9409, name: "Venom Strike", category: "ACTIVE", type: "DAMAGE", description: "Poisoned strike that deals damage over time.", multiplier: 1.3, status_effect: { type: "POISON", power: 10, duration: 3 } },
    { id: 9410, name: "Poison Cloud", category: "ACTIVE", type: "DAMAGE", description: "Toxic gas poisons all enemies in area.", multiplier: 0.8, aoe_pattern: "RING", aoe_size: 3, status_effect: { type: "POISON", power: 15, duration: 3 }, element: 5 },
    { id: 9411, name: "Plague", category: "ACTIVE", type: "DAMAGE", description: "Deadly disease spreads to all enemies.", multiplier: 0.6, aoe_pattern: "CROSS", aoe_size: 4, status_effect: { type: "POISON", power: 20, duration: 5 }, element: 5 },
    // Holy Element
    { id: 9412, name: "Holy Light", category: "ACTIVE", type: "HEAL", description: "Divine light heals single target.", power: 35, element: 6 },
    { id: 9413, name: "Divine Beam", category: "ACTIVE", type: "DAMAGE", description: "Beam of holy energy strikes enemies.", multiplier: 2.0, aoe_pattern: "LINE", aoe_size: 5, element: 6 },
    { id: 9414, name: "Sanctuary", category: "ACTIVE", type: "HEAL", description: "Holy aura heals all allies in area.", power: 25, aoe_pattern: "RING", aoe_size: 3, element: 6 },
    // Dark Element
    { id: 9415, name: "Shadow Bolt", category: "ACTIVE", type: "DAMAGE", description: "Bolt of shadow energy strikes target.", multiplier: 1.8, element: 3 },
    { id: 9416, name: "Dark Pulse", category: "ACTIVE", type: "DAMAGE", description: "Wave of dark energy damages all enemies.", multiplier: 1.3, aoe_pattern: "RING", aoe_size: 2, element: 3 },
    { id: 9417, name: "Void", category: "ACTIVE", type: "DAMAGE", description: "Void energy tears through all enemies.", multiplier: 2.5, aoe_pattern: "SQUARE", aoe_size: 3, element: 3, mana_cost: 50 },
    // Buff/Debuff Skills (Phase 2)
    // Self-Buffs
    { id: 9601, name: "Rage Mode", category: "ACTIVE", type: "BUFF", description: "Enter rage: +50% ATK, -20% DEF.", duration: 5, statKey: "attack_damage_mult", statValue: 0.50, statKey2: "defense_mult", statValue2: -0.20 },
    { id: 9602, name: "Guard Stance", category: "ACTIVE", type: "BUFF", description: "Defensive stance: +50% DEF, -20% ATK.", duration: 5, statKey: "defense_mult", statValue: 0.50, statKey2: "attack_damage_mult", statValue2: -0.20 },
    { id: 9603, name: "Haste", category: "ACTIVE", type: "BUFF", description: "Speed boost: +30% SPD, +20% ATK speed.", duration: 4, statKey: "speed_mult", statValue: 0.30, statKey2: "attack_speed", statValue2: 0.20 },
    { id: 9604, name: "Bloodlust", category: "ACTIVE", type: "BUFF", description: "+40% ATK, lose 5 HP/turn.", duration: 4, statKey: "attack_damage_mult", statValue: 0.40 },
    // Team Buffs
    { id: 9605, name: "War Cry", category: "ACTIVE", type: "BUFF", description: "All allies +10% ATK.", aoe_pattern: "RING", aoe_size: 3, duration: 4, statKey: "attack_damage_mult", statValue: 0.10 },
    { id: 9606, name: "Shield Wall", category: "ACTIVE", type: "BUFF", description: "All allies +20% DEF.", aoe_pattern: "RING", aoe_size: 3, duration: 4, statKey: "defense_mult", statValue: 0.20 },
    { id: 9607, name: "Blessed", category: "ACTIVE", type: "BUFF", description: "All allies +10% all stats.", aoe_pattern: "RING", aoe_size: 3, duration: 4, statKey: "all_stats_mult", statValue: 0.10 },
    { id: 9608, name: "Focus", category: "ACTIVE", type: "BUFF", description: "All allies +20% crit chance.", aoe_pattern: "RING", aoe_size: 3, duration: 4, statKey: "crit_chance", statValue: 0.20 },
    { id: 9609, name: "Regen", category: "ACTIVE", type: "HEAL", description: "All allies +5 HP/turn for 3 turns.", aoe_pattern: "RING", aoe_size: 3, duration: 3, regen_per_turn: 5 },
    // Debuffs
    { id: 9610, name: "Intimidate", category: "ACTIVE", type: "DEBUFF", description: "Enemy -10% ATK.", duration: 3, statKey: "attack_damage_mult", statValue: -0.10 },
    { id: 9611, name: "Slow", category: "ACTIVE", type: "DEBUFF", description: "Enemy -20% SPD.", duration: 3, statKey: "speed_mult", statValue: -0.20 },
    { id: 9612, name: "Weakness", category: "ACTIVE", type: "DEBUFF", description: "Enemy -10% DEF.", duration: 3, statKey: "defense_mult", statValue: -0.10 },
    { id: 9613, name: "Blind", category: "ACTIVE", type: "DEBUFF", description: "Enemy -20% accuracy.", duration: 3, statKey: "accuracy", statValue: -0.20 },
    { id: 9614, name: "Silence", category: "ACTIVE", type: "DEBUFF", description: "Enemy cannot cast spells.", duration: 2, status_effect: { type: "SILENCE", power: 0, duration: 2 } },
    { id: 9615, name: "Taunt", category: "ACTIVE", type: "DEBUFF", description: "Enemy forced to attack you.", duration: 2, status_effect: { type: "TAUNT", power: 0, duration: 2 } },
    // Support Skills (Phase 7)
    // Healing
    { id: 10301, name: "Group Heal", category: "ACTIVE", type: "HEAL", description: "Heals all allies in area.", power: 25, aoe_pattern: "RING", aoe_size: 3 },
    { id: 10302, name: "Regeneration", category: "ACTIVE", type: "HEAL", description: "Target regenerates 10 HP/turn for 3 turns.", power: 0, regen_per_turn: 10, duration: 3 },
    { id: 10303, name: "Life Drain", category: "ACTIVE", type: "HEAL", description: "Drain enemy HP to heal self.", multiplier: 1.0, drain_percent: 1.0 },
    { id: 10304, name: "Revive", category: "ACTIVE", type: "HEAL", description: "Restore fallen ally to 50% HP.", power: 50, revive: true },
    // Utility
    { id: 10305, name: "Teleport", category: "ACTIVE", type: "UTILITY", description: "Teleport to any location.", teleport: true },
    { id: 10306, name: "Speed Boost", category: "ACTIVE", type: "BUFF", description: "Target +30% SPD for 3 turns.", duration: 3, statKey: "speed_mult", statValue: 0.30 },
    { id: 10307, name: "Remove Debuff", category: "ACTIVE", type: "UTILITY", description: "Remove all debuffs from target.", cleanse: true },
    { id: 10308, name: "True Sight", category: "ACTIVE", type: "BUFF", description: "See stealth enemies for 3 turns.", duration: 3, status_effect: { type: "TRUE_SIGHT", power: 0, duration: 3 } },
    { id: 10309, name: "Dispel", category: "ACTIVE", type: "UTILITY", description: "Remove all buffs from enemy.", dispel: true },
    // Summon Skills (Phase 3)
    { id: 9801, name: "Summon Fire Imp", category: "ACTIVE", type: "SUMMON", description: "Summons a Fire Imp to fight.", summon_id: 1, duration: 10 },
    { id: 9802, name: "Summon Ice Golem", category: "ACTIVE", type: "SUMMON", description: "Summons an Ice Golem.", summon_id: 2, duration: 10 },
    { id: 9803, name: "Summon Thunder Drake", category: "ACTIVE", type: "SUMMON", description: "Summons a Thunder Drake.", summon_id: 3, duration: 10 },
    { id: 9804, name: "Summon Bone Warrior", category: "ACTIVE", type: "SUMMON", description: "Summons an undead Bone Warrior.", summon_id: 4, duration: 10 },
    { id: 9805, name: "Summon Shadow Assassin", category: "ACTIVE", type: "SUMMON", description: "Summons a stealthy Shadow Assassin.", summon_id: 5, duration: 10 },
    { id: 9806, name: "Summon Phoenix", category: "ACTIVE", type: "SUMMON", description: "Summons a Phoenix that revives.", summon_id: 6, duration: 15 },
    { id: 9807, name: "Summon Dragon", category: "ACTIVE", type: "SUMMON", description: "Summons a powerful Dragon.", summon_id: 7, duration: 12 },
    // Transform Skills (Phase 4)
    { id: 10001, name: "Werewolf Form", category: "ACTIVE", type: "TRANSFORM", description: "Transform into Werewolf: +ATK, -DEF.", duration: 5, transform: "werewolf" },
    { id: 10002, name: "Vampire Form", category: "ACTIVE", type: "TRANSFORM", description: "Transform into Vampire: Life steal.", duration: 5, transform: "vampire" },
    { id: 10003, name: "Shadow Form", category: "ACTIVE", type: "TRANSFORM", description: "Transform into Shadow: Stealth + crit.", duration: 4, transform: "shadow" },
    { id: 10004, name: "Demon Form", category: "ACTIVE", type: "TRANSFORM", description: "Transform into Demon: High stats, HP drain.", duration: 4, transform: "demon" },
    { id: 10005, name: "Angel Form", category: "ACTIVE", type: "TRANSFORM", description: "Transform into Angel: Healing + buffs.", duration: 4, transform: "angel" },
    // Counter/Reaction Skills (Phase 5)
    { id: 10101, name: "Parry", category: "ACTIVE", type: "COUNTER", description: "Chance to counter melee attacks.", counter_rate: 0.3, counter_damage_mult: 1.0 },
    { id: 10102, name: "Riposte", category: "ACTIVE", type: "COUNTER", description: "Counter and launch counter-attack.", counter_rate: 0.25, counter_damage_mult: 1.5 },
    { id: 10103, name: "Blade Barrier", category: "ACTIVE", type: "COUNTER", description: "Reflect 30% damage to attackers.", reflect_rate: 0.30 },
    { id: 10104, name: "Spike Armor", category: "ACTIVE", type: "COUNTER", description: "Deal 20 damage to attackers.", spike_damage: 20 },
    { id: 10105, name: "Dodge", category: "ACTIVE", type: "REACTION", description: "Chance to completely evade attack.", dodge_rate: 0.35 },
    { id: 10106, name: "Intervene", category: "ACTIVE", type: "REACTION", description: "Take damage meant for ally.", intervene: true },
    { id: 10107, name: "Sanctuary", category: "ACTIVE", type: "REACTION", description: "Teleport to safety when HP low.", sanctuary_hp_threshold: 0.25 },
    { id: 10108, name: "Time Warp", category: "ACTIVE", type: "REACTION", description: "Rewind HP when about to die.", time_warp_hp: 0.3 },
    // Combo/Chain Skills (Phase 6)
    { id: 10201, name: "Double Strike", category: "ACTIVE", type: "COMBO", description: "Two rapid strikes on target.", hits: 2, combo_mult: 1.0 },
    { id: 10202, name: "Triple Slash", category: "ACTIVE", type: "COMBO", description: "Three slashes, last is critical.", hits: 3, combo_mult: 1.0, crit_on_last: true },
    { id: 10203, name: "Finisher", category: "ACTIVE", type: "COMBO", description: "Bonus damage to low HP enemies.", finisher_mult: 2.0, hp_threshold: 0.3 },
    { id: 10204, name: "Aerial Combo", category: "ACTIVE", type: "COMBO", description: "Jump and strike from above.", hits: 3, combo_mult: 1.2 },
    { id: 10205, name: "Ground Slam", category: "ACTIVE", type: "COMBO", description: "Knockdown enemies and deal damage.", knockback: true, combo_mult: 1.5 },
    { id: 10206, name: "Explosion Trigger", category: "ACTIVE", type: "CHAIN", description: "Explode on hit, chaining to nearby.", chain_count: 3, chain_damage_mult: 0.8 },
    { id: 10207, name: "Poison Stacks", category: "ACTIVE", type: "CHAIN", description: "Each hit adds poison stack.", stack_count: 5, poison_per_stack: 5 },
    { id: 10208, name: "Burn Spreads", category: "ACTIVE", type: "CHAIN", description: "Burn spreads to nearby enemies.", burn_spread_count: 2, burn_damage: 10 },
    { id: 10209, name: "Freeze Chain", category: "ACTIVE", type: "CHAIN", description: "Freeze spreads to nearby enemies.", freeze_spread_count: 2 },
    // Ultimate Skills (Phase 8)
    { id: 10401, name: "Berserker Rage", category: "ULTIMATE", type: "BUFF", description: "+100% ATK, lose 5% HP/turn.", duration: 3, statKey: "attack_damage_mult", statValue: 1.0, self_damage_per_turn: 0.05 },
    { id: 10402, name: "Meteor Shower", category: "ULTIMATE", type: "DAMAGE", description: "Meteors strike all enemies.", multiplier: 3.0, aoe_pattern: "RANDOM_SPREAD", aoe_size: 5, element: 1 },
    { id: 10403, name: "Assassin's Strike", category: "ULTIMATE", type: "DAMAGE", description: "Instant kill below 30% HP.", multiplier: 5.0, execute_threshold: 0.3 },
    { id: 10404, name: "Divine Wrath", category: "ULTIMATE", type: "DAMAGE", description: "Holy damage + heal allies.", multiplier: 2.5, aoe_pattern: "RING", aoe_size: 4, element: 6, heal_percent: 0.3 },
    { id: 10405, name: "Army of Dead", category: "ULTIMATE", type: "SUMMON", description: "Summons 5 undead warriors.", summon_count: 5, summon_type: "undead" },
    { id: 10406, name: "Thousand Fists", category: "ULTIMATE", type: "COMBO", description: "10 rapid hits on target.", hits: 10, combo_mult: 0.8 },
    { id: 10407, name: "Symphony of Power", category: "ULTIMATE", type: "BUFF", description: "+50% all stats to team.", duration: 3, aoe_pattern: "RING", aoe_size: 5, statKey: "all_stats_mult", statValue: 0.50 },
    { id: 10408, name: "Rain of Arrows", category: "ULTIMATE", type: "DAMAGE", description: "Arrows fall on all enemies.", multiplier: 2.0, aoe_pattern: "SQUARE", aoe_size: 5 }
  ];

  for (const s of skills) {
    await prisma.skillTemplate.upsert({
      where: { id: s.id },
      update: s,
      create: s
    });
  }

  const treeMappings = [
    { classId: 1001, skillId: 9001, unlockLevel: 2 },
    { classId: 1001, skillId: 9002, unlockLevel: 5 }
  ];

  for (const t of treeMappings) {
    await prisma.classSkillTree.upsert({
        where: { classId_skillId: { classId: t.classId, skillId: t.skillId } },
        update: { unlockLevel: t.unlockLevel },
        create: { classId: t.classId, skillId: t.skillId, unlockLevel: t.unlockLevel }
    });
  }

  console.log("✅ Normalized Skills Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
