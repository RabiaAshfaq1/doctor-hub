import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Upload,
  CheckCircle,
  Pill,
  Leaf,
  Flower2,
  Shield,
  Clock,
  Star,
  ChevronDown,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import api from '../api/api';
import { formatCurrency } from '../utils/currency';
import './landing.css';

const HERO_LINE1 = ['Find', 'the', 'Right', 'Doctor,'];
const HERO_LINE2 = ['Book', 'in', 'Minutes.'];

const QUICK_CHIPS = ['Fever', 'Diabetes', 'Heart', 'Skin', 'Migraine', 'Allergy'];

const STEPS = [
  { icon: Search, title: 'Search Doctor', desc: 'Filter by disease, treatment type, and city.' },
  { icon: Calendar, title: 'Book Appointment', desc: 'Pick a slot at your chosen clinic.' },
  { icon: Upload, title: 'Upload Payment', desc: 'Submit your bank transfer receipt.' },
  { icon: CheckCircle, title: 'Get Confirmed', desc: 'Assistant verifies and confirms your visit.' },
];

const TREATMENTS = [
  {
    icon: Pill,
    title: 'Allopathic',
    desc: 'Modern evidence-based medicine for acute and chronic conditions.',
    type: 'allopathic',
  },
  {
    icon: Leaf,
    title: 'Homeopathic',
    desc: 'Holistic remedies tailored to individual patient profiles.',
    type: 'homeopathic',
  },
  {
    icon: Flower2,
    title: 'Herbal',
    desc: 'Plant-based therapies rooted in traditional wellness practices.',
    type: 'herbal',
  },
];

const WHY = [
  { icon: Shield, title: 'Secure Records', desc: 'Immutable medical history and prescription logs protect your data.' },
  { icon: Clock, title: 'Fast Booking', desc: 'Search, book, and pay in minutes — no phone calls needed.' },
  { icon: Star, title: 'Verified Doctors', desc: 'Every practitioner is reviewed and approved by our admin team.' },
];

const FALLBACK_DOCTORS = [
  { id: '1', name: 'Dr. Sarah Connor', specialization: 'Cardiologist', treatment_type: 'allopathic', city: 'New York', consultation_fee: 7500 },
  { id: '2', name: 'Dr. James Wilson', specialization: 'Neurologist', treatment_type: 'allopathic', city: 'Chicago', consultation_fee: 9000 },
  { id: '3', name: 'Dr. Ayesha Khan', specialization: 'Dermatologist', treatment_type: 'herbal', city: 'Lahore', consultation_fee: 4500 },
];

function useScrollReveal(...deps) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    const observeNew = () => {
      el.querySelectorAll('.landing-reveal:not(.is-visible)').forEach((node) => {
        observer.observe(node);
      });
    };

    observeNew();
    const raf = requestAnimationFrame(observeNew);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, deps);

  return ref;
}

function StatCounter({ end, suffix, label }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const start = performance.now();
      const dur = 2000;
      const step = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - (1 - p) ** 3;
        setValue(Math.round(eased * end));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.25 });

    obs.observe(node);
    return () => obs.disconnect();
  }, [end]);

  const formatDisplay = (v) => {
    if (suffix === '%') return `${v}%`;
    if (end === 10000) return v >= 10000 ? '10,000+' : `${v.toLocaleString('en-PK')}+`;
    return `${v}${suffix}`;
  };

  return (
    <div className="landing-stat" ref={ref}>
      <div className="landing-stat__num">{formatDisplay(value)}</div>
      <div className="landing-stat__label">{label}</div>
    </div>
  );
}

