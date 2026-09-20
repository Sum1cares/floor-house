import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MarketBar } from "@/components/market-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import { getMarket, tradeMarket } from "@/lib/server/markets";
import { compactDollars, relativeTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/markets/$slug")({
  loader: ({ params }) => getMarket({ data: { slug: params.slug } }),
  component: MarketPage,
});

function MarketPage() {
  const { slug } = Route.useParams();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["market", slug], queryFn: () => getMarket({ data: { slug } }), initialData: Route.useLoaderData() });
  const [amount, setAmount] = useState("25");
  const trade = useMutation({
    mutationFn: (side: "yes" | "no") =>
      tradeMarket({
        data: {
          marketId: q.data!.id,
          side,
          amountCents: Math.round(Number(amount) * 100),
        },
      }),
    onSuccess: (res, side) => {
      toast.success(`Filled ${res.shares} ${side.toUpperCase()} shares.`);
      void qc.invalidateQueries({ queryKey: ["market", slug] });
      void qc.invalidateQueries({ queryKey: ["markets"] });
      void qc.invalidateQueries({ queryKey: ["me"] });
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: toastErr,
  });

  if (q.isLoading) return <Skeleton className="h-80 rounded-3xl" />;
  const market = q.data;
  if (!market) {
    return (
      <div>
        <h1 className="font-display text-3xl">Market not found</h1>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/markets">All markets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">
        {market.category} · Open on Ground
      </p>
      <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
        {market.question}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{market.description}</p>
      <p className="mt-2 text-xs text-subtle">
        Closes {relativeTime(market.closes_at)} · {compactDollars(market.volume_cents)} volume ·{" "}
        {market.traders.toLocaleString()} traders
      </p>
      <div className="mt-8 rounded-3xl bg-surface p-6 hairline">
        <MarketBar yes={market.yes_price} />
        <div className="mt-4 flex justify-between text-sm">
          <span className="tabular text-yes">Yes {market.yes_price}¢</span>
          <span className="tabular text-no">No {100 - market.yes_price}¢</span>
        </div>
        {user ? (
          <form className="mt-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
            <label className="text-xs text-muted">
              Stake (USD)
              <Input
                className="mt-1"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                className="bg-yes text-accent-fg hover:opacity-90"
                disabled={trade.isPending}
                onClick={() => trade.mutate("yes")}
              >
                Buy Yes
              </Button>
              <Button
                type="button"
                className="bg-no text-accent-fg hover:opacity-90"
                disabled={trade.isPending}
                onClick={() => trade.mutate("no")}
              >
                Buy No
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-muted">Sign in to take a side.</p>
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: `/markets/${slug}` })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
