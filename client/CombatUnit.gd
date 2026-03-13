@tool
extends Node
class_name CombatUnit
extends Node2D

# =============================================================================
# COMBAT UNIT - Responds to ReplayManager Signals
# =============================================================================
# Attach this script to each unit in the combat scene.
# Connect to ReplayManager signals to play animations.
# =============================================================================

@export var unit_id: String = ""
@export var unit_name: String = ""
@export var max_hp: int = 100

var current_hp: int = 100
var current_level: int = 1
var grid_position: Vector2i = Vector2i.ZERO

# Animation player for unit animations
@onready var animation_player: AnimationPlayer = $AnimationPlayer if has_node("AnimationPlayer") else null
@onready var sprite: Sprite2D = $Sprite2D if has_node("Sprite2D") else null
@onready var hp_bar: ProgressBar = $HPBar if has_node("HPBar") else null
@onready var damage_label: Label = $DamageLabel if has_node("DamageLabel") else null

# Reference to ReplayManager
var _replay_manager: ReplayManager = null

# =============================================================================
# SETUP
# =============================================================================

func setup(unit_id: String, unit_name: String, replay_manager: ReplayManager) -> void:
	self.unit_id = unit_id
	self.unit_name = unit_name
	_replay_manager = replay_manager
	
	# Register this unit to ReplayManager
	_replay_manager.register_unit(unit_id, self)
	
	# Connect all signals
	_connect_signals()
	
	print("[Unit] %s (%s) ready" % [unit_name, unit_id])


func _connect_signals() -> void:
	if _replay_manager == null:
		return
	
	# Movement
	_replay_manager.unit_move.connect(_on_unit_move)
	
	# Attack
	_replay_manager.unit_attack.connect(_on_unit_attack)
	
	# Damage/Heal
	_replay_manager.unit_damage.connect(_on_unit_damage)
	_replay_manager.unit_heal.connect(_on_unit_heal)
	
	# Status effects
	_replay_manager.buff_applied.connect(_on_buff_applied)
	_replay_manager.debuff_applied.connect(_on_debuff_applied)
	_replay_manager.buff_expired.connect(_on_buff_expired)
	
	# Death
	_replay_manager.unit_death.connect(_on_unit_death)
	
	# Knockback
	_replay_manager.unit_knockback.connect(_on_unit_knockback)
	
	# Projectiles
	_replay_manager.projectile_start.connect(_on_projectile_start)
	_replay_manager.projectile_hit.connect(_on_projectile_hit)
	
	# Items
	_replay_manager.item_used.connect(_on_item_used)
	
	# Level up
	_replay_manager.unit_level_up.connect(_on_unit_level_up)


func _disconnect_signals() -> void:
	if _replay_manager == null:
		return
	
	# Disconnect all signals (optional cleanup)


# =============================================================================
# SIGNAL HANDLERS
# =============================================================================

func _on_unit_move(from_pos: Vector2i, to_pos: Vector2i) -> void:
	if _replay_manager.get_unit(unit_id) != self:
		return
	
	grid_position = to_pos
	
	# Move unit visually
	var target_pos = Vector2(to_pos.x * 64, to_pos.y * 64)
	var tween = create_tween()
	tween.tween_property(self, "position", target_pos, 0.3)
	
	print("[Unit] %s moved to %s" % [unit_name, str(to_pos)])


func _on_unit_attack(source_id: String, target_id: String, damage: int, is_crit: bool, is_miss: bool, is_dodge: bool) -> void:
	if source_id != unit_id:
		return
	
	print("[Unit] %s attacks %s for %d damage (crit: %s, miss: %s)" % [unit_name, target_id, damage, is_crit, is_miss])
	
	# Play attack animation
	play_animation("attack")
	
	# Look at target
	if _replay_manager.get_unit(target_id):
		face_target(_replay_manager.get_unit(target_id))


