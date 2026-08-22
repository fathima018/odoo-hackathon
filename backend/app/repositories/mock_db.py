from typing import Dict, Any, List

# Centralized in-memory database to store and synchronize states across modules
users: Dict[str, Dict[str, Any]] = {}          # email (lowercase) -> user record
employees: Dict[str, Dict[str, Any]] = {}      # employee_id -> employee profile
attendance: List[Dict[str, Any]] = []          # list of daily attendance records
leaves: Dict[str, Dict[str, Any]] = {}         # leave_id (str) -> leave request record
payroll: Dict[str, Dict[str, Any]] = {}        # employee_id -> payroll record
documents: Dict[str, Dict[str, Any]] = {}      # document_id (str) -> document metadata
notifications: List[Dict[str, Any]] = []       # list of notification records

# Sequence counters for integer ID generation
leave_id_counter: int = 1
doc_id_counter: int = 1
notification_id_counter: int = 1
