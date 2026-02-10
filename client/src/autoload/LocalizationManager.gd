extends Node

## RESPONSIBILITY: Handles localization and string translation
## SINGLE RESPONSIBILITY: Only handles language-specific strings

const LOCALIZED_STRINGS = {
    "en": {
        "status_preparing": "Preparing the realm...",
        "status_updating": "Updating Assets: %d / %d",
        "status_ready": "The Realm is Ready. Welcome, Traveler.",
        "status_checking": "Checking for updates...",
        "status_error_assets": "Error updating assets: %s",
        "status_cancelling": "Cancelling...",
        "status_retrying": "Retrying (%d/%d)...",
        "status_failed": "Failed after %d attempts. Please restart.",
        "tips": [
            "TIP: Units in the frontline take more damage but protect the back.",
            "TIP: Gathering resources in high-danger zones yields rarer materials.",
            "TIP: Visit the Tavern daily to recruit specialized mercenaries.",
            "TIP: Check the Market often for bargain equipment from other players.",
            "TIP: Crafting higher-tier items requires a stable workbench in town.",
			"TIP: A tired hero recovers faster within the warmth of a town tavern."
        ],
        "logs": [
            "UNROLLING ANCIENT MAPS...",
            "BREWING VITALITY POTIONS...",
            "SUMMONING THE VANGUARD...",
            "CONSULTING THE ELDER ORACLE...",
            "SHARPENING RUSTY BLADES...",
            "LIGHTING THE TAVERN HEARTH...",
            "MAPPING FORBIDDEN REALMS...",
			"DECIPHERING OLD SCROLLS..."
        ]
    },
    "id": {
        "status_preparing": "Mempersiapkan dunia...",
        "status_updating": "Memperbarui Aset: %d / %d",
        "status_ready": "Dunia Sudah Siap. Selamat Datang, Penjelajah.",
        "status_checking": "Memeriksa pembaruan...",
        "status_error_assets": "Kesalahan memperbarui aset: %s",
        "status_cancelling": "Membatalkan...",
        "status_retrying": "Mencoba kembali (%d/%d)...",
        "status_failed": "Gagal setelah %d percobaan. Silakan muat ulang.",
        "tips": [
            "TIP: Unit di garis depan menerima lebih banyak kerusakan tetapi melindungi belakang.",
            "TIP: Mengumpulkan sumber daya di zona bahaya tinggi memberikan material yang lebih langka.",
            "TIP: Kunjungi Kedai setiap hari untuk merekrut tentara bayaran khusus.",
            "TIP: Periksa Pasar sesering mungkin untuk mendapatkan peralatan murah dari pemain lain.",
            "TIP: Pembuatan item tingkat tinggi membutuhkan meja kerja yang stabil di kota.",
			"TIP: Pahlawan yang lelah pulih lebih cepat dalam kehangatan kedai kota."
        ],
        "logs": [
            "MEMBUKA PETA KUNO...",
            "MERACIK RAMUAN VITALITAS...",
            "MEMANGGIL PASUKAN DEPAN...",
            "BERKONSULTASI DENGAN ORACLE TUA...",
            "MENGASAH PEDANG BERKARAT...",
            "MENYALAKAN PERAPIAN KEDAI...",
            "MEMETAKAN ALAM TERLARANG...",
			"MENGURAI GULUNGAN TUA..."
        ]
    }
}

var current_lang: String = "en"

func _ready():
    # In the future, this could be loaded from a settings file
    pass

## Simple localization helper
func translate(key: String, params: Array = []) -> String:
    if not LOCALIZED_STRINGS.has(current_lang):
        return key
        
    var lang_data = LOCALIZED_STRINGS[current_lang]
    var text = lang_data.get(key, key)
    
    if text is Array:
        return text.pick_random()
        
    if params.size() > 0:
        return text % params
        
    return text

func set_language(lang: String):
    if LOCALIZED_STRINGS.has(lang):
        current_lang = lang
