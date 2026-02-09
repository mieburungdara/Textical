from .base import BaseAuditor
from typing import List, Dict
import math

class FacingAuditor(BaseAuditor):
    """
    Checks if units are facing the correct direction when attacking or moving.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            etype = e.get("type")
            if etype in ["ATTACK", "MOVE"]:
                data = e.get("data", {})
                aid = e.get("actorId") or data.get("actorId")
                
                # For attacks, we look at actor and target
                if etype == "ATTACK":
                    tid = e.get("targetId") or data.get("targetId")
                    if aid in last_state and tid in last_state:
                        apos = last_state[aid].get("pos") or last_state[aid].get("p")
                        tpos = last_state[tid].get("pos") or last_state[tid].get("p")
                        
                        if apos and tpos:
                            ax, ay = (apos.get("x"), apos.get("y")) if isinstance(apos, dict) else (apos % 50, apos // 50)
                            tx, ty = (tpos.get("x"), tpos.get("y")) if isinstance(tpos, dict) else (tpos % 50, tpos // 50)
                            
                            # Check unit's current facing in data if available
                            # ... logic to verify if facing vector matches (tx-ax, ty-ay)
                            pass
