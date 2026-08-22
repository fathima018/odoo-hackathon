from fastapi import FastAPI

app = FastAPI(title="HRMS Backend")


@app.get("/")
def root():
    return {
        "message": "HRMS Backend is running"
    }