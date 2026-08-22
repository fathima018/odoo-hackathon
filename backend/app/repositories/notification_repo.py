from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any

class NotificationRepository(ABC):
    @abstractmethod
    def get_by_id(self, notification_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve notification by notification_id."""
        pass

    @abstractmethod
    def get_all(self, employee_id: Optional[str] = None, only_unread: bool = False) -> List[Dict[str, Any]]:
        """Retrieve all notification records, optionally filtered by employee_id and read status."""
        pass

    @abstractmethod
    def create(self, notify_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new system notification."""
        pass

    @abstractmethod
    def mark_as_read(self, notification_id: str) -> Optional[Dict[str, Any]]:
        """Mark a single notification as read."""
        pass

    @abstractmethod
    def mark_all_as_read(self, employee_id: str) -> int:
        """Mark all notifications of a specific employee as read. Returns the count marked."""
        pass
