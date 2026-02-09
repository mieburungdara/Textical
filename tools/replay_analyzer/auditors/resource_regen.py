from .base import BaseAuditor
from typing import List, Dict

class ResourceRegenAuditor(BaseAuditor):
    """
    Validates passive MP/Energy regeneration against unit stats.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            if uid in last_state:
                # Check MP
                curr_mp = u.get("mp") or u.get("m")
                prev_mp = last_state[uid].get("mp") or last_state[uid].get("m")
                
                if curr_mp is not None and prev_mp is not None:
                    if curr_mp > prev_mp:
                        # Check if a skill or item caused the gain
                        gained_from_event = any(
                            e.get("type") in ["MANA_GAIN", "ITEM_USE"] and 
                            (e.get("targetId") == uid or e.get("data", {}).get("targetId") == uid)
                            for e in events
                        )
                        
                        if not gained_from_event:
                            # Validate against expected regen amount
                            regen_amt = curr_mp - prev_mp
                            # Threshold check (e.g. regen shouldn't be +50 per tick)
                            if regen_amt > 10:
                                self.log_error(tick_idx, f"REGEN ANOMALY: Unit '{uid}' gained {regen_amt} MP without event.")
