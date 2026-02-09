from .base import BaseAuditor
from typing import List, Dict

class HealAudit(BaseAuditor):
    """
    Validates HP recovery. HP should only rise if a HEAL event exists.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            hp = u.get("hp") if u.get("hp") is not None else u.get("h", 0)
            
            if uid in last_state:
                prev_hp = last_state[uid].get("hp") if last_state[uid].get("hp") is not None else last_state[uid].get("h", 0)
                
                if hp > prev_hp:
                    # Check for heal event in this tick
                    healed = any(
                        (e.get("type") == "HEAL" or e.get("t") == "HEAL") and 
                        (e.get("targetId") == uid or e.get("data", {}).get("targetId") == uid)
                        for e in events
                    )
                    
                    if not healed:
                        self.log_error(tick_idx, f"ILLEGAL HEAL: Unit '{uid}' HP rose from {prev_hp} to {hp} without HEAL event.")
