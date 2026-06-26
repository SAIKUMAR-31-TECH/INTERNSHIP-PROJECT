import { useState, useContext } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { Users, UserPlus, Trash2, ShieldAlert, Mail, Briefcase, Award, Phone, Eye, Pencil, X, Filter, Search, Calendar, ShieldCheck } from 'lucide-react';

const EmployeeManager = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, triggerNotification } = useContext(AttendanceContext);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  
  // Form states (Add New Employee)
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Software Engineer');
  const [phone, setPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Active');

  // View & Edit Modal States
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit Form States
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('Engineering');
  const [editDesignation, setEditDesignation] = useState('Software Engineer');
  const [editPhone, setEditPhone] = useState('');
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(term)) ||
      (emp.designation && emp.designation.toLowerCase().includes(term));

    return matchesDept && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId.trim() || !name.trim() || !email.trim()) return;

    if (phone.trim() && phone.trim().length !== 10) {
      triggerNotification('error', 'Phone number must be exactly 10 digits.');
      return;
    }

    // Check duplicate employee ID in local state
    const duplicateId = employees.some(emp => emp.employeeId === employeeId.trim());
    if (duplicateId) {
      triggerNotification('error', `Employee ID "${employeeId}" already exists.`);
      return;
    }

    const success = await addEmployee(
      employeeId.trim(),
      name.trim(),
      email.trim(),
      department.trim(),
      designation.trim(),
      phone.trim(),
      joiningDate,
      status
    );
    
    if (success) {
      setEmployeeId('');
      setName('');
      setEmail('');
      setDepartment('Engineering');
      setDesignation('Software Engineer');
      setPhone('');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setStatus('Active');
    }
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setEditEmployeeId(emp.employeeId || '');
    setEditName(emp.name);
    setEditEmail(emp.email);
    setEditDepartment(emp.department);
    setEditDesignation(emp.designation);
    setEditPhone(emp.phone || emp.mobile || '');
    setEditJoiningDate(emp.joiningDate ? emp.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditStatus(emp.status || 'Active');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editEmployeeId.trim() || !editName.trim() || !editEmail.trim()) return;

    if (editPhone.trim() && editPhone.trim().length !== 10) {
      triggerNotification('error', 'Phone number must be exactly 10 digits.');
      return;
    }

    // Check duplicate employee ID in local state
    const duplicateId = employees.some(
      emp => emp.employeeId === editEmployeeId.trim() && emp.id !== selectedEmployee.id
    );
    if (duplicateId) {
      triggerNotification('error', `Employee ID "${editEmployeeId}" already exists.`);
      return;
    }

    const success = await updateEmployee(
      selectedEmployee.id,
      editEmployeeId.trim(),
      editName.trim(),
      editEmail.trim(),
      editDepartment.trim(),
      editDesignation.trim(),
      editPhone.trim(),
      editJoiningDate,
      editStatus
    );

    if (success) {
      setIsEditOpen(false);
      setSelectedEmployee(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr',
      gap: '1.5rem',
    }} className="summary-container">
      
      {/* Left Column: Add Employee Form */}
      <div className="card" style={{ height: 'fit-content' }}>
        <h3 className="card-title">
          <UserPlus size={20} style={{ color: 'var(--primary)' }} />
          Enroll New Employee
        </h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Add an employee to the organizational roster.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Employee ID */}
          <div className="form-group">
            <label htmlFor="new-emp-id" className="form-label">
              Employee ID
            </label>
            <input
              type="text"
              id="new-emp-id"
              placeholder="e.g. EMP001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="form-input"
              maxLength={20}
              required
            />
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="new-emp-name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="new-emp-name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              maxLength={40}
              required
            />
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="new-emp-email" className="form-label">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                id="new-emp-email"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          {/* Department */}
          <div className="form-group">
            <label htmlFor="new-emp-dept" className="form-label">
              Department
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={14} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <select
                id="new-emp-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-select"
                style={{ paddingLeft: '2.25rem' }}
              >
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
          </div>

          {/* Designation */}
          <div className="form-group">
            <label htmlFor="new-emp-desig" className="form-label">
              Designation
            </label>
            <div style={{ position: 'relative' }}>
              <Award size={14} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="text"
                id="new-emp-desig"
                placeholder="e.g. Software Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                maxLength={40}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="new-emp-phone" className="form-label">
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="tel"
                id="new-emp-phone"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                maxLength={10}
              />
            </div>
          </div>

          {/* Joining Date */}
          <div className="form-group">
            <label htmlFor="new-emp-joining" className="form-label">
              Joining Date
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar size={14} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="date"
                id="new-emp-joining"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="new-emp-status" className="form-label">
              Status
            </label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={14} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <select
                id="new-emp-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
                style={{ paddingLeft: '2.25rem' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
            disabled={!employeeId.trim() || !name.trim() || !email.trim()}
          >
            Add Employee
          </button>
        </form>

        <div className="alert-notification warning" style={{ marginTop: '1.5rem', fontSize: '0.8rem', padding: '0.75rem' }}>
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span>
            Note: Deleting an employee later will permanently erase all associated attendance logs.
          </span>
        </div>
      </div>

      {/* Right Column: Roster Directory */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Active Roster Directory</span>
          <span style={{ 
            fontSize: '0.8rem', 
            padding: '0.15rem 0.5rem', 
            backgroundColor: 'var(--bg-secondary)', 
            borderRadius: '50px',
            fontWeight: 700
          }}>
            {filteredEmployees.length} of {employees.length}
          </span>
        </h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Manage your organizational registry below.
        </p>

        {employees.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {/* Search Bar */}
            <div className="search-wrapper" style={{ width: '100%' }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, ID, or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input search-input"
              />
            </div>

            {/* Department Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <Filter size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Filter Dept:
              </span>
              <select
                id="dept-filter"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{
                  margin: 0,
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.85rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  flexGrow: 1,
                  outline: 'none',
                  fontWeight: 500,
                }}
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
          </div>
        )}

        {employees.length === 0 ? (
          <div className="empty-state" style={{ flexGrow: 1 }}>
            <Users size={40} className="empty-state-icon" />
            <h4 className="empty-state-title">No Active Roster</h4>
            <p>Add some team members using the form to populate your database.</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state" style={{ flexGrow: 1, padding: '2rem 1rem' }}>
            <Users size={40} className="empty-state-icon" style={{ opacity: 0.5 }} />
            <h4 className="empty-state-title">No Employees Found</h4>
            <p>There are no employees registered matching your search filter.</p>
          </div>
        ) : (
          <div className="roster-list" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '560px' }}>
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="roster-item" style={{ padding: '0.85rem 1.25rem' }}>
                <div className="roster-item-info" style={{ gap: '1rem' }}>
                  <div className="roster-avatar" title={emp.name}>
                    {getInitials(emp.name)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 650, fontSize: '0.95rem' }}>{emp.name}</span>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.65rem', fontWeight: 700 }}>
                        {emp.employeeId || 'N/A'}
                      </span>
                      <span className={`badge ${emp.status === 'Active' ? 'present' : 'absent'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                        {emp.status || 'Active'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 500 }}>Email:</span> {emp.email}
                    </span>
                    {(emp.phone || emp.mobile) && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                        <span style={{ fontWeight: 500 }}>Phone:</span> {emp.phone || emp.mobile}
                      </span>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600 }}>
                        {emp.department}
                      </span>
                      <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600 }}>
                        {emp.designation}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {/* View Details Button */}
                  <button
                    onClick={() => handleOpenView(emp)}
                    className="btn btn-secondary btn-icon-only"
                    style={{ width: '2.25rem', height: '2.25rem' }}
                    title="View Details"
                    aria-label={`View details of ${emp.name}`}
                  >
                    <Eye size={15} />
                  </button>

                  {/* Edit Employee Button */}
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="btn btn-secondary btn-icon-only"
                    style={{ width: '2.25rem', height: '2.25rem' }}
                    title="Edit Details"
                    aria-label={`Edit details of ${emp.name}`}
                  >
                    <Pencil size={15} />
                  </button>

                  {/* Delete Employee Button */}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `WARNING: Are you sure you want to delete ${emp.name}? This will cascade delete ALL their attendance history logs permanently!`
                        )
                      ) {
                        deleteEmployee(emp.id);
                      }
                    }}
                    className="btn btn-danger btn-icon-only"
                    style={{ width: '2.25rem', height: '2.25rem' }}
                    title="Remove Employee"
                    aria-label={`Delete ${emp.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Employee Modal */}
      {isViewOpen && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setIsViewOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Users size={20} style={{ color: 'var(--primary)' }} />
                <span>Employee Profile Details</span>
              </h3>
              <button className="modal-close" onClick={() => setIsViewOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="roster-avatar" style={{ width: '3.5rem', height: '3.5rem', fontSize: '1.5rem' }}>
                  {getInitials(selectedEmployee.name)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{selectedEmployee.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedEmployee.designation}</span>
                </div>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: 0 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Employee ID:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{selectedEmployee.employeeId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Email:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedEmployee.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Department:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedEmployee.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Designation:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedEmployee.designation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedEmployee.phone || selectedEmployee.mobile || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Joining Date:</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Status:</span>
                  <span className={`badge ${selectedEmployee.status === 'Active' ? 'present' : 'absent'}`}>
                    {selectedEmployee.status || 'Active'}
                  </span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => setIsViewOpen(false)} style={{ marginTop: '0.5rem' }}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditOpen && selectedEmployee && (
        <div className="modal-overlay" onClick={() => { setIsEditOpen(false); setSelectedEmployee(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Pencil size={18} style={{ color: 'var(--primary)' }} />
                <span>Edit Employee Details</span>
              </h3>
              <button className="modal-close" onClick={() => { setIsEditOpen(false); setSelectedEmployee(null); }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Employee ID */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-id" className="form-label">Employee ID</label>
                <input
                  type="text"
                  id="edit-emp-id"
                  placeholder="e.g. EMP001"
                  value={editEmployeeId}
                  onChange={(e) => setEditEmployeeId(e.target.value)}
                  className="form-input"
                  maxLength={20}
                  required
                />
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="edit-emp-name"
                  placeholder="e.g. Rahul Sharma"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="form-input"
                  maxLength={40}
                  required
                />
              </div>

              {/* Email Address */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-email" className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="email"
                    id="edit-emp-email"
                    placeholder="e.g. rahul@example.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-dept" className="form-label">Department</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={14} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <select
                    id="edit-emp-dept"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="form-select"
                    style={{ paddingLeft: '2.25rem' }}
                  >
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
              </div>

              {/* Designation */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-desig" className="form-label">Designation</label>
                <div style={{ position: 'relative' }}>
                  <Award size={14} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="text"
                    id="edit-emp-desig"
                    placeholder="e.g. Software Engineer"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    maxLength={40}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-phone" className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="tel"
                    id="edit-emp-phone"
                    placeholder="e.g. 9876543210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Joining Date */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-joining" className="form-label">Joining Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="date"
                    id="edit-emp-joining"
                    value={editJoiningDate}
                    onChange={(e) => setEditJoiningDate(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.25rem' }}
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="edit-emp-status" className="form-label">Status</label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={14} style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <select
                    id="edit-emp-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="form-select"
                    style={{ paddingLeft: '2.25rem' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsEditOpen(false); setSelectedEmployee(null); }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, margin: 0 }}
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

export default EmployeeManager;
