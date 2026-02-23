from .base import BaseAuditor
from typing import List, Dict

class FriendlyFireAuditor(BaseAuditor):
    """
    Detects if units attack teammates without valid reasons (like Confusion status).
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                data = e.get("data", {})
                aid = e.get("actorId") or data.get("actorId")
                tid = e.get("targetId") or data.get("targetId")
                
                if aid in last_state and tid in last_state:
                    a_team = last_state[aid].get("team") or last_state[aid].get("t", 0)
                    t_team = last_state[tid].get("team") or last_state[tid].get("t", 0)
                    
                    if a_team == t_team:
                        # Check for confusion status in actor
                        effects = last_state[aid].get("effects") or last_state[aid].get("eff", [])
                        is_confused = any(eff.get("type") == "CONFUSION" for eff in effects)
                        
                        if not is_confused:
                            self.log_error(tick_idx, f"FRIENDLY FIRE: Unit '{aid}' attacked teammate '{tid}' without Confusion status.")
