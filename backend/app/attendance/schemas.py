from pydantic import BaseModel
from enum import Enum
from typing import Optional, List

class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LEAVE = "LEAVE"

class AttendanceResponse(BaseModel):
    employee_id: str
    date: str  # YYYY-MM-DD
    check_in: Optional[str] = None  # ISO format string or HH:MM:SS
    check_out: Optional[str] = None # ISO format string or HH:MM:SS
    working_hours: Optional[float] = 0.0
    status: AttendanceStatus

class AttendanceSummaryResponse(BaseModel):
    total_records: int
    present_count: int
    absent_count: int
    leave_count: int
    half_day_count: int
    attendance_percentage: float
