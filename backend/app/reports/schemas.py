from pydantic import BaseModel
from typing import Dict, Any

class AttendanceReportResponse(BaseModel):
    average_working_hours: float
    total_records_analyzed: int
    status_distribution: Dict[str, int]
    department_breakdown: Dict[str, Dict[str, Any]]

class LeaveReportResponse(BaseModel):
    total_requests: int
    status_distribution: Dict[str, int]
    type_distribution: Dict[str, int]
    department_breakdown: Dict[str, int]

class PayrollReportResponse(BaseModel):
    total_expenditure: float
    average_net_salary: float
    department_expenditure: Dict[str, float]
    total_employees: int
