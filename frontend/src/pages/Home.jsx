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
  MapPin,
  Stethoscope,
  Lock,
  Sparkles,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import api from '../api/api';
import { formatCurrency } from '../utils/currency';
import HeroSection from '../components/landing/HeroSection';
import PremiumCard from '../components/landing/PremiumCard';
import StatCounter from '../components/landing/StatCounter';
import './landing.css';

const QUICK_CHIPS = ['Fever', 'Diabetes', 'Heart', 'Skin', 'Migraine', 'Allergy'];

const TRUST_ITEMS = [
  { icon: Shield, label: 'Verified practitioners' },
  { icon: Lock, label: 'Secure medical records' },
  { icon: CheckCircle, label: 'Payment verification' },
  { icon: Sparkles, label: 'Immutable prescriptions' },
];

const STEPS = [
  { icon: Search, title: 'Discover', desc: 'Filter specialists by condition, modality, and city.' },
  { icon: Calendar, title: 'Book', desc: 'Reserve clinical slots with real-time availability.' },
  { icon: Upload, title: 'Pay', desc: 'Upload transfer proof — assistants verify in minutes.' },
  { icon: CheckCircle, title: 'Confirm', desc: 'Receive confirmation and attend your consultation.' },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Clinical-grade security',
    desc: 'Insert-only medical history and prescriptions preserve an auditable care timeline.',
  },
  {
    icon: Clock,
    title: 'Minutes, not days',
    desc: 'Patients search, book, and pay without phone calls or paper forms.',
  },
  {
    icon: BarChart3,
    title: 'Operations intelligence',
    desc: 'Admins and assistants get queues, analytics, and approval workflows in one place.',
  },
];

const TREATMENTS = [
  { icon: Pill, title: 'Allopathic', desc: 'Evidence-based care for acute and chronic conditions.', type: 'allopathic' },
  { icon: Leaf, title: 'Homeopathic', desc: 'Personalized holistic protocols and follow-ups.', type: 'homeopathic' },
  { icon: Flower2, title: 'Herbal', desc: 'Plant-forward therapies rooted in traditional wellness.', type: 'herbal' },
];

const TESTIMONIALS = [
  {
    quote:
      'Doctor Hub replaced our clinic’s WhatsApp chaos. Patients book, pay, and get confirmed — we just show up.',
    name: 'Dr. Sarah Connor',
    role: 'Cardiologist · Lahore',
    initials: 'SC',
  },
  {
    quote:
      'As a patient I found a neurologist in two minutes. Uploading payment proof felt secure and transparent.',
    name: 'Alice Patient',
    role: 'Patient · Karachi',
    initials: 'AP',
  },
  {
    quote:
      'The assistant verification queue alone saved our front desk hours every week. This feels like real SaaS.',
    name: 'Mark Assistant',
    role: 'Clinic operations',
    initials: 'MA',
  },
];

