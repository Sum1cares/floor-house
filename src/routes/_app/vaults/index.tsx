import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultCard } from "@/components/vault-card";
import { listVaults } from "@/lib/server/vaults";
import {
  BOOKS,
  CATEGORY_LABEL,
  canAccess,
  type BookId,
  vaultBook,
} from "@/lib/tiers";
import { useProfile } from "@/lib/use-profile";
import { cn } from "@/lib/utils";
import type { Vault } from "@/lib/types";

type Search = { book?: BookId };

export const Route = createFileRoute("/_app/vaults/")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const b = s.book;
    if (b === "ground" || b === "climb" || b === "penthouse") return { book: b };
    return {};
  },
  loader: () => listVaults(),
  component: VaultsPage,
});

const BOOK_TABS: Array<"all" | BookId> = ["all", "ground", "climb", "penthouse"];

function VaultsPage() {
  const initial = Route.useLoaderData();
  const { book } = Route.useSearch();
  const nav = Route.useNavigate();
  const q = useQuery({ queryKey: ["vaults"], queryFn: () => listVaults(), initialData: initial });
  const { data: me } = useProfile();
  const [cat, setCat] = useState("all");
  const cats = ["all", ...Array.from(new Set((q.data ?? []).map((v) => v.category)))];
  const tier = me?.profile?.tier ?? "ground";

  const filtered = (q.data ?? []).filter((v) => {
    if (cat !== "all" && v.category !== cat) return false;
    if (book && vaultBook(v.min_tier) !== book) return false;
    return true;
  });

  const lockedFor = (v: Vault) => (me?.profile ? !canAccess(tier, v.min_tier) : false);

  return (
    <div>
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">Collective capital</p>
      <h1 className="font-display text-4xl tracking-tight">Vaults</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Ground can own the commons funds. The climb is apartments, franchises, dirt, fleets.
        Penthouse is the illiquid book — rally cars and private deals.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {BOOK_TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => void nav({ search: id === "all" ? {} : { book: id } })}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium hairline",
              (id === "all" ? !book : book === id) ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
            )}
          >
            {id === "all" ? "All books" : BOOKS[id].label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium hairline",
              cat === c ? "bg-elevated text-fg" : "text-muted hover:text-fg",
            )}
          >
            {c === "all" ? "All assets" : (CATEGORY_LABEL[c] ?? c)}
          </button>
        ))}
      </div>
      {q.isPending && !q.data ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-3xl" />
          ))}
        </div>
      ) : book || cat !== "all" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((v) => (
            <VaultCard key={v.id} vault={v} locked={lockedFor(v)} />
          ))}
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {(Object.keys(BOOKS) as BookId[]).map((id) => {
            const rows = (q.data ?? []).filter((v) => vaultBook(v.min_tier) === id);
            const meta = BOOKS[id];
            if (!rows.length) return null;
            return (
              <section key={id}>
                <p className="text-xs tracking-[0.22em] text-subtle uppercase">{meta.kicker}</p>
                <h2 className="font-display text-3xl tracking-tight">{meta.label}</h2>
                <p className="mt-1 max-w-xl text-sm text-muted">{meta.blurb}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {rows.map((v) => (
                    <VaultCard key={v.id} vault={v} locked={lockedFor(v)} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
