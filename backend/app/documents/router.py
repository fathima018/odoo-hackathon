from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
import os

from app.documents.schemas import DocumentResponse, DocumentType
from app.documents.service import DocumentService
from app.core.deps import (
    require_employee,
    require_hr_or_admin,
    get_document_repository
)
from app.repositories.document_repo import DocumentRepository

router = APIRouter(tags=["Documents"])

# ----------------- UPLOAD -----------------
def handle_upload(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: DocumentRepository = Depends(get_document_repository)
):
    employee_id = current_user["employee_id"]
    return DocumentService.upload_document(employee_id, file, document_type, repo)

router.post("/api/documents/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)(handle_upload)
router.post("/api/employees/me/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)(handle_upload)


# ----------------- LIST -----------------
def handle_list(
    employee_id: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: DocumentRepository = Depends(get_document_repository)
):
    role = current_user["role"]
    # If not HR/Admin, must only see their own
    if role not in ["hr", "admin"]:
        return DocumentService.get_all_documents(current_user["employee_id"], repo)
    
    # HR/Admin can see all or filter by employee_id
    return DocumentService.get_all_documents(employee_id, repo)

router.get("/api/documents", response_model=List[DocumentResponse])(handle_list)
router.get("/api/employees/me/documents", response_model=List[DocumentResponse])(handle_list)


# ----------------- SPECIFIC EMPLOYEE LIST (HR/Admin) -----------------
@router.get("/api/employees/{employee_id}/documents", response_model=List[DocumentResponse])
def get_employee_documents(
    employee_id: str,
    current_user: Dict[str, Any] = Depends(require_hr_or_admin),
    repo: DocumentRepository = Depends(get_document_repository)
):
    return DocumentService.get_all_documents(employee_id, repo)


# ----------------- VIEW METADATA -----------------
def handle_get_metadata(
    document_id: str,
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: DocumentRepository = Depends(get_document_repository)
):
    doc = DocumentService.get_document(document_id, repo)
    # Check ownership
    if current_user["role"] not in ["hr", "admin"] and doc.employee_id != current_user["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document"
        )
    return doc

router.get("/api/documents/{document_id}", response_model=DocumentResponse)(handle_get_metadata)
router.get("/api/employees/me/documents/{document_id}", response_model=DocumentResponse)(handle_get_metadata)


# ----------------- DOWNLOAD FILE -----------------
@router.get("/api/documents/{document_id}/download")
def download_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: DocumentRepository = Depends(get_document_repository)
):
    doc = DocumentService.get_document(document_id, repo)
    # Check ownership
    if current_user["role"] not in ["hr", "admin"] and doc.employee_id != current_user["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this document"
        )
    
    if not os.path.exists(doc.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found on disk"
        )
    
    return FileResponse(doc.file_path, filename=doc.filename)


# ----------------- DELETE -----------------
def handle_delete(
    document_id: str,
    current_user: Dict[str, Any] = Depends(require_employee),
    repo: DocumentRepository = Depends(get_document_repository)
):
    doc = DocumentService.get_document(document_id, repo)
    # Check ownership
    if current_user["role"] not in ["hr", "admin"] and doc.employee_id != current_user["employee_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this document"
        )
    
    DocumentService.delete_document(document_id, repo)
    return None

router.delete("/api/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)(handle_delete)
router.delete("/api/employees/me/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)(handle_delete)
