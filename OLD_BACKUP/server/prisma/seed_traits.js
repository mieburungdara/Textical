const prisma = require('../src/db');

async function seedTraits() {
    console.log('🌱 Seeding Trait Templates...');

    const traits = [
        { name: 'Adrenaline', description: 'Increases damage as health decreases.', category: 'OFFENSIVE' },
        { name: 'ArcaneMaster', description: 'Boosts skill damage and chance to reset cooldowns.', category: 'MAGIC' },
        { name: 'Berserker', description: 'Massive stat boosts at low health.', category: 'OFFENSIVE' },
        { name: 'BloodLink', description: 'Shares damage received by linked allies.', category: 'DEFENSIVE' },
        { name: 'CounterStrike', description: 'Chance to counter-attack when hit.', category: 'OFFENSIVE' },
        { name: 'Coward', description: 'Speed boost when low HP, but chance to panic if alone.', category: 'TACTICAL' },
        { name: 'Disruptor', description: 'Increases move range and allows moving through enemies.', category: 'UTILITY' },
        { name: 'Executioner', description: 'Bonus damage against low-health targets.', category: 'OFFENSIVE' },
        { name: 'Giant', description: 'Massive HP bonus but reduced speed.', category: 'DEFENSIVE' },
        { name: 'GlassCannon', description: 'Extreme attack power but very low health.', category: 'OFFENSIVE' },
        { name: 'LifeSteal', description: 'Heals based on a percentage of damage dealt.', category: 'OFFENSIVE' },
        { name: 'Opportunist', description: 'Bonus hit and crit when attacking from behind or side.', category: 'OFFENSIVE' },
        { name: 'ReflectiveSpikes', description: 'Reflects a portion of damage taken back as true damage.', category: 'DEFENSIVE' },
        { name: 'SecondWind', description: 'Heals the unit once per battle when falling below a threshold.', category: 'DEFENSIVE' },
        { name: 'Sharpshooter', description: 'Increases attack range significantly.', category: 'OFFENSIVE' },
        { name: 'SplittingForm', description: 'Splits into smaller units upon death.', category: 'TACTICAL' },
        { name: 'Thinker', description: 'Regenerates mana every turn.', category: 'MAGIC' },
        { name: 'Thorns', description: 'Reflects flat or percentage damage back to attackers.', category: 'DEFENSIVE' },
        { name: 'TrueSight', description: 'Detects stealthed units and increases accuracy.', category: 'UTILITY' },
        { name: 'UndyingWill', description: 'Status immunity and chance to revive upon death.', category: 'DEFENSIVE' },
        { name: 'Vanguard', description: 'Intercepts damage from adjacent allies.', category: 'DEFENSIVE' }
    ];

    for (const t of traits) {
        const existing = await prisma.traitTemplate.findFirst({ where: { name: t.name } });
        if (existing) {
            await prisma.traitTemplate.update({
                where: { id: existing.id },
                data: {
                    description: t.description,
                    category: t.category
                }
            });
        } else {
            await prisma.traitTemplate.create({
                data: {
                    name: t.name,
                    description: t.description,
                    category: t.category
                }
            });
        }
    }

    // Special fix: If 'name' is not unique in schema, findFirst/upsert might need different logic.
    // Based on schema.prisma, name is NOT @unique. Let's make it more robust.
}

if (require.main === module) {
    seedTraits()
        .then(() => console.log('✅ Traits seeded successfully.'))
        .catch(e => console.error('❌ Trait seeding failed:', e))
        .finally(() => prisma.$disconnect());
}

module.exports = seedTraits;
