import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * @typedef {'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger'} ButtonVariant
 * @typedef {'xs' | 'sm' | 'md' | 'lg'} ButtonSize
 */

/**
 * Disciplined clinical button primitive.
 * Zero glowing gradients, crisp hairline borders, sharp geometry.
 * 
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: ButtonVariant;
 *   size?: ButtonSize;
 *   isLoading?: boolean;
 *   leftIcon?: React.ReactNode;
 *   rightIcon?: React.ReactNode;
 * }} props
 */
export const Button = React.forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    type = 'button',
    ...props
  },
  ref
) {
  const variantStyles = {
    primary:
      'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 disabled:bg-zinc-200 disabled:text-zinc-400',
    secondary:
      'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-300',
    outline:
      'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-300',
    ghost:
      'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 disabled:text-zinc-300',
    accent:
      'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 disabled:bg-zinc-300',
    danger:
      'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] disabled:bg-red-200',
  };

  const sizeStyles = {
    xs: 'h-6 px-2 text-xs rounded-sm gap-1',
    sm: 'h-7 px-2.5 text-xs font-medium rounded-sm gap-1.5',
    md: 'h-8 px-3 text-xs sm:text-sm font-medium rounded-sm gap-1.5',
    lg: 'h-9 px-4 text-sm font-medium rounded-sm gap-2',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center select-none font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
});

export default Button;
