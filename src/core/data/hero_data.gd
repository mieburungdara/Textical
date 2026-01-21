class_name HeroData
extends UnitData

@export_group("Job System")
@export var current_job: JobData
@export var experience: int = 0
@export var level: int = 1

func _init():
	# Default starting job if none provided
	pass

## Overrides create_runtime_stats to include Job Multipliers
func create_runtime_stats() -> UnitStats:
	var s = super.create_runtime_stats()
	
	if current_job:
		# Apply Job Multipliers to Stats
		s.health_max.add_modifier(StatModifier.new(current_job.hp_mult - 1.0, StatModifier.Type.PERCENT_ADD, "JobBonus"))
		s.mana_max.add_modifier(StatModifier.new(current_job.mana_mult - 1.0, StatModifier.Type.PERCENT_ADD, "JobBonus"))
		s.attack_damage.add_modifier(StatModifier.new(current_job.damage_mult - 1.0, StatModifier.Type.PERCENT_ADD, "JobBonus"))
		s.speed.add_modifier(StatModifier.new(current_job.speed_mult - 1.0, StatModifier.Type.PERCENT_ADD, "JobBonus"))
		s.attack_range.add_modifier(StatModifier.new(current_job.range_bonus, StatModifier.Type.FLAT, "JobBonus"))
		
		# Merge Job Skills with Base Skills
		for skill in current_job.granted_skills:
			if skill not in skills:
				skills.append(skill)
				
	s.initialize_state()
	return s
