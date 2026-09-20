import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MarketCard } from "@/components/market-card";
import { Skeleton } from "@/components/ui/skeleton";
import { listMarkets } from "@/lib/server/markets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/markets/")({
  loader: () => listMarkets(),
  component: MarketsPage,
});

function MarketsPage() {
  const initial = Route.useLoaderData();
  const q = useQuery({ queryKey: ["markets"], queryFn: () => listMarkets(), initialData: initial });
  const [cat, setCat] = useState("all");
  const cats = ["all", ...Array.from(new Set((q.data ?? []).map((m) => m.category)))];
  const rows = (q.data ?? []).filter((m) => cat === "all" || m.category === cat);

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">Open on Ground</p>
      <h1 className="font-display text-4xl tracking-tight">Markets</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Ground owns the wall. Occupancy, a Fed cut, McDonald’s same-store. The casino is labeled.
        It sits next to the assets it is gossiping about.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium capitalize hairline",
              cat === c ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {q.isPending && !q.data
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-3xl" />)
          : rows.map((m) => <MarketCard key={m.id} market={m} />)}
      </div>
    </div>
  );
}
