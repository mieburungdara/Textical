# 🗺️ Textical Regional Systems - TODO & Roadmap

Dokumen ini melacak status implementasi field dan fitur pada sistem Regional/Peta Grid 1225 Region.

---

## 🟢 1. Core RPG & Narrative (Selesai)
Fitur dasar untuk navigasi, atmosfer, dan struktur data regional.

- [x] **`areaId` (Relation):** Menghubungkan region ke `RegionArea` (misal: "The Heart of Darkness"). Digunakan untuk pengelompokan naratif yang lebih luas.
- [x] **`landmarkName` (String):** Nama titik ikonik di grid (misal: "Statue of the Forgotten"). Memberikan identitas unik pada koordinat tertentu.
- [x] **`flavorText` (String):** Deskripsi atmosferik saat pemain memasuki region. Meningkatkan imersi RPG.
- [x] **`discoveryXp` (Int):** Hadiah XP saat pemain pertama kali menemukan region/landmark tersebut.
- [x] **`ambientSfxPack` (String):** ID paket suara lingkungan (misal: `forest_ambient`, `abyss_wind`).

---

## ⚔️ 2. Taktik & Pertempuran (Selesai)
Mekanik yang mempengaruhi strategi pemain di medan perang.

- [x] **`elementalAffinity` (String):** Elemen dominan wilayah (FIRE, WATER, EARTH, AIR, LIGHT, DARK, NEUTRAL). Memberikan bonus/pinalti pada skill hero berbasis elemen.
- [x] **`terrainAttackMod` (Float):** Modifikator serangan fisik berdasarkan jenis medan (misal: pinalti di air, bonus di dataran tinggi).
- [x] **`terrainDefenseMod` (Float):** Modifikator pertahanan (misal: bonus di hutan karena banyak tempat berlindung).
- [x] **`spawnRateMultiplier` (Float):** Mengatur seberapa cepat monster muncul kembali di wilayah tersebut.
- [x] **`eliteSpawnChance` (Float):** Peluang munculnya monster tipe Elite atau Champion di grid tersebut.

---

## 🧝 Refinement Granularitas Ras (Lore Accuracy)
- [x] Pembaruan Skema Database (Evolusi `UnitRace`: +Vampire, Skeleton, Zombie)
- [x] Pemetaan Ulang `dominanCaste` di `mapSeeder.js`
- [x] Verifikasi Final Lore Seeding
## 🛡️ 3. Akses & Keamanan (Selesai)
Aturan yang membatasi pergerakan pemain berdasarkan kemajuan mereka.

- [x] **`requiredLevel` (Int):** Level minimum untuk melintasi wilayah tanpa pinalti.
- [x] **`minRequiredUnits` (Int)::** Jumlah minimal unit party untuk bisa memasuki wilayah berbahaya (misal: Raid Zone butuh 5+ unit).
- [x] **`minRequiredHeroLevel` (Int):** Level minimal hero terkuat di party untuk masuk.
- [x] **`requiredAchievementId` (Int):** Membutuhkan pencapaian tertentu (misal: "Slayer of Dragon") untuk membuka gerbang wilayah.
- [x] **`reputationRequirement` (Int):** Syarat reputasi faksi untuk masuk ke ibu kota (Citadel).

---

## 💰 4. Ekonomi & Pemulihan (Selesai)
Sistem logistik dan perdagangan regional.

- [x] **`resourceModifier` (Float):** Pengali hasil panen/gathering di wilayah tersebut.
- [x] **`teleportCostMultiplier` (Float):** Biaya teleportasi ke wilayah ini (lebih mahal untuk wilayah jauh/berbahaya).
- [x] **`factionTributeRate` (Float):** Upeti pajak yang diambil faksi penguasa dari aktivitas pemain.
- [x] **`innRecoveryRate` (Float):** Kecepatan regenerasi **Vitalitas** pemain saat beristirahat di Hub (Citadel/Village).
- [x] **`marketDemandIndex` (Float):** Dinamika harga beli/jual NPC berdasarkan lokasi (Demand tinggi = Harga jual item ke NPC lebih mahal).
- [x] **`resourceScarcity` (Float):** Melacak tingkat eksploitasi wilayah (Overfarming).
- [x] **`blessingType` (String):** Buff regional acak yang diberikan oleh alam.

---

