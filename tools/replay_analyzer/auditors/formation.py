from .base import BaseAuditor
from typing import List, Dict

class FormationAuditor(BaseAuditor):
    """
    Checks if units are spawned in legal grid areas at the start of battle.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        if tick_idx == 0 or tick_idx == 1:
            for u in units:
                uid = u.get("id")
                pos = u.get("pos") or u.get("p")
                
                # Priority: 1. Current Snapshot, 2. Last State, 3. ID Prefix
                team = u.get("team") if u.get("team") is not None else u.get("t")
                if team is None and uid in last_state:
                    team = last_state[uid].get("team") or last_state[uid].get("t")
                
                if team is None:
                    team = 1 if "monster" in str(uid).lower() else 0
                
                if pos:
                    x, y = (pos.get("x"), pos.get("y")) if isinstance(pos, dict) else (pos % 50, pos // 50)
                    # Players should be on bottom half, monsters on top
                    if team == 0 and y < 20:
                        self.log_error(tick_idx, f"FORMATION ERROR: Player unit '{uid}' spawned too far forward at {x,y}")
                    if team == 1 and y > 30:
                        self.log_error(tick_idx, f"FORMATION ERROR: Monster unit '{uid}' spawned too far back at {x,y}")
