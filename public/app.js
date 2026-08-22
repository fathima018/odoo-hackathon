const API_BASE = '/api';
let currentUser = null;
let currentToken = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Default login as Admin for instant test driving
    await loginDemo('admin@dayflow.com');
});

// Demo Login Function
async function loginDemo(email) {
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'admin123' })
        });
        const data = await res.json();
        if (data.success) {
            currentToken = data.token;
            currentUser = data.user;
            updateUserUI();
            refreshCurrentTabData();
        } else {
            alert('Login failed: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Demo login error:', err);
    }
}

function updateUserUI() {
    if (!currentUser) return;
    document.getElementById('quickLoginBar').classList.add('hidden');
    document.getElementById('userInfoPill').classList.remove('hidden');
    document.getElementById('userName').textContent = `${currentUser.first_name} ${currentUser.last_name}`;
    document.getElementById('userAvatar').src = currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';
    
    const roleBadge = document.getElementById('userRoleBadge');
    roleBadge.textContent = currentUser.role.toUpperCase();
    if (currentUser.role === 'Admin') {
        roleBadge.className = 'badge badge-present';
    } else {
        roleBadge.className = 'badge badge-leave';
    }
}

function logout() {
    currentUser = null;
    currentToken = null;
    document.getElementById('userInfoPill').classList.add('hidden');
    document.getElementById('quickLoginBar').classList.remove('hidden');
}

// Tab Switching Logic
function switchTab(tabId) {
    document.querySelectorAll('.sidebar .nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('main section').forEach(el => el.classList.add('hidden'));

    event.currentTarget.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    refreshTabData(tabId);
}

function refreshCurrentTabData() {
    const activeTab = document.querySelector('.sidebar .nav-item.active');
    if (!activeTab) return;
    if (activeTab.textContent.includes('Overview')) refreshTabData('dashboard');
    else if (activeTab.textContent.includes('Attendance')) refreshTabData('attendance');
    else if (activeTab.textContent.includes('Leave')) refreshTabData('leaves');
    else if (activeTab.textContent.includes('Employees')) refreshTabData('employees');
    else if (activeTab.textContent.includes('Payroll')) refreshTabData('payroll');
}

function refreshTabData(tabId) {
    if (tabId === 'dashboard') loadDashboard();
    else if (tabId === 'attendance') loadAttendance();
    else if (tabId === 'leaves') loadLeaves();
    else if (tabId === 'employees') loadEmployees();
    else if (tabId === 'payroll') loadPayroll();
}

// Helper Headers
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
    };
}

// 1. DASHBOARD LOAD
async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
        const stats = await res.json();

        document.getElementById('statTotalEmployees').textContent = stats.total_employees || 0;
        document.getElementById('statPresentToday').textContent = stats.present_today || 0;
        document.getElementById('statOnLeaveToday').textContent = stats.on_leave_today || 0;
        document.getElementById('statPendingLeaves').textContent = stats.pending_leave_requests || 0;
        document.getElementById('statPayrollTotal').textContent = `$${(stats.monthly_payroll_total || 0).toLocaleString()}`;

        // Load Attendance Report
        if (currentUser.role === 'Admin') {
            const reportRes = await fetch(`${API_BASE}/reports/attendance`, { headers: getHeaders() });
            const reportData = await reportRes.json();
            const reportBody = document.getElementById('attendanceReportBody');
            reportBody.innerHTML = reportData.map(r => `
                <tr>
                    <td><strong>${r.first_name} ${r.last_name}</strong> <small>(${r.employee_id})</small></td>
                    <td>${r.department}</td>
                    <td><span class="badge badge-present">${r.days_present} days</span></td>
                    <td><span class="badge badge-half-day">${r.days_half_day} days</span></td>
                    <td><span class="badge badge-leave">${r.days_leave} days</span></td>
                    <td><strong>${r.total_hours_worked} hrs</strong></td>
                </tr>
            `).join('');
        }

        // Load notifications/activity
        const notifRes = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
        const notifs = await notifRes.json();
        const activityList = document.getElementById('recentActivityList');
        activityList.innerHTML = notifs.map(n => `
            <div style="background:var(--bg-main); padding:0.9rem 1.25rem; border-radius:10px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="color:#fff; margin-bottom:0.2rem; font-size:0.95rem;">${n.title}</h4>
                    <p style="color:var(--text-muted); font-size:0.85rem;">${n.message}</p>
                </div>
                <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        `).join('');
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

