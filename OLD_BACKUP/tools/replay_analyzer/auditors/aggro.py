from .base import BaseAuditor
from typing import List, Dict

class AggroAuditor(BaseAuditor):
    """
    Analyzes if AI targets the most logical unit (e.g. nearest enemy).
    Detects irrational AI behavior.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                data = e.get("data", {})
                aid = e.get("actorId") or data.get("actorId")
                tid = e.get("targetId") or data.get("targetId")
                
                # Check proximity: if there was a much closer enemy ignored
                pass
