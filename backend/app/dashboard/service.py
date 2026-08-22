from datetime import datetime
from typing import Dict, Any, List, Optional

from app.dashboard.schemas import EmployeeDashboardResponse, AdminDashboardResponse
from app.repositories.employee_repo import EmployeeRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.leave_repo import LeaveRepository
from app.repositories.payroll_repo import PayrollRepository
from app.repositories.notification_repo import NotificationRepository

class DashboardService:
    @classmethod
    def get_employee_dashboard(
        cls,
        employee_id: str,
        emp_repo: EmployeeRepository,
        att_repo: AttendanceRepository,
        leave_repo: LeaveRepository,
        payroll_repo: PayrollRepository,
        notify_repo: NotificationRepository
    ) -> EmployeeDashboardResponse:
        # Profile summary
        profile = emp_repo.get_by_id(employee_id) or {}
        
        # Today's attendance
        today_str = datetime.now().date().isoformat()
        today_att = att_repo.get_by_employee_and_date(employee_id, today_str)
        
        # Attendance percentage
        history = att_repo.get_history(employee_id=employee_id)
        if history:
            present_or_half = [h for h in history if h.get("status") in ["PRESENT", "HALF_DAY"]]
            att_percentage = round((len(present_or_half) / len(history)) * 100.0, 2)
        else:
            att_percentage = 100.0

        # Remaining leaves (out of 15 allowed)
        leaves = leave_repo.get_all(employee_id=employee_id)
        approved_days = 0
        for l in leaves:
            if l.get("status") == "APPROVED":
                start = datetime.strptime(l["start_date"], "%Y-%m-%d").date()
                end = datetime.strptime(l["end_date"], "%Y-%m-%d").date()
                approved_days += (end - start).days + 1
        
        remaining_leaves = max(0, 15 - approved_days)

        # Recent notifications
        notifications = notify_repo.get_all_by_employee(employee_id)[:5]

        # Latest payroll
        payroll = payroll_repo.get_by_employee_id(employee_id)

        return EmployeeDashboardResponse(
            profile_summary=profile,
            today_attendance=today_att,
            attendance_percentage=att_percentage,
            remaining_leaves=remaining_leaves,
            recent_notifications=notifications,
            latest_payroll=payroll
        )

    @classmethod
    def get_admin_dashboard(
        cls,
        emp_repo: EmployeeRepository,
        att_repo: AttendanceRepository,
        leave_repo: LeaveRepository,
        payroll_repo: PayrollRepository,
        notify_repo: NotificationRepository
    ) -> AdminDashboardResponse:
        employees = emp_repo.get_all(skip=0, limit=10000)
        total_employees = len(employees)

        # Today's attendance rate
        today_str = datetime.now().date().isoformat()
        today_records = att_repo.get_history()
        today_records_filtered = [r for r in today_records if r.get("date") == today_str]
        present_count = len([r for r in today_records_filtered if r.get("status") in ["PRESENT", "HALF_DAY"]])
        
        if total_employees > 0:
            today_attendance_rate = round((present_count / total_employees) * 100.0, 2)
        else:
            today_attendance_rate = 0.0

        # Pending leaves count
        all_leaves = leave_repo.get_all()
        pending_leaves_count = len([l for l in all_leaves if l.get("status") == "PENDING"])

        # Total monthly payroll
        all_payroll = payroll_repo.get_all()
        total_monthly_payroll = round(sum(p.get("net_salary", 0.0) for p in all_payroll), 2)

        # Recent activities (using global notifications or similar)
        # Fetch notifications for all, let's grab last 10 notifications
        recent_activities = []
        for emp in employees:
            emp_notif = notify_repo.get_all_by_employee(emp["employee_id"])
            recent_activities.extend(emp_notif)
        
        # Sort by created_at descending
        recent_activities.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        recent_activities = recent_activities[:10]

        return AdminDashboardResponse(
            total_employees=total_employees,
            today_attendance_rate=today_attendance_rate,
            pending_leaves_count=pending_leaves_count,
            total_monthly_payroll=total_monthly_payroll,
            recent_activities=recent_activities
        )
