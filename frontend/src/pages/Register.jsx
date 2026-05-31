import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/api';
import { Activity, ShieldAlert, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Basic Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('patient');

  // Patient Fields
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('');
  const [treatmentType, setTreatmentType] = useState('allopathic');
  const [licenseNo, setLicenseNo] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState(0);

  // Assistant Fields
  const [doctorId, setDoctorId] = useState('');
  const [doctorList, setDoctorList] = useState([]);

  // Alert State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  // Load doctor list if role is assistant
  useEffect(() => {
    if (role === 'assistant') {
      const loadDoctors = async () => {
        try {
          const response = await api.get('/doctors');
          if (response.data.success) {
            setDoctorList(response.data.doctors);
            if (response.data.doctors.length > 0) {
              setDoctorId(response.data.doctors[0].id);
            }
          }
        } catch (err) {
          console.error('Error fetching doctors:', err);
        }
      };
      loadDoctors();
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    // Construct Payload dynamically
    const payload = {
      name,
      email,
      password,
      phone,
      role
    };

    if (role === 'patient') {
      payload.dob = dob || null;
      payload.blood_group = bloodGroup;
      payload.allergies = allergies;
    } else if (role === 'doctor') {
      payload.specialization = specialization || 'General Practitioner';
      payload.treatment_type = treatmentType;
      payload.license_no = licenseNo || 'PENDING';
      payload.bio = bio;
      payload.consultation_fee = parseFloat(consultationFee) || 0.0;
    } else if (role === 'assistant') {
      payload.doctor_id = doctorId || null;
    }

    const result = await register(payload);

    if (result.success) {
      const isDoctor = role === 'doctor';
      setSuccessMsg(
        isDoctor
          ? 'Registration successful! Your doctor profile is pending admin approval. You can log in once approved.'
          : 'Registration successful! Redirecting you to login...'
      );
      
      setTimeout(() => {
        navigate('/login');
      }, isDoctor ? 5000 : 2500);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Activity size={28} />
          </div>
          <h2 className="h2" style={{ fontSize: '1.6rem' }}>Create Account</h2>
          <p className="text-small" style={{ marginTop: '0.25rem' }}>Select your account role to proceed.</p>
        </div>

        {successMsg && (
          <div className="alert alert-success" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start' }}>
            <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem', marginRight: '0.5rem' }} />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '0.1rem', marginRight: '0.5rem' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Picker */}
          <div className="form-group">
            <label className="form-label">I want to register as a</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Medical Doctor</option>
              <option value="assistant">Doctor's Assistant</option>
            </select>
          </div>

          <h4 className="h3" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem 0' }}>
            Account Credentials
          </h4>

          {/* Grid fields for credentials */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. 0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Role Sections */}
          {role === 'patient' && (
            <>
              <h4 className="h3" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem 0' }}>
                Patient Medical Info
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. O+, A-"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Allergies (if any)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Penicillin, Pollen"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
            </>
          )}

          {role === 'doctor' && (
            <>
              <h4 className="h3" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem 0' }}>
                Professional Doctor Profile
              </h4>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pediatrician, Dentist"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">System of Medicine</label>
                  <select
                    className="form-control"
                    value={treatmentType}
                    onChange={(e) => setTreatmentType(e.target.value)}
                  >
                    <option value="allopathic">Allopathic</option>
                    <option value="homeopathic">Homeopathic</option>
                    <option value="herbal">Herbal</option>
                  </select>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Medical License Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PMC-12345-D"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Fee (Rs / PKR)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    placeholder="e.g. 5000"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Professional Biography</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Tell patients about your clinical experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          {role === 'assistant' && (
            <>
              <h4 className="h3" style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '1.5rem 0 1rem 0' }}>
                Associate Practitioner
              </h4>
              <div className="form-group">
                <label className="form-label">Select Managing Doctor</label>
                <select
                  className="form-control"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                >
                  {doctorList.length === 0 ? (
                    <option value="">No registered doctors available</option>
                  ) : (
                    doctorList.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.User?.name} ({doc.specialization})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="btn-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