## 🌪️ 5. Bahaya Lingkungan (Selesai)
- [x] **`RegionHazard` Relation:** Sistem relasional untuk memberikan damage berkala (Miasma, Lava, Badai) tanpa menggunakan array JSON.

---

## 🚀 6. Saran Fitur Mendatang (Belum Diimplementasikan)
Field di bawah ini merupakan rencana pengembangan untuk membuat dunia semakin dinamis.

### 🌑 Living World & Ecosystem
- [x] **`corruptionLevel` (Float):** Skala kegelapan wilayah (0.0 - 1.0).
    - *Fungsi:* Terimplementasi; Mempengaruhi kekuatan monster, pinalti `sanctuaryPower`, dan kualitas loot secara permanen.
- [x] **`dominanCaste` (Enum):** Ras penguasa wilayah (VAMPIRE, SKELETON, ZOMBIE, dll).
    - *Fungsi:* Terimplementasi dengan akurasi lore; Menentukan ekosistem monster dominan.

### 🚩 Geopolitik & Guild
- [x] **`guildOwnershipId` (Int):** ID Guild yang menguasai wilayah.
    - *Fungsi:* Mengizinkan Guild untuk menarik pajak tambahan atau memberikan akses khusus.
- [x] **`taxDistributionRate` (Float):** Rasio pembagian pajak antara Guild penguasa dan Faksi Kerajaan.

### 🔍 Eksplorasi Lanjut
- [x] **`hiddenTreasureChance` (Float):** Peluang munculnya "Hidden Nodes" yang tidak terlihat di Map standar.
    - *Fungsi:* Memberikan nilai lebih bagi pemain yang rajin menjelajah setiap grid secara manual.


---

## 💡 7. Saran Sederhana & Taktis (Masuk Akal)
Daftar field yang ringan namun memberikan dampak langsung pada kenyamanan bermain (QoL).

- [ ] **`isPvpAllowed` (Boolean):** Memberikan izin PvP spesifik di luar *Safe Zone*.
    - *Fungsi:* Membuat wilayah "Arena" atau "Conflict Zone" di tengah wilayah yang seharusnya aman.
- [x] **`dangerLevel` (Int):** Skala 1-5 (Very Low to Extreme).
    - *Fungsi:* Indikator visual instan di UI pemain untuk mengukur risiko wilayah tanpa melihat level monster secara detail.
- [ ] **Implementasi UI Notice Board & Monster Study (Godot):** Menampilkan rumor regional dan memberikan buff persiapan.
- [ ] **Implementasi UI Guestbook (Godot):** Board pesan pemain di setiap Penginapan.
- [ ] **Sistem Respawn Binding (Backend/Godot):** Antarmuka untuk menetapkan titik 'Home'.
- [ ] **Regional Specialty Shop UI (Godot):** Menampilkan item unik per wilayah.
- [x] **`hasInn` (Boolean):** Status fasilitas istirahat.
    - *Fungsi:* Memberitahu pemain apakah mereka bisa memulihkan HP/Vitalitas di grid ini (berkaitan dengan `innRecoveryRate`).
- [x] **`regionCategory` (String):** Label sub-bioma (misal: "Swamp", "Highland", "Holy Place").
    - *Fungsi:* Terimplementasi; Mempermudah sistem filter pencarian di World Atlas dan memberikan variasi nama wilayah.
- [x] **`ecologicalStress` (Float):** Skala tekanan ekosistem (0.0 - 1.0).
- [x] Ecological Stress Mechanism (Activity-based resource abundance)
- [x] Local Hall of Fame System (Top Hunter/Gambler per Inn)
- [x] **Regional Daily Tasks:** Misi harian otomatis di Notice Board.
    - *Fungsi:* Memberikan objektif jangka pendek bagi pemain (misal: "Kumpulkan 5 Leather") dengan hadiah Silver & Reputasi.
- [x] Phase 2: Tavern Rumor Network (Intel trading with reputation)
- [x] Phase 2: Infamy System & Bandit Inns (Restricted access for criminals)
- [x] Phase 2: Tavern Night Events (Scheduled server-wide buffs/discounts)

---

## 🌿 8. Ekologi & Flora-Fauna (Saran)
Terkait siklus hidup makhluk hidup dan sumber daya alam.

- [x] **`monsterMigrationStatus` (Boolean):** Status migrasi monster.
    - *Fungsi:* Terimplementasi; Jika *true*, monster dari wilayah tetangga bisa muncul di sini dengan peluang 15% (monster luar habitat).
