from fastapi import HTTPException, status
from typing import List

from app.notifications.schemas import NotificationResponse
from app.repositories.notification_repo import NotificationRepository

class NotificationService:
    @classmethod
    def get_my_notifications(cls, employee_id: str, repo: NotificationRepository) -> List[NotificationResponse]:
        records = repo.get_all(employee_id=employee_id)
        return [NotificationResponse(**r) for r in records]

    @classmethod
    def mark_as_read(cls, notification_id: str, employee_id: str, repo: NotificationRepository) -> NotificationResponse:
        notification = repo.get_by_id(notification_id)
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
            
        if notification.get("employee_id") != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this notification"
            )
            
        updated = repo.mark_as_read(notification_id)
        return NotificationResponse(**updated)

    @classmethod
    def mark_all_as_read(cls, employee_id: str, repo: NotificationRepository) -> int:
        return repo.mark_all_as_read(employee_id)
