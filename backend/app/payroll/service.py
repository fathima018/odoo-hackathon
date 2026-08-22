from fastapi import HTTPException, status
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.payroll.schemas import PayrollResponse, PayrollCreate, PayrollUpdate
from app.repositories.payroll_repo import PayrollRepository
from app.repositories.notification_repo import NotificationRepository

class PayrollService:
    @staticmethod
    def _calculate_payroll(basic: float, allowances: float, deductions: float) -> tuple:
        gross = basic + allowances
        net = gross - deductions
        return round(gross, 2), round(net, 2)

    @classmethod
    def get_payroll(cls, employee_id: str, repo: PayrollRepository) -> PayrollResponse:
        record = repo.get_by_employee_id(employee_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payroll record not found for this employee"
            )
        return PayrollResponse(**record)

    @classmethod
    def get_all_payrolls(cls, repo: PayrollRepository) -> List[PayrollResponse]:
        records = repo.get_all()
        return [PayrollResponse(**r) for r in records]

    @classmethod
    def create_payroll(cls, employee_id: str, data: PayrollCreate, repo: PayrollRepository) -> PayrollResponse:
        existing = repo.get_by_employee_id(employee_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payroll record already exists for this employee"
            )
            
        gross, net = cls._calculate_payroll(data.basic_salary, data.allowances, data.deductions)
        
        record = {
            "employee_id": employee_id,
            "basic_salary": data.basic_salary,
            "allowances": data.allowances,
            "deductions": data.deductions,
            "gross_salary": gross,
            "net_salary": net,
            "pay_period": data.pay_period
        }
        
        created = repo.create(record)
        return PayrollResponse(**created)

    @classmethod
    def update_payroll(
        cls,
        employee_id: str,
        data: PayrollUpdate,
        repo: PayrollRepository,
        notify_repo: NotificationRepository
    ) -> PayrollResponse:
        record = repo.get_by_employee_id(employee_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payroll record not found"
            )
            
        update_dict = data.model_dump(exclude_unset=True)
        record.update(update_dict)
        
        # Re-calculate
        gross, net = cls._calculate_payroll(
            record["basic_salary"],
            record["allowances"],
            record["deductions"]
        )
        record["gross_salary"] = gross
        record["net_salary"] = net
        
        updated = repo.update(employee_id, record)
        
        # Create system notification
        notify_repo.create({
            "employee_id": employee_id,
            "title": "Payroll Updated",
            "message": f"Your payroll details have been updated. Net Salary: {net}.",
            "type": "payroll_update",
            "created_at": datetime.now().isoformat(),
            "is_read": False
        })
        
        return PayrollResponse(**updated)
