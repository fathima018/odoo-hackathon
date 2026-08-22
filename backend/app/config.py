import os
from pathlib import Path

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    # Seek .env in the backend directory
    backend_dir = Path(__file__).resolve().parent.parent
    env_path = backend_dir / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        # Fallback to current working directory if different
        load_dotenv()
except ImportError:
    pass

class Settings:
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev_fallback_secret_key_hrms_hackathon_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    EMPLOYEE_ID_PREFIX: str = os.getenv("EMPLOYEE_ID_PREFIX", "EMP")

settings = Settings()
