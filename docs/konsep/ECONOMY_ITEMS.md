# Konsep Ekonomi & Items (Online & Authoritative)

## 1. Sistem Material (Stones)
- [x] **Database Item Terpusat**: Semua data batu disimpan dalam satu file JSON (`stones.json`) di server.
- [x] **Sistem Rarity**: Klasifikasi Common hingga Legendary yang memengaruhi harga dan kekuatan.
- [ ] **Crafting Material**: Stones digunakan sebagai bahan baku utama untuk menempa equipment baru di Blacksmith.
- [ ] **Equipment Refinement**: Menggunakan "Refining Stones" untuk menaikkan level item (+1, +2, dst). Server menentukan peluang keberhasilan.
- [ ] **Disassembling**: Menghancurkan equipment lama untuk mendapatkan kembali sebagian Stones.

## 2. Sistem Penguat (Crystals)
- [ ] **Socketing System**: 
    - Crystals dimasukkan ke dalam slot (Socket) pada equipment.
    - Memberikan bonus Stat Decorator yang spesifik (misal: +15% Crit Chance, +10 Fire Damage).
- [ ] **Crystal Quality**: Crystals memiliki kualitas (Rough, Clear, Flawless) yang memengaruhi besaran bonus.
- [ ] **Unsocketing**: Melepaskan Crystal dari slot membutuhkan biaya Gold agar ekonomi server tetap seimbang.
- [ ] **Elemental Crystals**: Khusus untuk memberikan elemen pada serangan pahlawan.

## 3. Toko & Perdagangan (Marketplace)
- [x] **Local Shop**: Toko di setiap Region menjual barang unik berdasarkan biome.
- [x] **Authoritative Purchase**: Validasi emas dan stok barang dilakukan 100% di server Node.js.
- [ ] **Auction House (P2P)**: Pemain bisa menjual ItemInstance (Equipment/Crystals) ke pemain lain via Broker Server.

## 4. Inventaris & Management
- [x] **Unique Instance ID (UID)**: Setiap item di tas pemain adalah ItemInstance yang unik.
- [x] **Stat Decorator Pattern**: Perhitungan stat otomatis oleh StatProcessor.js.
- [x] **Remote Asset Integration**: Icon dan data ditarik dinamis dari folder server.
- [ ] **Filter & Sorting**: Fitur untuk mengurutkan item berdasarkan Rarity atau Tipe (Stones vs Crystals).

## 5. Keamanan & Integritas Data
- [x] **Server-Side Validation**: Semua transaksi divalidasi oleh server.
- [x] **Deep Save System**: Menyimpan hubungan UID antara pahlawan, perlengkapan, dan Crystals yang terpasang.
