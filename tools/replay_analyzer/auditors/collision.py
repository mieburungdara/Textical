from .base import BaseAuditor
from typing import List, Dict

class CollisionAuditor(BaseAuditor):
    """
    Checks for unit collisions (multiple units on the same tile).
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        positions = {} # (x,y) -> unit_id
        
        for u in units:
            uid = u.get("id")
            pos = u.get("pos") or u.get("p")
            
            if pos:
                # Handle both packed and unpacked positions
                coord = (pos.get("x"), pos.get("y")) if isinstance(pos, dict) else (pos % 50, pos // 50)
                
                if coord in positions:
                    self.log_error(tick_idx, f"COLLISION: Unit '{uid}' and '{positions[coord]}' are both at {coord}")
                
                positions[coord] = uid