from typing import Optional, List, Dict, Any
from datetime import datetime

from app.reports.schemas import AttendanceReportResponse, LeaveReportResponse, PayrollReportResponse
from app.repositories.employee_repo import EmployeeRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.leave_repo import LeaveRepository
from app.repositories.payroll_repo import PayrollRepository

class ReportService:
    @classmethod
    def get_attendance_report(
        cls,
        start_date: Optional[str],
        end_date: Optional[str],
        department: Optional[str],
        emp_repo: EmployeeRepository,
        att_repo: AttendanceRepository
    ) -> AttendanceReportResponse:
        employees = emp_repo.get_all(0, 10000)
        if department:
            employees = [e for e in employees if e.get("department") == department]
        
        emp_ids = {e["employee_id"] for e in employees}
        emp_dept_map = {e["employee_id"]: e.get("department", "General") for e in employees}
        
        all_att = att_repo.get_history()
        
        # Filter by employee IDs and date range
        filtered_att = []
        for r in all_att:
            if r["employee_id"] not in emp_ids:
                continue
            if start_date and r["date"] < start_date:
                continue
            if end_date and r["date"] > end_date:
                continue
            filtered_att.append(r)

        total_records = len(filtered_att)
        
        # Calculations
        working_hours_sum = 0.0
        records_with_hours = 0
        status_dist = {"PRESENT": 0, "ABSENT": 0, "HALF_DAY": 0, "LEAVE": 0}
        dept_breakdown = {}

        for r in filtered_att:
            status = r.get("status", "PRESENT")
            status_dist[status] = status_dist.get(status, 0) + 1
            
            hours = r.get("working_hours", 0.0)
            if hours > 0.0:
                working_hours_sum += hours
                records_with_hours += 1
            
            dept = emp_dept_map.get(r["employee_id"], "General")
            if dept not in dept_breakdown:
                dept_breakdown[dept] = {"total_hours": 0.0, "count_hours": 0, "statuses": {}}
            
            if hours > 0.0:
                dept_breakdown[dept]["total_hours"] += hours
                dept_breakdown[dept]["count_hours"] += 1
            
            dept_breakdown[dept]["statuses"][status] = dept_breakdown[dept]["statuses"].get(status, 0) + 1

        avg_hours = round(working_hours_sum / records_with_hours, 2) if records_with_hours > 0 else 0.0

        formatted_dept = {}
        for dept, data in dept_breakdown.items():
            dept_avg = round(data["total_hours"] / data["count_hours"], 2) if data["count_hours"] > 0 else 0.0
            formatted_dept[dept] = {
                "average_working_hours": dept_avg,
                "status_distribution": data["statuses"]
            }

        return AttendanceReportResponse(
            average_working_hours=avg_hours,
            total_records_analyzed=total_records,
            status_distribution=status_dist,
            department_breakdown=formatted_dept
        )

    @classmethod
    def get_leave_report(
        cls,
        leave_type: Optional[str],
        department: Optional[str],
        emp_repo: EmployeeRepository,
        leave_repo: LeaveRepository
    ) -> LeaveReportResponse:
        employees = emp_repo.get_all(0, 10000)
        if department:
            employees = [e for e in employees if e.get("department") == department]
            
        emp_ids = {e["employee_id"] for e in employees}
        emp_dept_map = {e["employee_id"]: e.get("department", "General") for e in employees}
        
        all_leaves = leave_repo.get_all()
        
        filtered_leaves = []
        for l in all_leaves:
            if l["employee_id"] not in emp_ids:
                continue
            if leave_type and l["leave_type"] != leave_type:
                continue
            filtered_leaves.append(l)

        total_requests = len(filtered_leaves)
        status_dist = {}
        type_dist = {}
        dept_breakdown = {}

        for l in filtered_leaves:
            status = l.get("status", "PENDING")
            status_dist[status] = status_dist.get(status, 0) + 1
            
            ltype = l.get("leave_type", "PAID")
            type_dist[ltype] = type_dist.get(ltype, 0) + 1
            
            dept = emp_dept_map.get(l["employee_id"], "General")
            dept_breakdown[dept] = dept_breakdown.get(dept, 0) + 1

        return LeaveReportResponse(
            total_requests=total_requests,
            status_distribution=status_dist,
            type_distribution=type_dist,
            department_breakdown=dept_breakdown
        )

    @classmethod
    def get_payroll_report(
        cls,
        department: Optional[str],
        emp_repo: EmployeeRepository,
        payroll_repo: PayrollRepository
    ) -> PayrollReportResponse:
        employees = emp_repo.get_all(0, 10000)
        if department:
            employees = [e for e in employees if e.get("department") == department]
            
        emp_ids = {e["employee_id"] for e in employees}
        emp_dept_map = {e["employee_id"]: e.get("department", "General") for e in employees}
        
        all_payroll = payroll_repo.get_all()
        filtered_payroll = [p for p in all_payroll if p["employee_id"] in emp_ids]
        
        total_employees = len(filtered_payroll)
        total_exp = sum(p.get("net_salary", 0.0) for p in filtered_payroll)
        avg_salary = round(total_exp / total_employees, 2) if total_employees > 0 else 0.0
        
        dept_exp = {}
        for p in filtered_payroll:
            dept = emp_dept_map.get(p["employee_id"], "General")
            net = p.get("net_salary", 0.0)
            dept_exp[dept] = round(dept_exp.get(dept, 0.0) + net, 2)

        return PayrollReportResponse(
            total_expenditure=round(total_exp, 2),
            average_net_salary=avg_salary,
            department_expenditure=dept_exp,
            total_employees=total_employees
        )
