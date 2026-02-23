from .base import BaseAuditor
from typing import List, Dict

class HealthCapAuditor(BaseAuditor):
    """
    Ensures current HP never exceeds Max HP during healing or buffs.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            hp = u.get("hp") if u.get("hp") is not None else u.get("h", 0)
            max_hp = u.get("maxHp") or u.get("mh")
            
            # If max_hp isn't in current delta, try to find it in previous state
            if max_hp is None and uid in last_state:
                max_hp = last_state[uid].get("maxHp") or last_state[uid].get("mh")
            
            if hp is not None and max_hp is not None:
                if hp > max_hp:
                    self.log_error(tick_idx, f"HEALTH OVERFLOW: Unit '{uid}' HP ({hp}) exceeds MaxHP ({max_hp}).")
