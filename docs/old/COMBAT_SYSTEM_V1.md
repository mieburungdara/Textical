# Dokumentasi Sistem Combat Textical

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Sistem Perhitungan Damage](#3-sistem-perhitungan-damage)
4. [Sistem Status Effects](#4-sistem-status-effects)
5. [Sistem Targeting](#5-sistem-targeting)
6. [Sistem Cooldown dan Resource Management](#6-sistem-cooldown-dan-resource-management)
7. [Flow Diagram Pertarungan](#7-flow-diagram-pertarungan)
8. [Tabel Referensi Combat Actions](#8-tabel-referensi-combat-actions)
9. [Panduan Developer](#9-panduan-developer)
10. [Panduan Tester](#10-panduan-tester)
11. [Skenario Pertarungan](#11-skenario-pertarungan)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Gambaran Umum

Sistem Combat Textical adalah sistem pertarungan berbasis server yang dirancang untuk menyediakan pengalaman pertarungan yang adil, seimbang, dan menarik bagi pemain. Dokumentasi ini mencakup penjelasan mendalam mengenai semua komponen utama yang membentuk sistem combat, mulai dari mekanisme perhitungan damage hingga manajemen resource untuk abilities dan skills.

Sistem combat Textical dibangun dengan prinsip **authoritative server-side simulation**, yang berarti seluruh logika pertarungan diproses secara penuh di server. Client hanya berperan sebagai visualizer yang menampilkan hasil simulasi kepada pemain. Pendekatan ini dipilih untuk memastikan integritas permainan dan mencegah berbagai bentuk cheating yang dapat dilakukan jika logika combat dijalankan di sisi client.

Sistem ini mendukung pertarungan dalam berbagai skala, mulai dari pertempuran satu hero melawan satu monster hingga pertempuran masif. Grid yang digunakan bersifat **dinamis** (dimensi ditentukan saat inisialisasi pertempuran). Arsitektur modular memungkinkan pengembangan dan pemeliharaan yang efisien, dengan pemisahan yang jelas antara komponen Grid, AI, Rules, dan Logger.

---

## 2. Arsitektur Sistem

### 2.1 Komponen Inti

Arsitektur sistem combat Textical terdiri dari beberapa komponen utama yang bekerja secara sinergis untuk menciptakan pengalaman pertarungan yang mulus dan responsif.

**Combat Engine** merupakan komponen utama yang menangani seluruh logika pertarungan. Engine ini bertanggung jawab untuk memproses semua aksi yang dilakukan oleh unit-unit dalam pertempuran, menghitung damage yang diberikan dan diterima, serta menentukan hasil akhir dari setiap interaksi. Combat Engine berjalan sepenuhnya di server untuk memastikan bahwa tidak ada manipulasi yang dapat dilakukan oleh pihak klien.

**Grid System** mengelola posisi dan pergerakan unit di atas medan perang. Dimensi grid bersifat dinamis dan ditentukan berdasarkan jenis pertempuran atau wilayah. Setiap sel dalam grid dapat berisi maksimal satu unit, dan pergerakan unit dibatasi oleh rules tertentu seperti biaya movement berdasarkan terrain dan obstacle yang ada di medan. Jarak dihitung menggunakan **Chebyshev Distance** (seperti langkah Raja di Catur, di mana langkah diagonal dianggap bernilai sama dengan langkah lurus).

**AI Controller** mengelola perilaku unit yang dikendalikan oleh sistem, termasuk hero NPC dan monster. AI menggunakan algoritma pathfinding EasyStar.js (implementasi A*) untuk menentukan jalur pergerakan optimal. Setiap unit memiliki archetype AI yang dapat dikonfigurasi sebelum pertempuran, menentukan apakah unit akan berperilaku agresif, defensif, atau memprioritaskan healing.

**Stat System** menangani semua perhitungan statistik unit, termasuk base stats, growth curves, modifiers, dan caps. Sistem ini menggunakan pipeline 12-layer untuk menghitung nilai akhir setiap stat, memastikan bahwa semua faktor seperti equipment, buffs, set bonuses, dan kondisi lainnya diperhitungkan dengan benar.

### 2.2 Diagram Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                     Combat Server Engine                        │
│                    (Authoritative Simulation)                   │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌───────────────┐
│   Grid System │     │  AI Controller  │     │ Stat System   │
│   **(50x50 Grid)** │     │ (EasyStar.js)   │     │ (12 Layers)   │
└───────────────┘     └─────────────────┘     └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Combat Rules Engine                          │
│  • Damage Calculation    • Status Effects                      │
│  • Targeting Logic       • Cooldown Management                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Combat Logger                              │
│                  (Battle Replay Recording)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Client Visualizer                           │
│                 (Godot Client Display)                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Mekanisme Timeline Execution Loop

Sistem combat Textical tidak menggunakan giliran (turn) kaku, melainkan **Timeline Execution Loop**. Setiap aksi memiliki "Action Delay" yang dihitung berdasarkan kecepatan unit.

1. **Next Action Tick**: Setiap unit memiliki penanda `nextActionTick`.
2. **Tick Processing**: Server akan memproses tick demi tick. Ketika suatu unit mencapai `nextActionTick`-nya, unit tersebut menjadi **Ready** untuk beraksi.
3. **Action Delay**: Setelah melakukan aksi (Menyerang, Bergerak, Skill), unit akan menerima "delay" (masa pemulihan) yang ditentukan oleh `DelayCalculator`. Unit dengan Speed tinggi akan memiliki delay yang lebih pendek, sehingga bisa beraksi lebih sering di lini masa (timeline).
4. **Simultaneous Processing**: Jika beberapa unit memiliki `nextActionTick` yang sama, mereka akan diproses secara berurutan berdasarkan prioritas kecepatan, namun secara visual terasa hampir bersamaan.

Setiap tick, sistem melakukan tahapan berikut secara berurutan:
1. **Tick Start**: Proses efek yang aktif pada awal tick (status effects, regeneration)
2. **Action Selection**: Setiap unit memilih aksi berdasarkan AI atau player input
3. **Action Execution**: Semua aksi dieksekusi secara bersamaan
4. **Damage Application**: Damage dihitung dan diterapkan ke target
5. **Status Update**: Status effects diperbarui dan expired effects dihapus
6. **Death Check**: Unit yang HP-nya mencapai 0 diproses (dying breath, death effects)
7. **Tick End**: Efek yang aktif pada akhir tick diproses

---

## 3. Sistem Perhitungan Damage

### 3.1 Formula Dasar

**Damage Final = Max(1, (Base Damage × Multipliers) - Effective Defense)**

**Base Damage** adalah nilai damage dasar yang berasal dari statistik attack unit dan damage yang ditentukan oleh skill.

**Multipliers** mencakup:
*   **Elemental Multiplier**: Menggunakan `ElementalEffectivenessResolver.js` yang mempertimbangkan elemen penyerang vs target, waktu hari (Day/Night), dan tipe unit (misal: Light vs Undead).
*   **Directional Bonus**: Bonus diberikan berdasarkan posisi relatif penyerang terhadap hadapan (facing) target:
    *   **BACK (Flanking)**: 1.5x Damage, +20 Accuracy, +25% Crit Chance, Menembus Block.
    *   **SIDE**: 1.1x Damage, +5 Accuracy, +10% Crit Chance.
    *   **FRONT**: 1.0x Damage (Normal).
*   **Critical Multiplier**: Base critical multiplier adalah **1.5x (150%)**.

**Effective Defense** adalah pengurangan damage flat yang dihitung sebagai:
`Effective Defense = Max(0, Defender Defense - Attacker Armor Penetration)`

**True Damage** adalah jenis damage khusus yang mengabaikan `Effective Defense` sepenuhnya. Damage yang dihasilkan langsung mengurangi HP target sesuai nilai aslinya.

**Random Variance** menambahkan variasi ke damage yang dihasilkan, dengan range ±10%.

### 3.2 Variabel Perhitungan Damage

| Variabel | Tipe | Deskripsi | Sumber Nilai |
|----------|------|-----------|--------------|
| `base_damage` | Integer | Damage dasar dari stats dan skill | Hero stats, Skill definition |
| `attack_stat` | Integer | Statistik attack unit | EnhancedStat calculation |
| `elemental_modifier` | Float | Multiplier berdasarkan elemen | ElementalResolver |
| `crit_chance` | Float (0-1) | Probabilitas critical hit | Stats + modifiers |
| `crit_damage` | Float | Multiplier damage critical | Stats + modifiers |
| `defense` | Integer | Defense target | Target stats |
| `defense_reduction_constant` | Integer | Konstanta pengurangan defense | Game config (default: 100) |
| `random_variance` | Float (0.8-1.2) | Variasi acak damage | RNG |
| `terrain_modifier` | Float | Modifier dari terrain | Grid system |
| `position_modifier` | Float | Modifier dari posisi (high ground) | Grid system |
| `buff_modifiers` | Array | Modifier dari active buffs | Status effect system |
| `set_bonuses` | Array | Modifier dari equipment sets | SetBonusResolver |

### 3.3 Contoh Perhitungan Damage

Misalkan seorang Warrior dengan stats sebagai berikut melakukan serangan basic attack ke sebuah monster:

**Stats Penyerang:**
- Attack: 150
- Critical Chance: 25% (0.25)
- Critical Damage: 200% (2.0)
- Element: Fire
- Trait: Berserker (50% bonus attack saat HP < 30%)

**Stats Target:**
- Defense: 50
- Element: Water (weak against Fire)
- Affinity: Water resistance 10%

**Kondisi Pertarungan:**
- Penyerang HP: 20% (aktifasi Berserker)
- Posisi: High Ground (+15% damage)
- Terrain: Flat (tanpa modifier)

**Perhitungan:**

1. Base Damage = Attack × Skill Multiplier
   ```
   Base Damage = 150 × 1.0 (basic attack) = 150
   ```

2. Apply Berserker Trait (+50% attack)
   ```
   Base Damage = 150 × 1.50 = 225
   ```

3. Apply Position Modifier (+15%)
   ```
   Damage = 225 × 1.15 = 258.75
   ```

4. Calculate Elemental Multiplier
   - Fire vs Water: Strong (1.5x)
   - Target Water resistance: -10%
   - Final Elemental Multiplier = 1.5 × (1 - 0.10) = 1.35
   ```
   Damage = 258.75 × 1.35 = 349.31
   ```

5. Check Critical Hit (25% chance)
   - Jika critical: Damage × 2.0
   - Jika tidak critical: Damage × 1.0
   ```
   Dengan Critical: 349.31 × 2.0 = 698.62
   Tanpa Critical: 349.31 × 1.0 = 349.31
   ```

6. Apply Defense Reduction
   ```
   Defense Reduction Factor = 50 / (50 + 100) = 0.333
   Dengan Critical: 698.62 × (1 - 0.333) = 465.75
   Tanpa Critical: 349.31 × (1 - 0.333) = 232.87
   ```

7. Apply Random Variance (±10%)
   ```
   Dengan Critical (RNG 0.95): 465.75 × 0.95 = 442.46
   Tanpa Critical (RNG 1.05): 232.87 × 1.05 = 244.51
   ```

**Hasil Akhir:** Damage yang dihasilkan berkisar antara 209 hingga 487, dengan rata-rata sekitar 348 untuk non-critical dan 697 untuk critical hit.

### 3.4 Damage Types

Sistem Textical membedakan beberapa jenis damage yang masing-masing memiliki karakteristik dan interaksi yang berbeda:

**Physical Damage** adalah damage yang dihasilkan dari serangan melee atau ranged berbasis senjata fisik. Damage type ini dipengaruhi oleh defense target dan dapat dihindari melalui dodge. Trait seperti "Thorns" dapat merefleksikan physical damage kembali ke penyerang.

**Magical Damage** adalah damage yang dihasilkan oleh skill-skill berbasis magic. Damage type ini dipengaruhi oleh magic resistance target dan tidak dapat dihindari melalui dodge normal. Namun, magic resistance dan elemental resistance dapat mengurangi damage ini secara signifikan.

**True Damage** adalah damage yang melewati semua bentuk pengurangan damage. Damage type ini selalu menghasilkan damage yang sesuai dengan nilai base-nya, tidak dipengaruhi oleh defense, resistance, atau dodge. True damage biasanya diberikan oleh skill-skill khusus atau efek tertentu.

**DOT (Damage Over Time)** adalah damage yang diterapkan secara bertahap selama periode waktu tertentu. Burn, Poison, dan Bleed adalah contoh-contoh DOT effects. Setiap tick DOT, damage dihitung menggunakan formula dasar tetapi dengan base damage yang lebih rendah karena diterapkan secara berulang.

---

## 4. Sistem Status Effects

### 4.1 Kategori Status Effects

Status effects dalam Textical dibagi menjadi dua kategori utama berdasarkan dampak terhadap unit yang menerima efek tersebut. Pemahaman yang jelas mengenai kategori ini penting untuk implementasi dan balancing game.

**Buffs (Efek Positif)** adalah status effects yang memberikan keuntungan kepada unit yang menerimanya. Buffs dapat meningkatkan statistik unit, memberikan proteksi dari efek negatif, atau menyediakan kemampuan khusus. Durasi buffs bervariasi tergantung pada sumbernya, mulai dari beberapa detik hingga berlangsung sepanjang pertempuran.

**Debuffs (Efek Negatif)** adalah status effects yang memberikan kerugian kepada unit yang menerimanya. Debuffs dapat mengurangi statistik, menyebabkan damage over time, membatasi aksi yang dapat dilakukan, atau menyebabkan kondisi khusus seperti stun atau silence. Kebanyakan debuffs memiliki durasi terbatas dan akan berakhir setelah periode waktu tertentu.

### 4.2 Jenis Status Effects dan Efeknya

#### 4.2.1 Buffs

| Nama | Tipe | Durasi | Efek | Stacking |
|------|------|--------|------|----------|
| **Power** | Stat Buff | 60s | +30% Attack Damage | Tidak |
| **Guard** | Stat Buff | 60s | +40% Defense | Tidak |
| **Haste** | Stat Buff | 30s | +20% Speed | Tidak |
| **Regen** | Recovery | 30s | +5% HP/MP per tick | Tidak |
| **Shield** | Protection | Until broken | Damage absorption shield | Tidak |
| **Blessing** | Multi | 60s | +15% all stats | Tidak |
| **Focus** | Stat Buff | 45s | +25% Critical Chance | Tidak |
| **Vampiric** | Special | 30s | 30% lifesteal on attack | Tidak |

**Power** meningkatkan damage serangan sebesar 30% selama 60 detik. Efek ini sangat berguna untuk DPS dealer yang ingin memaksimalkan output damage mereka. Power tidak dapat di-stack, menggunakan Power yang baru akan menggantikan yang lama.

**Guard** meningkatkan defense sebesar 40%, secara signifikan mengurangi damage yang diterima. Efek ini ideal untuk tank atau hero yang perlu bertahan lebih lama di garis depan pertempuran.

**Haste** meningkatkan speed sebesar 20%, memungkinkan unit untuk bertindak lebih sering dalam pertempuran. Speed yang lebih tinggi juga dapat memberikan keuntungan dalam hal dodge dan initiative.

**Regen** menyediakan recovery berkelanjutan sebesar 5% max HP dan MP per tick selama 30 detik. Efek ini berguna untuk sustained combat situations di mana regenerasi berkelanjutan lebih menguntungkan daripada burst healing.

**Shield** menciptakan damage absorption shield yang menyerap damage sebelum HP unit terpengaruh. Shield memiliki nilai absorbsi maksimum dan akan pecah jika absorbsi tersebut habis digunakan sebelum durasi berakhir.

**Blessing** adalah buff komprehensif yang meningkatkan semua statistik sebesar 15%. Buff ini memberikan peningkatan yang lebih merata dibandingkan buffs spesifik tetapi tidak memberikan bonus setinggi buffs fokus.

**Focus** meningkatkan critical chance sebesar 25%, sangat berguna untuk unit yang bergantung pada critical hits untuk damage mereka. Efek ini stack dengan base critical chance tetapi memiliki cap di 100%.

**Vampiric** memberikan lifesteal 30% pada semua serangan selama 30 detik. Setiap damage yang diberikan akan memulihkan HP penyerang sebesar 30% dari damage yang diberikan.

#### 4.2.2 Debuffs

| Nama | Tipe | Durasi | Efek | Stacking |
|------|------|--------|------|---------- |
| **Burn** | DOT | 30s | 5% max HP fire damage/tick | Ya (max 3x) |
| **Poison** | DOT | 30s | 3% max HP poison damage/tick | Ya (max 5x) |
| **Stun** | Control | 3s | Menghilangkan aksi | Tidak |
| **Freeze** | Control | 5s | Menghilangkan aksi + 50% defense | Tidak |
| **Silence** | Control | 8s | Mencegah skill usage | Tidak |
| **Slow** | Stat | 15s | -30% Speed | Ya (max 3x) |
| **Weak** | Stat | 30s | -25% Attack | Ya (max 2x) |
| **Blind** | Stat | 20s | -40% Hit Chance | Ya (max 2x) |
| **Bleed** | DOT | 20s | Flat damage/tick + amplifikasi jika bergerak | Ya (max 3x) |

**Burn** menyebabkan damage api sebesar 5% max HP per tick. Burn dapat di-stack hingga 3 kali, dengan setiap stack meningkatkan total damage per tick. Unit dengan trait "Skeleton" atau affinity "Fire" immune terhadap Burn.

**Poison** menyebabkan damage poison sebesar 3% max HP per tick. Poison dapat di-stack hingga 5 kali, menjadikannya sangat efektif untuk sustained damage. Poison tidak dapat di-stack oleh sumber yang sama dalam waktu singkat untuk mencegah abuse.

**Stun** adalah crowd control yang menghentikan sepenuhnya aksi unit selama 3 detik. Selama stun, unit tidak dapat bergerak, menyerang, atau menggunakan skill. Stun tidak dapat di-stack, stun yang baru akan me-reset durasi stun yang aktif.

**Freeze** adalah crowd control yang lebih kuat dari stun, menghentikan aksi unit selama 5 detik DAN mengurangi defense sebesar 50%. Unit yang frozen sangat rentan terhadap serangan, terutama dari elemen Fire yang mendapat bonus damage terhadap frozen targets.

**Silence** mencegah unit menggunakan skill selama 8 detik. Effects seperti Heal, Buff, dan Damage Skill semuanya dicegah oleh silence. Unit yang disilence masih dapat melakukan basic attack jika dalam range.

**Slow** mengurangi speed unit sebesar 30% per stack, dengan max 3 stacks. Speed yang berkurang mempengaruhi seberapa sering unit dapat bertindak dan juga mempengaruhi dodge chance.

**Weak** mengurangi attack unit sebesar 25% per stack, dengan max 2 stacks. Efek ini sangat efektif untuk mengurangi output damage dari enemy DPS dealers.

**Blind** mengurangi hit chance unit sebesar 40% per stack, dengan max 2 stacks. Blind sangat efektif terhadap unit dengan high accuracy tetapi low evasion, memaksa mereka untuk miss lebih sering.

**Bleed** menyebabkan flat damage per tick yang meningkat jika unit bergerak. Ini membuat kiting strategies lebih mahal untuk target yang bleeding. Max 3 stacks, dan setiap stack berkontribusi pada damage total.

### 4.3 Interaksi Status Effects

Status effects dapat berinteraksi satu sama lain dengan berbagai cara, dan pemahaman mengenai interaksi ini penting untuk strategi combat yang efektif.

**Stacking** terjadi ketika efek yang sama dapat diterapkan beberapa kali, dengan masing-masing stack menambah intensitas efek. Untuk DOT effects seperti Burn, Poison, dan Bleed, stacking meningkatkan total damage per tick. Untuk stat debuffs seperti Slow, Weak, dan Blind, stacking meningkatkan total pengurangan statistik. Untuk buffs dan crowd controls, stacking biasanya tidak diizinkan karena efeknya sudah cukup kuat.

**Duration Refresh** terjadi ketika efek yang sama diterapkan ulang pada unit yang sudah memiliki efek tersebut. Dalam kasus ini, durasi efek di-reset ke maksimum, bukan ditambahkan. Ini memungkinkan efek untuk dipertahankan lebih lama dengan aplikasi ulang yang tepat waktu.

**Priority Rules** menentukan efek mana yang aktif ketika ada konflik. Dalam Textical, berlaku aturan berikut:
- Debuffs selalu di-resolve sebelum buffs dalam tick yang sama
- Crowd controls memiliki prioritas lebih tinggi daripada stat modifications
- Effects dengan duration lebih pendek expire lebih dulu jika tidak di-refresh
- Effects dari sumber dengan priority lebih tinggi overwrite effects dengan priority lebih rendah

**Immunity Interactions** terjadi ketika unit memiliki immunity terhadap certain effect types. Immunity dapat berasal dari traits (seperti Skeleton yang immune terhadap Poison dan Burn), buffs (sebagai Shield yang memberikan immunity terhadap crowd control), atau abilities khusus. Ketika immunity aktif, aplikasi efek baru akan gagal tanpa efek apapun.

### 4.4 Status Effect Lifecycle

Setiap status effect melewati lifecycle yang konsisten sepanjang durasinya. Pemahaman lifecycle ini penting untuk debugging dan implementasi yang benar.

**Application Phase** terjadi ketika efek pertama kali diterapkan ke unit. Pada fase ini, sistem memeriksa apakah efek dapat diterapkan (tidak ada immunity, belum ada efek conflicting), menghitung nilai efek, dan menambahkan efek ke daftar aktif unit. Jika efek berhasil diterapkan, event `onStatusApplied` di-trigger.

**Active Phase** adalah periode di mana efek aktif dan mempengaruhi unit. Setiap tick, efek diperbarui dan nilai efek diterapkan. Untuk DOT effects, damage diberikan pada setiap tick. Untuk stat buffs/debuffs, statistik unit disesuaikan. Event `onStatusTick` di-trigger pada setiap tick.

**Expiration Phase** terjadi ketika durasi efek habis. Sistem menghapus efek dari daftar aktif unit, mengembalikan statistik ke nilai normal jika diperlukan, dan meng-trigger event `onStatusExpired`. Untuk beberapa efek seperti Shield, expiration juga berarti efek shield di-reset.

**Removal Phase** dapat terjadi sebelum expiration jika efek dihilangkan oleh ability purge, unit death, atau kondisi khusus lainnya. Proses cleanup yang sama dengan expiration dilakukan, tetapi event `onStatusRemoved` di-trigger sebagai gantinya.

---

## 5. Sistem Targeting

### 5.1 Mekanisme Pemilihan Target

Sistem targeting dalam Textical dirancang untuk fleksibilitas, memungkinkan baik player-controlled targeting maupun AI-controlled targeting. Untuk pemain, sistem memungkinkan pemilihan manual target dengan validasi untuk memastikan target yang dipilih valid dan dalam range. Untuk AI, sistem menggunakan priority system yang dapat dikonfigurasi untuk menentukan target optimal berdasarkan kondisi pertempuran.

**Validasi Target** memastikan bahwa unit hanya dapat menyerang target yang valid. Kriteria validasi meliputi:
- Target harus hidup (HP > 0)
- Target harus dalam range skill/attack yang digunakan
- Target tidak harus dalam state yang membuatnya untargetable (seperti being hidden)
- Target harus berlawanan faksi (tidak dapat menyerang ally kecuali specified)

**Range Checking** menghitung distance antara attacker dan target menggunakan grid coordinates. Jarak dihitung sebagai Manhattan distance untuk movement, tetapi untuk range attacks, Euclidean distance digunakan untuk akurasi. Rumus yang digunakan adalah:

```
**Range Checking** menghitung jarak antara penyerang dan target menggunakan **Chebyshev Distance**. Rumus ini memastikan bahwa pergerakan diagonal memiliki "biaya" yang sama dengan pergerakan ortogonal (seperti langkah Raja di catur).

```
Distance = Max(|targetX - attackerX|, |targetY - attackerY|)
```
```

### 5.2 Target Priority System

AI Controller menggunakan sistem priority untuk menentukan target mana yang akan diserang. Priority system ini dapat dikonfigurasi per unit atau per encounter, memungkinkan variety dalam perilaku AI.

**Closest Priority** memilih target dengan jarak terpendek dari unit AI. Priority ini menghasilkan perilaku AI yang fokus pada unit terdekat, ideal untuk melee-focused units atau situations di mana positioning tidak memungkinkan untuk reach distant targets.

**Furthest Priority** memilih target dengan jarak terjauh. Priority ini berguna untuk ranged units yang ingin memaksimalkan distance dari melee threats sambil tetap memberikan damage.

**Lowest HP Priority** memilih target dengan HP terendah. Priority ini membuat AI fokus pada securing kills, mengurangi jumlah enemy yang aktif lebih cepat. Berguna untuk aggressive AI archetypes.

**Highest HP Priority** memilih target dengan HP tertinggi. Priority ini membuat AI fokus pada tanky targets, berguna untuk situations di mana eliminating backline healers atau ranged threats adalah prioritas.

**Custom Priority** memungkinkan kombinasi kondisi yang lebih kompleks, seperti "Lowest HP dalam range" atau "Highest damage dealer yang dapat dijangkau". Custom priorities didefinisikan menggunakan behavior tree nodes.

### 5.3 Target Locking Mechanism

**Initial Targeting** terjadi ketika unit pertama kali memilih target untuk attack atau skill. Proses ini melibatkan scanning semua valid targets, menghitung priority score untuk setiap target berdasarkan kriteria yang dipilih, dan memilih target dengan score tertinggi.

**Target Maintenance** mempertahankan target yang sama selama beberapa attack berturut-turut untuk menghindari "target flickering" yang dapat terjadi jika priority berubah subtly antara ticks. Unit mempertahankan target yang sama hingga:
- Target mati atau menjadi invalid
- Duration lock expires (biasanya 3-5 detik)
- UnitAI explicitly changes target berdasarkan perubahan kondisi

**Target Switching** terjadi ketika kondisi tertentu terpenuhi yang membenarkan perubahan target. Kondisi yang memicu target switch meliputi:
- Current target menjadi invalid (mati, out of range, immune)
- Priority score dari target lain melebihi current target dengan threshold tertentu (biasanya 20%)
- Ability yang digunakan memerlukan target berbeda (AoE skills, buff on allies)
- AI behavior tree explicitly commands target change

### 5.4 Special Targeting Modes

**AoE (Area of Effect) Targeting** tidak memerlukan single target tetapi affects area. Untuk AoE skills, sistem menentukan area effect berdasarkan skill definition (circle, cone, line, atau rectangle), mengidentifikasi semua units dalam area tersebut (bisa friendly-only, enemy-only, atau all), dan menerapkan efek ke semua units yang valid.

**Self-Targeting** digunakan untuk abilities yang menargetkan user sendiri, seperti self-buffs atau self-healing. Self-targeting bypasses normal targeting validation dan selalu valid selama unit alive.

**No-Target (Ground-Targeted)** digunakan untuk abilities yang menargetkan posisi, bukan unit. Untuk ground-targeted abilities, sistem menentukan target position berdasarkan player input atau AI decision, validates bahwa position adalah valid (dalam range, not blocked), dan applies effect di area tersebut.

**Ally-Targeting** khusus untuk support abilities yang menargetkan allies. Validasi ally targeting memastikan bahwa target adalah friendly unit dan dalam range untuk effect yang dimaksud.

---

## 6. Sistem Cooldown dan Resource Management

### 6.1 Cooldown System

Cooldown system mengatur jeda waktu antara penggunaan abilities, mencegah spam yang dapat meng imbalance game dan memastikan tactical decision-making dalam penggunaan skills.

**Global Cooldown (GCD)** adalah periode waktu di mana semua actions dibatasi setelah menggunakan ability apapun. GCD dalam Textical adalah 1 detik dan dimulai pada saat ability digunakan. Selama GCD, unit tidak dapat menggunakan abilities lain tetapi masih dapat melakukan basic attacks. GCD dapat di-reduce atau di-eliminate oleh certain effects.

**Ability-Specific Cooldown** adalah cooldown unik untuk setiap ability, dimulai ketika ability digunakan. Cooldown ini terpisah untuk setiap ability, memungkinkan penggunaan multiple abilities dalam sequence yang berbeda. Contoh:
- Fireball: 6 detik cooldown
- Ice Shield: 12 detik cooldown
- Ultimate: 45 detik cooldown

**Cooldown Display** menunjukkan remaining cooldown kepada pemain dalam format yang jelas. Visual representation menggunakan progress bar atau number display yang countdown. Cooldown mulai berkurang setelah GCD selesai, bukan pada saat ability digunakan.

**Cooldown Reduction** dapat diperoleh dari:
- Equipment dengan CDR (Cooldown Reduction) stats
- Buffs yang memberikan CDR
- Passive skills dengan CDR effects
- Max CDR cap adalah 40%, mencegah CDR yang berlebihan

**Cooldown States** meliputi:
- **Ready**: Ability dapat digunakan
- **Active**: Ability sedang dalam GCD (1 detik setelah use)
- **On Cooldown**: Ability tidak dapat digunakan, countdown aktif
- **Disabled**: Ability tidak dapat digunakan karena kondisi lain (silenced, stunned)

### 6.2 Resource System

Resource system menyediakan mekanisme untuk membatasi penggunaan abilities, mendorong tactical resource management dan mencegah infinite ability spam.

**Mana** adalah primary resource untuk magical abilities. Mana memiliki regenerasi flat berdasarkan statistik **mana_regen** unit setiap tick. Mana juga dapat direcharge melalui:
- MP potions atau items
- Skills dengan mana restore effects
- Trait "Thinker"
- Buffs yang meningkatkan mana regeneration

**Rage** adalah secondary resource untuk melee berserker-style abilities. Rage meningkat melalui:
- Dealing damage (+1 rage per 10 damage)
- Receiving damage (+1 rage per 20 damage received)
- Critical hits (+5 rage)
- Max rage cap adalah 100

**Energy** adalah secondary resource untuk agile classes. Energy regenerasi sangat cepat (+10 per tick) dan digunakan untuk abilities dengan energy cost. Energy tidak memerlukan cooldown tetapi membatasi spam melalui resource consumption.

**Ultimate Gauge** adalah special resource yang terakumulasi sepanjang pertempuran. Gauge meningkat melalui:
- Dealing damage (+1% per 50 damage)
- Healing allies (+1% per 100 healing)
- Receiving damage (+1% per 100 damage received)
- Max gauge adalah 100%, triggering ultimate ability

### 6.3 Resource Costs Table

| Resource | Regeneration | Cap | Abilities Affected |
|----------|--------------|-----|-------------------|
| Mana | 5% max/tick + passive regen | 1000 | Spells, Magic skills |
| Rage | Damage dealt/received | 100 | Berserker skills, Fury abilities |
| Energy | 10/tick | 200 | Agile skills, Dodges |
| Ult Gauge | Combat actions | 100% | Ultimate abilities |

### 6.4 Cost Calculation

Resource cost untuk abilities dihitung berdasarkan:
- **Base Cost**: Cost dasar yang didefinisikan dalam skill definition
- **Stat Scaling**: Cost dapat diskalakan dengan relevant stats (misalnya, higher INT = lower spell cost)
- **Level Scaling**: Cost dapat meningkat atau menurun berdasarkan skill level
- **Equipment Modifiers**: Gear dapat mengurangi resource cost

Formula untuk adjusted cost:
```
Adjusted Cost = Base Cost × (1 - Stat Scaling Factor) × (1 - Equipment Reduction)
```

### 6.5 Insufficient Resource Handling

Ketika unit mencoba menggunakan ability tetapi resource tidak mencukupi:
1. Action di-cancel dan feedback diberikan ke player
2. Animation untuk ability tidak diputar
3. Cooldown untuk ability tidak dimulai
4. Message ditampilkan: "Not enough [Resource]"

Exceptions untuk rules ini:
- **Cost Reduction Timing**: Resource cost reduction dari buffs dihitung sebelum cost check, memungkinkan abilities yang normally out of range untuk digunakan dengan buff aktif
- **Emergency Abilities**: Beberapa abilities memiliki "emergency mode" yang memungkinkan penggunaan tanpa resource dengan reduced effectiveness

---

## 7. Flow Diagram Pertarungan

### 7.1 Alur Pertarungan dari Awal hingga Selesai

```
┌─────────────────────────────────────────────────────────────────┐
│                    BATTLE START SEQUENCE                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. Initialization                            │
│  • Load battle participants (heroes + enemies)                  │
│  • Initialize grid with unit positions                          │
│  • Calculate all unit stats (12-layer pipeline)                 │
│  • Apply pre-battle buffs and setup effects                    │
│  • Setup AI behavior trees for NPC units                       │
│  • Initialize combat logger for replay                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                                ▼
                    ┌─────────────────────┐
                    │   BATTLE LOOP       │
                    │   (Per Tick)        │
                    └─────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. Tick Start Phase                          │
│  • Regenerate resources (HP, MP, Energy)                        │
│  • Apply tick-based effects (Regen, DOT)                        │
│  • Process trait hook: onTickStart                              │
│  • Check for flee conditions (Coward trait)                     │
│  • Update AI state and target priorities                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. Action Selection                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ For Each Unit (ordered by Speed):                       │   │
│  │  • Check if unit is alive and not controlled (CC)       │   │
│  │  • If Player-Controlled: Wait for input or use auto     │   │
│  │  • If AI-Controlled: Execute behavior tree decision     │   │
│  │  • Select action: Attack, Skill, Move, Wait, Flee       │   │
│  │  • If Skill: Check resources and cooldowns              │   │
│  │  • If Move: Calculate path using EasyStar.js (A*)       │   │
│  │  • If Attack: Select target using priority system       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. Action Execution                          │
│  All selected actions execute SIMULTANEOUSLY in this tick       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Move Actions: Update grid positions                   │   │
│  │ • Attack Actions: Deal damage, apply on-hit effects     │   │
│  │ • Skill Actions: Apply skill effects, consume resources │   │
│  │ • Buff/Debuff: Apply status effects                     │   │
│  │ • Combo System: Detect and apply combo bonuses          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. Damage Application                        │
│  • Calculate base damage (formula detailed in Section 3)        │
│  • Apply defense reduction                                      │
│  • Apply elemental modifiers                                    │
│  • Apply critical hits                                          │
│  • Apply random variance                                        │
│  • Apply damage to target HP                                    │
│  • Trigger on-hit effects (lifesteal, reflect, etc.)           │
│  • Update combat metrics for logging                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. Status Update                             │
│  • Update durations for all active status effects               │
│  • Remove expired effects and clean up modifiers                │
│  • Process DOT effects (Burn, Poison, Bleed)                    │
│  • Apply terrain effects (lava damage, etc.)                    │
│  • Process trait hook: onTurnEnd / onTickEnd                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    7. Death Processing                          │
│  • Check units with HP ≤ 0                                      │
│  • Trigger Dying Breath (if applicable)                         │
│  • Process death effects (Slime split, etc.)                    │
│  • Remove dead units from grid                                   │
│  • Drop loot if applicable                                      │
│  • Update unit counts for both sides                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │  END CONDITION      │
                    │      CHECK          │
                    └─────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ All Enemies     │ │ All Heroes      │ │ Timeout         │
    │ Dead (Victory)  │ │ Dead (Defeat)   │ │ (Draw/Partial)  │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
              │                 │                 │
              └─────────────────┼─────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    8. Battle End                                │
│  • Calculate battle rewards (XP, gold, items)                   │
│  • Apply post-battle effects (healing, debuffs expire)          │
│  • Generate battle report and replay data                       │
│  • Send results to client for display                           │
│  • Cleanup temporary battle state                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │    EXIT      │
                         └──────────────┘
```

### 7.2 Sub-Process: Damage Calculation Flow

```
                    ┌─────────────────────────┐
                    │   DAMAGE CALCULATION    │
                    │        PROCESS          │
                    └─────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. Get Base Damage                           │
│  • Get attacker's attack stat (calculated)                      │
│  • Get skill's base damage multiplier                           │
│  • Apply trait modifiers (Berserker, etc.)                      │
│  • Result: Base Damage Value                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. Calculate Multipliers                     │
│  • Elemental interaction (Fire vs Water = 1.5x)                 │
│  • Position modifier (High Ground = +15%)                       │
│  • Terrain modifier (Forest = +Evasion)                         │
│  • Buff modifiers (Power buff = +30%)                           │
│  • Result: Total Multiplier                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. Check Critical                            │
│  • Get critical chance from stats                               │
│  • Roll random number (0-1)                                     │
│  • If roll < crit_chance: Apply crit multiplier (2.0x)          │
│  • Result: Critical Flag                                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. Apply Defense                             │
│  • Get target's defense stat                                    │
│  • Calculate reduction: Defense / (Defense + 100)               │
│  • Apply to damage                                              │
│  • Ensure minimum 1 damage                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. Apply Variance                            │
│  • Generate random variance (0.8 - 1.2)                         │
│  • Apply to damage                                              │
│  Result: Final Pre-Defense Damage                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. Apply to Target                           │
│  • Subtract from target HP                                      │
│  • Apply on-hit effects (lifesteal, thorns, etc.)               │
│  • Update target status (check for death)                       │
│  • Log damage dealt                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Tabel Referensi Combat Actions

### 8.1 Basic Attack Actions

| Action | Type | Cost | Damage | Range | Effects | Cooldown |
|--------|------|------|--------|-------|---------|----------|
| **Basic Melee** | Physical | None | 100% ATK | 1 tile | On-hit effects | 0s |
| **Basic Ranged** | Physical | None | 90% ATK | 3-5 tiles | None | 0s |
| **Power Strike** | Physical | 15 MP | 150% ATK | 1 tile | - | 4s |
| **Quick Strike** | Physical | 10 MP | 80% ATK | 1 tile | +20% Crit | 2s |
| **Heavy Smash** | Physical | 25 MP | 200% ATK | 1 tile | -50% Speed 3s | 6s |
| **Sniper Shot** | Physical | 20 MP | 120% ATK | 5-8 tiles | +30% Crit | 5s |

### 8.2 Magical Attack Actions

| Action | Type | Cost | Damage | Range | Effects | Cooldown |
|--------|------|------|--------|-------|---------|----------|
| **Fireball** | Fire | 30 MP | 120% MATK | 3 tiles | Burn 5% 3 stacks | 6s |
| **Ice Bolt** | Water | 25 MP | 100% MATK | 4 tiles | Slow 2 stacks | 5s |
| **Lightning** | Wind | 35 MP | 140% MATK | 5 tiles | Stun 1s | 7s |
| **Earthquake** | Earth | 50 MP | 100% MATK | 3 tiles AoE | -20% Def 5s | 10s |
| **Holy Light** | Light | 40 MP | 150% MATK | 4 tiles | Undead +50% dmg | 8s |
| **Dark Pulse** | Dark | 45 MP | 160% MATK | 3 tiles | - | 8s |

### 8.3 Support Actions

| Action | Type | Cost | Target | Effects | Cooldown |
|--------|------|------|--------|---------|----------|
| **Heal** | Light | 40 MP | Ally | 30% max HP | 6s |
| **Greater Heal** | Light | 70 MP | Ally | 60% max HP | 12s |
| **Group Heal** | Light | 100 MP | All Allies | 25% max HP | 15s |
| **Buff Power** | Support | 30 MP | Ally | +30% Atk 60s | 10s |
| **Buff Guard** | Support | 30 MP | Ally | +40% Def 60s | 10s |
| **Buff Haste** | Support | 25 MP | Ally | +20% Spd 30s | 8s |
| **Cleanse** | Support | 20 MP | Ally | Remove all debuffs | 8s |
| **Resurrect** | Light | 150 MP | Dead Ally | Revive 50% HP | 60s |

### 8.4 Crowd Control Actions

| Action | Type | Cost | Target | Effects | Duration | Cooldown |
|--------|------|------|--------|---------|----------|----------|
| **Stun Punch** | Physical | 20 MP | Enemy | Stun | 3s | 6s |
| **Freeze** | Water | 50 MP | Enemy | Freeze + Def-50% | 5s | 12s |
| **Silence** | Dark | 35 MP | Enemy | Silence | 8s | 10s |
| **Fear** | Dark | 45 MP | Enemy | Flee | 4s | 15s |
| **Taunt** | Physical | 30 MP | Enemy | Force target self | 6s | 8s |
| **Root** | Earth | 40 MP | Enemy | Cannot move | 5s | 10s |
| **Blind** | Wind | 25 MP | Enemy | -40% Hit Chance | 20s | 7s |
| **Sleep** | Light | 50 MP | Enemy | Sleep (wake on dmg) | 8s | 15s |

### 8.5 Ultimate Abilities

| Action | Type | Cost | Target/AoE | Effects | Cooldown |
|--------|------|------|------------|---------|----------|
| **Meteor Storm** | Fire | 100% Ult | 5 tiles | 300% MATK, Burn | 120s |
| **Tsunami** | Water | 100% Ult | 4 tiles AoE | 250% MATK, Freeze | 120s |
| **Thunder God** | Wind | 100% Ult | All enemies | 200% MATK, Stun | 120s |
| **World Tree** | Earth | 100% Ult | All allies | Full HP, +50% Def | 120s |
| **Divine Wrath** | Light | 100% Ult | 3 tiles AoE | 400% MATK, Undead +100% | 120s |
| **Shadow Realm** | Dark | 100% Ult | 4 tiles AoE | 300% MATK, Fear | 120s |
| **Omnislash** | Physical | 100% Ult | 3 attacks | 150% ATK each | 120s |
| **Phoenix Rise** | Light | 100% Ult | All allies | 75% HP, remove debuffs | 120s |

### 8.6 Trait Effects Reference

| Trait | Type | Trigger | Effect | Rating |
|-------|------|---------|--------|--------|
| **Giant** | Stat | Battle Start | +50% Max HP, -5 SPD | Tank |
| **Glass Cannon** | Stat | Battle Start | +80% ATK, -60% Max HP | DPS |
| **Berserker** | Dynamic | Turn Start | Up to +50% ATK based on missing HP | DPS |
| **Thinker** | Utility | Turn Start | +5 MP regen | Support |
| **Coward** | Dynamic | Tick Start | +10 SPD when HP < 30% | Utility |
| **Thorns** | Reactive | After Defend | Reflect 20% physical damage | Tank |
| **Vampire** | Reactive | On Lifesteal | 30% lifesteal on attacks | DPS |
| **Skeleton** | Racial | Turn Start | Immune to Poison/Burn | Utility |
| **Undead** | Racial | Before Death | 20% survive at 1 HP (once) | Utility |
| **Slime** | Racial | Death | Split into 2 Mini Slimes (40% HP) | Utility |

---

## 9. Panduan Developer

### 9.1 Struktur File Combat System (SRP Optimized)

Informasi teknis terbaru mengenai struktur file sistem combat:

```
server/src/
├── logic/
│   ├── battleSimulation.js    # Orkestrator utama simulasi (v2.0)
│   ├── battleRules.js         # Pengelola fase pertempuran & delegasi aksi
│   ├── combatRules.js         # Logika perhitungan damage & formula inti
│   ├── battleGrid.js          # Manajemen grid dinamis & pathfinding
│   ├── battleUnit.js          # Representasi entitas unit dalam pertempuran
│   ├── simulation/
│   │   ├── SimLoopProcessor.js # Pengelola Timeline Execution Loop
│   │   └── DelayCalculator.js  # Penghitung pemulihan (recovery) aksi
│   └── rules/
│       ├── CombatFormulaResolver.js      # Resolver Hit, Crit, Block
│       ├── ElementalEffectivenessResolver.js # Resolver Elemen & Lingkungan
│       ├── TacticalSensor.js             # Deteksi Flanking & Cover
│       └── ResourceResolver.js           # Manajemen Mana, Rage, Energy
```

### 9.2 Implementasi Damage Calculation

Untuk menambahkan atau memodifikasi damage calculation, edit file `server/src/logic/damageCalculator.js`:

```javascript
/**
 * Calculate damage for an attack
 * @param {Object} attacker - Attacker unit with calculated stats
 * @param {Object} defender - Defender unit with calculated stats
 * @param {Object} skill - Skill being used
 * @param {Object} context - Additional context (position, terrain, etc.)
 * @returns {Object} Damage result with breakdown
 */
function calculateDamage(attacker, defender, skill, context) {
    // Step 1: Get base damage from attack stat and skill
    let baseDamage = attacker.stats.attack_damage * skill.damageMultiplier;
    
    // Step 2: Apply trait modifiers
    baseDamage = applyTraitModifiers(attacker, baseDamage, 'onAttack');
    
    // Step 3: Calculate elemental multiplier
    const elementalMultiplier = calculateElementalMultiplier(
        skill.element,
        defender.element,
        attacker.elementalAffinities,
        defender.elementalAffinities
    );
    
    // Step 4: Calculate position and terrain modifiers
    const positionModifier = calculatePositionModifier(context.position);
    const terrainModifier = calculateTerrainModifier(context.terrain);
    
    // Step 5: Apply all multipliers
    let damage = baseDamage * elementalMultiplier * positionModifier * terrainModifier;
    
    // Step 6: Check for critical hit
    const isCritical = Math.random() < attacker.stats.crit_chance;
    if (isCritical) {
        damage *= attacker.stats.crit_damage;
    }
    
    // Step 7: Apply defense reduction
    const defenseReduction = defender.stats.defense / (defender.stats.defense + 100);
    damage = damage * (1 - defenseReduction);
    
    // Step 8: Apply random variance (±10%)
    damage = damage * (0.9 + Math.random() * 0.2);
    
    // Step 9: Ensure minimum damage
    damage = Math.max(1, Math.floor(damage));
    
    return {
        damage,
        isCritical,
        elementalMultiplier,
        defenseReduction,
        finalDamage: damage
    };
}
```

### 9.3 Implementasi Status Effects

Untuk membuat status effect baru, extends BaseStatus class:

```javascript
const BaseStatus = require('./baseStatus');

class BurnStatus extends BaseStatus {
    constructor(source, duration = 30, stacks = 1) {
        super('burn', 'debuff', source, duration);
        this.stacks = Math.min(stacks, 3); // Max 3 stacks
        this.tickDamage = 0.05; // 5% max HP per tick
    }
    
    /**
     * Apply initial effect to target
     */
    applyEffect(target) {
        // Add burn damage modifier if needed
        this.logger.debug(`Burn applied to ${target.id} with ${this.stacks} stacks`);
    }
    
    /**
     * Process effect on each tick
     */
    tickEffect(target, tickNumber) {
        const damage = target.stats.hp_max * this.tickDamage * this.stacks;
        target.takeDamage(damage, 'fire', this.source);
        this.logger.debug(`Burn tick ${tickNumber}: ${damage} fire damage to ${target.id}`);
    }
    
    /**
     * Check if effect can stack
     */
    canStackWith(existingStatus) {
        return existingStatus.type === 'burn' && this.stacks < 3;
    }
    
    /**
     * Merge with existing stack
     */
    stackWith(existingStatus) {
        existingStatus.stacks = Math.min(3, existingStatus.stacks + this.stacks);
        existingStatus.refreshDuration();
    }
}

module.exports = BurnStatus;
```

### 9.4 Konfigurasi AI Behavior

Untuk mengkonfigurasi AI behavior untuk unit baru, buat behavior tree di `server/src/ai/behaviorTrees/`:

```javascript
const { Sequence, Selector, Action, Condition } = require('../btNodes');

/**
 * Create aggressive DPS AI behavior tree
 */
function createAggressiveDPSBehavior() {
    return new Selector([
        // Priority 1: Use ultimate if available
        new Sequence([
            new Condition('ultGauge >= 100'),
            new Action('useUltimate')
        ]),
        
        // Priority 2: Kill low HP target
        new Sequence([
            new Condition('hasTarget'),
            new Condition('target.hp < target.maxHp * 0.2'),
            new Action('attackTarget')
        ]),
        
        // Priority 3: Use high damage skill
        new Sequence([
            new Condition('skillCooldown.heavySmash == 0'),
            new Condition('mana >= 25'),
            new Action('useSkill:heavySmash')
        ]),
        
        // Priority 4: Basic attack
        new Sequence([
            new Condition('hasTarget'),
            new Action('basicAttack')
        ]),
        
        // Priority 5: Move closer to target
        new Sequence([
            new Condition('targetOutOfRange'),
            new Action('moveToTarget')
        ])
    ]);
}

module.exports = { createAggressiveDPSBehavior };
```

### 9.5 Debugging Combat Issues

Untuk debugging combat issues, gunakan Combat Logger:

```javascript
const combatLogger = require('../utils/combatLogger');

// Enable debug logging
combatLogger.setLevel('debug');

// Log specific events
combatLogger.logDamage(attacker, defender, damage, skill);
combatLogger.logStatusEffect(target, effect, action);
combatLogger.logCombatEvent(tick, eventType, details);

// Export battle replay for analysis
const replayData = combatLogger.exportReplay();
fs.writeFileSync('battle_replay.json', JSON.stringify(replayData, null, 2));
```

### 9.6 Testing Guidelines

Untuk setiap perubahan pada sistem combat:

1. **Unit Tests**: Test setiap fungsi dengan input yang berbeda
2. **Integration Tests**: Test interaksi antar komponen combat
3. **Balance Tests**: Verifikasi bahwa damage values masih dalam expected ranges
4. **Edge Case Tests**: Test kondisi boundary (0 HP, max stacks, etc.)

```javascript
// Contoh test untuk damage calculator
describe('DamageCalculator', () => {
    test('should calculate correct damage for normal attack', () => {
        const attacker = createTestHero({ attack: 100, crit_chance: 0, crit_damage: 2.0 });
        const defender = createTestMonster({ defense: 20, hp: 500 });
        const skill = { damageMultiplier: 1.0, element: 'physical' };
        
        const result = calculateDamage(attacker, defender, skill, {});
        
        expect(result.damage).toBeGreaterThan(60);
        expect(result.damage).toBeLessThan(90);
    });
    
    test('should apply critical hit correctly', () => {
        const attacker = createTestHero({ attack: 100, crit_chance: 1.0, crit_damage: 2.0 });
        const defender = createTestMonster({ defense: 20, hp: 500 });
        
        // Run multiple times to ensure crit always applies
        for (let i = 0; i < 10; i++) {
            const result = calculateDamage(attacker, defender, basicAttack, {});
            expect(result.isCritical).toBe(true);
        }
    });
});
```

---

## 10. Panduan Tester

### 10.1 Test Cases untuk Damage System

**TC-CMB-001: Basic Attack Damage**
- **Objective**: Verifikasi bahwa basic attack menghasilkan damage sesuai formula
- **Preconditions**: Hero dengan 100 ATK, enemy dengan 50 DEF
- **Steps**:
  1. Hero menyerang enemy dengan basic attack
  2. Catat damage yang dihasilkan
- **Expected Result**: Damage antara 67-83 (expected 75 ±10%)
- **Pass Criteria**: Damage dalam range expected

**TC-CMB-002: Critical Hit**
- **Objective**: Verifikasi bahwa critical hit memberikan damage 2x dengan probabilitas yang benar
- **Preconditions**: Hero dengan 25% crit chance
- **Steps**:
  1. Hero menyerang enemy 100 kali
  2. Hitung jumlah critical hits
- **Expected Result**: Sekitar 25 critical hits (range 20-30)
- **Pass Criteria**: Critical rate dalam ±5% dari expected

**TC-CMB-003: Elemental Multiplier**
- **Objective**: Verifikasi interaksi elemental memberikan multiplier yang benar
- **Preconditions**: Fire attacker (no affinity), Water target (no resistance)
- **Steps**:
  1. Fire attack ke Water target
  2. Bandingkan dengan neutral element attack
- **Expected Result**: Fire attack menghasilkan 1.5x damage
- **Pass Criteria**: Damage ratio = 1.5x ±0.05

**TC-CMB-004: Defense Reduction**
- **Objective**: Verifikasi bahwa defense reduction bekerja sesuai formula
- **Preconditions**: Hero dengan fixed damage 100, enemy dengan varying DEF
- **Steps**:
  1. Attack enemy dengan DEF 0
  2. Attack enemy dengan DEF 50
  3. Attack enemy dengan DEF 100
- **Expected Result**:
  - DEF 0: Damage 100
  - DEF 50: Damage 67 (100 × (50/150))
  - DEF 100: Damage 50 (100 × (100/200))
- **Pass Criteria**: Damage sesuai formula dalam ±1

### 10.2 Test Cases untuk Status Effects

**TC-STF-001: Buff Application**
- **Objective**: Verifikasi buff diterapkan dengan benar
- **Preconditions**: Hero dengan 100 ATK
- **Steps**:
  1. Apply Power buff (+30% ATK)
  2. Cek stat ATK
- **Expected Result**: ATK = 130
- **Pass Criteria**: ATK = 130 ±1

**TC-STF-002: Buff Duration**
- **Objective**: Verifikasi buff expires setelah durasi yang benar
- **Preconditions**: Power buff dengan durasi 60 detik
- **Steps**:
  1. Apply buff
  2. Wait 59 detik
  3. Cek buff masih aktif
  4. Wait 2 detik
  5. Cek buff sudah expired
- **Expected Result**: Buff aktif di detik 59, expired di detik 61
- **Pass Criteria**: Buff expires dalam ±1 detik dari expected

**TC-STF-003: Debuff Stacking**
- **Objective**: Verifikasi stacking debuff bekerja dengan benar
- **Preconditions**: Enemy dengan 100 ATK
- **Steps**:
  1. Apply 2x Weak debuff (-25% ATK each)
  2. Cek ATK enemy
- **Expected Result**: ATK = 50 (100 × 0.5)
- **Pass Criteria**: ATK = 50 ±1

**TC-STF-004: DOT Application**
- **Objective**: Verifikasi DOT damage diterapkan per tick
- **Preconditions**: Enemy dengan 1000 HP, 3x Burn stacks (5% per tick)
- **Steps**:
  1. Apply 3x Burn
  2. Wait 10 ticks
  3. Cek HP enemy
- **Expected Result**: Damage = 1000 × 0.05 × 3 × 10 = 1500, tetapi HP tidak bisa negatif
  - Enemy HP = 0
- **Pass Criteria**: Enemy HP = 0, total DOT damage = 1500

### 10.3 Test Cases untuk Cooldown System

**TC-CLD-001: Cooldown Progression**
- **Objective**: Verifikasi cooldown berkurang dengan benar per tick
- **Preconditions**: Skill dengan 6 detik cooldown
- **Steps**:
  1. Gunakan skill
  2. Cek cooldown immediately (5.0s)
  3. Wait 1 tick
  4. Cek cooldown (4.0s)
- **Expected Result**: Cooldown berkurang 1 detik per tick
- **Pass Criteria**: Cooldown values sesuai expected

**TC-CLD-002: Insufficient Resource**
- **Objective**: Verifikasi skill tidak dapat digunakan jika resource tidak mencukupi
- **Preconditions**: Hero dengan 10 MP, skill dengan 15 MP cost
- **Steps**:
  1. Coba gunakan skill
- **Expected Result**: Skill tidak digunakan, message "Not enough MP" ditampilkan
- **Pass Criteria**: Skill tidak terpakai, message ditampilkan

### 10.4 Test Cases untuk Targeting System

**TC-TGT-001: Range Validation**
- **Objective**: Verifikasi attack tidak dapat dilakukan jika target out of range
- **Preconditions**: Hero dengan 3 tile range, enemy di tile 5
- **Steps**:
  1. Coba serang enemy
- **Expected Result**: Attack gagal, message "Target out of range"
- **Pass Criteria**: Attack tidak dilakukan, appropriate error

**TC-TGT-002: Target Priority AI**
- **Objective**: Verifikasi AI memilih target sesuai priority
- **Preconditions**: AI dengan "Lowest HP" priority, 3 enemies dengan HP berbeda
- **Steps**:
  1. AI selects target
- **Expected Result**: AI memilih enemy dengan HP terendah
- **Pass Criteria**: Target adalah enemy dengan HP terendah

### 10.5 Test Scenarios untuk Full Combat

**Scenario 1: 1v1 Hero vs Monster**
- Setup: Hero level 10, Monster level 10
- Expected Duration: 30-60 detik
- Expected Outcome: Hero menang dengan 20-80% HP tersisa
- Test: Verifikasi combat ends dengan correct result

**Scenario 2: 5v5 Team Battle**
- Setup: 5 Heroes vs 5 Monsters
- Expected Duration: 2-5 menit
- Expected Outcome: Either side dapat menang
- Test: Verifikasi semua units bertindak, combat ends dengan correct result

**Scenario 3: Flee Mechanic**
- Setup: Hero dengan Coward trait, HP < 30%
- Expected: Hero mencoba kabur ke flee zone
- Test: Verifikasi hero bergerak ke flee zone ketika HP low

---

## 11. Skenario Pertarungan

### 11.1 Skenario: Pertarungan 3 Hero vs 5 Monster

**Setup Pertarungan:**
- **Hero Team**:
  - Warrior (Frontline, Position A1) - HP 500, ATK 80, DEF 40
  - Mage (Midline, Position B2) - HP 300, MATK 100, DEF 15
  - Healer (Backline, Position C3) - HP 250, MATK 60, DEF 10
  
- **Enemy Team**:
  - Goblin x3 (Frontline) - HP 150, ATK 30, DEF 10
  - Orc Warrior (Midline) - HP 300, ATK 50, DEF 30
  - Orc Shaman (Backline) - HP 200, MATK 45, DEF 10

**Terrain**: Flat terrain, no obstacles

**Tick 1 - Initialization:**
1. Grid diinisialisasi dengan semua unit di posisi masing-masing
2. Stats dihitung menggunakan 12-layer pipeline
3. AI behavior trees di-setup untuk monster
4. Combat logger dimulai untuk replay

**Tick 2 - Tick Start:**
1. Warrior regen 5% HP = +25 HP (HP: 500 → 525)
2. Mage regen 5% HP = +15 HP (HP: 300 → 315)
3. Healer regen 5% HP = +12 HP (HP: 250 → 262)
4. Goblins regen 5% HP = +7 HP each
5. Coward check: Tidak ada unit dengan HP < 30%

**Tick 3 - Action Selection:**

*Warrior (SPD 15):*
- AI decision: Attack closest enemy (Goblin 1 di A2)
- Selected action: Basic Attack ke Goblin 1

*Mage (SPD 20):*
- AI decision: AoE Fireball ke frontlinie
- Selected action: Fireball (30 MP) ke area A1-A3
- MP Check: Mage MP 100 ≥ 30, OK
- Cooldown Check: Fireball ready (cooldown 6s, last used 7 ticks ago)

*Healer (SPD 12):*
- AI decision: Heal lowest HP ally (Mage HP 315/420 = 75%)
- Selected action: Heal ke Mage

*Goblin 1 (SPD 10):*
- AI decision: Attack closest hero (Warrior di A1)
- Selected action: Basic Attack ke Warrior

*Goblin 2 (SPD 10):*
- AI decision: Attack closest hero (Warrior di A1)
- Selected action: Basic Attack ke Warrior

*Goblin 3 (SPD 10):*
- AI decision: Flank to side (Move ke B1 untuk better position)
- Selected action: Move ke B1

*Orc Warrior (SPD 8):*
- AI decision: Tank mode - protect shaman
- Selected action: Move ke A2 (cover shaman)

*Orc Shaman (SPD 7):*
- AI decision: Debuff warrior
- Selected action: Weak curse (25 MP) ke Warrior
- MP Check: Shaman MP 80 ≥ 25, OK

**Tick 4 - Action Execution (Simultaneous):**

1. **Warrior Attack Goblin 1:**
   - Damage = 80 × 1.0 (basic attack) = 80
   - Defense reduction: 10 / (10 + 100) = 0.091
   - Final damage = 80 × 0.909 = 73
   - Goblin 1 HP: 150 → 77

2. **Mage Fireball AoE (A1-A3):**
   - Base damage = 100 × 1.2 = 120
   - Hit Goblin 1, Goblin 2, Goblin 3, Orc Warrior
   - Goblin 1 (Fire weak): 120 × 1.5 = 180, DEF 10 → 164 damage
   - Goblin 1 HP: 77 → 0 (DEAD)
   - Goblin 2 (Fire neutral): 120 × 1.0 = 120, DEF 10 → 109 damage
   - Goblin 2 HP: 150 → 41
   - Goblin 3 (Fire weak): 120 × 1.5 = 180, DEF 10 → 164 damage
   - Goblin 3 HP: 150 → 0 (DEAD) + Burn 5% 3 stacks
   - Orc Warrior (Fire weak): 120 × 1.5 = 180, DEF 30 → 127 damage
   - Orc Warrior HP: 300 → 173

3. **Healer Heal Mage:**
   - Heal amount = 300 × 0.30 = 90
   - Mage HP: 315 → 405 (capped at max 420)

4. **Goblin 1 Attack Warrior:**
   - Damage = 30 × 1.0 = 30
   - Defense reduction: 40 / (40 + 100) = 0.286
   - Final damage = 30 × 0.714 = 21
   - Warrior HP: 525 → 504

5. **Goblin 2 Attack Warrior:**
   - Same calculation as Goblin 1
   - Final damage = 21
   - Warrior HP: 504 → 483

6. **Goblin 3 Move:**
   - Move dari A3 ke B1
   - Cost: 1 movement point (flat terrain)

7. **Orc Warrior Move:**
   - Move dari B2 ke A2
   - Cost: 1 movement point

8. **Orc Shaman Weak Curse Warrior:**
   - Apply 2x Weak debuff (max 2 stacks)
   - Warrior ATK modifier: 1 - (0.25 × 2) = 0.5
   - Warrior ATK effective: 80 × 0.5 = 40
   - Duration: 30 detik

**Tick 5 - Status Update:**
1. Check expired effects: None
2. Apply DOT: Goblin 3 Burn (already dead, ignored)
3. Update durations: Weak debuff -1 tick (29 remaining)

**Tick 6 - Death Processing:**
1. Goblin 1 HP 0: Trigger death effects
   - No death effect for Goblin
   - Remove from grid
   - Update enemy count: 5 → 4
2. Goblin 3 HP 0: Trigger death effects
   - No death effect for Goblin
   - Remove from grid
   - Update enemy count: 4 → 3

**Combat Continues...**

**Tick 15 - Combat Summary:**
- **Dead Units**: Goblin 1, Goblin 3, 2 Goblins remaining (1 injured)
- **Hero HP**: Warrior 350, Mage 380, Healer 200
- **Enemy HP**: Goblin 2 (41), Orc Warrior (120), Orc Shaman (180)
- **Buffs/Debuffs Active**: Warrior Weak (15 ticks remaining)
- **Cooldowns**: Fireball 3 ticks remaining

**Tick 20 - Warrior Dies:**
- Orc Warrior attacks Warrior
- Warrior HP reaches 0
- Dying Breath triggers: Warrior gets 1 final attack
- Warrior attacks Orc Warrior for 40 damage (reduced by Weak)
- Warrior dies
- Combat continues with 2 heroes vs 3 enemies

**Tick 35 - Victory:**
- Last enemy (Orc Shaman) dies
- Combat ends
- Victory condition met: All enemies dead
- Rewards calculated: XP, gold, drops
- Battle report generated

### 11.2 Skenario: Combo Chain Execution

**Setup**: 3 heroes attacking same target dalam tick yang sama

**Tick Setup:**
- Archer (Position C1) - Ready to shoot
- Mage (Position C2) - Ready to cast Fireball
- Warrior (Position B1) - Ready to attack

**Tick Execution:**

1. **Archer fires arrow (SPD 25):**
   - Basic ranged attack ke Orc Boss
   - Damage: 120
   - Triggers: "Precision" trait (+10% damage)

2. **Mage casts Fireball (SPD 20):**
   - Fireball ke Orc Boss
   - Damage: 180 (Fire element, Orc is neutral)
   - Combo detection: Archer attacked same target this tick
   - Combo bonus: +15% damage
   - Final damage: 180 × 1.15 = 207

3. **Warrior attacks (SPD 15):**
   - Power Strike ke Orc Boss
   - Base damage: 150
   - Combo detection: Archer + Mage attacked same target
   - Combo bonus: +30% damage (2 prior attacks)
   - Final damage: 150 × 1.30 = 195

4. **Combo Chain Result:**
   - Total damage this tick: 120 + 207 + 195 = 522
   - Without combo: 120 + 180 + 150 = 450
   - Bonus damage: +72 (16% increase)
   - Combo meter increased for future combo bonuses

### 11.3 Skenario: Terrain and Positioning

**Setup**: Battle di mixed terrain

**Terrain Effects:**
- Lava tiles (A1-A2): 10 fire damage per step
- Forest tiles (B1-B2): +20% Evasion
- High Ground (C1): +15% Damage
- Mud tiles (B3-B4): 3x movement cost

**Tick 5 - Movement Phase:**

*Warrior tries to cross Mud tiles:*
- Path: A3 → B3 → B2 (Forest) → C2 (High Ground)
- Distance: 3 tiles
- Mud penalty: B3 costs 3 movement points
- Total movement cost: 1 + 3 + 1 = 5 points
- Warrior SPD: 10, Movement points per tick: 10
- Can complete movement: Yes

*Mage moves ke High Ground:*
- Path: B2 → B1 → C1
- Distance: 2 tiles
- High Ground bonus: Will apply on next attack
- Total movement cost: 1 + 1 = 2 points
- Can complete movement: Yes

*Goblin tries to cross Lava:*
- Path: A4 → A3 → A2 (Lava)
- Distance: 2 tiles
- Lava damage: 10 per step
- Takes 10 fire damage entering A2
- Goblin HP: 150 → 140

**Next Attack from High Ground:**
- Mage casts Fireball dari C1 (High Ground)
- Base damage: 120
- High Ground modifier: +15% = 138
- Final damage: 138
- Without positioning: 120

---

## 12. Troubleshooting

### 12.1 Known Issues

**Issue CMB-001: Damage Overflow pada High Multipliers**
- **Description**: Damage dapat overflow integer limits pada极端 cases dengan multiple multipliers
- **Severity**: Medium
- **Symptoms**: Negative damage values, crash pada extreme damage calculations
- **Cause**: Multiple multipliers (>10x) dari buffs, combos, dan crits
- **Workaround**: Gunakan BigInt untuk calculations atau clamp multipliers
- **Fix Status**: Planned for v2.0
- **Workaround Code**:
  ```javascript
  // Apply multipliers dengan safety checks
  let totalMultiplier = 1;
  const MAX_MULTIPLIER = 10; // Cap untuk mencegah overflow
  
  multipliers.forEach(m => {
      totalMultiplier = Math.min(MAX_MULTIPLIER, totalMultiplier * m);
  });
  ```

**Issue CMB-002: Floating Point Precision Errors**
- **Description**: Floating point calculations dapat menghasilkan slight inaccuracies
- **Severity**: Low
- **Symptoms**: Damage off by 1-2 points dari expected
- **Cause**: IEEE 754 floating point limitations
- **Workaround**: Round results ke integers
- **Fix Status**: Implemented dengan rounding
- **Related Code**:
  ```javascript
  function calculateDamageWithPrecision(...) {
      // Use Math.round untuk final result
      return Math.round(damage);
  }
  ```

**Issue STF-001: Stacking Buffs Overwrites Incorrectly**
- **Description**: Applying same buff type dapat overwrite daripada stack/refresh
- **Severity**: Medium
- **Symptoms**: Buff duration resets tetapi values tidak
- **Cause**: Logic error dalam stack detection
- **Workaround**: Manual refresh untuk affected buffs
- **Fix Status**: Fixed in v1.5
- **Verification**: Run TC-STF-001 dan TC-STF-002

**Issue STF-002: DOT continues after death**
- **Description**: DOT effects dapat kill already-dead units dengan post-mortem damage
- **Severity**: Low
- **Symptoms**: Unit appears dead but takes additional damage ticks
- **Cause**: DOT tick processing occurs sebelum death check
- **Workaround**: Death check dilakukan sebelum DOT application
- **Fix Status**: Fixed in v1.4

**Issue TGT-001: Target Selection Edge Case**
- **Description**: AI selects invalid target when all valid targets at same priority
- **Severity**: Low
- **Symptoms**: AI unit does nothing for a tick
- **Cause**: Random selection seeded with same value for all targets
- **Workaround**: Add timestamp-based randomness ke selection
- **Fix Status**: Fixed in v1.3

**Issue CLD-001: Cooldown not resetting on battle restart**
- **Description**: Cooldowns persist across battle restarts dengan same encounter
- **Severity**: Critical
- **Symptoms**: Skills unavailable despite fresh battle
- **Cause**: Cooldown state tidak cleared pada battle initialization
- **Workaround**: Reload game atau clear cache
- **Fix Status**: Fixed in v1.6
- **Related Code**:
  ```javascript
  function initializeBattle(encounterId) {
      // Clear all cooldowns untuk fresh battle
      this.cooldownManager.resetAllCooldowns();
      
      // Initialize new cooldowns untuk skills
      this.skillRepository.getSkillsForEncounter(encounterId)
          .forEach(skill => {
              this.cooldownManager.initializeSkill(skill.id);
          });
  }
  ```

**Issue CLD-002: GCD blocks basic attacks incorrectly**
- **Description**: Basic attacks sometimes blocked during GCD
- **Severity**: Medium
- **Symptoms**: Players cannot attack during GCD window
- **Cause**: GCD flag tidak cleared dengan benar
- **Workaround**: Wait untuk GCD complete atau restart client
- **Fix Status**: Fixed in v1.5

**Issue AI-001: AI stuck in infinite loop pada obstacle-heavy maps**
- **Description**: AI attempts to reach unreachable target repeatedly
- **Severity**: Medium
- **Symptoms**: AI unit does nothing atau moves back and forth
- **Cause**: EasyStar.js pathfinding fails to find path tetapi retries indefinitely
- **Workaround**: Add max retries dan fallback behavior
- **Fix Status**: Partial fix in v1.4
- **Related Code**:
  ```javascript
  function findPathWithFallback(unit, target) {
      const MAX_RETRIES = 3;
      let attempts = 0;
      
      while (attempts < MAX_RETRIES) {
          const path = pathfinder.findPath(unit.position, target.position);
          if (path) return path;
          attempts++;
      }
      
      // Fallback: Attack closest reachable target atau wait
      return getFallbackAction(unit);
  }
  ```

### 12.2 Edge Cases

**Edge Case 1: Simultaneous Death**
- **Scenario**: Dua unit membunuh satu sama lain dalam tick yang sama
- **Handling**: Kedua unit dies, combat continues dengan remaining units
- **Verification**: Run test dengan both units at 1 HP, attacking each other
- **Expected**: Both units die, no errors

**Edge Case 2: Zero HP with Lifesteal**
- **Scenario**: Unit at 1 HP deals damage dengan lifesteal
- **Handling**: Death occurs before lifesteal heals
- **Verification**: Test unit dengan 1 HP attacking higher HP enemy
- **Expected**: Unit dies, no healing applied

**Edge Case 3: Full Buff Stacks dengan Refresh**
- **Scenario**: Applying buff yang sudah max stacks
- **Handling**: Duration refreshes, stacks tidak increase
- **Verification**: Apply Power buff 3x consecutively
- **Expected**: Stacks remain at max (1), duration resets each time

**Edge Case 4: Cooldown expire during action queue**
- **Scenario**: Cooldown expires tepat saat action selected
- **Handling**: Skill available untuk use in current tick
- **Verification**: Test skill dengan 6s cooldown, using at tick 0 dan 6
- **Expected**: Skill usable at tick 6

**Edge Case 5: Ultimate gauge overflow**
- **Scenario**: Multiple damage sources in same tick push gauge > 100%
- **Handling**: Gauge capped at 100%, excess lost
- **Verification**: Test dengan massive damage in single tick
- **Expected**: Gauge reaches 100%, no overflow errors

**Edge Case 6: Terrain movement dengan obstacles**
- **Scenario**: Unit tries to move through unit-occupied tile
- **Handling**: Movement blocked, unit stays in place
- **Verification**: Test unit attempting to move through friendly unit
- **Expected**: Movement blocked, no error

**Edge Case 7: AoE with mixed friend/foe targets**
- **Scenario**: AoE skill hits both allies dan enemies
- **Handling**: Apply effects to each target based on target type
- **Verification**: Test Fireball hitting party member dan enemy
- **Expected**: Enemy takes damage, ally takes reduced damage atau none

**Edge Case 8: Resurrection dengan DOT active**
- **Scenario**: Unit resurrected while DOT effects still active
- **Handling**: DOT effects continue dari where they left off
- **Verification**: Test resurrecting unit dengan active Burn
- **Expected**: Burn continues ticking on resurrected unit

### 12.3 Debug Commands

Untuk debugging combat issues, gunakan command berikut:

```javascript
// Enable combat debugging
combatSystem.setDebugMode(true);

// Log specific combat events
combatLogger.enableEventLog('damage');
combatLogger.enableEventLog('status');
combatLogger.enableEventLog('targeting');

// Export battle state for analysis
const state = combatSystem.getBattleState();
console.log(JSON.stringify(state, null, 2));

// Force end battle untuk testing
combatSystem.forceEndBattle('debug_termination');
```

### 12.4 Performance Considerations

**Optimization Tips:**
1. Cache calculated stats untuk reuse across ticks
2. Use object pooling untuk status effects
3. Batch DOM updates untuk combat UI
4. Limit logging verbosity di production

**Monitoring Points:**
- Memory usage untuk large battles (50+ units)
- CPU usage untuk pathfinding calculations
- Network bandwidth untuk battle state sync
- Frame rate untuk client-side visualization

### 12.5 Contact dan Support

Untuk issues yang tidak tercakup dalam dokumentasi ini:

1. **Check Existing Issues**: [GitHub Issues Page]
2. **Create New Issue**: Include reproduction steps dan expected behavior
3. **Emergency Hotfix**: Contact lead developer untuk critical issues
4. **Documentation Updates**: Submit PR untuk documentation improvements

---

## Lampiran

### A. Glossarium Istilah

| Istilah | Definisi |
|---------|----------|
| **Tick** | Unit waktu terkecil dalam sistem combat (biasanya 1 detik) |
| **GCD (Global Cooldown)** | Periode waktu di mana unit tidak dapat menggunakan abilities setelah menggunakan satu |
| **AoE (Area of Effect)** | Skill yang affects area, tidak hanya single target |
| **DOT (Damage Over Time)** | Damage yang applied secara bertahap selama periode waktu |
| **CC (Crowd Control)** | Efek yang membatasi kemampuan unit untuk bertindak |
| **Crit (Critical)** | Serangan dengan damage yang increased |
| **CDR (Cooldown Reduction)** | Pengurangan waktu cooldown dari abilities |
| **SPD (Speed)** | Statistik yang menentukan seberapa sering unit dapat bertindak |

### B. Revision History

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2024-01-15 | Initial release |
| 1.1 | 2024-02-20 | Added section 11 (Scenarios) |
| 1.2 | 2024-03-10 | Added troubleshooting section |
| 1.3 | 2024-04-05 | Updated damage formulas, added edge cases |
| 1.4 | 2024-05-15 | Fixed CMB-002, TGT-001 issues |
| 1.5 | 2024-06-01 | Added developer guidelines, STF fixes |

### C. Referensi Terkait

- [STAT_SYSTEM.md](STAT_SYSTEM.md) - Dokumentasi sistem statistik lengkap
- [COMBAT_TACTICS.md](konsep/COMBAT_TACTICS.md) - Konsep dan desain awal combat
- [TRAITS_REFERENCE.md](TRAITS_REFERENCE.md) - Referensi trait system
- [API.md](API.md) - Combat API reference

---

*Dokumen ini terakhir diperbarui: 2024-06-01*