- [x] **`rareHerbSpawnChance` (Float):** Peluang munculnya rare herbs (0.0 - 1.0).
- [x] **`mysticFogIntensity` (Float):** Intensitas kabut yang mengurangi akurasi (0.0 - 1.0).
    - *Fungsi:* Menentukan apakah grid ini layak menjadi lokasi "Gathering Trip" bagi pengolah ramuan.

---

## ✨ 10. Magis & Spiritual (Saran)
Elemen supranatural yang mempengaruhi hero dan kemampuan sihir.

- [x] v8.0: Mana Static Intensity (Regen multiplier, Static Discharge, Arcane Efficiency)
    - *Fungsi:* Mempengaruhi kecepatan regenerasi Mana hero atau kekuatan skill sihir (misal: di *Ley Line* sihir lebih kuat).

---

## 🏰 11. Properti & Guild (Saran)
Terkait kepemilikan pemain dan ekonomi skala besar.

- [x] **`plotAvailability` (Int):** Jumlah tanah kosong yang bisa dibeli pemain untuk rumah. (v11.0)
    - *Fungsi:* Memungkinkan sistem *Housing* regional.
- [x] **`rentCostMultiplier` (Float):** Pengali biaya sewa toko atau gudang di wilayah tersebut. (v11.0)
- [x] **`guildBonusType` (String):** Bonus khusus bagi anggota Guild penguasa. (v11.0)

---

## ⏳ 12. Temporal & Event (Saran)
Fitur yang membuat wilayah berubah seiring waktu atau kejadian khusus.

- [ ] **`ongoingEventId` (String):** ID event yang sedang berlangsung (misal: "Festival Panen", "Invasi Monster").
    - *Fungsi:* Mengubah visual dan mekanik wilayah secara temporer tanpa merubah data dasar.

---

## 📺 13. Visual & Atmosfer (Saran Lanjut)
Pengaturan grafis spesifik untuk Godot Client.

- [x] **`skyboxOverride` (String):** Mengganti langit standar (misal: Langit ungu di zona Abyss).
- [x] **`particleEffectPack` (String):** Paket partikel (misal: Daun jatuh, kunang-kunang, debu mengambang).
- [x] **`fogDensity` (Float):** Ketebalan kabut visual untuk kedalaman atmosfer.

---

## 🎮 14. Mekanik Gameplay Tambahan (Saran Baru)
Field sederhana untuk variasi interaksi.

- [ ] **`isMarketDay` (Boolean):** Status hari pasar.
    - *Fungsi:* Memberikan diskon atau stok item langka di wilayah tersebut secara berkala.
- [x] **`gatheringStaminaCost` (Float):** Pengali biaya stamina saat memanen di grid ini.
    - *Fungsi:* Medan yang sulit (pegunungan) lebih melelahkan daripada padang rumput. (v13.0)
- [ ] **`isRuins` (Boolean):** Penanda wilayah reruntuhan.
    - *Fungsi:* Memberikan bonus drop rate untuk item kuno (*Ancient Fragments*).

---

## 🎵 15. Imersi & Audio (Saran Baru)
Memperkuat pengalaman sensorik pemain.

- [ ] **`mapMusicTrack` (String):** ID track musik latar spesifik (misal: `battle_drums`, `mystic_melody`).
    - *Fungsi:* Mengganti musik standar zona dengan sesuatu yang lebih spesifik untuk grid tertentu.
- [ ] **`regionLoreSnippet` (String):** Catatan sejarah singkat wilayah.
    - *Fungsi:* Muncul sebagai tooltip atau entri buku jurnal saat wilayah dijelajahi.

---

## 🧭 16. Navigasi & Logistik (Saran Baru)
Mempengaruhi cara pemain berpindah dari satu titik ke titik lain.

- [ ] **`waterDepth` (Int):** Kedalaman air (khusus wilayah WATER).
    - *Fungsi:* Membatasi jenis kapal yang bisa lewat (Shallow vs Deep water).
- [ ] **`isDeadEnd` (Boolean):** Penanda jalan buntu secara logis.
    - *Fungsi:* Membantu sistem pathfinding NPC atau memberikan peringatan navigasi bagi pemain.

---

## 🏰 17. Struktur Medieval & Pertahanan (Saran Medieval)
Field untuk memperkuat vibe kerajaan dan peperangan klasik.

