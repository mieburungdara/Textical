# Tick-Based Combat System Rule

## Core Principle
Sistem combat menggunakan Tick Engine, BUKAN waktu real-time.

DILARANG menggunakan:
- DateTime
- Date.now()
- performance.now()
- System.currentTimeMillis()
- setTimeout berbasis real-time
- Thread.sleep berbasis milidetik

Semua mekanisme harus berbasis:
- Tick Counter
- Game Loop Tick

---

## Time Representation Standard

Gunakan:
- currentTick (integer)
- tickInterval (fixed step)
- nextActionTick
- cooldownTick
- durationTick

Contoh:
- Skill cooldown 5 detik → dikonversi menjadi 300 tick (jika 60 tick/sec)
- Buff duration → expireTick = currentTick + durationTick

---

## Combat Logic Rule

Semua sistem berikut WAJIB berbasis tick:
- Cooldown skill
- Buff/Debuff duration
- Damage over time (DoT)
- Heal over time (HoT)
- Turn order
- AI decision timing
- Animation state trigger

---

## Deterministic Simulation Rule

Combat harus:
- Deterministic
- Replayable
- Tidak tergantung clock sistem
- Tidak berubah karena lag atau FPS drop

Tick engine menjadi satu-satunya sumber kebenaran waktu.

---

## Refactor Trigger

Jika ditemukan:
- Penggunaan DateTime
- Perhitungan berbasis detik langsung
- Timer real-time di combat module

Maka WAJIB diganti menjadi tick-based logic.

---

## Enforcement

Sebelum commit:
- Cari keyword: Date, Time, now, setTimeout
- Validasi semua duration dalam bentuk tick
- Pastikan combat module tidak mengakses system clock
