import { Link } from "@tanstack/react-router";
import { ArrowBigUp } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

export function CommentThread({
  comments,
  myVotes,
  signedIn,
  onVote,
  onReply,
  pending,
}: {
  comments: Comment[];
  myVotes: Map<string, number>;
  signedIn: boolean;
  onVote: (commentId: number) => void;
  onReply: (parentId: number, body: string) => void;
  pending?: boolean;
}) {
  const roots = comments.filter((c) => !c.parent_id);
  return (
    <ol className="space-y-3">
      {roots.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          all={comments}
          myVotes={myVotes}
          signedIn={signedIn}
          onVote={onVote}
          onReply={onReply}
          pending={pending}
          depth={0}
        />
      ))}
    </ol>
  );
}

function CommentNode({
  comment,
  all,
  myVotes,
  signedIn,
  onVote,
  onReply,
  pending,
  depth,
}: {
  comment: Comment;
  all: Comment[];
  myVotes: Map<string, number>;
  signedIn: boolean;
  onVote: (commentId: number) => void;
  onReply: (parentId: number, body: string) => void;
  pending?: boolean;
  depth: number;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const kids = all.filter((c) => c.parent_id === comment.id);
  const mine = myVotes.get(`comment:${comment.id}`) === 1;

  return (
    <li className={cn(depth > 0 && "mt-3")}>
      <div className="rounded-2xl bg-surface p-4 hairline">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Avatar name={comment.author_name} size="sm" />
          <Link to="/u/$handle" params={{ handle: comment.author_handle }} className="font-medium text-fg">
            {comment.author_name}
          </Link>
          <span>@{comment.author_handle}</span>
          <span>{relativeTime(comment.created_at)}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed">{comment.body}</p>
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            aria-label="Upvote comment"
            onClick={() => onVote(comment.id)}
            className={cn(
              "inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs text-muted hover:bg-elevated hover:text-fg",
              mine && "text-yes",
            )}
          >
            <ArrowBigUp className="size-4" fill={mine ? "currentColor" : "none"} />
            {comment.upvotes}
          </button>
          {signedIn ? (
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-md px-2 text-xs text-muted hover:bg-elevated hover:text-fg"
              onClick={() => setOpen((v) => !v)}
            >
              Reply
            </button>
          ) : null}
        </div>
        {open ? (
          <form
            className="mt-3 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              const body = text.trim();
              if (!body) return;
              onReply(comment.id, body);
              setText("");
              setOpen(false);
            }}
          >
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Reply to ${comment.author_name}`}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={pending}>
                Reply
              </Button>
            </div>
          </form>
        ) : null}
      </div>
      {kids.length ? (
        <ul className="mt-3 space-y-3 border-l border-border pl-3 sm:pl-4">
          {kids.map((k) => (
            <CommentNode
              key={k.id}
              comment={k}
              all={all}
              myVotes={myVotes}
              signedIn={signedIn}
              onVote={onVote}
              onReply={onReply}
              pending={pending}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
