from pydantic import BaseModel

class NotificationResponse(BaseModel):
    notification_id: str
    employee_id: str
    title: str
    message: str
    type: str
    created_at: str
    is_read: bool
