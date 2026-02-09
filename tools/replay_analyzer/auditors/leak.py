from .base import BaseAuditor
from typing import List, Dict

class LeakAuditor(BaseAuditor):
    """
    Detects unexplained MP/Energy reduction without corresponding skill usage or debuffs.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            if uid in last_state:
                curr_mp = u.get("mp") or u.get("m")
                prev_mp = last_state[uid].get("mp") or last_state[uid].get("m")
                
                if curr_mp is not None and prev_mp is not None and curr_mp < prev_mp:
                    # Check if spent on skill or drained by enemy
                    spent = any(
                        e.get("type") in ["SKILL", "MANA_DRAIN"] and 
                        (e.get("actorId") == uid or e.get("targetId") == uid)
                        for e in events
                    )
                    if not spent:
                        self.log_error(tick_idx, f"MANA LEAK: Unit '{uid}' lost {prev_mp - curr_mp} MP without an event.")
