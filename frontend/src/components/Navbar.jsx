import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'patient':
        return '/patient/appointments';
      case 'doctor':
        return '/doctor/schedule';
      case 'assistant':
        return '/assistant/payments';
      case 'admin':
      case 'super_admin':
        return '/admin/analytics';
      default:
        return '/';
    }
  };

  const authButtons = isAuthenticated ? (
    <>
      <Link to={getDashboardPath()} className="nav-link">
        Dashboard
      </Link>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginLeft: '1rem',
          borderLeft: '1px solid var(--border)',
          paddingLeft: '1rem',
        }}
      >
        <span className="nav-user-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {user.name}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          title="Log Out"
          style={{ padding: '0.4rem 0.65rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  ) : (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Link to="/login" className="btn btn-outline btn-sm">
        Sign In
      </Link>
      <Link to="/register" className="btn btn-primary btn-sm">
        Register
      </Link>
    </div>
  );

  return (
    <header className={`navbar ${mobileOpen ? 'nav-mobile-open' : ''}`}>
      <Link to="/" className="brand">
        <Stethoscope size={28} style={{ color: 'var(--primary)' }} />
        <span>
          Doctor<span className="brand-accent">Hub</span>
        </span>
      </Link>

      <button
        type="button"
        className="navbar-mobile-toggle"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`nav-links ${mobileOpen ? 'nav-open' : ''}`}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link
          to="/doctors"
          className={`nav-link ${location.pathname.startsWith('/doctors') ? 'active' : ''}`}
        >
          Find Doctors
        </Link>
        {authButtons}
      </nav>
    </header>
  );
};

export default Navbar;
