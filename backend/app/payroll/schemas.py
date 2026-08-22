from pydantic import BaseModel, Field
from typing import Optional

class PayrollResponse(BaseModel):
    employee_id: str
    basic_salary: float
    allowances: float
    deductions: float
    gross_salary: float
    net_salary: float
    pay_period: str

class PayrollCreate(BaseModel):
    basic_salary: float = Field(..., ge=0.0)
    allowances: float = Field(0.0, ge=0.0)
    deductions: float = Field(0.0, ge=0.0)
    pay_period: str = "Monthly"

class PayrollUpdate(BaseModel):
    basic_salary: Optional[float] = Field(None, ge=0.0)
    allowances: Optional[float] = Field(None, ge=0.0)
    deductions: Optional[float] = Field(None, ge=0.0)
    pay_period: Optional[str] = None
