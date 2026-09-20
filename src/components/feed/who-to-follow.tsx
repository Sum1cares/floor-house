import { Link } from "@tanstack/react-router";
import { FollowButton } from "@/components/feed/follow-button";
import { Avatar } from "@/components/ui/avatar";

export type Voice = {
  handle: string;
  name: string;
  tier: string;
  score: number;
  posts: number;
};

export function WhoToFollow({
  voices,
  following,
}: {
  voices: Voice[];
  following?: string[];
}) {
  const followed = new Set(following ?? []);
  const rows = voices.filter((v) => !followed.has(v.handle)).slice(0, 5);
  if (!rows.length) return null;
  return (
    <section>
      <h2 className="font-display text-xl">Who to follow</h2>
      <ul className="mt-3 space-y-2">
        {rows.map((v) => (
          <li key={v.handle} className="flex items-center gap-3 rounded-2xl bg-surface p-3 hairline">
            <Avatar name={v.name} size="sm" />
            <div className="min-w-0 flex-1">
              <Link to="/u/$handle" params={{ handle: v.handle }} className="block truncate font-medium">
                {v.name}
              </Link>
              <p className="truncate text-xs text-muted">
                @{v.handle} · {v.posts} posts
              </p>
            </div>
            <FollowButton handle={v.handle} following={false} />
          </li>
        ))}
      </ul>
    </section>
  );
}
