from pydantic import BaseModel
from enum import Enum

class DocumentType(str, Enum):
    RESUME = "RESUME"
    CERTIFICATE = "CERTIFICATE"
    ID_PROOF = "ID_PROOF"
    OTHER = "OTHER"

class DocumentResponse(BaseModel):
    document_id: str
    employee_id: str
    filename: str
    document_type: DocumentType
    file_path: str
    uploaded_at: str