// 2. ATTENDANCE LOAD & ACTIONS
async function loadAttendance() {
    try {
        const endpoint = (currentUser && currentUser.role === 'Admin') ? '/attendance/all' : '/attendance/my';
        const res = await fetch(`${API_BASE}${endpoint}`, { headers: getHeaders() });
        const data = await res.json();

        document.getElementById('attendanceTableTitle').textContent = (currentUser.role === 'Admin') ? 'All Employee Attendance Logs' : 'My Attendance Logs';

        const tbody = document.getElementById('attendanceTableBody');
        tbody.innerHTML = data.map(item => `
            <tr>
                <td><strong>${item.first_name ? item.first_name + ' ' + item.last_name : currentUser.first_name + ' ' + currentUser.last_name}</strong> <br><small style="color:var(--text-muted);">${item.employee_id || currentUser.employee_id}</small></td>
                <td>${item.date}</td>
                <td>${item.check_in ? new Date(item.check_in).toLocaleTimeString() : '--:--'}</td>
                <td>${item.check_out ? new Date(item.check_out).toLocaleTimeString() : '--:--'}</td>
                <td>${item.total_hours ? item.total_hours + ' hrs' : '0.00'}</td>
                <td><span class="badge badge-${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span></td>
                <td>${item.remarks || ''}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Attendance load error:', err);
    }
}

async function doCheckIn() {
    try {
        const res = await fetch(`${API_BASE}/attendance/check-in`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ remarks: 'Punctual check-in' })
        });
        const data = await res.json();
        const msgEl = document.getElementById('attendanceMsg');
        if (data.success) {
            msgEl.style.color = 'var(--accent)';
            msgEl.textContent = `✅ ${data.message} at ${new Date(data.attendance.check_in).toLocaleTimeString()}`;
            loadAttendance();
        } else {
            msgEl.style.color = 'var(--warning)';
            msgEl.textContent = `⚠️ ${data.error}`;
        }
    } catch (err) {
        console.error('Check-in error:', err);
    }
}

async function doCheckOut() {
    try {
        const res = await fetch(`${API_BASE}/attendance/check-out`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = await res.json();
        const msgEl = document.getElementById('attendanceMsg');
        if (data.success) {
            msgEl.style.color = 'var(--danger)';
            msgEl.textContent = `🔴 ${data.message} at ${new Date(data.attendance.check_out).toLocaleTimeString()} (Total Hours: ${data.attendance.total_hours} hrs)`;
            loadAttendance();
        } else {
            msgEl.style.color = 'var(--warning)';
            msgEl.textContent = `⚠️ ${data.error}`;
        }
    } catch (err) {
        console.error('Check-out error:', err);
    }
}

// 3. LEAVE LOAD & ACTIONS
async function loadLeaves() {
    try {
        const endpoint = (currentUser && currentUser.role === 'Admin') ? '/leaves/all' : '/leaves/my';
        const res = await fetch(`${API_BASE}${endpoint}`, { headers: getHeaders() });
        const data = await res.json();

        document.getElementById('leaveTableTitle').textContent = (currentUser.role === 'Admin') ? 'Leave Applications Queue (HR View)' : 'My Leave Requests';

        const tbody = document.getElementById('leaveTableBody');
        tbody.innerHTML = data.map(item => {
            const isAdmin = currentUser.role === 'Admin';
            let actionHtml = item.hr_comments ? `<small style="color:var(--text-muted);">${item.hr_comments}</small>` : '';

            if (isAdmin && item.status === 'Pending') {
                actionHtml = `
                    <button class="btn btn-success" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="reviewLeave(${item.id}, 'Approved')">Approve</button>
                    <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="reviewLeave(${item.id}, 'Rejected')">Reject</button>
                `;
            }

            return `
                <tr>
                    <td><strong>${item.first_name ? item.first_name + ' ' + item.last_name : currentUser.first_name + ' ' + currentUser.last_name}</strong></td>
                    <td><span class="badge badge-leave">${item.leave_type}</span></td>
                    <td>${item.start_date} to ${item.end_date}</td>
                    <td>${item.total_days} day(s)</td>
                    <td><span class="badge badge-${item.status.toLowerCase()}">${item.status}</span></td>
                    <td>${actionHtml}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Leave load error:', err);
    }
}

async function submitLeave(e) {
    e.preventDefault();
    const leave_type = document.getElementById('leaveType').value;
    const start_date = document.getElementById('leaveStartDate').value;
    const end_date = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;

    try {
        const res = await fetch(`${API_BASE}/leaves/apply`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ leave_type, start_date, end_date, reason })
        });
        const data = await res.json();
        if (data.success) {
            alert('Leave application submitted!');
            document.getElementById('leaveForm').reset();
            loadLeaves();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error('Leave submit error:', err);
    }
}

