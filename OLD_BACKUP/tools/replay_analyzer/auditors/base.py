from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseAuditor(ABC):
    """
    Base class for all replay audit rules.
    """
    def __init__(self):
        self.errors = []

    @abstractmethod
    def audit_tick(self, tick_idx: int, units: List[Dict], events: List[Dict], last_state: Dict):
        """
        Perform audit logic for a single tick.
        """
        pass

    def log_error(self, tick: int, message: str):
        self.errors.append(f"[Tick {tick}] {message}")

    def get_report(self) -> Dict[str, Any]:
        return {
            "name": self.__class__.__name__,
            "error_count": len(self.errors),
            "errors": self.errors
        }
