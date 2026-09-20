import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { Market } from "@/lib/types";
import { compactDollars } from "@/lib/utils";

export function MarketBar({ yes }: { yes: number }) {
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-elevated">
      <div className="h-full bg-yes" style={{ width: `${yes}%` }} />
      <div className="h-full bg-no" style={{ width: `${100 - yes}%` }} />
    </div>
  );
}

export function MarketCard({ market }: { market: Market }) {
  return (
    <Link
      to="/markets/$slug"
      params={{ slug: market.slug }}
      className="flex flex-col gap-4 rounded-3xl bg-surface p-5 hairline"
    >
      <div className="flex items-center justify-between gap-3">
        <Badge>{market.category}</Badge>
        <span className="text-xs text-subtle tabular">{compactDollars(market.volume_cents)} vol</span>
      </div>
      <h3 className="font-display text-lg leading-snug tracking-tight">{market.question}</h3>
      <MarketBar yes={market.yes_price} />
      <div className="flex items-center justify-between text-sm">
        <span className="tabular text-yes">Yes {market.yes_price}¢</span>
        <span className="tabular text-no">No {100 - market.yes_price}¢</span>
      </div>
    </Link>
  );
}
