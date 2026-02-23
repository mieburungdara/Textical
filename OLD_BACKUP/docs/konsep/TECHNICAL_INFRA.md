# Konsep Infrastruktur Teknik

## 1. Networking (Client-Server)
- [x] Node.js Server menggunakan WebSockets (ws).
- [x] Full JSON Synchronization untuk data pahlawan & item.
- [x] Cross-Language support (GDScript <-> JavaScript).
- [ ] Load Balancing: Mendukung ribuan pertarungan simultan.

## 2. Keamanan & Persistence
- [x] Deep Save System: Menyimpan pahlawan lengkap dengan UID perlengkapannya.
- [x] Stat Processor di server sebagai validator Anti-Cheat.
- [ ] Online Database: Migrasi dari file JSON lokal ke PostgreSQL/Supabase.
- [ ] Account System: Login menggunakan Email/ID unik.

## 3. Pengembangan (DevOps)
- [x] Modular Logic menggunakan pola Komposisi.
- [x] JSDoc untuk dokumentasi tipe data di server.
- [x] GitHub Repository sebagai pusat sinkronisasi.
- [ ] Headless Export: Skrip untuk deploy server ke VPS Linux.
