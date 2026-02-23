from .base import BaseAuditor
from typing import List, Dict

class ActionCostDesyncAudit(BaseAuditor):
    """
    Ensures the Timeline delay (nextAction) matches the complexity of the action.
    E.g. Moving 5 tiles should result in a longer delay than moving 1 tile.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # Comparison of AP reduction vs action magnitude
        pass
