import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, ShieldAlert, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user.role);
    }
  }, [isAuthenticated, user]);

  // Check URL parameters for session expiry warnings
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      setInfo('Your session has expired. Please sign in again to continue.');
    }
  }, [location]);

  const redirectUser = (role) => {
    switch (role) {
      case 'patient':
        navigate('/patient/appointments');
        break;
      case 'doctor':
        navigate('/doctor/schedule');
        break;
      case 'assistant':
        navigate('/assistant/payments');
        break;
      case 'admin':
      case 'super_admin':
        navigate('/admin/analytics');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials fields.');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    const result = await login(email, password);

    if (result.success) {
      redirectUser(result.role);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Activity size={28} />
          </div>
          <h2 className="h2" style={{ fontSize: '1.6rem' }}>Welcome Back</h2>
          <p className="text-small" style={{ marginTop: '0.25rem' }}>Sign in to manage your medical consultations.</p>
        </div>

        {info && <div className="alert alert-success" style={{ fontSize: '0.85rem' }}>{info}</div>}
        {error && (
          <div className="alert alert-error" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start' }}>
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="btn-link">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
