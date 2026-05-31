import React from 'react';

/**
 * Premium SaaS card shell — entrance reveal, hover lift, glow, shine.
 * Pass `reveal={false}` for skeleton/loading placeholders.
 */
export default function PremiumCard({
  as: Component = 'article',
  className = '',
  reveal = true,
  revealIndex = 0,
  variant = 'default',
  style,
  children,
  ...props
}) {
  const classes = [
    'lp-premium-card',
    reveal ? 'lp-reveal-card' : '',
    variant !== 'default' ? `lp-premium-card--${variant}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = reveal
    ? { ...style, '--reveal-delay': `${revealIndex * 0.12}s` }
    : style;

  return (
    <Component className={classes} style={mergedStyle} {...props}>
      <span className="lp-premium-card__glow" aria-hidden="true" />
      <span className="lp-premium-card__shine" aria-hidden="true" />
      {children}
    </Component>
  );
}
