from .base import BaseAuditor
from typing import List, Dict

class ZombieActionAuditor(BaseAuditor):
    """
    Ensures that units with 0 HP do not perform any further actions.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for event in events:
            actor_id = event.get("actorId") or event.get("data", {}).get("actorId")
            
            if actor_id and actor_id in last_state:
                prev_hp = last_state[actor_id].get("hp") if last_state[actor_id].get("hp") is not None else last_state[actor_id].get("h", 1)
                
                if prev_hp <= 0:
                    self.log_error(tick_idx, f"ZOMBIE ACTION: Dead unit '{actor_id}' performed {event.get('type')} event.")
