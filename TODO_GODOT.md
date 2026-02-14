# TODO GODOT - Inn System Integration

Daftar tugas implementasi UI di Godot untuk mendukung fitur Backend Inn System.

## Notice Board & Community
- [ ] **Notice Board Basic (V2):**
    - List rumor Monster Elite (MonsterSpotting).
    - Tab **Bounty Ledger** (Target PvP).
- [ ] **Monster Study UI:** Panel detail kelemahan & buff aktif.
- [ ] **Guestbook UI:** Board pesan regional.

## Inn Facilities & Gambling
- [ ] **Regional Stash UI:** Grid inventory spesifik lokasi.
- [ ] **Dice Gambling Mini-game:** 
    - Input Taruhan (Silver).
    - Pilihan Angka (1-6).
    - Animasi Dadu Bergulir.
- [ ] **Drunkenness Visual Effect:**
    - Shader atau Camera Shake (Sway) saat buff aktif.
- [ ] **Inn Social Hub UI:** Nama penyewa Bard & Visual "Inspired".
- [ ] **Respawn Binding UI:** Tombol "Set as Home".

## Risk & Reward Visualization
- [ ] **Danger Level HUD:** Indikator 1-6 di Map/Mini-HUD.
- [ ] **Bounty Hunter HUD:** Radar/Notifikasi pemain kriminal terdekat.

## Atmospheric Effects & Visuals
- [ ] **Mana Static Particles:** Efek partikel biru/magis di wilayah dengan intensitas tinggi.
- [ ] **Static Discharge VFX:** Animasi petir biru kecil saat Static Discharge terjadi di battle.
- [ ] **Herb Glow Shader:** Shader berpijar untuk item "Resonating" di inventory.
- [ ] **Charging UI Overlay:** Animasi progress bar pengisian mana di inventory.

## Regional Property & Housing (v11.0)
- [ ] **Plot Market UI:** Papan daftar plot tanah yang dijual di wilayah (Citadel/Village).
- [ ] **Property Management HUD:** Panel kontrol untuk Upgrade Tier, Rename, dan Guest Management.
- [ ] **Bulletin Board Editor:** UI untuk mengedit pesan papan pengumuman properti.
- [ ] **Recovery Stash Interaction:** Dialog pengambilan item dari penyitaan (Foreclosure).
- [ ] **Economic Hub Visuals:** Indikator visual/ikon jika wilayah berstatus Economic Hub.

## Regional Visuals & Atmosphere (v12.0)
- [ ] **Particle System Controller:** Integrasi `particleEffectPack` untuk memunculkan emiter partikel di World Atlas.
- [ ] **Skybox Switcher:** Logika penggantian `skyboxOverride` saat kamera memasuki grid wilayah.
- [ ] **Volumetric Fog Control:** Penyesuaian densitas kabut visual (`fogDensity`) secara dinamis.

## Regional Gathering Mechanics (v13.0)
- [ ] **Stamina Cost Display:** UI Tooltip yang menunjukkan perincian biaya stamina (Base x Regional Penalty - Discounts).
- [ ] **Mastery Level Progress:** Progress bar untuk keahlian profesi (Herbalism/Mining) di UI Hero.

## Immersion & Audio (v14.0)
- [ ] **Audio Engine Integration:** Implementasi `MapAudioManager` untuk memutar BGM secara dinamis dari `mapMusic.path`.
- [ ] **Lore UI:** Tampilkan `regionLoreSnippet` dalam panel detail wilayah saat pin atlas diklik.
- [ ] **Dynamic Ambience:** Sinkronisasi `ambientSfxPack` dengan kontrol volume ambience di Godot.
