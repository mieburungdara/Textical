const prisma = require('../db');
const fs = require('fs');
const path = require('path');

const PUBLIC_DATA_DIR = path.join(__dirname, '../../public/data');
const MONSTERS_DIR = path.join(PUBLIC_DATA_DIR, 'monsters');

class MonsterSyncService {
    constructor() {
        this.ensureDirectories();
    }

    ensureDirectories() {
        if (!fs.existsSync(MONSTERS_DIR)) {
            fs.mkdirSync(MONSTERS_DIR, { recursive: true });
        }
    }

    /**
     * Helper to get or create a system setting
     */
    async getSetting(key, defaultValue) {
        let setting = await prisma.systemSetting.findUnique({ where: { key } });
        if (!setting) {
            setting = await prisma.systemSetting.create({
                data: { key, value: defaultValue }
            });
        }
        return setting.value;
    }

    async setSetting(key, value) {
        return await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });
    }

    async getVersion() {
        const monsterVersion = await this.getSetting('monster_data_version', '0');
        return {
            monster: parseInt(monsterVersion),
            // Add other data versions here if needed
        };
    }

    async syncMonstersToJson() {
        try {
            console.log("Starting Monster Sync...");
            const monsters = await prisma.monsterTemplate.findMany({
                include: {
                    category: true,
                    loot: true,
                    traits: {
                        include: {
                            trait: true
                        }
                    },
                    // New Relations
                    tags: {
                        include: {
                            tag: true
                        }
                    },
                    skills: {
                        include: {
                            skill: true
                        }
                    },
                    reactions: {
                        include: {
                            reaction: true
                        }
                    },
                    auras: {
                        include: {
                            aura: true
                        }
                    },
                    summons: {
                        include: {
                            summon: {
                                include: {
                                    spawnUnit: true
                                }
                            }
                        }
                    },
                    immunities: {
                        include: {
                            statusEffect: true
                        }
                    },
                    vulnerabilities: {
                        include: {
                            statusEffect: true
                        }
                    },
                    enrages: {
                        include: {
                            enrage: true
                        }
                    },
                    companions: {
                        include: {
                            companion: true
                        }
                    },
                    phases: {
                        include: {
                            phase: true
                        }
                    },
                    formations: true,
                    territoryBonuses: {
                        include: {
                            regionType: true
                        }
                    }
                }
            });

            // 1. Create the consolidated 'all.json'
            const consolidatedPath = path.join(MONSTERS_DIR, 'all.json');
            fs.writeFileSync(consolidatedPath, JSON.stringify(monsters, null, 2));

            // 2. Create individual files
            for (const monster of monsters) {
                const filePath = path.join(MONSTERS_DIR, `${monster.id}.json`);
                fs.writeFileSync(filePath, JSON.stringify(monster, null, 2));
            }

            // 3. Increment Version
            const currentVersion = await this.getSetting('monster_data_version', '0');
            const newVersion = parseInt(currentVersion) + 1;
            await this.setSetting('monster_data_version', newVersion.toString());

            console.log(`Synced ${monsters.length} monsters. Version updated to ${newVersion}`);
            return { success: true, count: monsters.length, version: newVersion };

        } catch (error) {
            console.error("Error syncing monsters:", error);
            throw error;
        }
    }
}

module.exports = new MonsterSyncService();
