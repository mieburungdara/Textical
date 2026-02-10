# Unit Stat System - "Golden Specification" API

Dokumen ini adalah standar utama untuk implementasi API sistem stat di Textical. Mengintegrasikan mekanisme RPG taktis tingkat lanjut dengan fitur administratif untuk balancing dan auditing.

---

## 1. Core Endpoints (Calculation & Info)

### 1.1 Calculate Unit Stats
Menghitung total stat akhir berdasarkan base, level, equipment, buffs, dan context lingkungan.

```http
POST /api/stats/calculate
```

**Request Body:**
```json
{
    "heroId": 123,
    "context": "COMBAT", // GLOBAL | COMBAT | GATHERING | CRAFTING
    "environment": {
        "regionId": 5,     // Untuk efek Terrain (Lava, Slow, dll)
        "weather": "RAIN"  // Opsional: Buff/Debuff cuaca
    },
    "neighboringUnitIds": [124, 125], // Opsional: Untuk kalkulasi Aura/Synergy
    "includeBreakdown": true
}
```

**Response Highlights:**
- `finalStats`: Objek stat yang dikelompokkan (`core`, `offensive`, `defensive`, `utility`).
- `_breakdown`: Detail sumber tiap stat (Base + Flat Modifiers + % Modifiers).

---

### 1.2 Get Stat Metadata
Memberikan informasi tentang formula dan batas (caps) sistem stat.

```http
GET /api/stats/metadata
```

---

## 2. Stat Management (Allocation)

### 2.1 Batch Stat Allocation
Alokasi poin stat secara atomik dalam satu request.

```http
POST /api/stats/allocate
```

**Request Body:**
```json
{
    "heroId": 123,
    "allocations": {
        "str": 5,
        "dex": 2,
        "vit": 3
    }
}
```

---

### 2.2 Preview Allocation
Melihat perubahan stat sebelum poin benar-benar dikurangi.

```http
POST /api/stats/preview
```

---

### 2.3 Reset Stat Allocation
Mengembalikan semua poin alokasi ke `availablePoints`.

```http
POST /api/stats/reset
```

---

## 3. Advanced Tactical Features

### 3.1 Simulation & Analysis ("What If")
Simulasi dampak item atau buff baru tanpa mengubah database.

```http
POST /api/stats/simulate
```

**Request Body:**
```json
{
    "heroId": 123,
    "addItems": [501, 502], // Template IDs
    "addBuffs": ["bloodlust_v1"]
}
```

---

### 3.2 Dynamic Template Scaling
Menghitung stat Monster/NPC berdasarkan level dinamis (menggunakan growth curve).

```http
GET /api/stats/template/:id?level=50
```

---

### 3.3 Recovery & Time-To-Full (TTF)
Menghitung waktu nyata hingga stat penuh (HP, Mana, Vitality).

```http
GET /api/stats/recovery/:heroId
```

**Response:**
```json
{
    "hp": { "current": 80, "max": 100, "secondsToFull": 120 },
    "mana": { "current": 10, "max": 50, "secondsToFull": 600 }
}
```

---

## 4. Administrative & Balance Tools

### 4.1 Stat Change History (Audit)
Log perubahan stat permanen untuk mencegah eksploit atau debugging level up.

```http
GET /api/stats/history/:heroId
```

---

### 4.2 Balance Stress Test
Simulasi pertarungan otomatis antara Hero vs Monster untuk cek balancing.

```http
POST /api/admin/stats/balance-check
```

---

### 4.3 Global Recalculation (God Mode)
Memaksa seluruh database untuk menghitung ulang stat jika ada perubahan formula global.

```http
POST /api/admin/stats/recalculate-all
```

> [!IMPORTANT]
> Setiap kali Admin melakukan perubahan pada **Monster/Unit Template** melalui API, sistem **WAJIB** memanggil `DataSyncService.exportToJson()` untuk menjaga sinkronisasi file fisik (1 entity = 1 file).

---

## 5. Implementation Rules
1. **Source of Truth**: Database SQLite adalah sumber data utama.
2. **File Sync**: Setiap update pada template harus segera disinkronkan ke direktori `server/src/data/assets`.
3. **Logic Layer**: Semua kalkulasi berat harus berada di `StatProcessor` atau `UnitStatService`.
4. **Rounding**: Semua stat dasar menggunakan `Integer`, persentase menggunakan `Float`. Final calculation dibulatkan ke bawah (floor).
