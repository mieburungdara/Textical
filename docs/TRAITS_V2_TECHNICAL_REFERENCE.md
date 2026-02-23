# 📜 Tactical Trait System V2 (Technical Reference)

Dokumen ini merinci sistem **Trait Modernized** (21 Trait) yang telah diperbarui dengan mekanik **Tiered Scaling (Lv1, Lv2, Lv3)** dan integrasi mendalam dengan engine pertempuran.

---

## 🛠️ Engine Core Support
Sistem trait ini didukung oleh tiga pilar utama di `BattleRules.js` & `CombatFormulaResolver.js`:

1.  **Damage Interception**: Memungkinkan trait (seperti `Vanguard`) untuk memotong atau mengalihkan damage sebelum mengenai target.
2.  **Damage Reflection**: Engine mendukung pemantulan damage kembali ke penyerang melalui hook `onTakeDamage` yang mengembalikan `reflectPercent`.
3.  **Tiered Resolution**: Seluruh trait mendeteksi level-nya secara dinamis melalui objek `traits` pada unit sebelum mengeksekusi logika.

---

## 🎭 Catalog Trait (21 Total)

### 🔴 Defensive & Recovery Traits
| Trait | Hook | Mechanis (Lv1 / Lv2 / Lv3) |
| :--- | :--- | :--- |
| **BloodLink** | `onAllyDamage` | Menerima bagian damage rekan yang terhubung (20% / 40% / 60%). |
| **Giant** | `onBattleStart` | HP Max (+30% / +60% / +100%), Speed Penalty (-5 / -8 / -10). |
| **ReflectiveSpikes**| `onTakeDamage` | Pantulkan damage sebagai True Damage (15% / 30% / 50%). |
| **SecondWind** | `onPostHit` | Heal sekali per battle saat HP < X% (Heal 20% at 15% / 40% at 25% / 60% at 35%). |
| **Thorns** | `onTakeDamage` | Pantulkan damage jika di atas ambang batas (10% > 10 / 20% > 5 / 40% > 0). |
| **UndyingWill** | `onTurnStart/onBeforeDeath` | Kebal DoT & Peluang Bangkit (20% mid HP / 35% mid HP / 50% high HP). |
| **Vanguard** | `onInterceptDamage` | Intersep damage rekan sebelah (30% / 50% / 70% absorption). |

### ⚔️ Offensive & Combat Traits
| Trait | Hook | Mechanis (Lv1 / Lv2 / Lv3) |
| :--- | :--- | :--- |
| **Adrenaline** | `onPreAttack` | Bonus DMG per 1% HP hilang (0.5% / 1.0% / 2.0% bonus). |
| **ArcaneMaster** | `onPreAttack/onPostAction` | Skill DMG (1.2x / 1.5x / 2x) & Reset CD Chance (15% / 30% / 50%). |
| **Berserker** | `onTurnStart` | Bonus ATK & Dmg Mult berdasarkan % HP hilang (lv3: peak 100% ATK, 1.4x DMG). |
| **CounterStrike** | `onPostHit` | Peluang serangan balik instan (20% / 35% / 50%). |
| **Executioner** | `onPreAttack` | Bonus DMG ke target nyawa rendah (20% at <30% / 40% at <40% / 60% at <50%). |
| **GlassCannon** | `onBattleStart` | ATK Mult (1.5x / 2x / 2.5x) but HP Mult (0.5x / 0.35x / 0.2x). |
| **LifeSteal** | `onLifesteal` | Pulihkan HP dari % damage (15% / 30% / 50%). |
| **Opportunist** | `onCalcHit/Crit` | Bonus Hit & Crit dari Samping/Belakang (+10 / +25 / +50). |
| **Sharpshooter** | `onBattleStart` | Penambahan Jarak Serang (+1 / +2 / +4 Tile). |

### 🌀 Tactical & Utility Traits
| Trait | Hook | Mechanis (Lv1 / Lv2 / Lv3) |
| :--- | :--- | :--- |
| **Coward** (Neg/Pos) | `onTick/onBeforeAction`| Bonus Speed saat sekarat vs Peluang Panik saat sendirian (15% / 25% / 45%). |
| **Disruptor** | `onBattleStart/onMove`| Bonus Move Range (+1 / +2 / +3) & Slipstream (tembus unit musuh). |
| **Thinker** | `onTurnStart` | Regenerasi Mana per giliran (+5 / +12 / +25 Mana). |
| **SplittingForm** | `onDeath` | Membelah jadi Mini-Unit (2 minis at 30% / 2 minis at 40% / 3 minis at 50% stat). |
| **TrueSight** | `onBattleStart` | Deteksi Stealth & Bonus Akurasi (+10 / +25 / +50). |

---

## 🧩 Technical Rules (For Developers)

1.  **Stat Retrieval**: Selalu gunakan `unit.getStat("key")` alih-alih `unit.stats.key` untuk memastikan modifier temporer (seperti dari Berserker) terhitung.
2.  **Trait Hook Order**: Hook dieksekusi secara berurutan pada semua trait yang dimiliki unit. Gunakan `_.merge` jika trait mengembalikan objek stat modifier.
3.  **Recursive Protection**: Trait seperti `SplittingForm` secara otomatis memberikan trait Lv1 "SplittingForm" pada unit turunannya namun ditandai dengan flag unik untuk mencegah pembelahan tanpa henti.
4.  **Simulation Context**: Selalu teruskan objek `sim` ke metode trait. Tanpa `sim`, logging dan interaksi grid tidak akan berfungsi.

---

## 🧪 Testing Protocol
Setiap penambahan atau perubahan trait **WAJIB** melewati unit test berikut:
- `tests/existing_traits_modernized.test.js`
- `tests/final_traits_modernized.test.js`
- `tests/hidden_traits_verification.test.js`

Gunakan perintah:
```bash
npx jest tests/*traits*.test.js
```

---
*Dokumentasi ini dibuat secara otomatis oleh Antigravity System - Refactor Engagement 2026.*
