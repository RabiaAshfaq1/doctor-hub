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
  Activity,
  Lock,
  Sparkles,
  ArrowRight,
  HeartPulse,
  BarChart3,
  Quote,
} from 'lucide-react';
import api from '../api/api';
import { formatCurrency } from '../utils/currency';
import './landing.css';

const HERO_LINE1 = ['Healthcare', 'booking,'];
const HERO_LINE2 = ['reimagined', 'for', '2026.'];

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

function useMagnetic(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.14;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.14;
      el.style.setProperty('--mag-x', `${x}px`);
      el.style.setProperty('--mag-y', `${y}px`);
    };
    const onLeave = () => {
      el.style.removeProperty('--mag-x');
      el.style.removeProperty('--mag-y');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);
}

function MagneticBtn({ className, children, ...props }) {
  const ref = useRef(null);
  useMagnetic(ref);
  return (
    <Link ref={ref} className={`${className} lp-btn--magnetic`} {...props}>
      {children}
    </Link>
  );
}

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
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );

    const observe = () => {
      el.querySelectorAll('.lp-reveal:not(.is-visible)').forEach((n) => observer.observe(n));
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
      const dur = 2200;
      const step = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - (1 - p) ** 3;
        setValue(Math.round(eased * end));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.2 });
    obs.observe(node);
    return () => obs.disconnect();
  }, [end]);

  const display =
    suffix === '%'
      ? `${value}%`
      : end === 10000
        ? value >= 10000
          ? '10,000+'
          : `${value.toLocaleString('en-PK')}+`
        : `${value}${suffix}`;

  return (
    <div className="lp-stat" ref={ref}>
      <div className="lp-stat__glow" aria-hidden="true" />
      <div className="lp-stat__num">{display}</div>
      <div className="lp-stat__label">{label}</div>
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

function HeroFloatCards() {
  return (
    <div className="lp-hero-visual" aria-hidden="true">
      <div className="lp-float lp-float--doctor">
        <div className="lp-float__header">
          <div className="lp-float__avatar">SC</div>
          <div>
            <strong>Dr. Sarah Connor</strong>
            <span>Cardiologist</span>
          </div>
          <span className="lp-pulse" title="Online" />
        </div>
        <div className="lp-float__meta">
          <span className="lp-float__tag">Verified</span>
          <span>4.9 ★</span>
        </div>
      </div>

      <div className="lp-float lp-float--appt">
        <Calendar size={16} />
        <div>
          <strong>Appointment confirmed</strong>
          <span>Tomorrow · 2:30 PM</span>
        </div>
        <CheckCircle size={18} className="lp-float__check" />
      </div>

      <div className="lp-float lp-float--chart">
        <div className="lp-float__chart-head">
          <Activity size={16} />
          <span>Platform health</span>
        </div>
        <div className="lp-float__bars">
          {[40, 65, 45, 80, 55, 90].map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <strong>98% satisfaction</strong>
      </div>

      <div className="lp-float lp-float--insight">
        <HeartPulse size={18} />
        <div>
          <strong>Care insight</strong>
          <span>Hypertension follow-up on track</span>
        </div>
      </div>

      <div className="lp-hero-icon lp-hero-icon--1">
        <Stethoscope size={20} />
      </div>
      <div className="lp-hero-icon lp-hero-icon--2">
        <Shield size={18} />
      </div>
    </div>
  );
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
    const hero = document.querySelector('.lp-hero');
    hero?.querySelectorAll('.lp-reveal').forEach((el) => el.classList.add('is-visible'));
  }, []);

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

  let wordDelay = 0;
  const renderWords = (words, accent = false) =>
    words.map((word, i) => {
      const delay = wordDelay++;
      return (
        <span
          key={`${word}-${i}`}
          className={`lp-hero-word ${accent ? 'lp-hero-word--accent' : ''}`}
          style={{ animationDelay: `${0.12 + delay * 0.07}s` }}
        >
          {word}{' '}
        </span>
      );
    });

  return (
    <div className="landing-page" ref={revealRef}>
      {/* ─── HERO ─── */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-bg" aria-hidden="true">
          <div className="lp-orb lp-orb--1" />
          <div className="lp-orb lp-orb--2" />
          <div className="lp-orb lp-orb--3" />
          <div className="lp-ray lp-ray--1" />
          <div className="lp-ray lp-ray--2" />
          <div className="lp-mesh-gradient" />
          <div className="lp-noise" />
          <div className="lp-grid-lines" />
          <div className="lp-particles" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="lp-particle" style={{ '--i': i }} />
            ))}
          </div>
        </div>

        <div className="lp-hero-stage">
          <div className="lp-hero-copy">
            <div className="lp-badge lp-reveal">
              <span className="lp-badge__dot" />
              Trusted healthcare platform · Pakistan
            </div>

            <h1 className="lp-hero-title">
              <span className="lp-hero-title__line">{renderWords(HERO_LINE1, false)}</span>
              <span className="lp-hero-title__line lp-hero-title__line--accent">
                {renderWords(HERO_LINE2, true)}
              </span>
            </h1>

            <p className="lp-hero-lead lp-reveal" style={{ transitionDelay: '0.35s' }}>
              The modern care OS for patients, doctors, assistants, and admins — search specialists,
              book visits, verify payments, and manage clinical records in one beautiful workflow.
            </p>

            <div className="lp-hero-cta lp-reveal" style={{ transitionDelay: '0.45s' }}>
              <MagneticBtn to="/doctors" className="lp-btn lp-btn--primary lp-btn--shine">
                Find a doctor
                <ArrowRight size={18} />
              </MagneticBtn>
              <MagneticBtn to="/register" className="lp-btn lp-btn--glass">
                Create free account
              </MagneticBtn>
            </div>

            <div className="lp-search-glass lp-reveal" style={{ transitionDelay: '0.55s' }}>
              <div className="lp-search-grid">
                <div className="lp-field">
                  <label htmlFor="disease">Condition</label>
                  <input
                    id="disease"
                    placeholder="Fever, diabetes…"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="lp-field">
                  <label htmlFor="treatment">Modality</label>
                  <select id="treatment" value={treatmentType} onChange={(e) => setTreatmentType(e.target.value)}>
                    <option value="">All types</option>
                    <option value="allopathic">Allopathic</option>
                    <option value="homeopathic">Homeopathic</option>
                    <option value="herbal">Herbal</option>
                  </select>
                </div>
                <div className="lp-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    placeholder="Lahore, Karachi…"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button type="button" className="lp-btn lp-btn--primary lp-btn--search lp-btn--shine" onClick={() => handleSearch()}>
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
            </div>
          </div>

          <HeroFloatCards />
        </div>

        <button type="button" className="lp-scroll-hint" onClick={() => document.getElementById('lp-stats')?.scrollIntoView({ behavior: 'smooth' })} aria-label="Scroll">
          <ChevronDown size={24} />
        </button>
      </section>

      {/* Trust strip */}
      <section className="lp-trust-strip">
        <div className="lp-trust-strip__inner">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="lp-trust-item">
              <Icon size={18} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="lp-stats" id="lp-stats">
        <div className="lp-stats__card lp-reveal">
          <StatCounter end={500} suffix="+" label="Verified doctors" />
          <StatCounter end={10000} suffix="+" label="Patients served" />
          <StatCounter end={3} suffix="" label="Treatment modalities" />
          <StatCounter end={98} suffix="%" label="Satisfaction rate" />
        </div>
      </section>

      {/* Features */}
      <section className="lp-section">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Platform</p>
          <h2 className="lp-h2">
            Built for <span className="lp-text-gradient">modern clinical teams</span>
          </h2>
          <p className="lp-sub">Everything your healthcare operation needs — without the legacy software baggage.</p>
        </div>
        <div className="lp-feature-grid">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <article key={f.title} className="lp-feature-card lp-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="lp-feature-card__icon">
                  <Icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section lp-section--mesh">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Workflow</p>
          <h2 className="lp-h2">From search to <span className="lp-text-gradient">confirmed visit</span></h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="lp-step lp-reveal" style={{ transitionDelay: `${idx * 0.08}s` }}>
                <div className="lp-step__icon">
                  <span className="lp-step__num">{idx + 1}</span>
                  <Icon size={22} />
                </div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Treatments */}
      <section className="lp-section">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Modalities</p>
          <h2 className="lp-h2">Every path to <span className="lp-text-gradient">wellness</span></h2>
        </div>
        <div className="lp-treatment-grid">
          {TREATMENTS.map((t, i) => {
            const Icon = t.icon;
            return (
              <article key={t.type} className="lp-treatment lp-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="lp-treatment__icon">
                  <Icon size={26} />
                </div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <Link to={`/doctors?treatment_type=${t.type}`} className="lp-link-arrow">
                  Explore specialists <ArrowRight size={14} />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Featured doctors */}
      <section className="lp-section lp-section--alt">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Practitioners</p>
          <h2 className="lp-h2">Featured <span className="lp-text-gradient">doctors</span></h2>
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
                  <article key={doc.id} className="lp-doctor lp-reveal" style={{ transitionDelay: `${idx * 0.12}s` }}>
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
                  </article>
                );
              })}
        </div>
        <div className="lp-section-cta lp-reveal">
          <Link to="/doctors" className="lp-btn lp-btn--glass">
            View all doctors <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="lp-section lp-section--mesh">
        <div className="lp-section-head lp-reveal">
          <p className="lp-eyebrow">Social proof</p>
          <h2 className="lp-h2">Loved by <span className="lp-text-gradient">patients & clinics</span></h2>
        </div>
        <div className="lp-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <blockquote key={t.name} className="lp-testimonial lp-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <Quote size={28} className="lp-testimonial__quote" />
              <p>{t.quote}</p>
              <footer>
                <span className="lp-testimonial__avatar">{t.initials}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-cta__bg" aria-hidden="true">
          <div className="lp-orb lp-orb--cta" />
          <div className="lp-ray lp-ray--cta" />
        </div>
        <div className="lp-cta__inner lp-reveal">
          <p className="lp-eyebrow lp-eyebrow--light">Get started today</p>
          <h2 className="lp-cta__title">Ready to transform how your clinic delivers care?</h2>
          <p className="lp-cta__sub">
            Join thousands of patients and practitioners on Pakistan&apos;s most modern healthcare booking platform.
          </p>
          <div className="lp-cta__actions">
            <MagneticBtn to="/register" className="lp-btn lp-btn--white lp-btn--shine">
              Start for free
              <ArrowRight size={18} />
            </MagneticBtn>
            <Link to="/doctors" className="lp-btn lp-btn--outline-light">
              Browse doctors
            </Link>
          </div>
          <p className="lp-cta__trust">
            <CheckCircle size={14} /> No credit card · Admin-approved doctors · PKR payments
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <Link to="/" className="lp-footer__logo">
              <Stethoscope size={24} />
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
