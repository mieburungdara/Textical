from .base import BaseAuditor
from typing import List, Dict

class TrafficAuditor(BaseAuditor):
    """
    Analyzes grid congestion and pathfinding friction.
    Tracks how often units are forced to wait, yield, or retarget due to obstacles.
    """
    def __init__(self):
        super().__init__()
        self.stats = {
            "wait_events": 0,
            "blocked_events": 0,
            "stuck_events": 0,
            "retarget_events": 0
        }

    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        for e in events:
            if e.get("type") == "ENGINE":
                msg = e.get("msg", "")
                
                if "[MOVE_WAIT]" in msg:
                    self.stats["wait_events"] += 1
                elif "[MOVE_BLOCKED]" in msg:
                    self.stats["blocked_events"] += 1
                    # This is an actual collision attempt, log it as an issue
                    self.log_error(tick_idx, f"CONGESTION: {msg}")
                elif "[AI_STUCK]" in msg:
                    self.stats["stuck_events"] += 1
                    self.log_error(tick_idx, f"JAM: {msg}")
                elif "[AI_RETARGET]" in msg:
                    self.stats["retarget_events"] += 1

    def get_report(self) -> Dict:
        report = super().get_report()
        report["stats"] = self.stats
        # Add summary to the errors list for visibility in the final report
        summary = (f"Traffic Summary: Waits={self.stats['wait_events']}, "
                   f"Blocks={self.stats['blocked_events']}, "
                   f"Jams={self.stats['stuck_events']}, "
                   f"Retargets={self.stats['retarget_events']}")
        # We don't want to count the summary as an error, but let's show it
        return report

    def _print_stats(self):
        # This can be used for custom formatting if needed
        pass
