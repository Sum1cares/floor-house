import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BenefitCard } from "@/components/benefit-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import {
  BENEFIT_CATEGORIES,
  BRING_CAP,
  isUnlocked,
  membersNeeded,
  nextBenefit,
  previousUnlock,
  unlockProgress,
} from "@/lib/commons";
import { toastErr } from "@/lib/errors";
import { bringMember, listCommons, myBenefitClaims } from "@/lib/server/commons";
import { useProfile } from "@/lib/use-profile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/commons/")({
  loader: () => listCommons(),
  component: CommonsPage,
});

function CommonsPage() {
  const user = useCurrentUser();
  const { data: me } = useProfile();
  const qc = useQueryClient();
  const [cat, setCat] = useState("");
  const [name, setName] = useState("");
  const initial = Route.useLoaderData();
  const q = useQuery({
    queryKey: ["commons"],
    queryFn: () => listCommons(),
    initialData: initial,
  });
  const mine = useQuery({
    queryKey: ["commons-mine"],
    queryFn: () => myBenefitClaims(),
    enabled: Boolean(user),
  });
  const bring = useMutation({
    mutationFn: () => bringMember({ data: { name } }),
    onSuccess: (res) => {
      setName("");
      if (res.unlocked[0]) {
        toast.success(`${res.unlocked[0].name} just opened for the house.`);
      } else {
        toast.success(`On the roll. House is ${res.memberCount.toLocaleString("en-US")}.`);
      }
      void qc.invalidateQueries({ queryKey: ["commons"] });
      void qc.invalidateQueries({ queryKey: ["commons-mine"] });
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: toastErr,
  });

  const house = q.data?.house;
  const benefits = q.data?.benefits ?? [];
  const count = house?.member_count ?? 0;
  const next = nextBenefit(count, benefits);
  const prev = previousUnlock(count, benefits);
  const held = new Set(mine.data?.ids ?? []);
  const rows = benefits.filter((b) => !cat || b.category === cat);
  const brought = me?.profile.brought ?? 0;
  const from = prev?.unlock_at ?? 0;
  const to = next?.unlock_at ?? count;
  const progress = next ? unlockProgress(count, from, to) : 100;

  const copyInvite = async () => {
    const handle = me?.profile.handle ?? "floor";
    const url = `${window.location.origin}/?invite=${encodeURIComponent(handle)}`;
    const text = `Join the Floor. It's a cooperative that owns buildings and bargains for cars, rooms, and nights out. More members, more Commons.\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Invite copied.");
    } catch {
      toast.message(text);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div>
        <p className="text-xs tracking-[0.22em] text-subtle uppercase">Cooperative benefits</p>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">The Commons</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Floors are a risk stack. The Commons is a bloc. Cars, crash pads, gatherings, donated
          concerts — whatever a sponsor, a host, or an idle vault will give a house this size.
          Ground to Penthouse, same list. Every new member pulls the next perk closer.
        </p>

        {next ? (
          <Link
            to="/commons/$slug"
            params={{ slug: next.slug }}
            className="mt-8 block overflow-hidden rounded-3xl bg-surface hairline"
          >
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs tracking-[0.22em] text-subtle uppercase">Next unlock</p>
                <Badge tone="warn">{membersNeeded(count, next.unlock_at).toLocaleString("en-US")} members away</Badge>
              </div>
              <h2 className="mt-2 font-display text-3xl tracking-tight">{next.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{next.description}</p>
              <Progress className="mt-5" value={progress} />
              <div className="mt-2 flex justify-between text-xs tabular text-subtle">
                <span>{count.toLocaleString("en-US")} on the roll</span>
                <span>{next.unlock_at.toLocaleString("en-US")}</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="mt-8 rounded-3xl bg-surface p-6 hairline">
            <p className="text-xs tracking-[0.22em] text-subtle uppercase">The book is open</p>
            <p className="mt-2 font-display text-2xl">Every listed perk is live.</p>
            <p className="mt-2 text-sm text-muted">Bring members anyway. The next donations follow the count.</p>
          </div>
        )}
      </div>

      <aside className="space-y-6 lg:row-span-2">
        <div className="rounded-3xl bg-surface p-5 hairline">
          <p className="text-xs text-subtle">House membership</p>
          <p className="font-display text-4xl tabular tracking-tight">{count.toLocaleString("en-US")}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Sponsors watch this number. A hotel donates rooms to twenty thousand in a way it will
            not to two hundred.
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-5 hairline">
          <p className="text-xs tracking-wide text-subtle uppercase">Bring someone</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Put a name on the roll. Each one counts. You can vouch {BRING_CAP} from this seat;
            share the invite after that.
          </p>
          {user ? (
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                bring.mutate();
              }}
            >
              <Input
                placeholder="Their name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
              <Button type="submit" className="w-full" disabled={bring.isPending || brought >= BRING_CAP}>
                {bring.isPending ? "Adding…" : brought >= BRING_CAP ? "Cap reached" : "Vouch them in"}
              </Button>
            </form>
          ) : (
            <Button
              className="mt-4 w-full"
              variant="secondary"
              onClick={() => signIn(GROK_PROVIDERS[0]!.providerId)}
            >
              Sign in to bring someone
            </Button>
          )}
          <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => void copyInvite()}>
            Copy invite
          </Button>
          {user ? (
            <p className="mt-3 text-xs text-subtle tabular">
              You have brought {brought} / {BRING_CAP}
            </p>
          ) : null}
        </div>

        <div className="hidden rounded-3xl bg-surface p-5 hairline lg:block">
          <p className="text-xs tracking-wide text-subtle uppercase">Unlock ladder</p>
          <ol className="mt-4 space-y-2">
            {benefits.map((b) => {
              const open = isUnlocked(count, b.unlock_at);
              const here = next?.id === b.id;
              return (
                <li key={b.id}>
                  <Link
                    to="/commons/$slug"
                    params={{ slug: b.slug }}
                    className={cn(
                      "flex items-baseline justify-between gap-3 text-sm",
                      !open && "text-subtle",
                      here && "text-fg",
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {open ? "●" : here ? "○" : "·"} {b.name}
                    </span>
                    <span className="shrink-0 tabular text-xs text-subtle">
                      {b.unlock_at.toLocaleString("en-US")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap gap-2">
          {[{ id: "", label: "All" }, ...BENEFIT_CATEGORIES].map((c) => (
            <button
              key={c.id || "all"}
              type="button"
              onClick={() => setCat(c.id)}
              className={cn(
                "h-9 rounded-full px-3 text-xs font-medium hairline",
                cat === c.id ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {q.isPending && !q.data
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-72 rounded-3xl" />)
            : rows.map((b) => (
                <BenefitCard key={b.id} benefit={b} memberCount={count} held={held.has(b.id)} />
              ))}
        </div>
      </div>
    </div>
  );
}
