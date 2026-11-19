import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-sm border border-zinc-200/90 bg-white text-zinc-950 transition-colors',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1 p-4 pb-2.5', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        'font-semibold text-sm leading-snug tracking-tight text-zinc-900',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-xs text-zinc-600 leading-relaxed', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={cn('p-4 pt-0', className)} {...props} />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex items-center p-4 pt-3 border-t border-zinc-100', className)}
      {...props}
    />
  );
}
