# 🌍 Module 01: World Zonality System (Detailed Specification)

## 1. Green Zone (Safe Haven)
- **PvP Status**: Dinonaktifkan secara total. Pemain tidak dapat menyerang pemain lain.
- **Exceptions**: Pertempuran antar pemain hanya diizinkan di dalam **Arena** atau melalui sistem **Duel** dengan persetujuan kedua belah pihak.
- **Penalti Kekalahan (PvE)**: Tidak ada pengurangan durability item saat kalah melawan monster di zona ini.
- **City & Towns**: Semua wilayah dengan tipe `TOWN` secara otomatis dikategorikan sebagai Green Zone. Pemain tidak dapat bertarung di dalam kota.
- **Main Unit Management**: Penggantian status "Unit Utama" hanya dapat dilakukan di sini secara gratis.

## 2. Blue Zone (High Stakes - Non Lethal)
- **PvP Flagging System**: 
    - Penyerang wajib mengaktifkan status "Flagged" untuk memulai serangan.
    - **Cooldown**: Setelah status Flagged aktif, diperlukan waktu **5 menit** tanpa melakukan aksi agresif untuk bisa menonaktifkan status tersebut.
    - **Self-Defense**: Pemain yang diserang (korban) **tidak akan menjadi Flagged/Kriminal** saat membalas serangan.
- **Knockout (KO) Mechanics**:
    - Pemain yang kalah akan masuk status **KO (Pingsan)** selama **3-5 menit**.
    - Lokasi: Pemain tetap tergeletak di titik kekalahan (tidak teleportasi).
    - Timer KO tetap berjalan meskipun pemain sedang offline atau menutup aplikasi.
- **Looting Window (One-Time Access)**:
    - Penyerang memiliki **1 kesempatan** (One-time access) untuk membuka UI jarahan.
    - **Durasi**: UI hanya terbuka selama **1 menit**.
    - **Loot Scope**: Penyerang dapat mencuri isi gerobak dan isi tas (inventory). **Equipment yang sedang dikenakan korban TIDAK DAPAT dicuri.**
    - **Auto-Destruction**: Begitu UI ditutup atau waktu 1 menit habis, gerobak dan sisa isinya **langsung hancur/lenyap** dari database.
- **Post-KO Recovery (The Trap Logic)**:
    - Setelah bangun, pemain kembali dengan **HP Penuh**.
    - **Strict Peace Window**: Pemain wajib menunggu **1 menit** tambahan di map tersebut sebelum diizinkan berpindah region.
    - **Reset on Battle**: Jika terjadi pertempuran selama masa tunggu 1 menit ini, timer akan **meriset kembali ke nol** setelah pertempuran selesai (baik menang maupun kalah). Pemain harus mendapatkan 60 detik kedamaian total untuk kabur.

## 3. Red Zone (Lawless - Absolute Risk)
- **No Flagging (Free-for-all)**: PvP aktif secara otomatis untuk semua pemain. Siapa pun dapat menyerang siapa pun tanpa peringatan visual.
- **Universal Permadeath**:
    - Setiap unit (hero) non-utama yang mencapai **HP 0** di dalam grid pertempuran akan **dihapus selamanya dari database**.
    - Aturan ini berlaku untuk penyerang maupun bertahan, terlepas dari siapa pemenang pertempuran.
- **Naked Immortality (Unit Utama)**:
    - Unit Utama adalah unit pilihan pengguna (hanya 1 unit).
    - Unit Utama tidak akan dihapus dari database (Abadi).
    - **Equipment Loss**: Jika HP mencapai 0, Unit Utama kehilangan seluruh equipment (senjata/zirah) yang dikenakan.
    - **XP Penalty**: Progress XP pada level saat ini dikurangi **10%** (berdasarkan total XP yang dibutuhkan untuk level tersebut). Tidak dapat turun level (Level Floor).
    - **Victory Irrelevance**: Jika Unit Utama mati tapi timnya menang, Unit Utama tetap kehilangan equipment dan tetap terkena penalti XP.
- **Equipment & Loot Policy**:
    - **Vs Monster**: Semua equipment pada unit yang mati (HP 0) **lenyap selamanya**.
    - **Vs Player**: Semua equipment pada unit yang mati jatuh sebagai jarahan bagi pemenang.
    - **Advanced Looting**: Pemenang dapat memindahkan item ke bag atau melakukan **Instant Swap** (langsung mengenakan item jarahan ke unit mereka).
- **Draw Scenario**: Jika semua unit dari kedua belah pihak musnah bersamaan, gerobak dan isinya **lenyap selamanya**.
- **Respawn**: Pemain otomatis respawn di **kota terakhir yang dikunjungi**.

## 4. World-Level Rules

- **Logout Policy**: Jika pemain logout/force close di luar Green Zone, karakter tetap eksis di dunia dan tetap dapat diserang oleh monster atau pemain lain.

- **Loot Interruption**: Jika pihak ketiga menyerang pemenang yang sedang menjarah, UI jarahan tertutup paksa dan seluruh isi jarahan (gerobak/tas korban) **langsung hancur/lenyap**.

- **Reputation**: Menyerang karavan pemain lain mengakibatkan penalti reputasi faksi di zona manapun.



## 🚨 Catatan Konflik & Koreksi (Hasil Audit Kode)

*Ditemukan oleh Thinking Agent untuk diperbaiki oleh Scripting Agent:*



1. **Bug Permadeath Global di `RewardService.js`**: Kode saat ini di `RewardService.js` menghapus hero secara permanen pada mode "ADVENTURE" tanpa mengecek tipe zona. **KOREKSI**: Suntikkan pengecekan `region.zoneType`. Penghapusan hero (delete) HANYA boleh terjadi jika zona adalah `RED`. Untuk `BLUE`, ubah logika menjadi aktivasi status `isKnockedOut`.

2. **Ketiadaan Field `isMain` di Database**: `schema.prisma` v5.0 belum memiliki field `isMain` pada model `Hero`. **KOREKSI**: Tambahkan `isMain Boolean @default(false)` melalui migrasi database agar sistem "Naked Immortality" dapat membedakan Unit Utama.

3. **Logic Redundancy di `DeathResolver.js`**: Handler saat ini memberikan hadiah emas flat untuk setiap kematian. **KOREKSI**: Logika pemberian reward harus dipindahkan atau divalidasi ulang agar tidak bertabrakan dengan penalti XP 10% dan penghancuran gerobak di Red Zone.
