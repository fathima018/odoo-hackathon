from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any

class PayrollRepository(ABC):
    @abstractmethod
    def get_by_employee_id(self, employee_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve payroll record for an employee."""
        pass

    @abstractmethod
    def get_all(self) -> List[Dict[str, Any]]:
        """Retrieve all payroll records."""
        pass

    @abstractmethod
    def create(self, payroll_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create initial payroll record for an employee."""
        pass

    @abstractmethod
    def update(self, employee_id: str, payroll_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update payroll record details (salary, allowances, deductions)."""
        pass
