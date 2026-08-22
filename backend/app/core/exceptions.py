class HRMException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail

class BadRequestException(HRMException):
    def __init__(self, detail: str):
        super().__init__(status_code=400, detail=detail)

class UnauthorizedException(HRMException):
    def __init__(self, detail: str):
        super().__init__(status_code=401, detail=detail)

class ForbiddenException(HRMException):
    def __init__(self, detail: str):
        super().__init__(status_code=403, detail=detail)

class ResourceNotFoundException(HRMException):
    def __init__(self, detail: str):
        super().__init__(status_code=404, detail=detail)

class ConflictException(HRMException):
    def __init__(self, detail: str):
        super().__init__(status_code=409, detail=detail)
