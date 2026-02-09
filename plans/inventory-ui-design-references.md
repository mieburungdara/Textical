# Inventory Screen UI Design References

## Game Reference Analysis

### 1. Diablo IV - Inventory Design
**Visual Style:** Dark, gothic fantasy dengan accent colors untuk rarity

```
┌─────────────────────────────────────────────────────────────────┐
│  [BAG]                            [SORT ▼]    [UPGRADE]  [➕]   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌─────────────────────────────────┐  │
│  │  WEAPON   ARMOR      │  │  ┌─╮                            │  │
│  │  HELMET   ACCESSORY  │  │  │◆│  SHARD OF AGNIS             │  │
│  │  MATERIAL CONSUMABLE │  │  └─╯  ───────────────────────   │  │
│  │  MISC     ALL       │  │  [EPIC]  [LVL 85]               │  │
│  │                      │  │                                 │  │
│  │  ┌─┐ ┌─┐ ┌─┐ ┌─┐   │  │  Damage: 2450-3200             │  │
│  │  │S│ │S│ │S│ │S│   │  │  Crit: 12%  AtkSpd: +8%        │  │
│  │  └─┘ └─┘ └─┘ └─┘   │  │  ───────────────────────       │  │
│  │  ┌─┐ ┌─┐ ┌─┐ ┌─┐   │  │  "Ancient blade forged in       │  │
│  │  │S│ │S│ │S│ │S│   │  │   the volcanic forges..."     │  │
│  │  └─┘ └─┘ └─┘ └─┘   │  │                                 │  │
│  │  ┌─┐ ┌─┐ ┌─┐ ┌─┐   │  │  ┌──────────────┬──────────┐   │  │
│  │  │S│ │S│ │S│ │S│   │  │  │    EQUIP     │   DROP   │   │  │
│  │  └─┘ └─┘ └─┘ └─┘   │  │  └──────────────┴──────────┘   │  │
│  │  ┌─┐ ┌─┐ ┌─┐ ┌─┐   │  │                                 │  │
│  │  │ │ │ │ │ │ │ │   │  │  845 DPS  │  2.4 kg  │  1250 g  │  │
│  │  └─┘ └─┘ └─┘ └─┘   │  └─────────────────────────────────┘  │
│  └──────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Elements:**
- Kategori tabs di kiri (Weapon, Armor, etc.)
- Rarity badges dengan warna dan icon
- Stats lengkap dengan numbers
- Description dengan lore text
- Action buttons besar: Equip, Drop, Compare
- Item stats summary: DPS, Weight, Gold value
- 7-slot kategori tabs
- Accent colors: Gold untuk Legendary, Purple untuk Epic

---

### 2. Baldur's Gate 3 - Inventory Panel
**Visual Style:** D&D tabletop dengan parchment dan leather textures

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─╮  CAMERON'S PACK                          [⚙️]  [🔍]  [✕]   │
├─────────────────────────────────────────────────────────────────┤
│  │ All  │ Weapons │ Armor │ Consum │ Misc │ Quest │  🡅 🡇   │
├─────────────────────────────────────────────────────────────────┤
│  │      │                                              │       │
│  │ ╔═══╗│  [⚔️]  ╔═══╗  [📦]  ╔═══╗  [🧪]           │       │
│  │ ║⚔️ ║│        ║🛡️ ║       ║   ║  [📦]  ╔═══╗      │       │
│  │ ╠═══╣│  ╔═══╗ ╠═══╣  ╔═══╗ ║   ║  [📦] ║🧪 ║      │       │
│  │ ║   ║│  ║🧪 ║ ║   ║       ║   ║       ╠═══╣      │       │
│  │ ╚═══╝│  ╚═══╝ ╚═══╝  ╔═══╗ ╚═══╝  ╔═══╗ ╔═══╗      │       │
│  │  5/20│              ║📦║       ║   ║  ║📦║        │       │
│  │ ──── │  ╔═══╗  [⚔️]  ╚═══╝  [📦]  ║   ║        │       │
│  │ 2.4kg│  ║📦║               ╔═══╗  ╚═══╝        │       │
│  │      │  ╚═══╝  [📦]       ║🧪║                 │       │
│  │ ┌─╮  │               [📦] ╚═══╗  [📦]         │       │
│  │ │✕│  │                       ║📦║            │       │
│  │ └─╯  │                                               │       │
│  ├──────────────────────────────────────────────────────┤       │
│  │  ┌─────────────────────────────────────────────────┐ │       │
│  │  │  🗡️ LONGWORD +1                                 │ │       │
│  │  │  ─────────────────────────────────────────────  │ │       │
│  │  │  1d8+2 Slashing • Versatile                    │ │       │
│  │  │  Weight: 2 lb  •  Price: 15 gp                 │ │       │
│  │  │                                                 │ │       │
│  │  │  "A blade of fine steel, well-balanced          │ │       │
│  │  │   for precise strikes..."                       │ │       │
│  │  └─────────────────────────────────────────────────┘ │       │
│  │                                     [📍 Take] [🎁 Give]│       │
│  └───────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Elements:**
- Horizontal category tabs dengan icons
- Grid items dengan slot backgrounds
- Selected item overlay effects
- Detailed D&D-style descriptions
- Weight/Price indicators
- Take/Give action buttons
- Equipment slot previews
- Sort buttons dan filters
- Leather/parchment texture feel

---

### 3. Elden Ring - Inventory Menu
**Visual Style:** Minimalist, elegant, dengan gold accents

```
┌─────────────────────────────────────────────────────────────────┐
│  KEY ITEMS                    ───────────────────  42 / 999     │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────────┐   │
│  │                        │  │  ╭──────────────────────╮    │   │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │  │      🏆               │    │   │
│  │  │⚔️│ │🛡️│ │🧪│ │📦│   │  │   RADAHN'S            │    │   │
│  │  └──┘ └──┘ └──┘ └──┘   │  │   GREAT RUNE           │    │   │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │  │   ─────────────────    │    │   │
│  │  │📦│ │📦│ │📦│ │📦│   │  │   Level 5              │    │   │
│  │  └──┘ └──┘ └──┘ └──┘   │  │   [Rune Arc x2]        │    │   │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │  │                        │    │   │
│  │  │📦│ │📦│ │📦│ │  │   │  │  ═══════════════════   │    │   │
│  │  └──┘ └──┘ └──┘ └──┘   │  │  Level 5 → 6           │    │   │
│  │                        │  │  3000 Runes             │    │   │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐   │  │                        │    │   │
│  │  │📦│ │  │ │  │ │  │   │  │              [USE]     │    │   │
│  │  └──┘ └──┘ └──┘ └──┘   │  ╰──────────────────────╯    │   │
│  └────────────────────────┘  └────────────────────────────┘   │
│                                                                 │
│  ◀  ITEMS  CONSUMABLES  KEY ITEMS  ARMORS  WEAPONS  ▶         │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Elements:**
- Side panel untuk selected item details
- Large icon centered di panel
- Rune/Level upgrade system
- Minimalist gold accent colors
- Navigation arrows untuk categories
- Clean, uncluttered layout
- Numeric counters visible

