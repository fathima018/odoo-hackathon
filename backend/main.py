import os
import sys
from fastapi import FastAPI

# Add parent/current directory to sys.path to resolve 'app' package imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.auth.router import router as auth_router
from app.employees.router import router as employees_router
from app.attendance.router import router as attendance_router
from app.leaves.router import router as leaves_router
from app.payroll.router import router as payroll_router
from app.documents.router import router as documents_router
from app.notifications.router import router as notifications_router
from app.dashboard.router import router as dashboard_router
from app.reports.router import router as reports_router

app = FastAPI(title="HRMS Backend")

# Include all module endpoints
app.include_router(auth_router)
app.include_router(employees_router)
app.include_router(attendance_router)
app.include_router(leaves_router)
app.include_router(payroll_router)
app.include_router(documents_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "message": "HRMS Backend is running"
    }