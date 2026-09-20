import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("text-fg", className)} aria-hidden="true">
      <rect x="4" y="7" width="24" height="3.2" rx="0.4" fill="currentColor" />
      <rect x="4" y="14.4" width="18" height="3.2" rx="0.4" fill="currentColor" opacity="0.72" />
      <rect x="4" y="21.8" width="12" height="3.2" rx="0.4" fill="currentColor" opacity="0.42" />
    </svg>
  );
}

export function Wordmark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 text-fg", className)}>
      <Mark className="size-7" />
      {compact ? null : (
        <span className="font-display text-xl tracking-tight" style={{ fontVariationSettings: '"opsz" 72' }}>
          Floor
        </span>
      )}
    </Link>
  );
}
