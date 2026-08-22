import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import UploadFile, HTTPException, status

from app.documents.schemas import DocumentResponse, DocumentType
from app.repositories.document_repo import DocumentRepository

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")

class DocumentService:
    @staticmethod
    def _ensure_upload_dir():
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

    @classmethod
    def upload_document(
        cls,
        employee_id: str,
        file: UploadFile,
        document_type: str,
        repo: DocumentRepository
    ) -> DocumentResponse:
        cls._ensure_upload_dir()
        
        # Verify valid filename
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file: filename is empty"
            )

        # Safe filename extraction to prevent path traversal
        filename = os.path.basename(file.filename)
        
        # Verify valid document type
        valid_types = [t.value for t in DocumentType]
        if document_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document type. Allowed types: {valid_types}"
            )
            
        unique_name = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        
        # Save file to disk
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
            
        # Create metadata
        doc_record = {
            "employee_id": employee_id,
            "filename": filename,
            "document_type": document_type,
            "file_path": file_path,
            "uploaded_at": datetime.now().isoformat()
        }
        
        created = repo.create(doc_record)
        return DocumentResponse(**created)

    @classmethod
    def get_document(cls, document_id: str, repo: DocumentRepository) -> DocumentResponse:
        doc = repo.get_by_id(document_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        return DocumentResponse(**doc)

    @classmethod
    def get_all_documents(cls, employee_id: Optional[str], repo: DocumentRepository) -> List[DocumentResponse]:
        docs = repo.get_all(employee_id)
        return [DocumentResponse(**d) for d in docs]

    @classmethod
    def delete_document(cls, document_id: str, repo: DocumentRepository) -> bool:
        doc = repo.get_by_id(document_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
            
        # Remove file from disk
        path = doc.get("file_path")
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass
                
        return repo.delete(document_id)
