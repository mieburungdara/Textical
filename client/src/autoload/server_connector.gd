extends Node

## Professional Server Connector.
## Comprehensive serialization including elemental resistances and traits.

signal connection_established
signal battle_result_received(result: Dictionary)

var socket := WebSocketPeer.new()
var is_connected_to_server := false
var server_url := "ws://localhost:3000"

func _process(_delta):
	socket.poll()
	var state = socket.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN:
		if not is_connected_to_server:
			is_connected_to_server = true
			connection_established.emit()
		while socket.get_available_packet_count() > 0:
			_on_data_received(socket.get_packet())
	elif state == WebSocketPeer.STATE_CLOSED:
		is_connected_to_server = false

func connect_to_server(url: String = ""):
	if url != "": server_url = url
	socket.connect_to_url(server_url)

func _on_data_received(packet: PackedByteArray):
	var json_str = packet.get_string_from_utf8()
	var data = JSON.parse_string(json_str)
	if data and data.get("type") == "battle_replay":
		battle_result_received.emit(data)

func request_battle(dungeon_id: String, party: Dictionary):
	var request = {
		"type": "start_battle",
		"dungeon_id": dungeon_id,
		"party": _serialize_party_full(party)
	}
	socket.send_text(JSON.stringify(request))

func _serialize_party_full(party: Dictionary) -> Array:
	var serialized = []
	for pos in party:
		var hero = party[pos] as HeroData
		if not hero: continue
		
		var hero_dict = {
			"pos": {"x": pos.x, "y": pos.y},
			"id": hero.id,
			"name": hero.name,
			"hp_base": hero.hp_base,
			"mana_base": hero.mana_base,
			"damage_base": hero.damage_base,
			"defense_base": hero.defense_base,
			"speed_base": hero.speed_base,
			"range_base": hero.range_base,
			"element": int(hero.element),
			"hp_regen": hero.hp_regen,
			"mana_regen": hero.mana_regen,
			"crit_chance": hero.crit_chance,
			"crit_damage": hero.crit_damage,
			"dodge_chance": hero.dodge_chance,
			"block_chance": hero.block_chance,
			# ELEMENTAL RESISTANCES
			"res_fire": hero.res_fire,
			"res_water": hero.res_water,
			"res_wind": hero.res_wind,
			"res_earth": hero.res_earth,
			"res_lightning": hero.res_lightning,
			"hp_bonus": hero.hp_bonus,
			"damage_bonus": hero.damage_bonus,
			"speed_bonus": hero.speed_bonus,
			"flee_threshold": hero.flee_threshold,
			"preferred_range": hero.preferred_range,
			"target_priority": int(hero.target_priority),
			"traits": _serialize_traits(hero.traits),
			"current_job": _serialize_job(hero.current_job),
			"equipment": _serialize_equipment(hero.equipment),
			"skills": _serialize_skills(hero.skills)
		}
		serialized.append(hero_dict)
	return serialized

func _serialize_job(job: JobData) -> Dictionary:
	if not job: return {}
	return {
		"id": job.id,
		"hp_mult": job.hp_mult,
		"damage_mult": job.damage_mult,
		"speed_mult": job.speed_mult,
		"crit_mult": job.crit_mult,
		"dodge_mult": job.dodge_mult,
		"mana_mult": job.mana_mult,
		"range_bonus": job.range_bonus
	}

func _serialize_equipment(equipment: Dictionary) -> Dictionary:
	var dict = {}
	for slot in equipment:
		var inst = equipment[slot]
		if inst:
			var traits = []
			for t in inst.data.traits:
				if t: traits.append(t.display_name.to_lower())
			dict[str(slot)] = {
				"uid": inst.uid,
				"data": {
					"id": inst.data.id,
					"stat_bonuses": inst.data.stat_bonuses,
					"traits": traits
				}
			}
	return dict

func _serialize_traits(traits: Array[Trait]) -> Array:
	var list = []
	for t in traits:
		if t: list.append(t.display_name.to_lower())
	return list

func _serialize_skills(skills: Array[SkillData]) -> Array:
	var list = []
	for s in skills:
		if s:
			list.append({
				"id": s.id,
				"name": s.name,
				"mana_cost": s.mana_cost,
				"range": s.skill_range,
				"cooldown": s.cooldown,
				"damage_multiplier": s.damage_multiplier,
				"aoe_pattern": s.aoe_pattern,
				"aoe_size": s.aoe_size
			})
	return list
