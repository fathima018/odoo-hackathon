from fastapi import HTTPException, status
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.attendance.schemas import AttendanceResponse, AttendanceStatus
from app.repositories.attendance_repo import AttendanceRepository

class AttendanceService:
    @staticmethod
    def get_today_date_str() -> str:
        # Returns current local date as YYYY-MM-DD
        return datetime.now().date().isoformat()

    @classmethod
    def check_in(cls, employee_id: str, repo: AttendanceRepository) -> AttendanceResponse:
        today_str = cls.get_today_date_str()
        
        # Check if record already exists
        existing = repo.get_by_employee_and_date(employee_id, today_str)
        if existing:
            # Check if status is LEAVE
            if existing.get("status") == AttendanceStatus.LEAVE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot check in on an approved leave day"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked in today"
            )

        new_record = {
            "employee_id": employee_id,
            "date": today_str,
            "check_in": datetime.now().isoformat(),
            "check_out": None,
            "working_hours": 0.0,
            "status": AttendanceStatus.PRESENT.value
        }
        
        created = repo.create(new_record)
        return AttendanceResponse(**created)

    @classmethod
    def check_out(cls, employee_id: str, repo: AttendanceRepository) -> AttendanceResponse:
        today_str = cls.get_today_date_str()
        
        existing = repo.get_by_employee_and_date(employee_id, today_str)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must check in before checking out"
            )
        
        if existing.get("check_out"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked out today"
            )

        check_out_time = datetime.now()
        existing["check_out"] = check_out_time.isoformat()
        
        # Calculate working hours
        check_in_time = datetime.fromisoformat(existing["check_in"])
        duration = check_out_time - check_in_time
        working_hours = duration.total_seconds() / 3600.0
        existing["working_hours"] = round(working_hours, 2)
        
        # Decide status: < 4 hours is half day, otherwise present
        if working_hours < 4.0:
            existing["status"] = AttendanceStatus.HALF_DAY.value
        else:
            existing["status"] = AttendanceStatus.PRESENT.value

        updated = repo.update(employee_id, today_str, existing)
        return AttendanceResponse(**updated)

    @classmethod
    def get_today_attendance(cls, employee_id: str, repo: AttendanceRepository) -> AttendanceResponse:
        today_str = cls.get_today_date_str()
        record = repo.get_by_employee_and_date(employee_id, today_str)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No attendance record found for today"
            )
        return AttendanceResponse(**record)

    @classmethod
    def get_my_attendance_history(cls, employee_id: str, repo: AttendanceRepository) -> List[AttendanceResponse]:
        records = repo.get_history(employee_id=employee_id)
        return [AttendanceResponse(**r) for r in records]

    @classmethod
    def get_employee_attendance(cls, employee_id: str, repo: AttendanceRepository) -> List[AttendanceResponse]:
        records = repo.get_history(employee_id=employee_id)
        return [AttendanceResponse(**r) for r in records]

    @classmethod
    def get_all_attendance(cls, repo: AttendanceRepository) -> List[AttendanceResponse]:
        records = repo.get_history()
        return [AttendanceResponse(**r) for r in records]
