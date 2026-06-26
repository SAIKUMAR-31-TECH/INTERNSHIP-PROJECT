import { useContext, useState } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { BarChart3, Award, Calendar, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react';

const Summary = () => {
  const { employees, records, user, api, triggerNotification } = useContext(AttendanceContext);

  // Selected employee state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Fall back to first employee in roster if current selection is invalid or empty
  const currentEmployeeId = selectedEmployeeId && employees.some(e => e.id === selectedEmployeeId)
    ? selectedEmployeeId
    : (employees.length > 0 ? employees[0].id : '');

  // Calculate statistics for the selected employee
  const employeeRecords = records.filter(rec => rec.employeeId === currentEmployeeId);
  const totalDays = employeeRecords.length;
  const presentDays = employeeRecords.filter(rec => rec.status === 'Present').length;
  const absentDays = employeeRecords.filter(rec => rec.status === 'Absent').length;
  const leaveDays = employeeRecords.filter(rec => rec.status === 'Leave').length;

  const attendancePercentage = totalDays > 0 
    ? Math.round((presentDays / totalDays) * 100) 
    : 0;

  // Evaluation status
  const getStatusEvaluation = (pct) => {
    if (totalDays === 0) return { label: 'No records yet', color: 'var(--text-muted)' };
    if (pct >= 90) return { label: 'Excellent', color: 'var(--success)' };
    if (pct >= 75) return { label: 'Good', color: 'var(--primary)' };
    return { label: 'Needs Attention', color: 'var(--danger)' };
  };

  const evaluation = getStatusEvaluation(attendancePercentage);

  // SVG Progress Ring calculations
  const radius = 80;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (attendancePercentage / 100) * circumference;

  // Sorted list of employee's logs
  const sortedRecords = [...employeeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

  const isAdmin = user && user.role === 'Admin';

  const handleExport = async (type) => {
    try {
      triggerNotification('warning', `Generating ${type.toUpperCase()} report...`);
      const res = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.${type}`;
      link.click();
      triggerNotification('success', `${type.toUpperCase()} report downloaded successfully.`);
    } catch (err) {
      console.error(err);
      triggerNotification('error', `Failed to export ${type.toUpperCase()} report.`);
    }
  };

  return (
    <div className="card" style={{ width: '100%' }}>
      {/* Header Panel with Titles and Download Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
            Employee Attendance Summary
          </h3>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Analyze the historical attendance percentage and metrics of individual team members.
          </p>
        </div>

        {/* Report Exports (Admin only) */}
        {isAdmin && employees.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              onClick={() => handleExport('csv')}
            >
              <FileSpreadsheet size={14} />
              <span>Export CSV</span>
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
              onClick={() => handleExport('pdf')}
            >
              <FileText size={14} />
              <span>Export PDF</span>
            </button>
          </div>
        )}
      </div>

      {employees.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-state-icon" />
          <h4 className="empty-state-title">No Employees Added</h4>
          <p>Please populate the Roster before reviewing summaries.</p>
        </div>
      ) : (
        <div className="summary-container" style={{ marginTop: '1.5rem' }}>
          {/* Left panel: Employee Selection & Progress Ring */}
          <div className="summary-sidebar">
            <div className="form-group">
              <label htmlFor="summary-emp-select" className="form-label">
                Select Employee
              </label>
              <select
                id="summary-emp-select"
                value={currentEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="form-select"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Circular Progress Display */}
            <div className="card employee-summary-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: 'none' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Attendance Rate
              </span>
              
              <div className="progress-ring-container" style={{ width: '160px', height: '160px' }}>
                <svg height={radius * 2} width={radius * 2}>
                  <circle
                    stroke="var(--border-color)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke="var(--primary)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    className="progress-ring-circle"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                <div className="progress-ring-text">
                  <span className="progress-ring-percent">{attendancePercentage}%</span>
                  <span className="progress-ring-label" style={{ color: evaluation.color, fontWeight: 700 }}>
                    {evaluation.label}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Award size={16} style={{ color: evaluation.color }} />
                <span>Roster rating: <strong style={{ color: evaluation.color }}>{evaluation.label}</strong></span>
              </div>
            </div>
          </div>

          {/* Right panel: Counts Grid and Log Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Box Stats Grid */}
            <div className="summary-stats-grid">
              <div className="summary-stat-box">
                <div className="summary-stat-box-val total">{totalDays}</div>
                <div className="summary-stat-box-lbl">Total Days Tracked</div>
              </div>
              <div className="summary-stats-grid" style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: 0 }}>
                <div className="summary-stat-box">
                  <div className="summary-stat-box-val present">{presentDays}</div>
                  <div className="summary-stat-box-lbl">Present</div>
                </div>
                <div className="summary-stat-box">
                  <div className="summary-stat-box-val absent">{absentDays}</div>
                  <div className="summary-stat-box-lbl">Absent</div>
                </div>
                <div className="summary-stat-box">
                  <div className="summary-stat-box-val leave">{leaveDays}</div>
                  <div className="summary-stat-box-lbl">Leave</div>
                </div>
              </div>
            </div>

            {/* Employee Logs list */}
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} className="text-muted" />
                <span>Recent Logs History</span>
              </h4>

              {sortedRecords.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.9rem' }}>No attendance records found for this employee.</p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem'
                }}>
                  {sortedRecords.map((rec) => (
                    <div key={rec.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      borderBottom: '1px solid var(--bg-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{ fontStyle: 'normal' }}>
                        {new Date(rec.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className={`badge ${rec.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                        {rec.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
