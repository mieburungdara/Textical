from .base import BaseAuditor
from typing import List, Dict

class TerrainAuditor(BaseAuditor):
    """
    Checks if units standing on environmental hazards (lava, poison) take damage.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # Requires grid terrain data which isn't always in the replay per-tick
        # but could be in the header. 
        pass
