import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { WhoToFollow } from "@/components/feed/who-to-follow";
import { MarketCard } from "@/components/market-card";
import { NeedSignIn } from "@/components/need-sign-in";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultCard } from "@/components/vault-card";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { membersNeeded, nextBenefit } from "@/lib/commons";
import { toastErr } from "@/lib/errors";
import { listCommons } from "@/lib/server/commons";
import {
  listFeed,
  listFollowing,
  listTrending,
  myVotes,
  restackPost,
  toggleBookmark,
  vote,
} from "@/lib/server/feed";
import { listMarkets } from "@/lib/server/markets";
import { listVaults } from "@/lib/server/vaults";
import { useSocial } from "@/lib/use-social";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
  loader: async () => {
    const [posts, vaults, markets, commons, trending] = await Promise.all([
      listFeed({ data: { sort: "hot" } }),
      listVaults(),
      listMarkets(),
      listCommons(),
      listTrending(),
    ]);
    return { posts, vaults, markets, commons, trending };
  },
  component: FeedPage,
});

const SORTS = ["hot", "new", "top", "following"] as const;

function FeedPage() {
  const initial = Route.useLoaderData();
  const [sort, setSort] = useState<(typeof SORTS)[number]>("hot");
  const { user, isPending: authPending } = useCurrentUserState();
  const qc = useQueryClient();
  const social = useSocial();
  const feed = useQuery({
    queryKey: ["feed", sort],
    queryFn: () => listFeed({ data: { sort } }),
    initialData: sort === "hot" ? initial.posts : undefined,
    enabled: sort !== "following",
  });
  const following = useQuery({
    queryKey: ["feed", "following"],
    queryFn: () => listFollowing(),
    enabled: Boolean(user) && sort === "following",
  });
  const vaults = useQuery({ queryKey: ["vaults"], queryFn: () => listVaults(), initialData: initial.vaults });
  const markets = useQuery({ queryKey: ["markets"], queryFn: () => listMarkets(), initialData: initial.markets });
  const commons = useQuery({
    queryKey: ["commons"],
    queryFn: () => listCommons(),
    initialData: initial.commons,
  });
  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: () => listTrending(),
    initialData: initial.trending,
  });
  const votes = useQuery({
    queryKey: ["votes"],
    queryFn: () => myVotes(),
    enabled: Boolean(user),
  });
  const voteMap = new Map((votes.data ?? []).map((v) => [`${v.target_type}:${v.target_id}`, v.value]));
  const saved = new Set(social.data?.saved ?? []);
  const restacked = new Set(social.data?.restacked ?? []);

  const voteMut = useMutation({
    mutationFn: (d: { targetId: number; value: 1 | -1 }) =>
      vote({ data: { targetType: "post", targetId: d.targetId, value: d.value } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void qc.invalidateQueries({ queryKey: ["votes"] });
    },
    onError: toastErr,
  });
  const saveMut = useMutation({
    mutationFn: (postId: number) => toggleBookmark({ data: { postId } }),
    onSuccess: (res) => {
      toast.success(res.saved ? "Saved to your tape." : "Removed from saved.");
      void qc.invalidateQueries({ queryKey: ["social"] });
      void qc.invalidateQueries({ queryKey: ["saved"] });
    },
    onError: toastErr,
  });
  const restackMut = useMutation({
    mutationFn: (postId: number) => restackPost({ data: { postId } }),
    onSuccess: (res) => {
      toast.success(res.restacked ? "Restacked onto the tape." : "Restack undone.");
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
    onError: toastErr,
  });

  const posts = sort === "following" ? following.data : feed.data;
  const pending =
    sort === "following"
      ? Boolean(user) && following.isPending && !following.data
      : feed.isPending && !feed.data;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <header className="mb-6">
          <p className="text-xs tracking-[0.22em] text-subtle uppercase">The tape</p>
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">The Floor is in session.</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            A social house that owns things. Vote the due diligence, follow the underwriters, fund
            the vaults, price the future, trade the bazaar.
          </p>
        </header>
        {(initial.posts ?? []).length ? (
          <div className="mb-5 max-w-full overflow-x-auto">
            <ul className="flex w-max gap-2 pb-1">
              {(initial.posts ?? []).slice(0, 5).map((p) => (
                <li key={p.id} className="shrink-0">
                  <Link
                    to="/post/$id"
                    params={{ id: String(p.id) }}
                    className="block max-w-56 truncate rounded-full bg-elevated px-3 py-2 text-xs text-muted hairline hover:text-fg"
                  >
                    {p.title || p.author_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mb-4 flex gap-1 rounded-xl bg-elevated p-1">
          {SORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={cn(
                "h-9 flex-1 rounded-lg text-sm font-medium capitalize text-muted",
                sort === s && "bg-surface text-fg shadow-soft",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {sort === "following" && (authPending || !user) ? (
          authPending ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : (
            <NeedSignIn message="Follow underwriters to build a private tape." />
          )
        ) : (
          <div className="space-y-3">
            {pending
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
              : (posts ?? []).length === 0 && sort === "following"
                ? (
                  <p className="rounded-2xl bg-surface p-5 text-sm text-muted hairline">
                    Follow voices on the tape. Their diligence lands here.
                  </p>
                )
                : (posts ?? []).map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      compact
                      myVote={voteMap.get(`post:${post.id}`)}
                      saved={saved.has(post.id)}
                      restacked={restacked.has(post.restack_of ?? post.id)}
                      onVote={(value) => voteMut.mutate({ targetId: post.id, value })}
                      onSave={() => saveMut.mutate(post.id)}
                      onRestack={() => restackMut.mutate(post.restack_of ?? post.id)}
                    />
                  ))}
          </div>
        )}
      </div>
      <aside className="hidden space-y-8 xl:block">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl">Trending floors</h2>
            <Link to="/floors" className="text-xs text-muted hover:text-fg">
              All
            </Link>
          </div>
          <ul className="space-y-1">
            {(trending.data?.floors ?? []).map((f, i) => (
              <li key={f.slug}>
                <Link
                  to="/floors/$slug"
                  params={{ slug: f.slug }}
                  className="flex items-baseline justify-between rounded-xl px-3 py-2 hover:bg-elevated"
                >
                  <span className="text-sm">
                    <span className="mr-2 tabular text-subtle">{i + 1}</span>
                    {f.name}
                  </span>
                  <span className="text-xs tabular text-subtle">{f.heat}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <WhoToFollow voices={trending.data?.voices ?? []} following={social.data?.following} />
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl">Open vaults</h2>
            <Link to="/vaults" className="text-xs text-muted hover:text-fg">
              All
            </Link>
          </div>
          <div className="space-y-3">
            {(vaults.data ?? []).slice(0, 2).map((v) => (
              <VaultCard key={v.id} vault={v} />
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl">Markets</h2>
            <Link to="/markets" className="text-xs text-muted hover:text-fg">
              All
            </Link>
          </div>
          <div className="space-y-3">
            {(markets.data ?? []).slice(0, 2).map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl">The Commons</h2>
            <Link to="/commons" className="text-xs text-muted hover:text-fg">
              All
            </Link>
          </div>
          {(() => {
            const count = commons.data?.house.member_count ?? 0;
            const next = nextBenefit(count, commons.data?.benefits ?? []);
            return (
              <Link to="/commons" className="block rounded-2xl bg-surface p-5 hairline">
                <p className="text-xs text-subtle">House membership</p>
                <p className="font-display text-3xl tabular">{count.toLocaleString("en-US")}</p>
                {next ? (
                  <>
                    <p className="mt-2 text-sm text-muted">
                      {next.name} · {membersNeeded(count, next.unlock_at).toLocaleString("en-US")}{" "}
                      more members
                    </p>
                    <Progress className="mt-3" value={Math.round((count / next.unlock_at) * 100)} />
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">Every listed perk is live. Keep bringing people.</p>
                )}
              </Link>
            );
          })()}
        </section>
        <div className="rounded-2xl bg-surface p-5 hairline">
          <p className="text-xs tracking-wide text-subtle uppercase">How the house works</p>
          <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
            <li>1. Ground owns the commons funds and the market wall.</li>
            <li>2. Read the tape. Follow the underwriters.</li>
            <li>3. Attest income — or climb by deploying capital.</li>
            <li>4. Penthouse is the illiquid book: rally cars, private deals.</li>
            <li>5. Trade secondaries in the bazaar.</li>
            <li>6. Bring members. The Commons grows for every floor.</li>
          </ol>
          <Button asChild className="mt-4 w-full" variant="secondary">
            <Link to="/commons">See the Commons</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
