import { useState, useEffect, useContext } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { UserCheck, AlertTriangle, Calendar, Search, Filter, Save } from 'lucide-react';

const AttendanceForm = () => {
  const { employees, records, saveBulkAttendance, loading } = useContext(AttendanceContext);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  
  // Local state for tracking status of each employee: { [employeeId]: status }
  const [attendanceMap, setAttendanceMap] = useState({});

  // Initialize/Update attendance map when date or records change
  useEffect(() => {
    const map = {};
    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    
    activeEmployees.forEach((emp) => {
      // Find existing record for this employee and date
      const record = records.find(rec => rec.employeeId === emp.id && rec.date === date);
      if (record) {
        map[emp.id] = record.status;
      } else {
        // Default to "Present" for unmarked employees
        map[emp.id] = 'Present';
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttendanceMap(map);
  }, [date, employees, records]);

  // Handle marking status for an employee
  const handleStatusChange = (employeeId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
  };

  // Mark all filtered employees as a specific status (Bulk quick action!)
  const handleMarkAll = (status) => {
    const updated = { ...attendanceMap };
    filteredEmployees.forEach((emp) => {
      updated[emp.id] = status;
    });
    setAttendanceMap(updated);
  };

  // Submit bulk attendance
  const handleSave = async () => {
    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    const recordsList = activeEmployees.map(emp => ({
      employeeId: emp.id,
      status: attendanceMap[emp.id] || 'Present',
    }));

    await saveBulkAttendance(date, recordsList);
  };

  // Filter employees
  const activeEmployees = employees.filter(emp => emp.status === 'Active');
  
  const filteredEmployees = activeEmployees.filter((emp) => {
    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const statusOptions = [
    { value: 'Present', label: 'Present', short: 'P', color: 'present' },
    { value: 'Absent', label: 'Absent', short: 'A', color: 'absent' },
    { value: 'Leave', label: 'Leave', short: 'L', color: 'leave' },
    { value: 'Half Day', label: 'Half Day', short: 'HD', color: 'half-day' },
    { value: 'Work From Home', label: 'WFH', short: 'WFH', color: 'wfh' }
  ];

  return (
    <div className="card" style={{ width: '100%' }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
            <UserCheck size={20} style={{ color: 'var(--primary)' }} />
            Attendance Marking Panel
          </h3>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Mark daily attendance for all active employees. Select status, then click save.
          </p>
        </div>

        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="attendance-date" style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={16} className="text-muted" />
            <span>Select Date:</span>
          </label>
          <input
            type="date"
            id="attendance-date"
            value={date}
            max={new Date().toISOString().split('T')[0]} // No future dates
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', margin: 0 }}
          />
        </div>
      </div>

      {activeEmployees.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem' }}>
          <AlertTriangle size={48} className="empty-state-icon" style={{ color: 'var(--warning)' }} />
          <h4 className="empty-state-title">No Active Employees Found</h4>
          <p>Please register active employees in the Employee Management tab first.</p>
        </div>
      ) : (
        <>
          {/* Actions and Filters Row */}
          <div className="table-actions-bar" style={{ marginBottom: '1.25rem' }}>
            {/* Search */}
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
            </div>

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="filter-wrapper-panel">
              <Filter size={16} className="text-muted" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 1.75rem 0.45rem 0.75rem', margin: 0, fontSize: '0.85rem' }}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Quality Assurance (QA)">Quality Assurance (QA)</option>
                <option value="Human Resources (HR)">Human Resources (HR)</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Information Technology (IT)">Information Technology (IT)</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Business Development">Business Development</option>
                <option value="Management">Management</option>
              </select>
            </div>

            {/* Bulk quick actions buttons */}
            <div className="quick-actions-panel" style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: '0.25rem' }}>
                Set Filtered:
              </span>
              <button onClick={() => handleMarkAll('Present')} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', width: 'auto' }}>Present</button>
              <button onClick={() => handleMarkAll('Absent')} className="btn btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', width: 'auto', color: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}>Absent</button>
              <button onClick={() => handleMarkAll('Leave')} className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', width: 'auto', color: 'var(--warning)', backgroundColor: 'var(--warning-light)' }}>Leave</button>
            </div>
          </div>

          {/* Table container */}
          <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th style={{ width: '380px', textAlign: 'center' }}>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No employees match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const currentStatus = attendanceMap[emp.id] || 'Present';
                    return (
                      <tr key={emp.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{emp.employeeId || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="roster-avatar" style={{ width: '1.85rem', height: '1.85rem', fontSize: '0.75rem', margin: 0 }}>
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span style={{ fontWeight: 600 }}>{emp.name}</span>
                          </div>
                        </td>
                        <td>{emp.department}</td>
                        <td className="text-muted">{emp.designation}</td>
                        <td>
                          {/* Desktop view button group */}
                          <div className="desktop-status-group" style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                            {statusOptions.map((opt) => {
                              const isActive = currentStatus === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => handleStatusChange(emp.id, opt.value)}
                                  className={`status-select-btn ${opt.color} ${isActive ? 'active' : ''}`}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.8rem',
                                    borderRadius: '6px',
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    backgroundColor: isActive ? `var(--${opt.color === 'half-day' ? 'primary' : opt.color === 'wfh' ? 'primary' : opt.color})` : 'transparent',
                                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title={opt.label}
                                >
                                  <span className="full-label">{opt.label}</span>
                                  <span className="short-label">{opt.short}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Mobile Dropdown (handles responsiveness) */}
                          <div className="mobile-status-select" style={{ display: 'none' }}>
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                              className="form-select"
                              style={{ margin: 0, padding: '0.35rem 1.75rem 0.35rem 0.5rem', fontSize: '0.85rem' }}
                            >
                              {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Save panel */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Showing {filteredEmployees.length} of {activeEmployees.length} active employees
            </span>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading || filteredEmployees.length === 0}
              style={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {loading ? (
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              ) : (
                <Save size={18} />
              )}
              <span>Save Attendance</span>
            </button>
          </div>
        </>
      )}

      {/* CSS overrides for responsive layout */}
      <style>{`
        .status-select-btn {
          opacity: 0.7;
          border: 1px solid var(--border-color) !important;
        }
        .status-select-btn:hover {
          opacity: 1;
          background-color: var(--bg-secondary) !important;
        }
        .status-select-btn.active {
          opacity: 1 !important;
          border-color: transparent !important;
        }
        .status-select-btn.present.active { background-color: var(--success) !important; }
        .status-select-btn.absent.active { background-color: var(--danger) !important; }
        .status-select-btn.leave.active { background-color: var(--warning) !important; }
        .status-select-btn.half-day.active { background-color: #3b82f6 !important; }
        .status-select-btn.wfh.active { background-color: #8b5cf6 !important; }
        
        .status-select-btn .short-label { display: none; }

        @media (max-width: 1024px) {
          .status-select-btn .full-label { display: none; }
          .status-select-btn .short-label { display: inline; }
        }

        @media (max-width: 768px) {
          .desktop-status-group {
            display: none !important;
          }
          .mobile-status-select {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceForm;