---

### 4. Hades - Code Entry Style
**Visual Style:** Stylized, colorful, dengan glow effects

```
┌─────────────────────────────────────────────────────────────────┐
│  BOONS OF THE GODS                            5 / 10     🪙 145  │
│  ═══════════════════════════════════════════════════════════════│
│                                                                 │
│  [⚡]  [❄️]  [🔥]  [☠️]  [💀]  [🌊]  [⚔️]  [💰]  [💜]  [🔮]   │
│                                                                 │
│  ┌─────────────────────────────────────────┐  ┌─────────────┐  │
│  │                                         │  │ Ξ  CHAOS     │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐       │  │              │  │
│  │  │💜│ │💜│ │💜│ │💜│ │💜│ │💜│       │  │  ⚡ HUNTER'S  │  │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘       │  │   MARK        │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐       │  │              │  │
│  │  │💜│ │💜│ │💜│ │💜│ │💜│ │💜│       │  │  +25% dmg to  │  │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘       │  │  marked foes  │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐       │  │              │  │
│  │  │💜│ │💜│ │  │ │  │ │  │ │  │       │  │  ──────────   │  │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘       │  │              │  │
│  │                                         │  │  [DUPLICATE] │  │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐       │  │              │  │
│  │  │💜│ │  │ │  │ │  │ │  │ │  │       │  │              │  │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘       │  └─────────────┘  │
│  └─────────────────────────────────────────┘                  │
│                                                                 │
│  ◀                    HELLENIC GODS                     ▶      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Elements:**
- Color-coded god themes (purple untuk Dionysus, etc.)
- Stackable boons dengan visual stacks
- God portrait icons
- Duplicate functionality
- Selection highlight glow
- Dark background dengan colored accents
- Curved/smooth UI elements

---

## Proposed Design untuk Textical Inventory

### Concept: "Traveller's Satchel" dengan Fantasy RPG feel

```
┌─────────────────────────────────────────────────────────────────┐
│  🎒 TRAVELLER'S SATCHEL                     📦 8 / 20   ⚖️ 12.5  │
├─────────────────────────────────────────────────────────────────┤
│  [⚔️ WEAP] [🛡️ ARM] [🧪 CONS] [📦 MISC] [💍 ACSS] [📜 QUEST]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│   │ ⚔️  │ │ 🛡️  │ │ 🧪  │ │ 📦  │ │ 💍  │ │ 📦  │              │
│   ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤              │
│   │ ⚔️  │ │ 📦  │ │ 🧪  │ │ 📦  │ │ 🧪  │ │ 📦  │              │
│   ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤              │
│   │ 🗡️  │ │ 📦  │ │ 📦  │ │ 📜  │ │ 📦  │ │ 💎  │              │
│   ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤              │
│   │ 📦  │ │ 🏹  │ │ 🪵  │ │ 🪨  │ │ 🧪  │ │ 📦  │              │
│   ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤              │
│   │ 📦  │ │ 📦  │ │ 📦  │ │ 📦  │ │ 📦  │ │ 🗝️  │              │
│   ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤              │
│   │ 💀  │ │ 📦  │ │ 📦  │ │ 🧪  │ │ 📦  │ │ 📦  │              │
│   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│   │ 📦  │ │ 🪄  │ │ 📦  │ │ 📦  │ │    │                     │
│   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─╮                                                            │
│  │◆│  ✦  ELDER SWORD OF THE BEAR                               │
│  └─╯  ───────────────────────────────────────                   │
│       [RARE]  [ONE-HANDED]  [Level 45]                         │
│                                                             0.8 │
│       ┌─────────────────────────────────────────────────────┐   │
│       │ Damage: 245-380  │  Crit: +8%  │  Speed: +5%      │   │
│       └─────────────────────────────────────────────────────┘   │
│                                                             2.4 │
│       "An ancient blade forged by dwarven smiths in            │
│        the depths of the Iron Mountains..."                    │
│                                                             150 │
│       ┌─────────────────┐  ┌─────────────────┐                 │
│       │    [⚔️ EQUIP]   │  │     [🗑️ DROP]   │                 │
│       └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

