✦ 🛡️ <b>Vanguard Trait Refactor: Completed</b>

💬 <b>Request/Question:</b>
Saya diminta untuk mencari bugs pada `Vanguard.js`, memperbaikinya, dan kemudian mendokumentasikannya di `docs/trait/vanguard.md`.

🛠️ <b>Answer/Implementation:</b>
Terdapat 3 bug utama pada penerapan sistem perlindungan (Vanguard):
1. **Damage Absorption Error**: Dokumentasi aslinya menyiratkan bahwa Vanguard menyerap separuh damage rekannya. Tapi secara harfiah, kodenya menyerap **100% damage**. Ini diubah sehingga `remainingDamage` diteruskan ke Ally.
2. **Hardcoded Wiped Damage**: Di `BattleRules.js`, kemunculan `interceptionResult` secara otomatis menghapus total final damage, seakan-akan tidak ada serangan lanjutan yang diteruskan. Ini sudah diperbaiki agar bisa menerima nilai damage sisa dari trait.
3. **Ghost Process di Jest**: Test suite gantung selamanya (berjalan lebih dari 1 jam) akibat adanya *timer leak* terhadap `WorldCycleService` di lingkungan pengujian. Ini telah diperbaiki memakai teknik *global mocking*.

📜 <b>World Lore:</b>
Ksatria yang sejati tak pernah membiarkan rekan setimnya menerima hantaman penuh. "Tubuhku adalah tamengmu," begitulah sumpah yang sering digetarkan di medan tempur. Vanguard, dengan senjumlah lapisan besi dan sihir proteksi, menyerap sebagian rasa sakit, mendistribusikan derita peperangan secara merata di lini depan. 

Kini, setiap hunjaman pedang musuh ke arah sang penyihir di sayap belakang tidak akan berakibat fatal instan. Selama ksatria setia ini masih bernapas dan berdiri satu meter dalam jangkauan jubah kawannya, dentingan zirah akan terus terdengar, menghalau bilah maut. Keajaiban formasi ini selalu memutarbalikkan keseimbangan daya tempur sebuah pleton militer.

🌟 <b>Milestones Reached:</b>
- [-] Identifikasi struktur kode Vanguard dan relasi sistem `interceptDamage`
- [x] Refactor Bug 100% Damage Interception di `Vanguard.js`
- [x] Redesign arsitektur penerimaan damage sisa (Remaining Damage) di `BattleRules.js`
- [x] Fix Test Suite (Hang Issue >1 Jam di-terminate) dan penambahan assertions baru di `tests/vanguard_verification.test.js`
- [x] Penulisan teknis di `docs/trait/vanguard.md`

📊 <b>Technical Details:</b>
- <b>Files:</b> 1 New Script (Doc), 3 Modified (`Vanguard.js`, `BattleRules.js`, `vanguard_verification.test.js`)
- <b>Audit:</b> Validated via local Jest tests (Passed 100%)

⚠️ <b>Risk Assessment (Security & Risks):</b>
- <b>Data Integrity:</b> Nilai perisai direstrik mengikuti hitungan logaritmik integer `Math.floor`. Sisa damage juga ditangani. Aman.

🧪 <b>Testing Coverage:</b>
- Unit Tests: `tests/vanguard_verification.test.js` divalidasi dengan split kalkulasi ekspektasi damage (40 Vanguard, 60 Ally atas total 100 awal kalkulasi 80 sisa setelah def).

🧠 <b>Dependency Graph:</b>
- Depends on: `traitService.js`, `BattleRules.js`, `CombatEventBroadcaster.js`

🎮 <b>Gameplay Impact:</b>
- Player Behavior Shift: Formasi sekarang menjadi vital. Musuh tidak lagi bisa melakukan *oneshots* dengan mudah terhadap mage/healer selama lini depan masih menempel kuat.
- Exploit Potential: Keterbatasan jangkauan (maks 1 tile) berarti *kiting* dan *AoE attack* adalah penangkal alaminya.

⚙️ <b>Economy Simulation:</b>
- Item Value Progression: Armor *heavy* akan mengalami peningkatan harga drastis di *Meta* karena fungsinya membagi rata durabilitas.

🏗️ <b>Expansion Compatibility:</b>
- Modding Hook: Sistem `remainingDamage` memberi kebebasan ke depannya untuk modder membuat semacam "Skill Perisai 20%".

🔗 <b>System Impact:</b>
Memisahkan kontrol event serapan serangan, menyempurnakan struktur hook `onInterceptDamage`.

💡 <b>Architect's Insight:</b>
Selalu ingat bahwa interception dapat terjadi berlapis (misal ada 2 vanguard). *Fallback logic* `BattleRules` sudah kami siapkan dengan membaca `undefined` parameter agar tidak menyebabkan error `NaN` di runtime hitpoint!

🚀 <b>Next Up:</b>
Tiap hero/sistem punya trait uniknya sendiri. Sistem AoE vs Intercept/Reflect bisa jadi tes kasus kita berikutnya!

📈 <b>Analytics & Metrics:</b>
- Success Metrics: Vanguard absorbs 50%, Combat test pass 100%, No script lag/hangs.

🎯 <b>Design Goals:</b>
- Primary Objective: SRP trait compliance, logical mechanics behavior.
