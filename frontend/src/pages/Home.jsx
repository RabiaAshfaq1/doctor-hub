import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, Users, Star, ArrowRight, Clipboard, Calendar, FileText } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, hsl(174, 84%, 12%), hsl(220, 80%, 15%))',
        color: 'var(--surface)',
        padding: '5rem 2rem',
        textAlign: 'center',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '3rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-info" style={{ backgroundColor: 'rgba(14, 116, 144, 0.2)', color: 'hsl(174, 84%, 75%)', border: '1px solid rgba(13, 148, 136, 0.3)', marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
            Transforming Healthcare Delivery
          </span>
          <h1 className="h1" style={{ fontSize: '3rem', marginBottom: '1.5rem', color: '#fff', fontWeight: 800, lineHeight: 1.15 }}>
            Your Complete Health Hub, <br />
            <span style={{ background: 'linear-gradient(90deg, hsl(174, 84%, 55%), hsl(220, 80%, 65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Connected & Secure
            </span>
          </h1>
          <p className="text-lead" style={{ color: 'hsl(215, 20%, 80%)', marginBottom: '2.5rem', fontSize: '1.2rem', lineHeight: 1.6 }}>
            Seamlessly book clinical sessions, consult verified medical practitioners, manage medical history timelines, and secure prescriptions — all in one unified medical portal.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/doctors" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              <span>Find a Doctor</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="main-content" style={{ padding: '0 1rem', marginBottom: '4rem' }}>
        <div className="stats-row" style={{ gap: '2rem' }}>
          <div className="stat-card" style={{ padding: '2rem', flex: 1 }}>
            <div className="stat-icon" style={{ width: '60px', height: '60px' }}>
              <Users size={28} />
            </div>
            <div>
              <div className="stat-number">12,000+</div>
              <div className="stat-label">Treated Patients</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '2rem', flex: 1 }}>
            <div className="stat-icon secondary" style={{ width: '60px', height: '60px' }}>
              <Activity size={28} />
            </div>
            <div>
              <div className="stat-number">450+</div>
              <div className="stat-label">Verified Doctors</div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: '2rem', flex: 1 }}>
            <div className="stat-icon" style={{ width: '60px', height: '60px', backgroundColor: 'hsl(145, 65%, 95%)', color: 'var(--success)' }}>
              <Shield size={28} />
            </div>
            <div>
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Secure Data Vault</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="main-content" style={{ padding: '0 1rem', marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="h2" style={{ marginBottom: '0.75rem' }}>Our Healthcare Ecosystem</h2>
          <p className="text-lead" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Doctor Hub connects doctors, assistants, admins, and patients under a single authenticated infrastructure.
          </p>
        </div>

        <div className="card-grid">
          <div className="card">
            <Calendar size={32} className="brand-accent" style={{ color: 'var(--primary)', marginBottom: '1.25rem' }} />
            <h3 className="h3" style={{ marginBottom: '0.75rem' }}>Dynamic Calendars</h3>
            <p className="text-small" style={{ fontSize: '0.95rem' }}>
              Patients can explore calendars, book clinical slots, and submit payments instantly to initiate sessions.
            </p>
          </div>
          <div className="card">
            <FileText size={32} style={{ color: 'var(--secondary)', marginBottom: '1.25rem' }} />
            <h3 className="h3" style={{ marginBottom: '0.75rem' }}>Immutable Records</h3>
            <p className="text-small" style={{ fontSize: '0.95rem' }}>
              Patient history files and prescription logs are insert-only, guaranteeing record integrity.
            </p>
          </div>
          <div className="card">
            <Shield size={32} style={{ color: 'var(--accent)', marginBottom: '1.25rem' }} />
            <h3 className="h3" style={{ marginBottom: '0.75rem' }}>Assistant Moderated</h3>
            <p className="text-small" style={{ fontSize: '0.95rem' }}>
              Automated assistant workflows check uploaded receipts to verify payments before consultations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="main-content" style={{ padding: '0 1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px solid var(--border)'
        }}>
          <h2 className="h2" style={{ marginBottom: '1rem' }}>Ready to consult a practitioner?</h2>
          <p className="text-lead" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.05rem' }}>
            Create an account, find a doctor matching your specialization, and finalize your booking session in seconds.
          </p>
          <Link to="/doctors" className="btn btn-secondary" style={{ padding: '0.85rem 2rem' }}>
            Book Consultation Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
