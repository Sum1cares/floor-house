import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CommentThread } from "@/components/feed/comment-thread";
import { NeedSignIn } from "@/components/need-sign-in";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import {
  createComment,
  getPost,
  myVotes,
  restackPost,
  toggleBookmark,
  vote,
} from "@/lib/server/feed";
import { useSocial } from "@/lib/use-social";

export const Route = createFileRoute("/_app/post/$id")({
  loader: ({ params }) => getPost({ data: { id: Number(params.id) } }),
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const postId = Number(id);
  const user = useCurrentUser();
  const qc = useQueryClient();
  const social = useSocial();
  const q = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost({ data: { id: postId } }),
    enabled: Number.isFinite(postId),
    initialData: Route.useLoaderData(),
  });
  const votes = useQuery({
    queryKey: ["votes"],
    queryFn: () => myVotes(),
    enabled: Boolean(user),
  });
  const voteMap = new Map((votes.data ?? []).map((v) => [`${v.target_type}:${v.target_id}`, v.value]));
  const [body, setBody] = useState("");
  const voteMut = useMutation({
    mutationFn: (d: { targetType: "post" | "comment"; targetId: number; value: 1 | -1 }) =>
      vote({ data: d }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["post", postId] });
      void qc.invalidateQueries({ queryKey: ["votes"] });
      void qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: toastErr,
  });
  const commentMut = useMutation({
    mutationFn: (d: { body: string; parentId?: number | null }) =>
      createComment({ data: { postId, body: d.body, parentId: d.parentId } }),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: toastErr,
  });
  const saveMut = useMutation({
    mutationFn: () => toggleBookmark({ data: { postId } }),
    onSuccess: (res) => {
      toast.success(res.saved ? "Saved to your tape." : "Removed from saved.");
      void qc.invalidateQueries({ queryKey: ["social"] });
    },
    onError: toastErr,
  });
  const restackMut = useMutation({
    mutationFn: (id: number) => restackPost({ data: { postId: id } }),
    onSuccess: (res) => {
      toast.success(res.restacked ? "Restacked onto the tape." : "Restack undone.");
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void qc.invalidateQueries({ queryKey: ["social"] });
      void qc.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: toastErr,
  });

  if (q.isPending && !q.data) return <Skeleton className="h-64 rounded-3xl" />;
  const post = q.data?.post;
  if (!post) {
    return (
      <div>
        <h1 className="font-display text-3xl">Post missing</h1>
        <Button asChild className="mt-4" variant="secondary">
          <Link to="/">Back to the tape</Link>
        </Button>
      </div>
    );
  }
  const saved = social.data?.saved.includes(post.id);
  const restacked = social.data?.restacked.includes(post.restack_of ?? post.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PostCard
        post={post}
        myVote={voteMap.get(`post:${post.id}`)}
        saved={saved}
        restacked={restacked}
        onVote={(value) => voteMut.mutate({ targetType: "post", targetId: post.id, value })}
        onSave={() => saveMut.mutate()}
        onRestack={() => restackMut.mutate(post.restack_of ?? post.id)}
      />
      <section className="rounded-2xl bg-surface p-4 hairline">
        {user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commentMut.mutate({ body });
            }}
            className="space-y-3"
          >
            <Textarea
              placeholder="Add to the diligence."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={commentMut.isPending}>
                Reply
              </Button>
            </div>
          </form>
        ) : (
          <NeedSignIn message="Sign in to comment on the tape." />
        )}
      </section>
      <CommentThread
        comments={q.data?.comments ?? []}
        myVotes={voteMap}
        signedIn={Boolean(user)}
        pending={commentMut.isPending}
        onVote={(commentId) => voteMut.mutate({ targetType: "comment", targetId: commentId, value: 1 })}
        onReply={(parentId, text) => commentMut.mutate({ body: text, parentId })}
      />
    </div>
  );
}
