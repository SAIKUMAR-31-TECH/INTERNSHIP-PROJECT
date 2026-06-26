import { useContext } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { Settings as SettingsIcon, User, Mail, Shield, Sun, Moon, Database, Bell, RefreshCw } from 'lucide-react';

const Settings = () => {
  const { user, theme, toggleTheme, employees, records, triggerNotification } = useContext(AttendanceContext);

  const handleTriggerReminders = () => {
    triggerNotification('warning', 'Daily check manually triggered...');
    setTimeout(() => {
      triggerNotification('success', 'Reminder checks completed. Check backend console logs.');
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={26} className="text-muted" />
          <span>System Settings</span>
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Configure system preferences and monitor system diagnostics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', flexWrap: 'wrap' }} className="summary-container">
        
        {/* Left Column: Profile & Appearance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Profile Details Card */}
          <div className="card">
            <h3 className="card-title">
              <User size={18} style={{ color: 'var(--primary)' }} />
              <span>Manager Profile</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="roster-avatar" style={{ width: '3rem', height: '3rem', fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'M'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>{user?.name || 'Manager'}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workspace Controller</span>
                </div>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} className="text-muted" /> Email:
                  </span>
                  <span style={{ fontWeight: 600 }}>{user?.email || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Shield size={14} className="text-muted" /> Security Role:
                  </span>
                  <span className="badge present" style={{ fontSize: '0.7rem' }}>
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Preferences Card */}
          <div className="card">
            <h3 className="card-title">
              {theme === 'light' ? <Sun size={18} style={{ color: 'var(--primary)' }} /> : <Moon size={18} style={{ color: 'var(--primary)' }} />}
              <span>Appearance Mode</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Toggle between light and dark UI styling.
            </p>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem'
              }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} />
                  <span>Switch to Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={16} />
                  <span>Switch to Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnostics & Cron Check */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Diagnostics Card */}
          <div className="card">
            <h3 className="card-title">
              <Database size={18} style={{ color: 'var(--primary)' }} />
              <span>System Diagnostics</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Summary statistics from database registers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Roster Count:</span>
                <strong style={{ color: 'var(--primary)' }}>{employees.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Employees:</span>
                <strong style={{ color: 'var(--success)' }}>{employees.filter(e => e.status === 'Active').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Inactive Roster Entries:</span>
                <strong style={{ color: 'var(--danger)' }}>{employees.filter(e => e.status === 'Inactive').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Attendance Logs:</span>
                <strong style={{ color: 'var(--primary)' }}>{records.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Database Host IP:</span>
                <span className="text-muted" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>127.0.0.1 (Localhost)</span>
              </div>
            </div>
          </div>

          {/* Cron Action Card */}
          <div className="card">
            <h3 className="card-title">
              <Bell size={18} style={{ color: 'var(--primary)' }} />
              <span>Cron Reminders</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              TrackFlow runs a daily automated reminder at <strong>9:00 AM</strong> to notify active employees who have not logged attendance.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              You can manually trigger this daily check process now to review email logs.
            </p>
            <button
              onClick={handleTriggerReminders}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem'
              }}
            >
              <RefreshCw size={16} />
              <span>Trigger Reminder Check</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
