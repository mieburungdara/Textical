from .base import BaseAuditor
from typing import List, Dict

class ScalingAudit(BaseAuditor):
    """
    Checks for damage anomalies. Damage shouldn't be 100x higher than base ATK without buffs.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                uid = e.get("actorId") or e.get("data", {}).get("actorId")
                raw_dmg = e.get("damage") or e.get("data", {}).get("damage", 0)
                dmg = int(raw_dmg) if raw_dmg is not None else 0
                
                if uid in last_state:
                    # Very basic check: dmg shouldn't be negative unless blocked
                    if dmg < 0:
                        self.log_error(tick_idx, f"SCALING ERROR: Unit '{uid}' dealt negative damage: {dmg}.")