# Konsep Keamanan & Fair Play

## 1. Authoritative Server (Otak Terpusat)
- [x] **Logic Sovereignty**: Semua keputusan (Damage, Pergerakan, Loot) ditentukan di server Node.js. Client hanya sebagai "Layar Monitor".
- [x] **Stat Validation**: Server menghitung ulang Stat Pahlawan dari nol menggunakan data sah di server (StatProcessor.js). Client tidak bisa mengirimkan stat palsu.
- [ ] **Combat Re-simulation**: (Opsi Lanjut) Server bisa menyimpan rekaman input pemain dan memutarnya ulang untuk memverifikasi keabsahan pertarungan yang mencurigakan.

## 2. Integritas Paket Data (Anti-Tampering)
- [ ] **Verification Hashing**: Setiap pesan WebSocket dibungkus dengan Hash (seperti HMAC) menggunakan kunci rahasia. Jika hacker mencoba mengubah jumlah Gold di tengah jalan, hash tidak akan cocok dan paket ditolak.
- [ ] **Sequence Numbering**: Setiap paket data diberi nomor urut. Ini mencegah serangan *Replay Attack* (mengirim paket "Beli Barang" yang sama berulang-ulang secara ilegal).

## 3. Sistem Akun & Persistensi
- [ ] **Secure Login**: Menggunakan Token (JWT - JSON Web Token) untuk otentikasi. Pemain tidak perlu mengirim password setiap kali melakukan aksi.
- [ ] **Device Binding**: (Opsional) Mengikat akun ke ID unik perangkat untuk mencegah satu orang menggunakan ribuan akun bot.
- [x] **Deep Save integrity**: Menggunakan Unique IDs (UID) untuk setiap item (ItemInstance). Jika ada dua item dengan UID yang sama di server, sistem akan mendeteksi sebagai hasil penggandaan (*Duplication Glitch*).

## 4. Perlindungan dari Bot & Otomasi Ilegal
- [ ] **Rate Limiting**: Server membatasi jumlah permintaan per detik. Jika pemain mengirim perintah "Attack" 100x dalam 1 detik, server akan memblokir koneksi tersebut.
- [ ] **Behavioral Analysis**: Server memantau pola pergerakan pahlawan di World Map. Gerakan yang terlalu presisi dan berulang terus-menerus selama 24 jam akan ditandai sebagai Bot.

## 5. Ekonomi & Anti-Cheat Marketplace
- [ ] **Escrow System**: Saat transaksi di Auction House, barang dan Gold ditahan oleh server hingga kedua belah pihak valid.
- [ ] **Inflation Monitoring**: Server memantau total sirkulasi Gold global. Jika ada lonjakan Gold yang tidak wajar pada akun tertentu, admin akan mendapatkan notifikasi otomatis.

## 6. Pengembangan (DevSecOps)
- [x] **Hidden Secrets**: Kunci API dan rahasia database tidak disimpan di GitHub (menggunakan `.env`).
- [ ] **Headless Hardening**: Server dijalankan di lingkungan Linux yang terisolasi dengan akses port yang sangat terbatas.
