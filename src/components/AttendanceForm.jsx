import { useState, useContext } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { UserCheck, Info, AlertTriangle } from 'lucide-react';

const AttendanceForm = () => {
  const { employees, records, addRecord } = useContext(AttendanceContext);

  // Form states
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');

  // Check for duplicate entry
  const isDuplicate = !!(employeeId && date && records.some(
    (rec) => rec.employeeId === employeeId && rec.date === date
  ));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!employeeId) return;

    const success = addRecord(employeeId, date, status);
    if (success) {
      // Reset form partially (keep date for faster batch entries, reset employee selection)
      setEmployeeId('');
      setStatus('Present');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 className="card-title">
        <UserCheck size={20} style={{ color: 'var(--primary)' }} />
        Mark Employee Attendance
      </h3>
      <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Log daily attendance records. Select the employee, date, and status below.
      </p>

      {employees.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <AlertTriangle size={36} className="empty-state-icon" style={{ color: 'var(--warning)' }} />
          <h4 className="empty-state-title">No Employees Found</h4>
          <p style={{ fontSize: '0.85rem' }}>You need to add employees in the "Employee Roster" tab before you can mark attendance.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Select Employee */}
          <div className="form-group">
            <label htmlFor="employee-select" className="form-label">
              Select Employee
            </label>
            <select
              id="employee-select"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="form-select"
              required
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Date */}
          <div className="form-group">
            <label htmlFor="date-input" className="form-label">
              Select Date
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                id="date-input"
                value={date}
                max={new Date().toISOString().split('T')[0]} // Can't select future dates
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Select Status */}
          <div className="form-group">
            <label className="form-label">Attendance Status</label>
            <div className="status-chips">
              <input
                type="radio"
                id="status-present"
                name="status"
                value="Present"
                checked={status === 'Present'}
                onChange={(e) => setStatus(e.target.value)}
                className="status-chip-input"
              />
              <label htmlFor="status-present" className="status-chip present">
                Present
              </label>

              <input
                type="radio"
                id="status-absent"
                name="status"
                value="Absent"
                checked={status === 'Absent'}
                onChange={(e) => setStatus(e.target.value)}
                className="status-chip-input"
              />
              <label htmlFor="status-absent" className="status-chip absent">
                Absent
              </label>

              <input
                type="radio"
                id="status-leave"
                name="status"
                value="Leave"
                checked={status === 'Leave'}
                onChange={(e) => setStatus(e.target.value)}
                className="status-chip-input"
              />
              <label htmlFor="status-leave" className="status-chip leave">
                Leave
              </label>
            </div>
          </div>

          {/* Warning for Duplicate Entry */}
          {isDuplicate && (
            <div className="alert-notification error" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
              <Info size={16} />
              <span>
                Attendance has already been marked for this employee on this date. Submitting will result in an error. To make edits, go to the <strong>Attendance History</strong> tab.
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!employeeId || isDuplicate}
            style={{
              marginTop: '1rem',
              opacity: (!employeeId || isDuplicate) ? 0.6 : 1,
              cursor: (!employeeId || isDuplicate) ? 'not-allowed' : 'pointer'
            }}
          >
            Submit Record
          </button>
        </form>
      )}
    </div>
  );
};

export default AttendanceForm;
