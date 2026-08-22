from typing import Optional, List, Dict, Any
from app.repositories.employee_repo import EmployeeRepository
from app.repositories import mock_db

class InMemoryEmployeeRepository(EmployeeRepository):
    def get_by_id(self, employee_id: str) -> Optional[Dict[str, Any]]:
        return mock_db.employees.get(employee_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        all_emp = list(mock_db.employees.values())
        return all_emp[skip : skip + limit]

    def create(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        employee_id = employee_data["employee_id"]
        stored_data = dict(employee_data)
        mock_db.employees[employee_id] = stored_data
        return stored_data

    def update(self, employee_id: str, employee_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if employee_id not in mock_db.employees:
            return None
        mock_db.employees[employee_id].update(employee_data)
        return mock_db.employees[employee_id]

    def delete(self, employee_id: str) -> bool:
        if employee_id in mock_db.employees:
            # We can delete it or set is_active = False, but physical delete is requested:
            del mock_db.employees[employee_id]
            return True
        return False
