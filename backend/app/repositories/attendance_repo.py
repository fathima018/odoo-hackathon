from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any

class AttendanceRepository(ABC):
    @abstractmethod
    def get_by_employee_and_date(self, employee_id: str, date_str: str) -> Optional[Dict[str, Any]]:
        """Retrieve attendance record for a specific employee on a specific date (YYYY-MM-DD)."""
        pass

    @abstractmethod
    def get_history(
        self,
        employee_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve attendance history, optionally filtered by employee, start date, and end date."""
        pass

    @abstractmethod
    def create(self, attendance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new attendance record."""
        pass

    @abstractmethod
    def update(self, employee_id: str, date_str: str, attendance_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update attendance record (e.g. check-out, hr correction)."""
        pass
