from fastapi import APIRouter, Depends, status
from typing import List, Dict, Any

from app.notifications.schemas import NotificationResponse
from app.notifications.service import NotificationService
from app.core.deps import (
    require_employee,
    get_notification_repository
)
from app.repositories.notification_repo import NotificationRepository

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/me", response_model=List[NotificationResponse])
def get_my_notifications(
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: NotificationRepository = Depends(get_notification_repository)
):
    employee_id = current_user["employee_id"]
    return NotificationService.get_my_notifications(employee_id, repo)

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: NotificationRepository = Depends(get_notification_repository)
):
    employee_id = current_user["employee_id"]
    return NotificationService.mark_as_read(notification_id, employee_id, repo)

@router.put("/me/read-all", status_code=status.HTTP_200_OK)
def mark_all_as_read(
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: NotificationRepository = Depends(get_notification_repository)
):
    employee_id = current_user["employee_id"]
    count = NotificationService.mark_all_as_read(employee_id, repo)
    return {"message": f"Successfully marked {count} notifications as read"}
