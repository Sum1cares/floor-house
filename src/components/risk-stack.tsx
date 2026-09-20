import { Link } from "@tanstack/react-router";
import { BOOKS } from "@/lib/tiers";
import { cn } from "@/lib/utils";

const LINKS = {
  ground: "/vaults",
  climb: "/vaults",
  penthouse: "/vaults",
} as const;

export function RiskStack({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {(Object.keys(BOOKS) as Array<keyof typeof BOOKS>).map((id) => {
        const b = BOOKS[id];
        return (
          <Link
            key={id}
            to={LINKS[id]}
            search={{ book: id }}
            className="rounded-2xl bg-surface p-4 hairline"
          >
            <p className="text-xs tracking-wide text-subtle uppercase">{b.kicker}</p>
            <p className="mt-1 font-display text-xl">{b.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{b.blurb}</p>
          </Link>
        );
      })}
    </div>
  );
}
