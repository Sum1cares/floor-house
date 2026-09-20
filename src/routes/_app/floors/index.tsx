import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import { joinCommunity, listCommunities } from "@/lib/server/feed";
import { TIERS, canAccess, type TierId } from "@/lib/tiers";
import { useProfile } from "@/lib/use-profile";
import { useSocial } from "@/lib/use-social";

export const Route = createFileRoute("/_app/floors/")({
  loader: () => listCommunities(),
  component: FloorsPage,
});

function FloorsPage() {
  const user = useCurrentUser();
  const { data: me } = useProfile();
  const social = useSocial();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["communities"], queryFn: () => listCommunities(), initialData: Route.useLoaderData() });
  const join = useMutation({
    mutationFn: (communityId: number) => joinCommunity({ data: { communityId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["communities"] });
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
    onError: toastErr,
  });
  const joined = new Set(social.data?.joined ?? []);

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">Rooms</p>
      <h1 className="font-display text-4xl tracking-tight">Floors</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Sub-communities of the house — Reddit-dense, membership-gated. Ground rooms are the Pit,
        diligence, predictions. Higher floors follow the same stack as the vaults.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {q.isPending && !q.data
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-3xl" />)
          : (q.data ?? []).map((c) => {
              const tier = TIERS[c.min_tier as TierId] ?? TIERS.ground;
              const locked = me?.profile ? !canAccess(me.profile.tier, c.min_tier) : false;
              const isIn = joined.has(c.id);
              return (
                <article key={c.id} className="flex flex-col rounded-3xl bg-surface p-5 hairline">
                  <p className="text-xs text-subtle">
                    {c.member_count.toLocaleString()} members · Opens at {tier.name}
                  </p>
                  <Link to="/floors/$slug" params={{ slug: c.slug }} className="mt-1">
                    <h2 className="font-display text-2xl tracking-tight hover:underline">{c.name}</h2>
                  </Link>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{c.description}</p>
                  <p className="mt-3 text-xs text-subtle">{c.rules}</p>
                  <div className="mt-4 flex gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link to="/floors/$slug" params={{ slug: c.slug }}>
                        Enter
                      </Link>
                    </Button>
                    {user && !locked ? (
                      <Button size="sm" variant={isIn ? "ghost" : "default"} onClick={() => join.mutate(c.id)}>
                        {isIn ? "Joined" : "Join"}
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
      </div>
    </div>
  );
}
