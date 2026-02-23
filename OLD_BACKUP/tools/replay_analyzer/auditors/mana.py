from .base import BaseAuditor
from typing import List, Dict

class ManaAudit(BaseAuditor):
    """
    Checks for illegal skill usage (casting with 0 MP) and missing MP deductions.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "SKILL":
                uid = e.get("actorId") or e.get("data", {}).get("actorId")
                if uid in last_state:
                    mp = last_state[uid].get("mp") if last_state[uid].get("mp") is not None else last_state[uid].get("m", 0)
                    if mp <= 0:
                        self.log_error(tick_idx, f"MANA VIOLATION: Unit '{uid}' used skill with 0 MP.")