# LAPORAN AUDIT KODE: userController.js (FINAL v5)

## 📋 Ringkasan File
File: `server/src/controllers/userController.js`

---

## 🚨 KESALAHAN YANG DITEMUKAN

### 1. **CRITICAL: Composite Key Format Salah pada `upsert`** (Baris 88-92)

```javascript
// KODE YANG SALAH:
await prisma.userAttribute.upsert({
    where: { userId_key: { userId, key } },  // ❌ SALAH
    update: { valStr, valInt, valFloat, valBool },
    create: { userId, key, valStr, valInt, valFloat, valBool }
});
```

**Masalah:** Format composite key `userId_key` tidak valid untuk Prisma.

**Bukti dari schema:**
```prisma
model UserAttribute {
  id        Int      @id @default(autoincrement())
  userId    Int
  key       String
  ...
  @@unique([userId, key])  // <- Format yang benar
}
```

**Perbaikan yang seharusnya:**
```javascript
where: { userId: userId, key: key }
// ATAU langsung:
where: { userId, key }
```

**Status:** ❌ Akan menyebabkan error saat upsert dijalankan

---

### 2. **CRITICAL: Empty Attributes Array Tidak Fallback ke Legacy JSON** (Baris 44)

```javascript
if (user.attributes) {  // ❌ [] (empty array) adalah truthy!
    user.attributes.forEach(attr => { ... });
} else {
    // ❌ Block ini TIDAK PERNAH dijalankan jika attributes = []
    try { ... } catch (e) {}
}
```

**Masalah:** 
- Jika UserAttribute table kosong (tidak ada records), Prisma mengembalikan array kosong `[]`
- `[]` adalah truthy dalam JavaScript, jadi masuk ke blok pertama
- forEach pada array kosong tidak melakukan apapun
- Hasil: `settingsObj = {}` (kosong), padahal legacy `user.settings` punya data!
- **User kehilangan semua settings lama mereka!**

**Perbaikan:**
```javascript
if (user.attributes && user.attributes.length > 0) {
    user.attributes.forEach(attr => { ... });
} else {
    // Fallback ke legacy JSON
    try { ... } catch (e) {}
}
```

---

### 3. **WARNING: Double Write Pattern - Risiko Inkonsistensi Data** (Baris 96-101)

```javascript
// Update ke tabel relasional
await prisma.userAttribute.upsert({ ... });

// JGUA update ke field JSON legacy
await prisma.user.update({
    where: { id: userId },
    data: { settings: JSON.stringify(settings) }
});
```

**Masalah:** Jika salah satu operasi gagal, data menjadi tidak konsisten.

**Rekomendasi:** Gunakan transaction:
```javascript
await prisma.$transaction([
    prisma.userAttribute.upsert({ ... }),
    prisma.user.update({ ... })
]);
```

---

### 4. **WARNING: Missing Input Validation pada `updateSettings`** (Baris 72-78)

```javascript
const userId = parseInt(req.body.userId);
const { settings } = req.body;  // ❌ Tidak ada validasi
if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

// Iterasi tanpa cek apakah settings adalah object
for (const [key, value] of Object.entries(settings)) {  // ❌ Bisa error jika settings undefined/null
```

**Masalah:** 
- Jika `req.body.settings` undefined atau null, `Object.entries(settings)` akan throw TypeError
- Tidak ada validasi bahwa settings adalah object

**Perbaikan:**
```javascript
if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return this.sendError(res, "Invalid settings format", 400);
}
```

---

### 5. **WARNING: Silent Error Swallowing** (Baris 53-55)

```javascript
try {
    Object.assign(settingsObj, JSON.parse(user.settings || "{}"));
} catch (e) {}  // ❌ Empty catch - error diabaikan
```

**Masalah:** Jika parsing JSON gagal, error diabaikan tanpa logging. Ini menyulitkan debugging.

**Rekomendasi:**
```javascript
try {
    Object.assign(settingsObj, JSON.parse(user.settings || "{}"));
} catch (e) {
    console.error('Failed to parse user.settings:', e);
}
```

---

### 6. **WARNING: Missing `visualType` dalam Fallback Object** (Baris 36-40)

```javascript
const regionMetadata = user.region ? { 
    type: user.region.visualType, 
    visualType: user.region.visualType,
    name: user.region.name 
} : { type: "TOWN", name: "Unknown" };  // ❌ visualType tidak ada di fallback!
```

**Masalah:** Response tidak konsisten - success case punya `visualType`, tapi fallback tidak.

**Perbaikan:**
```javascript
} : { type: "TOWN", visualType: "TOWN", name: "Unknown" };
```

