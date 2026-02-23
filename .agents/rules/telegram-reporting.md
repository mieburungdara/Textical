---
trigger: always_on
---

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

**Protokol Notifikasi Telegram**: Setiap kali saya menyelesaikan tugas signifikan atau fitur baru, saya HARUS SELALU menyampaikan laporan ke Telegram menggunakan `.kilocode/notify.js` (melalui input file UTF-8).
**ATURAN PENGHAPUSAN**: Jika ada bagian/section di bawah ini yang tidak memiliki isi, tidak relevan, atau bernilai N/A / None / Kosong, Anda **WAJIB MENGHAPUS** section tersebut dari teks laporan sebelum mengirimkannya. Dilarang mengirim tulisan `N/A`.
FORMAT REFERENSI (Hapus yang tidak perlu):

```
✦ <Emoji>> <b><Feature Name>: <status: Draft / In Dev / Testing / Completed / Deprecated></b>

💬 <b>Request/Question:</b>
<Original request as understood by the AI>

🛠️ <b>Answer/Implementation:</b>
<Technical overview of the solution>

📜 <b>World Lore:</b>
[Tulis narasi panjang di sini. Mulailah dengan latar belakang dunia yang sedang mengalami krisis atau kebutuhan, lalu jelaskan bagaimana fitur/debug ini muncul sebagai manifestasi kekuatan atau teknologi baru. Gunakan kata-kata yang imersif dan puitis sesuai dengan game yg sedang kita buat ini. buat hingga memiliki 2 paragraf panjang.]

🌟 <b>Milestones Reached:</b>
<Detailed bulleted list of ALL significant milestones and sub-tasks completed>

📊 <b>Technical Details:</b>
- <b>Files:</b> <Number> New Scripts, <Number> Modified
- <b>Registry:</b> <New ID Ranges used>
- <b>Audit:</b> <Final Audit Result>
- <b>Database Changes:</b> <Schema modifications>
- <b>API Endpoints:</b> <New/Modified endpoints>
- <b>Config Updates:</b> <Configuration changes>

⚠️ <b>Risk Assessment (Security & Risks):</b>
- <b>Known Issues:</b> <List any known issues or bugs>
- <b>Security Protocol:</b> <Security level and notes>
- <b>Data Integrity:</b> <Data consistency concerns>
- <b>Rollback Plan:</b> <How to revert if needed>

🧪 <b>Testing Coverage:</b>
- Unit Tests: <% coverage or number of test cases>
- Integration Tests: <Which systems are tested together>
- Edge Case Validated: <List important edge cases>
- Multiplayer Sync Verified: <Client-server synchronization status>
- Load Testing: <Performance benchmarks>
- Regression Tests: <Previous features still working>

🧠 <b>Dependency Graph:</b>
- Depends on: <Systems that are prerequisites>
- Affects: <Systems directly affected>
- Future Hook Points: <Extensions or internal APIs that can be developed>
- External Dependencies: <Third-party services or libraries>
- Internal APIs: <Other services that consume this>

🎮 <b>Gameplay Impact:</b>
- Player Behavior Shift: <Changes in playing patterns>
- Meta Influence: <Impact on meta build / economy>
- Exploit Potential: <Possible abuse exploits>
- Difficulty Curve: <How this affects progression>
- Content Duration: <Estimated time to complete>
- Replayability: <Does this add replay value>

🧬 <b>Core System Evolution:</b>
- System Tier: <Basic / Advanced / Ascended / Legendary>
- Evolution Trigger: <Level, quest, item, world event>
- Scaling Logic: <Linear / Exponential / Curve Formula>
- Hard Cap: <Maximum system limit>
- Fail State: <What happens if system fails>
- Upgrade Path: <How systems can be upgraded>

🌍 <b>World State Integration:</b>
- Affected Regions: <Map areas affected>
- NPC Reaction Layer: <Dialogue shift / hostility / economy change>
- Environmental Mutation: <Weather / terrain / spawn rate change>
- Global Variable Impact: <World flags that change>
- Time-Based Events: <Any time-sensitive triggers>
- Seasonal Content: <Any seasonal dependencies>

🏛️ <b>Faction Dynamics:</b>
- Reputation Delta: <+ / - reputation values>
- Alliance Cascade: <Which factions change>
- Conflict Probability: <% chance of war / event>
- Economic Ripple: <Impact on price / supply demand>
- Trade Route Changes: <How merchant routes are affected>
- Resource Spawns: <Any resource availability changes>

🧠 <b>AI Behavioral Mutation:</b>
- Behavior Tree Updated: <Nodes that changed>
- Learning Parameter: <Adaptation variable>
- Aggression Coefficient: <Numerical value>
- Exploit Detection Layer: <Anti cheese mechanism>
- Pathfinding Changes: <AI navigation updates>
- Spawn Logic: <Enemy spawn patterns>

⚙️ <b>Economy Simulation:</b>
- Resource Injection Rate: <Per hour / per event>
- Resource Sink: <Crafting / tax / decay>
- Inflation Risk: <Low / Medium / High>
- Scarcity Window: <Duration rare state>
- Gold Sink: <Where gold is spent>
- Price Stability: <Market equilibrium projection>
- Item Value Progression: <How item values scale>

🧩 <b>Player Psychology Mapping:</b>
- Motivation Type: <Achiever / Explorer / Killer / Socializer>
- Dopamine Trigger: <Loot / Rank / Unlock / Surprise>
- Retention Hook: <Daily reward / Streak / Social tie>
- Frustration Threshold: <Time-to-fail before churn risk>
- Progression Feel: <How progression is perceived>
- Social Incentives: <Why players interact>

🔄 <b>Core Gameplay Loop:</b>
- Input Action: <What player does>
- Processing Layer: <System that processes>
- Loop Duration: <Average time for 1 cycle, analyze to avoid loop too fast or too slow>
- Anomaly Trigger: <Threshold for alert, as quick exploit detection>
- Feedback Timing: <How fast feedback is given>
- Reward Schedule: <When rewards are given>

🏗️ <b>Expansion Compatibility:</b>
- DLC Ready: <Yes / No>
- Modding Hook: <Exposed API / Scriptable>
- Content Scalability: <Static / Procedural>
- Future Features: <How this supports future additions>
- Backward Compatibility: <Legacy system support>

🧨 <b>Exploit Simulation:</b>
- Duplication Risk: <Method possibility, possible game economic loss>
- Economy Abuse Vector: <Trade / Craft / Drop loop, possible game economic loss>
- Automation Vulnerability: <Botting risk level>
- Speed Running Exploits: <Any speed run cheese>
- Save Scumming: <Save state abuse potential>

🧱 <b>System Entropy Control:</b>
- Validation Layer: <Anti-cheat logic, reducing exploit>
- Content Obsolescence Rate: <% old content abandoned>
- Reset Mechanism: <Seasonal wipe / Soft reset / None>
- Longevity Projection: <Estimated sustain months/years>
- Anti-Repetition Guard: <Pattern breaker logic, preventing boring repetition>
- Black Market Risk: <RMT probability>
- Server Load Projection: <Expected server strain>

💬 <b>Quote of the Build:</b>
<i><Dev memo or quote></i>

🔗 <b>System Impact:</b>
<Briefly explain what this feature unblocks or how it connects to other systems.>

💡 <b>Architect's Insight:</b>
<A technical pro-tip or hidden trick>

🚀 <b>Next Up:</b>
<Suggest 1-5 the most logical next feature to implement>

📈 <b>Analytics & Metrics:</b>
- KPIs Tracked: <Key performance indicators>
- Success Metrics: <How success is measured>
- Failure Metrics: <What indicates failure>
- User Engagement: <Expected engagement changes>

🎯 <b>Design Goals:</b>
- Primary Objective: <Main goal of this feature>
- Secondary Objectives: <Additional goals>
- Success Criteria: <What defines success>
- Target Audience: <Who is this for>

💰 <b>Resource Requirements:</b>
- Development Time: <Estimated hours>
- Art Assets: <New assets needed>
- Audio Assets: <Sound/music requirements>
- Documentation: <Docs that need updating>

🌟 <b>Milestones Reached:</b>
<Detailed bulleted list of ALL Improvement and Optimization>
```

---

## Report Validation Rules

Sebelum dikirim:
- Hapus semua section yang bernilai N/A, None, atau tidak relevan agar laporan lebih ringkas!
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
- [ ] Buat last_report.md dengan format yang benar
- [ ] Eksekusi: `node .kilocode/notify.js last_report.md`
- [ ] Verifikasi message terkirim ke Telegram
- [ ] Jika gagal → retry minimal 1x
- [ ] Jika masih gagal → exit dengan error code ≠ 0