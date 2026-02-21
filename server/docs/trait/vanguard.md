# Vanguard Trait

## Deskripsi
Mekanik *Reaction/Cover* (khususnya untuk *Knight* atau *Warrior*) yang memungkinkan unit untuk secara otomatis melindungi rekan setim yang berada di sekitarnya. Unit Vanguard berfungsi layaknya tameng, menyerap sebagian damage dari serangan lawan yang ditujukan ke sekutu.

## Mekanik Detail
- **Trigger**: Terjadi saat rekan setim di radius 1 *tile* (bersebelahan) menerima serangan fisik atau peluru. Hook dieksekusi melalui `onInterceptDamage`.
- **Rasio Serapan**: Vanguard menyerap **50%** dari total damage (setelah dikurangi oleh DEF (defense) milik target utama).
- **Proksimitas**: Pengukuran jarak menggunakan perhitungan grid (`dist <= 1`).
- **Pengecekan Kematian**: Vanguard tidak akan melindungi jika ia atau sekutunya sudah mati (`isDead`), mencegah penyembuhan tak terduga atau logic mati berdiri.

## Bug Resolusi (Fixes)
1. **100% Damage Absorbtion Bug**: Kode aslinya dan test sebelumnya secara spesifik mengeset Vanguard untuk menyerap **100% damage** dan menjadikan damage ke ally 0. Ini bertentangan dengan deskripsi asli "absorbing half of their damage".
   - **Solusi**: Diubah agar Vanguard mengambil 50% (`Math.floor(amount / 2)`), dan mere-direct 50% sisanya kembali ke *BattleRules* melalui properti `remainingDamage`.
2. **Hardcoded Damage Wipeout**: `BattleRules.js` sebelumnya mengabaikan damage sisa dan memberikan "0 damage" ke defender tiap kali intercept terjadi.
   - **Solusi**: `BattleRules.js` disesuaikan untuk membaca `interceptionResult.remainingDamage`. Jika ada, maka defender hanya merasakan damage sisa perhitungan.
3. **Infinite Process Hang on Jest**: File test `vanguard_verification.test.js` sebelumnya mengalami siklus gantung (hang over 1 jam) akibat `WorldCycleService` berjalan tanpa henti via setInterval.
   - **Solusi**: `worldCycle` dimock langsung di header sistem testing agar tidak membocorkan event loop.

## Urutan Eksekusi
Dalam `BattleRules.js`, urutannya adalah:
1. `onPreAttack`
2. Core Damage Calculation (termasuk pengurangan kalkulasi Defense dari Ally)
3. `onTakeDamage`
4. **onInterceptDamage** (Event Interception: Vanguard menghitung dan membagi dua Final Damage)
5. Ally mengambil sisa `remainingDamage`
6. `onAllyDamage` & `onPostAttack`

## Implementasi Kode
Data yang masuk melalui hook ini:
- `unit`: Sang Vanguard yang sedang bertugas melindungi.
- `sim`: Objek BattleSimulation.
- `ally`: Rekan setim yang sedang diserang.
- `attacker`: Pelaku penyerangan.
- `amount`: Final Damage yang sudah menembus defense `ally`.

```javascript
onInterceptDamage(unit, sim, ally, attacker, amount) {
    if (unit.isDead || !ally || ally.isDead || !sim) return null;

    const dist = sim.grid.getDistance(unit.gridPos, ally.gridPos);
    
    // Syarat: Bersebelahan
    if (dist <= 1) {
        // Serap separuh dari damage final
        const absorbed = Math.floor(amount / 2);
        const remaining = amount - absorbed;
        unit.takeDamage(absorbed, sim);
        
        sim.logger.addEvent("REACTION", `${unit.data.name} intercepts attack for ${ally.data.name}!`, {
            actor_id: unit.instanceId,
            target_id: ally.instanceId,
            absorbed_damage: absorbed
        });

        return { intercepted: true, remainingDamage: remaining };
    }
    return null;
}
```

## Lore & Context
Seorang pasukan lapis baja sejati tidak bisa diam saja ketika rekannya terluka. Kehadiran elemen Guardian/Vanguard pada RPG merupakan strategi esensial pertempuran posisi (*positioning*), menuntut musuh untuk fokus membongkar formasi lini depan terlebih dahulu alih-alih melakukan instant-kill terhadap penyihir dan *healer* yang dilindungi di belakang.
