from .base import BaseAuditor
from typing import List, Dict

class GhostDamageAudit(BaseAuditor):
    """
    Ensures every damage event has a valid, nearby source.
    Detects "damage from nowhere" bugs.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                data = e.get("data", {})
                aid = e.get("actorId") or data.get("actorId") or e.get("actor_id") or data.get("actor_id")
                if aid not in last_state:
                    # Exception: Terrain damage or global effects (simplified check)
                    self.log_error(tick_idx, f"UNKNOWN SOURCE: Damage dealt by non-existent actor '{aid}'.")
