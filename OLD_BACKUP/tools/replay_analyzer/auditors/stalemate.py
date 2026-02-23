from .base import BaseAuditor
from typing import List, Dict

class StalemateAudit(BaseAuditor):
    """
    Detects battles that exceed reasonable tick limits.
    Flags potential infinite loops or healing stalemates.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # AAA: Sync with Simulation.MAX_TICKS
        if tick_idx > 10000:
            self.log_error(tick_idx, f"STALEMATE DETECTED: Battle exceeded 10000 ticks.")
