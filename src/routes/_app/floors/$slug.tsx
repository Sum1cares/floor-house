import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ComposeDialog } from "@/components/compose";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import {
  getCommunity,
  joinCommunity,
  myVotes,
  restackPost,
  toggleBookmark,
  vote,
} from "@/lib/server/feed";
import { TIERS, type TierId } from "@/lib/tiers";
import { useSocial } from "@/lib/use-social";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/floors/$slug")({
  loader: ({ params }) => getCommunity({ data: { slug: params.slug, sort: "hot" } }),
  component: FloorPage,
});

function FloorPage() {
  const { slug } = Route.useParams();
  const [sort, setSort] = useState("hot");
  const [compose, setCompose] = useState(false);
  const user = useCurrentUser();
  const social = useSocial();
  const qc = useQueryClient();
  const initial = Route.useLoaderData();
  const q = useQuery({
    queryKey: ["community", slug, sort],
    queryFn: () => getCommunity({ data: { slug, sort } }),
    initialData: sort === "hot" ? initial : undefined,
  });
  const votes = useQuery({
    queryKey: ["votes"],
    queryFn: () => myVotes(),
    enabled: Boolean(user),
  });
  const voteMap = new Map((votes.data ?? []).map((v) => [`${v.target_type}:${v.target_id}`, v.value]));
  const voteMut = useMutation({
    mutationFn: (d: { targetId: number; value: 1 | -1 }) =>
      vote({ data: { targetType: "post", targetId: d.targetId, value: d.value } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["community"] });
      void qc.invalidateQueries({ queryKey: ["votes"] });
    },
    onError: toastErr,
  });
  const saveMut = useMutation({
    mutationFn: (postId: number) => toggleBookmark({ data: { postId } }),
    onSuccess: (res) => {
      toast.success(res.saved ? "Saved to your tape." : "Removed from saved.");
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
    onError: toastErr,
  });
  const restackMut = useMutation({
    mutationFn: (postId: number) => restackPost({ data: { postId } }),
    onSuccess: (res) => {
      toast.success(res.restacked ? "Restacked onto the tape." : "Restack undone.");
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void qc.invalidateQueries({ queryKey: ["community"] });
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
    onError: toastErr,
  });
  const join = useMutation({
    mutationFn: (communityId: number) => joinCommunity({ data: { communityId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["community"] });
      void qc.invalidateQueries({ queryKey: ["communities"] });
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
    onError: toastErr,
  });

  const community = q.data?.community;
  if (q.isPending && !q.data) return <Skeleton className="h-64 rounded-3xl" />;
  if (!community) {
    return (
      <div>
        <h1 className="font-display text-3xl">Unknown floor</h1>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/floors">Back</Link>
        </Button>
      </div>
    );
  }
  const tier = TIERS[community.min_tier as TierId] ?? TIERS.ground;
  const isIn = social.data?.joined.includes(community.id);
  const saved = new Set(social.data?.saved ?? []);
  const restacked = new Set(social.data?.restacked ?? []);

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">Floor · {tier.name}</p>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-tight">{community.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{community.description}</p>
          <p className="mt-3 max-w-2xl text-xs text-subtle">{community.rules}</p>
        </div>
        <div className="flex gap-2">
          {user ? (
            <Button size="sm" variant={isIn ? "secondary" : "default"} onClick={() => join.mutate(community.id)}>
              {isIn ? "Joined" : "Join"}
            </Button>
          ) : null}
          {user ? (
            <Button size="sm" variant="secondary" onClick={() => setCompose(true)}>
              Write
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-6 mb-4 flex max-w-sm gap-1 rounded-xl bg-elevated p-1">
        {["hot", "new", "top"].map((s) => (
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
      <div className="space-y-3">
        {(q.data?.posts ?? []).map((post) => (
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
      <ComposeDialog open={compose} onOpenChange={setCompose} defaultFloor={slug} />
    </div>
  );
}
