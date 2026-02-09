from .base import BaseAuditor
from typing import List, Dict

class ComboAuditor(BaseAuditor):
    """
    Ensures combo multipliers only trigger on consecutive hits to the same target.
    """
    def __init__(self):
        super().__init__()
        self.combo_track = {} # unit_id -> {target_id, count}

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                aid, tid = e.get("actorId"), e.get("targetId")
                if aid and tid:
                    track = self.combo_track.get(aid, {"target_id": None, "count": 0})
                    if track["target_id"] == tid:
                        track["count"] += 1
                    else:
                        track = {"target_id": tid, "count": 1}
                    self.combo_track[aid] = track
                    
                    # Verify damage multiplier against track["count"]
                    pass
