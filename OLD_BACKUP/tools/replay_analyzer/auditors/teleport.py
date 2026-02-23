from .base import BaseAuditor
from typing import List, Dict

class TeleportAudit(BaseAuditor):
    """
    Ensures units only move 1 tile at a time (Chebyshev distance) unless
    justified by specific events like KNOCKBACK, BLINK, or TELEPORT.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for u in units:
            uid = u.get("id")
            curr_pos = u.get("pos") or u.get("p")
            
            if uid in last_state and curr_pos:
                prev_pos = last_state[uid].get("pos") or last_state[uid].get("p")
                if not prev_pos: continue
                
                # Reconstruct coordinates
                x1, y1 = (prev_pos.get("x"), prev_pos.get("y")) if isinstance(prev_pos, dict) else (prev_pos % 50, prev_pos // 50)
                x2, y2 = (curr_pos.get("x"), curr_pos.get("y")) if isinstance(curr_pos, dict) else (curr_pos % 50, curr_pos // 50)
                
                dist = max(abs(x2 - x1), abs(y2 - y1))
                
                if dist > 1:
                    # AAA: Check for justifying events
                    is_justified = False
                    
                    # 1. Check for KNOCKBACK targeting this unit
                    has_kb = any(
                        (e.get("type") == "KNOCKBACK") and 
                        (e.get("data", {}).get("targetId") == uid)
                        for e in events
                    )
                    
                    # 2. Check for Skill-based movement (BLINK, TELEPORT, DASH)
                    has_skill_move = any(
                        (e.get("type") == "SKILL") and 
                        (e.get("actorId") == uid) and 
                        any(word in str(e.get("msg", "")).upper() for word in ["BLINK", "TELEPORT", "DASH", "JUMP", "CHARGE"])
                        for e in events
                    )

                    # 3. Check for Displacement Traits
                    has_trait_move = any(
                        (e.get("type") == "TRAIT") and 
                        (e.get("actorId") == uid or e.get("data", {}).get("actorId") == uid)
                        for e in events
                    )

                    if has_kb or has_skill_move or has_trait_move:
                        is_justified = True
                    
                    if not is_justified:
                        self.log_error(tick_idx, f"ILLEGAL TELEPORT: Unit '{uid}' jumped {dist} tiles to {x2,y2} without displacement event.")
