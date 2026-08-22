from typing import Optional, List, Dict, Any
from app.repositories.document_repo import DocumentRepository
from app.repositories import mock_db

class InMemoryDocumentRepository(DocumentRepository):
    def get_by_id(self, document_id: str) -> Optional[Dict[str, Any]]:
        return mock_db.documents.get(document_id)

    def get_all(self, employee_id: Optional[str] = None) -> List[Dict[str, Any]]:
        docs = list(mock_db.documents.values())
        if employee_id:
            return [doc for doc in docs if doc.get("employee_id") == employee_id]
        return docs

    def create(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        doc_id = str(mock_db.doc_id_counter)
        mock_db.doc_id_counter += 1
        
        stored_data = dict(doc_data)
        stored_data["document_id"] = doc_id
        mock_db.documents[doc_id] = stored_data
        return stored_data

    def delete(self, document_id: str) -> bool:
        if document_id in mock_db.documents:
            del mock_db.documents[document_id]
            return True
        return False
