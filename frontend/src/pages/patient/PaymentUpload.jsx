import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../api/api';
import { Upload, IndianRupee, Calendar, Clock, Image, ArrowLeft, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const PaymentUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState('');
  
  // File upload state
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Extract appointment ID from query parameters
  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const response = await api.get('/appointments/my');
        if (response.data.success) {
          // Only show pending appointments where a payment is needed
          const pending = response.data.appointments.filter(app => app.status === 'pending');
          setAppointments(pending);

          const searchParams = new URLSearchParams(location.search);
          const urlAppId = searchParams.get('appointment_id');
          if (urlAppId) {
            setSelectedAppId(urlAppId);
          } else if (pending.length > 0) {
            setSelectedAppId(pending[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching pending appointments:', err);
        setError('Failed to fetch pending appointment list.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingAppointments();
  }, [location]);

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check size limit: 5MB (5 * 1024 * 1024 bytes)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size limit exceeded. Maximum file size allowed is 5MB.');
      e.target.value = null;
      return;
    }

    // Check mime-type: must be an image
    if (!selectedFile.type.startsWith('image/')) {
      setError('Only image files are allowed! (PNG, JPEG, GIF, WebP)');
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      setError('Please select a pending appointment.');
      return;
    }
    if (!file) {
      setError('Please select a screenshot image of your payment proof.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('appointment_id', selectedAppId);
      formData.append('screenshot', file);

      // Hit our backend upload API
      const response = await api.post('/payments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Payment screenshot uploaded successfully! Re-directing to schedule...');
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 2000);
      }
    } catch (err) {
      console.error('Upload payment failed:', err);
      setError(err.response?.data?.message || 'Failed to upload payment proof screenshot.');
    } finally {
      setUploading(false);
    }
  };

  const activeApp = appointments.find(app => app.id === selectedAppId);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Resolving pending payments...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/patient/appointments" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Appointments
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <h2 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Upload size={24} style={{ color: 'var(--primary)' }} />
          <span>Upload Payment Proof</span>
        </h2>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>
          Consultation fees are paid via bank transfer. Upload your transfer screenshot to confirm your slot.
        </p>

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
            <p>You have no appointments currently awaiting payment.</p>
            <Link to="/doctors" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              Book Appointment
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Select Pending Appointment</label>
              <select
                className="form-control"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                required
              >
                {appointments.map(app => (
                  <option key={app.id} value={app.id}>
                    With {app.Doctor?.User?.name} on {new Date(app.scheduled_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Display detail card of selected appointment */}
            {activeApp && (
              <div style={{
                backgroundColor: 'var(--background)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                border: '1px solid var(--border)',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Practitioner:</span>
                  <span style={{ fontWeight: 600 }}>{activeApp.Doctor?.User?.name} ({activeApp.Doctor?.specialization})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Schedule Time:</span>
                  <span style={{ fontWeight: 600 }}>
                    {new Date(activeApp.scheduled_at).toLocaleDateString()} @ {new Date(activeApp.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                  <span>Fee Awaiting Transfer:</span>
                  <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>{formatCurrency(activeApp.Doctor?.consultation_fee)}</span>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Transfer Receipt Screenshot</label>
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--surface-hover)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  required
                />
                
                {filePreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                      src={filePreview}
                      alt="Receipt Preview"
                      style={{ maxHeight: '180px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem' }}
                    />
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {file.name}
                    </p>
                    <p className="text-small">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Click or drag to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <Image size={40} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
                    <p style={{ fontWeight: 600 }}>Click to select receipt image</p>
                    <p className="text-small" style={{ marginTop: '0.25rem' }}>
                      PNG, JPEG, or GIF formats supported (Max. size 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem' }}
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading Receipt screenshot...' : 'Submit Payment Proof'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentUpload;
