const prisma = require('../../db');

/**
 * TerritoryManager
 * Mengelola aspek pemeliharaan wilayah yang dikuasai Guild.
 * Fitur:
 * - Penghitungan pajak berdasarkan Corruption Level.
 * - Otomatisasi penarikan treasury guild.
 * - Evaluasi pemenuhan kuota quest bulanan.
 * - Pencabutan hak wilayah jika syarat gagal dipenuhi.
 */
class TerritoryManager {
    /**
     * Menjalankan siklus pemeliharaan bulanan untuk semua territory.
     */
    async processAllMaintenances() {
        console.log("[TERRITORY_MANAGER] Starting global maintenance cycle...");
        const territories = await prisma.territory.findMany({
            where: {
                nextMaintenanceAt: { lte: new Date() }
            },
            include: {
                guild: true,
                region: true
            }
        });

        for (const territory of territories) {
            await this.processMaintenance(territory);
        }
    }

    /**
     * Memproses maintenance untuk satu wilayah spesifik.
     */
    async processMaintenance(territory) {
        const { guild, region } = territory;
        console.log(`[TERRITORY_MANAGER] Processing maintenance for Region ${region.name} (Owned by Guild: ${guild.name})`);

        // 1. Cek Kuota Quest
        const questShortfall = territory.monthlyQuestQuota - territory.monthlyQuestProgress;
        if (questShortfall > 0) {
            console.warn(`[TERRITORY_MANAGER] Guild ${guild.name} failed quest quota for ${region.name}. Missing ${questShortfall} quests.`);
            await this.revokeOwnership(territory, "QUEST_QUOTA_FAILED");
            return;
        }

        // 2. Hitung Biaya Pajak (Dinamis berdasarkan Korupsi)
        // Rumus Dasar: maintenanceCost * (1 + corruptionLevel)
        const totalTax = Math.floor(territory.maintenanceCost * (1 + (region.corruptionLevel || 0)));

        // 3. Cek Treasury Guild
        if (guild.treasury < totalTax) {
            console.warn(`[TERRITORY_MANAGER] Guild ${guild.name} insufficient funds for ${region.name}. Needs ${totalTax}, has ${guild.treasury}.`);
            await this.revokeOwnership(territory, "TAX_PAYMENT_FAILED");
            return;
        }

        // 4. Eksekusi Pembayaran & Reset Progres
        await prisma.$transaction([
            // Kurangi Treasury
            prisma.guild.update({
                where: { id: guild.id },
                data: { treasury: { decrement: totalTax } }
            }),
            // Update Territory (Next Cycle)
            prisma.territory.update({
                where: { id: territory.id },
                data: {
                    monthlyQuestProgress: 0,
                    nextMaintenanceAt: this.calculateNextMaintenanceDate(),
                    lastUpkeepAt: new Date()
                }
            }),
            // Catat Sejarah Guild
            prisma.guildHistory.create({
                data: {
                    guildId: guild.id,
                    eventType: "MAINTENANCE_PAID",
                    description: `Pajak wilayah ${region.name} sebesar ${totalTax} Silver telah dibayarkan otomatis.`
                }
            })
        ]);

        console.log(`[TERRITORY_MANAGER] Maintenance SUCCESS for ${region.name}.`);
    }

    /**
     * Mencabut hak kepemilikan wilayah dari Guild.
     */
    async revokeOwnership(territory, reason) {
        const { guild, region } = territory;
        console.error(`[TERRITORY_MANAGER] REVOKING OWNERSHIP: Region ${region.name} from Guild ${guild.name}. Reason: ${reason}`);

        await prisma.$transaction([
            // Hapus data kepemilikan di Region (Denormalisasi)
            prisma.regionTemplate.update({
                where: { id: region.id },
                data: { guildOwnershipId: null }
            }),
            // Hapus data Territory
            prisma.territory.delete({
                where: { id: territory.id }
            }),
            // Catat Sejarah Guild sebagai peringatan keras
            prisma.guildHistory.create({
                data: {
                    guildId: guild.id,
                    eventType: "TERRITORY_LOST",
                    description: `KONTROL WILAYAH DIPUTUSKAN! ${region.name} ditarik kembali oleh kerajaan karena ${reason}.`
                }
            })
        ]);
        
        // Kirim Notifikasi ke Anggota Guild (Opsional/Future Implementation)
    }

    /**
     * Update progres quest bulanan ketika anggota guild menyelesaikan quest di wilayah tersebut.
     */
    async recordQuestCompletion(guildId, regionId) {
        const territory = await prisma.territory.findFirst({
            where: { guildId, regionId }
        });

        if (territory) {
            await prisma.territory.update({
                where: { id: territory.id },
                data: { monthlyQuestProgress: { increment: 1 } }
            });
        }
    }

    calculateNextMaintenanceDate() {
        const now = new Date();
        return new Date(now.setMonth(now.getMonth() + 1));
    }
}

module.exports = new TerritoryManager();
