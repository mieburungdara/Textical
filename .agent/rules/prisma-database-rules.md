---
trigger: always_on
---

# Prisma Database Development Rules

## Core Rules

### 1. Always Use `migrate dev`
- **WAJIB** menggunakan `npx prisma migrate dev` untuk semua perubahan schema database
- **LARANG** menggunakan `db push` karena tidak membuat histori migration dan menyebabkan drift
- Setiap perubahan schema **WAJIB** dibuat migration dengan nama deskriptif

### 2. Migration File Integrity
- **LARANG** menghapus atau memodifikasi folder `migrations` yang sudah ada
- Melanggar aturan ini akan merusak integritas database dan menyulitkan rollback
- Semua file migration **WAJIB** di-commit ke version control

### 3. Team Synchronization
- Tim harus sync state database yang sama melalui migration files
- Jangan pernah bekerja langsung di database tanpa migration
- Setiap developer wajib menjalankan `migrate dev` atau `migrate deploy` setelah pull

### 4. Seed Data Management
- Untuk populating data awal, gunakan seed script
- Jalankan dengan: `npx prisma db seed` atau custom script
- **LARANG** input data manual langsung ke database
- Seed harus reproducible dan terdokumentasi

---

## Prisma v7 Specific

### Configuration
- Database URL tidak lagi didukung di `schema.prisma`
- Buat `prisma.config.ts` di root project dengan:
  ```typescript
  import "dotenv/config";
  import { defineConfig } from "prisma/config";
  
  export default defineConfig({
    datasource: {
      url: process.env.DATABASE_URL!,
    },
  });
  ```
- **WAJIB** import `"dotenv/config"` di baris pertama

### Environment Variables
- Selalu gunakan file `.env` untuk DATABASE_URL
- **JANGAN** gunakan `set DATABASE_URL=...` di CLI (tidak reliably berfungsi dengan Prisma v7)
- Pastikan `.env` ada di root project

---

## Troubleshooting

### Drift Detection
Jika terjadi drift (database tidak sinkron dengan migration):
1. **Dev Environment:** `npx prisma migrate reset` (data akan hilang)
2. **Production:** Resolve drift dengan strategi khusus, jangan reset

### Best Practices
- Version control migrations
- Selalu buat migration untuk setiap perubahan schema
- Test migration di environment development dulu
- Backup database sebelum reset di production
