import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Activity, Plus, Trash2, ArrowLeft, HeartPulse, FileText, CheckCircle } from 'lucide-react';
import api from '../../api/api';

const Diagnosis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract parameters
  const query = new URLSearchParams(location.search);
  const appointmentId = query.get('appointment_id') || '';
  const patientId = query.get('patient_id') || '';
  const patientName = query.get('patient_name') || 'Patient';

  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  
  // Prescriptions List State
  const [prescriptions, setPrescriptions] = useState([]);
  
  // Single Prescription Inputs State
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  // Status/Alerts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addPrescriptionRow = (e) => {
    e.preventDefault();
    if (!medName || !dosage || !duration) {
      alert('Please fill in Medicine Name, Dosage, and Duration.');
      return;
    }
    const newPres = {
      id: Date.now(),
      medicine_name: medName,
      dosage,
      duration,
      instructions
    };
    setPrescriptions([...prescriptions, newPres]);
    
    // Reset fields
    setMedName('');
    setDosage('');
    setDuration('');
    setInstructions('');
  };

  const removePrescriptionRow = (id) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      setError('Primary diagnosis is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Submit Medical History Record
      const historyResponse = await api.post('/history', {
        patient_id: patientId,
        appointment_id: appointmentId || null,
        diagnosis,
        notes
      });

      if (!historyResponse.data.success) {
        throw new Error('Failed to create medical history record.');
      }

      const medicalHistoryId = historyResponse.data.record.id;

      // 2. Submit all prescriptions sequentially (finalized, insert-only)
      for (const pres of prescriptions) {
        await api.post('/prescriptions', {
          medical_history_id: medicalHistoryId,
          medicine_name: pres.medicine_name,
          dosage: pres.dosage,
          duration: pres.duration,
          instructions: pres.instructions
        });
      }

      // 3. Mark appointment as completed
      if (appointmentId) {
        await api.patch(`/appointments/${appointmentId}/complete`);
      }

      setSuccess('Diagnosis finalized and prescriptions locked successfully! Redirecting to schedule...');
      setTimeout(() => {
        navigate('/doctor/schedule');
      }, 2500);

    } catch (err) {
      console.error('Finalize diagnosis failed:', err);
      setError(err.response?.data?.message || 'Error compiling diagnosis. Please verify input data.');
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/doctor/schedule" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to Schedule
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
            <HeartPulse size={24} style={{ margin: 'auto' }} />
          </div>
          <div>
            <h2 className="h2" style={{ fontSize: '1.5rem' }}>Finalize Consultation Sheet</h2>
            <p className="text-small" style={{ marginTop: '0.1rem' }}>
              Patient: <strong>{patientName}</strong> {appointmentId && `• Appointment ID: ${appointmentId.slice(0, 8)}`}
            </p>
          </div>
        </div>

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Clinical Diagnosis */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} /> Primary Diagnosis
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Acute Bronchitis, Essential Hypertension"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attending Doctor Clinical Notes</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Type notes regarding symptoms, lab recommendations, or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Section 2: Prescription Widget */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '2.5rem', paddingTop: '2rem' }}>
            <h3 className="h3" style={{ marginBottom: '1.25rem', color: 'var(--text-main)' }}>Prescribe Medications</h3>

            {/* Prescription Form Row */}
            <div style={{ backgroundColor: 'var(--background)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Medicine Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Amoxicillin 500mg"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Dosage</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. 1-0-1 after food"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Duration</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. 5 days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Special Instructions (Optional)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Take with warm water, avoid dairy products"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  onClick={addPrescriptionRow}
                  className="btn btn-secondary btn-sm"
                  style={{ height: '39px', padding: '0 1.25rem' }}
                  disabled={loading}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Prescribed List Table */}
            {prescriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-light)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                No medicines prescribed yet for this sheet.
              </div>
            ) : (
              <div className="table-container" style={{ marginTop: '0', marginBottom: '2rem', boxShadow: 'none' }}>
                <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Dosage</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                      <th style={{ textAlign: 'right', width: '80px' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((pres) => (
                      <tr key={pres.id}>
                        <td style={{ fontWeight: 600 }}>{pres.medicine_name}</td>
                        <td>{pres.dosage}</td>
                        <td>{pres.duration}</td>
                        <td style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>{pres.instructions || '-'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => removePrescriptionRow(pres.id)}
                            className="btn btn-outline btn-danger btn-sm"
                            style={{ padding: '0.35rem' }}
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/doctor/schedule" className="btn btn-outline" disabled={loading}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Finalizing Records...' : 'Lock & Finalize Diagnosis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Diagnosis;
