# Dayflow HRMS Database Module

Welcome to the **Dayflow Human Resource Management System (HRMS)** database documentation and setup guide.

---

## 🏗 Schema Overview

The database is built on a clean relational architecture designed to scale seamlessly between **SQLite** (local development/lightweight deployment) and **PostgreSQL** (production enterprise scale).

### Entity Relationship Summary

```
                       +-------------------+
                       |       users       |
                       +-------------------+
                         /   |      \    \
                        /    |       \    \
                       1     1        1    *
                      /      |         \    \
     +-----------------+ +---+-------+ +-+----+ +---------------+
     |employee_profiles| |  salary   | |docs  | | notifications |
     +-----------------+ +-----------+ +------+ +---------------+
                             |
                             *
                        +----+----+
                        |payrolls |
                        +---------+

         +-----------------+          +----------------+
         |   attendance    |          | leave_requests |
         +-----------------+          +----------------+
```

1. **`users`**: Central authentication table managing credentials (`email`, `password_hash`), employee numbers (`employee_id`), and role permissions (`Admin` / `Employee`).
2. **`employee_profiles`**: 1-to-1 relationship with `users`. Contains profile details (`first_name`, `last_name`, `phone`, `address`, `department`, `job_title`, `avatar_url`).
3. **`salary_structures`**: 1-to-1 relationship with `users`. Stores base salary, allowances, deductions, and net salary.
4. **`attendance`**: 1-to-many relationship with `users`. Tracks daily check-in/check-out timestamps, total hours worked, and status (`Present`, `Absent`, `Half-day`, `Leave`).
5. **`leave_requests`**: 1-to-many relationship with `users`. Handles leave applications, status workflows (`Pending`, `Approved`, `Rejected`), and HR approval comments.
6. **`payrolls`**: Historical payroll records for salary slips and reporting.
7. **`documents`**: Document storage tracking contracts, IDs, and certificates.
8. **`notifications`**: Real-time alerts for leave approvals and system activity.

---

## 📂 File Structure

```
database/
├── schema/
│   └── schema.sql       # Complete DDL SQL table schemas & indexes
├── seeds/
│   └── seed.sql         # Pre-configured seed data (Admin, Employees, Attendance, Leaves)
├── docs/
│   └── api.md           # Full REST API endpoint specification
├── init.js              # Database initialization & seeding runner
└── README.md            # Architecture & setup instructions
```

---

## ⚡ Quick Start & Database Initialization

To initialize the database locally:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npm run db:init
   ```

3. **Start the API Server**:
   ```bash
   npm start
   ```
