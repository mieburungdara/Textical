# Telegram Reporting Rule

## Core Rule
Setiap laporan hasil pekerjaan WAJIB dikirim ke Telegram menggunakan:
.kilocode/notify.js

Eksekusi harus melalui Git Bash dengan:
node .kilocode/notify.js "<REPORT_CONTENT_JSON>"

Tidak boleh:
- Print laporan saja ke console
- Menyimpan laporan sebagai file lokal
- Mengubah struktur template laporan

---

## Report Trigger
Laporan WAJIB dikirim ketika:
- Task selesai
- Refactor besar selesai
- Error fatal terjadi
- Build / test selesai
- Perubahan arsitektur
- Perubahan registry / ID range

---

## Report Format (WAJIB HTML TEMPLATE)

Format laporan HARUS menggunakan struktur berikut dan tidak boleh diubah:

✦ 🏆 <b><Feature Name>: FULLY OPERATIONAL</b>

💬 <b>Permintaan/Pertanyaan:</b>
<Original request as understood>

🛠️ <b>Jawaban/Implementasi:</b>
<Technical overview>

📜 <b>World Lore:</b>
<Tulis narasi panjang di sini. Mulailah dengan latar belakang dunia yang sedang mengalami krisis atau kebutuhan, lalu jelaskan bagaimana fitur/debug ini muncul sebagai manifestasi kekuatan atau teknologi baru. Gunakan kata-kata yang imersif dan puitis. Narasi harus sesuai dengan game yg sedang kita buat ini.>

🌟 <b>Milestones Reached:</b>
- <Milestone 1>
- <Milestone 2>
- <Sub-task>
- <Validation>

📊 <b>Technical Details:</b>
- <b>Files:</b> <Number> New Scripts, <Number> Modified
- <b>Registry:</b> <New ID Ranges used>
- <b>Audit:</b> PASS / WARNING / FAIL

⚠️ <b>Risk Assessment (Keamanan & Risiko):</b>
- <b>Known Issues:</b> <List>
- <b>Security Protocol:</b> LOW / MEDIUM / HIGH

💬 <b>Quote of the Build:</b>
<i><Dev memo></i>

🔗 <b>System Impact:</b>
<Integration impact>

💡 <b>Architect's Insight:</b>
<Technical pro-tip>

🚀 <b>Next Up:</b>
<Next feature>

---

## Report Validation Rules

Sebelum dikirim:
- Semua section wajib terisi
- Gunakan tag HTML <b> dan <i> saja
- Gunakan parse_mode=HTML
- Maksimal 4096 karakter per message
- Jika gagal kirim → retry minimal 1x
- Jika masih gagal → exit dengan error code ≠ 0

---

## Enforcement

Jika laporan tidak dikirim:
- Task dianggap BELUM SELESAI
- Proses dianggap GAGAL
- Wajib kirim ulang sebelum lanjut task berikutnya
