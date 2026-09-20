import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { VaultArt } from "@/components/vault-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { isUnlocked, membersNeeded, previousUnlock, unlockProgress } from "@/lib/commons";
import { toastErr } from "@/lib/errors";
import { claimBenefit, getBenefit, myBenefitClaims } from "@/lib/server/commons";
import { CATEGORY_LABEL } from "@/lib/tiers";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/commons/$slug")({
  loader: ({ params }) => getBenefit({ data: { slug: params.slug } }),
  component: BenefitPage,
});

function BenefitPage() {
  const { slug } = Route.useParams();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["benefit", slug],
    queryFn: () => getBenefit({ data: { slug } }),
    initialData: Route.useLoaderData(),
  });
  const mine = useQuery({
    queryKey: ["commons-mine"],
    queryFn: () => myBenefitClaims(),
    enabled: Boolean(user),
  });
  const claim = useMutation({
    mutationFn: (benefitId: number) => claimBenefit({ data: { benefitId } }),
    onSuccess: (res) => {
      toast.success(res.claimed ? "You're on it." : "Released.");
      void qc.invalidateQueries({ queryKey: ["benefit", slug] });
      void qc.invalidateQueries({ queryKey: ["commons"] });
      void qc.invalidateQueries({ queryKey: ["commons-mine"] });
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: toastErr,
  });

  if (q.isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  const benefit = q.data?.benefit;
  const house = q.data?.house;
  const ladder = q.data?.ladder ?? [];
  if (!benefit || !house) {
    return (
      <div>
        <h1 className="font-display text-3xl">Perk not found</h1>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/commons">The Commons</Link>
        </Button>
      </div>
    );
  }

  const count = house.member_count;
  const open = isUnlocked(count, benefit.unlock_at);
  const need = membersNeeded(count, benefit.unlock_at);
  const held = mine.data?.ids.includes(benefit.id) ?? false;
  const full = benefit.capacity > 0 && benefit.claimed >= benefit.capacity && !held;
  const next = ladder.find((b) => b.unlock_at > benefit.unlock_at) ?? null;
  const prev = previousUnlock(count, ladder);
  const progress = open
    ? 100
    : unlockProgress(count, prev && prev.id !== benefit.id ? prev.unlock_at : 0, benefit.unlock_at);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <VaultArt artKey={benefit.art_key} className="h-56 rounded-3xl sm:h-72" />
        <p className="mt-6 text-xs tracking-[0.22em] text-subtle uppercase">
          {benefit.location} · {CATEGORY_LABEL[benefit.category] ?? benefit.category}
        </p>
        <h1 className="font-display text-4xl tracking-tight">{benefit.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{benefit.description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl bg-surface p-5 hairline">
            <h2 className="text-xs tracking-wide text-subtle uppercase">Who gave it</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.sponsor}</p>
          </section>
          <section className="rounded-2xl bg-surface p-5 hairline">
            <h2 className="text-xs tracking-wide text-subtle uppercase">Terms</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.terms}</p>
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-surface p-5 hairline">
          <h2 className="text-xs tracking-wide text-subtle uppercase">Why membership is the price</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            This is not a tier perk. It opened — or will open — because the house crossed{" "}
            {benefit.unlock_at.toLocaleString("en-US")} people. Donors, inns, and idle vaults
            bargain with a bloc. Bring someone if you want the next one.
          </p>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl bg-surface p-5 hairline">
          <div className="flex items-center justify-between gap-2">
            <Badge>{CATEGORY_LABEL[benefit.category] ?? benefit.category}</Badge>
            {open ? (
              <span className="text-xs text-yes">Open</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-warn">
                <Lock className="size-3" /> Locked
              </span>
            )}
          </div>
          <p className="mt-4 text-xs text-subtle">Cadence</p>
          <p className="text-sm">{benefit.cadence}</p>
          <p className="mt-4 text-xs text-subtle">House</p>
          <p className="font-display text-3xl tabular">{count.toLocaleString("en-US")}</p>
          {!open ? (
            <>
              <Progress className="mt-3" value={progress} />
              <p className="mt-2 text-xs text-muted">
                {need.toLocaleString("en-US")} more members unlock this for everyone.
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-muted">
              {benefit.capacity > 0
                ? `${benefit.claimed} of ${benefit.capacity} slots held.`
                : `${benefit.claimed.toLocaleString("en-US")} members on the standing list.`}
            </p>
          )}

          <div className="mt-5">
            {!user ? (
              <Button className="w-full" variant="secondary" onClick={() => signIn(GROK_PROVIDERS[0]!.providerId)}>
                Sign in
              </Button>
            ) : !open ? (
              <Button asChild className="w-full">
                <Link to="/commons">Bring members</Link>
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={held ? "secondary" : "default"}
                disabled={claim.isPending || (full && !held)}
                onClick={() => claim.mutate(benefit.id)}
              >
                {claim.isPending
                  ? "Working…"
                  : held
                    ? "Release slot"
                    : full
                      ? "Full"
                      : benefit.capacity > 0
                        ? "Claim a slot"
                        : "I'm in"}
              </Button>
            )}
          </div>
        </div>

        {next && next.id !== benefit.id ? (
          <Link
            to="/commons/$slug"
            params={{ slug: next.slug }}
            className="block rounded-3xl bg-surface p-5 hairline"
          >
            <p className="text-xs text-subtle">After this</p>
            <p className="mt-1 font-display text-xl">{next.name}</p>
            <p className="mt-1 text-xs text-muted">
              Unlocks at {next.unlock_at.toLocaleString("en-US")} ·{" "}
              {membersNeeded(count, next.unlock_at).toLocaleString("en-US")} to go
            </p>
          </Link>
        ) : null}

        <div className="rounded-3xl bg-surface p-5 hairline">
          <p className="text-xs tracking-wide text-subtle uppercase">On the ladder</p>
          <ol className="mt-3 space-y-1.5">
            {ladder.map((b) => (
              <li key={b.id}>
                <Link
                  to="/commons/$slug"
                  params={{ slug: b.slug }}
                  className={cn(
                    "flex justify-between gap-2 text-sm",
                    b.id === benefit.id ? "text-fg" : isUnlocked(count, b.unlock_at) ? "text-muted" : "text-subtle",
                  )}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="tabular text-xs">{b.unlock_at.toLocaleString("en-US")}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
