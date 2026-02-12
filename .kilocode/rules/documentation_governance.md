# Documentation First Rule

## Core Rule
Sebelum melakukan implementasi, refactor, atau debugging,
WAJIB membaca dan memahami dokumentasi yang tersedia di:

- /docs/

Dilarang melakukan asumsi tanpa membaca dokumentasi terlebih dahulu.

---

## Mandatory Pre-Action Checklist

Sebelum menulis kode:
- Baca folder docs/
- Cari file .md yang relevan dengan fitur
- Identifikasi:
  - Arsitektur sistem
  - Naming convention
  - Registry / ID range
  - Dependency utama
  - Flow diagram (jika ada)

Jika dokumentasi tidak ditemukan:
- Laporkan sebagai "Documentation Gap"
- Jangan menebak arsitektur

---

## Documentation Scan Procedure

1. Scan folder:
   - docs/
2. Identifikasi kata kunci sesuai task
3. Ringkas pemahaman sistem
4. Baru lakukan implementasi

---

## Refactor Safety Rule

Jika implementasi bertentangan dengan dokumentasi:
- Dokumentasi menjadi sumber kebenaran utama
- Jangan override tanpa laporan perubahan arsitektur

---

## Conflict Handling Rule (MANDATORY)

Jika implementasi bertentangan dengan dokumentasi:

1. HENTIKAN implementasi.
2. Jelaskan konflik yang ditemukan.
3. Mintakan konfirmasi eksplisit kepada pengguna.
4. Tanyakan apakah:
   a) Dokumentasi perlu diperbarui
   b) Implementasi harus disesuaikan
5. Jangan lanjut sebelum ada keputusan.

---

## After User Confirmation

Jika pengguna memutuskan:
- 📘 Update dokumentasi → WAJIB:
  - Edit file .md terkait
  - Tambahkan catatan perubahan
  - Update CHANGELOG.md
  - Kirim laporan perubahan dokumentasi

- 🛠️ Ikuti dokumentasi → WAJIB:
  - Sesuaikan implementasi
  - Jelaskan perubahan yang dilakukan

---

## Enforcement

Dilarang:
- Mengabaikan konflik dokumentasi
- Mengubah dokumentasi tanpa konfirmasi
- Melanjutkan implementasi tanpa keputusan

---

## Enforcement

Jika dokumentasi tidak dibaca:
- Task dianggap INVALID
- Laporan wajib menyertakan section:
  "Documentation References Used:"
  - <file1.md>
  - <file2.md>
