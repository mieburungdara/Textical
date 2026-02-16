# Tick-Based Combat System Rule

## Core Principle
Sistem combat menggunakan Tick Engine, BUKAN waktu real-time.
Berdasarkan arsitektur Textical:

Tick-based system HANYA berlaku untuk:
- Combat logic
- Battle simulation
- Turn-based mechanics

Boleh menggunakan:
- Date.now()
- DateTime
- performance.now()
- System.currentTimeMillis()
- setTimeout berbasis real-time
- Thread.sleep berbasis milidetik
- etc.

hanya untuk:
- Energy regeneration
- NPC wanderer timing
- World events
- Mail expiration
- Tavern timers
- Guild invites
- etc (sistem di luar combat)

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

Penggunaan `Date.now()` untuk sistem di luar combat (energy regeneration, NPC wanderer, world events, mail, tavern, guild) adalah **ACCEPTABLE** karena tick-based hanya berlaku untuk combat logic.

---

## Deterministic Simulation Rule

Combat harus:
- Deterministic
- Replayable
- Tidak tergantung clock sistem
- Tidak berubah karena lag atau FPS drop

---

## Refactor Trigger

Jika ditemukan:
- Penggunaan DateTime pada mode combat
- Timer real-time di combat module

Maka WAJIB diganti menjadi tick-based logic.

---

## Enforcement

Sebelum commit:
- Cari keyword: Date, Time, now, setTimeout
- Pastikan combat module tidak mengakses system clock
