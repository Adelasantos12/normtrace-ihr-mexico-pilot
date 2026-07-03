import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

// Single source of truth for the "preliminary pilot" messaging (Phase 3-UX).
// Previously this wording/styling was duplicated ad hoc in LandingPage and
// Layout; both now render this component instead of independent copies.
export const PRELIMINARY_BANNER_TEXT = 'Preliminary pilot — expert review required';

export function PreliminaryBanner({
  variant = 'pill',
  onClick,
  className,
}: {
  variant?: 'pill' | 'sidebar';
  onClick?: () => void;
  className?: string;
}) {
  if (variant === 'sidebar') {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 hover:bg-amber-100 transition-colors text-left",
          className
        )}
      >
        <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[9px] font-bold text-amber-800 uppercase tracking-tight leading-tight">
          {PRELIMINARY_BANNER_TEXT}
          <br />
          <span className="text-amber-700 font-normal mt-1 block normal-case">View legal caveats</span>
        </p>
      </button>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-full text-[10px] font-bold border border-amber-200",
        className
      )}
    >
      <AlertCircle size={11} className="shrink-0" />
      {PRELIMINARY_BANNER_TEXT}
    </span>
  );
}
