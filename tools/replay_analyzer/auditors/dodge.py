from .base import BaseAuditor
from typing import List, Dict

class DodgeAudit(BaseAuditor):
    """
    Validates Dodge/Miss events against unit evasion stats.
    Detects if evasion becomes effectively 100% due to bugs.
    """
    def __init__(self):
        super().__init__()
        self.dodge_streaks = {} # unit_id -> count

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "MISS" or "MISSED" in e.get("msg", "").upper():
                tid = e.get("targetId") or e.get("data", {}).get("targetId")
                if tid:
                    self.dodge_streaks[tid] = self.dodge_streaks.get(tid, 0) + 1
                    if self.dodge_streaks[tid] > 10:
                        self.log_error(tick_idx, f"EVASION ANOMALY: Unit '{tid}' dodged 10+ attacks in a row.")
            elif e.get("type") == "ATTACK":
                # Reset streak on hit
                tid = e.get("targetId") or e.get("data", {}).get("targetId")
                if tid: self.dodge_streaks[tid] = 0
