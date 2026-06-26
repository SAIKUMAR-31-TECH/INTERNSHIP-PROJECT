import { useContext, useState } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { 
  CalendarCheck, 
  LayoutDashboard, 
  UserCheck, 
  History, 
  BarChart3, 
  Users, 
  Sun, 
  Moon, 
  Menu, 
  X,
  LogOut,
  Settings
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme, user, logout } = useContext(AttendanceContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Manager Workspace navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'roster', label: 'Employee Management', icon: Users },
    { id: 'mark', label: 'Attendance Panel', icon: UserCheck },
    { id: 'history', label: 'Attendance History', icon: History },
    { id: 'summary', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo */}
        <div className="nav-logo" onClick={() => handleNavClick('dashboard')}>
          <CalendarCheck size={28} strokeWidth={2.5} />
          <span>{import.meta.env.VITE_APP_TITLE || 'TrackFlow'}</span>
        </div>

        {/* Desktop Links (Hidden, handled by CSS) */}
        <div className="nav-links" style={{ display: 'none' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Navigation Flex Container */}
        <div className="nav-desktop-flex" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="desktop-links-only" style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  style={{ display: 'inline-flex' }}
                >
                  <Icon size={18} />
                  <span style={{ marginLeft: '0.5rem' }} className="nav-text">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Divider */}
          <span style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }}></span>

          {/* User Info & Logout Button */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="user-profile-nav">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }} className="user-text-details">
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</span>
              </div>
              <div className="roster-avatar" style={{ width: '2rem', height: '2rem', margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>
                {getInitials(user.name)}
              </div>
              <button 
                onClick={logout} 
                className="theme-toggle"
                title="Logout"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="theme-toggle mobile-menu-toggle"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" style={{
          position: 'absolute',
          top: '4.5rem',
          left: 0,
          right: 0,
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 99,
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Mobile Navigation Links */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Icon size={20} />
                <span style={{ marginLeft: '0.75rem' }}>{item.label}</span>
              </button>
            );
          })}

          <span style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }}></span>

          {/* Mobile User Details */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="roster-avatar" style={{ width: '2rem', height: '2rem', margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {getInitials(user.name)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }} 
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: 'auto' }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add CSS directly for showing/hiding items based on screens since we're using vanilla CSS */}
      <style>{`
        .nav-desktop-flex .desktop-links-only {
          display: flex !important;
        }
        .nav-desktop-flex .mobile-menu-toggle {
          display: none !important;
        }
        
        @media (max-width: 900px) {
          .nav-desktop-flex .desktop-links-only {
            display: none !important;
          }
          .nav-desktop-flex .mobile-menu-toggle {
            display: flex !important;
          }
          .user-profile-nav {
            display: none !important;
          }
        }

        @media (min-width: 901px) {
          .mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
