from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class EmployeeDashboardResponse(BaseModel):
    profile_summary: Dict[str, Any]
    today_attendance: Optional[Dict[str, Any]] = None
    attendance_percentage: float
    remaining_leaves: int
    recent_notifications: List[Dict[str, Any]]
    latest_payroll: Optional[Dict[str, Any]] = None

class AdminDashboardResponse(BaseModel):
    total_employees: int
    today_attendance_rate: float
    pending_leaves_count: int
    total_monthly_payroll: float
    recent_activities: List[Dict[str, Any]]