---

### 7. **WARNING: req.params / req.body Undefined Safety** (Baris 8, 74)

```javascript
// Line 8:
const userId = parseInt(req.params.id);  // ❌ req.params bisa undefined

// Line 74:
const { settings } = req.body;  // ❌ req.body bisa undefined
```

**Masalah:** Jika req.params/req.body undefined, akan throw TypeError sebelum validasi.

**Rekomendasi:**
```javascript
// Line 8:
if (!req.params?.id) return this.sendError(res, "Missing User ID", 400);
const userId = parseInt(req.params.id);

// Line 74:
if (!req.body) return this.sendError(res, "Missing request body", 400);
const { settings } = req.body;
```

---

### 8. **WARNING: JSON.stringify Bisa Gagal** (Baris 100)

```javascript
data: { settings: JSON.stringify(settings) }  // ❌ Bisa gagal pada circular reference
```

**Masalah:** Jika settings mengandung circular reference, JSON.stringify akan throw error.

**Rekomendasi:**
```javascript
try {
    data: { settings: JSON.stringify(settings) }
} catch (e) {
    return this.sendError(res, "Invalid settings format", 400);
}
```

---

### 9. **WARNING: Sequential Database Operations** (Baris 78-94)

```javascript
for (const [key, value] of Object.entries(settings)) {
    // ... await di dalam loop
    await prisma.userAttribute.upsert({ ... });  // ❌ Setiap iterasi tunggu selesai
    updatedSettings[key] = value;
}
```

**Masalah:** Jika ada banyak settings, operasi akan sangat lambat karena sequential.

**Rekomendasi:** Gunakan Promise.all untuk parallel execution:
```javascript
const promises = Object.entries(settings).map(async ([key, value]) => {
    // ... processing
    await prisma.userAttribute.upsert({ ... });
    return [key, value];
});
const entries = await Promise.all(promises);
const updatedSettings = Object.fromEntries(entries);
```

---

### 10. **WARNING: No Protection Against Prototype Pollution** (Baris 78-93)

```javascript
for (const [key, value] of Object.entries(settings)) {
    // ... langsung gunakan key tanpa validasi
    settingsObj[attr.key] = ...;  // ❌ key bisa "__proto__" atau "constructor"
}
```

**Masalah:** Jika attacker mengirim key seperti `__proto__` atau `constructor`, bisa cause prototype pollution.

**Rekomendasi:**
```javascript
const blockedKeys = ['__proto__', 'constructor', 'prototype'];
for (const [key, value] of Object.entries(settings)) {
    if (blockedKeys.includes(key)) continue;
    // ...
}
```

---

### 11. **WARNING: No Authorization Check** (Baris 72)

```javascript
const userId = parseInt(req.body.userId);
// ❌ Tidak ada validasi bahwa user yang login adalah user yang diupdate
```

**Masalah:** Siapa saja bisa update settings user lain dengan mengubah userId di request body.

**Rekomendasi:** Ambil userId dari session/token, bukan dari request body:
```javascript
const userId = req.user.id; // Dari auth middleware
```

---

### 12. **WARNING: NaN dan Infinity Tidak Di-handle** (Baris 79-86)

```javascript
if (typeof value === 'number') {
    // ❌ NaN dan Infinity masuk sini
    if (Number.isInteger(value)) valInt = value;
    else valFloat = value;
}
```

**Masalah:** 
- NaN akan disimpan sebagai valFloat
- Infinity/-Infinity akan disimpan sebagai valFloat
- Ini bisa cause unexpected behavior saat dibaca kembali

---

### 13. **WARNING: Symbol Keys Diabaikan** (Baris 78)

```javascript
for (const [key, value] of Object.entries(settings)) {
    // ❌ Jika key adalah Symbol, tidak akan diiterasi
}
```

**Masalah:** Symbols sebagai keys diabaikan oleh Object.entries. Ini mungkin intended, tapi perlu dicatat.

---

### 14. **WARNING: taskQueue Tidak Di-check Apakah Array** (Baris 30)

```javascript
const activeTask = user.taskQueue.length > 0 ? {  // ❌ asumsi taskQueue selalu array
```

**Masalah:** Jika taskQueue bukan array (unexpected), akan error.

**Rekomendasi:**
```javascript
if (!Array.isArray(user.taskQueue) || user.taskQueue.length > 0) {
```

---

### 15. **WARNING: No Rate Limiting** (Method `updateSettings`)

```javascript
// Tidak ada rate limiting protection
async updateSettings(req, res) {
```

