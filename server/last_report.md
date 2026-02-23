✦ 🛠️ <b>Server Login & Stability Fix: Completed</b>

💬 <b>Request/Question:</b>
Pengguna mengalami kegagalan login ("Invalid username or password") meskipun menggunakan kredensial yang benar, serta adanya indikasi server crash di background.

🛠/Implementation:Implementation:</b>
- <b>Database Schema Fix:</b> Mengubah <code>Hero.userId</code> menjadi opsional di Prisma schema untuk mendukung mercenary/system units tanpa owner.
- <b>TavernService Bugfix:</b> Memperbaiki <code>prisma.hero.create</code> yang menyebabkan crash berkala pada heartbeat server karena argumen relasi yang hilang dan ID class yang tidak valid.
- <b>Authentication Audit:</b> Menambahkan logging granular (U/P tags) untuk membedakan <i>User Not Found</i> dan <i>Invalid Password</i>.
- <b>Client Robustness:</b> Memperbaiki ekstraksi data user di <code>AuthHandler.gd</code> dan menambahkan penanganan diskoneksi pada <code>SocketHandler.gd</code>.
- <b>Rate Limit Reset:</b> Membersihkan lockout untuk 'player1' dan localhost agar pengujian bisa berlanjut.

📜 <b>World Lore:</b>
Kekacauan di jaringan Tavern akhirnya mereda setelah para teknisi sihir agung menyeimbangkan kembali aliran energi jiwa dalam artefak Hero. Sebelumnya, jiwa-jiwa mercenari yang tak bertuan menyebabkan distorsi pada "Living Tavern", membuat gerbang utama (Login Port) menjadi tidak stabil bagi para pengembara yang ingin memasuki dunia Textical.

Kini, dengan segel yang telah diperbarui, para pahlawan dapat kembali melintasi gerbang tanpa hambatan. Bayang-bayang kegagalan koneksi telah diusir oleh cahaya optimasi, memastikan setiap kontrak yang ditandatangani di Tavern tercatat dengan sempurna dalam buku besar takdir.

🌟 <b>Milestones Reached:</b>
- [x] Prisma Migration: optional_user_id_hero_v2
- [x] Fixed TavernService heartbeat crash
- [x] Reset Auth Rate Limits for player1 & localhost
- [x] Validated Bcrypt comparison logic
- [x] Improved Godot Auth logging & socket error handling
- [x] Server restarted and verified on port 5000

📊 <b>Technical Details:</b>
- <b>Files:</b> 1 Schema Modified, 2 Service Scripts Updated, 2 Client Scripts Polished
- <b>Database Changes:</b> Hero.userId is now Int?
- <b>API Endpoints:</b> /auth/login (improved logging)
- <b>Audit:</b> SUCCESS - Server heartbeat clean

⚠️ <b>Risk Assessment (Security & Risks):</b>
- <b>Data Integrity:</b> Hero tanpa owner sekarang legal di sistem, tidak ada risiko orphan records.
- <b>Security Protocol:</b> Rate limit tetap aktif namun dibersihkan untuk sesi ini.

🧠 <b>Dependency Graph:</b>
- Depends on: Prisma Client v6.4.1
- Affects: Tavern recruitment flow, Hero creation logic, Socket authentication

🎮 <b>Gameplay Impact:</b>
- Player Behavior Shift: Login menjadi lebih stabil, interaksi Tavern tidak lagi menyebabkan server lag/crash.

🧩 <b>Player Psychology Mapping:</b>
- Dopamine Trigger: Memastikan transisi dari Login Screen ke Game World terasa mulus tanpa hambatan teknis.

🔄 <b>Core Gameplay Loop:</b>
- Input Action: Masuk ke game (Login)
- Loop Duration: < 500ms (Auth response time)

💬 <b>Quote of the Build:</b>
<i>"A hero without a master is still a hero, but a server without a fix is just a headache."</i>

🚀 <b>Next Up:</b>
- Verifikasi fitur rekrutmen mercenary di Tavern UI.
- Implementasi sistem party synergy berdasarkan Hero Bond yang baru direferensikan.
- Monitoring performa query Hero yang kini memiliki status 'Wild'.

💡 <b>Architect's Insight:</b>
Selalu gunakan pola <code>connect</code> untuk relasi di Prisma jika ID class atau referensi lainnya bersifat statis/hardcoded, untuk menghindari ambiguitas pada <i>Unchecked Create</i>.
