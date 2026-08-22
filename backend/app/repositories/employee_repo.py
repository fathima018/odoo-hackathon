from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any

class EmployeeRepository(ABC):
    @abstractmethod
    def get_by_id(self, employee_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve an employee profile by employee_id."""
        pass

    @abstractmethod
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieve list of all employees."""
        pass

    @abstractmethod
    def create(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new employee profile."""
        pass

    @abstractmethod
    def update(self, employee_id: str, employee_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update employee profile data."""
        pass

    @abstractmethod
    def delete(self, employee_id: str) -> bool:
        """Deactivate or delete an employee profile."""
        pass
