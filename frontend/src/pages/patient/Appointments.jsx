import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { Calendar, Clock, User, IndianRupee, Upload, XCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Could not retrieve appointments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    setCancelLoading(appointmentId);
    try {
      const response = await api.patch(`/appointments/${appointmentId}/cancel`);
      if (response.data.success) {
        setAppointments(prev =>
          prev.map(app => (app.id === appointmentId ? { ...app, status: 'cancelled' } : app))
        );
      }
    } catch (err) {
      console.error('Cancel appointment error:', err);
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Awaiting Payment</span>;
      case 'payment_uploaded':
        return <span className="badge badge-info">Verifying Payment</span>;
      case 'payment_verified':
        return <span className="badge badge-success">Payment Approved</span>;
      case 'confirmed':
        return <span className="badge badge-success">Confirmed</span>;
      case 'completed':
        return <span className="badge badge-success" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>Completed</span>;
      case 'cancelled':
        return <span className="badge badge-error">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your consultation schedule...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="h2">My Appointments</h1>
          <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
            View and manage your scheduled clinical consultations.
          </p>
        </div>
        <Link to="/doctors" className="btn btn-primary btn-sm">
          Book New Consultation
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Calendar size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">No Appointments Scheduled</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            You haven't scheduled any appointments yet. Explore our doctors and find a practitioner.
          </p>
          <Link to="/doctors" className="btn btn-secondary">
            Find Doctors
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Clinic</th>
                <th>Scheduled At</th>
                <th>Consultation Fee</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.Doctor?.User?.name}</div>
                    <div className="text-small" style={{ fontSize: '0.8rem' }}>{app.Doctor?.specialization}</div>
                  </td>
                  <td>
                    <div>{app.Clinic?.name}</div>
                    <div className="text-small" style={{ fontSize: '0.8rem' }}>{app.Clinic?.city}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} style={{ color: 'var(--primary)' }} />
                      <span>{new Date(app.scheduled_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: 'var(--text-light)' }}>
                      <Clock size={14} />
                      <span style={{ fontSize: '0.8rem' }}>
                        {new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                      <IndianRupee size={14} style={{ color: 'var(--accent)' }} />
                      <span>{formatCurrency(app.Doctor?.consultation_fee)}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {app.status === 'pending' && (
                        <button
                          onClick={() => navigate(`/patient/payments?appointment_id=${app.id}`)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Upload size={14} />
                          <span>Pay Screen</span>
                        </button>
                      )}
                      
                      {(app.status === 'pending' || app.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="btn btn-outline btn-danger btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          disabled={cancelLoading === app.id}
                        >
                          <XCircle size={14} />
                          <span>{cancelLoading === app.id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                      
                      {app.status === 'completed' && (
                        <button
                          onClick={() => navigate('/patient/history')}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <FileText size={14} />
                          <span>View History</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Simple import scope resolving
import { FileText } from 'lucide-react';

export default Appointments;
