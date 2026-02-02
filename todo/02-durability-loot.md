# 🛡️ Module 02: Durability & Loot System (Detailed)

## 1. Durability Mechanics
- **Scope**: Hanya berlaku untuk **Equipment** (Senjata, Zirah, Aksesoris). Item di dalam tas (Inventory) aman dari pengurangan durability.
- **Consumption (Per Use)**:
    - **Senjata**: Berkurang 1 poin setiap melakukan aksi (Attack/Skill).
    - **Armor & Aksesoris**: Berkurang 1 poin setiap kali menerima serangan (Hit).
- **Penalty (On Defeat)**:
    - **Blue Zone**: Seluruh equipment yang dikenakan berkurang **10% dari Max Durability**.
    - **Red Zone (Vs Player)**: Seluruh equipment berkurang **20% dari Max Durability** sebelum jatuh sebagai loot.
- **Zero Durability Effect**: 
    - Item dengan durability 0 memberikan **0 Stats** (Efeknya sama seperti tidak menggunakan equipment).
    - **Visual UI**: Slot equipment akan berwarna **Merah** di layar pemain sebagai peringatan bahwa item rusak total.
    - Item tidak akan hancur menjadi Trash selama masih berada di tangan pemilik (bisa diperbaiki).

## 2. Death & Loot Logic (Red Zone)
- **Vs Monster**: Seluruh equipment yang dikenakan **langsung dihapus** (lenyap selamanya).
- **Vs Player (Full Loot)**:
    - Seluruh isi Inventory dan Equipment jatuh sebagai loot.
    - **Trash Mechanic**: Item yang jatuh akan dicek durability-nya setelah terkena penalti 20%. Jika Durability ≤ 0, item tersebut berubah menjadi **"Trash"**.
    - **Trash Policy**: Item Trash **tidak dapat ditumpuk (Non-stackable)**. Satu item trash memakan satu slot inventory. Item trash tidak bisa diperbaiki dan tidak bisa dipakai.
- **Progression Penalty**: Setiap unit (hero) kehilangan **10% progress XP** pada Unit Level dan Class Level saat ini (Level tidak bisa turun).

## 3. Repair System (NPC Blacksmith)
- **No Failure**: Perbaikan 100% berhasil.
- **No Max Degradation**: Perbaikan tidak mengurangi Max Durability.
- **Cost Scaling**: Biaya perbaikan bergantung pada jumlah poin, Rarity (Common-Legendary), dan Level Item.

## 4. Technical Requirements
- Field `currentDurability` & `maxDurability` pada model `InventoryItem`.
- Flag visual `isBroken` di UI jika `currentDurability == 0`.
