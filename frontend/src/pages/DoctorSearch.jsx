import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { Search, Stethoscope, MapPin, Award } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

function getPrimaryClinic(doc) {
  if (Array.isArray(doc.Clinics) && doc.Clinics.length) return doc.Clinics[0];
  return doc.Clinic || null;
}

const DoctorSearch = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState('');
  const [treatmentType, setTreatmentType] = useState(searchParams.get('treatment_type') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [error, setError] = useState('');

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (treatmentType) params.treatment_type = treatmentType;
      if (city) params.city = city;

      const response = await api.get('/doctors', { params });
      if (response.data.success) {
        setDoctors(response.data.doctors || []);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
      setError(
        err.response
          ? 'Could not retrieve doctor listings.'
          : 'Cannot reach the server. Start the backend with: cd backend && npm run dev'
      );
    } finally {
      setLoading(false);
    }
  }, [search, specialization, treatmentType, city]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setTreatmentType(searchParams.get('treatment_type') || '');
    setCity(searchParams.get('city') || '');
  }, [searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchDoctors]);

  return (
    <div className="main-content page-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h1">Search Medical Practitioners</h1>
        <p className="text-lead" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
          Explore verified doctors across different specializations and treatment systems.
        </p>
      </div>

      <div className="search-header">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Search size={14} /> Search Doctor Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Sarah"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Specialization</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Cardiologist"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Lahore"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">System of Medicine</label>
            <select
              className="form-control"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
            >
              <option value="">All Systems</option>
              <option value="allopathic">Allopathic</option>
              <option value="homeopathic">Homeopathic</option>
              <option value="herbal">Herbal</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving clinical listings...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Stethoscope size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">No Doctors Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Try adjusting your search filters or spelling to locate doctors.
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {doctors.map((doc) => {
            const clinic = getPrimaryClinic(doc);
            return (
              <div className="card" key={doc.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}>
                      {doc.User?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="h3" style={{ fontSize: '1.15rem' }}>{doc.User?.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                        <span className="badge badge-success" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                          {doc.treatment_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={16} style={{ color: 'var(--primary)' }} />
                      <span>{doc.specialization}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Rs</span>
                      <span>Consultation: <strong>{formatCurrency(doc.consultation_fee)}</strong></span>
                    </div>
                    {clinic && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <MapPin size={16} style={{ color: 'var(--secondary)', marginTop: '0.15rem', flexShrink: 0 }} />
                        <span>{clinic.name} <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{clinic.city}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/doctors/${doc.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
