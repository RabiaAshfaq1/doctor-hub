import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, FilePlus, AlertTriangle } from 'lucide-react';

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);
  const navigate = useNavigate();

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/appointments/my');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      console.error('Error fetching doctor schedule:', err);
      setError('Could not retrieve schedule listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
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
        return <span className="badge badge-success">Paid</span>;
      case 'confirmed':
        return <span className="badge badge-success" style={{ fontWeight: 'bold', border: '1px solid var(--primary)' }}>Confirmed</span>;
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
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your clinical schedule...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2">My Schedule</h1>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
          Monitor clinical slots and patient booking sessions.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Calendar size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">No Appointments Listed</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            There are no booking records scheduled in your calendar.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Scheduled At</th>
                <th>Clinic timing</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.Patient?.User?.name}</div>
                    <div className="text-small" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', marginTop: '0.1rem' }}>
                      <Phone size={12} />
                      <span>{app.Patient?.User?.phone || 'No phone'}</span>
                    </div>
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
                  <td>{app.Clinic?.name}</td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => navigate(`/doctor/diagnosis?appointment_id=${app.id}&patient_id=${app.patient_id}&patient_name=${encodeURIComponent(app.Patient?.User?.name)}`)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <FilePlus size={14} />
                          <span>Diagnose</span>
                        </button>
                      )}

                      {(app.status === 'pending' || app.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="btn btn-outline btn-danger btn-sm"
                          disabled={cancelLoading === app.id}
                        >
                          {cancelLoading === app.id ? '...' : 'Cancel'}
                        </button>
                      )}
                      
                      {app.status === 'completed' && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', paddingRight: '0.5rem' }}>
                          <CheckCircle size={14} /> Completed
                        </span>
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

export default Schedule;
