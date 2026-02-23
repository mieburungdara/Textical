from .base import BaseAuditor
from typing import List, Dict

class CriticalHitAuditor(BaseAuditor):
    """
    Analyzes the frequency of critical hits to detect RNG anomalies.
    """
    def __init__(self):
        super().__init__()
        self.crit_streaks = {} # unit_id -> current_streak

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                data = e.get("data", {})
                uid = e.get("actorId") or data.get("actorId")
                is_crit = data.get("is_crit") or "CRITICAL" in e.get("msg", "").upper()
                
                if uid:
                    if is_crit:
                        self.crit_streaks[uid] = self.crit_streaks.get(uid, 0) + 1
                        if self.crit_streaks[uid] >= 5:
                            self.log_error(tick_idx, f"RNG ANOMALY: Unit '{uid}' landed {self.crit_streaks[uid]} critical hits in a row.")
                    else:
                        self.crit_streaks[uid] = 0
