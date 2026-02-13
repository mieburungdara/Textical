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

## � Refinement Granularitas Ras (Lore Accuracy)
- [x] Pembaruan Skema Database (Evolusi `UnitRace`: +Vampire, Skeleton, Zombie)
- [x] Pemetaan Ulang `dominanCaste` di `mapSeeder.js`
- [x] Verifikasi Final Lore Seeding
## 🛡️ 3. Akses & Keamanan (Selesai)
Aturan yang membatasi pergerakan pemain berdasarkan kemajuan mereka.

- [x] **`requiredLevel` (Int):** Level minimum untuk melintasi wilayah tanpa pinalti.
- [x] **`minRequiredUnits` (Int):** Jumlah minimal unit party untuk bisa memasuki wilayah berbahaya (misal: Raid Zone butuh 5+ unit).
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
- [ ] **`guildOwnershipId` (Int):** ID Guild yang menguasai wilayah.
    - *Fungsi:* Mengizinkan Guild untuk menarik pajak tambahan atau memberikan akses khusus.
- [ ] **`taxDistributionRate` (Float):** Rasio pembagian pajak antara Guild penguasa dan Faksi Kerajaan.

### 🔍 Eksplorasi Lanjut
- [ ] **`hiddenTreasureChance` (Float):** Peluang munculnya "Hidden Nodes" yang tidak terlihat di Map standar.
    - *Fungsi:* Memberikan nilai lebih bagi pemain yang rajin menjelajah setiap grid secara manual.
- [ ] **`archaeologicalSite` (Boolean):** Menandakan adanya situs sejarah.
    - *Fungsi:* Digunakan untuk quest pencarian Artifact kuno.


---

## 💡 7. Saran Sederhana & Taktis (Masuk Akal)
Daftar field yang ringan namun memberikan dampak langsung pada kenyamanan bermain (QoL).

- [ ] **`isPvpAllowed` (Boolean):** Memberikan izin PvP spesifik di luar *Safe Zone*.
    - *Fungsi:* Membuat wilayah "Arena" atau "Conflict Zone" di tengah wilayah yang seharusnya aman.
- [ ] **`gatheringNodeCount` (Int):** Kepadatan titik sumber daya.
    - *Fungsi:* Menentukan seberapa banyak batu/pohon yang bisa dipanen di grid ini secara visual.
- [ ] **`dangerLevel` (Int):** Skala 1-5 (Very Low to Extreme).
    - *Fungsi:* Indikator visual instan di UI pemain untuk mengukur risiko wilayah tanpa melihat level monster secara detail.
- [ ] **`hasInn` (Boolean):** Status fasilitas istirahat.
    - *Fungsi:* Memberitahu pemain apakah mereka bisa memulihkan HP/Vitalitas di grid ini (berkaitan dengan `innRecoveryRate`).
- [ ] **`regionCategory` (String):** Label sub-bioma (misal: "Swamp", "Highland", "Holy Place").
    - *Fungsi:* Mempermudah sistem filter pencarian di World Atlas dan memberikan variasi nama wilayah.
- [ ] **`weatherProbability` (Float):** Peluang terjadinya perubahan cuaca (Hujan, Badai, Cerah).
    - *Fungsi:* Memberikan variasi atmosferik otomatis di level grid.

---

## 🌿 8. Ekologi & Flora-Fauna (Saran)
Terkait siklus hidup makhluk hidup dan sumber daya alam.

- [ ] **`monsterMigrationStatus` (Boolean):** Status migrasi monster.
    - *Fungsi:* Jika *true*, monster dari wilayah tetangga bisa muncul di sini (monster luar habitat).
- [ ] **`rareHerbSpawnChance` (Float):** Peluang munculnya tanaman herbal langka.
    - *Fungsi:* Menentukan apakah grid ini layak menjadi lokasi "Gathering Trip" bagi pengolah ramuan.

---

## 🏮 9. Sosial & Interaksi NPC (Saran)
Membuat wilayah terasa dihuni oleh masyarakat.

- [ ] **`localRumorId` (String):** ID rumor atau berita lokal (misal: "Isu naga di utara").
    - *Fungsi:* Memberikan petunjuk quest atau lore dinamis kepada pemain yang bertanya pada NPC di sini.

---

## ✨ 10. Magis & Spiritual (Saran)
Elemen supranatural yang mempengaruhi hero dan kemampuan sihir.

- [ ] **`manaStaticIntensity` (Float):** Intensitas energi mana di udara.
    - *Fungsi:* Mempengaruhi kecepatan regenerasi Mana hero atau kekuatan skill sihir (misal: di *Ley Line* sihir lebih kuat).

---

## 🏰 11. Properti & Guild (Saran)
Terkait kepemilikan pemain dan ekonomi skala besar.

- [ ] **`plotAvailability` (Int):** Jumlah tanah kosong yang bisa dibeli pemain untuk rumah.
    - *Fungsi:* Memungkinkan sistem *Housing* regional.
- [ ] **`rentCostMultiplier` (Float):** Pengali biaya sewa toko atau gudang di wilayah tersebut.
- [ ] **`guildBonusType` (String):** Bonus khusus bagi anggota Guild penguasa (misal: "Reduced Tax", "Extra Defense").

---

## ⏳ 12. Temporal & Event (Saran)
Fitur yang membuat wilayah berubah seiring waktu atau kejadian khusus.

- [ ] **`ongoingEventId` (String):** ID event yang sedang berlangsung (misal: "Festival Panen", "Invasi Monster").
    - *Fungsi:* Mengubah visual dan mekanik wilayah secara temporer tanpa merubah data dasar.

---

## 📺 13. Visual & Atmosfer (Saran Lanjut)
Pengaturan grafis spesifik untuk Godot Client.

- [ ] **`skyboxOverride` (String):** Mengganti langit standar (misal: Langit ungu di zona Abyss).
- [ ] **`particleEffectPack` (String):** Paket partikel (misal: Daun jatuh, kunang-kunang, debu mengambang).
- [ ] **`fogDensity` (Float):** Ketebalan kabut visual untuk kedalaman atmosfer.

---

## 🎮 14. Mekanik Gameplay Tambahan (Saran Baru)
Field sederhana untuk variasi interaksi.

- [ ] **`isMarketDay` (Boolean):** Status hari pasar.
    - *Fungsi:* Memberikan diskon atau stok item langka di wilayah tersebut secara berkala.
- [ ] **`gatheringStaminaCost` (Float):** Pengali biaya stamina saat memanen di grid ini.
    - *Fungsi:* Medan yang sulit (pegunungan) lebih melelahkan daripada padang rumput.
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
- [ ] **`banditThreatLevel` (Float):** Peluang terjadinya penghadangan (Ambush) oleh bandit di jalan setapak.
    - *Fungsi:* Memberikan risiko tambahan pada rute dagang yang sepi.

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
*Terakhir diupdate: 14 Februari 2026 - Textical Architect Agent*
