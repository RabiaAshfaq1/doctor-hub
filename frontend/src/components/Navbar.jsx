import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'patient': return '/patient/appointments';
      case 'doctor': return '/doctor/schedule';
      case 'assistant': return '/assistant/payments';
      case 'admin':
      case 'super_admin':
        return '/admin/analytics';
      default: return '/';
    }
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <Activity className="brand-accent" size={28} />
        <span>Doctor<span className="brand-accent">Hub</span></span>
      </Link>

      <nav className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/doctors" className={`nav-link ${location.pathname.startsWith('/doctors') ? 'active' : ''}`}>
          Find Doctors
        </Link>

        {isAuthenticated ? (
          <>
            <Link to={getDashboardPath()} className="nav-link">
              Dashboard
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                <span className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginTop: '0.1rem' }}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Log Out" style={{ padding: '0.4rem' }}>
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', marginLeft: '1rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
