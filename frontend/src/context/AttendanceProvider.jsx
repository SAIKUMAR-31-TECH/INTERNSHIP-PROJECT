import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AttendanceContext } from './AttendanceContext.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create a custom axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

export const AttendanceProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('attendance-tracker-theme');
    return savedTheme || 'light';
  });

  // Auth States
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('attendance-tracker-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('attendance-tracker-token') || null;
  });

  // Core Data States
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-dismiss notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sync Theme to HTML and localStorage
  useEffect(() => {
    localStorage.setItem('attendance-tracker-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Trigger alert helper
  const triggerNotification = useCallback((type, message) => {
    setNotification({ type, message });
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Logout handler
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setEmployees([]);
    setRecords([]);
    localStorage.removeItem('attendance-tracker-token');
    localStorage.removeItem('attendance-tracker-user');
    triggerNotification('warning', 'Logged out successfully.');
  }, [triggerNotification]);

  // Configure Axios token interceptor
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiry / 401s
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Automatic logout on token expiry
          logout();
          triggerNotification('error', 'Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [token, logout, triggerNotification]);

  // Fetch Employees from Backend
  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/employees');
      if (res.data && res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      triggerNotification('error', err.response?.data?.message || 'Error fetching employees');
    } finally {
      setLoading(false);
    }
  }, [token, triggerNotification]);

  // Fetch Attendance Records from Backend
  const fetchAttendance = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/attendance');
      if (res.data && res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance records:', err);
      triggerNotification('error', err.response?.data?.message || 'Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  }, [token, triggerNotification]);

  // Load Initial Data on token change
  useEffect(() => {
    const loadData = async () => {
      if (token) {
        await fetchEmployees();
        await fetchAttendance();
      } else {
        setEmployees([]);
        setRecords([]);
      }
    };
    loadData();
  }, [token, fetchEmployees, fetchAttendance]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: userToken, ...userData } = res.data;
        
        // Save to state
        setToken(userToken);
        setUser(userData);
        
        // Sync to localStorage
        localStorage.setItem('attendance-tracker-token', userToken);
        localStorage.setItem('attendance-tracker-user', JSON.stringify(userData));
        
        triggerNotification('success', `Welcome back, ${userData.name}!`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      triggerNotification('error', err.response?.data?.message || 'Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data && res.data.success) {
        const { token: userToken, ...userData } = res.data;
        
        // Save to state
        setToken(userToken);
        setUser(userData);
        
        // Sync to localStorage
        localStorage.setItem('attendance-tracker-token', userToken);
        localStorage.setItem('attendance-tracker-user', JSON.stringify(userData));
        
        triggerNotification('success', `Account created! Welcome, ${userData.name}.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Registration error:', err);
      triggerNotification('error', err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };



  // Roster Management (CRUD)
  const addEmployee = async (employeeId, name, email, department, designation, phone, joiningDate, status) => {
    if (!employeeId.trim() || !name.trim() || !email.trim()) {
      triggerNotification('error', 'Employee ID, Name and Email are required.');
      return false;
    }
    
    try {
      setLoading(true);
      const res = await api.post('/employees', {
        employeeId: employeeId.trim(),
        name: name.trim(),
        email: email.trim(),
        department: department?.trim() || 'General',
        designation: designation?.trim() || 'Associate',
        phone: phone?.trim() || '',
        joiningDate,
        status: status || 'Active',
      });

      if (res.data && res.data.success) {
        setEmployees((prev) => [...prev, res.data.data]);
        triggerNotification('success', `Employee "${name}" added successfully.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Add employee error:', err);
      triggerNotification('error', err.response?.data?.message || 'Failed to add employee');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      const res = await api.delete(`/employees/${id}`);
      if (res.data && res.data.success) {
        const employee = employees.find((emp) => emp.id === id);
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        // Cascaded delete in UI as well
        setRecords((prev) => prev.filter((rec) => rec.employeeId !== id));
        triggerNotification('warning', employee ? `Removed "${employee.name}" and all their records.` : 'Employee removed.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Delete employee error:', err);
      triggerNotification('error', err.response?.data?.message || 'Failed to delete employee');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id, employeeId, name, email, department, designation, phone, joiningDate, status) => {
    if (!employeeId.trim() || !name.trim() || !email.trim()) {
      triggerNotification('error', 'Employee ID, Name and Email are required.');
      return false;
    }

    try {
      setLoading(true);
      const res = await api.put(`/employees/${id}`, {
        employeeId: employeeId.trim(),
        name: name.trim(),
        email: email.trim(),
        department: department?.trim() || 'General',
        designation: designation?.trim() || 'Associate',
        phone: phone?.trim() || '',
        joiningDate,
        status: status || 'Active',
      });

      if (res.data && res.data.success) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? res.data.data : emp))
        );
        triggerNotification('success', `Employee "${name}" updated successfully.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update employee error:', err);
      triggerNotification('error', err.response?.data?.message || 'Failed to update employee');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Attendance Management (CRUD)
  const addRecord = async (employeeId, date, status) => {
    if (!employeeId || !date || !status) {
      triggerNotification('error', 'All fields are required to mark attendance.');
      return false;
    }

    try {
      setLoading(true);
      const res = await api.post('/attendance', { employeeId, date, status });
      if (res.data && res.data.success) {
        const newRecord = res.data.data;
        setRecords((prev) => [newRecord, ...prev]);
        const emp = employees.find((e) => e.id === employeeId);
        triggerNotification(
          'success',
          `Marked ${emp ? emp.name : 'Employee'} as ${status} on ${date}.`
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Add attendance error:', err);
      triggerNotification('error', err.response?.data?.message || 'Failed to add attendance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (id, employeeId, date, status) => {
    if (!employeeId || !date || !status) {
      triggerNotification('error', 'All fields are required.');
      return false;
    }

    try {
      setLoading(true);
      const res = await api.put(`/attendance/${id}`, { employeeId, date, status });
      if (res.data && res.data.success) {
        const updatedRecord = res.data.data;
        setRecords((prev) =>
          prev.map((rec) => (rec.id === id ? updatedRecord : rec))
        );
        triggerNotification('success', 'Attendance record updated successfully.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update attendance error:', err);
      triggerNotification('error', err.response?.data?.message || 'Failed to update attendance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    try {
      setLoading(true);
      const res = await api.delete(`/attendance/${id}`);
      if (res.data && res.data.success) {
        setRecords((prev) => prev.filter((rec) => rec.id !== id));
        triggerNotification('warning', 'Attendance record deleted.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Delete attendance error:', err);
      triggerNotification('error', err.response?.data?.message || 'Failed to delete attendance record');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveBulkAttendance = async (date, recordsList) => {
    try {
      setLoading(true);
      const res = await api.post('/attendance/bulk', { date, records: recordsList });
      if (res.data && res.data.success) {
        await fetchAttendance();
        triggerNotification('success', 'Attendance saved successfully.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Bulk save attendance error:', err);
      triggerNotification('error', err.response?.data?.message || 'Failed to save attendance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        token,
        login,
        register,
        logout,
        employees,
        records,
        loading,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addRecord,
        updateRecord,
        deleteRecord,
        saveBulkAttendance,
        notification,
        triggerNotification,
        api, // Export axios instance for CSV/PDF report downloading
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
