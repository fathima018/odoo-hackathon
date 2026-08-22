from typing import Optional, List, Dict, Any
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories import mock_db

class InMemoryAttendanceRepository(AttendanceRepository):
    def get_by_employee_and_date(self, employee_id: str, date_str: str) -> Optional[Dict[str, Any]]:
        for record in mock_db.attendance:
            if record.get("employee_id") == employee_id and record.get("date") == date_str:
                return record
        return None

    def get_history(
        self,
        employee_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = []
        for record in mock_db.attendance:
            # Filter by employee
            if employee_id and record.get("employee_id") != employee_id:
                continue
            # Filter by start_date
            if start_date and record.get("date") < start_date:
                continue
            # Filter by end_date
            if end_date and record.get("date") > end_date:
                continue
            results.append(record)
        return results

    def create(self, attendance_data: Dict[str, Any]) -> Dict[str, Any]:
        stored_data = dict(attendance_data)
        mock_db.attendance.append(stored_data)
        return stored_data

    def update(self, employee_id: str, date_str: str, attendance_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for record in mock_db.attendance:
            if record.get("employee_id") == employee_id and record.get("date") == date_str:
                record.update(attendance_data)
                return record
        return None
