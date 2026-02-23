from .base import BaseAuditor
from typing import List, Dict

class OutcomeAudit(BaseAuditor):
    """
    Ensures VICTORY/DEFEAT events only trigger when a team is actually wiped out.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") in ["VICTORY", "DEFEAT"]:
                # Count living units from ALL current known states
                teams_alive = {} # team_id -> count
                
                for uid in last_state:
                    u = last_state[uid]
                    hp = u.get("hp") if u.get("hp") is not None else u.get("h", 0)
                    team = u.get("team") or u.get("t", 0)
                    
                    if hp > 0:
                        teams_alive[team] = teams_alive.get(team, 0) + 1
                
                if len(teams_alive) > 1:
                    self.log_error(tick_idx, f"OUTCOME ERROR: '{e.get('type')}' triggered, but multiple teams are alive: {teams_alive}.")