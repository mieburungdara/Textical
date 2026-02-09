from .base import BaseAuditor
from typing import List, Dict

class StunAudit(BaseAuditor):
    """
    Ensures that CC'd units (STUN, FREEZE) do not perform any MOVE or ATTACK events.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            effects = u.get("effects") or u.get("eff", [])
            is_incapacitated = any(eff.get("type") in ["STUN", "FREEZE", "PARALYZE"] for eff in effects)
            
            if is_incapacitated:
                # Check for MOVE events in this tick
                moved = any(e.get("type") == "MOVE" and e.get("actorId") == uid for e in events)
                if moved:
                    self.log_error(tick_idx, f"STUN BREAK: Unit '{uid}' moved while incapacitated.")
                
                # Check for ATTACK events
                attacked = any(e.get("type") == "ATTACK" and e.get("actorId") == uid for e in events)
                if attacked:
                    self.log_error(tick_idx, f"STUN BREAK: Unit '{uid}' attacked while incapacitated.")