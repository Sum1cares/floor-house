import { Link } from "@tanstack/react-router";
import { ArrowBigDown, ArrowBigUp, Bookmark, MessageSquare, Repeat2, Share } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TIERS, type TierId } from "@/lib/tiers";
import type { Post } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

export function scoreOf(post: Post) {
  return post.upvotes - post.downvotes;
}

export function PostCard({
  post,
  myVote,
  onVote,
  onSave,
  onRestack,
  saved,
  restacked,
  compact = false,
}: {
  post: Post;
  myVote?: number;
  onVote?: (value: 1 | -1) => void;
  onSave?: () => void;
  onRestack?: () => void;
  saved?: boolean;
  restacked?: boolean;
  compact?: boolean;
}) {
  const tier = TIERS[post.author_tier as TierId] ?? TIERS.ground;
  const isRestack = post.kind === "restack" || Boolean(post.restack_of);

  return (
    <article className="flex gap-3 rounded-2xl bg-surface p-4 hairline sm:gap-4 sm:p-5">
      <div className="flex flex-col items-center gap-1 pt-0.5">
        <button
          type="button"
          aria-label="Upvote"
          onClick={() => onVote?.(1)}
          className={cn(
            "grid size-9 place-items-center rounded-md text-muted hover:bg-elevated hover:text-fg",
            myVote === 1 && "text-yes",
          )}
        >
          <ArrowBigUp className="size-5" fill={myVote === 1 ? "currentColor" : "none"} />
        </button>
        <span className="tabular text-xs font-medium text-fg">{scoreOf(post)}</span>
        <button
          type="button"
          aria-label="Downvote"
          onClick={() => onVote?.(-1)}
          className={cn(
            "grid size-9 place-items-center rounded-md text-muted hover:bg-elevated hover:text-fg",
            myVote === -1 && "text-no",
          )}
        >
          <ArrowBigDown className="size-5" fill={myVote === -1 ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="min-w-0 flex-1">
        {isRestack ? (
          <p className="mb-1 flex items-center gap-1 text-xs text-subtle">
            <Repeat2 className="size-3.5" />
            {post.author_name} restacked
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <Link
            to="/floors/$slug"
            params={{ slug: post.community_slug }}
            className="font-medium text-fg hover:underline"
          >
            {post.community_name}
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/u/$handle" params={{ handle: post.author_handle }} className="hover:text-fg">
            {post.author_name}
          </Link>
          <Badge tone="neutral">{tier.name}</Badge>
          <span>{relativeTime(post.created_at)}</span>
          {post.kind !== "thread" && post.kind !== "restack" ? <Badge>{post.kind}</Badge> : null}
        </div>
        {!isRestack && post.title ? (
          <Link to="/post/$id" params={{ id: String(post.id) }} className="mt-1.5 block">
            <h2 className="font-display text-xl leading-snug tracking-tight text-fg sm:text-[1.35rem]">
              {post.title}
            </h2>
          </Link>
        ) : null}
        {post.body && !isRestack ? (
          <p className={cn("mt-2 text-sm leading-relaxed text-muted", compact ? "line-clamp-3" : "line-clamp-6")}>
            {post.body}
          </p>
        ) : null}
        {isRestack && post.body ? (
          <p className="mt-2 text-sm leading-relaxed">{post.body}</p>
        ) : null}
        {post.restack_of ? (
          <Link
            to="/post/$id"
            params={{ id: String(post.restack_of) }}
            className="mt-3 block rounded-xl bg-elevated p-3 hairline"
          >
            <p className="text-xs text-muted">
              {post.restack_author}
              {post.restack_community_name ? ` · ${post.restack_community_name}` : ""}
            </p>
            {post.restack_title ? (
              <p className="mt-1 font-display text-lg leading-snug">{post.restack_title}</p>
            ) : null}
            {post.restack_body ? (
              <p className={cn("mt-1 text-sm text-muted", compact ? "line-clamp-3" : "line-clamp-5")}>
                {post.restack_body}
              </p>
            ) : null}
          </Link>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-1 text-muted">
          <Link
            to="/post/$id"
            params={{ id: String(post.id) }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs hover:bg-elevated hover:text-fg"
          >
            <MessageSquare className="size-3.5" />
            {post.comment_count}
          </Link>
          <button
            type="button"
            onClick={() => onRestack?.()}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs hover:bg-elevated hover:text-fg",
              restacked && "text-yes",
            )}
          >
            <Repeat2 className="size-3.5" />
            {post.restack_count ? post.restack_count : <span className="hidden sm:inline">Restack</span>}
          </button>
          <button
            type="button"
            onClick={onSave}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs hover:bg-elevated hover:text-fg",
              saved && "text-fg",
            )}
          >
            <Bookmark className="size-3.5" fill={saved ? "currentColor" : "none"} />
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/post/${post.id}`;
              void navigator.clipboard.writeText(url).then(
                () => toast.success("Link copied."),
                () => toast.message(url),
              );
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs hover:bg-elevated hover:text-fg"
          >
            <Share className="size-3.5" />
            Share
          </button>
          <Link
            to="/u/$handle"
            params={{ handle: post.author_handle }}
            className="ml-auto hidden items-center gap-2 sm:flex"
          >
            <Avatar name={post.author_name} size="sm" />
          </Link>
        </div>
      </div>
    </article>
  );
}
