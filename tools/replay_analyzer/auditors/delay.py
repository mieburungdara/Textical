from .base import BaseAuditor
from typing import List, Dict

class DelayAuditor(BaseAuditor):
    """
    Ensures that performing an action correctly schedules a future nextActionTick.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        action_events = ["ATTACK", "SKILL", "MOVE"]
        
        # 1. Identify units that acted in this tick
        actors = set()
        for e in events:
            if e.get("type") in action_events:
                uid = e.get("actorId") or e.get("data", {}).get("actorId")
                if uid:
                    actors.add(uid)

        # 2. Check if their nextAction in current snapshot is actually in the future
        for u in units:
            uid = u.get("id")
            if uid in actors:
                next_ready = u.get("nextAction") or u.get("n", 0)
                
                if next_ready <= tick_idx:
                    # In the new system, performing an action MUST set a delay.
                    # If next_ready is still current tick or past, it's an infinite turn bug.
                    self.log_error(tick_idx, f"DELAY ERROR: Unit '{uid}' performed action but nextAction ({next_ready}) is not in the future.")