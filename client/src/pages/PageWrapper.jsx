import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

/**
 * Editorial Clinical Page Wrapper with Breadcrumb navigation back to Homescreen.
 * 
 * @param {{
 *   domainId: string;
 *   title: string;
 *   tag?: string;
 *   badgeVariant?: 'neutral' | 'accent' | 'warning' | 'danger';
 *   onNavigateHome: () => void;
 *   children: React.ReactNode;
 * }} props
 */
export function PageWrapper({
  domainId,
  title,
  tag,
  onNavigateHome,
  children,
}) {
  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2 text-xs">
          <Button
            size="xs"
            variant="ghost"
            onClick={onNavigateHome}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
            className="text-zinc-600 hover:text-zinc-950 px-1.5"
          >
            Homescreen
          </Button>
          <span className="text-zinc-300">/</span>
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <span>{title}</span>
            {tag && (
              <span className="font-mono text-[10px] text-zinc-500 border border-zinc-200 bg-zinc-50 px-1 py-0.2 rounded-xs uppercase">
                {tag}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateHome}
          className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 transition-colors font-mono text-[11px]"
          title="Return to Homescreen"
        >
          <Home className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span className="hidden sm:inline">Overview</span>
        </button>
      </div>

      {/* Feature Content */}
      {children}
    </div>
  );
}

export default PageWrapper;
