import { useState, useContext } from 'react';
import { AttendanceProvider } from './context/AttendanceProvider';
import { AttendanceContext } from './context/AttendanceContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AttendanceForm from './components/AttendanceForm';
import AttendanceTable from './components/AttendanceTable';
import Summary from './components/Summary';
import EmployeeManager from './components/EmployeeManager';
import Login from './components/Login';
import { CheckCircle2, AlertOctagon, AlertCircle } from 'lucide-react';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, notification } = useContext(AttendanceContext);

  // If role is Employee, enforce dashboard tab
  if (user && user.role === 'Employee' && activeTab !== 'dashboard') {
    setActiveTab('dashboard');
  }

  // Helper to render the active tab content
  const renderContent = () => {
    // Role-based route protection on frontend
    const isAdmin = user && user.role === 'Admin';

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'mark':
        return isAdmin ? <AttendanceForm /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'history':
        return isAdmin ? <AttendanceTable /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'summary':
        return isAdmin ? <Summary /> : <Dashboard setActiveTab={setActiveTab} />;
      case 'roster':
        return isAdmin ? <EmployeeManager /> : <Dashboard setActiveTab={setActiveTab} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  // Helper to choose the right notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'error':
        return <AlertOctagon size={18} />;
      case 'warning':
      default:
        return <AlertCircle size={18} />;
    }
  };

  // If user is not logged in, show Login/Register view
  if (!user) {
    return (
      <div className="app-container">
        {notification && (
          <div 
            className={`alert-notification ${notification.type}`}
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 1000,
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '400px',
            }}
          >
            {getNotificationIcon(notification.type)}
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{notification.message}</span>
          </div>
        )}
        <Login />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel */}
      <main className="main-content">
        {/* Floating/Toast Notification Banner */}
        {notification && (
          <div 
            className={`alert-notification ${notification.type}`}
            style={{
              position: 'fixed',
              top: '5.5rem',
              right: '1.5rem',
              zIndex: 1000,
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '400px',
            }}
          >
            {getNotificationIcon(notification.type)}
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{notification.message}</span>
          </div>
        )}

        {/* Dynamic View Panel */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}

export default App;
