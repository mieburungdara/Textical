from .base import BaseAuditor
from typing import List, Dict

class ZombieMoveAuditor(BaseAuditor):
    """
    Detects movement coordinates changing after a unit is confirmed dead.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            
            if uid in last_state:
                prev_hp = last_state[uid].get("hp") if last_state[uid].get("hp") is not None else last_state[uid].get("h", 1)
                
                if prev_hp <= 0:
                    prev_pos = last_state[uid].get("pos") or last_state[uid].get("p")
                    curr_pos = u.get("pos") or u.get("p")
                    
                    if prev_pos is not None and curr_pos is not None and prev_pos != curr_pos:
                        self.log_error(tick_idx, f"ZOMBIE MOVE: Dead unit '{uid}' drifted from {prev_pos} to {curr_pos}")
