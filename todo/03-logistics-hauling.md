# 📦 Module 03: Logistics & Hauling (Complete & Explicit Specification)

## 1. Tahap Persiapan dan Penyewaan (NPC Caravan Master)
- **Interaksi NPC**: Pemain harus mendatangi NPC **Caravan Master** di kota untuk memulai proses logistik.
- **Pilihan Gerobak (Wagon Tiers)**: Tersedia empat jenis gerobak dengan kapasitas statis tanpa sistem durability dan tidak membutuhkan reparasi:
    - **Small Cart**: Memiliki kapasitas penyimpanan sebesar **5 Slot**.
    - **Medium Wagon**: Memiliki kapasitas penyimpanan sebesar **10 Slot**.
    - **Large Carriage**: Memiliki kapasitas penyimpanan sebesar **15 Slot**.
    - **Heavy Wagon**: Memiliki kapasitas penyimpanan sebesar **20 Slot**.
- **Logika Muatan**: Tidak ada batasan berat (Weight) karena pembatasan muatan sudah diatur melalui jumlah slot dan sistem `maxStack` bawaan item. Semua jenis barang (Material, Equipment, Consumable, dll) diizinkan untuk masuk ke dalam gerobak.
- **Biaya Sewa (Flat Fee)**: Biaya sewa bersifat flat dan dihitung berdasarkan jumlah region yang akan dilewati dalam rute yang dipilih. Rumusnya adalah `Biaya Dasar Tier x Jumlah Region`. Tidak ada sistem uang jaminan (Deposit/Collateral).
- **Proses Loading Barang**:
    - Setelah menyewa, layar beralih ke UI khusus yang menampilkan Inventory Tas Pemain dan Inventory Gerobak secara berdampingan.
    - Pemain diizinkan memindahkan barang secara langsung dari **Bank Kota (Local Bank)** atau dari **Inventory Pribadi** ke dalam gerobak.
    - **Pembatalan**: Jika pemain menutup UI loading sebelum menekan tombol "Berangkat", semua barang akan otomatis dikembalikan ke asal (Bank/Tas), namun **biaya sewa yang sudah dibayar akan hangus**.

## 2. Pemilihan Jalur dan Transparansi Rute
- **Opsi Rute**: Sistem akan menyajikan beberapa pilihan jalur menuju kota tujuan (misal: Rute Utama, Rute Hutan, Rute Pegunungan) untuk menghindari penghadangan oleh bandit di satu titik.
- **Transparansi Data**: Untuk setiap pilihan rute, pemain akan diperlihatkan detail berikut secara transparan:
    - Daftar seluruh Region yang akan dilewati.
    - **Danger Level** dari masing-masing region tersebut.
    - **Zone Type** (Green, Blue, atau Red) dari masing-masing region tersebut.
- **Penguncian Rute (Locked Path)**: Begitu pemain menekan tombol **"Berangkat"**, rute tersebut terkunci sepenuhnya. Pemain tidak dapat mengubah jalur, tidak dapat membatalkan perjalanan, dan tidak dapat melakukan aksi lain (Auto-Pilot).

## 3. Mekanisme Perjalanan (The Journey)
- **Visualisasi**: UI pemain beralih ke mode World Map. Karakter bergerak secara otomatis antar region sesuai jalur yang telah dipilih. Pemain tidak bisa melakukan apapun, hanya bisa melihat proses berlangsung.
- **Kebijakan Menunggu (Standby Policy)**: Pemain wajib menetap di setiap region selama **60 detik** sebelum otomatis berpindah ke region berikutnya.
- **Progress Bar**: Sebuah progress bar akan muncul di layar untuk menunjukkan sisa waktu tunggu 60 detik tersebut.
- **Pengecekan Ambush (Monster)**:
    - Selama 60 detik tersebut, server melakukan pengecekan pertempuran (roll) setiap **10 detik** (Total 6 kali pengecekan).
    - Peluang ambush monster dihitung berdasarkan `DangerLevel` region (misal: Level 1 = 5% per 10 detik, Level 10 = 50% per 10 detik).
- **Ambush Pemain (PvP)**:
    - Pemain lain yang berada di region yang sama akan mendapatkan pemberitahuan bahwa ada karavan yang melintas.
    - Ikon dan status hauler akan berubah agar mudah diidentifikasi oleh perampok.
- **Keamanan Green Zone**: Jika rute melewati kota (Green Zone), maka wilayah tersebut **100% Aman**. Tidak ada pemeriksaan ambush (Monster/Player) selama 60 detik di zona ini.
- **Pembatasan Aksi (Restrictions)**: Selama status `isHauling` aktif:
    - Tombol **Attack Monster** di World Map dihilangkan.
    - Tombol aksi seperti **Menebang Kayu, Menambang, Memancing, atau Gathering** lainnya dinonaktifkan sepenuhnya.
    - Inventory gerobak terkunci (tidak bisa diambil/diakses).

## 4. Kondisi Pertempuran dan Reset Timer
- **Combat Mode**: Jika ambush terpicu, pemain masuk ke grid pertempuran dan bisa bertarung secara normal menggunakan seluruh skill dan heronya.
- **Reset on Win (Strict Peace Requirement)**: Jika Hauler menang melawan monster atau pemain lain, timer 60 detik di map tersebut **meriset kembali ke nol**. Hauler harus mendapatkan jendela waktu 60 detik kedamaian total tanpa ada gangguan pertempuran untuk bisa pindah ke map berikutnya.

## 5. Konsekuensi Kekalahan dan Penjarahan (Looting)
- **Kalah vs Monster**: Seluruh isi gerobak hancur dan dihapus dari database seketika saat pemain kalah.
- **Kalah vs Player (PvP)**:
    - **Looting Phase**: Pemenang mendapatkan akses satu kali (One-time Access) ke UI jarahan selama maksimal **1 menit**.
    - **Looting UI**: UI jarahan akan menggabungkan isi gerobak dan isi tas korban (untuk memudahkan pemindahan). Jika di Red Zone, equipment korban juga muncul di sini.
    - **Static Wagon**: Pemenang tidak dapat menggerakkan gerobak tersebut. Pemenang harus mengambil barang di lokasi kejadian.
    - **Instant Swap**: Pemenang dapat langsung mengenakan (equip) item jarahan ke unit mereka sendiri saat masih di dalam UI jarahan.
    - **Loot Interruption**: Jika pihak ketiga menyerang pemenang yang sedang menjarah, UI jarahan tertutup paksa dan seluruh isi gerobak/tas korban tersebut **langsung hancur/lenyap**.
    - **Auto-Destruction**: Begitu pemenang menutup UI looting atau waktu 1 menit habis, gerobak dan sisa isinya hancur selamanya.

## 6. Penyelesaian Ekspedisi (Arrival)
- **Automatic Transfer**: Saat karakter berhasil memasuki region kota tujuan, status `isHauling` dicabut secara otomatis.
- **Item Storage**: Semua barang yang tersisa di dalam inventory gerobak akan otomatis dipindahkan ke dalam **Bank Kota (Local Bank)** di kota tujuan tersebut.
- **Cleanup**: Entitas gerobak dihapus dari sistem setelah proses pemindahan barang selesai.