- [ ] **`patrolFrequency` (Enum):** NONE, LOW, HIGH.
    - *Fungsi:* Kemunculan prajurit kerajaan (Guard NPC) untuk membantu pemain jika diserang monster.
- [x] **`banditThreatLevel` (Float):** Peluang terjadinya penghadangan (Ambush) oleh bandit di jalan setapak. (v15.0)
    - *Fungsi:* Memberikan risiko tambahan pada rute dagang yang sepi. Tersebar otomatis berdasarkan tipe zona (0.0 - 0.8).
- [ ] **Mekanik Lanjutan Bandit (v15.1 - v15.x):**
    - **[v15.1] Bandit Ransom:** Peluang negosiasi saat Ambush; bandit menawarkan "biaya lewat" daripada bertempur.
    - **[v15.2] Bandit Reputation (Fear vs Prey):** Membayar tebusan terus-menerus meningkatkan peluang Ambush (kamu dianggap target empuk), sementara membantai bandit meningkatkan "Intimidasi" (bandit mungkin lari sebelum menyerang).
    - **[v15.3] Stolen Goods & Fencing:** Bandit menjatuhkan loot "Stolen Goods" yang bernilai tinggi namun hanya bisa dijual ke NPC 'Fence' di Tavern (Black Market).
    - **[v15.4] Regional Bandit Signs (Ambiguous Narrative):** Deskripsi dinamis pada wilayah jika `banditThreatLevel` > 0.4.
        - *Contoh Narasi:* 
            - "Pepohonan di sini memiliki sayatan vertikal yang aneh, seolah sengaja dibuat sebagai penanda."
            - "Keheningan di jalur ini terasa tidak alami; burung-burung seolah berhenti berkicau saat kamu lewat."
            - "Sisa-sisa kain kusam yang terikat di dahan pohon berkibar pelan, memberikan kesan wilayah ini telah diklaim."
            - "Bau asap dingin dari api unggun yang dipadamkan tercium samar di balik semak tebal."
            - "Banyak jejak kaki yang mengarah ke dalam kegelapan hutan, tapi tidak ada satu pun yang kembali keluar ke jalan utama."
            - "Ada perasaan bahwa banyak mata sedang mengawasimu dari balik bayang-bayang tebing."
    - **[v15.5] Safe-Passage Scout (Escort System):** NPC pendamping (bukan petarung) yang memberikan imunitas bandit.
        - *Mekanik:* Disewa di Inn berdasarkan jumlah wilayah (misal: 10 grid). Otomatis pergi setelah limit tercapai. Tidak ikut dalam combat mode.

---

## ✨ 18. Elemen Fantasi & Mistis (Saran Fantasi)
Field untuk keajaiban dunia dan kutukan.

- [x] **`sanctuaryPower` (Float):** Keseimbangan energi suci dan kutukan (-1.0 s/d 1.0).
    - *Fungsi:* Menggantikan `isCursed`. Nilai negatif memberikan pinalti regen tapi bonus XP 20%. Nilai positif memberikan buff regenerasi.

---

## 🐗 19. Perburuan & Ekonomi Klasik (Saran Ekonomi)
Field untuk aktivitas petualang tradisional.

- [ ] **`huntingGrade` (Int):** Kualitas hasil buruan (Skala 1-5).
    - *Fungsi:* Menentukan apakah kulit/daging dari hewan di wilayah ini bernilai tinggi.

---


---

## ⛈️ 21. Fenomena Alam & Cuaca (Saran Baru)
Membuat setiap kunjungan terasa berbeda secara visual dan mekanik.

- [ ] **`dynamicWeatherCycle` (Boolean):** Status cuaca dinamis.
    - *Fungsi:* Memungkinkan terjadinya badai, hujan, atau kabut ekstrem yang memberikan debuff akurasi atau bonus elemen tertentu secara temporer.

---

## 👑 22. Apex Predators & Territorial Bosses (Saran Baru)
Tantangan puncak untuk petualang veteran.

- [ ] **`apexPredatorTrigger` (Float):** Ambang batas `ecologicalStress` untuk memicu bos wilayah.
    - *Fungsi:* Jika ekosistem terlalu ditekan (overfarming/overkilling), monster "Alpha" akan muncul untuk "membersihkan" grid dari pemain.

---

## 🌿 23. Ekosistem Lanjutan & Atmosfer (Saran Baru)
Menambah kedalaman mekanik dan atmosfer dunia.

