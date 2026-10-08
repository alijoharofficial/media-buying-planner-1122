import { useId } from 'react';
import { BRAND_NAME, BRAND_SHORT } from '@/lib/brand';
import { cn } from '@/lib/cn';

type LogoProps = {
  /** full = icon + "Media Buying Planner", compact = icon + "MB Planner", icon = mark only */
  variant?: 'full' | 'compact' | 'icon';
  /** Icon height in px. Wordmark scales with it. */
  size?: number;
  className?: string;
  /** Inside a link: expose the visible wordmark as text so the link's name matches what is shown. */
  asText?: boolean;
};

/** Icon geometry, shared with app/icon.svg and the generated PNG icons. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id={`mbp-bg-${id}`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#312E81" />
          <stop offset="1" stopColor="#1E2A78" />
        </linearGradient>
        <linearGradient id={`mbp-ar-${id}`} x1="8" y1="36" x2="40" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#mbp-bg-${id})`} />
      <rect x="10" y="28" width="6" height="10" rx="2" fill="#FFFFFF" fillOpacity="0.35" />
      <rect x="21" y="22" width="6" height="16" rx="2" fill="#FFFFFF" fillOpacity="0.55" />
      <rect x="32" y="16" width="6" height="22" rx="2" fill="#FFFFFF" fillOpacity="0.8" />
      <path
        d="M9 26 L19 18 L26 22 L38 11"
        stroke={`url(#mbp-ar-${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M31.5 10.5 H38.5 V17.5" stroke="#22D3EE" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ variant = 'full', size = 32, className, asText = false }: LogoProps) {
  if (variant === 'icon') {
    return (
      <span role="img" aria-label={BRAND_NAME} className={cn('inline-flex', className)}>
        <LogoMark size={size} />
      </span>
    );
  }

  const [first, ...rest] = (variant === 'full' ? BRAND_NAME : BRAND_SHORT).split(' ');
  const last = rest.pop();

  return (
    <span
      role={asText ? undefined : 'img'}
      aria-label={asText ? undefined : BRAND_NAME}
      className={cn('inline-flex items-center gap-2.5 font-bold tracking-tight text-fg', className)}
      style={{ fontSize: size * 0.56 }}
      dir="ltr"
    >
      <LogoMark size={size} />
      <span aria-hidden={asText ? undefined : true} className="whitespace-nowrap leading-none">
        {[first, ...rest].join(' ')} <span className="text-accent">{last}</span>
      </span>
    </span>
  );
}
