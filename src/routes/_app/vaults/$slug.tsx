import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MarketBar } from "@/components/market-card";
import { VaultArt } from "@/components/vault-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import { getVault, investInVault } from "@/lib/server/vaults";
import { CATEGORY_LABEL, TIERS, canAccess, type TierId } from "@/lib/tiers";
import { useProfile } from "@/lib/use-profile";
import { compactDollars, dollars, pct } from "@/lib/utils";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { fundedPct } from "@/components/vault-card";

export const Route = createFileRoute("/_app/vaults/$slug")({
  loader: ({ params }) => getVault({ data: { slug: params.slug } }),
  component: VaultPage,
});

function VaultPage() {
  const { slug } = Route.useParams();
  const user = useCurrentUser();
  const { data: me } = useProfile();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["vault", slug], queryFn: () => getVault({ data: { slug } }), initialData: Route.useLoaderData() });
  const [amount, setAmount] = useState("250");
  const invest = useMutation({
    mutationFn: () =>
      investInVault({
        data: {
          vaultId: q.data!.vault!.id,
          amountCents: Math.round(Number(amount) * 100),
        },
      }),
    onSuccess: (res) => {
      toast.success(`Deployed. You are now ${res.tier}.`);
      void qc.invalidateQueries({ queryKey: ["vault", slug] });
      void qc.invalidateQueries({ queryKey: ["vaults"] });
      void qc.invalidateQueries({ queryKey: ["me"] });
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: toastErr,
  });

  if (q.isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  const vault = q.data?.vault;
  if (!vault) {
    return (
      <div>
        <h1 className="font-display text-3xl">Vault not found</h1>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/vaults">All vaults</Link>
        </Button>
      </div>
    );
  }
  const tier = TIERS[vault.min_tier as TierId] ?? TIERS.ground;
  const locked = me?.profile ? !canAccess(me.profile.tier, vault.min_tier) : false;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <VaultArt artKey={vault.art_key} className="h-56 rounded-3xl sm:h-72" />
        <p className="mt-6 text-xs tracking-[0.22em] text-subtle uppercase">
          {vault.location} · {CATEGORY_LABEL[vault.category] ?? vault.category}
        </p>
        <h1 className="font-display text-4xl tracking-tight">{vault.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{vault.description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl bg-surface p-5 hairline">
            <h2 className="text-xs tracking-wide text-subtle uppercase">Thesis</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{vault.thesis}</p>
          </section>
          <section className="rounded-2xl bg-surface p-5 hairline">
            <h2 className="text-xs tracking-wide text-subtle uppercase">Risks</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{vault.risk}</p>
          </section>
        </div>
        {(q.data?.relatedMarkets ?? []).length ? (
          <section className="mt-8">
            <h2 className="font-display text-2xl">Linked markets</h2>
            <div className="mt-3 space-y-3">
              {q.data!.relatedMarkets.map((m) => (
                <Link
                  key={m.id}
                  to="/markets/$slug"
                  params={{ slug: m.slug }}
                  className="block rounded-2xl bg-surface p-4 hairline"
                >
                  <p className="text-sm">{m.question}</p>
                  <div className="mt-3">
                    <MarketBar yes={m.yes_price} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        {(q.data?.distributions ?? []).length ? (
          <section className="mt-8">
            <h2 className="font-display text-2xl">Distributions</h2>
            <ul className="mt-3 divide-y divide-border rounded-2xl bg-surface hairline">
              {q.data!.distributions.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>
                    {d.label}
                    <span className="ml-2 text-subtle">{d.occurred_on}</span>
                  </span>
                  <span className="tabular">{compactDollars(d.amount_cents)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24 self-start">
        <div className="rounded-3xl bg-surface p-5 hairline">
          <div className="flex items-center justify-between">
            <Badge>{tier.name} and above</Badge>
            <span className="text-xs text-muted">{vault.hold_years} yr hold</span>
          </div>
          <p className="mt-4 font-display text-3xl tabular">{pct(vault.yield_bps)}</p>
          <p className="text-xs text-muted">Target net yield</p>
          <Progress className="mt-4" value={fundedPct(vault)} />
          <p className="mt-2 text-xs tabular text-muted">
            {compactDollars(vault.raised_cents)} of {compactDollars(vault.target_cents)} · {vault.members} members
          </p>
          <p className="mt-4 text-xs text-subtle">Minimum check {dollars(vault.min_check_cents)}</p>
          {user ? (
            locked ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {vault.min_tier === "penthouse"
                  ? "Penthouse is the illiquid book — rally cars and private deals. Attest accredited income, or climb by deploying capital downstairs."
                  : `This vault opens at ${tier.name}. Attest income or deploy more capital to climb.`}
              </p>
            ) : (
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  invest.mutate();
                }}
              >
                <label className="text-xs text-muted">
                  Amount (USD)
                  <Input
                    className="mt-1"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </label>
                <Button className="w-full" type="submit" disabled={invest.isPending}>
                  {invest.isPending ? "Deploying…" : "Deploy capital"}
                </Button>
              </form>
            )
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted">Sign in to deploy commons capital.</p>
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: `/vaults/${slug}` })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
