from typing import Optional, List, Dict, Any
from app.repositories.payroll_repo import PayrollRepository
from app.repositories import mock_db

class InMemoryPayrollRepository(PayrollRepository):
    def get_by_employee_id(self, employee_id: str) -> Optional[Dict[str, Any]]:
        return mock_db.payroll.get(employee_id)

    def get_all(self) -> List[Dict[str, Any]]:
        return list(mock_db.payroll.values())

    def create(self, payroll_data: Dict[str, Any]) -> Dict[str, Any]:
        employee_id = payroll_data["employee_id"]
        stored_data = dict(payroll_data)
        mock_db.payroll[employee_id] = stored_data
        return stored_data

    def update(self, employee_id: str, payroll_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if employee_id not in mock_db.payroll:
            return None
        mock_db.payroll[employee_id].update(payroll_data)
        return mock_db.payroll[employee_id]
