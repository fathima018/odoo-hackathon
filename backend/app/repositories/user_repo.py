from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

class UserRepository(ABC):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Retrieve a user by email."""
        pass

    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a user by their unique employee_id."""
        pass

    @abstractmethod
    def create(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Persist a new user record."""
        pass

    @abstractmethod
    def get_next_counter(self) -> int:
        """Retrieve the next counter sequence number for Employee ID generation."""
        pass