func _on_unit_damage(target_id: String, source_id: String, damage: int, delta_hp: int, hp_before: int, hp_after: int, is_crit: bool, is_miss: bool) -> void:
	if target_id != unit_id:
		return
	
	current_hp = hp_after
	
	# Update HP bar
	_update_hp_bar()
	
	# Show damage number
	_show_damage_number(damage, is_crit, is_miss)
	
	# Play hurt animation
	play_animation("hurt")
	
	print("[Unit] %s took %d damage, HP: %d/%d" % [unit_name, damage, current_hp, max_hp])


func _on_unit_heal(target_id: String, source_id: String, heal_amount: int, hp_before: int, hp_after: int) -> void:
	if target_id != unit_id:
		return
	
	current_hp = hp_after
	
	# Update HP bar
	_update_hp_bar()
	
	# Show heal number
	_show_heal_number(heal_amount)
	
	# Play heal animation
	play_animation("heal")
	
	print("[Unit] %s healed for %d, HP: %d/%d" % [unit_name, heal_amount, current_hp, max_hp])


func _on_buff_applied(target_id: String, source_id: String, effect_id: String, effect_name: String, duration: int) -> void:
	if target_id != unit_id:
		return
	
	print("[Unit] %s gained buff: %s for %d seconds" % [unit_name, effect_name, duration])
	play_animation("buff")


func _on_debuff_applied(target_id: String, source_id: String, effect_id: String, effect_name: String, duration: int) -> void:
	if target_id != unit_id:
		return
	
	print("[Unit] %s gained debuff: %s for %d seconds" % [unit_name, effect_name, duration])
	play_animation("debuff")


func _on_buff_expired(unit_id: String, effect_id: String, effect_name: String) -> void:
	if unit_id != self.unit_id:
		return
	
	print("[Unit] %s buff expired: %s" % [unit_name, effect_name])


func _on_unit_death(dead_unit_id: String) -> void:
	if dead_unit_id != unit_id:
		return
	
	print("[Unit] %s has died!" % unit_name)
	
	# Play death animation
	play_animation("death")
	
	# Disable unit
	set_process(false)
	set_physics_process(false)


func _on_unit_knockback(unit_id: String, source_id: String, from_pos: Vector2i, to_pos: Vector2i, distance: int, damage: int) -> void:
	if unit_id != self.unit_id:
		return
	
	grid_position = to_pos
	
	# Animate knockback
	var direction = (to_pos - from_pos).normalized()
	var knockback_vector = direction * distance * 64  # 64 pixels per tile
	
	var tween = create_tween()
	tween.tween_property(self, "position", position + knockback_vector, 0.2)
	tween.set_ease(Tween.EASE_OUT)
	tween.set_trans(Tween.TRANS_BACK)
	
	print("[Unit] %s knocked back %d tiles" % [unit_name, distance])


func _on_projectile_start(projectile_type: String, start_pos: Vector2i, end_pos: Vector2i, speed: float, source_id: String, target_id: String) -> void:
	# This signal is for the source unit to spawn projectile
	if source_id != unit_id:
		return
	
	# Spawn projectile visual
	_spawn_projectile(projectile_type, start_pos, end_pos, target_id, speed)


func _on_projectile_hit(projectile_type: String, position: Vector2i, target_id: String) -> void:
	# Projectile hit animation is handled here
	print("[Unit] Projectile %s hit at %s" % [projectile_type, str(position)])


func _on_item_used(unit_id: String, item_id: String, item_name: String, heal_amount: int) -> void:
	if unit_id != self.unit_id:
		return
	
	print("[Unit] %s used %s" % [unit_name, item_name])
	play_animation("item_use")


func _on_unit_level_up(unit_id: String, old_level: int, new_level: int) -> void:
	if unit_id != self.unit_id:
		return
	
	current_level = new_level
	
	print("[Unit] %s leveled up! %d -> %d" % [unit_name, old_level, new_level])
	play_animation("level_up")
	
	# Show level up effect
	_show_level_up_effect()


