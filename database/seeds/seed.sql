-- Seed Data for Dayflow HRMS

-- Clear existing data if resetting
DELETE FROM notifications;
DELETE FROM documents;
DELETE FROM payrolls;
DELETE FROM leave_requests;
DELETE FROM attendance;
DELETE FROM salary_structures;
DELETE FROM employee_profiles;
DELETE FROM users;

-- Reset Auto Increment IDs (SQLite compatibility)
DELETE FROM sqlite_sequence WHERE name IN (
    'users', 'employee_profiles', 'salary_structures', 
    'attendance', 'leave_requests', 'payrolls', 'documents', 'notifications'
);

-- 1. Insert Users
-- Passwords below are bcrypt hashes for:
-- admin@dayflow.com -> admin123
-- john.doe@dayflow.com -> employee123
-- jane.smith@dayflow.com -> employee123
INSERT INTO users (id, employee_id, email, password_hash, role, created_at) VALUES
(1, 'EMP-001', 'admin@dayflow.com', '$2a$10$wE9V8Z1Q1w7mD0.yE/6G/eNfQ4gD9sV.uXN2jF3mH6k9P0lO1q2r3', 'Admin', '2026-01-01 09:00:00'),
(2, 'EMP-002', 'john.doe@dayflow.com', '$2a$10$wE9V8Z1Q1w7mD0.yE/6G/eNfQ4gD9sV.uXN2jF3mH6k9P0lO1q2r3', 'Employee', '2026-01-15 09:00:00'),
(3, 'EMP-003', 'jane.smith@dayflow.com', '$2a$10$wE9V8Z1Q1w7mD0.yE/6G/eNfQ4gD9sV.uXN2jF3mH6k9P0lO1q2r3', 'Employee', '2026-02-01 09:00:00');

-- 2. Insert Employee Profiles
INSERT INTO employee_profiles (user_id, first_name, last_name, phone, address, department, job_title, joining_date, dob, avatar_url) VALUES
(1, 'Alex', 'Vance', '+1 555-0100', '100 Admin Plaza, Suite 500, New York, NY', 'Human Resources', 'HR Manager', '2025-06-01', '1988-04-12', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'),
(2, 'John', 'Doe', '+1 555-0192', '742 Evergreen Terrace, Springfield, IL', 'Engineering', 'Senior Software Engineer', '2026-01-15', '1993-08-24', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'),
(3, 'Jane', 'Smith', '+1 555-0143', '404 Innovation Way, Tech Park, Austin, TX', 'Product Design', 'UI/UX Designer', '2026-02-01', '1995-11-05', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250');

-- 3. Insert Salary Structures
INSERT INTO salary_structures (user_id, base_salary, allowances, deductions, net_salary, currency, pay_frequency) VALUES
(1, 9500.00, 1200.00, 1500.00, 9200.00, 'USD', 'Monthly'),
(2, 7500.00, 800.00, 1100.00, 7200.00, 'USD', 'Monthly'),
(3, 6800.00, 700.00, 950.00, 6550.00, 'USD', 'Monthly');

-- 4. Insert Attendance Logs
INSERT INTO attendance (user_id, date, check_in, check_out, total_hours, status, remarks) VALUES
-- Admin (Alex Vance)
(1, '2026-08-18', '2026-08-18 09:00:00', '2026-08-18 17:30:00', 8.50, 'Present', 'On time'),
(1, '2026-08-19', '2026-08-19 08:55:00', '2026-08-19 17:30:00', 8.58, 'Present', 'On time'),
(1, '2026-08-20', '2026-08-20 09:05:00', '2026-08-20 17:00:00', 7.91, 'Present', 'On time'),
(1, '2026-08-21', '2026-08-21 09:00:00', '2026-08-21 17:30:00', 8.50, 'Present', 'On time'),

-- Employee (John Doe)
(2, '2026-08-18', '2026-08-18 09:02:00', '2026-08-18 18:00:00', 8.96, 'Present', 'Worked on Sprint deliverables'),
(2, '2026-08-19', '2026-08-19 09:15:00', '2026-08-19 17:45:00', 8.50, 'Present', 'Slightly late start due to traffic'),
(2, '2026-08-20', '2026-08-20 09:00:00', '2026-08-20 13:00:00', 4.00, 'Half-day', 'Doctor appointment afternoon'),
(2, '2026-08-21', '2026-08-21 09:00:00', '2026-08-21 18:15:00', 9.25, 'Present', 'Feature release support'),

-- Employee (Jane Smith)
(3, '2026-08-18', '2026-08-18 09:10:00', '2026-08-18 17:30:00', 8.33, 'Present', 'Design review session'),
(3, '2026-08-19', '2026-08-19 09:00:00', '2026-08-19 17:30:00', 8.50, 'Present', 'Figma prototypes completed'),
(3, '2026-08-20', NULL, NULL, 0.00, 'Leave', 'Approved sick leave'),
(3, '2026-08-21', '2026-08-21 08:50:00', '2026-08-21 17:20:00', 8.50, 'Present', 'On time');

-- 5. Insert Leave Requests
INSERT INTO leave_requests (id, user_id, leave_type, start_date, end_date, total_days, reason, status, hr_comments, reviewed_by, created_at) VALUES
(1, 2, 'Paid', '2026-09-01', '2026-09-05', 5, 'Annual family vacation', 'Pending', NULL, NULL, '2026-08-20 10:15:00'),
(2, 3, 'Sick', '2026-08-20', '2026-08-20', 1, 'Severe migraine and fever', 'Approved', 'Get well soon!', 1, '2026-08-19 16:30:00'),
(3, 2, 'Unpaid', '2026-07-10', '2026-07-11', 2, 'Personal urgent matters', 'Rejected', 'High project workload on selected dates', 1, '2026-07-05 11:00:00');

-- 6. Insert Payroll Records
INSERT INTO payrolls (user_id, pay_period_start, pay_period_end, base_pay, total_allowances, total_deductions, net_pay, payment_status, payment_date) VALUES
(1, '2026-07-01', '2026-07-31', 9500.00, 1200.00, 1500.00, 9200.00, 'Paid', '2026-07-31'),
(2, '2026-07-01', '2026-07-31', 7500.00, 800.00, 1100.00, 7200.00, 'Paid', '2026-07-31'),
(3, '2026-07-01', '2026-07-31', 6800.00, 700.00, 950.00, 6550.00, 'Paid', '2026-07-31');

-- 7. Insert Employee Documents
INSERT INTO documents (user_id, document_name, document_type, file_url, uploaded_at) VALUES
(2, 'Employment_Contract_John_Doe.pdf', 'Contract', '/uploads/docs/contract_john.pdf', '2026-01-15 09:30:00'),
(2, 'ID_Card_John_Doe.pdf', 'Identification', '/uploads/docs/id_john.pdf', '2026-01-15 09:35:00'),
(3, 'Employment_Contract_Jane_Smith.pdf', 'Contract', '/uploads/docs/contract_jane.pdf', '2026-02-01 10:00:00');

-- 8. Insert Notifications
INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES
(2, 'Leave Request Submitted', 'Your leave request for Sep 01 - Sep 05 is pending HR approval.', 0, '2026-08-20 10:15:00'),
(3, 'Leave Request Approved', 'Your sick leave request for Aug 20 was approved by Alex Vance.', 1, '2026-08-19 16:30:00'),
(1, 'New Leave Request Alert', 'John Doe submitted a new Paid Leave request requiring approval.', 0, '2026-08-20 10:15:00');
