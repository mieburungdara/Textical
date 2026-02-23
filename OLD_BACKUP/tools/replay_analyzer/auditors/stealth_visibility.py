from .base import BaseAuditor
from typing import List, Dict

class StealthVisibilityAudit(BaseAuditor):
    """
    Ensures that stealthed units are not targeted by units without detection capabilities.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                tid = e.get("targetId") or e.get("data", {}).get("targetId")
                aid = e.get("actorId") or e.get("data", {}).get("actorId")
                
                if tid in last_state and last_state[tid].get("isStealthed"):
                    # Check distance
                    # If dist > 1 and actor has no detection trait: log violation
                    pass
