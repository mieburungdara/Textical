from .base import BaseAuditor
from typing import List, Dict

class OverkillAuditor(BaseAuditor):
    """
    Detects extreme damage spikes that suggest integer overflow or formula bugs.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ATTACK":
                raw_dmg = e.get("damage") or e.get("data", {}).get("damage", 0)
                dmg = int(raw_dmg) if raw_dmg is not None else 0
                if dmg > 1000000: # Suspect any damage over 1M
                    self.log_error(tick_idx, f"OVERKILL: Massive damage detected ({dmg}). Possible formula overflow.")
