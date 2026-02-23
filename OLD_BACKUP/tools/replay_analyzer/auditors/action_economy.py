from .base import BaseAuditor
from typing import List, Dict

class ActionEconomyAuditor(BaseAuditor):
    """
    Ensures a unit doesn't perform multiple major actions (Attack/Skill) in a single timeline tick.
    """
    def __init__(self):
        super().__init__()
        self.acted_in_tick = {} # unit_id -> last_action_tick

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") in ["ATTACK", "SKILL"]:
                data = e.get("data", {})
                if data.get("isReaction"): continue
                
                uid = e.get("actorId") or data.get("actorId")
                if uid:
                    last_tick = self.acted_in_tick.get(uid, -1)
                    if last_tick == tick_idx:
                        self.log_error(tick_idx, f"DOUBLE ACTION: Unit '{uid}' performed multiple major actions in one tick.")
                    self.acted_in_tick[uid] = tick_idx
