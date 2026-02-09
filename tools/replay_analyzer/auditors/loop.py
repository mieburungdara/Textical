from .base import BaseAuditor
from typing import List, Dict

class LoopAudit(BaseAuditor):
    """
    Detects AI "Ping-Pong" behavior where a unit oscillates between tiles.
    Commonly caused by pathfinding conflicts or conflicting AI priorities.
    """
    def __init__(self):
        super().__init__()
        self.pos_history = {} # unit_id -> List of coordinates
        self.event_memory = {} # unit_id -> List of recent engine logs
        self.HISTORY_LIMIT = 6

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # 1. Update event memory for each unit (Look-back window of 5 ticks)
        for e in events:
            if e.get("type") == "ENGINE":
                msg = e.get("msg", "")
                aid = e.get("actorId") or (e.get("data") and e.get("data").get("unit_id"))
                if aid:
                    if aid not in self.event_memory: self.event_memory[aid] = []
                    self.event_memory[aid].append({"t": tick_idx, "m": msg})
                    if len(self.event_memory[aid]) > 5: self.event_memory[aid].pop(0)

        for u in units:
            uid = u.get("id")
            pos = u.get("pos") or u.get("p")
            if not pos: continue
            
            coord = (pos.get("x"), pos.get("y")) if isinstance(pos, dict) else (pos % 50, pos // 50)
            if uid not in self.pos_history: self.pos_history[uid] = []
            history = self.pos_history[uid]
            
            if not history or history[-1] != coord:
                history.append(coord)
            if len(history) > self.HISTORY_LIMIT: history.pop(0)
            
            # TACTICAL TOLERANCE:
            # If the unit is actively fighting or taking damage, allow some oscillation
            is_pursuing = any(e.get("actorId") == uid and e.get("type") == "ATTACK" for e in events)
            if not is_pursuing and uid in last_state:
                old_hp = last_state[uid].get("hp") or last_state[uid].get("h", 0)
                new_hp = u.get("hp") or u.get("h", 0)
                if old_hp != new_hp: is_pursuing = True
            
            if is_pursuing or tick_idx > 9500: continue

            # 2. Advanced Reason Extraction
            reason = "[PATH_OSCILLATION] (AI flip-flopping between two paths)"
            
            # A. Check recent engine logs
            recent_logs = self.event_memory.get(uid, [])
            if recent_logs:
                last_msg = recent_logs[-1]["m"]
                if "[" in last_msg and "]" in last_msg:
                    reason = last_msg.split("]")[0] + "]"
            
            # B. Check for Recovery Jitter
            next_action = u.get("nextAction") or u.get("n", 0)
            if next_action > tick_idx:
                reason = "[RECOVERY_WAIT]"

            # 3. Detect Loops
            if reason == "[RECOVERY_WAIT]": continue

            if len(history) >= 3 and history[-1] == history[-3] and history[-1] != history[-2]:
                self.log_error(tick_idx, f"LOOP: '{uid}' bouncing between {history[-2]} and {history[-1]}. Reason: {reason}")
            elif len(history) >= 4 and history[-1] == history[-4] and history[-1] != history[-2]:
                self.log_error(tick_idx, f"CYCLE: '{uid}' stuck in 3-tile cycle. Reason: {reason}")