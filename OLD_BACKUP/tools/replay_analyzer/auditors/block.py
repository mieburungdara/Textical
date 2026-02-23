from .base import BaseAuditor
from typing import List, Dict

class BlockAuditor(BaseAuditor):
    """
    Validates damage reduction during BLOCK events.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "BLOCK" or "BLOCKED" in e.get("msg", "").upper():
                data = e.get("data", {})
                tid = e.get("targetId") or data.get("targetId")
                orig_dmg = data.get("originalDamage", 0)
                final_dmg = data.get("damage", 0)
                
                if final_dmg >= orig_dmg and orig_dmg > 0:
                    self.log_error(tick_idx, f"BLOCK FAILURE: Unit '{tid}' blocked but took full damage ({final_dmg}/{orig_dmg}).")
