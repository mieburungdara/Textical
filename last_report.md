✦ <b>Trait Percentage Scaling: Completed</b>

💬 <b>Request/Question:</b>
Implementasi scaling persentase dinamis untuk trait <b>LifeSteal</b> dan <b>Vanguard</b> berdasarkan level trait dan stat unit, menggunakan logika "highest win" untuk stacking dan pembulatan floor.

🛠️ <b>Answer/Implementation:</b>
Sistem trait kini mendukung evolusi kekuatan berbasis level tanpa memerlukan file terpisah untuk setiap tingkatan. 
- <b>LifeSteal:</b> Menggunakan mapping tier (Lv1: 15%, Lv2: 30%, Lv3: 50%). Logika "highest win" membandingkan persentase trait dengan stat <code>lifesteal_base</code> dan mengambil yang tertinggi.
- <b>Vanguard:</b> Menggunakan mapping tier (Lv1: 30%, Lv2: 50%, Lv3: 70%) untuk penyerapan damage rekan terdekat.
- <b>Calculations:</b> Semua kalkulasi menggunakan <code>Math.floor</code> untuk konsistensi sistem.
- <b>Deterministic Testing:</b> Memperbaiki bug pada <code>CombatFormulaResolver</code> untuk menangani stat bernilai 0 dan memastikan hasil test yang konsisten.

📜 <b>World Lore:</b>
Dunia Textical yang semakin kelam memaksa para petarung untuk melampaui batas kemampuan mereka. Kekuatan lifesteal yang dulunya konstan, kini beresonansi dengan detak jantung sang pembawa, mengisap esensi kehidupan musuh dengan intensitas yang mengerikan seiring pertumbuhan jiwa mereka. Para pelindung Vanguard kini mampu membangun perisai tak kasatmata yang lebih kokoh, menjadi benteng hidup yang menantang maut demi kedaulatan sekutu mereka.

Ini adalah manifestasi dari evolusi sistem <i>Trait Resonance</i>, di mana setiap aksi di medan perang akan semakin tajam dan efektif, menciptakan hirarki kekuatan yang baru di antara para petarung elit.

🌟 <b>Milestones Reached:</b>
- [x] Refactor <code>LifeSteal.js</code> dengan tiered scaling & highest win logic.
- [x] Refactor <code>Vanguard.js</code> dengan tiered absorption scaling.
- [x] Implementasi <code>Math.floor</code> pada semua kalkulasi heal/damage.
- [x] Perbaikan <code>CombatFormulaResolver</code> untuk stabilitas unit testing.
- [x] Verifikasi 7/7 test case berhasil pada <code>tiered_traits_verification.test.js</code>.

📊 <b>Technical Details:</b>
- <b>Files:</b> 2 Modified (LifeSteal.js, Vanguard.js), 1 Utility Update (CombatFormulaResolver.js), 1 New Test (tiered_traits_verification.test.js).
- <b>Registry:</b> Memperkenalkan internal mapping tier di dalam definisi trait.
- <b>Audit:</b> Hasil audit menunjukkan konsistensi damage/heal sesuai formula yang diharapkan.

⚠️ <b>Risk Assessment (Security & Risks):</b>
- <b>Known Issues:</b> Linter melaporkan implicit any pada parameter JS, telah ditangani sebagian dengan JSDoc.
- <b>Rollback Plan:</b> Restore versi <code>BaseTrait</code> sebelumnya jika scaling dirasa terlalu agresif.

🧪 <b>Testing Coverage:</b>
- Unit Tests: 7 test cases (All Passed)
- Edge Case Validated: Penanganan stat 0% dan 100% hit chance berhasil diverifikasi.

🧠 <b>Dependency Graph:</b>
- Depends on: <code>BattleUnit.getStat</code>, <code>BattleSimulation</code>, <code>CombatFormulaResolver</code>.
- Affects: Seluruh mekanisme combat yang melibatkan trait LifeSteal dan Vanguard.

🎮 <b>Gameplay Impact:</b>
- <b>Meta Influence:</b> Trait level 3 menjadi sangat bernilai (50% lifesteal & 70% vanguard), mendorong pemain untuk melakukan upgrade trait melalui quest atau item.
- <b>Difficulty Curve:</b> Menambah kedalaman strategi dalam party composition.

🧬 <b>Core System Evolution:</b>
- System Tier: Advanced (Tiered Trait Scaling)
- Scaling Logic: Linear Tiered Mapping

💬 <b>Quote of the Build:</b>
<i>"Bukan sekadar pedang yang tajam, tapi jiwa yang lapar akan kehidupan yang menentukan siapa yang berdiri terakhir." - The Old Vampire</i>

🚀 <b>Next Up:</b>
- Implementasi tiered scaling untuk trait <b>Berserker</b> dan <b>GlassCannon</b>.
- Integrasi UI di Godot untuk menampilkan persentase real-time di hover tooltip.
