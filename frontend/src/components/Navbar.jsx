import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ variant }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = variant === 'landing' || location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

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

  const headerClass = [
    'navbar',
    isLanding ? 'navbar-landing' : '',
    isLanding && scrolled ? 'navbar-scrolled' : '',
    mobileOpen ? 'nav-mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const authButtons = isAuthenticated ? (
    <>
      <Link to={getDashboardPath()} className={isLanding ? 'nav-link-landing' : 'nav-link'}>
        Dashboard
      </Link>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginLeft: isLanding ? 0 : '1rem',
          borderLeft: isLanding ? 'none' : '1px solid var(--border)',
          paddingLeft: isLanding ? 0 : '1rem',
        }}
      >
        <span className="nav-user-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {user.name}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className={isLanding ? 'btn-landing-outline' : 'btn btn-outline btn-sm'}
          title="Log Out"
          style={{ padding: '0.4rem 0.65rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </>
  ) : (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Link to="/login" className={isLanding ? 'btn-landing-outline' : 'btn btn-outline btn-sm'}>
        {isLanding ? 'Login' : 'Sign In'}
      </Link>
      <Link to="/register" className={isLanding ? 'btn-landing-primary' : 'btn btn-primary btn-sm'}>
        Register
      </Link>
    </div>
  );

  return (
    <header className={headerClass}>
      <Link to="/" className={isLanding ? 'brand-landing' : 'brand'}>
        <Stethoscope className={isLanding ? 'brand-icon' : ''} size={28} style={isLanding ? undefined : { color: 'var(--primary)' }} />
        {isLanding ? (
          <span>Doctor Hub</span>
        ) : (
          <span>
            Doctor<span className="brand-accent">Hub</span>
          </span>
        )}
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

      <nav className={`nav-links ${isLanding ? 'nav-links-landing' : ''} ${mobileOpen ? 'nav-open' : ''}`}>
        {!isLanding && (
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
        )}
        <Link
          to="/doctors"
          className={
            isLanding
              ? `nav-link-landing ${location.pathname.startsWith('/doctors') ? 'active' : ''}`
              : `nav-link ${location.pathname.startsWith('/doctors') ? 'active' : ''}`
          }
        >
          Find Doctors
        </Link>
        {authButtons}
      </nav>
    </header>
  );
};

export default Navbar;
