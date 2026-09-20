import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { VaultArt } from "@/components/vault-art";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_LABEL, TIERS, type TierId } from "@/lib/tiers";
import type { Vault } from "@/lib/types";
import { compactDollars, pct } from "@/lib/utils";

export function fundedPct(v: Vault) {
  return Math.round((v.raised_cents / Math.max(v.target_cents, 1)) * 100);
}

export function VaultCard({ vault, locked = false }: { vault: Vault; locked?: boolean }) {
  const tier = TIERS[vault.min_tier as TierId] ?? TIERS.ground;
  const penthouse = vault.min_tier === "penthouse";
  return (
    <Link
      to="/vaults/$slug"
      params={{ slug: vault.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-surface hairline"
    >
      <VaultArt artKey={vault.art_key} className="h-40 w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted">{vault.location}</p>
            <h3 className="font-display text-xl tracking-tight group-hover:underline">{vault.name}</h3>
          </div>
          <Badge>{CATEGORY_LABEL[vault.category] ?? vault.category}</Badge>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{vault.description}</p>
        <Progress value={fundedPct(vault)} />
        <div className="mt-auto flex items-center justify-between text-xs text-muted">
          <span className="tabular text-fg">
            {compactDollars(vault.raised_cents)} / {compactDollars(vault.target_cents)}
          </span>
          <span className="tabular">{pct(vault.yield_bps)} target</span>
        </div>
        <div className="flex items-center justify-between text-xs text-subtle">
          <span>{vault.members.toLocaleString()} members</span>
          <span className="inline-flex items-center gap-1">
            {locked ? <Lock className="size-3" /> : null}
            {penthouse ? "Illiquid · Penthouse" : `Opens at ${tier.name}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
