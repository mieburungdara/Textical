from .base import BaseAuditor
from typing import List, Dict

class CooldownAudit(BaseAuditor):
    """
    Ensures skills are not used while on cooldown.
    """
    def __init__(self):
        super().__init__()
        self.cooldown_tracker = {} # unit_id -> {skill_name: ready_at_tick}

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "SKILL":
                uid = e.get("actorId") or e.get("data", {}).get("actorId")
                skill_name = e.get("msg", "Unknown Skill")
                
                if uid and skill_name:
                    if uid not in self.cooldown_tracker:
                        self.cooldown_tracker[uid] = {}
                    
                    ready_at = self.cooldown_tracker[uid].get(skill_name, 0)
                    
                    if tick_idx < ready_at:
                        self.log_error(tick_idx, f"COOLDOWN VIOLATION: Unit '{uid}' used '{skill_name}' too early (ready at {ready_at}).")
                    
                    cd_duration = e.get("data", {}).get("cooldown", 5)
                    self.cooldown_tracker[uid][skill_name] = tick_idx + cd_duration