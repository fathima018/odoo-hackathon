from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any

class DocumentRepository(ABC):
    @abstractmethod
    def get_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve document metadata by document_id."""
        pass

    @abstractmethod
    def get_all(self, employee_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve all documents metadata, optionally filtered by employee_id."""
        pass

    @abstractmethod
    def create(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a new document metadata record."""
        pass

    @abstractmethod
    def delete(self, document_id: str) -> bool:
        """Delete document metadata record."""
        pass
