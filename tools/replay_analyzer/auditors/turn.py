from .base import BaseAuditor
from typing import List, Dict

class TurnAudit(BaseAuditor):
    """
    Ensures units only act (Attack/Skill) when the timeline allows (tick >= nextAction).
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        action_events = ["ATTACK", "SKILL", "ITEM"]
        
        for e in events:
            if e.get("type") in action_events:
                data = e.get("data", {})
                if data.get("isReaction"): continue
                
                uid = e.get("actorId") or data.get("actorId")
                
                # In the new system, we check if current tick >= unit's nextAction requirement
                if uid in last_state:
                    next_ready = last_state[uid].get("nextAction") or 0
                    
                    if tick_idx < next_ready:
                        self.log_error(tick_idx, f"TURN VIOLATION: Unit '{uid}' acted at tick {tick_idx} but was scheduled for tick {next_ready}.")