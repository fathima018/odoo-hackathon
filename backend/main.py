import os
import sys
from fastapi import FastAPI

# Add parent/current directory to sys.path to resolve 'app' package imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.auth.router import router as auth_router

app = FastAPI(title="HRMS Backend")

# Include the authentication module endpoints
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "HRMS Backend is running"
    }