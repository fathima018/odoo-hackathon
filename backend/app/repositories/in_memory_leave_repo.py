from typing import Optional, List, Dict, Any
from app.repositories.leave_repo import LeaveRepository
from app.repositories import mock_db

class InMemoryLeaveRepository(LeaveRepository):
    def get_by_id(self, leave_id: str) -> Optional[Dict[str, Any]]:
        return mock_db.leaves.get(leave_id)

    def get_all(self, employee_id: Optional[str] = None) -> List[Dict[str, Any]]:
        all_leaves = list(mock_db.leaves.values())
        if employee_id:
            return [leave for leave in all_leaves if leave.get("employee_id") == employee_id]
        return all_leaves

    def create(self, leave_data: Dict[str, Any]) -> Dict[str, Any]:
        leave_id = str(mock_db.leave_id_counter)
        mock_db.leave_id_counter += 1
        
        stored_data = dict(leave_data)
        stored_data["leave_id"] = leave_id
        mock_db.leaves[leave_id] = stored_data
        return stored_data

    def update(self, leave_id: str, leave_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if leave_id not in mock_db.leaves:
            return None
        mock_db.leaves[leave_id].update(leave_data)
        return mock_db.leaves[leave_id]

    def delete(self, leave_id: str) -> bool:
        if leave_id in mock_db.leaves:
            del mock_db.leaves[leave_id]
            return True
        return False

    def get_overlapping_leaves(self, employee_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        overlapping = []
        for leave in mock_db.leaves.values():
            if leave.get("employee_id") != employee_id:
                continue
            if leave.get("status") == "REJECTED":
                continue
            
            s = leave.get("start_date")
            e = leave.get("end_date")
            # Overlap condition: start_date <= e and s <= end_date
            if start_date <= e and s <= end_date:
                overlapping.append(leave)
        return overlapping
