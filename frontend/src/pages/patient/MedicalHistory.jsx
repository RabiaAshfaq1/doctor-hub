import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/api';
import { FileText, Calendar, User, Clipboard, Pill, AlertTriangle } from 'lucide-react';

const MedicalHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.Patient?.id) {
        setError('Patient sub-profile could not be resolved.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await api.get(`/history/${user.Patient.id}`);
        if (response.data.success) {
          setHistory(response.data.history);
          setPatient(response.data.patient);
        }
      } catch (err) {
        console.error('Error fetching medical history:', err);
        setError('Could not retrieve medical history data from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your clinical files...</p>
      </div>
    );
  }

  if (error || !user?.Patient?.id) {
    return (
      <div className="page-fade-in" style={{ width: '100%' }}>
        <h1 className="h2" style={{ marginBottom: '1.5rem' }}>Medical History</h1>
        <div className="alert alert-error">{error || 'Patient profile mapping failed.'}</div>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2">My Medical History</h1>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
          Explore your secure and finalized diagnosis reports and prescriptions.
        </p>
      </div>

      {patient && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Date of Birth</div>
            <div style={{ fontWeight: 600, marginTop: '0.1rem' }}>
              {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not Set'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Blood Group</div>
            <div style={{ fontWeight: 600, marginTop: '0.1rem', color: 'var(--error)' }}>
              {patient.blood_group || 'Not Set'}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Allergies</div>
            <div style={{ fontWeight: 600, marginTop: '0.1rem', color: patient.allergies ? 'var(--warning)' : 'var(--text-main)' }}>
              {patient.allergies || 'None Recorded'}
            </div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <FileText size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">No Medical Entries Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            There are no medical history logs registered for your profile yet. Completed appointments will generate diagnosis sheets here.
          </p>
        </div>
      ) : (
        <div className="timeline">
          {history.map((record) => (
            <div className="timeline-item" key={record.id}>
              <div className="timeline-date">
                {new Date(record.created_at).toLocaleDateString()} at{' '}
                {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <div className="card" style={{ marginTop: '0.5rem', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="text-small" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Primary Diagnosis</span>
                    <h3 className="h3" style={{ fontSize: '1.25rem', marginTop: '0.1rem', color: 'var(--text-main)' }}>{record.diagnosis}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--background)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                    <User size={16} style={{ color: 'var(--secondary)' }} />
                    <span>Attending: <strong>{record.Doctor?.User?.name}</strong></span>
                  </div>
                </div>

                {record.notes && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Clinical Notes
                    </h4>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', backgroundColor: 'var(--surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      {record.notes}
                    </p>
                  </div>
                )}

                {record.Prescriptions && record.Prescriptions.length > 0 ? (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Pill size={14} style={{ color: 'var(--secondary)' }} />
                      <span>Prescribed Medication</span>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {record.Prescriptions.map((pres) => (
                        <div key={pres.id} className="prescription-list-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.95rem' }}>
                            <span>{pres.medicine_name}</span>
                            <span style={{ color: 'var(--secondary)' }}>{pres.dosage}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Duration: {pres.duration}</span>
                            {pres.instructions && <span style={{ fontStyle: 'italic' }}>Instructions: {pres.instructions}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', borderLeft: '3px solid var(--border)', paddingLeft: '0.75rem' }}>
                    No prescriptions linked to this record.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;
