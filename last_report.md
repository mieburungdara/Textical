✦ <b>New Traits Implementation: Completed</b>

💬 <b>Request/Question:</b>
Implementasi 5 trait baru (Adrenaline, Executioner, Reflective Spikes, Second Wind, Opportunist) dengan sistem tiered scaling dan verifikasi melalui unit test.

🛠️ <b>Answer/Implementation:</b>
Telah diimplementasikan 5 trait baru yang memperluas dimensi taktis dalam combat:
- <b>Adrenaline:</b> Memberikan bonus damage multiplier (Lv3: +2% per 1% HP hilang).
- <b>Executioner:</b> Memberikan executes damage (Lv3: +60% DMG jika musuh &lt;50% HP).
- <b>Reflective Spikes:</b> Mengembalikan damage (Lv3: 50% reflect).
- <b>Second Wind:</b> Pemulihan HP instan sekali per battle (Lv3: 60% heal saat &lt;35% HP). Menggunakan hook <code>onPostHit</code> untuk akurasi data HP.
- <b>Opportunist:</b> Bonus Hit/Crit dari arah samping/belakang (Lv3: +50%).

🌟 <b>Milestones Reached:</b>
- [x] Implementasi logic tiered scaling untuk 5 trait baru.
- [x] Optimasi hook <code>onPostHit</code> untuk mekanik recovery HP.
- [x] Penanganan auto-facing defender dalam pengujian directional traits.
- [x] Verifikasi 5/5 test case berhasil di <code>new_traits_verification.test.js</code>.

📊 <b>Technical Details:</b>
- <b>Files:</b> 5 New Trait Definitions, 1 New Test Suite.
- <b>Hooks Used:</b> <code>onPreAttack</code>, <code>onTakeDamage</code>, <code>onPostHit</code>, <code>onCalculateHitChance</code>, <code>onCalculateCrit</code>.

📜 <b>World Lore:</b>
Kemunculan artefak kuno di reruntuhan Aegis telah membangkitkan resonansi tersembunyi dalam jiwa para petarung. Mereka yang terpojok kini menemukan kekuatan dalam rasa sakit mereka (Adrenaline), sementara para pemburu yang kejam belajar untuk mengakhiri penderitaan musuh dengan satu tebasan fatal (Executioner). Di garis depan, para ksatria duri berdiri tegak, membiarkan setiap pukulan musuh memakan tuannya sendiri (Reflective Spikes).

Ini bukan sekadar taktik; ini adalah evolusi dari kehendak untuk bertahan. Dari bayang-bayang, para oportunis mengintai, menunggu saat yang tepat untuk menghunjamkan belati ke punggung lawan, sementara napas kedua (Second Wind) menjadi garis tipis antara kemenangan gemilang dan kekalahan yang memalukan di ambang maut.

💬 <b>Quote of the Build:</b>
<i>"Ketika dunia mencoba menjatuhkanmu, jadikanlah kejatuhanmu sebagai landasan serangan balik yang paling menghancurkan." - Commander Valerius</i>

🚀 <b>Next Up:</b>
- Integrasi trait ini ke dalam item passive dan weapon templates.
- Penambahan efek visual (particles) di Godot untuk trigger Second Wind dan Reflective Spikes.
