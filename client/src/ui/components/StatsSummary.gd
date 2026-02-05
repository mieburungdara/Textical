extends HBoxContainer
class_name StatsSummary

## StatsSummary - Component untuk menampilkan stat hero (HP, MP, ATK, DEF)
## Scene reusable yang dapat di-instantiate untuk setiap hero/unit

# === NODE REFERENCES ===
@onready var hp_value: Label = $HPStat/HPValue
@onready var mp_value: Label = $MPStat/MPValue
@onready var atk_value: Label = $ATKStat/ATKValue
@onready var def_value: Label = $DEFStat/DEFValue

# === PUBLIC METHODS ===

## Update semua nilai stat
## @param hp: Nilai HP
## @param mp: Nilai MP
## @param atk: Nilai ATK
## @param def: Nilai DEF
func update_stats(hp: int, mp: int, atk: int, def: int):
	hp_value.text = str(hp)
	mp_value.text = str(mp)
	atk_value.text = str(atk)
	def_value.text = str(def)


## Update nilai stat dari dictionary totalStats
## @param stats: Dictionary berisi key-value stat (hp, mp, attack, defense)
func update_stats_from_dict(stats: Dictionary):
	var hp = int(stats.get("hp", 0))
	var mp = int(stats.get("mp", 0))
	var atk = int(stats.get("attack", 0))
	var def = int(stats.get("defense", 0))
	update_stats(hp, mp, atk, def)


## Reset semua nilai stat ke 0
func reset_stats():
	update_stats(0, 0, 0, 0)
