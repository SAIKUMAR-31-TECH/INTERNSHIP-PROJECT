import { useContext, useState } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  X
} from 'lucide-react';

const AttendanceTable = () => {
  const { 
    records, 
    employees, 
    updateRecord, 
    deleteRecord 
  } = useContext(AttendanceContext);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Edit Modal state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editError, setEditError] = useState('');

  // Open Edit Modal
  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditEmployeeId(record.employeeId);
    setEditDate(record.date);
    setEditStatus(record.status);
    setEditError('');
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditingRecord(null);
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    // Check duplicate (but exclude this record itself)
    const duplicate = records.some(
      (rec) => rec.employeeId === editEmployeeId && rec.date === editDate && rec.id !== editingRecord.id
    );

    if (duplicate) {
      const emp = employees.find((e) => e.id === editEmployeeId);
      setEditError(`Attendance already marked for ${emp ? emp.name : 'this employee'} on ${editDate}.`);
      return;
    }

    const success = updateRecord(editingRecord.id, editEmployeeId, editDate, editStatus);
    if (success) {
      closeEditModal();
    }
  };

  // Filter records based on search and filters
  const filteredRecords = records.filter((rec) => {
    const emp = employees.find((e) => e.id === rec.employeeId);
    const empName = emp ? emp.name.toLowerCase() : '';
    const matchesSearch = empName.includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'All' || rec.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Format date display
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  return (
    <div className="card" style={{ width: '100%' }}>
      <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
        Attendance History Logs
      </h3>

      {/* Search and Filters Bar */}
      <div className="table-actions-bar">
        {/* Search */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input search-input"
          />
        </div>

        {/* Filter Buttons */}
        <div className="filter-group">
          <button
            onClick={() => setStatusFilter('All')}
            className={`filter-btn ${statusFilter === 'All' ? 'active' : ''}`}
          >
            All Logs
          </button>
          <button
            onClick={() => setStatusFilter('Present')}
            className={`filter-btn ${statusFilter === 'Present' ? 'active' : ''}`}
          >
            Present
          </button>
          <button
            onClick={() => setStatusFilter('Absent')}
            className={`filter-btn ${statusFilter === 'Absent' ? 'active' : ''}`}
          >
            Absent
          </button>
          <button
            onClick={() => setStatusFilter('Leave')}
            className={`filter-btn ${statusFilter === 'Leave' ? 'active' : ''}`}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Table Data */}
      {filteredRecords.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-state-icon" />
          <h4 className="empty-state-title">No Records Found</h4>
          <p>Try resetting the status filter or searching for a different employee name.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => {
                const emp = employees.find((e) => e.id === rec.employeeId);
                const empName = emp ? emp.name : 'Unknown Employee';
                return (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600 }}>{empName}</td>
                    <td>{formatDate(rec.date)}</td>
                    <td>
                      <span className={`badge ${rec.status.toLowerCase()}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleEditClick(rec)}
                          className="btn btn-secondary btn-icon-only"
                          title="Edit Attendance"
                          aria-label="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the attendance for ${empName} on ${formatDate(rec.date)}?`)) {
                              deleteRecord(rec.id);
                            }
                          }}
                          className="btn btn-danger btn-icon-only"
                          title="Delete Attendance"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Edit Attendance Record</h3>
              <button onClick={closeEditModal} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              {/* Employee */}
              <div className="form-group">
                <label className="form-label">Employee Name</label>
                <select
                  value={editEmployeeId}
                  onChange={(e) => setEditEmployeeId(e.target.value)}
                  className="form-select"
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={editDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="status-chips">
                  <input
                    type="radio"
                    id="edit-present"
                    name="edit-status"
                    value="Present"
                    checked={editStatus === 'Present'}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="status-chip-input"
                  />
                  <label htmlFor="edit-present" className="status-chip present">
                    Present
                  </label>

                  <input
                    type="radio"
                    id="edit-absent"
                    name="edit-status"
                    value="Absent"
                    checked={editStatus === 'Absent'}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="status-chip-input"
                  />
                  <label htmlFor="edit-absent" className="status-chip absent">
                    Absent
                  </label>

                  <input
                    type="radio"
                    id="edit-leave"
                    name="edit-status"
                    value="Leave"
                    checked={editStatus === 'Leave'}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="status-chip-input"
                  />
                  <label htmlFor="edit-leave" className="status-chip leave">
                    Leave
                  </label>
                </div>
              </div>

              {/* Inner duplicate error handling */}
              {editError && (
                <div className="alert-notification error" style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