# =============================================================================
# ANIMATION HELPERS
# =============================================================================

func play_animation(anim_name: String) -> void:
	if animation_player and animation_player.has_animation(anim_name):
		animation_player.play(anim_name)
	else:
		# Fallback: simple flash or shake
		_simple_animation_fallback(anim_name)


func _simple_animation_fallback(anim_name: String) -> void:
	match anim_name:
		"attack":
			var tween = create_tween()
			tween.tween_property(sprite, "scale", Vector2(1.2, 1.2), 0.1)
			tween.tween_property(sprite, "scale", Vector2(1.0, 1.0), 0.1)
		"hurt":
			var tween = create_tween()
			tween.tween_property(sprite, "modulate", Color.RED, 0.1)
			tween.tween_property(sprite, "modulate", Color.WHITE, 0.2)
		"death":
			var tween = create_tween()
			tween.tween_property(self, "modulate:a", 0.0, 0.5)


func face_target(target_unit: Node) -> void:
	if target_unit and sprite:
		if target_unit.position.x < position.x:
			sprite.flip_h = true
		else:
			sprite.flip_h = false


func _show_damage_number(damage: int, is_crit: bool, is_miss: bool) -> void:
	if damage_label == null:
		return
	
	var label = damage_label.duplicate()
	add_child(label)
	label.position = Vector2(0, -50)
	
	if is_miss:
		label.text = "MISS"
		label.modulate = Color.WHITE
	elif is_crit:
		label.text = str(damage) + "!"
		label.modulate = Color.RED
		label.scale = Vector2(1.5, 1.5)
	else:
		label.text = str(damage)
		label.modulate = Color.RED
	
	# Float up and fade
	var tween = create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 30, 0.5)
	tween.tween_property(label, "modulate:a", 0.0, 0.5)
	tween.chain().tween_callback(label.queue_free)


func _show_heal_number(heal_amount: int) -> void:
	if damage_label == null:
		return
	
	var label = damage_label.duplicate()
	add_child(label)
	label.position = Vector2(0, -50)
	label.text = "+" + str(heal_amount)
	label.modulate = Color.GREEN
	
	var tween = create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 30, 0.5)
	tween.tween_property(label, "modulate:a", 0.0, 0.5)
	tween.chain().tween_callback(label.queue_free)


func _show_level_up_effect() -> void:
	# Spawn particle effect or flash
	var tween = create_tween()
	tween.tween_property(sprite, "modulate", Color.YELLOW, 0.2)
	tween.tween_property(sprite, "modulate", Color.WHITE, 0.3)


func _update_hp_bar() -> void:
	if hp_bar:
		hp_bar.max_value = max_hp
		hp_bar.value = current_hp


func _spawn_projectile(projectile_type: String, start_pos: Vector2i, end_pos: Vector2i, target_id: String, speed: float) -> void:
	# Create projectile node
	var projectile = Sprite2D.new()
	projectile.position = Vector2(start_pos.x * 64, start_pos.y * 64)
	
	# Set texture based on type
	match projectile_type:
		"arrow":
			projectile.modulate = Color.BROWN
		"fireball":
			projectile.modulate = Color.ORANGE_RED
		"magic_bolt":
			projectile.modulate = Color.CYAN
	
	get_parent().add_child(projectile)
	
	# Animate projectile
	var target_pos = Vector2(end_pos.x * 64, end_pos.y * 64)
	var duration = speed * 0.1  # Convert ticks to seconds
	var tween = create_tween()
	tween.tween_property(projectile, "position", target_pos, duration)
	tween.tween_callback(projectile.queue_free)


# =============================================================================
# CLEANUP
# =============================================================================

func _exit_tree() -> void:
	if _replay_manager:
		_replay_manager.unregister_unit(unit_id)
