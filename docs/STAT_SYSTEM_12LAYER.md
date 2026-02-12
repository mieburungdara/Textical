# Dokumentasi Teknis: Sistem Statistik 12-Layer

**Versi Dokumentasi:** 1.0  
**Tanggal Pembuatan:** 2024-06-01  
**Versi Kompatibilitas:** Textical v1.0+

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Gambaran Umum Sistem](#2-gambaran-umum-sistem)
3. [Arsitektur Pipeline 12-Layer](#3-arsitektur-pipeline-12-layer)
4. [Detail Implementasi Setiap Layer](#4-detail-implementasi-setiap-layer)
5. [Komponen Pendukung](#5-komponen-pendukung)
6. [Contoh Penggunaan dan Perhitungan](#6-contoh-penggunaan-dan-perhitungan)
7. [Integrasi dengan Sistem Lain](#7-integrasi-dengan-sistem-lain)
8. [Panduan Developer](#8-panduan-developer)
9. [Troubleshooting dan FAQ](#9-troubleshooting-dan-faq)
10. [Referensi](#10-referensi)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumentasi

Dokumentasi ini bertujuan untuk memberikan pemahaman komprehensif mengenai sistem perhitungan statistik (stat system) dengan pendekatan pipeline 12-layer yang digunakan dalam game Textical. Sistem ini menjadi fondasi utama dalam menentukan kemampuan setiap unit dalam game, baik itu hero, monster, maupun NPC. Dengan adanya dokumentasi ini, developer, tester, dan kontributor dapat memahami cara kerja sistem secara mendalam, mengimplementasikan fitur baru dengan konsisten, serta melakukan debugging dan troubleshooting dengan efektif.

Sistem statistik 12-layer dirancang untuk mengatasi kompleksitas dalam perhitungan statistik yang melibatkan berbagai sumber modifier seperti equipment, buffs, skills, events, dan berbagai faktor lainnya. Pendekatan layered memungkinkan setiap sumber modifier diproses secara independen dan berurutan, sehingga memudahkan dalam hal debugging, balancing, dan pengembangan fitur baru tanpa mempengaruhi lapisan lainnya.

### 1.2 Ruang Lingkup

Dokumentasi ini mencakup seluruh aspek teknis dari sistem statistik 12-layer, dimulai dari arsitektur high-level hingga detail implementasi kode. Fokus utama adalah pada penjelasan setiap layer dalam pipeline perhitungan, interaksi antar layer, komponen pendukung yang digunakan, serta panduan praktis untuk developer dan tester. Dokumen ini tidak mencakup desain game balancing atau nilai-nilai spesifik untuk setiap stat, karena nilai-nilai tersebut dapat berubah sesuai kebutuhan balancing game.

### 1.3 Istilah dan Definisi

Sebelum melanjutkan, berikut adalah daftar istilah teknis yang digunakan dalam dokumentasi ini beserta definisinya:

| Istilah | Definisi |
|---------|----------|
| **Stat (Statistik)** | Atribut numerik yang mendefinisikan kemampuan unit, seperti HP, ATK, DEF, dan sebagainya. |
| **Modifier** | Nilai yang mengubah stat dasar, dapat berupa penambahan flat, persentase, atau multiplier. |
| **Layer** | Tingkat dalam pipeline perhitungan yang memproses satu jenis sumber modifier. |
| **Base Value** | Nilai statistik dasar sebelum applying modifier dari layer manapun. |
| **Cap (Batas)** | Batas maksimum atau minimum yang diterapkan pada nilai statistik. |
| **Soft Cap** | Batas yang menerapkan diminishing returns ketika nilai melampaui batas tersebut. |
| **Hard Cap** | Batas absolut yang tidak dapat dilampaui oleh nilai statistik manapun. |
| **Growth Curve** | Fungsi matematika yang menentukan bagaimana stat meningkat berdasarkan level. |
| **Affinitas Elemen** | Kecenderungan unit terhadap elemen tertentu, mempengaruhi damage yang diberikan dan diterima. |
| **Set Bonus** | Bonus tambahan yang diperoleh ketika sejumlah equipment dari set yang sama dikenakan. |

---

## 2. Gambaran Umum Sistem

### 2.1 Filosofi Desain

Sistem statistik 12-layer dibangun berdasarkan beberapa prinsip desain fundamental yang memastikan modularitas, skalabilitas, dan maintainability dalam jangka panjang. Prinsip pertama adalah **Separation of Concerns**, di mana setiap layer hanya bertanggung jawab untuk satu jenis sumber modifier. Hal ini memudahkan dalam debugging karena developer dapat dengan mudah mengidentifikasi layer mana yang menyebabkan masalah ketika nilai statistik tidak sesuai ekspektasi.

Prinsip kedua adalah **Order Independence within Layer**, yang berarti bahwa dalam satu layer, urutan penerapan modifier tidak mempengaruhi hasil akhir. Misalnya, ketika menerapkan modifiers dari equipment, modifier dari senjata akan memberikan hasil yang sama terlepas dari apakah applied sebelum atau sesudah modifier dari armor, selama keduanya berada dalam layer yang sama.

Prinsip ketiga adalah **Explicit Over Implicit**, di mana semua perubahan terhadap nilai statistik harus bersifat eksplisit dan dapat ditelusuri. Setiap modifier harus memiliki sumber yang jelas (source) dan prioritas yang dapat diprediksi. Pendekatan ini memastikan bahwa tidak ada "hidden modifiers" yang dapat menyebabkan kebingungan dalam debugging dan balancing.

### 2.2 Arsitektur High-Level

Sistem statistik 12-layer terdiri dari beberapa komponen utama yang bekerja secara sinergis. Komponen utama pertama adalah **EnhancedStat**, yang merupakan kelas dasar untuk setiap statistik individual. Setiap EnhancedStat menyimpan base value, daftar modifiers, konfigurasi caps, dan kurva pertumbuhan. Komponen kedua adalah **EnhancedStatService**, yang berfungsi sebagai orchestrator utama yang mengkoordinasikan perhitungan statistik untuk seluruh unit.

Komponen pendukung lainnya meliputi **StatCurveCalculator** yang mengimplementasikan berbagai fungsi pertumbuhan, **ElementalResolver** yang menghitung interaksi elemental, **SetBonusResolver** yang menangani bonus set equipment, dan **StatCapResolver** yang menerapkan batas-batas statistik. Setiap komponen ini dapat bekerja secara independen tetapi diintegrasikan melalui pipeline utama.

```
┌─────────────────────────────────────────────────────────────────┐
│                     EnhancedStatService                          │
│                  (Main Orchestration Layer)                      │
│  • Mengkoordinasikan seluruh perhitungan stat                   │
│  • Mengelola dependency antar komponen                          │
│  • Menyediakan API untuk akses stat unit                        │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ StatCurveCalculator │ │ ElementalResolver │ │  SetBonusResolver  │
│ • Linear Growth     │ │ • Element Checks   │ │ • Set Detection   │
│ • Exponential       │ │ • Affinity Mods    │ │ • Bonus Apply     │
│ • Sigmoid           │ │ • Damage Calcs     │ │ • Synergy Calc    │
│ • Polynomial        │ │ • Resistance       │ │ • UI Breakdown    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EnhancedStat                               │
│                  (Individual Stat Logic)                         │
│  • Menyimpan base value dan modifiers                           │
│  • Menghitung final value dengan caps                           │
│  • Mendukung conditional modifiers                              │
└─────────────────────────────────────────────────────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────┐           ┌───────────┐           ┌───────────────┐
│  Modifiers │           │   Caps    │           │ Growth Curves │
│ • FLAT     │           │ • Hard    │           │ • Linear      │
│ • PERCENT  │           │ • Soft    │           │ • Exponential │
│ • MULT     │           │ • Percent │           │ • Sigmoid     │
└───────────┘           └───────────┘           └───────────────┘
```

### 2.3 Alur Perhitungan Statistik

Proses perhitungan statistik dimulai ketika sistem memerlukan nilai stat untuk unit tertentu, baik itu untuk tampilan UI, perhitungan damage, atau kebutuhan lainnya. Permintaan ini diterima oleh **EnhancedStatService** yang kemudian memulai pipeline 12-layer. Setiap layer memproses satu jenis sumber modifier secara berurutan, dimulai dari BASE hingga CAPS.

Selama proses perhitungan, setiap layer mengumpulkan modifiers yang relevan dari sumber yang sesuai, menghitung total modifier untuk layer tersebut, dan menerapkannya ke nilai running total. Setelah semua layer diproses, **StatCapResolver** memeriksa apakah nilai akhir memerlukan penerapan caps dan melakukan penyesuaian jika diperlukan. Hasil akhir kemudian dikembalikan ke pemanggil bersama dengan breakdown detail yang dapat digunakan untuk debugging dan display.

---

## 3. Arsitektur Pipeline 12-Layer

### 3.1 Hierarki Layer

Pipeline 12-layer dirancang dengan mempertimbangkan urutan logis dalam mana berbagai sumber modifier seharusnya applied. Urutan ini tidak bersifat arbitrer melainkan didasarkan pada prinsip bahwa modifiers yang lebih fundamental dan stabil harus diproses terlebih dahulu, sementara modifiers yang lebih dinamis dan sementara diproses kemudian. Berikut adalah tabel yang menunjukkan setiap layer beserta tanggung jawab dan prioritasnya:

| Layer | Nama | Prioritas | Tipe Modifier | Contoh Sumber |
|-------|------|-----------|---------------|---------------|
| 1 | BASE | 0 (Terendah) | None | Database hero/monster |
| 2 | GROWTH | 1 | FLAT | Level, Class |
| 3 | ALLOC | 2 | FLAT | Stat points allocation |
| 4 | EQUIP | 3 | FLAT + PERCENT | Equipment stats |
| 5 | SET | 4 | FLAT + PERCENT | Equipment set bonuses |
| 6 | ELEMENT | 5 | PERCENT | Elemental affinities |
| 7 | SKILLS | 6 | FLAT + PERCENT | Passive skills |
| 8 | BUFFS | 7 | FLAT + PERCENT | Active buffs |
| 9 | GUILD | 8 | PERCENT | Guild facilities |
| 10 | FACTION | 9 | FLAT + PERCENT | Faction reputation |
| 11 | EVENT | 10 | PERCENT | World events |
| 12 | CAPS | 11 (Tertinggi) | Limiting | Hard/soft caps |

### 3.2 Urutan Processing dan Interaksi

Urutan layer dalam pipeline memiliki implikasi penting terhadap cara modifiers berinteraksi. Layer dengan nomor lebih rendah (BASE, GROWTH) memberikan fondasi nilai yang kemudian dimodifikasi oleh layer dengan nomor lebih tinggi. Hal ini berarti bahwa modifiers dari layer yang lebih tinggi akan selalu applied setelah layer yang lebih rendah, terlepas dari urutan dalam mana modifiers ditambahkan ke sistem.

Sebagai contoh, pertimbangkan scenario di mana hero memiliki:
- BASE attack: 10
- GROWTH bonus: +5 (total: 15)
- Equipment bonus: +20 (total: 35)
- Buff bonus: +30% (total: 45.5)

Urutan ini memastikan bahwa persentase buff (30%) applied ke nilai yang sudah mencakup base, growth, dan equipment. Jika urutannya dibalik, hasil akan berbeda dan tidak intuitif. Pendekatan ini juga memudahkan dalam hal debugging karena setiap layer hanya perlu khawatir tentang modifiers yang berasal dari sumber yang sesuai dengan layer tersebut.

### 3.3 Tipe Modifier dan Aplications

Sistem mendukung tiga tipe modifier utama yang masing-masing memiliki perilaku berbeda dalam perhitungan. Pemahaman mendalam mengenai ketiga tipe ini sangat penting untuk implementasi yang benar dan balancing yang tepat.

**FLAT Modifier** menambahkan atau mengurangkan nilai absolut dari statistik. Tipe ini paling cocok untuk bonuses yang berasal dari sumber yang memiliki nilai tetap, seperti base stats dari equipment atau bonus dari stat allocation. Contoh: +10 attack dari senjata.

**PERCENT_ADD Modifier** menambahkan persentase ke nilai dasar statistik sebelum multiplier diterapkan. Tipe ini berguna untuk bonuses yang ingin memberikan peningkatan proporsional tetapi tidak terlalu drastis. Contoh: +10% attack dari buff tertentu. Ketika multiple PERCENT_ADD modifiers applied, mereka akan dijumlahkan sebelum diterapkan ke nilai base.

**PERCENT_MULT Modifier** mengalikan nilai total dengan faktor tertentu setelah semua modifiers lain applied. Tipe ini berguna untuk bonuses yang seharusnya bersifat multiplikatif terhadap total, seperti critical damage multipliers atau set bonuses yang sangat kuat. Berbeda dengan PERCENT_ADD, PERCENT_MULT multipliers tidak dijumlahkan tetapi dikalikan secara berurutan.

---

## 4. Detail Implementasi Setiap Layer

### 4.1 Layer 1: BASE (Nilai Dasar)

Layer BASE merupakan fondasi dari seluruh pipeline perhitungan statistik. Pada layer ini, semua statistik diinisialisasi dengan nilai dasar yang berasal dari database atau konfigurasi unit. Nilai-nilai ini merepresentasikan kemampuan inherent unit tanpa pengaruh dari faktor eksternal manapun.

**Sumber Data:**
Nilai base disimpan dalam database dan dapat diakses melalui schema yang telah didefinisikan. Untuk hero, nilai base berasal dari template hero yang kemudian dimodifikasi oleh pilihan pemain selama creation. Untuk monster dan NPC, nilai base ditentukan langsung dalam monster template.

**Proses Inisialisasi:**
Ketika unit pertama kali dibuat atau dimuat dari database, sistem akan membuat instance EnhancedStat untuk setiap statistik yang relevan dengan nilai base dari sumber yang sesuai. Jika nilai base tidak ditemukan dalam database, sistem akan menggunakan nilai default yang telah dikonfigurasi.

**Nilai Default:**
| Stat | Nilai Default |
|------|---------------|
| HP | 100 |
| Mana | 20 |
| Attack | 10 |
| Defense | 0 |
| Speed | 10 |
| Critical Chance | 0.05 |
| Critical Damage | 2.0 |

### 4.2 Layer 2: GROWTH (Pertumbuhan Level/Class)

Layer GROWTH mengimplementasikan kurva pertumbuhan yang menentukan bagaimana statistik unit meningkat berdasarkan level dan class. Setiap class memiliki kurva pertumbuhan yang berbeda, yang mencerminkan playstyle dan spesialisasi class tersebut.

**Tipe Kurva Pertumbuhan:**

| Tipe | Formula | Karakteristik | Penggunaan |
|------|---------|---------------|------------|
| **Linear** | `base + (rate × level)` | Pertumbuhan konstan | Stats dasar seperti HP untuk tank |
| **Exponential** | `base × (rate ^ level)` | Pertumbuhan cepat di level tinggi | Stats offensive untuk damage dealers |
| **Sigmoid** | `base + (max × sigmoid(level))` | Pertumbuhan S-curve dengan plateau | Stats yang harus balance |
| **Polynomial** | `base + (rate × level^power)` | Akselerasi progresif | Stats yang benefit dari late game |
| **Logarithmic** | `base + (rate × log(level))` | Cepat di awal, melambat | Stats utility yang tidak perlu terlalu kuat |

**Implementasi Kode:**

```javascript
/**
 * Menghitung nilai statistik berdasarkan kurva pertumbuhan linear
 * @param {number} baseValue - Nilai dasar statistik
 * @param {number} rate - Laju pertumbuhan per level
 * @param {number} level - Level unit saat ini
 * @returns {number} Nilai statistik setelah growth applied
 */
function calculateLinear(baseValue, rate, level) {
    // Formula: base + (rate × (level - 1))
    // Menggunakan (level - 1) karena level 1 adalah base value
    return baseValue + (rate * (level - 1));
}

/**
 * Menghitung nilai statistik berdasarkan kurva pertumbuhan eksponensial
 * @param {number} baseValue - Nilai dasar statistik
 * @param {number} rate - Faktor pertumbuhan (biasanya > 1)
 * @param {number} level - Level unit saat ini
 * @returns {number} Nilai statistik setelah growth applied
 */
function calculateExponential(baseValue, rate, level) {
    // Formula: base × (rate ^ (level - 1)) × 0.9^(level - 1)
    // 0.9 factor mencegah pertumbuhan yang terlalu ekstrem
    return baseValue * Math.pow(rate, level - 1) * Math.pow(0.9, level - 1);
}

/**
 * Menghitung nilai statistik berdasarkan kurva sigmoid
 * @param {number} baseValue - Nilai dasar statistik
 * @param {number} maxBonus - Bonus maksimum yang bisa dicapai
 * @param {number} level - Level unit saat ini
 * @param {number} steepness - Kecekungan kurva (semakin tinggi, semakin tajam transisi)
 * @param {number} midpoint - Level di mana pertumbuhan 50%
 * @returns {number} Nilai statistik setelah growth applied
 */
function calculateSigmoid(baseValue, maxBonus, level, steepness = 0.1, midpoint = 50) {
    // Formula sigmoid: 1 / (1 + e^(-steepness × (level - midpoint)))
    const sigmoidValue = 1 / (1 + Math.exp(-steepness * (level - midpoint)));
    return baseValue + (maxBonus * sigmoidValue);
}
```

**Konfigurasi Class Template:**

Setiap class template mendefinisikan kurva pertumbuhan untuk setiap statistik. Berikut adalah contoh konfigurasi untuk beberapa class:

```javascript
const classGrowthConfig = {
    'Warrior': {
        'hp': { curve: 'linear', rate: 15, maxCap: 99999 },
        'attack': { curve: 'linear', rate: 3, maxCap: 1000 },
        'defense': { curve: 'sigmoid', maxBonus: 50, steepness: 0.08, midpoint: 40 },
        'speed': { curve: 'linear', rate: 0.5, maxCap: 255 }
    },
    'Mage': {
        'hp': { curve: 'linear', rate: 8, maxCap: 99999 },
        'attack': { curve: 'exponential', rate: 1.08, maxCap: 2000 },
        'defense': { curve: 'linear', rate: 1, maxCap: 500 },
        'speed': { curve: 'linear', rate: 0.8, maxCap: 255 },
        'mana': { curve: 'sigmoid', maxBonus: 300, steepness: 0.12, midpoint: 35 }
    },
    'Rogue': {
        'hp': { curve: 'linear', rate: 10, maxCap: 99999 },
        'attack': { curve: 'polynomial', rate: 0.5, power: 1.3, maxCap: 1500 },
        'defense': { curve: 'linear', rate: 2, maxCap: 400 },
        'speed': { curve: 'logarithmic', rate: 5, baseLog: 10, maxCap: 255 }
    }
};
```

### 4.3 Layer 3: ALLOC (Alokasi Poin Statistik)

Layer ALLOC memproses poin statistik yang telah dialokasikan oleh pemain ke statistik tertentu. Setiap hero memiliki pool poin yang dapat didistribusikan ke lima atribut utama: STR (Strength), DEX (Dexterity), INT (Intelligence), VIT (Vitality), dan LUK (Luck). Setiap atribut memberikan bonus ke statistik spesifik sesuai dengan fungsi atribitnya.

**Atribut dan Efeknya:**

| Atribut | Efek Primer | Efek Sekunder |
|---------|-------------|---------------|
| **STR** | +2 Attack per point | +5 HP per point |
| **DEX** | +1 Critical Chance per 5 points | +0.5 Speed per point |
| **INT** | +3 Mana per point | +2 Magic Attack per point |
| **VIT** | +10 HP per point | +1 Defense per 3 points |
| **LUK** | +1 Critical Chance per 10 points | +2% Drop Rate |

**Implementasi Alokasi:**

```javascript
/**
 * Menghitung bonus statistik dari alokasi poin
 * @param {Object} allocation - Object berisi jumlah poin per atribut
 * @returns {Object} Modifier untuk setiap stat yang terpengaruh
 */
function calculateAllocationModifiers(allocation) {
    const modifiers = {};
    
    // STR: Attack dan HP
    const strAttackBonus = allocation.str * 2;
    const strHpBonus = allocation.str * 5;
    modifiers.attack_damage = { value: strAttackBonus, type: 'FLAT', source: 'StatAllocation:STR' };
    modifiers.hp_max = { value: strHpBonus, type: 'FLAT', source: 'StatAllocation:STR' };
    
    // DEX: Critical Chance dan Speed
    const dexCritBonus = (allocation.dex / 5) * 0.01; // 1% per 5 DEX
    const dexSpeedBonus = allocation.dex * 0.5;
    modifiers.crit_chance = { value: dexCritBonus, type: 'FLAT', source: 'StatAllocation:DEX' };
    modifiers.speed = { value: dexSpeedBonus, type: 'FLAT', source: 'StatAllocation:DEX' };
    
    // INT: Mana dan Magic Attack
    const intManaBonus = allocation.int * 3;
    const intMatkBonus = allocation.int * 2;
    modifiers.mana_max = { value: intManaBonus, type: 'FLAT', source: 'StatAllocation:INT' };
    modifiers.magic_attack = { value: intMatkBonus, type: 'FLAT', source: 'StatAllocation:INT' };
    
    // VIT: HP dan Defense
    const vitHpBonus = allocation.vit * 10;
    const vitDefBonus = Math.floor(allocation.vit / 3);
    modifiers.hp_max = { 
        value: vitHpBonus, 
        type: 'FLAT', 
        source: 'StatAllocation:VIT',
        cumulative: true // Akumulasi dengan STR HP bonus
    };
    modifiers.defense = { value: vitDefBonus, type: 'FLAT', source: 'StatAllocation:VIT' };
    
    // LUK: Critical Chance dan Drop Rate
    const lukCritBonus = (allocation.luk / 10) * 0.01; // 1% per 10 LUK
    const lukDropBonus = allocation.luk * 0.02; // 2% per point
    modifiers.crit_chance = {
        value: lukCritBonus,
        type: 'FLAT',
        source: 'StatAllocation:LUK',
        cumulative: true // Akumulasi dengan DEX crit bonus
    };
    modifiers.drop_rate = { value: lukDropBonus, type: 'PERCENT_ADD', source: 'StatAllocation:LUK' };
    
    return modifiers;
}
```

### 4.4 Layer 4: EQUIP (Equipment Stats)

Layer EQUIP menerapkan statistik yang berasal dari equipment yang dikenakan oleh unit. Setiap equipment memiliki slot yang ditentukan (weapon, armor, helmet, boots, accessory) dan setiap slot berkontribusi pada statistik yang berbeda sesuai dengan tipe equipment.

**Slot Equipment dan Stat Contribution:**

| Slot | Stat Utama | Tipe Bonus |
|------|------------|------------|
| **Weapon** | Attack/Magic Attack | FLAT |
| **Armor** | Defense/Vitality | FLAT |
| **Helmet** | HP/Mana atau Stats | FLAT |
| **Boots** | Speed/Evasion | FLAT |
| **Accessory** | Various (Crit, Element) | FLAT + PERCENT |

**Faktor Quality:**

Equipment memiliki sistem quality yang mempengaruhi besaran bonus yang diberikan. Quality factor dihitung berdasarkan ratio quality terhadap base quality 100. Equipment dengan quality lebih tinggi dari 100 memberikan bonus proporsional, sementara equipment dengan quality lebih rendah memberikan bonus yang dikurangi.

```javascript
/**
 * Menghitung bonus statistik dari equipment
 * @param {Array} equippedItems - Array of equipped item objects
 * @returns {Object} Modifiers dari semua equipment
 */
function calculateEquipmentModifiers(equippedItems) {
    const modifiers = {};
    
    equippedItems.forEach(item => {
        // Quality multiplier: quality / 100
        // Item dengan quality 150 memberikan 1.5x bonus
        const qualityMultiplier = item.quality / 100;
        
        // Apply modifiers dari setiap stat pada item
        Object.entries(item.stats).forEach(([statKey, baseBonus]) => {
            const actualBonus = baseBonus * qualityMultiplier;
            
            if (modifiers[statKey]) {
                // Jika sudah ada modifier dari equipment lain, tambahkan
                modifiers[statKey].value += actualBonus;
            } else {
                modifiers[statKey] = {
                    value: actualBonus,
                    type: 'FLAT',
                    source: `Equip:${item.slot}`,
                    itemId: item.id,
                    itemName: item.name
                };
            }
        });
    });
    
    return modifiers;
}
```

### 4.5 Layer 5: SET (Set Bonuses)

Layer SET menangani bonus tambahan yang diperoleh ketika sejumlah equipment dari set yang sama dikenakan. Sistem set bonus memberikan incentive bagi pemain untuk mengumpulkan equipment lengkap dari satu set, yang biasanya memberikan sinergi yang lebih kuat dibandingkan mixed equipment.

**Tipe Set Bonus:**

| Set Size | Tipe Bonus | Contoh |
|----------|------------|--------|
| **2-piece** | Bonus stat minor | +25 Attack |
| **3-piece** | Bonus stat major | +50 Attack, +10% Crit |
| **4-piece** | Bonus special/active | Set effect aktif |
| **5-piece** | Ultimate bonus | Transformasi atau ability khusus |

**Implementasi Set Bonus Resolution:**

```javascript
/**
 * Mendeteksi dan menghitung set bonuses aktif
 * @param {Array} equippedItems - Array of equipped item objects
 * @param {Object} setTemplates - Template set definitions dari database
 * @returns {Object} Active bonuses dengan breakdown
 */
function resolveSetBonuses(equippedItems, setTemplates) {
    const equippedSets = {};
    const activeBonuses = {};
    
    // Identifikasi set dari setiap equipment
    equippedItems.forEach(item => {
        if (item.setId) {
            if (!equippedSets[item.setId]) {
                equippedSets[item.setId] = {
                    setName: item.setName,
                    pieces: []
                };
            }
            equippedSets[item.setId].pieces.push(item);
        }
    });
    
    // Kalkulasi bonus untuk setiap set
    Object.entries(equippedSets).forEach(([setId, setData]) => {
        const template = setTemplates[setId];
        if (!template) return;
        
        const pieceCount = setData.pieces.length;
        const activePieces = template.pieces.filter(p => pieceCount >= p.required);
        
        // Apply bonuses untuk setiap tier yang aktif
        activePieces.forEach(piece => {
            piece.bonuses.forEach(bonus => {
                if (activeBonuses[bonus.stat]) {
                    // Akumulasi bonus dari set berbeda
                    activeBonuses[bonus.stat].value += bonus.value;
                    activeBonuses[bonus.stat].sources.push(`${setData.setName} (${piece.required}-piece)`);
                } else {
                    activeBonuses[bonus.stat] = {
                        value: bonus.value,
                        type: bonus.type || 'FLAT',
                        sources: [`${setData.setName} (${piece.required}-piece)`],
                        setId: setId
                    };
                }
            });
        });
    });
    
    return {
        bonuses: activeBonuses,
        equippedSets: equippedSets,
        totalSetCount: Object.keys(equippedSets).length
    };
}
```

### 4.6 Layer 6: ELEMENT (Elemental Modifiers)

Layer ELEMENT menerapkan modifier yang berasal dari elemental affinities unit. Sistem elemen dalam Textical memiliki enam elemen utama: Fire, Water, Earth, Wind, Light, dan Dark. Setiap elemen memiliki hubungan rock-paper-scissors yang mempengaruhi damage yang diberikan dan diterima.

**Hubungan Elemen:**

| Elemen | Kuat Vs | Lemah Vs | Efek Positif | Efek Negatif |
|--------|---------|----------|--------------|--------------|
| **Fire** | Wind | Water | Burn damage | Wet (increased fire dmg taken) |
| **Water** | Fire | Earth | Wet (reduced fire dmg) | - |
| **Earth** | Water | Wind | Stone skin (+DEF) | Slowed movement |
| **Wind** | Earth | Fire | Evasion boost | - |
| **Light** | Dark | - | Healing bonus | - |
| **Dark** | Light | - | Damage vs Light bonus | - |

**Affinity Effects:**

| Affinity Level | Bonus Damage | Resistance |
|----------------|--------------|------------|
| **None** | 0% | 0% |
| **D** | +5% | -5% |
| **C** | +10% | -10% |
| **B** | +15% | -15% |
| **A** | +20% | -20% |
| **S** | +30% | -30% |

```javascript
/**
 * Menghitung modifier elemental untuk damage calculation
 * @param {string} attackElement - Elemen serangan
 * @param {string} targetElement - Elemen target
 * @param {Object} attackerAffinities - Affinitas elemen penyerang
 * @param {Object} targetAffinities - Affinitas elemen target
 * @returns {Object} Modifier details
 */
function calculateElementalModifiers(attackElement, targetElement, attackerAffinities, targetAffinities) {
    // Base elemental interaction (rock-paper-scissors)
    const interactions = {
        'fire': { strong: 'wind', weak: 'water', multiplier: { strong: 1.5, weak: 0.5, neutral: 1.0 } },
        'water': { strong: 'fire', weak: 'earth', multiplier: { strong: 1.5, weak: 0.5, neutral: 1.0 } },
        'earth': { strong: 'water', weak: 'wind', multiplier: { strong: 1.5, weak: 0.5, neutral: 1.0 } },
        'wind': { strong: 'earth', weak: 'fire', multiplier: { strong: 1.5, weak: 0.5, neutral: 1.0 } },
        'light': { strong: 'dark', weak: null, multiplier: { strong: 1.5, weak: 0.5, neutral: 1.0 } },
        'dark': { strong: 'light', weak: null, multiplier: { strong: 1.5, weak: 0.5, neutral: 1.0 } },
        'physical': { strong: null, weak: null, multiplier: { strong: 1.0, weak: 1.0, neutral: 1.0 } }
    };
    
    const interaction = interactions[attackElement] || interactions['physical'];
    let elementMultiplier = 1.0;
    
    // Cek hubungan strong/weak
    if (interaction.strong && targetElement === interaction.strong) {
        elementMultiplier *= interaction.multiplier.strong;
    } else if (interaction.weak && targetElement === interaction.weak) {
        elementMultiplier *= interaction.multiplier.weak;
    }
    
    // Apply attacker affinity bonus
    const attackerAffinity = attackerAffinities[attackElement] || { level: 'None', bonusDamage: 0 };
    elementMultiplier *= (1 + attackerAffinity.bonusDamage);
    
    // Apply target affinity resistance
    const targetResistance = targetAffinities[attackElement] || { level: 'None', resistance: 0 };
    elementMultiplier *= (1 - targetResistance.resistance);
    
    return {
        baseMultiplier: elementMultiplier,
        interaction: interaction,
        attackerAffinity: attackerAffinity,
        targetResistance: targetResistance
    };
}
```

### 4.7 Layer 7: SKILLS (Passive Skills)

Layer SKILLS menerapkan bonus yang berasal dari passive skills yang dimiliki atau dipelajari oleh unit. Passive skills memberikan bonus yang selalu aktif tanpa memerlukan aktivasi manual, berbeda dengan active skills yang memerlukan penggunaan.

**Kategori Passive Skills:**

| Kategori | Contoh Efek | Trigger |
|----------|-------------|---------|
| **Stat Boost** | +20% Attack saat HP penuh | Always active |
| **Conditional** | +50% Critical Damage saat HP < 30% | onHPBelow:0.3 |
| **Reactive** | 30% lifesteal on attack | onDamageDealt |
| **Progressive** | +2% Attack per 10 levels | Level-based |

```javascript
/**
 * Menghitung bonus dari passive skills
 * @param {Object} unit - Unit object dengan skill list
 * @param {Object} context - Konteks untuk conditional checks
 * @returns {Array} Array of passive skill modifiers
 */
function calculatePassiveSkillModifiers(unit, context) {
    const modifiers = [];
    
    unit.passiveSkills.forEach(skill => {
        // Skip jika skill belum unlocked
        if (!skill.isUnlocked) return;
        
        // Cek kondisi untuk conditional skills
        if (skill.condition) {
            const conditionMet = evaluateCondition(skill.condition, unit, context);
            if (!conditionMet) return;
        }
        
        // Apply bonuses dari skill
        skill.bonuses.forEach(bonus => {
            modifiers.push({
                stat: bonus.stat,
                value: bonus.value,
                type: bonus.modifierType, // 'FLAT', 'PERCENT_ADD', 'PERCENT_MULT'
                source: `Skill:${skill.name}`,
                skillId: skill.id,
                isConditional: !!skill.condition
            });
        });
    });
    
    return modifiers;
}

/**
 * Mengevaluasi kondisi untuk conditional skills
 * @param {Object} condition - Kondisi yang harus dipenuhi
 * @param {Object} unit - Unit yang dievaluasi
 * @param {Object} context - Konteks tambahan
 * @returns {boolean} true jika kondisi terpenuhi
 */
function evaluateCondition(condition, unit, context) {
    switch (condition.type) {
        case 'HP_THRESHOLD':
            const hpPercent = unit.currentHp / unit.stats.hp_max;
            return evaluateOperator(hpPercent, condition.operator, condition.threshold);
            
        case 'MP_THRESHOLD':
            const mpPercent = unit.currentMp / unit.stats.mana_max;
            return evaluateOperator(mpPercent, condition.operator, condition.threshold);
            
        case 'LEVEL_MIN':
            return unit.level >= condition.value;
            
        case 'LEVEL_MAX':
            return unit.level <= condition.value;
            
        case 'BUFF_ACTIVE':
            return unit.activeBuffs.some(buff => buff.id === condition.buffId);
            
        case 'ELEMENT_MATCH':
            return unit.element === condition.element;
            
        case 'CLASS_MATCH':
            return unit.class === condition.class;
            
        case 'ENEMY_COUNT':
            const enemyCount = context.enemies?.length || 0;
            return evaluateOperator(enemyCount, condition.operator, condition.threshold);
            
        default:
            console.warn(`Unknown condition type: ${condition.type}`);
            return true;
    }
}

function evaluateOperator(actual, operator, threshold) {
    switch (operator) {
        case '<': return actual < threshold;
        case '<=': return actual <= threshold;
        case '>': return actual > threshold;
        case '>=': return actual >= threshold;
        case '==': return actual === threshold;
        case '!=': return actual !== threshold;
        default: return false;
    }
}
```

### 4.8 Layer 8: BUFFS (Active Buffs)

Layer BUFFS menerapkan efek dari active buffs yang sedang berlangsung pada unit. Buffs adalah efek sementara yang memberikan keuntungan dan biasanya memiliki durasi terbatas. Buffs dapat berasal dari skills, items, atau environmental effects.

**Tipe Buff:**

| Tipe | Durasi | Stackable | Contoh |
|------|--------|-----------|--------|
| **Temporary** | Fixed duration | Usually No | Power (+30% ATK, 60s) |
| **Permanent** | Until removed | No | Permanent stat boost |
| **Stackable** | Fixed duration | Yes (max stacks) | Multiple healing buffs |
| **Conditional** | While condition met | No | Haste saat tidak wounded |

```javascript
/**
 * Menghitung modifiers dari active buffs
 * @param {Object} unit - Unit dengan daftar buffs aktif
 * @param {number} currentTick - Tick saat ini untuk durasi checking
 * @returns {Array} Array of buff modifiers
 */
function calculateBuffModifiers(unit, currentTick) {
    const modifiers = [];
    
    unit.activeBuffs.forEach(buff => {
        // Skip jika buff sudah expired
        if (buff.expiresAt && currentTick > buff.expiresAt) {
            unit.removeBuff(buff.id);
            return;
        }
        
        // Apply stat modifiers dari buff
        buff.statModifiers.forEach(mod => {
            modifiers.push({
                stat: mod.stat,
                value: mod.value,
                type: mod.modifierType,
                source: `Buff:${buff.name}`,
                buffId: buff.id,
                isExpired: buff.expiresAt && currentTick >= buff.expiresAt
            });
        });
        
        // Apply special effects (immunities, etc.)
        if (buff.specialEffects) {
            modifiers.push({
                type: 'SPECIAL_EFFECT',
                effects: buff.specialEffects,
                source: `Buff:${buff.name}`,
                buffId: buff.id
            });
        }
    });
    
    return modifiers;
}
```

### 4.9 Layer 9: GUILD (Guild Facilities)

Layer GUILD menerapkan bonus yang berasal dari fasilitas guild tempat hero bergabung. Guild facilities memberikan bonus pasif yang berlaku untuk semua anggota guild dan biasanya berdasarkan level fasilitas.

**Guild Facility Effects:**

| Facility | Level Bonus | Efek |
|----------|-------------|------|
| **Training Hall** | +1% all stats per level | Global stat boost |
| **Smithy** | +2% equipment bonus per level | Enhanced equipment stats |
| **Alchemy Lab** | +3% potion effectiveness per level | Better healing/consumables |
| **Library** | +5% XP gain per level | Faster leveling |
| **Arena** | +2% PvP damage per level | PvP advantage |

```javascript
/**
 * Menghitung bonus dari guild facilities
 * @param {Object} guild - Guild object dengan facilities
 * @param {string} statType - Tipe stat yang dihitung
 * @returns {Object} Guild modifier
 */
function calculateGuildFacilityModifiers(guild, statType) {
    if (!guild || !guild.facilities) {
        return null;
    }
    
    let totalBonus = 0;
    const appliedBonuses = [];
    
    guild.facilities.forEach(facility => {
        const bonus = getFacilityBonus(facility.type, facility.level, statType);
        if (bonus > 0) {
            totalBonus += bonus;
            appliedBonuses.push({
                facility: facility.name,
                level: facility.level,
                bonus: bonus
            });
        }
    });
    
    if (totalBonus === 0) {
        return null;
    }
    
    return {
        value: totalBonus,
        type: 'PERCENT_ADD',
        source: 'GuildFacilities',
        details: appliedBonuses
    };
}

function getFacilityBonus(facilityType, level, statType) {
    const facilityConfig = {
        'training_hall': { stat: 'all', bonusPerLevel: 0.01 },
        'smithy': { stat: ['attack', 'defense'], bonusPerLevel: 0.02 },
        'alchemy_lab': { stat: 'healing', bonusPerLevel: 0.03 },
        'library': { stat: 'xp_gain', bonusPerLevel: 0.05 },
        'arena': { stat: 'pvp_damage', bonusPerLevel: 0.02 }
    };
    
    const config = facilityConfig[facilityType];
    if (!config) return 0;
    
    // Check apakah fasilitas affects stat yang diminta
    if (config.stat === 'all') {
        return level * config.bonusPerLevel;
    } else if (Array.isArray(config.stat)) {
        return config.stat.includes(statType) ? level * config.bonusPerLevel : 0;
    } else {
        return config.stat === statType ? level * config.bonusPerLevel : 0;
    }
}
```

### 4.10 Layer 10: FACTION (Faction Perks)

Layer FACTION menerapkan bonus yang berasal dari reputation dengan faction-faction dalam game. Setiap faction memiliki tier reputation dan setiap tier memberikan perks yang berbeda.

**Faction Reputation Tiers:**

| Tier | Reputation Points | Bonus |
|------|-------------------|-------|
| **Neutral** | 0 | None |
| **Friendly** | 1000 | +5% related stat |
| **Honored** | 5000 | +10% related stat, exclusive items |
| **Revered** | 10000 | +15% related stat, faction ability |
| **Exalted** | 25000 | +20% related stat, unique mount/title |

```javascript
/**
 * Menghitung bonus dari faction reputation
 * @param {Object} unit - Unit dengan faction standings
 * @param {string} statType - Tipe stat yang dihitung
 * @returns {Array} Array of faction modifiers
 */
function calculateFactionModifiers(unit, statType) {
    const modifiers = [];
    
    unit.factionStandings.forEach(standing => {
        const tierBonus = getFactionTierBonus(standing.tier, standing.factionId, statType);
        if (tierBonus) {
            modifiers.push({
                value: tierBonus.value,
                type: tierBonus.type,
                source: `Faction:${standing.factionName}`,
                factionId: standing.factionId,
                tier: standing.tier,
                reputation: standing.reputation
            });
        }
    });
    
    return modifiers;
}

function getFactionTierBonus(tier, factionId, statType) {
    const tierConfig = {
        'neutral': { multiplier: 0, type: null },
        'friendly': { multiplier: 0.05, type: 'PERCENT_ADD' },
        'honored': { multiplier: 0.10, type: 'PERCENT_ADD' },
        'revered': { multiplier: 0.15, type: 'PERCENT_ADD' },
        'exalted': { multiplier: 0.20, type: 'PERCENT_ADD' }
    };
    
    const config = tierConfig[tier];
    if (!config || config.multiplier === 0) return null;
    
    // Check apakah faction terkait dengan stat yang diminta
    const factionStats = {
        'warriors_guild': ['attack', 'defense'],
        'mages_guild': ['magic_attack', 'mana'],
        'merchants_guild': ['gold_find', 'trade'],
        'explorers_guild': ['speed', 'stamina']
    };
    
    const relatedStats = factionStats[factionId] || [];
    if (!relatedStats.includes(statType) && statType !== 'all') {
        return null;
    }
    
    return {
        value: config.multiplier,
        type: config.type
    };
}
```

### 4.11 Layer 11: EVENT (World Events)

Layer EVENT menerapkan modifier yang berasal dari world events yang sedang aktif. World events adalah event sementara yang mempengaruhi semua pemain atau region tertentu dan biasanya memiliki durasi terbatas.

**Tipe World Event:**

| Event Type | Efek | Durasi |
|------------|------|--------|
| **World Boss** | +25% all damage | Until boss defeated |
| **Double XP** | +100% XP gain | 2 hours |
| **PVP Tournament** | +50% PvP damage | Duration of tournament |
| **Festival** | -20% all costs | 1 week |
| **Raid** | +10% party damage | Until raid completed |

```javascript
/**
 * Menghitung modifier dari active world events
 * @param {Array} activeEvents - List of currently active world events
 * @param {string} statType - Tipe stat yang dihitung
 * @returns {Array} Array of event modifiers
 */
function calculateEventModifiers(activeEvents, statType) {
    const modifiers = [];
    
    activeEvents.forEach(event => {
        const eventBonus = getEventBonus(event, statType);
        if (eventBonus) {
            modifiers.push({
                value: eventBonus.value,
                type: eventBonus.type,
                source: `Event:${event.name}`,
                eventId: event.id,
                eventEnd: event.endsAt
            });
        }
    });
    
    return modifiers;
}

function getEventBonus(event, statType) {
    const eventEffects = {
        'world_boss': {
            affectedStats: ['all'],
            multiplier: 0.25,
            type: 'PERCENT_ADD'
        },
        'double_xp': {
            affectedStats: ['xp_gain'],
            multiplier: 1.0,
            type: 'PERCENT_ADD'
        },
        'pvp_tournament': {
            affectedStats: ['pvp_damage'],
            multiplier: 0.50,
            type: 'PERCENT_ADD'
        },
        'festival': {
            affectedStats: ['cost_reduction'],
            multiplier: 0.20,
            type: 'PERCENT_ADD'
        },
        'raid': {
            affectedStats: ['party_damage'],
            multiplier: 0.10,
            type: 'PERCENT_ADD'
        }
    };
    
    const effect = eventEffects[event.type];
    if (!effect) return null;
    
    // Check apakah event affects stat yang diminta
    if (!effect.affectedStats.includes('all') && !effect.affectedStats.includes(statType)) {
        return null;
    }
    
    return {
        value: effect.multiplier,
        type: effect.type
    };
}
```

### 4.12 Layer 12: CAPS (Batas Statistik)

Layer CAPS merupakan layer terakhir yang menerapkan batas-batas pada nilai statistik. Sistem mendukung tiga jenis cap: hard cap (batas absolut), soft cap (diminishing returns), dan percent cap (batas persentase).

**Default Caps:**

| Stat | Hard Cap | Soft Cap | Soft Factor | Percent Cap |
|------|----------|----------|-------------|-------------|
| **Primary Stats** (STR, DEX, INT, VIT, LUK) | 255 | N/A | N/A | N/A |
| **HP** | 99,999 | 5,000 | 0.1 | N/A |
| **Mana** | 9,999 | 1,000 | 0.1 | N/A |
| **Attack** | 10,000 | N/A | N/A | N/A |
| **Defense** | 5,000 | N/A | N/A | N/A |
| **Crit Chance** | N/A | N/A | N/A | 1.0 (100%) |
| **Crit Damage** | N/A | N/A | N/A | 5.0 (500%) |
| **Dodge Rate** | N/A | N/A | N/A | 0.95 (95%) |
| **Resistance** | N/A | N/A | N/A | 0.90 (90%) |

```javascript
/**
 * Menerapkan caps pada nilai statistik
 * @param {string} statName - Nama statistik
 * @param {number} value - Nilai yang akan dicap
 * @param {Object} capConfig - Konfigurasi cap untuk stat ini
 * @returns {Object} Hasil setelah penerapan cap
 */
function applyStatCap(statName, value, capConfig) {
    const result = {
        originalValue: value,
        cappedValue: value,
        appliedCaps: [],
        isCapped: false
    };
    
    if (!capConfig) {
        return result;
    }
    
    // Apply hard cap
    if (capConfig.hardCap !== undefined && value > capConfig.hardCap) {
        result.cappedValue = capConfig.hardCap;
        result.appliedCaps.push({
            type: 'HARD_CAP',
            limit: capConfig.hardCap,
            lost: value - capConfig.hardCap
        });
        result.isCapped = true;
        return result;
    }
    
    // Apply soft cap dengan diminishing returns
    if (capConfig.softCap !== undefined && value > capConfig.softCap) {
        const softExcess = value - capConfig.softCap;
        const softFactor = capConfig.softFactor || 0.1;
        const diminishedExcess = softExcess * softFactor;
        const newValue = capConfig.softCap + diminishedExcess;
        
        if (newValue < value) {
            result.cappedValue = newValue;
            result.appliedCaps.push({
                type: 'SOFT_CAP',
                originalExcess: softExcess,
                diminishedBy: softFactor,
                lost: softExcess - diminishedExcess
            });
            result.isCapped = true;
        }
    }
    
    // Apply percent cap (untuk rates dan percentages)
    if (capConfig.percentCap !== undefined && value > capConfig.percentCap) {
        result.cappedValue = capConfig.percentCap;
        result.appliedCaps.push({
            type: 'PERCENT_CAP',
            limit: capConfig.percentCap,
            lost: value - capConfig.percentCap
        });
        result.isCapped = true;
    }
    
    return result;
}

/**
 * Mendapatkan konfigurasi cap untuk sebuah stat
 * @param {string} statName - Nama statistik
 * @param {number} level - Level unit (untuk level-scaled caps)
 * @returns {Object} Konfigurasi cap
 */
function getStatCapConfig(statName, level = 1) {
    const baseCaps = {
        'str': { hardCap: 255 },
        'dex': { hardCap: 255 },
        'int': { hardCap: 255 },
        'vit': { hardCap: 255 },
        'luk': { hardCap: 255 },
        'hp_max': { hardCap: 99999, softCap: 5000, softFactor: 0.1 },
        'mana_max': { hardCap: 9999, softCap: 1000, softFactor: 0.1 },
        'attack_damage': { hardCap: 10000 },
        'magic_attack': { hardCap: 10000 },
        'defense': { hardCap: 5000 },
        'crit_chance': { percentCap: 1.0 },
        'crit_damage': { percentCap: 5.0 },
        'dodge_rate': { percentCap: 0.95 },
        'hit_rate': { percentCap: 1.5 },
        'fire_resistance': { percentCap: 0.90 },
        'water_resistance': { percentCap: 0.90 },
        'earth_resistance': { percentCap: 0.90 },
        'wind_resistance': { percentCap: 0.90 },
        'light_resistance': { percentCap: 0.90 },
        'dark_resistance': { percentCap: 0.90 }
    };
    
    const config = baseCaps[statName];
    if (!config) {
        return null;
    }
    
    // Level-scaled caps untuk beberapa stats
    if (config.levelScaled) {
        return {
            ...config,
            hardCap: config.hardCap + (level * config.perLevelScale || 0),
            softCap: config.softCap + (level * config.perLevelScale || 0)
        };
    }
    
    return config;
}
```

---

## 5. Komponen Pendukung

### 5.1 EnhancedStat Class

Kelas EnhancedStat merupakan fondasi dari sistem statistik. Setiap statistik individual direpresentasikan sebagai instance EnhancedStat yang menyimpan nilai dasar, modifiers, konfigurasi caps, dan kurva pertumbuhan. Kelas ini menyediakan methods untuk memanipulasi dan menghitung nilai statistik dengan mempertimbangkan semua faktor yang relevan.

**Methods Utama EnhancedStat:**

| Method | Deskripsi | Parameter | Return Value |
|--------|-----------|-----------|--------------|
| `addModifier(modifier)` | Menambahkan modifier ke stat | `modifier: StatModifier` | `void` |
| `addModifiers(modifiers)` | Menambahkan multiple modifiers | `modifiers: StatModifier[]` | `void` |
| `removeModifier(id)` | Menghapus modifier berdasarkan ID | `id: string` | `boolean` |
| `clearModifiers()` | Menghapus semua modifiers | None | `void` |
| `setBase(value)` | Mengatur nilai dasar | `value: number` | `void` |
| `setCaps(config)` | Mengatur konfigurasi caps | `config: CapConfig` | `void` |
| `setGrowthCurve(config)` | Mengatur kurva pertumbuhan | `config: GrowthConfig` | `void` |
| `getValue(context)` | Menghitung nilai akhir | `context: CalculationContext` | `number` |
| `getDetailedBreakdown(context)` | Mengembalikan breakdown detail | `context: CalculationContext` | `BreakdownResult` |
| `getValueAtLevel(level)` | Mendapatkan nilai di level tertentu | `level: number` | `number` |
| `clone()` | Membuat salinan stat | None | `EnhancedStat` |

### 5.2 StatCurveCalculator

StatCurveCalculator mengimplementasikan berbagai fungsi kurva pertumbuhan yang dapat digunakan untuk menghitung bagaimana statistik berkembang berdasarkan level. Setiap kurva memiliki karakteristik yang berbeda dan dipilih berdasarkan playstyle class yang menggunakan statistik tersebut.

**Implementasi Kurva Pertumbuhan:**

```javascript
class StatCurveCalculator {
    /**
     * Menghitung pertumbuhan linear
     * Cocok untuk stats yang perlu pertumbuhan stabil dan dapat diprediksi
     */
    static calculateLinear(baseValue, rate, level) {
        // Setiap level menambah nilai tetap
        return baseValue + (rate * (level - 1));
    }
    
    /**
     * Menghitung pertumbuhan eksponensial
     * Cocok untuk stats yang perlu "explode" di level tinggi
     * Includes damping factor untuk mencegah pertumbuhan berlebihan
     */
    static calculateExponential(baseValue, rate, level, damping = 0.9) {
        const growthFactor = Math.pow(rate, level - 1);
        const dampedFactor = Math.pow(damping, level - 1);
        return baseValue * growthFactor * dampedFactor;
    }
    
    /**
     * Menghitung pertumbuhan sigmoid
     * Cocok untuk stats yang perlu pertumbuhan cepat di awal,
     * kemudian melambat dan plateau di level tinggi
     */
    static calculateSigmoid(baseValue, maxBonus, level, steepness = 0.1, midpoint = 50) {
        const normalizedLevel = (level - midpoint) * steepness;
        const sigmoid = 1 / (1 + Math.exp(-normalizedLevel));
        return baseValue + (maxBonus * sigmoid);
    }
    
    /**
     * Menghitung pertumbuhan polynomial
     * Cocok untuk stats yang perlu akselerasi progresif
     */
    static calculatePolynomial(baseValue, rate, level, power) {
        return baseValue + (rate * Math.pow(level, power));
    }
    
    /**
     * Menghitung pertumbuhan logaritmik
     * Cocok untuk stats yang perlu pertumbuhan cepat di awal,
     * tetapi melambat signifikan di level tinggi
     */
    static calculateLogarithmic(baseValue, rate, level, logBase = 10) {
        return baseValue + (rate * Math.log(level) / Math.log(logBase));
    }
}
```

### 5.3 ElementalResolver

ElementalResolver menangani semua perhitungan yang berkaitan dengan sistem elemen, termasuk interaksi antar elemen, affinity bonuses, dan resistance calculations. Komponen ini central untuk damage calculations dan defensive calculations.

**Fungsi Utama:**

| Fungsi | Deskripsi |
|--------|-----------|
| `calculateDamageMultiplier()` | Menghitung multiplier damage berdasarkan elemen |
| `applyElementalModifiers()` | Menerapkan modifiers ke stat block |
| `getElementInteraction()` | Mendapatkan multiplier interaksi antar dua elemen |
| `checkAffinityBonus()` | Mengecek dan menghitung bonus affinity |

### 5.4 SetBonusResolver

SetBonusResolver mendeteksi dan menghitung bonus equipment set yang aktif. Komponen ini bekerja dengan memetakan equipped items ke set templates dan menghitung total bonus berdasarkan jumlah pieces yang dikenakan.

**Fungsi Utama:**

| Fungsi | Deskripsi |
|--------|-----------|
| `registerSetBonuses()` | Mendaftarkan bonuses dari equipped items |
| `getActiveBonuses()` | Mendapatkan bonuses aktif berdasarkan requirements |
| `applySetBonuses()` | Menerapkan bonuses ke stat block |
| `calculateSynergy()` | Menghitung sinergi antar set bonuses |
| `getDetailedBreakdown()` | Mendapatkan breakdown untuk UI |

### 5.5 StatCapResolver

StatCapResolver mengelola penerapan caps pada nilai statistik. Komponen ini mendukung hard caps, soft caps dengan diminishing returns, dan percent caps untuk rate-based stats.

**Fungsi Utama:**

| Fungsi | Deskripsi |
|--------|-----------|
| `getCaps()` | Mendapatkan konfigurasi cap untuk stat tertentu |
| `applyAllCaps()` | Menerapkan semua caps ke stat block |
| `applyCap()` | Menerapkan cap tunggal |
| `getCapInfo()` | Mendapatkan informasi cap tanpa penerapan |
| `getEffectiveValue()` | Mendapatkan nilai efektif setelah caps |

---

## 6. Contoh Penggunaan dan Perhitungan

### 6.1 Skenario Perhitungan Lengkap

Berikut adalah contoh lengkap perhitungan attack damage untuk seorang hero dengan berbagai modifier:

**Setup Hero:**
- Class: Warrior
- Level: 50
- Base Stats: Attack 50
- Equipment: 
  - Weapon (quality 120): +40 Attack
  - Armor (quality 110): +15 Attack
  - Set Bonus (2-piece): +25 Attack
- Buffs: Power (+30% Attack, 60s)
- Guild: Training Hall Level 5 (+5% all stats)
- Faction: Warriors Guild Honored (+10% attack)
- World Event: World Boss (+25% all damage)

**Perhitungan Layer by Layer:**

```javascript
// Layer 1: BASE
let attack = 50;

// Layer 2: GROWTH (Linear: rate 3 per level)
const growthBonus = 3 * (50 - 1); // 147
attack += growthBonus; // attack = 197

// Layer 3: ALLOC (50 points in STR)
// 50 STR × 2 Attack per point = 100
attack += 100; // attack = 297

// Layer 4: EQUIP
// Weapon: 40 × 1.20 (quality) = 48
// Armor: 15 × 1.10 (quality) = 16.5
attack += 48 + 16.5; // attack = 361.5

// Layer 5: SET
// 2-piece bonus: +25 Attack
attack += 25; // attack = 386.5

// Layer 6: ELEMENT (No elemental affinity)
attack *= 1.0; // attack = 386.5

// Layer 7: SKILLS (No passive skills affecting attack)
attack *= 1.0; // attack = 386.5

// Layer 8: BUFFS
// Power: +30% Attack
attack *= 1.30; // attack = 502.45

// Layer 9: GUILD
// Training Hall Lv5: +5% all stats
attack *= 1.05; // attack = 527.57

// Layer 10: FACTION
// Warriors Guild Honored: +10% attack
attack *= 1.10; // attack = 580.33

// Layer 11: EVENT
// World Boss: +25% all damage
attack *= 1.25; // attack = 725.41

// Layer 12: CAPS
// Attack hard cap: 10000 (tidak tercapai)
attack = Math.floor(attack); // 725

// Hasil akhir: Attack = 725
```

### 6.2 Implementasi EnhancedStatService

```javascript
/**
 * EnhancedStatService - Orchestrator utama untuk perhitungan stat
 */
class EnhancedStatService {
    constructor(options = {}) {
        this.statCurveCalculator = options.statCurveCalculator || new StatCurveCalculator();
        this.elementalResolver = options.elementalResolver || new ElementalResolver();
        this.setBonusResolver = options.setBonusResolver || new SetBonusResolver();
        this.statCapResolver = options.statCapResolver || new StatCapResolver();
        this.cacheEnabled = options.cacheEnabled !== false;
        this.cache = new Map();
    }
    
    /**
     * Menghitung semua statistik untuk sebuah hero
     * @param {string} heroId - ID hero dari database
     * @returns {Promise<HeroStats>} Object berisi semua statistik
     */
    async calculateHeroStats(heroId) {
        // Check cache jika enabled
        if (this.cacheEnabled) {
            const cached = this.cache.get(`hero:${heroId}`);
            if (cached && !this.isCacheExpired(cached, 60000)) { // 1 minute cache
                return cached.data;
            }
        }
        
        // Load hero data dari database
        const heroData = await this.loadHeroData(heroId);
        
        // Calculate stats untuk setiap stat
        const stats = {};
        const statNames = ['hp_max', 'mana_max', 'attack_damage', 'magic_attack', 
                          'defense', 'speed', 'crit_chance', 'crit_damage'];
        
        for (const statName of statNames) {
            stats[statName] = await this.calculateStat(heroData, statName);
        }
        
        // Add elemental affinities
        stats.elementalAffinities = heroData.elementalAffinities;
        
        // Build result
        const result = {
            heroId,
            stats,
            breakdown: this.generateBreakdown(heroData),
            calculatedAt: new Date().toISOString()
        };
        
        // Cache result
        if (this.cacheEnabled) {
            this.cache.set(`hero:${heroId}`, {
                data: result,
                timestamp: Date.now()
            });
        }
        
        return result;
    }
    
    /**
     * Menghitung nilai satu statistik dengan pipeline 12-layer
     * @param {Object} heroData - Data hero lengkap
     * @param {string} statName - Nama statistik yang dihitung
     * @returns {Promise<StatResult>} Hasil perhitungan
     */
    async calculateStat(heroData, statName) {
        const layerResults = [];
        let runningValue = 0;
        
        // Layer 1: BASE
        const baseValue = heroData.baseStats[statName] || this.getDefaultBase(statName);
        runningValue = baseValue;
        layerResults.push({
            layer: 'BASE',
            source: 'Database',
            value: baseValue,
            runningTotal: runningValue
        });
        
        // Layer 2: GROWTH
        const growthConfig = heroData.classTemplate.growth[statName];
        if (growthConfig) {
            const growthValue = this.statCurveCalculator.calculate(
                growthConfig.type,
                baseValue,
                growthConfig.rate || growthConfig.maxBonus,
                heroData.level,
                growthConfig.steepness,
                growthConfig.midpoint
            );
            runningValue += (growthValue - baseValue);
            layerResults.push({
                layer: 'GROWTH',
                source: `Class: ${heroData.classTemplate.name}`,
                value: growthValue - baseValue,
                runningTotal: runningValue
            });
        }
        
        // Layer 3: ALLOC
        const allocBonus = this.calculateAllocationBonus(heroData.allocations, statName);
        if (allocBonus !== 0) {
            runningValue += allocBonus;
            layerResults.push({
                layer: 'ALLOC',
                source: 'Stat Allocation',
                value: allocBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 4: EQUIP
        const equipBonus = this.calculateEquipmentBonus(heroData.equipment, statName);
        if (equipBonus !== 0) {
            runningValue += equipBonus;
            layerResults.push({
                layer: 'EQUIP',
                source: 'Equipment',
                value: equipBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 5: SET
        const setBonus = this.calculateSetBonus(heroData.equipment, heroData.setTemplates, statName);
        if (setBonus !== 0) {
            runningValue += setBonus;
            layerResults.push({
                layer: 'SET',
                source: 'Set Bonuses',
                value: setBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 6: ELEMENT
        const elementBonus = this.calculateElementalBonus(heroData.elementalAffinities, statName);
        if (elementBonus !== 0) {
            runningValue *= (1 + elementBonus);
            layerResults.push({
                layer: 'ELEMENT',
                source: 'Elemental Affinity',
                value: elementBonus,
                multiplier: 1 + elementBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 7: SKILLS
        const skillBonus = this.calculateSkillBonus(heroData.passiveSkills, statName, heroData);
        if (skillBonus !== 0) {
            runningValue += skillBonus.flat;
            runningValue *= (1 + skillBonus.percent);
            layerResults.push({
                layer: 'SKILLS',
                source: 'Passive Skills',
                value: skillBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 8: BUFFS
        const buffBonus = this.calculateBuffBonus(heroData.activeBuffs, statName);
        if (buffBonus !== 0) {
            runningValue *= (1 + buffBonus);
            layerResults.push({
                layer: 'BUFFS',
                source: 'Active Buffs',
                value: buffBonus,
                multiplier: 1 + buffBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 9: GUILD
        const guildBonus = this.calculateGuildBonus(heroData.guild, statName);
        if (guildBonus !== 0) {
            runningValue *= (1 + guildBonus);
            layerResults.push({
                layer: 'GUILD',
                source: 'Guild Facilities',
                value: guildBonus,
                multiplier: 1 + guildBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 10: FACTION
        const factionBonus = this.calculateFactionBonus(heroData.factionStandings, statName);
        if (factionBonus !== 0) {
            runningValue *= (1 + factionBonus);
            layerResults.push({
                layer: 'FACTION',
                source: 'Faction Perks',
                value: factionBonus,
                multiplier: 1 + factionBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 11: EVENT
        const eventBonus = this.calculateEventBonus(heroData.activeEvents, statName);
        if (eventBonus !== 0) {
            runningValue *= (1 + eventBonus);
            layerResults.push({
                layer: 'EVENT',
                source: 'World Events',
                value: eventBonus,
                multiplier: 1 + eventBonus,
                runningTotal: runningValue
            });
        }
        
        // Layer 12: CAPS
        const capConfig = this.statCapResolver.getCapConfig(statName, heroData.level);
        const cappedResult = this.statCapResolver.applyCap(statName, runningValue, capConfig);
        
        layerResults.push({
            layer: 'CAPS',
            source: 'Stat Caps',
            value: runningValue - cappedResult.cappedValue,
            appliedCaps: cappedResult.appliedCaps,
            runningTotal: cappedResult.cappedValue
        });
        
        return {
            value: Math.floor(cappedResult.cappedValue),
            rawValue: runningValue,
            breakdown: layerResults,
            caps: cappedResult.appliedCaps
        };
    }
    
    // Helper methods (simplified for brevity)
    calculateAllocationBonus(allocations, statName) { /* ... */ }
    calculateEquipmentBonus(equipment, statName) { /* ... */ }
    calculateSetBonus(equipment, setTemplates, statName) { /* ... */ }
    calculateElementalBonus(affinities, statName) { /* ... */ }
    calculateSkillBonus(skills, statName, context) { /* ... */ }
    calculateBuffBonus(buffs, statName) { /* ... */ }
    calculateGuildBonus(guild, statName) { /* ... */ }
    calculateFactionBonus(standings, statName) { /* ... */ }
    calculateEventBonus(events, statName) { /* ... */ }
    
    loadHeroData(heroId) { /* ... */ }
    getDefaultBase(statName) { /* ... */ }
    isCacheExpired(cache, maxAge) { /* ... */ }
    generateBreakdown(heroData) { /* ... */ }
}
```

### 6.3 Breakdown Result Structure

Ketika memanggil `getDetailedBreakdown()`, sistem mengembalikan struktur data yang berisi informasi lengkap tentang bagaimana nilai akhir dihitung:

```javascript
{
    statName: 'attack_damage',
    finalValue: 725,
    rawValue: 725.41,
    calculationTime: '2024-06-01T12:00:00.000Z',
    layers: [
        {
            layer: 'BASE',
            order: 1,
            source: 'Database',
            sourceDetails: 'Warrior template base',
            value: 50,
            runningTotal: 50,
            modifiers: []
        },
        {
            layer: 'GROWTH',
            order: 2,
            source: 'Class: Warrior',
            sourceDetails: 'Linear growth, rate: 3',
            value: 147,
            runningTotal: 197,
            modifiers: []
        },
        {
            layer: 'ALLOC',
            order: 3,
            source: 'Stat Allocation',
            sourceDetails: '50 STR × 2 Attack',
            value: 100,
            runningTotal: 297,
            modifiers: [
                { type: 'FLAT', value: 100, source: 'STR allocation' }
            ]
        },
        // ... layer lainnya
    ],
    caps: {
        applied: false,
        hardCap: 10000,
        softCap: null,
        percentCap: null,
        lostValue: 0
    },
    warnings: [],
    suggestions: []
}
```

---

## 7. Integrasi dengan Sistem Lain

### 7.1 Integrasi dengan Battle System

Sistem statistik terintegrasi dengan battle system untuk semua perhitungan damage dan defensive. Battle system meminta nilai statistik dari EnhancedStatService dan menggunakan nilai-nilai tersebut dalam formula damage calculation.

```javascript
// Dalam BattleSystem.js
async function calculateDamage(attacker, defender, skill) {
    // Dapatkan stats untuk attacker
    const attackerStats = await statService.calculateHeroStats(attacker.id);
    
    // Dapatkan stats untuk defender
    const defenderStats = await statService.calculateHeroStats(defender.id);
    
    // Kalkulasi base damage
    const baseDamage = attackerStats.stats.attack_damage * skill.damageMultiplier;
    
    // Apply defense reduction
    const defenseReduction = defenderStats.stats.defense / 
                            (defenderStats.stats.defense + 100);
    const damageAfterDefense = baseDamage * (1 - defenseReduction);
    
    // Check critical
    const isCritical = Math.random() < attackerStats.stats.crit_chance;
    const finalDamage = isCritical ? 
        damageAfterDefense * attackerStats.stats.crit_damage : 
        damageAfterDefense;
    
    return Math.floor(finalDamage);
}
```

### 7.2 Integrasi dengan Status Effect System

Status effects dapat memodifikasi statistik melalui sistem modifier. Ketika status effect diterapkan, modifier ditambahkan ke EnhancedStat yang sesuai.

```javascript
// Dalam StatusEffectSystem.js
class BurnStatus extends BaseStatus {
    applyEffect(target) {
        // Kurangi attack damage sebesar 10%
        target.stats.attack_damage.addModifier(new StatModifier({
            value: -0.10,
            type: StatModifierType.PERCENT_ADD,
            source: 'Status:Burn',
            priority: 5
        }));
    }
    
    removeEffect(target) {
        // Hapus modifier ketika status berakhir
        target.stats.attack_damage.removeModifier('Status:Burn');
    }
}
```

### 7.3 Integrasi dengan Trait System

Traits dapat memberikan bonus statistik yang diintegrasikan melalui passive skill layer atau sebagai conditional modifiers.

```javascript
// Trait: Giant - +50% Max HP, -5 SPD
class GiantTrait {
    static onBattleStart(unit) {
        // Apply HP bonus melalui BUFFS layer (dengan effect yang sama)
        unit.stats.hp_max.addModifier({
            value: 0.50,
            type: StatModifierType.PERCENT_ADD,
            source: 'Trait:Giant',
            priority: 10
        });
        
        // Apply SPD penalty
        unit.stats.speed.addModifier({
            value: -5,
            type: StatModifierType.FLAT,
            source: 'Trait:Giant',
            priority: 10
        });
    }
}
```

---

## 8. Panduan Developer

### 8.1 Menambahkan Sumber Modifier Baru

Untuk menambahkan sumber modifier baru ke sistem, ikuti langkah-langkah berikut:

**Langkah 1: Tentukan Layer**
Pilih layer yang sesuai untuk sumber modifier baru berdasarkan urutan logis. Jika modifier berasal dari aktivitas guild, gunakan Layer 9 (GUILD). Jika berasal dari world events, gunakan Layer 11 (EVENT).

**Langkah 2: Update Konfigurasi**
Tambahkan konfigurasi untuk sumber baru di file konfigurasi yang sesuai:

```javascript
// config/statModifiers.js
const modifierSources = {
    // ... existing sources
    'NEW_SOURCE': {
        layer: 11, // Sesuaikan dengan layer yang dipilih
        layerName: 'EVENT', // atau nama layer yang sesuai
        priority: 50
    }
};
```

**Langkah 3: Implementasi Fungsi Kalkulasi**
Buat fungsi untuk menghitung modifier dari sumber baru:

```javascript
// services/stat/newSourceModifier.js
function calculateNewSourceModifier(unit, statName) {
    // Logika untuk menghitung modifier
    const modifierValue = /* ... calculation logic ... */;
    
    if (modifierValue === 0) return null;
    
    return {
        value: modifierValue,
        type: 'PERCENT_ADD', // atau FLAT/PERCENT_MULT sesuai kebutuhan
        source: 'NewSource:Name',
        details: {
            // Informasi tambahan untuk debugging dan display
            context: unit.newSourceContext
        }
    };
}
```

**Langkah 4: Update EnhancedStatService**
Tambahkan pemanggilan fungsi baru ke dalam pipeline:

```javascript
// services/enhancedStatService.js
async calculateStat(heroData, statName) {
    // ... existing layers ...
    
    // Layer 11: EVENT (already exists)
    const eventBonus = this.calculateEventBonus(heroData.activeEvents, statName);
    
    // Layer 12: NEW SOURCE (new)
    const newSourceBonus = this.calculateNewSourceBonus(heroData.newSource, statName);
    if (newSourceBonus !== 0) {
        runningValue *= (1 + newSourceBonus);
        layerResults.push({
            layer: 'NEW_SOURCE',
            source: 'New Source Name',
            value: newSourceBonus,
            multiplier: 1 + newSourceBonus,
            runningTotal: runningValue
        });
    }
    
    // Layer 13: CAPS (shifted)
    // ...
}
```

**Langkah 5: Update Dokumentasi**
Dokumentasikan sumber modifier baru dengan informasi lengkap tentang sumber, efek, dan interaksi dengan sumber lain.

### 8.2 Best Practices

**Penulisan Kode:**
- Gunakan type annotation untuk modifier values
- Selalu sertakan source information untuk setiap modifier
- Gunakan console.warn untuk nilai yang mendekati cap
- Implementasikan proper error handling untuk edge cases

**Performance:**
- Enable caching untuk production
- Avoid recalculating stats yang sama dalam satu tick
- Batch stat requests ketika memungkinkan
- Use lazy loading untuk optional modifiers

**Testing:**
- Write unit tests untuk setiap fungsi kurva pertumbuhan
- Test edge cases untuk setiap cap configuration
- Verify ordering independence dalam setiap layer
- Test integration dengan sistem lain

### 8.3 Common Pitfalls

**Pitfall 1: Modifier Type Confusion**
Memilih tipe modifier yang salah dapat menyebabkan hasil yang tidak expected. Gunakan FLAT untuk nilai absolut, PERCENT_ADD untuk persentase yang dijumlahkan, dan PERCENT_MULT untuk multipliers yang dikalikan.

**Pitfall 2: Layer Ordering**
Menambahkan modifier ke layer yang salah dapat menyebabkan hasil yang tidak sesuai ekspektasi. Selalu rujuk ke tabel layer ordering untuk memastikan konsistensi.

**Pitfall 3: Cache Invalidation**
Lupa menginvalidasi cache setelah modifier berubah dapat menyebabkan nilai yang stale. Implementasikan proper cache invalidation strategy.

---

## 9. Troubleshooting dan FAQ

### 9.1 Masalah Umum dan Solusi

**Masalah 1: Nilai Stat Tidak Sesuai Ekspektasi**

| Kemungkinan Penyebab | Cara Verifikasi | Solusi |
|---------------------|-----------------|--------|
| Modifier tidak ter-apply | Cek breakdown dengan `getDetailedBreakdown()` | Pastikan modifier source correctly registered |
| Caps applied terlalu agresif | Cek layer CAPS dalam breakdown | Adjust cap configuration |
| Layer ordering salah | Verifikasi urutan layer dalam code | Reorder modifiers sesuai layer hierarchy |
| Conditional modifier tidak trigger | Cek kondisi dengan unit context | Pastikan context parameter lengkap |

**Masalah 2: Performance Issues**

| Gejala | Penyebab Potensial | Solusi |
|--------|-------------------|--------|
| Stat calculation lambat | Cache disabled | Enable cache dengan appropriate TTL |
| Memory leak | Cache tidak dibersihkan | Implementasikan cache eviction policy |
| High CPU usage | Terlalu banyak recalculation | Batch requests, optimize query patterns |

**Masalah 3: Inconsistent Results**

| Gejala | Penyebab Potensial | Solusi |
|--------|-------------------|--------|
| Hasil berbeda antar calls | Floating point precision | Gunakan rounding pada final value |
| Hasil berbeda antar servers | Config inconsistency | Centralize configuration |
| Hasil berbeda setelah reload | State not properly saved | Verify serialization/deserialization |

### 9.2 FAQ (Frequently Asked Questions)

**Q: Bagaimana cara menambahkan custom cap untuk statistik tertentu?**

A: Gunakan method `setCaps()` pada EnhancedStat instance:

```javascript
const health = new EnhancedStat(100, {
    name: 'health_max',
    max: 99999,
    min: 0,
    softCap: 5000,
    softCapFactor: 0.1
});

// Override dengan custom cap
health.setCaps({
    hardCap: 50000,
    softCap: 3000,
    softCapFactor: 0.2
});
```

**Q: Apakah modifier dari layer berbeda dapat saling overwrite?**

A: Tidak. Setiap layer diproses secara independen dan hasilnya diakumulasi. Modifier dari layer berbeda tidak akan saling overwrite karena setiap layer memiliki responsibility yang terpisah. Overwrite hanya terjadi dalam layer yang sama untuk modifier dengan source dan priority yang sama.

**Q: Bagaimana cara membuat conditional modifier yang bergantung pada HP?**

A: Gunakan conditional modifier dengan condition type `STAT_THRESHOLD`:

```javascript
stat.addModifier({
    value: 50,
    type: StatModifierType.FLAT,
    source: 'Recklessness',
    condition: {
        type: ConditionType.STAT_THRESHOLD,
        statKey: 'health_max',
        operator: '<',
        threshold: 0.30 // 30% HP
    }
});
```

**Q: Apa bedanya PERCENT_ADD dan PERCENT_MULT?**

A: PERCENT_ADD menambahkan persentase ke nilai dasar (10% + 10% = 20% total increase), sementara PERCENT_MULT mengalikan nilai dengan faktor (1.1 × 1.1 = 1.21 = 21% total increase). Gunakan PERCENT_ADD untuk bonuses yang seharusnya dijumlahkan, dan PERCENT_MULT untuk multipliers yang seharusnya bersifat multiplikatif.

**Q: Bagaimana cara mendebug nilai stat yang tidak expected?**

A: Gunakan `getDetailedBreakdown()` untuk melihat breakdown lengkap:

```javascript
const breakdown = health.getDetailedBreakdown();
console.log('Final Value:', breakdown.value);
console.log('Layer Breakdown:', breakdown.layers);
console.log('Applied Caps:', breakdown.caps);

// Untuk setiap layer
breakdown.layers.forEach(layer => {
    console.log(`Layer ${layer.order} (${layer.layer}): ${layer.value} (Total: ${layer.runningTotal})`);
});
```

**Q: Apakah sistem mendukung negative modifiers?**

A: Ya, semua tipe modifier mendukung nilai negatif. Negative FLAT modifier mengurangi nilai absolut, negative PERCENT_ADD mengurangi persentase, dan negative PERCENT_MULT mengurangi nilai melalui division.

### 9.3 Error Codes dan Meanings

| Error Code | Meaning | Cause | Solution |
|------------|---------|-------|----------|
| `ERR_STAT_NOT_FOUND` | Stat tidak ditemukan dalam konfigurasi | Typo dalam nama stat atau stat tidak didefinisikan | Verify stat name dalam registry |
| `ERR_CAP_INVALID` | Konfigurasi cap tidak valid | Missing required fields atau nilai invalid | Check cap configuration structure |
| `ERR_MODIFIER_INVALID` | Modifier tidak valid | Missing required fields | Verify modifier object structure |
| `ERR_LAYER_INVALID` | Layer number tidak valid | Layer di luar range 1-12 | Verify layer number |
| `ERR_CACHE_FULL` | Cache memory exceeded | Terlalu banyak cached entries | Implement cache eviction |
| `ERR_PRECISION_LOSS` | Potential floating point precision loss | Very large atau very small values | Consider using BigInt untuk extreme values |

---

## 10. Referensi

### 10.1 File Dokumentasi Terkait

| Dokumen | Lokasi | Deskripsi |
|---------|--------|-----------|
| COMBAT_SYSTEM.md | `docs/COMBAT_SYSTEM.md` | Dokumentasi sistem combat lengkap |
| TRAITS_REFERENCE.md | `docs/TRAITS_REFERENCE.md` | Referensi trait system |
| API.md | `docs/API.md` | Referensi API untuk combat dan stat |
| Konsep Game Design | `docs/konsep/` | Konsep dan desain awal |

### 10.2 File Kode Terkait

| File | Lokasi | Deskripsi |
|------|--------|-----------|
| statSystem.js | `server/src/logic/statSystem.js` | EnhancedStat implementation |
| statService.js | `server/src/services/statService.js` | Main stat service |
| StatCurveCalculator.js | `server/src/services/stat/StatCurveCalculator.js` | Growth curve implementations |
| ElementalResolver.js | `server/src/services/stat/ElementalResolver.js` | Elemental calculations |
| SetBonusResolver.js | `server/src/services/stat/SetBonusResolver.js` | Set bonus handling |
| StatCapResolver.js | `server/src/services/stat/StatCapResolver.js` | Cap management |

### 10.3 Sumber Eksternal

- Dokumentasi Prisma ORM untuk database schema
- Spesifikasi IEEE 754 untuk floating point arithmetic
- Dokumentasi JavaScript Math object untuk fungsi matematika

---

## Lampiran

### A. Changelog

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2024-06-01 | Initial release |

### B. Kontributor

Dokumentasi ini ditulis dan dipelihara oleh Tim Developer Textical.

### C. Lisensi

Dokumentasi ini adalah bagian dari proyek Textical dan dilindungi oleh lisensi proyek yang sama.

---

*Dokumen ini terakhir diperbarui: 2024-06-01*
