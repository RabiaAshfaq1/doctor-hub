import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import { Stethoscope, MapPin, IndianRupee, Clock, Award, Shield, ChevronRight, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await api.get(`/doctors/${id}`);
        if (response.data.success) {
          setDoctor(response.data.doctor);
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Doctor profile not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      setBookingError('Only accounts registered as Patients can book appointments.');
      return;
    }
    if (!bookingDate || !bookingTime) {
      setBookingError('Please choose a date and time slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingMessage('');

    try {
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`);
      
      const response = await api.post('/appointments', {
        doctor_id: doctor.id,
        clinic_id: doctor.Clinic?.id,
        scheduled_at: scheduledAt.toISOString()
      });

      if (response.data.success) {
        setBookingMessage('Session requested successfully! Redirecting to your dashboard to complete payment...');
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 2500);
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingError(err.response?.data?.message || 'Appointment booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving medical practitioner file...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div className="alert alert-error">{error || 'Practitioner profile could not be resolved.'}</div>
        <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Listings
        </Link>
      </div>
    );
  }

  const initials = doctor.User?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="main-content page-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/doctors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Find Doctors <ChevronRight size={14} /> Profile Detail
        </Link>
      </div>

      <div className="detail-grid">
        {/* Profile Card Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="doctor-photo-placeholder" style={{ marginBottom: '1.5rem' }}>
              {initials}
            </div>
            
            <h2 className="h2" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{doctor.User?.name}</h2>
            <span className="badge badge-success" style={{ textTransform: 'capitalize', fontSize: '0.75rem', marginBottom: '1rem' }}>
              {doctor.treatment_type}
            </span>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              "{doctor.bio || 'Experienced clinical practitioner dedicated to standard healthcare services.'}"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Specialization:</span>
                <span style={{ fontWeight: 600 }}>{doctor.specialization}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>License No:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{doctor.license_no}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Fee:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(doctor.consultation_fee)}</span>
              </div>
            </div>
          </div>

          {/* Clinic Information Card */}
          {doctor.Clinic ? (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 className="h3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <span>Clinic Facility</span>
              </h3>
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{doctor.Clinic.name}</p>
              <p className="text-small" style={{ marginTop: '0.25rem' }}>{doctor.Clinic.address}</p>
              <p className="text-small" style={{ fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.1rem' }}>{doctor.Clinic.city}</p>
              
              {doctor.Clinic.timings_json && (
                <div style={{ marginTop: '1rem', backgroundColor: 'var(--background)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <Clock size={14} style={{ color: 'var(--secondary)' }} />
                    <span>Working Hours</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)' }}>{doctor.Clinic.timings_json}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', color: 'var(--text-light)', textAlign: 'center' }}>
              No clinic facility linked yet.
            </div>
          )}
        </div>

        {/* Booking Form Widget */}
        <div>
          <div className="card" style={{ padding: '2.5rem', height: '100%' }}>
            <h3 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Calendar size={24} style={{ color: 'var(--primary)' }} />
              <span>Book Appointment</span>
            </h3>
            <p className="text-lead" style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>
              Choose a convenient clinical session slot for your consultation.
            </p>

            {bookingMessage && <div className="alert alert-success">{bookingMessage}</div>}
            {bookingError && <div className="alert alert-error">{bookingError}</div>}

            {isAuthenticated ? (
              user.role === 'patient' ? (
                <form onSubmit={handleBooking}>
                  <div className="form-group">
                    <label className="form-label">Consulting Facility</label>
                    <input
                      type="text"
                      className="form-control"
                      value={doctor.Clinic?.name || 'Practitioner Office'}
                      disabled
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Consultation Date</label>
                      <input
                        type="date"
                        className="form-control"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Clinical Time Slot</label>
                      <select
                        className="form-control"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        required
                      >
                        <option value="09:00">09:00 AM</option>
                        <option value="09:30">09:30 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="14:30">02:30 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="15:30">03:30 PM</option>
                        <option value="16:00">04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.9rem' }}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? 'Requesting Appointment...' : 'Submit Session Request'}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <Shield size={32} style={{ color: 'var(--warning)', marginBottom: '0.75rem' }} />
                  <p style={{ fontWeight: 600 }}>Not a Patient Account</p>
                  <p className="text-small" style={{ marginTop: '0.25rem' }}>
                    You are logged in as a <strong>{user.role}</strong>. Only Patient accounts can request appointments.
                  </p>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                <Clock size={32} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
                <h4 className="h3" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Authentication Required</h4>
                <p className="text-small" style={{ marginBottom: '1.5rem' }}>
                  Please login or sign up to schedule clinical sessions with our practitioners.
                </p>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                  Log In to Continue
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
