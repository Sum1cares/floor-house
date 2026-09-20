import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { FollowButton } from "@/components/feed/follow-button";
import { PostCard } from "@/components/post-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import { myVotes, restackPost, toggleBookmark, vote } from "@/lib/server/feed";
import { getMember } from "@/lib/server/members";
import { TIERS, type TierId } from "@/lib/tiers";
import { useProfile } from "@/lib/use-profile";
import { useSocial } from "@/lib/use-social";
import { compactDollars } from "@/lib/utils";

export const Route = createFileRoute("/_app/u/$handle")({
  loader: ({ params }) => getMember({ data: { handle: params.handle } }),
  component: MemberPage,
});

function MemberPage() {
  const { handle } = Route.useParams();
  const user = useCurrentUser();
  const social = useSocial();
  const { data: me } = useProfile();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["member", handle],
    queryFn: () => getMember({ data: { handle } }),
    initialData: Route.useLoaderData(),
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
      void qc.invalidateQueries({ queryKey: ["member", handle] });
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
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
    onError: toastErr,
  });

  if (q.isPending && !q.data) return <Skeleton className="h-64 rounded-3xl" />;
  if (!q.data || q.data.kind === "missing" || !q.data.profile) {
    return (
      <div>
        <h1 className="font-display text-3xl">No one by that handle</h1>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/">The tape</Link>
        </Button>
      </div>
    );
  }
  const p = q.data.profile;
  const tier = TIERS[p.tier as TierId] ?? TIERS.ground;
  const following = social.data?.following.includes(p.handle);
  const saved = new Set(social.data?.saved ?? []);
  const restacked = new Set(social.data?.restacked ?? []);
  const isSelf = me?.profile?.handle === p.handle;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-start gap-4 rounded-3xl bg-surface p-6 hairline">
        <Avatar name={p.display_name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl tracking-tight">{p.display_name}</h1>
            <Badge>{tier.name}</Badge>
          </div>
          <p className="text-sm text-muted">@{p.handle}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{p.bio || "A member of the Floor."}</p>
          <p className="mt-3 text-xs text-subtle">
            {q.data.followers.toLocaleString("en-US")} followers
            {" · "}
            {q.data.following.toLocaleString("en-US")} following
            {" · "}
            {p.karma} karma
            {q.data.kind === "member" ? ` · ${compactDollars(p.contributed_cents)} deployed` : ""}
            {p.brought ? ` · brought ${p.brought}` : ""}
          </p>
        </div>
        {isSelf ? null : <FollowButton handle={p.handle} following={following} />}
      </div>
      <h2 className="mt-8 font-display text-2xl">On the tape</h2>
      <div className="mt-4 space-y-3">
        {q.data.posts.map((post) => (
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
    </div>
  );
}
