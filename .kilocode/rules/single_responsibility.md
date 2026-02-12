# Single Responsibility Principle (SRP)

## Core Rule
Setiap modul, class, atau file hanya boleh memiliki **satu tanggung jawab utama**.

## Implementation Rules
- Satu file = satu concern utama
- Hindari class yang menangani: logic + database sekaligus
- Jika sebuah modul memiliki lebih dari satu alasan untuk berubah → pisahkan
- Pisahkan:
  - Business Logic
  - Data Access
  - Presentation
  - Utility

## Refactor Trigger
Jika ditemukan:
- File > 300 baris dengan banyak domain berbeda
- Banyak fungsi tidak saling terkait
- Class dengan > 1 dependency utama

Maka wajib lakukan refactor pemisahan modul.

## Enforcement
Saat membuat atau mengubah kode:
- Evaluasi tanggung jawab modul
- Tolak implementasi yang melanggar SRP
