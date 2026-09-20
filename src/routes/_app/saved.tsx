import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import { listSaved, myVotes, restackPost, toggleBookmark, vote } from "@/lib/server/feed";
import { useSocial } from "@/lib/use-social";

export const Route = createFileRoute("/_app/saved")({ component: SavedPage });

function SavedPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const social = useSocial();
  const q = useQuery({
    queryKey: ["saved"],
    queryFn: () => listSaved(),
    enabled: Boolean(user),
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
      void qc.invalidateQueries({ queryKey: ["saved"] });
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

  if (isPending) return <Skeleton className="h-64 rounded-3xl" />;
  if (!user) return <RedirectToSignIn />;
  if (q.isPending) return <Skeleton className="h-64 rounded-3xl" />;
  const restacked = new Set(social.data?.restacked ?? []);

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">Bookmarks</p>
      <h1 className="font-display text-4xl tracking-tight">Saved</h1>
      <p className="mt-2 text-sm text-muted">Diligence you want to keep. Private to you.</p>
      <div className="mt-6 space-y-3">
        {(q.data ?? []).length === 0 ? (
          <div className="rounded-2xl bg-surface p-6 hairline">
            <p className="text-sm text-muted">Nothing saved yet.</p>
            <Button asChild className="mt-4" variant="secondary" size="sm">
              <Link to="/">Read the tape</Link>
            </Button>
          </div>
        ) : (
          (q.data ?? []).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              compact
              myVote={voteMap.get(`post:${post.id}`)}
              saved
              restacked={restacked.has(post.restack_of ?? post.id)}
              onVote={(value) => voteMut.mutate({ targetId: post.id, value })}
              onSave={() => saveMut.mutate(post.id)}
              onRestack={() => restackMut.mutate(post.restack_of ?? post.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
