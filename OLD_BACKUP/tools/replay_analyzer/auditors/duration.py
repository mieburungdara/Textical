from .base import BaseAuditor
from typing import List, Dict

class DurationAudit(BaseAuditor):
    """
    Ensures status effects decrement and expire correctly.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            effects = u.get("effects") or u.get("eff", [])
            
            if uid in last_state:
                prev_effects = last_state[uid].get("effects") or last_state[uid].get("eff", [])
                
                # Check if an effect that should have expired is still there
                for p_eff in prev_effects:
                    p_type = p_eff.get("type")
                    p_dur = p_eff.get("duration")
                    
                    if p_dur == 1:
                        # Should be gone or refreshed in this tick
                        is_still_there = any(e.get("type") == p_type for e in effects)
                        refreshed = any(e.get("type") == "STATUS_REFRESH" and e.get("data", {}).get("type") == p_type for e in events)
                        
                        if is_still_there and not refreshed:
                            curr_eff = next((e for e in effects if e.get("type") == p_type), None)
                            if curr_eff and curr_eff.get("duration") >= p_dur:
                                self.log_error(tick_idx, f"STICKY EFFECT: Effect '{p_type}' on '{uid}' failed to expire.")