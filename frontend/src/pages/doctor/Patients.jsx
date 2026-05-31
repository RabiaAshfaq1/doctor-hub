import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, User as UserIcon, Phone, Mail, Award, Clock } from 'lucide-react';
import api from '../../api/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected patient for medical history modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/appointments/my');
        if (response.data.success) {
          // Extract unique patients from appointments
          const patientMap = new Map();
          response.data.appointments.forEach((app) => {
            if (app.Patient && !patientMap.has(app.Patient.id)) {
              patientMap.set(app.Patient.id, {
                id: app.Patient.id,
                name: app.Patient.User?.name || 'Unknown Patient',
                email: app.Patient.User?.email || 'N/A',
                phone: app.Patient.User?.phone || 'N/A',
                dob: app.Patient.dob,
                blood_group: app.Patient.blood_group,
                allergies: app.Patient.allergies
              });
            }
          });
          setPatients(Array.from(patientMap.values()));
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Could not retrieve patient list.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const openHistoryModal = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    setHistoryError('');
    setHistoryList([]);

    try {
      const response = await api.get(`/history/${patient.id}`);
      if (response.data.success) {
        setHistoryList(response.data.history);
      }
    } catch (err) {
      console.error('Error fetching patient history:', err);
      setHistoryError(err.response?.data?.message || 'Failed to retrieve history logs.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setSelectedPatient(null);
    setHistoryList([]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2">Patient Records</h1>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
          Access contact files and clinical histories of patients in your consultation list.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {patients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Users size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">No Patient Records</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Patients will appear here once they request appointments with you.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Age/DOB</th>
                <th>Blood Group</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((pat) => (
                <tr key={pat.id}>
                  <td style={{ fontWeight: 600 }}>{pat.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                      <Mail size={14} style={{ color: 'var(--text-light)' }} />
                      <span>{pat.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                      <Phone size={14} style={{ color: 'var(--text-light)' }} />
                      <span>{pat.phone}</span>
                    </div>
                  </td>
                  <td>{pat.dob ? new Date(pat.dob).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className="badge badge-error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                      {pat.blood_group || 'Not Set'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => openHistoryModal(pat)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <FileText size={14} />
                      <span>Medical History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* History Log Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={closeHistoryModal}>
          <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="h2" style={{ fontSize: '1.35rem' }}>Medical Timeline: {selectedPatient.name}</h3>
              <button onClick={closeHistoryModal} className="modal-close" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>×</button>
            </div>

            {/* Patient Vitals Summary */}
            <div style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '2rem',
              fontSize: '0.9rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Blood Type: </span>
                <strong style={{ color: 'var(--error)' }}>{selectedPatient.blood_group || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Allergies: </span>
                <strong style={{ color: selectedPatient.allergies ? 'var(--warning)' : 'var(--text-main)' }}>
                  {selectedPatient.allergies || 'None'}
                </strong>
              </div>
            </div>

            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner"></div>
              </div>
            ) : historyError ? (
              <div className="alert alert-error">{historyError}</div>
            ) : historyList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                No clinical files or prescription sheets recorded for this patient.
              </div>
            ) : (
              <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div className="timeline" style={{ marginTop: '0' }}>
                  {historyList.map((record) => (
                    <div className="timeline-item" key={record.id}>
                      <div className="timeline-date" style={{ fontSize: '0.8rem' }}>
                        {new Date(record.created_at).toLocaleDateString()} at{' '}
                        {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      <div className="card" style={{ marginTop: '0.25rem', padding: '1.25rem', borderLeft: '3px solid var(--primary)', backgroundColor: 'var(--surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{record.diagnosis}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                            By Dr. {record.Doctor?.User?.name || 'Attending'}
                          </span>
                        </div>
                        
                        {record.notes && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            {record.notes}
                          </p>
                        )}

                        {record.Prescriptions && record.Prescriptions.length > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                              Prescribed Medicines:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {record.Prescriptions.map((pres) => (
                                <div key={pres.id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--background)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                                  <span><strong>{pres.medicine_name}</strong> - {pres.dosage}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>({pres.duration})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={closeHistoryModal} className="btn btn-outline btn-sm">Close Timeline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