**Color Scheme:**
- **Background:** Dark leather brown `#1A0F0A`
- **Accent Gold:** `#D4A84B` (borders, highlights)
- **Rare:** `#4FC3F7` (light blue)
- **Epic:** `#AB47BC` (purple)
- **Legendary:** `#FF8F00` (orange-gold)
- **Common:** `#9E9E9E` (gray)
- **Text Primary:** `#F5E6D3` (parchment white)
- **Text Secondary:** `#A08060` (tan)

**Visual Enhancements Needed:**
1. Rarity border glow effects
2. Category tab icons dengan active state
3. Item count badges (small numbers)
4. Weight display dengan scale icon
5. Slot hover dengan subtle scale animation
6. Selected item: larger border + glow
7. Stats row dengan colored values
8. Action buttons dengan icons + text
9. Lore description box dengan styling
10. Empty slot pattern texture

---

## Recommended Improvements untuk Current UI

### Quick Wins (1-2 jam):
1. **Tambah rarity glow** - CSS/GDScript glow effect
2. **Category tabs** - Horizontal tab bar dengan icons
3. **Better spacing** - Increase gaps, better padding
4. **Icon improvements** - Larger, better centered icons
5. **Hover effects** - Scale + brightness animation

### Medium Effort (3-6 jam):
6. **Stats grid** - Organized 2-column stat display
7. **Lore box styling** - Styled text box untuk description
8. **Action buttons** - Bigger, dengan icons
9. **Weight display** - Visible indicator dengan bar
10. **Selection highlight** - Clear active item state

### Advanced (1+ hari):
11. **Custom fonts** - Fantasy-style font
12. **Textures** - Leather, parchment, metal textures
13. **Particle effects** - Sparkles on rare item hover
14. **Sound effects** - Click, hover sounds
15. **Animations** - Smooth transitions, item fly-to-slot
