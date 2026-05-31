import PremiumCard from './PremiumCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Shield,
  Star,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

const TRUST_STATS = [
  { icon: Users, value: '10,000+', label: 'Patients trust us' },
  { icon: Shield, value: 'Secure', label: 'Clinical-grade security' },
  { icon: Clock, value: '24/7', label: 'Healthcare access' },
];

const AVATARS = ['AP', 'SC', 'JW', 'MK', 'RH'];

const PARTICLES = [
  { left: '12%', top: '20%', dx: 24, dy: -18, dur: 28, delay: 0 },
  { left: '78%', top: '15%', dx: -20, dy: 22, dur: 34, delay: -5 },
  { left: '65%', top: '72%', dx: 16, dy: -14, dur: 26, delay: -11 },
  { left: '22%', top: '68%', dx: -18, dy: -20, dur: 32, delay: -8 },
  { left: '48%', top: '8%', dx: 12, dy: 16, dur: 30, delay: -14 },
  { left: '88%', top: '44%', dx: -22, dy: 10, dur: 36, delay: -3 },
  { left: '6%', top: '42%', dx: 20, dy: 12, dur: 24, delay: -18 },
  { left: '35%', top: '88%', dx: -14, dy: -16, dur: 38, delay: -9 },
  { left: '92%', top: '78%', dx: -10, dy: -22, dur: 29, delay: -16 },
  { left: '54%', top: '55%', dx: 18, dy: 8, dur: 33, delay: -6 },
  { left: '18%', top: '32%', dx: 14, dy: 20, dur: 27, delay: -12 },
  { left: '72%', top: '28%', dx: -16, dy: 18, dur: 31, delay: -20 },
];

/* viewBox 560×560 — hub at (280, 280) */
const VB = 560;
const CX = 280;
const CY = 280;
const ORBIT_R = 142;
const RING_RADII = [74, 108, 142, 178];

const NODES = [
  { id: 'patient', label: 'Patient', icon: User, x: CX, y: CY - ORBIT_R },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, x: CX - ORBIT_R, y: CY },
  { id: 'appointment', label: 'Appointment', icon: Calendar, x: CX + ORBIT_R, y: CY },
  { id: 'payment', label: 'Payment', icon: CreditCard, x: CX - ORBIT_R * 0.707, y: CY + ORBIT_R * 0.707 },
  { id: 'records', label: 'Records', icon: FileText, x: CX + ORBIT_R * 0.707, y: CY + ORBIT_R * 0.707 },
];

const pct = (v) => `${(v / VB) * 100}%`;

const STATUS_CARDS = [
  {
    id: 'appt',
    title: 'Appointment Confirmed',
    detail: 'Tomorrow · 2:30 PM',
    icon: Calendar,
    slot: 'tl',
  },
  {
    id: 'pay',
    title: 'Secure Payment',
    detail: 'Rs 7,500 · Approved',
    icon: Shield,
    badge: 'Verified',
    slot: 'tr',
  },
  {
    id: 'rec',
    title: 'Record Updated',
    detail: 'Prescription logged · 2 mins ago',
    icon: FileText,
    slot: 'br',
  },
];

