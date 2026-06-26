import { useState, useContext } from 'react';
import { AttendanceContext } from '../context/AttendanceContext';
import { CalendarCheck, Mail, Lock, User, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login, register, loading } = useContext(AttendanceContext);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee'); // Default role
  const [errorMsg, setErrorMsg] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Employee');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter all required fields.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    let success;
    if (isLogin) {
      success = await login(email.trim(), password);
    } else {
      success = await register(name.trim(), email.trim(), password, role);
    }

    if (!success) {
      setErrorMsg('Operation failed. Please verify credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--surface) 100%)',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-xl)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--surface)',
      }}>
        {/* Logo and Brand */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-light)',
            padding: '0.75rem',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CalendarCheck size={36} strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginTop: '0.5rem',
          }}>TrackFlow</h1>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}>
            {isLogin 
              ? 'Sign in to access your attendance workspace' 
              : 'Create a new account to join the roster'}
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="alert-notification error" style={{
            padding: '0.75rem',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            width: '100%',
          }}>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Name Field (Register Mode Only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name-input" className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="text"
                  id="name-input"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email-input" className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                id="email-input"
                placeholder="e.g. rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password-input" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                id="password-input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Role Field (Register Mode Only) */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="role-select" className="form-label">Role</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={16} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select"
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="Employee">Employee (View own attendance only)</option>
                  <option value="Admin">Admin (Full system management)</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0.75rem',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{
                width: '18px',
                height: '18px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
            ) : null}
            <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        {/* Add standard animation style for spinner if needed */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Login;
