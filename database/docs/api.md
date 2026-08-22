# Dayflow HRMS API Documentation

This document outlines the RESTful API endpoints for the **Dayflow Human Resource Management System (HRMS)** database integration.

---

## Base URL
`http://localhost:5000/api`

---

## Authentication & Authorization

All authenticated endpoints require an `Authorization` header with a Bearer token or active Session ID.
Roles: `Admin` (HR Manager/Officer) and `Employee`.

### 1. User Registration (Sign Up)
Registers a new user (Employee or Admin).

- **Endpoint**: `POST /auth/register`
- **Request Body**:
```json
{
  "employee_id": "EMP-004",
  "email": "sarah.connor@dayflow.com",
  "password": "securepassword123",
  "role": "Employee",
  "first_name": "Sarah",
  "last_name": "Connor",
  "phone": "+1 555-0199",
  "department": "Engineering",
  "job_title": "DevOps Specialist"
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 4,
    "employee_id": "EMP-004",
    "email": "sarah.connor@dayflow.com",
    "role": "Employee"
  }
}
```

---

### 2. User Authentication (Sign In)
Authenticates a user and returns a token and user details.

- **Endpoint**: `POST /auth/login`
- **Request Body**:
```json
{
  "email": "admin@dayflow.com",
  "password": "admin123"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "employee_id": "EMP-001",
    "email": "admin@dayflow.com",
    "role": "Admin",
    "first_name": "Alex",
    "last_name": "Vance",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
  }
}
```

---

## Employee Profile Management

### 3. Get Current User Profile
Fetches personal, job, document, and salary details for the currently logged-in user.

- **Endpoint**: `GET /profile/me`
- **Response** (`200 OK`):
```json
{
  "user_id": 2,
  "employee_id": "EMP-002",
  "email": "john.doe@dayflow.com",
  "role": "Employee",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1 555-0192",
  "address": "742 Evergreen Terrace, Springfield, IL",
  "department": "Engineering",
  "job_title": "Senior Software Engineer",
  "joining_date": "2026-01-15",
  "salary": {
    "base_salary": 7500.00,
    "allowances": 800.00,
    "deductions": 1100.00,
    "net_salary": 7200.00,
    "currency": "USD"
  }
}
```

---

### 4. Update Profile
Updates user profile. Regular employees can only update `phone`, `address`, and `avatar_url`. Admin users can update all fields including `department`, `job_title`, and salary.

- **Endpoint**: `PUT /employees/:id`
- **Request Body**:
```json
{
  "phone": "+1 555-9999",
  "address": "123 New Home Rd, City, ST"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## Attendance Management

### 5. Check-In
Records employee daily check-in timestamp.

- **Endpoint**: `POST /attendance/check-in`
- **Request Body**:
```json
{
  "remarks": "On time"
}
```
- **Response** (`200 OK`):
```json
{
  "success": true,
  "attendance": {
    "id": 14,
    "date": "2026-08-22",
    "check_in": "2026-08-22 09:00:00",
    "status": "Present"
  }
}
```

---

### 6. Check-Out
Records check-out timestamp and calculates total hours worked.

- **Endpoint**: `POST /attendance/check-out`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "attendance": {
    "id": 14,
    "check_out": "2026-08-22 17:30:00",
    "total_hours": 8.5,
    "status": "Present"
  }
}
```

---

### 7. Get Attendance Logs (Daily & Weekly)
- **Endpoint**: `GET /attendance/my` (Employee) or `GET /attendance/all` (Admin)
- **Query Parameters**: `startDate=2026-08-15&endDate=2026-08-22`

---

## Leave & Time-Off Management

### 8. Apply for Leave
Allows employees to submit a leave request.

- **Endpoint**: `POST /leaves/apply`
- **Request Body**:
```json
{
  "leave_type": "Sick",
  "start_date": "2026-09-10",
  "end_date": "2026-09-11",
  "reason": "Dental surgery"
}
```

---

### 9. HR Leave Approval / Rejection (Admin Only)
- **Endpoint**: `PUT /leaves/:id/status`
- **Request Body**:
```json
{
  "status": "Approved",
  "hr_comments": "Approved. Take care!"
}
```

---

## Payroll Management

### 10. Get Payroll Details
- **Endpoint**: `GET /payroll/me` (Employee read-only view)
- **Endpoint**: `GET /payroll/all` (Admin full list view)

---

## HR Analytics Dashboard

### 11. Get Dashboard Summary Statistics (Admin Only)
- **Endpoint**: `GET /dashboard/stats`
- **Response** (`200 OK`):
```json
{
  "total_employees": 3,
  "present_today": 2,
  "on_leave_today": 1,
  "pending_leave_requests": 1,
  "monthly_payroll_total": 22950.00
}
```
