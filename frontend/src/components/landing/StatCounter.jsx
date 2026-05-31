import React, { useState, useEffect, useRef } from 'react';

export default function StatCounter({ end, suffix, label, revealIndex = 0 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        const start = performance.now();
        const dur = 1600;
        const step = (t) => {
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - (1 - p) ** 3;
          setValue(Math.round(eased * end));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.25 }
    );

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
        : `${value.toLocaleString('en-PK')}${suffix}`;

  return (
    <div
      ref={ref}
      className="lp-stat lp-reveal-card"
      style={{ '--reveal-delay': `${revealIndex * 0.12}s` }}
    >
      <div className="lp-stat__num">{display}</div>
      <div className="lp-stat__label">{label}</div>
    </div>
  );
}