function FlowLine({ x2, y2, index }) {
  const duration = 5 + (index % 2) * 0.5;
  return (
    <line
      x1={CX}
      y1={CY}
      x2={x2}
      y2={y2}
      className="hero-net__flow-line"
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${index * 0.4}s`,
      }}
    />
  );
}

function HeroNetwork() {
  return (
    <div className="hero-net" aria-hidden="true">
      <div className="hero-net__ambient" />
      <div className="hero-net__glow" />
      <div className="hero-net__glow hero-net__glow--soft" />

      <div className="hero-net__stage">
        <div className="hero-net__particles">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="hero-net__particle"
              style={{
                left: p.left,
                top: p.top,
                '--p-dx': `${p.dx}px`,
                '--p-dy': `${p.dy}px`,
                '--p-dur': `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <svg className="hero-net__svg" viewBox={`0 0 ${VB} ${VB}`} fill="none">
          {RING_RADII.map((r, i) => (
            <circle
              key={r}
              cx={CX}
              cy={CY}
              r={r}
              stroke={i === 2 ? 'rgba(29, 158, 117, 0.16)' : 'rgba(29, 158, 117, 0.1)'}
              strokeWidth="1"
              strokeDasharray={i === 2 ? 'none' : '2 10'}
              fill="none"
            />
          ))}

          {NODES.map(({ x, y }, i) => (
            <FlowLine key={NODES[i].id} x2={x} y2={y} index={i} />
          ))}
        </svg>

        <div className="hero-net__hub-anchor">
          <motion.div
            className="hero-net__hub-wrap"
            initial={{ scale: 0.94, opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-net__hub-conic" />
            <div className="hero-net__hub-glow-pulse" />
            <div className="hero-net__hub-ring hero-net__hub-ring--outer" />
            <div className="hero-net__hub">
              <Stethoscope size={32} strokeWidth={1.75} />
              <span>Doctor Hub</span>
            </div>
          </motion.div>
        </div>

        {NODES.map(({ id, label, icon: Icon, x, y }, i) => (
          <div
            key={id}
            className="hero-net__node-anchor"
            style={{
              left: pct(x),
              top: pct(y),
              '--micro-dur': `${32 + i * 1.5}s`,
              '--micro-delay': `${i * -5.5}s`,
            }}
          >
            <div className="hero-net__node-micro">
              <div className="hero-net__node">
                <div className="hero-net__node-icon">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <span>{label}</span>
              </div>
            </div>
          </div>
        ))}

        {STATUS_CARDS.map(({ id, title, detail, icon: Icon, badge, slot }, i) => (
          <div key={id} className={`hero-net__card-anchor hero-net__card-anchor--${slot}`}>
            <article
              className="hero-net__card hero-net__card--animated"
              style={{
                '--card-enter-delay': `${0.9 + i * 0.3}s`,
                '--card-breath-dur': `${10 + i}s`,
                '--card-breath-phase': `${i * 2.8}s`,
              }}
            >
              <div className="hero-net__card-shine" aria-hidden="true" />
              <div className="hero-net__card-icon">
                <Icon size={16} strokeWidth={2} />
              </div>
              <div className="hero-net__card-body">
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
              {badge ? (
                <span className="hero-net__card-badge">{badge}</span>
              ) : (
                <CheckCircle size={16} className="hero-net__card-check" strokeWidth={2.5} />
              )}
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-bg" aria-hidden="true">
        <div className="lp-hero-bg__mesh" />
        <div className="lp-hero-bg__mesh-grid" />
        <div className="lp-hero-bg__radial lp-hero-bg__radial--1" />
        <div className="lp-hero-bg__radial lp-hero-bg__radial--2" />
        <div className="lp-hero-bg__radial lp-hero-bg__radial--3" />
      </div>

      <div className="lp-hero-stage">
        <div className="lp-hero-copy">
          <motion.span
            className="lp-hero-badge"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            Healthcare platform · Pakistan
          </motion.span>

          <motion.h1
            className="lp-hero-title"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Book care with clarity.
            <span className="lp-hero-title__line2">
              <span className="lp-hero-title__teal">Manage it</span> in one place.
            </span>
          </motion.h1>

          <motion.p
            className="lp-hero-lead"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Doctor Hub connects patients, doctors, assistants, and admins — search specialists,
            book visits, verify payments, and manage records in one secure workflow.
          </motion.p>

          <motion.div
            className="lp-hero-cta"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <Link to="/doctors" className="lp-btn lp-btn--primary lp-btn--shine">
              Find a doctor
              <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="lp-btn lp-btn--secondary lp-btn--animated-border">
              Create account
            </Link>
          </motion.div>

          <motion.div
            className="lp-hero-stats"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            {TRUST_STATS.map(({ icon: Icon, value, label }, i) => (
              <PremiumCard
                key={label}
                as="div"
                className="lp-hero-stat lp-premium-card--compact"
                reveal={false}
                style={{ animationDelay: `${0.15 * i}s` }}
              >
                <div className="lp-hero-stat__icon">
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </PremiumCard>
            ))}
          </motion.div>

          <motion.div
            className="lp-hero-social"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
          >
            <div className="lp-hero-social__avatars">
              {AVATARS.map((initials, i) => (
                <span key={initials} className="lp-hero-social__avatar" style={{ zIndex: AVATARS.length - i }}>
                  {initials}
                </span>
              ))}
            </div>
            <div className="lp-hero-social__rating">
              <span className="lp-hero-social__stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#F59E0B" stroke="#F59E0B" />
                ))}
              </span>
              <span>4.9/5 from 1,200+ reviews</span>
            </div>
          </motion.div>
        </div>

        <HeroNetwork />
      </div>
    </section>
  );
}
