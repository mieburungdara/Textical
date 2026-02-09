from .base import BaseAuditor
from typing import List, Dict

class AoeAudit(BaseAuditor):
    """
    Checks for Area of Effect consistency. 
    Units within the splash radius should ideally receive damage or status effects.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "AOE_ATTACK":
                data = e.get("data", {})
                center = data.get("center") # {x, y}
                radius = data.get("radius", 1)
                targets = data.get("targetsHit", [])
                
                # Logic: Check if there are units in last_state within radius 
                # that were NOT in the targetsHit list.
                pass
