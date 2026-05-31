import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Image, User, Calendar, IndianRupee, Eye, ZoomIn } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import api from '../../api/api';

const PaymentsQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state for zooming screenshot
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments/my');
      if (response.data.success) {
        // Filter appointments that have payment uploaded and status 'payment_uploaded'
        const queue = response.data.appointments.filter(
          (app) => app.status === 'payment_uploaded' && app.Payment
        );
        setAppointments(queue);
      }
    } catch (err) {
      console.error('Error fetching verification queue:', err);
      setError('Could not retrieve pending payment queue records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleVerify = async (paymentId) => {
    if (!window.confirm('Confirm receipt matches consultation fee. Verify and approve slot?')) return;
    setActionLoading(paymentId);
    try {
      const response = await api.patch(`/payments/${paymentId}/verify`);
      if (response.data.success) {
        setAppointments((prev) => prev.filter((app) => app.Payment.id !== paymentId));
        alert('Payment verified successfully. Appointment auto-confirmed.');
      }
    } catch (err) {
      console.error('Verify payment failed:', err);
      alert(err.response?.data?.message || 'Error verifying receipt.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment screenshot? This cancels the appointment.')) return;
    setActionLoading(paymentId);
    try {
      const response = await api.patch(`/payments/${paymentId}/reject`);
      if (response.data.success) {
        setAppointments((prev) => prev.filter((app) => app.Payment.id !== paymentId));
        alert('Payment rejected. Appointment has been cancelled.');
      }
    } catch (err) {
      console.error('Reject payment failed:', err);
      alert(err.response?.data?.message || 'Error rejecting receipt.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to resolve absolute upload URLs
  const getBackendUrl = () => {
    const defaultBackend = 'http://localhost:5000';
    const envUrl = import.meta.env.VITE_API_URL || '';
    if (envUrl.includes('/api')) {
      return envUrl.split('/api')[0];
    }
    return defaultBackend;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading verification queue...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2">Verification Queue</h1>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
          Moderate uploaded payment screenshot receipts and authorize clinical slot validation.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Clock size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">Queue is Empty</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            There are no clinical sessions currently awaiting payment receipt moderation.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Scheduled Session</th>
                <th>Consultation Fee</th>
                <th>Payment Slip Proof</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((app) => {
                const imageUrl = `${getBackendUrl()}${app.Payment.screenshot_url}`;
                return (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.Patient?.User?.name}</div>
                      <div className="text-small" style={{ fontSize: '0.8rem' }}>{app.Patient?.User?.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} style={{ color: 'var(--primary)' }} />
                        <span>{new Date(app.scheduled_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                        <Clock size={14} />
                        <span>{new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                        <IndianRupee size={14} style={{ color: 'var(--accent)' }} />
                        <span>{formatCurrency(app.Doctor?.consultation_fee)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={imageUrl}
                          alt="Slip Proof"
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer' }}
                          onClick={() => setActiveReceipt(imageUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(imageUrl)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', padding: '0.35rem 0.5rem', gap: '0.25rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleVerify(app.Payment.id)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          disabled={actionLoading !== null}
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(app.Payment.id)}
                          className="btn btn-outline btn-danger btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          disabled={actionLoading !== null}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Zoom Receipt Modal */}
      {activeReceipt && (
        <div className="modal-overlay" onClick={() => setActiveReceipt(null)}>
          <div className="modal-content" style={{ maxWidth: '600px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="h3">Receipt Slip Screenshot</h3>
              <button onClick={() => setActiveReceipt(null)} className="modal-close">×</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <img
                src={activeReceipt}
                alt="Zoomed slip proof"
                style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
              />
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveReceipt(null)} className="btn btn-secondary btn-sm">Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsQueue;