async function reviewLeave(leaveId, status) {
    const hr_comments = prompt(`Add HR feedback comment for ${status} status:`, `HR ${status}`);
    if (hr_comments === null) return;

    try {
        const res = await fetch(`${API_BASE}/leaves/${leaveId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status, hr_comments })
        });
        const data = await res.json();
        if (data.success) {
            loadLeaves();
            loadDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error('Review leave error:', err);
    }
}

// 4. EMPLOYEES LOAD
async function loadEmployees() {
    try {
        const res = await fetch(`${API_BASE}/employees`, { headers: getHeaders() });
        const data = await res.json();

        const tbody = document.getElementById('employeeTableBody');
        tbody.innerHTML = data.map(emp => `
            <tr>
                <td style="display:flex; align-items:center; gap:0.75rem;">
                    <img src="${emp.avatar_url}" style="width:36px; height:36px; border-radius:50%;">
                    <div><strong>${emp.first_name} ${emp.last_name}</strong><br><small style="color:var(--text-muted);">${emp.email}</small></div>
                </td>
                <td><code>${emp.employee_id}</code></td>
                <td>${emp.department || '-'}</td>
                <td>${emp.job_title || '-'}</td>
                <td><span class="badge ${emp.role === 'Admin' ? 'badge-present' : 'badge-leave'}">${emp.role}</span></td>
                <td><strong>$${(emp.net_salary || 0).toLocaleString()}</strong></td>
                <td>
                    <button class="btn btn-primary" style="padding:0.35rem 0.75rem; font-size:0.8rem;" onclick="viewEmployeeDetails(${emp.id})">View Profile</button>
                    <button class="btn btn-success" style="padding:0.35rem 0.75rem; font-size:0.8rem; margin-left:0.3rem;" onclick="viewSalarySlip(${emp.id})">📄 Pay Slip</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Employees load error:', err);
    }
}

async function viewEmployeeDetails(empId) {
    const res = await fetch(`${API_BASE}/employees/${empId}`, { headers: getHeaders() });
    const emp = await res.json();
    alert(`Employee Details:\n\nName: ${emp.first_name} ${emp.last_name}\nEmail: ${emp.email}\nPhone: ${emp.phone}\nAddress: ${emp.address}\nDepartment: ${emp.department}\nJob Title: ${emp.job_title}\nJoining Date: ${emp.joining_date}\nBase Salary: $${emp.base_salary}\nNet Salary: $${emp.net_salary}`);
}

// 5. PAYROLL LOAD & SALARY SLIP MODAL
async function loadPayroll() {
    try {
        const res = await fetch(`${API_BASE}/payroll/all`, { headers: getHeaders() });
        const data = await res.json();

        const tbody = document.getElementById('payrollTableBody');
        tbody.innerHTML = data.map(p => `
            <tr>
                <td><strong>${p.first_name} ${p.last_name}</strong><br><small style="color:var(--text-muted);">${p.job_title}</small></td>
                <td>$${(p.base_salary || 0).toLocaleString()}</td>
                <td style="color:var(--accent);">+$${(p.allowances || 0).toLocaleString()}</td>
                <td style="color:var(--danger);">-$${(p.deductions || 0).toLocaleString()}</td>
                <td><strong style="font-size:1.05rem; color:#a855f7;">$${(p.net_salary || 0).toLocaleString()}</strong></td>
                <td>${p.currency} (${p.pay_frequency})</td>
                <td>
                    <button class="btn btn-success" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="viewSalarySlip(${p.user_id})">📄 View Slip</button>
                    ${currentUser.role === 'Admin' ? `<button class="btn btn-primary" style="padding:0.3rem 0.6rem; font-size:0.75rem; margin-left:0.3rem;" onclick="editSalary(${p.user_id}, ${p.base_salary}, ${p.allowances}, ${p.deductions})">Edit</button>` : ''}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Payroll load error:', err);
    }
}

async function viewSalarySlip(userId) {
    try {
        const res = await fetch(`${API_BASE}/payroll/slip/${userId}`, { headers: getHeaders() });
        const slip = await res.json();

        const content = document.getElementById('salarySlipModalContent');
        content.innerHTML = `
            <div style="background:#0f172a; padding:1.25rem; border-radius:12px; border:1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
                    <div>
                        <h4 style="font-size:1.2rem; color:#fff;">Dayflow HRMS Pay Slip</h4>
                        <p style="color:var(--text-muted); font-size:0.85rem;">Period: <strong>${slip.pay_period}</strong></p>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-family:monospace; color:var(--accent); font-weight:700;">${slip.payslip_number}</span><br>
                        <small style="color:var(--text-muted);">Date: ${slip.generated_at}</small>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; font-size:0.9rem;">
                    <div>
                        <p style="color:var(--text-muted);">Employee Name:</p>
                        <p><strong>${slip.employee.name}</strong></p>
                        <p style="color:var(--text-muted); margin-top:0.4rem;">Department:</p>
                        <p><strong>${slip.employee.department}</strong></p>
                    </div>
                    <div>
                        <p style="color:var(--text-muted);">Employee ID:</p>
                        <p><code>${slip.employee.id}</code></p>
                        <p style="color:var(--text-muted); margin-top:0.4rem;">Job Title:</p>
                        <p><strong>${slip.employee.job_title}</strong></p>
                    </div>
                </div>

                <table style="margin-top:1rem; margin-bottom:1rem;">
                    <thead>
                        <tr><th>Earnings Breakdown</th><th style="text-align:right;">Amount</th></tr>
                    </thead>
                    <tbody>
                        ${slip.earnings.map(e => `<tr><td>${e.title}</td><td style="text-align:right; color:var(--accent);">$${e.amount.toLocaleString()}</td></tr>`).join('')}
                    </tbody>
                </table>

                <table style="margin-bottom:1rem;">
                    <thead>
                        <tr><th>Deductions Breakdown</th><th style="text-align:right;">Amount</th></tr>
                    </thead>
                    <tbody>
                        ${slip.deductions.map(d => `<tr><td>${d.title}</td><td style="text-align:right; color:var(--danger);">-$${d.amount.toLocaleString()}</td></tr>`).join('')}
                    </tbody>
                </table>

                <div style="background:rgba(168,85,247,0.15); border:1px solid #a855f7; padding:1rem; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.1rem; font-weight:700;">NET TAKE-HOME SALARY</span>
                    <span style="font-size:1.4rem; font-weight:800; color:#a855f7;">$${slip.summary.net_pay.toLocaleString()} ${slip.summary.currency}</span>
                </div>
            </div>
        `;

        document.getElementById('salarySlipModal').classList.remove('hidden');
    } catch (err) {
        alert('Failed to load salary slip: ' + err.message);
    }
}

function closeSalarySlipModal() {
    document.getElementById('salarySlipModal').classList.add('hidden');
}

async function editSalary(userId, currentBase, currentAllow, currentDeduct) {
    const base_salary = prompt('Enter Base Salary:', currentBase);
    if (base_salary === null) return;
    const allowances = prompt('Enter Allowances:', currentAllow);
    if (allowances === null) return;
    const deductions = prompt('Enter Deductions:', currentDeduct);
    if (deductions === null) return;

    try {
        const res = await fetch(`${API_BASE}/payroll/salary-structure/${userId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ base_salary, allowances, deductions })
        });
        const data = await res.json();
        if (data.success) {
            alert('Salary structure updated successfully!');
            loadPayroll();
            loadDashboard();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (err) {
        console.error('Edit salary error:', err);
    }
}

// 6. API EXPLORER JSON VIEWER
async function fetchApiEndpoint(endpoint) {
    try {
        const res = await fetch(endpoint, { headers: getHeaders() });
        const json = await res.json();
        document.getElementById('apiJsonViewer').textContent = JSON.stringify(json, null, 2);
    } catch (err) {
        document.getElementById('apiJsonViewer').textContent = 'Error fetching API: ' + err.message;
    }
}
