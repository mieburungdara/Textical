# Admin Panel untuk Textical RPG

## Overview
Membuat panel admin berbasis web untuk mengelola database Textical RPG dengan antarmuka yang intuitif dan fitur lengkap. Panel ini akan berjalan di server Node.js yang sudah ada dan menggunakan Prisma ORM untuk akses database.

## Fitur Utama
- ✅ Manajemen Pemain (Users)
- ✅ Manajemen Heroes
- ✅ Manajemen Monster
- ✅ Manajemen Regions
- ✅ Manajemen Items
- ✅ Manajemen Quests
- ✅ Manajemen Skills
- ✅ Manajemen Traits
- ✅ Manajemen Factions
- ✅ Dashboard Statistik

## Arsitektur
Panel admin akan dibangun sebagai aplikasi web modern dengan:
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla atau framework ringkas)
- **Backend**: Express.js middleware dengan Prisma ORM
- **Database**: SQLite (sudah ada)
- **Autentikasi**: Sistem login admin khusus
- **Styling**: Bootstrap 5 untuk desain responsif

## File Structure
```
server/
├── public/
│   ├── admin/
│   │   ├── index.html          # Dashboard utama
│   │   ├── styles.css          # Styling utama
│   │   ├── script.js           # Logika frontend
│   │   └── assets/             # Gambar dan resource
│   └── ...
├── src/
│   ├── controllers/
│   │   └── AdminController.js  # Logic backend admin
│   ├── routes/
│   │   └── adminRoutes.js      # API routes untuk admin
│   ├── middleware/
│   │   └── adminAuth.js        # Middleware autentikasi
│   └── ...
└── ...
```

## Checklist Implementasi

### 1. Setup Dasar
- [ ] Membuat direktori `server/public/admin/` untuk file frontend
- [ ] Membuat `AdminController.js` dengan fungsi CRUD dasar
- [ ] Membuat `adminRoutes.js` dengan rute API
- [ ] Membuat middleware `adminAuth.js` untuk autentikasi
- [ ] Menambahkan rute admin ke `server.js`

### 2. Autentikasi Admin
- [ ] Membuat halaman login admin (`login.html`)
- [ ] Implementasi endpoint `/api/admin/login`
- [ ] Implementasi middleware autentikasi berbasis token
- [ ] Proteksi rute admin dengan middleware

### 3. Dashboard Utama
- [ ] Membuat halaman dashboard (`index.html`)
- [ ] Menampilkan ringkasan statistik database
- [ ] Menambahkan navigasi sidebar
- [ ] Desain responsif dengan Bootstrap

### 4. Manajemen Pemain
- [ ] Halaman daftar pemain (`users.html`)
- [ ] Endpoint API: `GET /api/admin/users`
- [ ] Fitur pencarian dan filter pemain
- [ ] Fitur edit dan hapus pemain
- [ ] Detail profil pemain (heroes, inventory, stats)

### 5. Manajemen Heroes
- [ ] Halaman daftar heroes (`heroes.html`)
- [ ] Endpoint API: `GET /api/admin/heroes`
- [ ] Fitur pencarian dan filter heroes
- [ ] Fitur edit hero (level, stats, traits)
- [ ] Detail hero (equipment, skills, combat class)

### 6. Manajemen Monster
- [ ] Halaman daftar monster (`monsters.html`)
- [ ] Endpoint API: `GET /api/admin/monsters`
- [ ] Fitur pencarian dan filter monster
- [ ] Fitur edit monster (stats, behavior, loot)
- [ ] Detail monster (traits, drops, regions)

### 7. Manajemen Regions
- [ ] Halaman daftar regions (`regions.html`)
- [ ] Endpoint API: `GET /api/admin/regions`
- [ ] Fitur pencarian dan filter regions
- [ ] Fitur edit region (type, level, connections)
- [ ] Detail region (resources, monsters, NPCs)

### 8. Manajemen Items
- [ ] Halaman daftar items (`items.html`)
- [ ] Endpoint API: `GET /api/admin/items`
- [ ] Fitur pencarian dan filter items
- [ ] Fitur edit item (stats, traits, rarity)
- [ ] Detail item (equip slots, recipes, market data)

### 9. Manajemen Quests
- [ ] Halaman daftar quests (`quests.html`)
- [ ] Endpoint API: `GET /api/admin/quests`
- [ ] Fitur pencarian dan filter quests
- [ ] Fitur edit quest (objectives, rewards, requirements)
- [ ] Detail quest (steps, dialogue, events)

### 10. Manajemen Skills & Traits
- [ ] Halaman daftar skills (`skills.html`)
- [ ] Halaman daftar traits (`traits.html`)
- [ ] Endpoints API untuk skills dan traits
- [ ] Fitur CRUD untuk skills dan traits
- [ ] Detail skill/trait (effects, requirements, usage)

### 11. Manajemen Factions
- [ ] Halaman daftar factions (`factions.html`)
- [ ] Endpoint API: `GET /api/admin/factions`
- [ ] Fitur CRUD untuk factions
- [ ] Detail faction (members, territory, reputation)

### 12. Penambahan Fitur Lanjutan
- [ ] Export data ke CSV/JSON
- [ ] Import data dari CSV/JSON
- [ ] Log aktivitas admin
- [ ] Backup dan restore database
- [ ] Notifikasi dan alert

## Progress Log
- 2026-02-05 - Membuat rencana admin panel

## Catatan Penting
- Pastikan untuk melindungi panel admin dengan autentikasi yang kuat
- Batasi akses hanya ke alamat IP tertentu (jika di produksi)
- Tambahkan rate limiting untuk mencegah brute force attacks
- Buat backup database sebelum melakukan perubahan massal
