# Life Steal Trait

## Deskripsi
Mekanik modular yang memungkinkan seorang penyerang untuk menyerap sebagian dari damage yang dihasilkan menjadi kesehatan (HP).

## Mekanik Detail
- **Trigger**: Terjadi secara otomatis di akhir serangan (`onLifesteal` hook).
- **Rasio**: Secara default menyerap **30%** dari final damage.
- **Kondisi Kematian**: Penyembuhan tidak akan terjadi jika penyerang sudah mati (`isDead` atau `currentHealth <= 0`) sebelum fase lifesteal dieksekusi (misalnya mati karena efek Thorns lawan).
- **Penyederhanaan**: Menggunakan `Math.floor` untuk pembulatan ke bawah. Jika 30% dari damage bernilai kurang dari 1, maka tidak ada penyembuhan.
- **Capped Healing**: HP tidak akan melebihi `health_max`. Masalah ini ditangani secara otomatis melalui `Math.min(maxHP, currentHealth + heal)`.

## Urutan Eksekusi
Dalam `BattleRules.js`, urutannya adalah:
1. `onPreAttack`
2. Damage Calculation
3. `onPostHit`
4. `onPostAttack` (Tempat di mana Thorns/Reflect biasanya bekerja)
5. **onLifesteal** (Efek Life Steal diproses di sini)

## Implementasi Kode
Data yang diperlukan oleh hook ini:
- `attacker`: Unit yang melakukan serangan.
- `sim`: Objek BattleSimulation.
- `damage`: Final damage yang telah dikalkulasi.

```javascript
onLifesteal(attacker, sim, damage) {
    if (attacker.currentHealth <= 0 || attacker.isDead) return;
    if (damage > 0) {
        const heal = Math.floor(damage * 0.30);
        attacker.currentHealth = Math.min(attacker.getStat("health_max"), attacker.currentHealth + heal);
    }
}
```

## Lore & Context
Awalnya dikenal sebagai `Vampire` trait, mekanik ini direfaktor menjadi `LifeSteal` agar lebih modular. Sekarang, mekanik ini dapat dipasang pada:
- Ras (seperti Vampire)
- Item (seperti Bloodthirster Sword)
- Buff/Skill (Aura of Vampirism)

---
*Dokumentasi ini dibuat sebagai bagian dari standarisasi mekanik tempur modular.*
