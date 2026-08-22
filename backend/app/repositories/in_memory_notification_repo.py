from typing import Optional, List, Dict, Any
from app.repositories.notification_repo import NotificationRepository
from app.repositories import mock_db

class InMemoryNotificationRepository(NotificationRepository):
    def get_by_id(self, notification_id: str) -> Optional[Dict[str, Any]]:
        for n in mock_db.notifications:
            if n.get("notification_id") == notification_id:
                return n
        return None

    def get_all(self, employee_id: Optional[str] = None, only_unread: bool = False) -> List[Dict[str, Any]]:
        results = []
        for n in mock_db.notifications:
            if employee_id and n.get("employee_id") != employee_id:
                continue
            if only_unread and n.get("is_read") is True:
                continue
            results.append(n)
        return results

    def create(self, notify_data: Dict[str, Any]) -> Dict[str, Any]:
        notification_id = str(mock_db.notification_id_counter)
        mock_db.notification_id_counter += 1
        
        stored_data = dict(notify_data)
        stored_data["notification_id"] = notification_id
        stored_data.setdefault("is_read", False)
        mock_db.notifications.append(stored_data)
        return stored_data

    def mark_as_read(self, notification_id: str) -> Optional[Dict[str, Any]]:
        for n in mock_db.notifications:
            if n.get("notification_id") == notification_id:
                n["is_read"] = True
                return n
        return None

    def mark_all_as_read(self, employee_id: str) -> int:
        count = 0
        for n in mock_db.notifications:
            if n.get("employee_id") == employee_id and not n.get("is_read"):
                n["is_read"] = True
                count += 1
        return count
