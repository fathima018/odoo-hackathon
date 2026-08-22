from datetime import datetime
from app.config import settings

def generate_employee_id(counter: int) -> str:
    """
    Generates a unique Employee ID using a configurable prefix and the current year.
    Format: PREFIX-YYYY-XXXX (e.g., EMP-2026-0001)
    """
    current_year = datetime.utcnow().year
    return f"{settings.EMPLOYEE_ID_PREFIX}-{current_year}-{counter:04d}"
