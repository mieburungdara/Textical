# Konsep Sistem Petualangan: Textical Tactical Idle RPG

## 1. Siklus Inti Permainan (Core Loop)
**Persiapan (Kota/Desa)** -> **Pemilihan Wilayah (Peta)** -> **Ekspedisi (Grinding/Loop)** -> **Pertempuran (Auto-Battle)** -> **Evaluasi & Upgrade (Loot/Gold)** -> kembali ke Persiapan.

---

## 2. Sistem Peta & Pergerakan
*   **Party Avatar:** Di peta, hanya ada 1 unit visual yang mewakili seluruh rombongan (hingga 20 hero).
*   **Grid Exploration:** Peta dibagi menjadi grid (misal 10x10 atau 50x50).
*   **Fog of War:** Area yang belum dilewati akan tertutup kabut.
*   **Movement Cost:** Setiap langkah di peta mengonsumsi "Stamina" atau "Supplies". Jika habis, stat unit berkurang drastis (lapar).

---

## 3. Jenis Lokasi & Biome (Variasi Agar Tidak Bosan)

### A. Safe Zones (Tempat Istirahat & Belanja)
1.  **Desa (Village):** Tempat awal. Toko murah, quest sederhana, pemulihan HP dasar.
2.  **Kota Besar (Town):** Blacksmith canggih, Guild untuk merekrut hero baru, Alchemist untuk potion mana.
3.  **Pelabuhan (Port):** Akses ke biome pulau, perdagangan item langka dari seberang lautan.

### B. Grinding Zones (Tempat Berpetualang)
1.  **Hutan (Forest):** Banyak monster tipe binatang. Drop: Kulit, daging, herbal.
2.  **Reruntuhan (Ruins):** Monster tipe Undead/Golem. Drop: Batu permata, artifak kuno.
3.  **Dungeon (Gua/Menara):** Terdiri dari banyak lantai. Semakin dalam, semakin sulit. Boss di lantai terakhir.
4.  **Biome Ekstrim:**
    *   **Gurun (Desert):** Efek "Heat" (HP berkurang setiap beberapa langkah).
    *   **Salju (Tundra):** Efek "Frost" (Speed unit berkurang 20% di peta).
    *   **Gunung Berapi (Volcano):** Damage api bertambah, resistensi fisik musuh tinggi.

---

## 4. Mekanisme "Adventure Loop" (Grinding)
Pemain bisa mengatur strategi grinding:
*   **Normal Mode:** Eksplorasi manual mencari rahasia.
*   **Loop Mode:** Party akan berjalan otomatis di area tertentu (misal: "Hutan Lantai 1") berputar-putar sampai tas penuh atau HP kritis.
*   **Offline Progress:** Saat game ditutup, party tetap "simulasi" grinding berdasarkan tingkat kesulitan map dan stat party.

---

## 5. Sistem Event di Peta
Saat party avatar bergerak, akan muncul event acak:
*   **Battle Event (60%):** Transisi ke sistem grid combat yang kita buat.
*   **Treasure Find (15%):** Menemukan peti berisi Gold atau Equipment.
*   **Shrine/Blessing (10%):** Buff sementara (misal: +20% Speed selama 50 langkah).
*   **Ambush (5%):** Musuh menyerang duluan, posisi party di grid combat akan acak (berantakan).
*   **Merchant Traveler (10%):** Bertemu pedagang di tengah jalan yang menjual barang langka.

---

## 6. Ekonomi & Progresi
*   **Gold Dasar:** Didapat dari membunuh monster kecil (grinding).
*   **Materials:** Didapat dari biome tertentu untuk *Crafting* (menambah umur permainan).
*   **Equipment Tiers:** Common -> Rare -> Epic -> Legendary.
*   **Town Upgrading:** Pemain bisa menggunakan Gold untuk membangun fasilitas desa agar harga barang lebih murah atau recruitment hero lebih berkualitas.

---

## 7. Pengelolaan Party Besar (20 Unit)
Karena party sangat besar, di layar petualangan pemain bisa mengatur:
*   **Vanguard (Barisan Depan):** Unit yang menerima event ambush pertama kali.
*   **Support Group:** Unit yang tidak ikut bertarung langsung tapi memberikan buff (misal: Chef memasak untuk hemat Stamina, Scholar menambah EXP).
