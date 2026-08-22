from pydantic import BaseModel, model_validator
from enum import Enum
from typing import Optional
from datetime import datetime

class LeaveType(str, Enum):
    PAID = "PAID"
    SICK = "SICK"
    UNPAID = "UNPAID"

class LeaveStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class LeaveCreate(BaseModel):
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    leave_type: LeaveType
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_dates(self):
        try:
            start = datetime.strptime(self.start_date, "%Y-%m-%d")
            end = datetime.strptime(self.end_date, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Dates must be in YYYY-MM-DD format")
        
        if start > end:
            raise ValueError("Start date cannot be after end date")
        return self

class LeaveReview(BaseModel):
    comment: Optional[str] = None

class LeaveResponse(BaseModel):
    leave_id: str
    employee_id: str
    start_date: str
    end_date: str
    leave_type: LeaveType
    status: LeaveStatus
    remarks: Optional[str] = None
    comment: Optional[str] = None
