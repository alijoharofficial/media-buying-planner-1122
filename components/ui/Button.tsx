import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type StyleProps = { variant?: Variant; size?: Size; shimmer?: boolean; className?: string };

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[transform,box-shadow,background-color,color] duration-200 focus-glow disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg shadow-soft hover:-translate-y-0.5 hover:shadow-lift hover:bg-accent-strong',
  secondary: 'border border-border-strong bg-surface text-fg hover:-translate-y-0.5 hover:border-accent hover:text-accent',
  ghost: 'text-fg-muted hover:bg-surface-muted hover:text-fg',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
};

export function buttonClasses({ variant = 'primary', size = 'md', shimmer, className }: StyleProps) {
  return cn(base, variants[variant], sizes[size], shimmer && 'shimmer', className);
}

export function Button({ variant, size, shimmer, className, type = 'button', ...props }: StyleProps & ComponentProps<'button'>) {
  return <button type={type} className={buttonClasses({ variant, size, shimmer, className })} {...props} />;
}

/** Internal locale-aware link styled as a button. */
export function ButtonLink({
  variant,
  size,
  shimmer,
  className,
  children,
  ...props
}: StyleProps & ComponentProps<typeof Link> & { children: ReactNode }) {
  return (
    <Link className={buttonClasses({ variant, size, shimmer, className })} {...props}>
      {children}
    </Link>
  );
}