**Masalah:** Attacker bisa spam updateSettings untuk DoS atau mengisi database dengan banyak attribute records.

---

### 16. **WARNING: Key/Value Length Tidak Di-validasi** (Baris 78-93)

```javascript
for (const [key, value] of Object.entries(settings)) {
    // ❌ Tidak ada batas panjang key/value
}
```

**Masalah:** User bisa mengirim key/value dengan panjang sangat besar untuk DoS atau mengisi storage.

**Rekomendasi:**
```javascript
const MAX_KEY_LENGTH = 255;
const MAX_VALUE_LENGTH = 10000;
for (const [key, value] of Object.entries(settings)) {
    if (key.length > MAX_KEY_LENGTH) continue;
    if (String(value).length > MAX_VALUE_LENGTH) continue;
    // ...
}
```

---

### 17. **WARNING: attribute.key Tidak Di-validasi** (Baris 45-50)

```javascript
user.attributes.forEach(attr => {
    // ❌ attr.key bisa null/undefined
    settingsObj[attr.key] = ...;
});
```

**Masalah:** Jika ada record dengan key null/undefined, akan create object with invalid keys.

---

### 18. **WARNING: premiumTier Relation Error Handling** (Baris 22)

```javascript
premiumTier: true,  // ❌ Jika relation gagal, whole query gagal
```

**Masalah:** Jika premiumTierId point ke record yang tidak ada, entire findUnique akan gagal.

---

### 19. **INFO: Inkonsistensi Sumber userId** 

| Metode | Sumber userId |
|--------|---------------|
| `getUserProfile` | `req.params.id` (line 8) |
| `updateSettings` | `req.body.userId` (line 72) |

Ini bukan bug teknis, tapi inkonsistensi desain API.

---

### 20. **INFO: Object/Array values dikonversi jadi string** (Baris 79-86)

```javascript
valStr = String(value);  // Object/Array => "[object Object]" atau "1,2,3"
```

---

### 21. **INFO: Return Value Format Berbeda** (Baris 61-66, 103)

getUserProfile vs updateSettings mengembalikan format response yang berbeda.

---

## 📊 Summary

| Severity | Issue | Line |
|----------|-------|------|
| 🔴 CRITICAL | Composite key format salah di upsert | 88-92 |
| 🔴 CRITICAL | Empty attributes array tidak fallback ke JSON | 44 |
| 🟡 WARNING | Double write tanpa transaction | 96-101 |
| 🟡 WARNING | Missing input validation | 72-78 |
| 🟡 WARNING | Silent error swallowing | 53-55 |
| 🟡 WARNING | Missing visualType dalam fallback | 36-40 |
| 🟡 WARNING | req_params/req.body undefined safety | 8, 74 |
| 🟡 WARNING | JSON.stringify failure | 100 |
| 🟡 WARNING | Sequential DB operations | 78-94 |
| 🟡 WARNING | No prototype pollution protection | 78-93 |
| 🟡 WARNING | No authorization check | 72 |
| 🟡 WARNING | NaN/Infinity handling | 79-86 |
| 🟡 WARNING | taskQueue array check | 30 |
| 🟡 WARNING | No rate limiting | updateSettings |
| 🟡 WARNING | Key/value length validation | 78-93 |
| 🟡 WARNING | attribute.key null check | 45-50 |
| 🟡 WARNING | premiumTier relation error | 22 |
| 🟡 WARNING | Symbol keys ignored | 78 |
| 🟢 INFO | Inkonsistensi sumber userId | 8, 72 |
| 🟢 INFO | Object/Array value conversion | 79-86 |
| 🟢 INFO | Return value format inconsistency | 61-66, 103 |

---

## ✅ Rekomendasi Perbaikan

1. **Wajib diperbaiki:** 
   - Perbaiki format composite key pada line 89
   - **FIX: Tambahkan length check untuk attributes array** - CRITICAL!
   - Tambahkan validasi input untuk settings
   - Fix missing visualType di fallback
   - Tambah undefined safety checks
   - Hapus empty catch block
   - Tambah authorization check
   - Tambah prototype pollution protection
   - Tambah NaN/Infinity handling
   - Tambah key/value length validation
   - Tambah null check untuk attr.key

2. **Disarankan:** 
   - Wrap operasi dengan `prisma.$transaction()` untuk double write
   - Wrap JSON.stringify dengan try-catch
   - Gunakan Promise.all untuk parallel DB operations
   - Tambahkan rate limiting

3. **Opsional:** Standarisasi penggunaan params untuk userId

---

*Laporan dibuat oleh Code Skeptic Mode*
