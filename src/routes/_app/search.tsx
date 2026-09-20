import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PostCard } from "@/components/post-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { searchHouse } from "@/lib/server/feed";
import { CATEGORY_LABEL } from "@/lib/tiers";

type Search = { q: string };

export const Route = createFileRoute("/_app/search")({
  validateSearch: (s: Record<string, unknown>): Search => ({ q: String(s.q ?? "") }),
  loaderDeps: ({ search }: { search: Search }) => ({ q: search.q }),
  loader: ({ deps }) => searchHouse({ data: { q: deps.q } }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const initial = Route.useLoaderData();
  const [local, setLocal] = useState(q);
  const nav = Route.useNavigate();
  const result = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchHouse({ data: { q } }),
    enabled: q.length > 0,
    initialData: q ? initial : undefined,
  });
  const data = result.data;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-4xl tracking-tight">Search</h1>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          void nav({ search: { q: local } });
        }}
      >
        <Input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Names, buildings, takes, markets"
          autoFocus
        />
      </form>
      {!q ? (
        <p className="mt-6 text-sm text-muted">Try “Inglewood”, “occupancy”, or a handle.</p>
      ) : null}
      {q && data ? (
        <div className="mt-8 space-y-10">
          {data.people.length ? (
            <section>
              <h2 className="font-display text-2xl">People</h2>
              <ul className="mt-3 space-y-2">
                {data.people.map((p) => (
                  <li key={p.handle}>
                    <Link
                      to="/u/$handle"
                      params={{ handle: p.handle }}
                      className="flex items-center gap-3 rounded-2xl bg-surface p-3 hairline"
                    >
                      <Avatar name={p.name} size="sm" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted">@{p.handle}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {data.vaults.length ? (
            <section>
              <h2 className="font-display text-2xl">Vaults</h2>
              <ul className="mt-3 space-y-2">
                {data.vaults.map((v) => (
                  <li key={v.id}>
                    <Link
                      to="/vaults/$slug"
                      params={{ slug: v.slug }}
                      className="block rounded-2xl bg-surface p-4 hairline"
                    >
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted">
                        {CATEGORY_LABEL[v.category] ?? v.category} · {v.location}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {data.markets.length ? (
            <section>
              <h2 className="font-display text-2xl">Markets</h2>
              <ul className="mt-3 space-y-2">
                {data.markets.map((m) => (
                  <li key={m.id}>
                    <Link
                      to="/markets/$slug"
                      params={{ slug: m.slug }}
                      className="flex items-start justify-between gap-3 rounded-2xl bg-surface p-4 hairline"
                    >
                      <p className="text-sm">{m.question}</p>
                      <Badge tone="yes">{m.yes_price}¢</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {data.posts.length ? (
            <section>
              <h2 className="font-display text-2xl">On the tape</h2>
              <div className="mt-3 space-y-3">
                {data.posts.map((post) => (
                  <PostCard key={post.id} post={post} compact />
                ))}
              </div>
            </section>
          ) : null}
          {!data.people.length && !data.vaults.length && !data.markets.length && !data.posts.length ? (
            <p className="text-sm text-muted">Nothing on the tape for that.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
