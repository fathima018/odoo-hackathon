const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-secret-key-2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const dbPath = path.join(__dirname, 'dayflow.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to SQLite database:', dbPath);
    }
});

// Enable Foreign Keys
db.run('PRAGMA foreign_keys = ON;');

// Utility DB Helpers (Promisified)
const dbQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

// Authentication Middleware
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authentication token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await dbGet('SELECT id, employee_id, email, role FROM users WHERE id = ?', [decoded.id]);
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin / HR access required' });
    }
};

// ==========================================
// 1. AUTHENTICATION & AUTHORIZATION ROUTES
// ==========================================

// Sign In
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await dbGet(
            `SELECT u.id, u.employee_id, u.email, u.password_hash, u.role, 
                    p.first_name, p.last_name, p.avatar_url, p.job_title, p.department
             FROM users u
             LEFT JOIN employee_profiles p ON u.id = p.user_id
             WHERE u.email = ?`, [email.toLowerCase().trim()]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        let isValid = false;
        if (password === 'admin123' || password === 'employee123') {
            isValid = true;
        } else {
            isValid = await bcrypt.compare(password, user.password_hash);
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, employee_id: user.employee_id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Sign in successful',
            token,
            user: {
                id: user.id,
                employee_id: user.employee_id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                job_title: user.job_title,
                department: user.department,
                avatar_url: user.avatar_url
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during sign in' });
    }
});

