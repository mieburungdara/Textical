from .base import BaseAuditor
from typing import List, Dict

class XpGainAuditor(BaseAuditor):
    """
    Checks if XP rewards at the end of battle are within reasonable limits.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "VICTORY":
                results = e.get("data", {}).get("heroProgress", [])
                for res in results:
                    xp = res.get("xpGained", 0)
                    if xp > 10000: # Threshold for suspicion
                        self.log_error(tick_idx, f"XP ANOMALY: Hero '{res.get('name')}' gained {xp} XP in a single battle.")
