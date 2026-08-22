from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from app.leaves.schemas import LeaveCreate, LeaveReview, LeaveResponse, LeaveStatus
from app.repositories.leave_repo import LeaveRepository
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.notification_repo import NotificationRepository

class LeaveService:
    @classmethod
    def apply_leave(
        cls,
        employee_id: str,
        leave_data: LeaveCreate,
        leave_repo: LeaveRepository,
        notify_repo: NotificationRepository
    ) -> LeaveResponse:
        # Check overlaps
        overlaps = leave_repo.get_overlapping_leaves(employee_id, leave_data.start_date, leave_data.end_date)
        if overlaps:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Leave period overlaps with an existing pending/approved request"
            )

        new_leave = {
            "employee_id": employee_id,
            "start_date": leave_data.start_date,
            "end_date": leave_data.end_date,
            "leave_type": leave_data.leave_type.value,
            "status": LeaveStatus.PENDING.value,
            "remarks": leave_data.remarks,
            "comment": None
        }

        created = leave_repo.create(new_leave)
        
        # Create system notification
        notify_repo.create({
            "employee_id": employee_id,
            "title": "Leave Application Submitted",
            "message": f"Your leave request from {leave_data.start_date} to {leave_data.end_date} has been submitted.",
            "type": "leave_application",
            "created_at": datetime.now().isoformat(),
            "is_read": False
        })

        return LeaveResponse(**created)

    @classmethod
    def get_my_leaves(cls, employee_id: str, leave_repo: LeaveRepository) -> List[LeaveResponse]:
        leaves = leave_repo.get_all(employee_id=employee_id)
        return [LeaveResponse(**l) for l in leaves]

    @classmethod
    def get_all_leaves(cls, leave_repo: LeaveRepository) -> List[LeaveResponse]:
        leaves = leave_repo.get_all()
        return [LeaveResponse(**l) for l in leaves]

    @classmethod
    def get_leave_by_id(cls, leave_id: str, leave_repo: LeaveRepository) -> LeaveResponse:
        leave = leave_repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
        return LeaveResponse(**leave)

    @classmethod
    def delete_leave(cls, leave_id: str, employee_id: str, leave_repo: LeaveRepository) -> bool:
        leave = leave_repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
        
        # Check ownership
        if leave.get("employee_id") != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this leave request"
            )
            
        # Check status is pending
        if leave.get("status") != LeaveStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only cancel/delete pending leave requests"
            )

        return leave_repo.delete(leave_id)

    @classmethod
    def approve_leave(
        cls,
        leave_id: str,
        reviewer_id: str,
        review_data: LeaveReview,
        leave_repo: LeaveRepository,
        attendance_repo: AttendanceRepository,
        notify_repo: NotificationRepository
    ) -> LeaveResponse:
        leave = leave_repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

        if leave.get("status") != LeaveStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot approve a leave request that is already processed"
            )

        # Update leave status
        updates = {
            "status": LeaveStatus.APPROVED.value,
            "comment": review_data.comment
        }
        updated = leave_repo.update(leave_id, updates)

        # Cross-module integration: Create/update attendance records as LEAVE
        start = datetime.strptime(updated["start_date"], "%Y-%m-%d").date()
        end = datetime.strptime(updated["end_date"], "%Y-%m-%d").date()
        curr = start
        while curr <= end:
            date_str = curr.isoformat()
            existing = attendance_repo.get_by_employee_and_date(updated["employee_id"], date_str)
            if existing:
                existing["status"] = "LEAVE"
                existing["check_in"] = None
                existing["check_out"] = None
                existing["working_hours"] = 0.0
                attendance_repo.update(updated["employee_id"], date_str, existing)
            else:
                new_att = {
                    "employee_id": updated["employee_id"],
                    "date": date_str,
                    "check_in": None,
                    "check_out": None,
                    "working_hours": 0.0,
                    "status": "LEAVE"
                }
                attendance_repo.create(new_att)
            curr += timedelta(days=1)

        # Notify employee
        notify_repo.create({
            "employee_id": updated["employee_id"],
            "title": "Leave Approved",
            "message": f"Your leave request from {updated['start_date']} to {updated['end_date']} has been APPROVED.",
            "type": "leave_approval",
            "created_at": datetime.now().isoformat(),
            "is_read": False
        })

        return LeaveResponse(**updated)

    @classmethod
    def reject_leave(
        cls,
        leave_id: str,
        reviewer_id: str,
        review_data: LeaveReview,
        leave_repo: LeaveRepository,
        notify_repo: NotificationRepository
    ) -> LeaveResponse:
        leave = leave_repo.get_by_id(leave_id)
        if not leave:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

        if leave.get("status") != LeaveStatus.PENDING.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reject a leave request that is already processed"
            )

        # Update leave status
        updates = {
            "status": LeaveStatus.REJECTED.value,
            "comment": review_data.comment
        }
        updated = leave_repo.update(leave_id, updates)

        # Notify employee
        notify_repo.create({
            "employee_id": updated["employee_id"],
            "title": "Leave Rejected",
            "message": f"Your leave request from {updated['start_date']} to {updated['end_date']} has been REJECTED.",
            "type": "leave_rejection",
            "created_at": datetime.now().isoformat(),
            "is_read": False
        })

        return LeaveResponse(**updated)
