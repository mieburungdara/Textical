const prisma = require('../src/db');

async function migrate() {
    console.log("🚀 Memulai Migrasi Relasional...");

    try {
        // 1. User Attributes
        const users = await prisma.user.findMany();
        console.log(`- Memproses ${users.length} User Settings...`);
        for (const user of users) {
            const settings = JSON.parse(user.settings || "{}");
            for (const [key, value] of Object.entries(settings)) {
                await upsertAttribute(prisma.userAttribute, "userId", user.id, key, value);
            }
        }

        // 2. Monster AI Params
        const monsters = await prisma.monsterTemplate.findMany();
        console.log(`- Memproses ${monsters.length} Monster AI Configs...`);
        for (const monster of monsters) {
            const ai = JSON.parse(monster.aiConfig || "{}");
            for (const [key, value] of Object.entries(ai)) {
                await upsertAttribute(prisma.monsterBehaviorParam, "monsterId", monster.id, key, value);
            }
        }

        // 3. Quest Progress
        const userQuests = await prisma.userQuest.findMany();
        console.log(`- Memproses ${userQuests.length} User Quests...`);
        for (const uq of userQuests) {
            const progress = JSON.parse(uq.progressData || "{}");
            for (const [key, value] of Object.entries(progress)) {
                await upsertAttribute(prisma.userQuestVariable, "userQuestId", uq.id, key, value);
            }
        }

        // 4. Guild History Metadata
        const guildHistories = await prisma.guildHistory.findMany();
        console.log(`- Memproses ${guildHistories.length} Guild Histories...`);
        for (const gh of guildHistories) {
            const meta = JSON.parse(gh.metadata || "{}");
            for (const [key, value] of Object.entries(meta)) {
                await upsertAttribute(prisma.guildHistoryMeta, "historyId", gh.id, key, value);
            }
        }

        // 5. Hero History (Stats, Equipment, Buffs)
        const heroHistories = await prisma.heroStatHistory.findMany();
        console.log(`- Memproses ${heroHistories.length} Hero Stat History records...`);
        for (const hh of heroHistories) {
            // Primary Stats
            const pStats = JSON.parse(hh.primaryStats || "{}");
            for (const [key, val] of Object.entries(pStats)) {
                await prisma.heroHistoryStat.create({
                    data: { historyId: hh.id, category: "PRIMARY", statKey: key, statValue: Number(val) }
                });
            }

            // Secondary Stats
            const sStats = JSON.parse(hh.secondaryStats || "{}");
            for (const [key, val] of Object.entries(sStats)) {
                await prisma.heroHistoryStat.create({
                    data: { historyId: hh.id, category: "SECONDARY", statKey: key, statValue: Number(val) }
                });
            }

            // Equipped Items
            const equip = JSON.parse(hh.equippedItems || "[]");
            if (Array.isArray(equip)) {
                for (const item of equip) {
                     await prisma.heroHistoryEquipment.create({
                        data: {
                            historyId: hh.id,
                            slotKey: item.slotKey || "unknown",
                            itemTemplateId: item.templateId || null,
                            itemInstanceId: item.instanceId || null
                        }
                    });
                }
            }

            // Buffs
            const buffs = JSON.parse(hh.activeBuffs || "[]");
            if (Array.isArray(buffs)) {
                for (const buff of buffs) {
                    if (buff.traitId) {
                        await prisma.heroHistoryBuff.create({
                            data: { historyId: hh.id, traitTemplateId: buff.traitId }
                        });
                    }
                }
            }
        }

        // 6. Set Bonuses
        const setBonuses = await prisma.equipmentSetBonus.findMany();
        console.log(`- Memproses ${setBonuses.length} Set Bonus Stats...`);
        for (const sb of setBonuses) {
            const bStats = JSON.parse(sb.bonusStats || "{}");
            for (const [key, val] of Object.entries(bStats)) {
                await prisma.equipmentSetBonusStat.create({
                    data: { bonusId: sb.id, statKey: key, statValue: Number(val) }
                });
            }
        }

        // 7. Stat Allocation Caps
        const allocations = await prisma.heroStatAllocation.findMany();
        console.log(`- Memproses ${allocations.length} Stat Allocation Caps...`);
        for (const sa of allocations) {
            const caps = JSON.parse(sa.statCaps || "{}");
            for (const [key, val] of Object.entries(caps)) {
                await prisma.heroStatCap.create({
                    data: { allocationId: sa.id, statKey: key, capValue: Number(val) }
                });
            }
        }

        console.log("✅ Migrasi SELESAI. Semua data JSON telah dipindahkan ke relasi baru.");
    } catch (e) {
        console.error("❌ Terjadi kesalahan saat migrasi:", e);
    } finally {
        await prisma.$disconnect();
    }
}

async function upsertAttribute(model, idField, idValue, key, value) {
    let valStr = null, valInt = null, valFloat = null, valBool = null;
    if (typeof value === 'boolean') valBool = value;
    else if (typeof value === 'number') {
        if (Number.isInteger(value)) valInt = value;
        else valFloat = value;
    } else {
        valStr = String(value);
    }

    await model.upsert({
        where: { [`${idField}_key`]: { [idField]: idValue, key } },
        update: { valStr, valInt, valFloat, valBool },
        create: { [idField]: idValue, key, valStr, valInt, valFloat, valBool }
    });
}

migrate();
