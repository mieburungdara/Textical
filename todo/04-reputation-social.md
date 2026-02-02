# 🎭 Module 04: Reputation & Social Impact (Detailed Specification)

## 1. Sistem Karma dan Penalti Reputasi (Banditry Logic)
Setiap aksi agresif terhadap karavan atau pemain lain akan tercatat dalam sistem reputasi faksi pemain tersebut.
- **Menyerang Sesama Faksi (Penghianatan)**:
    - Penalti: **-500 Reputasi** per serangan.
    - Menyerang pemain dari faksi yang sama adalah pelanggaran berat dan langsung memicu status "Flagged" kriminal.
- **Menyerang Faksi Lawan (Sabotase Perang)**:
    - Syarat: Status hubungan antar faksi harus dalam keadaan **WAR** (Perang).
    - Bonus: **+100 Reputasi** faksi sendiri per karavan musuh yang berhasil dilumpuhkan.
    - Aksi ini dianggap sebagai tindakan heroik dan tidak memberikan status kriminal di mata faksi sendiri.
- **Menyerang Pemain Netral (Tanpa Faksi)**:
    - Penalti: **-200 Reputasi** faksi sendiri.
    - Hal ini untuk menjaga ketertiban dunia agar faksi tidak bertindak semena-mena terhadap warga sipil/pemain baru.
- **Pemain Independen (Tanpa Faksi)**:
    - Pemain yang belum bergabung dengan faksi tetap memiliki nilai reputasi terhadap setiap faksi besar di dunia.
    - Setiap serangan terhadap anggota faksi tertentu akan menurunkan reputasi pemain independen tersebut terhadap faksi yang diserang secara permanen.

## 2. Status Traitor (Penghianat) dan Outlaw (Buronan)
Jika reputasi seorang pemain turun di bawah ambang batas tertentu, faksi akan mengeluarkan sanksi resmi.
- **Ambang Batas (Threshold)**: Reputasi **< -1000**.
- **Konsekuensi Status Traitor**:
    - **Hostilitas NPC**: Semua penjaga kota (NPC Guard) milik faksi tersebut akan menyerang pemain secara otomatis jika terdeteksi di Green Zone.
    - **Blokir Layanan**: Pemain tidak dapat berinteraksi dengan NPC Caravan Master (untuk hauling), Bank, atau Repair di wilayah faksi tersebut.
    - **Visual Indicator**: Nama pemain akan berubah menjadi warna **Merah Gelap atau Hitam** di World Map dan di atas unit saat pertempuran.
    - **Bounty List**: Nama pemain akan otomatis masuk ke dalam daftar "Most Wanted" di papan pengumuman kota.
- **Persistensi Pasca Kematian**:
    - Kematian Traitor tidak menghapus status "Traitor" atau menaikkan nilai reputasi yang sudah negatif.
    - Pemain tetap menyandang status Traitor sampai mereka melakukan proses **Redemption** (Penebusan Dosa).
    - Namun, nilai **Bounty** (Hadiah Buruan) pada kepala pemain tersebut akan **direset kembali ke nol** setelah dibayarkan kepada pemain yang berhasil membunuhnya.

## 3. Sistem Bounty Hunter (Pemburu Hadiah)
Faksi memberikan insentif bagi pemain lain untuk menegakkan hukum dan memburu para kriminal.
- **Pemicu Bounty**: Status Traitor secara otomatis memberikan harga (Gold) pada kepala pemain tersebut.
- **Hadiah Gold**: Diambil dari kas faksi atau pajak perdagangan regional.
- **Insentif Full Loot (Universal Override)**:
    - Membunuh seorang Traitor memberikan hak **Full Loot** (termasuk seluruh equipment yang dikenakan) kepada pemenang, **terlepas dari zona pertempuran** (berlaku di Blue Zone maupun Red Zone).
    - **Aturan Prioritas**: Aturan ini **mengalahkan (override)** batasan looting pada sistem Hauling. Jika seorang Hauler berstatus Traitor dikalahkan di Blue Zone, pemenang tetap berhak mengambil seluruh Equipment korban.
    - Hal ini membuat profesi Bounty Hunter menjadi sangat menguntungkan namun berbahaya.
- **Klaim Bounty**: 
    - Pemain (Bounty Hunter) yang berhasil mengalahkan Traitor akan mendapatkan hadiah Gold secara instan.
    - Penyerangan terhadap Traitor **tidak memberikan penalti reputasi** apa pun, meskipun Traitor tersebut berasal dari faksi yang sama.

## 4. Sistem Intelijen Regional (Scout Alert)
- **Notifikasi Dasar**: Setiap pemain di region yang sama dengan karavan aktif akan menerima notifikasi: *"Karavan dari Faksi [X] terlihat di wilayah ini!"*
- **Class Bonus (Scout/Spy)**: 
    - Hero dengan Class bertipe Scout atau Spy memiliki kemampuan pasif untuk mendeteksi karavan dari jarak **2 Region lebih jauh**.
    - Memberikan keuntungan taktis bagi bandit untuk menyergap atau bagi pengawal untuk menghindari rute yang berbahaya.

## 5. Sistem Penebusan Dosa (Redemption)
Cara bagi pemain untuk memulihkan reputasi yang hancur.
- **Faksi Quest**: Menyelesaikan misi khusus yang memiliki tingkat kesulitan sangat tinggi (High-tier combat/gathering).
- **Denda Gold (Imperial Fine)**: Membayar denda dalam jumlah yang sangat besar (misal: 10x biaya sewa gerobak Heavy) ke kas faksi.
- **Monster Extermination**: Membunuh monster dalam jumlah ribuan di wilayah faksi tersebut memberikan +1 Reputasi per 10 monster yang dibasmi.
- **City Access**: Selama status Traitor belum hilang, pemain tetap dilarang masuk ke kota utama untuk melakukan penebusan dosa (harus melalui NPC di pos perbatasan luar kota).

## 🚨 Catatan Konflik & Koreksi (Hasil Audit Kode)
*Ditemukan oleh Thinking Agent untuk diperbaiki oleh Scripting Agent:*

1. **Hostilitas NPC di `NPCActionResolver.js`**: Kode saat ini hanya mendeteksi musuh berdasarkan status `WAR` faksi. **KOREKSI**: Tambahkan pengecekan reputasi individu. Jika `reputation.amount < -1000`, maka NPC bertipe `GUARD` harus otomatis memicu `COMBAT_TRIGGERED` meskipun faksi tidak sedang berperang.
2. **Sinkronisasi `UserReputation`**: Pastikan repositori reputasi mendukung pengambilan data faksi secara *real-time* saat inisiasi dialog.