- [ ] **`isHolyGround` (Boolean):** 
    - *Fungsi:* Melarang monster Undead/Demon (termasuk migrasi) dan memberi bonus regen HP bagi unit Light.
- [ ] **`migrationHeat` (Float):** Skala daya tarik migrasi (0.0 - 1.0).
    - *Fungsi:* Jika tinggi, wilayah ini bisa menarik monster dari jarak 2-3 grid sekaligus.
- [ ] **`soilFertility` (Float):** Kesuburan tanah (0.5 - 2.0).
    - *Fungsi:* Mempercepat waktu respawn resource (herbs/ores) hingga 2x lipat.

---

## 🏛️ 24. Peradaban & Sosial (Saran Baru)
Menambah kedalaman interaksi sosial dan struktur kota.

- [ ] **`regionalDialect` (Enum):** COMMON, ANCIENT, TRIBAL, DRACONIC.
    - *Fungsi:* Mempengaruhi keberhasilan persuasi NPC atau kemampuan membaca prasasti Lore di wilayah tersebut. Hero dengan stat `Intelligence` tinggi bisa mempelajarinya.
- [ ] **`isFortified` (Boolean):** Penanda kota berbenteng.
    - *Fungsi:* Jika malam hari (night cycle), gerbang kota ditutup. Pemain yang berada di luar harus membayar suap atau mencari jalan rahasia untuk masuk.
- [ ] **`tradeRouteQuality` (Float):** Kualitas jalanan (0.5 - 1.5).
    - *Fungsi:* Mempengaruhi kecepatan gerak Karavan NPC dan peluang spawn bandit (berkaitan dengan `banditThreatLevel`).

---

## 👻 25. Akulturasi & Mistis (Saran Baru)
Field untuk elemen supranatural yang lebih halus.

- [x] **`spiritDensity` (Float):** Kepadatan roh (0.0 - 1.0).
    - *Fungsi:* Peluang munculnya "Whispering Spirits" yang memberikan quest rahasia atau buff temporer hanya pada malam hari.
- [ ] **`ancientMonolithicPower` (Boolean):** Keberadaan peninggalan megah.
    - *Fungsi:* Wilayah ini memberikan bonus stat permanen (kecil) bagi faksi yang berhasil membangun monumen di grid tersebut.

---

## 📦 26. Logistik & Supply Chain (Saran Baru)
- [ ] **`storageTaxRate` (Float):** Pajak penyimpanan barang (Regional Vault).
    - *Fungsi:* Kota dagang besar mungkin menarik pajak harian untuk barang yang dititipkan di gudang lokal.

---
*Terakhir diupdate: 14 Februari 2026 - Textical Architect Agent*

---

## 💰 Currency System (Deferred - Menunggu GDD Finalization)

- [ ] **Guild Creation** - Biaya 100 Gold
    - *Fungsi:* Pemain bisa membuat guild dengan biaya Gold
- [ ] **Character Revive** - Biaya Silver 1000 atau Gem 1
    - *Fungsi:* Pemain bisa revive karakter yang KO
- [ ] **Inventory Expansion** - Biaya 100 Silver atau 1 Gem per slot
    - *Fungsi:* Menambah kapasitas inventory

---

## ⚔️ 27. Weapon Data & WebDocs (Selesai)
Sistem manajemen data senjata terpusat dengan database Prisma dan viewer interaktif.

- [x] **Database Seeding:** Automasi import data dari `WEAPON_DATA_REFERENCE.md` ke Prisma.
- [x] **Interactive WebDocs:** Viewer database berbasis CodeIgniter 3 dengan fitur Dark Mode.
- [x] **JSON Export Logic:** Jalur ekspor data senjata dari database ke client assets.
- [x] **Stat Integration:** Pemetaan statistik `damage_base`, `defense_base`, dan `attack_ticks`.
- [x] **Visual Identity System:** Dukungan `imageUrl` di database dan interaksi visual di WebDocs.
- [x] **Seeder Refinement:** Perbaikan logika matching untuk tipe senjata dengan spasi (Battle Axe, War Hammer).

---

### 🔄 API Updates & Refactoring
- [x] **UserController Audit Fixes:** Comprehensive security and safety fixes for profile and settings.
- [ ] **Contract Change:** `POST /user/settings` has been moved to `PUT /user/:id/settings`. Client needs update.