const FALLBACK_DOCTORS = [
  { id: '1', name: 'Dr. Sarah Connor', specialization: 'Cardiologist', treatment_type: 'allopathic', city: 'Lahore', consultation_fee: 7500 },
  { id: '2', name: 'Dr. James Wilson', specialization: 'Neurologist', treatment_type: 'allopathic', city: 'Islamabad', consultation_fee: 9000 },
  { id: '3', name: 'Dr. Ayesha Khan', specialization: 'Dermatologist', treatment_type: 'herbal', city: 'Karachi', consultation_fee: 4500 },
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
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );

    const observe = () => {
      el.querySelectorAll('.lp-reveal:not(.is-visible), .lp-reveal-card:not(.is-visible)').forEach((n) =>
        observer.observe(n)
      );
    };
    observe();
    const raf = requestAnimationFrame(observe);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, deps);

  return ref;
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

  return (
    <div className="landing-page" ref={revealRef}>
      <HeroSection />

      <section className="lp-hero-search lp-reveal">
        <div className="lp-hero-search__inner">
          <div className="lp-field lp-field--inline">
            <label htmlFor="disease" className="sr-only">Condition</label>
            <input
              id="disease"
              placeholder="Search by condition…"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="lp-field lp-field--inline">
            <label htmlFor="city" className="sr-only">City</label>
            <input
              id="city"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <select
            id="treatment"
            className="lp-field-select"
            value={treatmentType}
            onChange={(e) => setTreatmentType(e.target.value)}
            aria-label="Treatment modality"
          >
            <option value="">All modalities</option>
            <option value="allopathic">Allopathic</option>
            <option value="homeopathic">Homeopathic</option>
            <option value="herbal">Herbal</option>
          </select>
          <button type="button" className="lp-btn lp-btn--primary" onClick={() => handleSearch()}>
            <Search size={18} />
            Search
          </button>
        </div>
        <div className="lp-chips">
          {QUICK_CHIPS.map((chip) => (
            <button key={chip} type="button" className="lp-chip" onClick={() => { setDisease(chip); handleSearch(chip); }}>
              {chip}
            </button>
          ))}
        </div>
      </section>

      <section className="lp-trust-strip" id="about">
        <div className="lp-trust-strip__inner">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="lp-trust-item">
              <Icon size={16} strokeWidth={2} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-stats" id="lp-stats">
        <div className="lp-stats__card">
          <StatCounter end={500} suffix="+" label="Verified doctors" revealIndex={0} />
          <StatCounter end={10000} suffix="+" label="Patients served" revealIndex={1} />
          <StatCounter end={3} suffix="" label="Treatment modalities" revealIndex={2} />
          <StatCounter end={98} suffix="%" label="Satisfaction rate" revealIndex={3} />
        </div>
      </section>

      <section className="lp-section" id="features">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Platform</p>
          <h2 className="lp-h2">Built for modern clinical teams</h2>
          <p className="lp-sub">Everything your healthcare operation needs — without legacy software baggage.</p>
        </div>
        <div className="lp-feature-grid">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <PremiumCard key={f.title} className="lp-feature-card" revealIndex={i}>
                <div className="lp-feature-card__icon">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </PremiumCard>
            );
          })}
        </div>
      </section>

      <section className="lp-section lp-section--alt" id="how-it-works">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Workflow</p>
          <h2 className="lp-h2">From search to confirmed visit</h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <PremiumCard key={step.title} className="lp-step" revealIndex={idx}>
                <span className="lp-step__num">{idx + 1}</span>
                <div className="lp-step__icon">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </PremiumCard>
            );
          })}
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Modalities</p>
          <h2 className="lp-h2">Every path to wellness</h2>
        </div>
        <div className="lp-treatment-grid">
          {TREATMENTS.map((t, i) => {
            const Icon = t.icon;
            return (
              <PremiumCard key={t.type} className="lp-treatment" revealIndex={i}>
                <div className="lp-treatment__icon">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <Link to={`/doctors?treatment_type=${t.type}`} className="lp-link-arrow">
                  Explore specialists <ArrowRight size={14} />
                </Link>
              </PremiumCard>
            );
          })}
        </div>
      </section>

      <section className="lp-section lp-section--alt">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Practitioners</p>
          <h2 className="lp-h2">Featured doctors</h2>
        </div>
        <div className="lp-doctors-grid">
          {doctorsLoading
            ? [0, 1, 2].map((i) => (
                <article key={i} className="lp-doctor lp-doctor--skel">
                  <div className="lp-skel lp-skel--avatar" />
                  <div className="lp-skel" style={{ height: 16, width: '60%', margin: '1rem auto' }} />
                </article>
              ))
            : doctors.map((doc, idx) => {
                const userName = doc.User?.name || doc.name || 'Doctor';
                const spec = doc.specialization || 'Physician';
                const treatment = doc.treatment_type || 'allopathic';
                const docCity =
                  (Array.isArray(doc.Clinics) && doc.Clinics[0]?.city) || doc.city || 'Pakistan';
                return (
                  <PremiumCard key={doc.id} className="lp-doctor" revealIndex={idx}>
                    <div className="lp-doctor__avatar">{getInitials(userName)}</div>
                    <h4>{userName}</h4>
                    <p className="lp-doctor__spec">{spec}</p>
                    <span className="lp-doctor__badge">{treatment}</span>
                    <p className="lp-doctor__city">
                      <MapPin size={12} /> {docCity}
                    </p>
                    <p className="lp-doctor__fee">{formatCurrency(doc.consultation_fee)}</p>
                    <Link to={`/doctors/${doc.id}`} className="lp-btn lp-btn--primary lp-btn--block">
                      Book now
                    </Link>
                  </PremiumCard>
                );
              })}
        </div>
        <div className="lp-section-cta lp-reveal">
          <Link to="/doctors" className="lp-btn lp-btn--secondary">
            View all doctors <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Testimonials</p>
          <h2 className="lp-h2">Trusted by patients and clinics</h2>
        </div>
        <div className="lp-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <PremiumCard
              key={t.name}
              as="blockquote"
              className="lp-testimonial"
              variant="testimonial"
              revealIndex={i}
            >
              <p>{t.quote}</p>
              <footer>
                <span className="lp-testimonial__avatar">{t.initials}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </footer>
            </PremiumCard>
          ))}
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-cta__inner lp-reveal">
          <p className="lp-eyebrow lp-eyebrow--light">Get started</p>
          <h2 className="lp-cta__title">Ready to simplify how your clinic delivers care?</h2>
          <p className="lp-cta__sub">
            Join patients and practitioners on Pakistan&apos;s modern healthcare booking platform.
          </p>
          <div className="lp-cta__actions">
            <Link to="/register" className="lp-btn lp-btn--white">
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link to="/doctors" className="lp-btn lp-btn--outline-light">
              Browse doctors
            </Link>
          </div>
          <p className="lp-cta__trust">
            No credit card · Admin-approved doctors · PKR payments
          </p>
        </div>
      </section>

      <footer className="lp-footer" id="contact">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <Link to="/" className="lp-footer__logo">
              <Stethoscope size={22} />
              <span>Doctor Hub</span>
            </Link>
            <p>Pakistan&apos;s trusted healthcare consultation platform.</p>
          </div>
          <div className="lp-footer__links">
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Contact</a>
          </div>
        </div>
        <p className="lp-footer__copy">© 2025 Doctor Hub. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
