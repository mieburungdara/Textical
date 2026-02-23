from .base import BaseAuditor
from typing import List, Dict

class DamageAudit(BaseAuditor):
    """
    Checks if HP reduction matches reported damage in events.
    """
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        change_map = {} # target_id -> expected_hp_change (positive = heal, negative = dmg)
        
        for e in events:
            etype = e.get("type") or e.get("t")
            data = e.get("data", {})
            
            # Substract damage (HP loss)
            if etype == "ATTACK":
                tid = e.get("targetId") or data.get("targetId")
                raw_dmg = e.get("damage") or data.get("damage", 0)
                dmg = int(raw_dmg) if raw_dmg is not None else 0
                if tid:
                    change_map[tid] = change_map.get(tid, 0) - dmg
            
            # Add healing (HP gain)
            elif etype == "HEAL":
                tid = e.get("targetId") or data.get("targetId")
                raw_amt = e.get("amount") or data.get("amount", 0)
                amt = int(raw_amt) if raw_amt is not None else 0
                if tid:
                    change_map[tid] = change_map.get(tid, 0) + amt

        for u in units:
            uid = u.get("id")
            if uid in change_map and uid in last_state:
                curr_hp = u.get("hp") if u.get("hp") is not None else u.get("h")
                prev_hp = last_state[uid].get("hp") if last_state[uid].get("hp") is not None else last_state[uid].get("h")
                
                if curr_hp is not None and prev_hp is not None:
                    actual_delta = curr_hp - prev_hp
                    expected_delta = change_map[uid]
                    
                    if actual_delta != expected_delta:
                        # AAA: Overkill Protection
                        # If unit is dead (curr_hp == 0) and we expected MORE damage, it's valid overkill
                        is_overkill = curr_hp == 0 and expected_delta < actual_delta
                        
                        if not is_overkill:
                            self.log_error(tick_idx, f"HP DESYNC: Unit '{uid}' HP changed by {actual_delta}, but events predicted {expected_delta}.")