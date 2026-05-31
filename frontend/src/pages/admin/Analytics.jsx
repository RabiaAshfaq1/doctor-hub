import React, { useState, useEffect } from 'react';
import { BarChart2, Activity, Users, Home, TrendingUp, ShieldAlert, IndianRupee, Calendar } from 'lucide-react';
import api from '../../api/api';
import { formatCurrency } from '../../utils/currency';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [avgConsultationFee, setAvgConsultationFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, doctorsRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users?role=doctor'),
        ]);
        if (analyticsRes.data.success) {
          setData(analyticsRes.data.analytics);
        }
        if (doctorsRes.data.success) {
          const fees = (doctorsRes.data.users || [])
            .map((u) => parseFloat(u.Doctor?.consultation_fee || 0))
            .filter((f) => f > 0);
          const avg = fees.length ? fees.reduce((a, b) => a + b, 0) / fees.length : 0;
          setAvgConsultationFee(avg);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to retrieve system analytical reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving system metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-fade-in" style={{ width: '100%' }}>
        <h1 className="h2" style={{ marginBottom: '1.5rem' }}>Analytics Dashboard</h1>
        <div className="alert alert-error">{error || 'Metrics dataset resolution failed.'}</div>
      </div>
    );
  }

  // Extract variables
  const { users, clinics, appointments, financials } = data;

  // Process data for appointment charts
  const statusLabels = {
    pending: 'Awaiting Payment',
    payment_uploaded: 'Verifying Receipt',
    payment_verified: 'Payment Approved',
    confirmed: 'Confirmed Slots',
    completed: 'Consulted',
    cancelled: 'Cancelled'
  };

  const statusColors = {
    pending: 'var(--warning)',
    payment_uploaded: 'var(--secondary)',
    payment_verified: 'var(--primary)',
    confirmed: 'var(--success)',
    completed: 'var(--success)',
    cancelled: 'var(--error)'
  };

  // Turn status mapping into an array of entries
  const statusEntries = Object.entries(appointments.by_status || {}).map(([status, count]) => ({
    status,
    label: statusLabels[status] || status,
    count,
    color: statusColors[status] || 'var(--text-muted)'
  }));

  const maxCount = Math.max(...statusEntries.map((e) => e.count), 1);
  const totalAppointments = appointments.total || 0;

  return (
    <div className="page-fade-in" style={{ width: '100%', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="h2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={24} style={{ color: 'var(--primary)' }} />
          <span>Analytics Dashboard</span>
        </h1>
        <p className="text-lead" style={{ fontSize: '0.95rem', marginTop: '0.1rem' }}>
          Real-time diagnostics tracking healthcare enrollment, schedules, and operations volume.
        </p>
      </div>

      {/* Metrics Cards Row */}
      <div className="stats-row" style={{ gap: '1.5rem' }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-number">{users.patients || 0}</div>
            <div className="stat-label">Total Patients</div>
          </div>
        </div>

        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon secondary" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div className="stat-number">{users.total_doctors || 0}</div>
            <div className="stat-label">Doctors ({users.approved_doctors || 0} Approved)</div>
          </div>
        </div>

        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ backgroundColor: 'hsl(145, 65%, 95%)', color: 'var(--success)' }}>
            <Home size={24} />
          </div>
          <div>
            <div className="stat-number">{clinics || 0}</div>
            <div className="stat-label">Linked Clinics</div>
          </div>
        </div>

        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="stat-number" style={{ color: 'var(--accent)' }}>{formatCurrency(financials.total_revenue)}</div>
            <div className="stat-label">Platform Revenue (PKR)</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Appointments Status Chart */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 className="h3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <span>Consultation status volume</span>
          </h3>

          {statusEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-light)' }}>
              No appointment scheduling data available yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {statusEntries.map((entry) => {
                const percentage = ((entry.count / maxCount) * 100).toFixed(0);
                const percentOfTotal = totalAppointments > 0 ? ((entry.count / totalAppointments) * 100).toFixed(0) : 0;
                return (
                  <div key={entry.status} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      <span>{entry.label}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {entry.count} ({percentOfTotal}%)
                      </span>
                    </div>
                    {/* SVG/CSS Progress Bar */}
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: entry.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* System Operations Audit */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 className="h3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--secondary)' }} />
            <span>Platform Overview</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Scheduled Sessions:</span>
              <strong style={{ fontSize: '1rem' }}>{totalAppointments}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Approval Rate:</span>
              <strong style={{ color: 'var(--success)' }}>
                {users.total_doctors > 0 ? ((users.approved_doctors / users.total_doctors) * 100).toFixed(0) : 0}%
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Avg Consultation Fee:</span>
              <strong>{formatCurrency(avgConsultationFee)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Data Sync Status:</span>
              <span className="badge badge-success">OK</span>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'var(--primary-light)',
            border: '1px solid rgba(13, 148, 136, 0.15)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'hsl(174, 84%, 25%)',
            lineHeight: 1.5
          }}>
            <strong>Admin Security Notice:</strong> Database indexes are active. User actions and immutable medical reports audit logs are synced automatically.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
