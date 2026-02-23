from .base import BaseAuditor
from typing import List, Dict

class RangeAudit(BaseAuditor):
    """
    Validates attack distances. 
    A unit shouldn't be able to hit a target outside its attack range.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # Map current tick units for quick lookup
        curr_units = {u.get("id"): u for u in units}
        
        for event in events:
            if event.get("type") == "ATTACK" or event.get("t") == "ATTACK":
                data = event.get("data", {})
                aid = event.get("actorId") or data.get("actorId")
                tid = event.get("targetId") or data.get("targetId")
                
                if data.get("isReaction"): continue

                if aid and tid:
                    # Get positions (Priority: 1. Event Snapshot, 2. Current tick, 3. Last state)
                    a_pos = data.get("actorPos") or curr_units.get(aid, {}).get("pos") or last_state.get(aid, {}).get("pos")
                    t_pos = data.get("targetPos") or curr_units.get(tid, {}).get("pos") or last_state.get(tid, {}).get("pos")
                    
                    if not a_pos:
                        a_pos = curr_units.get(aid, {}).get("p") or last_state.get(aid, {}).get("p")
                    if not t_pos:
                        t_pos = curr_units.get(tid, {}).get("p") or last_state.get(tid, {}).get("p")
                    
                    if a_pos and t_pos:
                        ax, ay = (a_pos.get("x"), a_pos.get("y")) if isinstance(a_pos, dict) else (a_pos % 50, a_pos // 50)
                        tx, ty = (t_pos.get("x"), t_pos.get("y")) if isinstance(t_pos, dict) else (t_pos % 50, t_pos // 50)
                        
                        dist = max(abs(tx-ax), abs(ty-ay))
                        u_range = data.get("range") or curr_units.get(aid, {}).get("range") or last_state.get(aid, {}).get("range", 1.5)
                        
                        # Use 1.0 tolerance for long-range diagonal parity
                        if dist > (u_range + 1.0):
                            self.log_error(tick_idx, f"RANGE VIOLATION: '{aid}' hit '{tid}' from distance {dist} (Range: {u_range})")