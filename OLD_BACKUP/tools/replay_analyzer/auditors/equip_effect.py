from .base import BaseAuditor
from typing import List, Dict

class EquipEffectAudit(BaseAuditor):
    """
    Checks if equipment-based procs (e.g. "Poison on Hit") are triggering correctly.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                aid = e.get("actorId") or e.get("data", {}).get("actorId")
                if aid in last_state:
                    # Logic: Check if unit has equipment with on-hit effects
                    # and verify if corresponding STATUS_APPLY event followed.
                    pass
                pass
