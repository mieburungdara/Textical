# DRY (Don't Repeat Yourself)

## Core Rule
Setiap logika, konfigurasi, atau struktur yang sama hanya boleh ditulis **satu kali**.
Duplikasi kode WAJIB dihindari.

## Implementation Rules
- Jangan copy-paste logic antar file
- Gunakan:
  - Function reusable
  - Helper / Utility module
  - Shared service
  - Config file terpusat
- Gunakan constant untuk nilai berulang (hindari magic number/string)
- Jika 2 blok kode >80% mirip → wajib abstraksi

## Refactor Trigger
Jika ditemukan:
- Copy-paste dengan perubahan kecil
- Validasi/formula sama di lebih dari 1 tempat
- Query database identik di banyak file
- Struktur response API berulang

Maka wajib refactor menjadi:
- Function reusable
- Base class
- Generic function
- Middleware / shared module

## Enforcement Checklist
Sebelum commit:
- Apakah ada logika serupa di file lain?
- Apakah bisa dijadikan helper?
- Apakah config sudah dipusatkan?
Jika YA → refactor dulu.
