# Roadmap Implementasi: Logistics & World Security

Dokumen ini berisi urutan kerja (Phasing) yang harus diikuti oleh Scripting Agent untuk menghindari kerusakan logika dan inkonsistensi database.

---

## 🟢 FASE 1: Fondasi Data & Kontrak Database
*Tujuan: Menyiapkan wadah data agar sistem lain bisa mengenali field baru.*

1. **`server/prisma/schema.prisma`**
   - Penambahan field `isMain` pada model `Hero`.
   - Penambahan field `currentDurability` & `maxDurability` pada model `InventoryItem`.
   - Penambahan field `zoneType` pada model `RegionTemplate`.
   - Penambahan field `activeWagonId` pada model `User`.
   - Pembuatan model baru `Wagon` (untuk menyimpan metadata gerobak).
2. **Eksekusi Database**
   - Menjalankan `npx prisma migrate dev` untuk sinkronisasi skema.
3. **`server/src/data/seed/` (Jika ada)**
   - Inisialisasi data `zoneType` awal (contoh: Region ID 1 adalah GREEN).

---

## 🟡 FASE 2: Sistem Filter & Integritas (Safety First)
*Tujuan: Memastikan data yang baru ditambahkan diproses dengan benar oleh sistem inti.*

1. **`server/src/services/StatService.js`**
   - Modifikasi logika pengambilan stat equipment agar mengabaikan item dengan Durability 0.
2. **`server/src/services/InventoryService.js`**
   - Penyesuaian pengecekan kapasitas tas agar bisa membaca kapasitas dari entitas `Wagon` jika sedang melakukan Hauling.
3. **`server/src/logic/battleRules.js`**
   - Penyesuaian perhitungan degradasi durability saat pertarungan terjadi.

---

## 🔴 FASE 3: Logika Keamanan & Penyelamatan Karakter
*Tujuan: Menghindari "Fatal Bug" seperti penghapusan karakter yang salah (Permadeath di zona aman).*

1. **`server/src/services/RewardService.js`**
   - Implementasi pengecekan `zoneType`. Mengubah perintah `delete` menjadi `KO status` jika lokasi di Blue Zone.
2. **`server/src/logic/DeathResolver.js`**
   - Implementasi logika "Naked Immortality" untuk unit utama (`isMain`).
   - Implementasi penalti XP 10% dan penghancuran gerobak di tempat untuk Red Zone.

---

## 🔵 FASE 4: Mekanik Perjalanan & Interaksi NPC
*Tujuan: Mengaktifkan fitur Hauling dan sistem Reputasi.*

1. **`server/src/services/TravelService.js`**
   - Mengubah alur update lokasi dari "Atomic Arrive" menjadi "Immediate Move with Map-Stay" khusus untuk mode Hauling.
2. **`server/src/logic/NPCActionResolver.js`**
   - Menambahkan filter pengecekan nilai reputasi (`Traitor Check`) agar NPC GUARD memicu combat otomatis.
3. **`server/src/services/HaulingService.js` (File Baru)**
   - Implementasi logika sewa gerobak, loading barang, dan rute perjalanan terintegrasi.

---

## 🟣 FASE 5: Verifikasi & Audit Akhir
- Menjalankan unit test pada `combat.test.js` dan `movement.test.js`.
- Verifikasi migrasi database terakhir.
