import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LeaveHouse } from "@/components/leave-house";
import { RiskStack } from "@/components/risk-stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { membersNeeded, nextBenefit } from "@/lib/commons";
import { toastErr } from "@/lib/errors";
import { listCommons } from "@/lib/server/commons";
import { updateMe } from "@/lib/server/me";
import { INCOME_BANDS, TIERS, TIER_ORDER, type TierId } from "@/lib/tiers";
import { useProfile } from "@/lib/use-profile";
import { compactDollars, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_app/membership")({ component: MembershipPage });

function MembershipPage() {
  const { user, isPending } = useCurrentUserState();
  const { data, isLoading } = useProfile();
  const commons = useQuery({ queryKey: ["commons"], queryFn: () => listCommons() });
  const qc = useQueryClient();
  const profile = data?.profile;
  const [name, setName] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (patch: { display_name?: string; handle?: string; bio?: string; income_band?: string }) =>
      updateMe({ data: patch }),
    onSuccess: () => {
      toast.success("Membership updated.");
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: toastErr,
  });

  if (isPending || isLoading) return <Skeleton className="h-80 rounded-3xl" />;
  if (!user) return <RedirectToSignIn />;
  if (!profile) return null;

  const display = name ?? profile.display_name;
  const h = handle ?? profile.handle;
  const b = bio ?? profile.bio;
  const current = TIERS[profile.tier as TierId];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="text-xs tracking-[0.22em] text-subtle uppercase">The house</p>
        <h1 className="font-display text-4xl tracking-tight">Membership</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Ground can own the commons funds and the market wall. Penthouse is the illiquid book —
          rally cars and private deals. Floors in between are a risk stack, not a caste: attest
          income, or climb by deploying capital.
        </p>
        <RiskStack className="mt-8" />

        <form
          className="mt-10 max-w-lg space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({ display_name: display, handle: h, bio: b });
          }}
        >
          <label className="text-xs text-muted">
            Name
            <Input className="mt-1" value={display} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-xs text-muted">
            Handle
            <Input className="mt-1" value={h} onChange={(e) => setHandle(e.target.value)} />
          </label>
          <label className="text-xs text-muted">
            Bio
            <Textarea className="mt-1" value={b} onChange={(e) => setBio(e.target.value)} />
          </label>
          <Button type="submit" disabled={save.isPending}>
            Save profile
          </Button>
        </form>

        <h2 className="mt-12 font-display text-2xl">Income band</h2>
        <p className="mt-1 text-sm text-muted">Self-attested for this demonstration floor.</p>
        <div className="mt-4 grid gap-2">
          {INCOME_BANDS.map((band) => (
            <button
              key={band.id}
              type="button"
              onClick={() => save.mutate({ income_band: band.id })}
              className={cn(
                "rounded-2xl bg-surface p-4 text-left hairline",
                profile.income_band === band.id && "ring-1 ring-accent",
              )}
            >
              <p className="font-medium">{band.label}</p>
              <p className="text-xs text-muted">{band.hint}</p>
            </button>
          ))}
        </div>

        <div className="mt-16">
          <LeaveHouse />
        </div>
      </div>
      <aside>
        <div className="rounded-3xl bg-surface p-5 hairline">
          <p className="text-xs text-subtle">Current floor</p>
          <p className="font-display text-3xl">{current.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{current.access}</p>
          <p className="mt-3 text-xs text-muted">
            Deployed {compactDollars(profile.contributed_cents)} · {profile.karma} karma
          </p>
        </div>
        <ol className="mt-6 space-y-3">
          {TIER_ORDER.map((id) => {
            const t = TIERS[id];
            const on = TIER_ORDER.indexOf(profile.tier as TierId) >= TIER_ORDER.indexOf(id);
            return (
              <li key={id} className={cn("rounded-2xl bg-surface p-4 hairline", !on && "opacity-50")}>
                <p className="text-xs tracking-wide text-subtle uppercase">Floor {t.floor}</p>
                <p className="font-display text-lg">{t.name}</p>
                <p className="mt-1 text-xs text-muted">{t.access}</p>
              </li>
            );
          })}
        </ol>
        {(() => {
          const count = commons.data?.house.member_count ?? 0;
          const next = nextBenefit(count, commons.data?.benefits ?? []);
          return (
            <Link to="/commons" className="mt-6 block rounded-2xl bg-surface p-4 hairline">
              <p className="text-xs tracking-wide text-subtle uppercase">The Commons</p>
              <p className="font-display text-lg">
                {count.toLocaleString("en-US")} members
              </p>
              <p className="mt-1 text-xs text-muted">
                Same list for every floor. {profile.brought} brought by you.
              </p>
              {next ? (
                <>
                  <p className="mt-3 text-sm">
                    Next: {next.name} · {membersNeeded(count, next.unlock_at).toLocaleString("en-US")} away
                  </p>
                  <Progress className="mt-2" value={Math.round((count / next.unlock_at) * 100)} />
                </>
              ) : null}
            </Link>
          );
        })()}
      </aside>
    </div>
  );
}
