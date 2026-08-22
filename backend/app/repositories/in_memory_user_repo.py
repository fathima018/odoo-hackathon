from typing import Optional, Dict, Any
from app.repositories.user_repo import UserRepository

class InMemoryUserRepository(UserRepository):
    def __init__(self):
        # Maps email (lowercase) to user dictionary
        self._users_by_email: Dict[str, Dict[str, Any]] = {}
        # Maps employee_id to user dictionary
        self._users_by_id: Dict[str, Dict[str, Any]] = {}
        # Counter starting at 1
        self._counter: int = 1

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self._users_by_email.get(email.lower().strip())

    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self._users_by_id.get(user_id)

    def create(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        email = user_data["email"].lower().strip()
        user_id = user_data["employee_id"]
        
        stored_data = dict(user_data)
        stored_data["email"] = email
        
        self._users_by_email[email] = stored_data
        self._users_by_id[user_id] = stored_data
        
        self._counter += 1
        return stored_data

    def get_next_counter(self) -> int:
        return self._counter
