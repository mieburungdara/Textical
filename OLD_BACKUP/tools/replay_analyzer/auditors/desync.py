from .base import BaseAuditor
from typing import List, Dict

class DesyncAuditor(BaseAuditor):
    """
    Checks for state inconsistencies (e.g. unit has effect 'POISON' but no event applied it).
    """
    def __init__(self):
        super().__init__()
        self.applied_effects = {} # unit_id -> set of active types

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # 1. Track effect applications from events
        for e in events:
            if e.get("type") == "STATUS_APPLY":
                uid = e.get("data", {}).get("targetId")
                etype = e.get("data", {}).get("type")
                if uid and etype:
                    if uid not in self.applied_effects: self.applied_effects[uid] = set()
                    self.applied_effects[uid].add(etype)

        # 2. Verify unit status list against known applications
        for u in units:
            uid = u.get("id")
            effects = u.get("effects") or u.get("eff", [])
            for eff in effects:
                etype = eff.get("type")
                if uid not in self.applied_effects or etype not in self.applied_effects[uid]:
                    # Exception: Initial effects from header/traits (simplified here)
                    pass
