import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Editorial Clinical Domain Header.
 * 
 * @param {{
 *   title: string;
 *   description?: string;
 *   tag?: string;
 *   badgeVariant?: 'neutral' | 'accent' | 'warning' | 'danger';
 *   actions?: React.ReactNode;
 *   className?: string;
 * }} props
 */
export function DomainHeader({
  title,
  description,
  tag,
  actions,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 mb-6',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
            {title}
          </h1>
          {tag && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 rounded-xs">
              {tag}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default DomainHeader;
