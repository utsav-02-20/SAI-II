import React from 'react';
import { cn } from '../../utils/cn';

/**
 * @typedef {'neutral' | 'accent' | 'warning' | 'danger' | 'outline'} BadgeVariant
 */

/**
 * Restrained clinical tag primitive.
 * Designed with disciplined 1px borders, high-contrast text, and zero pastel-pill bloating.
 * 
 * @param {React.HTMLAttributes<HTMLSpanElement> & {
 *   variant?: BadgeVariant;
 * }} props
 */
export function Badge({
  className,
  variant = 'neutral',
  children,
  ...props
}) {
  const variantStyles = {
    neutral: 'bg-zinc-50 text-zinc-700 border-zinc-200',
    accent: 'bg-zinc-100 text-zinc-800 border-zinc-300 font-mono',
    warning: 'bg-zinc-50 text-amber-900 border-amber-300/80 font-mono',
    danger: 'bg-red-50 text-red-700 border-red-200 font-mono',
    outline: 'bg-transparent text-zinc-600 border-zinc-200 font-mono',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] sm:text-[11px] font-medium border tracking-tight uppercase tabular-nums',
        variantStyles[variant] || variantStyles.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