function getInitials(name) {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const Home = () => {
  const navigate = useNavigate();

  const [disease, setDisease] = useState('');
  const [treatmentType, setTreatmentType] = useState('');
  const [city, setCity] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const revealRef = useScrollReveal(doctors.length, doctorsLoading);

  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 17 + 5) % 100}%`,
      delay: `${(i * 0.7) % 12}s`,
      duration: `${14 + (i % 8)}s`,
      size: 4 + (i % 3),
    }))
  ).current;

  useEffect(() => {
    let cancelled = false;
    setDoctorsLoading(true);

    api
      .get('/doctors')
      .then((res) => {
        if (cancelled) return;
        if (res.data.success && res.data.doctors?.length) {
          setDoctors(res.data.doctors.slice(0, 3));
        } else {
          setDoctors(FALLBACK_DOCTORS);
        }
      })
      .catch(() => {
        if (!cancelled) setDoctors(FALLBACK_DOCTORS);
      })
      .finally(() => {
        if (!cancelled) setDoctorsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = useCallback(
    (overrideDisease) => {
      const params = new URLSearchParams();
      const q = overrideDisease ?? disease;
      if (q) params.set('search', q);
      if (treatmentType) params.set('treatment_type', treatmentType);
      if (city) params.set('city', city);
      const qs = params.toString();
      navigate(qs ? `/doctors?${qs}` : '/doctors');
    },
    [disease, treatmentType, city, navigate]
  );

  const scrollToStats = () => {
    document.getElementById('landing-stats')?.scrollIntoView({ behavior: 'smooth' });
  };

  let wordDelay = 0;
  const renderWords = (words, allAccent = false) =>
    words.map((word, i) => {
      const delay = wordDelay++;
      return (
        <span
          key={`${word}-${i}`}
          className={`landing-hero__word ${allAccent ? 'landing-hero__word--accent' : ''}`}
          style={{ animationDelay: `${0.15 + delay * 0.08}s` }}
        >
          {word}{' '}
        </span>
      );
    });

  return (
    <div className="landing-page" ref={revealRef}>
      {/* Hero */}
      <section className="landing-hero" id="top">
        <div className="landing-hero__mesh" aria-hidden="true">
          <div className="landing-hero__blob landing-hero__blob--1" />
          <div className="landing-hero__blob landing-hero__blob--2" />
          <div className="landing-hero__blob landing-hero__blob--3" />
        </div>

        <div className="landing-hero__particles" aria-hidden="true">
          {particles.map((p) => (
            <span
              key={p.id}
              className="landing-particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        <div className="landing-hero__content">
          <span className="landing-badge">✦ Trusted Healthcare Platform</span>

          <h1 className="landing-hero__title">
            <span className="landing-hero__title-line">{renderWords(HERO_LINE1, false)}</span>
            <span className="landing-hero__title-line">{renderWords(HERO_LINE2, true)}</span>
          </h1>

          <p className="landing-hero__sub">
            Search Allopathic, Homeopathic &amp; Herbal specialists by disease, city, and treatment type.
          </p>

          <div className="landing-search-card">
            <div className="landing-search-grid">
              <div className="landing-search-field">
                <label htmlFor="disease">Disease / Symptom</label>
                <input
                  id="disease"
                  type="text"
                  placeholder="e.g. Fever, Diabetes"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="landing-search-field">
                <label htmlFor="treatment">Treatment Type</label>
                <select
                  id="treatment"
                  value={treatmentType}
                  onChange={(e) => setTreatmentType(e.target.value)}
                >
                  <option value="">All types</option>
                  <option value="allopathic">Allopathic</option>
                  <option value="homeopathic">Homeopathic</option>
                  <option value="herbal">Herbal</option>
                </select>
              </div>
              <div className="landing-search-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g. Lahore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button type="button" className="landing-btn-search" onClick={() => handleSearch()}>
                <Search size={18} />
                Search
              </button>
            </div>
          </div>

          <div className="landing-chips">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="landing-chip"
                onClick={() => {
                  setDisease(chip);
                  handleSearch(chip);
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="landing-scroll-arrow" onClick={scrollToStats} aria-label="Scroll down">
          <ChevronDown size={28} />
        </button>
      </section>

      {/* Stats */}
      <section className="landing-stats" id="landing-stats">
        <div className="landing-stats__inner landing-reveal">
          <StatCounter end={500} suffix="+" label="Doctors" />
          <StatCounter end={10000} suffix="+" label="Patients" />
          <StatCounter end={3} suffix="" label="Treatment Types" />
          <StatCounter end={98} suffix="%" label="Satisfaction" />
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section__inner">
          <h2 className="landing-section__title landing-reveal">
            How <span className="underline-teal">Doctor Hub</span> Works
          </h2>
          <p className="landing-section__sub landing-reveal">Four simple steps from search to confirmed consultation.</p>

          <div className="landing-steps">
            <div className="landing-steps__line" aria-hidden="true" />
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="landing-step landing-reveal"
                  style={{ transitionDelay: `${idx * 0.12}s` }}
                >
                  <div className="landing-step__icon-wrap">
                    <span className="landing-step__num">{idx + 1}</span>
                    <Icon size={28} />
                  </div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Treatment types */}
      <section className="landing-section">
        <h2 className="landing-section__title landing-reveal">
          <span className="underline-teal">Treatment</span> Types
        </h2>
        <p className="landing-section__sub landing-reveal">Choose the approach that fits your health goals.</p>

        <div className="landing-treatment-grid">
          {TREATMENTS.map((t, idx) => {
            const Icon = t.icon;
            return (
              <article
                key={t.type}
                className="landing-treatment-card landing-reveal"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="landing-treatment-card__icon">
                  <Icon size={26} />
                </div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <Link to={`/doctors?treatment_type=${t.type}`}>Explore →</Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Featured doctors */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section__inner">
          <h2 className="landing-section__title landing-reveal">
            Featured <span className="underline-teal">Doctors</span>
          </h2>
          <p className="landing-section__sub landing-reveal">Verified practitioners ready for your next visit.</p>

          <div className="landing-doctors-grid">
            {doctorsLoading ? (
              [0, 1, 2].map((i) => (
                <article key={`skel-${i}`} className="landing-doctor-card landing-doctor-card--loading">
                  <div className="landing-doctor-avatar landing-skeleton" />
                  <div className="landing-skeleton" style={{ height: 18, width: '70%', margin: '0 auto 0.5rem' }} />
                  <div className="landing-skeleton" style={{ height: 14, width: '50%', margin: '0 auto' }} />
                </article>
              ))
            ) : doctors.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--lp-text-muted)' }}>
                No doctors available yet.{' '}
                <Link to="/register" style={{ color: 'var(--lp-primary)' }}>
                  Register as a doctor
                </Link>
              </p>
            ) : (
              doctors.map((doc, idx) => {
                const userName = doc.User?.name || doc.name || 'Doctor';
                const spec = doc.specialization || 'General Physician';
                const treatment = doc.treatment_type || 'allopathic';
                const docCity =
                  (Array.isArray(doc.Clinics) && doc.Clinics[0]?.city) ||
                  doc.Clinics?.city ||
                  doc.city ||
                  'Pakistan';
                const fee = doc.consultation_fee ?? 0;
                const floatClass = `landing-doctor-card--float-${(idx % 3) + 1}`;

                return (
                  <article
                    key={doc.id}
                    className={`landing-doctor-card ${floatClass} landing-doctor-card--visible`}
                  >
                    <div className="landing-doctor-avatar">{getInitials(userName)}</div>
                    <h4>{userName}</h4>
                    <p className="spec">{spec}</p>
                    <span className="landing-doctor-badge">{treatment}</span>
                    <p className="city">
                      <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                      {docCity}
                    </p>
                    <p className="fee">{formatCurrency(fee)} consultation</p>
                    <Link to={`/doctors/${doc.id}`} className="btn-book">
                      Book Now
                    </Link>
                  </article>
                );
              })
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }} className="landing-reveal">
            <Link
              to="/doctors"
              className="landing-btn-search"
              style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
              View All Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="landing-section">
        <h2 className="landing-section__title landing-reveal">
          Why <span className="underline-teal">Choose</span> Us
        </h2>
        <p className="landing-section__sub landing-reveal">Built for patients, doctors, and clinics across Pakistan.</p>

        <div className="landing-why-grid">
          {WHY.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="landing-why-item landing-reveal"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="landing-why-item__icon">
                  <Icon size={28} />
                </div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <Link to="/" className="brand-landing" style={{ textDecoration: 'none' }}>
              <Stethoscope size={26} style={{ color: '#1D9E75' }} />
              <span style={{ fontWeight: 800, color: '#1A2E2A' }}>Doctor Hub</span>
            </Link>
            <p>Pakistan&apos;s trusted healthcare consultation platform.</p>
          </div>
          <div className="landing-footer__links">
            <a href="#top">Privacy Policy</a>
            <a href="#top">Terms</a>
            <a href="#top">Contact</a>
          </div>
        </div>
        <p className="landing-footer__copy">© 2025 Doctor Hub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
