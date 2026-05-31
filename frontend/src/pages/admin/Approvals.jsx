import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, Award, IndianRupee, Stethoscope, Mail } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import api from '../../api/api';

const Approvals = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleLoading, setToggleLoading] = useState(null);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/admin/users?role=doctor');
      if (response.data.success) {
        setDoctors(response.data.users);
      }
    } catch (err) {
      console.error('Error fetching doctor approvals:', err);
      setError('Could not retrieve doctor list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleApproval = async (userId, doctorRecord, approveState) => {
    if (!doctorRecord) {
      alert('Doctor profile metadata not found.');
      return;
    }
    const message = approveState 
      ? 'Are you sure you want to approve this medical practitioner registration?' 
      : 'Are you sure you want to revoke approval / suspend this practitioner?';

    if (!window.confirm(message)) return;

    setToggleLoading(userId);
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, {
        approve: approveState
      });

      if (response.data.success) {
        setDoctors(prev =>
          prev.map(doc => {
            if (doc.id === userId && doc.Doctor) {
              return {
                ...doc,
                Doctor: { ...doc.Doctor, is_approved: approveState }
              };
            }
            return doc;
          })
        );
      }
    } catch (err) {
      console.error('Toggle doctor status error:', err);
      alert(err.response?.data?.message || 'Error updating approval status.');
    } finally {
      setToggleLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving doctor files...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={24} style={{ color: 'var(--primary)' }} />
          <span>Doctor Approvals</span>
        </h1>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
          Moderate practitioner license registrations and toggle active platform listings.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Stethoscope size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
          <h3 className="h3">No Doctors Registered</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            There are no medical practitioner profiles found in the registry.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Specialization & System</th>
                <th>Medical License No</th>
                <th>Consultation Fee</th>
                <th>Listing Status</th>
                <th style={{ textAlign: 'right' }}>Authorization</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => {
                const doctorProfile = doc.Doctor;
                const isApproved = doctorProfile?.is_approved || false;
                
                return (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Mail size={12} />
                        <span>{doc.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{doctorProfile?.specialization || 'N/A'}</div>
                      <span className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '0.7rem', padding: '0.1rem 0.4rem', marginTop: '0.15rem' }}>
                        {doctorProfile?.treatment_type || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {doctorProfile?.license_no || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                        <IndianRupee size={14} style={{ color: 'var(--accent)' }} />
                        <span>{formatCurrency(doctorProfile?.consultation_fee)}</span>
                      </div>
                    </td>
                    <td>
                      {isApproved ? (
                        <span className="badge badge-success">Approved</span>
                      ) : (
                        <span className="badge badge-warning">Pending Approval</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isApproved ? (
                        <button
                          onClick={() => handleToggleApproval(doc.id, doctorProfile, false)}
                          className="btn btn-outline btn-danger btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          disabled={toggleLoading === doc.id}
                        >
                          <UserX size={14} />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleApproval(doc.id, doctorProfile, true)}
                          className="btn btn-primary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          disabled={toggleLoading === doc.id}
                        >
                          <UserCheck size={14} />
                          <span>Approve</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Approvals;
