from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any

class LeaveRepository(ABC):
    @abstractmethod
    def get_by_id(self, leave_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve leave request by leave_id."""
        pass

    @abstractmethod
    def get_all(self, employee_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve all leave requests, optionally filtered by employee_id."""
        pass

    @abstractmethod
    def create(self, leave_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new leave request."""
        pass

    @abstractmethod
    def update(self, leave_id: str, leave_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update leave request details (e.g. approve, reject)."""
        pass

    @abstractmethod
    def delete(self, leave_id: str) -> bool:
        """Cancel/delete a leave request."""
        pass

    @abstractmethod
    def get_overlapping_leaves(self, employee_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Retrieve any pending/approved leaves that overlap with the start/end dates."""
        pass
