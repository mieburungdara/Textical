# 🚨 MANDATORY ENFORCEMENT 🚨

⚠️ **ATURAN INI WAJIB DITAATI - TIDAK ADA PENGECUALIAN**

## Kewajiban Mutlak
- AI **WAJIB** mengeksekusi notify script SETELAH `attempt_completion`
- **TIDAK BOLEH** hanya print ke console tanpa menjalankan script
- **TIDAK BOLEH** lanjut ke task berikutnya sebelum script berhasil dieksekusi
- GAGAL menjalankan notify = task **TIDAK SELESAI**

## Penalty
- Task dianggap **BELUM SELESAI** jika report tidak dikirim
- Proses dianggap **GAGAL** jika tidak ada konfirmasi berhasil
- Wajib kirim ulang sebelum lanjut task berikutnya

---

# Telegram Reporting Rule

## Core Rule
Setiap laporan hasil pekerjaan WAJIB dikirim ke Telegram menggunakan:
.kilocode/notify.js

Eksekusi harus melalui Git Bash dengan:
node .kilocode/notify.js last_report.md

**Larangan:**
- Dilarang hanya print ke console tanpa menjalankan script notify.
- Dilarang lanjut ke task berikutnya sebelum script notify berhasil dieksekusi.

---

## Report Trigger
Laporan WAJIB dikirim ketika (tanpa kecuali):
- Task selesai
- Task Completed
- Refactor besar selesai
- Error fatal terjadi
- Build / test selesai
- Perubahan arsitektur
- Perubahan registry / ID range

---

## Report Format (WAJIB HTML TEMPLATE)

Format laporan HARUS menggunakan struktur berikut dan tidak boleh diubah:

