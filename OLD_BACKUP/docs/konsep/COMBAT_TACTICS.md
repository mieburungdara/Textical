# Konsep Pertempuran & Taktik

## 1. Core Engine (Authoritative)
- [x] Simulasi pertarungan 100% di server (Node.js).
- [x] Client hanya sebagai visualizer hasil simulasi.
- [x] Anti-cheat stat pahlawan (Server-side calculation).
- [x] Dying Breath: Kesempatan menyerang terakhir sebelum mati.
- [x] Simultaneous Tick: Pemrosesan aksi secara berkelompok dalam satu detik simulasi.

## 2. Grid & Posisi
- [x] Grid masif 5x10 (Mendukung 50 unit).
- [x] Fitur Drag & Swap pahlawan di grid secara permanen.
- [x] Penamaan kolom strategis (Backline, Mid, Frontline).
- [x] Obstacle Grid: Penanganan unit sebagai rintangan dinamis.
- [ ] **Flee Grid (Zona Kabur)**: Kolom paling belakang yang berfungsi sebagai pintu keluar. Unit yang menyentuh zona ini akan selamat dan keluar dari pertempuran yang sedang berlangsung.

## 3. Kecerdasan Buatan (AI)
- [x] Pathfinding cerdas menggunakan EasyStar.js (A*).
- [x] Tactical AI: Archer menjaga jarak, pahlawan sekarat mencoba kabur (Flee).
- [x] Target Priority: Sistem prioritas (Closest, Furthest, Lowest HP, Highest HP).
- [ ] **AI Archetypes**: Memilih kepribadian unit (Agresif, Defensif, Healer-first) sebelum bertarung.

## 4. Efek Medan (Terrain)
- [x] Biaya gerak berbeda (Lumpur: 3x, Salju: 2x).
- [x] Bahaya medan (Lava: Burn damage per langkah).
- [x] Bonus pertahanan di Hutan (+20% Evasion).
- [x] Bonus serangan di High Ground / Reruntuhan (+15% Damage).
- [x] Efek Air: Mengurangi damage elemen Api sebesar 30%.

## 5. Sistem Sinergi Otomatis (Passive Buffs)
- [ ] **Elemental Resonance**: Jika 3 pahlawan dengan elemen yang sama berada berdekatan, memicu aura otomatis (Fire = +Atk, Water = +Regen).
- [ ] **Formation Synergy**: Bonus stat berdasarkan bentuk formasi (misal: membentuk garis lurus Frontline memberikan +Defense).
- [ ] **Combo Chain**: Jika dua unit menyerang target yang sama dalam tick yang sama secara otomatis, damage meningkat.

## 6. Protokol Taktis (Pre-Battle Settings)
- [ ] **Tactical Presets**: Pemain mengatur instruksi "Jika-Maka" sebelum pertarungan dimulai.
    - *Contoh*: "Jika Mana > 80% -> Gunakan Skill AoE".
    - *Contoh*: "Jika HP Teman < 50% -> Prioritaskan Healing".
- [ ] **Unit Behavior Toggle**: Mengatur apakah unit diizinkan untuk kabur (Flee) atau harus bertarung sampai mati.

## 7. Skalabilitas & Performa
- [x] Modular Logic: Pemisahan Grid, AI, Rules, dan Logger.
- [x] JSDoc Documentation: Definisi tipe data yang jelas di server.
- [ ] **Auto-Skip**: Fitur untuk langsung melihat hasil akhir jika pemain tidak ingin menonton visualisasi.
- [ ] **Flow Fields**: Navigasi massal untuk mengelola ratusan unit tanpa membebani CPU server.
