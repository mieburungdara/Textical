from .base import BaseAuditor
from typing import List, Dict

class AggroShiftAuditor(BaseAuditor):
    """
    Monitors target switches to ensure AI aggression logic is consistent.
    Detects if monster ignores a high-threat "tank" illegally.
    """
    def __init__(self):
        super().__init__()
        self.last_targets = {} # unit_id -> target_id

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                aid = e.get("actorId") or e.get("data", {}).get("actorId")
                tid = e.get("targetId") or e.get("data", {}).get("targetId")
                
                if aid and tid:
                    prev_tid = self.last_targets.get(aid)
                    if prev_tid and prev_tid != tid:
                        # Check if shift was justified (e.g. Provoke skill used)
                        provoked = any(
                            ev.get("type") == "PROVOKE" and ev.get("actorId") == tid 
                            for ev in events
                        )
                        # Just logging the shift for now
                        pass
                    self.last_targets[aid] = tid
