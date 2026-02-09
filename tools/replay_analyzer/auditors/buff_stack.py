from .base import BaseAuditor
from typing import List, Dict

class BuffStackAuditor(BaseAuditor):
    """
    Checks for illegal stacking of identical status effects.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            effects = u.get("effects") or u.get("eff", [])
            
            seen_types = {} # type -> count
            for eff in effects:
                etype = eff.get("type")
                seen_types[etype] = seen_types.get(etype, 0) + 1
                
                if seen_types[etype] > 1:
                    # In many games, you can't have two "Haste" buffs. 
                    # This flags such occurrences.
                    self.log_error(tick_idx, f"BUFF STACK: Unit '{uid}' has {seen_types[etype]} instances of '{etype}'.")
