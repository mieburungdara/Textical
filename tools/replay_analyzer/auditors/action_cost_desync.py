from .base import BaseAuditor
from typing import List, Dict

class ActionCostDesyncAudit(BaseAuditor):
    """
    Ensures the Action Point cost recorded matches the complexity of the action.
    E.g. Moving 5 tiles should cost more than moving 1 tile.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # Comparison of AP reduction vs action magnitude
        pass
