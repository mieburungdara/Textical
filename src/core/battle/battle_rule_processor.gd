class_name BattleRuleProcessor
extends RefCounted

## Logic component for complex combat rules and resolutions.

func perform_attack(attacker: Object, defender: Object, sim: Object):
	var result = calculate_combat_result(attacker, defender, 0) # 0 = NONE element for basic attack
	
	if result.is_dodge:
		sim.log_entry(BattleLogEntry.Type.WAIT, "%s dodged the attack!" % defender.data.name, {"target_id": defender.data.id})
		return

	defender.take_damage(result.damage, attacker)
	
	var msg = "%s attacks %s for %d damage!" % [attacker.data.name, defender.data.name, result.damage]
	if result.is_crit: msg = "[CRITICAL] " + msg
	
	sim.log_entry(BattleLogEntry.Type.ATTACK, msg,
		{
			"actor_id": attacker.data.id,
			"target_id": defender.data.id,
			"damage": result.damage,
			"is_crit": result.is_crit,
			"target_hp_left": defender.stats.current_health
		})

func calculate_combat_result(attacker: Object, defender: Object, element: int) -> Dictionary:
	var result = {
		"damage": 0,
		"is_crit": false,
		"is_dodge": false
	}
	
	# 1. Dodge Check
	var dodge_chance = defender.stats.evasion.get_value()
	if randf() < dodge_chance:
		result.is_dodge = true
		return result
	
	# 2. Base Damage Calculation
	var dmg = attacker.stats.attack_damage.get_value()
	
	# 3. Critical Check
	if randf() < attacker.stats.critical_chance.get_value():
		dmg *= attacker.stats.critical_damage.get_value()
		result.is_crit = true
	
	# 4. Defense & Block
	var def = defender.stats.defense.get_value()
	# Random Block chance reduces damage by 50% extra
	if randf() < defender.stats.block.get_value():
		def *= 2.0
		
	dmg = max(1.0, dmg - def)
	
	# 5. Elemental Resistance
	var resistance = defender.data.get_resistance_for_element(element)
	dmg *= resistance
	
	result.damage = int(dmg)
	return result

func apply_regen(unit: Object):
	var h_regen = unit.stats.hp_regen.get_value()
	var m_regen = unit.stats.mana_regen.get_value()
	
	if h_regen > 0: unit.heal(h_regen)
	if m_regen > 0: unit.stats.current_mana = min(unit.stats.mana_max.get_value(), unit.stats.current_mana + m_regen)

func resolve_deaths(sim: Object):
	for unit in sim.units:
		if not unit.is_dead and unit.stats.current_health <= 0:
			unit.is_dead = true
			sim.grid.remove_unit(unit)
			sim.log_entry(BattleLogEntry.Type.DEATH, "%s has died!" % unit.data.name, {"target_id": unit.data.id})
			
			# UPDATE QUEST PROGRESS
			if unit.team_id == 1: # Enemy
				GlobalGameManager.update_quest_progress(unit.data.id)

func check_win_condition(sim: Object) -> bool:
	var teams_alive = {}
	for unit in sim.units:
		if not unit.is_dead: teams_alive[unit.team_id] = true
	
	if teams_alive.size() <= 1:
		sim.is_finished = true
		sim.winner_team = teams_alive.keys()[0] if teams_alive.size() == 1 else -1
		var msg = "Team %s Wins!" % sim.winner_team if sim.winner_team != -1 else "Battle Draw!"
		sim.log_entry(BattleLogEntry.Type.GAME_OVER, msg)
		return true
	return false