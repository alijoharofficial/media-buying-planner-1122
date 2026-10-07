import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

type CardProps = ComponentProps<'div'> & { glass?: boolean; interactive?: boolean };

export function Card({ glass, interactive, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border p-6 shadow-soft',
        glass ? 'glass' : 'bg-surface',
        interactive && 'transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
      {...props}
    />
  );
}