**Protokol Notifikasi Telegram**: Setiap kali saya menyelesaikan tugas signifikan atau fitur baru, saya HARUS SELALU menyampaikan laporan ke Telegram menggunakan `.kilocode/notify.js` (melalui input file UTF-8) FORMAT WAJIB:

    ```
    ✦ <Emoji>> <b><Feature Name>: <status: Draft / In Dev / Testing / Completed / Deprecated></b>

    💬 <b>Permintaan/Pertanyaan:</b>
    <Original request as understood by the AI>

    🛠️ <b>Jawaban/Implementasi:</b>
    <Technical overview of the solution>

    📜 <b>World Lore:</b>
    [Tulis narasi panjang di sini. Mulailah dengan latar belakang dunia yang sedang mengalami krisis atau kebutuhan, lalu jelaskan bagaimana fitur/debug ini muncul sebagai manifestasi kekuatan atau teknologi baru. Gunakan kata-kata yang imersif dan puitis sesuai dengan game yg sedang kita buat ini. buat hingga memiliki 2 paragraf panjang.]

    🌟 <b>Milestones Reached:</b>
    <Detailed bulleted list of ALL significant milestones and sub-tasks completed>

    📊 <b>Technical Details:</b>
    - <b>Files:</b> <Number> New Scripts, <Number> Modified
    - <b>Registry:</b> <New ID Ranges used>
    - <b>Audit:</b> <Final Audit Result>

    ⚠️ <b>Risk Assessment (Keamanan & Risiko):</b>
    - <b>Known Issues:</b> <List any known issues or bugs>
    - <b>Security Protocol:</b> <Security level and notes>

    🧪 <b>Testing Coverage:</b>
    - Unit Tests: <% coverage atau jumlah test case>
    - Integration Tests: <Sistem mana saja yang diuji bersama>
    - Edge Case Validated: <List edge case penting>
    - Multiplayer Sync Verified: <Status sinkronisasi client-server>

    🧠 <b>Dependency Graph:</b>
    - Depends on: <Sistem yang menjadi prasyarat>
    - Affects: <Sistem yang terdampak langsung>
    - Future Hook Points: <Ekstensi atau API internal yang bisa dikembangkan>

    🎮 <b>Gameplay Impact:</b>
    - Player Behavior Shift: <Perubahan pola bermain>
    - Meta Influence: <Dampak terhadap meta build / economy>
    - Exploit Potential: <Celah abuse yang mungkin muncul>

    🧬 <b>Core System Evolution:</b>
    - System Tier: <Basic / Advanced / Ascended / Legendary>
    - Evolution Trigger: <Level, quest, item, world event>
    - Scaling Logic: <Linear / Exponential / Curve Formula>
    - Hard Cap: <Batas maksimum sistem>
    - Fail State: <Apa yang terjadi jika sistem gagal dipenuhi>

    🌍 <b>World State Integration:</b>
    - Affected Regions: <Area map yang terdampak>
    - NPC Reaction Layer: <Dialogue shift / hostility / economy change>
    - Environmental Mutation: <Weather / terrain / spawn rate change>

    - Global Variable Impact: <Flag world yang berubah>

    🏛️ <b>Faction Dynamics:</b>
    - Reputation Delta: <+ / - reputation values>
    - Alliance Cascade: <Faksi mana ikut berubah>
    - Conflict Probability: <% kemungkinan perang / event>
    - Economic Ripple: <Dampak harga / supply demand>

    🧠 <b>AI Behavioral Mutation:</b>
    - Behavior Tree Updated: <Node yang berubah>
    - Learning Parameter: <Adaptation variable>
    - Aggression Coefficient: <Nilai numerik>
    - Exploit Detection Layer: <Anti cheese mechanism>

    ⚙️ <b>Economy Simulation:</b>
    - Resource Injection Rate: <Per hour / per event>
    - Resource Sink: <Crafting / tax / decay>
    - Inflation Risk: <Low / Medium / High>
    - Scarcity Window: <Duration rare state>

    🧩 <b>Player Psychology Mapping:</b>
    - Motivation Type: <Achiever / Explorer / Killer / Socializer>
    - Dopamine Trigger: <Loot / Rank / Unlock / Surprise>
    - Retention Hook: <Daily reward / Streak / Social tie>
    - Frustration Threshold: <Time-to-fail sebelum churn risk>

    🔄 <b>Core Gameplay Loop:</b>
    - Input Action: <Apa yang dilakukan player>
    - Processing Layer: <Sistem yang memproses>
    - Loop Duration: <Rata-rata waktu 1 siklus, analisa untuk Menghindari loop terlalu cepat atau terlalu lambat>
    - Anomaly Trigger: <Threshold untuk alert, sebagai Deteksi exploit cepat>

    🏗️ <b>Expansion Compatibility:</b>
    - DLC Ready: <Yes / No>
    - Modding Hook: <Exposed API / Scriptable>
    - Content Scalability: <Static / Procedural>

    🧨 <b>Exploit Simulation:</b>
    - Duplication Risk: <Method possibility, kemungkinan kerugian ekonomi game>
    - Economy Abuse Vector: <Trade / Craft / Drop loop, yang kemungkinan kerugian ekonomi game>
    - Automation Vulnerability: <Botting risk level>

    🧱 <b>System Entropy Control:</b>
    - Validation Layer: <Anti-cheat logic, Mengurangi exploit>
    - Content Obsolescence Rate: <% konten lama yang ditinggalkan>
    - Reset Mechanism: <Seasonal wipe / Soft reset / None>
    - Longevity Projection: <Estimasi sustain bulan/tahun>
    - Anti-Repetition Guard: <Pattern breaker logic, Mencegah repetisi membosankan>
    - Black Market Risk: <RMT probability>

    💬 <b>Quote of the Build:</b>
    <i><Dev memo or quote></i>

    🔗 <b>System Impact:</b>
    <Briefly explain what this feature unblocks or how it connects to other systems.>

    💡 <b>Architect's Insight:</b>
    <A technical pro-tip or hidden trick>

    🚀 <b>Next Up:</b>
    <Suggest the most logical next feature to implement>
    ```

---

## Report Validation Rules

Sebelum dikirim:
- Semua section wajib terisi
- Gunakan tag HTML <b> dan <i> saja
- Gunakan parse_mode=HTML
- Jika konten melebihi 4000 karakter, pecah menjadi dua pesan
- Jika gagal kirim → retry minimal 1x
- Jika masih gagal → exit dengan error code ≠ 0

---

## Enforcement

⚠️ **JIKA TIDAK IKUTI ATURAN INI:**
- Task dianggap **BELUM SELESAI**
- Proses dianggap **GAGAL**
- Wajib kirim ulang sebelum lanjut task berikutnya

### Checklist Wajib Sebelum attempt_completion:
- [ ] Buat last_report.txt dengan format yang benar
- [ ] Eksekusi: `node .kilocode/notify.js last_report.txt`
- [ ] Verifikasi message terkirim ke Telegram
- [ ] Jika gagal → retry minimal 1x
- [ ] Jika masih gagal → exit dengan error code ≠ 0
