from .base import BaseAuditor
from typing import List, Dict, Any

class StatsAuditor(BaseAuditor):
    """
    ULTIMATE BATTLE ANALYTICS (Split by Team)
    """
    def __init__(self):
        super().__init__()
        # Team Metrics: 0=Player, 1=Monster
        self.team_stats = {
            0: {"dmg": 0, "atk": 0, "skill": 0, "heal": 0, "crit": 0, "dodge": 0, "deaths": 0},
            1: {"dmg": 0, "atk": 0, "skill": 0, "heal": 0, "crit": 0, "dodge": 0, "deaths": 0}
        }
        self.damage_dealt_map = {}
        self.damage_taken_map = {}
        self.visited_tiles = set()
        self.action_ticks = []
        self.last_action_tick = 0

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        # Update team identification from current snapshots
        for u in units:
            uid = u.get("id")
            team = u.get("team") if u.get("team") is not None else u.get("t")
            pos = u.get("pos") or u.get("p")
            if pos:
                coord = (pos.get("x"), pos.get("y")) if isinstance(pos, dict) else (pos % 50, pos // 50)
                self.visited_tiles.add(coord)

        for e in events:
            etype = e.get("type") or e.get("t")
            data = e.get("data", {})
            aid = e.get("actorId") or data.get("actorId")
            tid = e.get("targetId") or data.get("targetId")
            
            # Identify Actor's Team (Robust detection)
            a_team = -1
            aid_str = str(aid).lower()
            if "monster" in aid_str: a_team = 1
            elif "hero" in aid_str: a_team = 0
            elif aid in last_state:
                a_team = last_state[aid].get("team") if last_state[aid].get("team") is not None else last_state[aid].get("t", 0)
            
            # Fallback for events without clear actorId (check message)
            if a_team == -1:
                msg = str(e.get("msg", "")).lower()
                if "monster" in msg or "wild boar" in msg: a_team = 1
                else: a_team = 0

            if etype == "ATTACK":
                self.team_stats[a_team]["atk"] += 1
                # Damage can be in e['damage'] or e['data']['damage']
                dmg = e.get("damage")
                if dmg is None: dmg = data.get("damage")
                
                val = int(dmg) if dmg is not None else 0
                self.team_stats[a_team]["dmg"] += val
                
                if aid: self.damage_dealt_map[aid] = self.damage_dealt_map.get(aid, 0) + val
                if tid: self.damage_taken_map[tid] = self.damage_taken_map.get(tid, 0) + val
                if data.get("isCrit"): self.team_stats[a_team]["crit"] += 1
            
            elif etype in ["MISS", "DODGE"]:
                # The one who DODGED is the opposite of the attacker
                self.team_stats[1 - a_team]["dodge"] += 1
            
            elif etype == "HEAL":
                raw_amt = e.get("amount") or data.get("amount")
                self.team_stats[a_team]["heal"] += int(raw_amt) if raw_amt is not None else 0
            
            elif etype == "SKILL":
                self.team_stats[a_team]["skill"] += 1
            
            elif etype == "DEATH":
                unit_id = tid or aid or data.get("target_id") or data.get("unit_id")
                uid_str = str(unit_id).lower()
                d_team = -1
                if "monster" in uid_str or "wild boar" in uid_str: d_team = 1
                elif "hero" in uid_str: d_team = 0
                elif unit_id in last_state:
                    d_team = last_state[unit_id].get("team") if last_state[unit_id].get("team") is not None else last_state[unit_id].get("t", 0)
                
                if d_team != -1:
                    self.team_stats[d_team]["deaths"] += 1

    def get_report(self) -> Dict:
        p = self.team_stats[0]
        m = self.team_stats[1]
        
        mvp_dealer = max(self.damage_dealt_map, key=self.damage_dealt_map.get) if self.damage_dealt_map else "None"
        avg_wait = sum(self.action_ticks) / len(self.action_ticks) if self.action_ticks else 0
        
        self.errors = [
            f"--- [PLAYER TEAM] ---",
            f"Damage Dealt    : {p['dmg']}",
            f"Attacks/Skills  : {p['atk']} / {p['skill']}",
            f"Healing/Dodges  : {p['heal']} / {p['dodge']}",
            f"Crits Landed    : {p['crit']}",
            f"Deaths          : {p['deaths']}",
            f"--- [MONSTER TEAM] ---",
            f"Damage Dealt    : {m['dmg']}",
            f"Attacks/Skills  : {m['atk']} / {m['skill']}",
            f"Healing/Dodges  : {m['heal']} / {m['dodge']}",
            f"Crits Landed    : {m['crit']}",
            f"Deaths          : {m['deaths']}",
            f"--- PERFORMANCE ---",
            f"TOP DEALER      : {mvp_dealer} ({self.damage_dealt_map.get(mvp_dealer, 0)} dmg)",
            f"AVG ACTION DELAY: {avg_wait:.2f} ticks"
        ]
        
        return {"name": "BattleSummary", "error_count": len(self.errors), "errors": self.errors}