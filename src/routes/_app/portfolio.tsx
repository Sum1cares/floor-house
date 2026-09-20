import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getPortfolio } from "@/lib/server/vaults";
import { CATEGORY_LABEL } from "@/lib/tiers";
import { compactDollars, dollars, pct, relativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultArt } from "@/components/vault-art";

export const Route = createFileRoute("/_app/portfolio")({ component: PortfolioPage });

function PortfolioPage() {
  const { user, isPending } = useCurrentUserState();
  const q = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => getPortfolio(),
    enabled: Boolean(user),
  });
  if (isPending) return <Skeleton className="h-64 rounded-3xl" />;
  if (!user) return <RedirectToSignIn />;
  if (q.isLoading) return <Skeleton className="h-64 rounded-3xl" />;
  const data = q.data;
  if (!data) return null;
  const invested = data.vaults.reduce((s, v) => s + v.amount_cents, 0);
  const marketCost = data.markets.reduce((s, m) => s + m.amount_cents, 0);
  const mark = data.markets.reduce((s, m) => {
    const px = m.side === "yes" ? m.yes_price : 100 - m.yes_price;
    return s + m.shares * px;
  }, 0);
  const yieldW =
    invested === 0 ? 0 : data.vaults.reduce((s, v) => s + v.yield_bps * v.amount_cents, 0) / invested;

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">Your book</p>
      <h1 className="font-display text-4xl tracking-tight">Portfolio</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Buying power" value={dollars(data.profile.cash_cents)} />
        <Stat label="In vaults" value={compactDollars(invested)} hint={invested ? `${pct(Math.round(yieldW))} blended` : "—"} />
        <Stat
          label="Markets mark"
          value={compactDollars(mark)}
          hint={`Cost ${compactDollars(marketCost)}`}
        />
      </div>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Vaults</h2>
        {data.vaults.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No positions yet.{" "}
            <Link to="/vaults" className="underline">
              Open a vault
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.vaults.map((v) => (
              <li key={v.vault_id}>
                <Link
                  to="/vaults/$slug"
                  params={{ slug: v.slug }}
                  className="flex items-center gap-4 rounded-2xl bg-surface p-3 hairline"
                >
                  <VaultArt artKey={v.art_key} className="h-16 w-24 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{v.name}</p>
                    <p className="text-xs text-muted">{CATEGORY_LABEL[v.category] ?? v.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm">{dollars(v.amount_cents)}</p>
                    <p className="text-xs text-muted">{pct(v.yield_bps)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Prediction book</h2>
        {data.markets.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No contracts.{" "}
            <Link to="/markets" className="underline">
              Visit the wall
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl bg-surface hairline">
            {data.markets.map((m) => (
              <li key={`${m.market_id}-${m.side}`} className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm">{m.question}</p>
                  <p className="text-xs uppercase text-subtle">
                    {m.side} · {m.shares} sh @ {m.avg_price}¢
                  </p>
                </div>
                <span className="tabular text-sm">{compactDollars(m.amount_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {data.orders.length ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Bazaar</h2>
          <ul className="mt-4 divide-y divide-border rounded-2xl bg-surface hairline">
            {data.orders.map((o) => (
              <li key={o.id} className="flex justify-between px-4 py-3 text-sm">
                <span>{o.title}</span>
                <span className="tabular">{o.amount_cents ? dollars(o.amount_cents) : "Intro"}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="mt-10">
        <h2 className="font-display text-2xl">Commons</h2>
        {data.commons.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No donated slots yet.{" "}
            <Link to="/commons" className="underline">
              The house unlocks more as it grows
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.commons.map((b) => (
              <li key={b.benefit_id}>
                <Link
                  to="/commons/$slug"
                  params={{ slug: b.slug }}
                  className="flex items-center gap-4 rounded-2xl bg-surface p-3 hairline"
                >
                  <VaultArt artKey={b.art_key} className="h-16 w-24 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{b.name}</p>
                    <p className="text-xs text-muted">
                      {CATEGORY_LABEL[b.category] ?? b.category} · {b.location}
                    </p>
                  </div>
                  <p className="text-xs text-subtle">{relativeTime(b.created_at)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-surface p-5 hairline">
      <p className="text-xs text-subtle">{label}</p>
      <p className="mt-1 font-display text-2xl tabular">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