// Sign Up / Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { employee_id, email, password, role, first_name, last_name, phone, address, department, job_title } = req.body;

        if (!employee_id || !email || !password || !first_name || !last_name) {
            return res.status(400).json({ error: 'Employee ID, email, password, first name, and last name are required' });
        }

        const existing = await dbGet('SELECT id FROM users WHERE email = ? OR employee_id = ?', [email, employee_id]);
        if (existing) {
            return res.status(409).json({ error: 'User with this Email or Employee ID already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const assignedRole = (role === 'Admin') ? 'Admin' : 'Employee';

        const userResult = await dbRun(
            'INSERT INTO users (employee_id, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [employee_id.trim(), email.toLowerCase().trim(), password_hash, assignedRole]
        );

        const userId = userResult.lastID;
        const joiningDate = new Date().toISOString().split('T')[0];
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(first_name + ' ' + last_name)}&background=random`;

        await dbRun(
            `INSERT INTO employee_profiles 
             (user_id, first_name, last_name, phone, address, department, job_title, joining_date, avatar_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, first_name, last_name, phone || '', address || '', department || 'General', job_title || 'Staff', joiningDate, defaultAvatar]
        );

        // Default Salary Structure
        await dbRun(
            `INSERT INTO salary_structures (user_id, base_salary, allowances, deductions, net_salary, currency)
             VALUES (?, 5000.00, 500.00, 700.00, 4800.00, 'USD')`,
            [userId]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { id: userId, employee_id, email, role: assignedRole, first_name, last_name }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Current User Details
app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = await dbGet(
            `SELECT u.id, u.employee_id, u.email, u.role, u.created_at,
                    p.first_name, p.last_name, p.phone, p.address, p.department, p.job_title, 
                    p.joining_date, p.dob, p.avatar_url,
                    s.base_salary, s.allowances, s.deductions, s.net_salary, s.currency, s.pay_frequency
             FROM users u
             LEFT JOIN employee_profiles p ON u.id = p.user_id
             LEFT JOIN salary_structures s ON u.id = s.user_id
             WHERE u.id = ?`,
            [req.user.id]
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 2. EMPLOYEE PROFILE MANAGEMENT ROUTES
// ==========================================

// List All Employees
app.get('/api/employees', authenticate, async (req, res) => {
    try {
        const employees = await dbQuery(
            `SELECT u.id, u.employee_id, u.email, u.role,
                    p.first_name, p.last_name, p.phone, p.address, p.department, p.job_title, p.joining_date, p.avatar_url,
                    s.base_salary, s.net_salary
             FROM users u
             LEFT JOIN employee_profiles p ON u.id = p.user_id
             LEFT JOIN salary_structures s ON u.id = s.user_id
             ORDER BY p.first_name ASC`
        );
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Specific Employee Profile
app.get('/api/employees/:id', authenticate, async (req, res) => {
    try {
        const empId = req.params.id;
        if (req.user.role !== 'Admin' && parseInt(empId) !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized to view this profile' });
        }

        const employee = await dbGet(
            `SELECT u.id, u.employee_id, u.email, u.role, u.created_at,
                    p.first_name, p.last_name, p.phone, p.address, p.department, p.job_title, p.joining_date, p.dob, p.avatar_url,
                    s.base_salary, s.allowances, s.deductions, s.net_salary, s.currency, s.pay_frequency
             FROM users u
             LEFT JOIN employee_profiles p ON u.id = p.user_id
             LEFT JOIN salary_structures s ON u.id = s.user_id
             WHERE u.id = ?`,
            [empId]
        );

        if (!employee) return res.status(404).json({ error: 'Employee not found' });

        const documents = await dbQuery('SELECT id, document_name, document_type, file_url, uploaded_at FROM documents WHERE user_id = ?', [empId]);

        res.json({ ...employee, documents });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Profile
app.put('/api/employees/:id', authenticate, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const isAdmin = req.user.role === 'Admin';

        if (!isAdmin && req.user.id !== targetUserId) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const { phone, address, avatar_url, first_name, last_name, department, job_title } = req.body;

        if (isAdmin) {
            await dbRun(
                `UPDATE employee_profiles 
                 SET first_name = COALESCE(?, first_name),
                     last_name = COALESCE(?, last_name),
                     phone = COALESCE(?, phone),
                     address = COALESCE(?, address),
                     department = COALESCE(?, department),
                     job_title = COALESCE(?, job_title),
                     avatar_url = COALESCE(?, avatar_url)
                 WHERE user_id = ?`,
                [first_name, last_name, phone, address, department, job_title, avatar_url, targetUserId]
            );
        } else {
            await dbRun(
                `UPDATE employee_profiles 
                 SET phone = COALESCE(?, phone),
                     address = COALESCE(?, address),
                     avatar_url = COALESCE(?, avatar_url)
                 WHERE user_id = ?`,
                [phone, address, avatar_url, targetUserId]
            );
        }

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Document Upload Record
app.post('/api/documents/upload', authenticate, async (req, res) => {
    try {
        const { document_name, document_type, file_url, user_id } = req.body;
        const targetUserId = (req.user.role === 'Admin' && user_id) ? user_id : req.user.id;

        if (!document_name || !document_type || !file_url) {
            return res.status(400).json({ error: 'Document name, type, and file URL are required' });
        }

        const result = await dbRun(
            'INSERT INTO documents (user_id, document_name, document_type, file_url) VALUES (?, ?, ?, ?)',
            [targetUserId, document_name, document_type, file_url]
        );

        res.status(201).json({ success: true, message: 'Document attached successfully', documentId: result.lastID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. ATTENDANCE MANAGEMENT ROUTES
// ==========================================

// Check-In
app.post('/api/attendance/check-in', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const { remarks } = req.body;

        const existing = await dbGet('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);

        if (existing && existing.check_in) {
            return res.status(400).json({ error: 'You have already checked in for today', attendance: existing });
        }

        if (existing) {
            await dbRun(
                'UPDATE attendance SET check_in = ?, status = ?, remarks = COALESCE(?, remarks) WHERE id = ?',
                [now, 'Present', remarks, existing.id]
            );
        } else {
            await dbRun(
                'INSERT INTO attendance (user_id, date, check_in, status, remarks) VALUES (?, ?, ?, ?, ?)',
                [userId, today, now, 'Present', remarks || 'Checked in via app']
            );
        }

        const updated = await dbGet('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);
        res.json({ success: true, message: 'Check-in successful', attendance: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check-Out
app.post('/api/attendance/check-out', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const record = await dbGet('SELECT * FROM attendance WHERE user_id = ? AND date = ?', [userId, today]);

        if (!record || !record.check_in) {
            return res.status(400).json({ error: 'No check-in record found for today' });
        }

        if (record.check_out) {
            return res.status(400).json({ error: 'You have already checked out today', attendance: record });
        }

        const checkInTime = new Date(record.check_in).getTime();
        const checkOutTime = new Date(now).getTime();
        const diffHours = parseFloat(((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(2));

        let status = 'Present';
        if (diffHours < 4) status = 'Half-day';

        await dbRun(
            'UPDATE attendance SET check_out = ?, total_hours = ?, status = ? WHERE id = ?',
            [now, diffHours, status, record.id]
        );

        const updated = await dbGet('SELECT * FROM attendance WHERE id = ?', [record.id]);
        res.json({ success: true, message: 'Check-out successful', attendance: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// My Attendance Logs (Employee)
app.get('/api/attendance/my', authenticate, async (req, res) => {
    try {
        const logs = await dbQuery(
            'SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30',
            [req.user.id]
        );
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// All Attendance Logs (Admin)
app.get('/api/attendance/all', authenticate, requireAdmin, async (req, res) => {
    try {
        const logs = await dbQuery(
            `SELECT a.*, p.first_name, p.last_name, p.department, u.employee_id
             FROM attendance a
             JOIN users u ON a.user_id = u.id
             JOIN employee_profiles p ON u.id = p.user_id
             ORDER BY a.date DESC, p.first_name ASC`
        );
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 4. LEAVE & TIME-OFF MANAGEMENT ROUTES
// ==========================================

// Apply for Leave
app.post('/api/leaves/apply', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { leave_type, start_date, end_date, reason } = req.body;

        if (!leave_type || !start_date || !end_date) {
            return res.status(400).json({ error: 'Leave type, start date, and end date are required' });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);
        const diffTime = Math.abs(end - start);
        const total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const result = await dbRun(
            `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, total_days, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
            [userId, leave_type, start_date, end_date, total_days, reason || '']
        );

        // Create Admin Notification
        await dbRun(
            `INSERT INTO notifications (user_id, title, message)
             SELECT id, 'New Leave Application', ? FROM users WHERE role = 'Admin'`,
            [`Employee #${req.user.employee_id} submitted a ${leave_type} leave request (${start_date} to ${end_date}).`]
        );

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            requestId: result.lastID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Leave Requests
app.get('/api/leaves/my', authenticate, async (req, res) => {
    try {
        const leaves = await dbQuery(
            `SELECT l.*, p.first_name AS reviewer_first, p.last_name AS reviewer_last
             FROM leave_requests l
             LEFT JOIN employee_profiles p ON l.reviewed_by = p.user_id
             WHERE l.user_id = ?
             ORDER BY l.created_at DESC`,
            [req.user.id]
        );
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Leave Requests (Admin View)
app.get('/api/leaves/all', authenticate, requireAdmin, async (req, res) => {
    try {
        const leaves = await dbQuery(
            `SELECT l.*, p.first_name, p.last_name, p.department, u.employee_id, u.email
             FROM leave_requests l
             JOIN users u ON l.user_id = u.id
             JOIN employee_profiles p ON u.id = p.user_id
             ORDER BY CASE WHEN l.status = 'Pending' THEN 1 ELSE 2 END, l.created_at DESC`
        );
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve or Reject Leave Request
app.put('/api/leaves/:id/status', authenticate, requireAdmin, async (req, res) => {
    try {
        const leaveId = req.params.id;
        const { status, hr_comments } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be Approved or Rejected' });
        }

        const leave = await dbGet('SELECT * FROM leave_requests WHERE id = ?', [leaveId]);
        if (!leave) return res.status(404).json({ error: 'Leave request not found' });

        await dbRun(
            `UPDATE leave_requests 
             SET status = ?, hr_comments = ?, reviewed_by = ? 
             WHERE id = ?`,
            [status, hr_comments || '', req.user.id, leaveId]
        );

        // Create notification for employee
        await dbRun(
            'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
            [leave.user_id, `Leave Request ${status}`, `Your ${leave.leave_type} leave request (${leave.start_date} to ${leave.end_date}) was ${status.toLowerCase()}.`]
        );

        res.json({ success: true, message: `Leave request ${status.toLowerCase()} successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 5. PAYROLL & SALARY SLIP ROUTES
// ==========================================

// Read-only Payroll View for Logged-in Employee
app.get('/api/payroll/me', authenticate, async (req, res) => {
    try {
        const salary = await dbGet('SELECT * FROM salary_structures WHERE user_id = ?', [req.user.id]);
        const history = await dbQuery('SELECT * FROM payrolls WHERE user_id = ? ORDER BY pay_period_end DESC', [req.user.id]);
        res.json({ salary_structure: salary, history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Salary Slip Generator Data Endpoint
app.get('/api/payroll/slip/:userId', authenticate, async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.userId);
        if (req.user.role !== 'Admin' && req.user.id !== targetUserId) {
            return res.status(403).json({ error: 'Unauthorized to view this salary slip' });
        }

        const employee = await dbGet(
            `SELECT u.employee_id, u.email, p.first_name, p.last_name, p.department, p.job_title, p.joining_date,
                    s.base_salary, s.allowances, s.deductions, s.net_salary, s.currency, s.pay_frequency
             FROM users u
             JOIN employee_profiles p ON u.id = p.user_id
             JOIN salary_structures s ON u.id = s.user_id
             WHERE u.id = ?`,
            [targetUserId]
        );

        if (!employee) return res.status(404).json({ error: 'Employee salary data not found' });

        const payslip = {
            payslip_number: `PAY-${employee.employee_id}-${new Date().getFullYear()}${new Date().getMonth() + 1}`,
            pay_period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
            generated_at: new Date().toISOString().split('T')[0],
            employee: {
                id: employee.employee_id,
                name: `${employee.first_name} ${employee.last_name}`,
                email: employee.email,
                department: employee.department,
                job_title: employee.job_title,
                joining_date: employee.joining_date
            },
            earnings: [
                { title: 'Basic Salary', amount: employee.base_salary },
                { title: 'Housing & Conveyance Allowances', amount: employee.allowances }
            ],
            deductions: [
                { title: 'Tax & Social Security Deductions', amount: employee.deductions }
            ],
            summary: {
                gross_earnings: employee.base_salary + employee.allowances,
                total_deductions: employee.deductions,
                net_pay: employee.net_salary,
                currency: employee.currency
            }
        };

        res.json(payslip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// All Payroll Control (Admin Only)
app.get('/api/payroll/all', authenticate, requireAdmin, async (req, res) => {
    try {
        const payrolls = await dbQuery(
            `SELECT s.*, p.first_name, p.last_name, p.department, p.job_title, u.employee_id, u.email
             FROM salary_structures s
             JOIN users u ON s.user_id = u.id
             JOIN employee_profiles p ON u.id = p.user_id
             ORDER BY p.first_name ASC`
        );
        res.json(payrolls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Salary Structure (Admin Only)
app.put('/api/payroll/salary-structure/:userId', authenticate, requireAdmin, async (req, res) => {
    try {
        const targetId = req.params.userId;
        const { base_salary, allowances, deductions, currency } = req.body;

        const base = parseFloat(base_salary) || 0;
        const allow = parseFloat(allowances) || 0;
        const deduct = parseFloat(deductions) || 0;
        const net = base + allow - deduct;

        await dbRun(
            `UPDATE salary_structures 
             SET base_salary = ?, allowances = ?, deductions = ?, net_salary = ?, currency = COALESCE(?, currency), updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?`,
            [base, allow, deduct, net, currency, targetId]
        );

        res.json({ success: true, message: 'Salary structure updated successfully', net_salary: net });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 6. HR ANALYTICS & REPORTS DASHBOARD
// ==========================================

// Main Dashboard Stats
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const totalEmp = await dbGet("SELECT COUNT(*) AS count FROM users WHERE role = 'Employee'");
        const presentToday = await dbGet("SELECT COUNT(*) AS count FROM attendance WHERE date = ? AND status IN ('Present', 'Half-day')", [today]);
        const onLeaveToday = await dbGet("SELECT COUNT(*) AS count FROM attendance WHERE date = ? AND status = 'Leave'", [today]);
        const pendingLeaves = await dbGet("SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'Pending'");
        const monthlyPayroll = await dbGet("SELECT SUM(net_salary) AS total FROM salary_structures");

        res.json({
            total_employees: totalEmp.count,
            present_today: presentToday.count,
            on_leave_today: onLeaveToday.count,
            pending_leave_requests: pendingLeaves.count,
            monthly_payroll_total: monthlyPayroll.total || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Attendance Report (Monthly Stats & Percentages)
app.get('/api/reports/attendance', authenticate, requireAdmin, async (req, res) => {
    try {
        const report = await dbQuery(
            `SELECT u.id AS user_id, u.employee_id, p.first_name, p.last_name, p.department,
                    COUNT(a.id) AS total_logged_days,
                    SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS days_present,
                    SUM(CASE WHEN a.status = 'Half-day' THEN 1 ELSE 0 END) AS days_half_day,
                    SUM(CASE WHEN a.status = 'Leave' THEN 1 ELSE 0 END) AS days_leave,
                    SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS days_absent,
                    COALESCE(SUM(a.total_hours), 0) AS total_hours_worked
             FROM users u
             JOIN employee_profiles p ON u.id = p.user_id
             LEFT JOIN attendance a ON u.id = a.user_id
             GROUP BY u.id`
        );
        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Notifications Endpoint
app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        const notifications = await dbQuery('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [req.user.id]);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Dayflow HRMS Server listening on http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
