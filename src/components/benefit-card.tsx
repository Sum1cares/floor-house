import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { VaultArt } from "@/components/vault-art";
import { Badge } from "@/components/ui/badge";
import { isUnlocked, membersNeeded } from "@/lib/commons";
import { CATEGORY_LABEL } from "@/lib/tiers";
import type { Benefit } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BenefitCard({
  benefit,
  memberCount,
  held,
}: {
  benefit: Benefit;
  memberCount: number;
  held?: boolean;
}) {
  const open = isUnlocked(memberCount, benefit.unlock_at);
  const need = membersNeeded(memberCount, benefit.unlock_at);
  const full = benefit.capacity > 0 && benefit.claimed >= benefit.capacity;
  return (
    <Link
      to="/commons/$slug"
      params={{ slug: benefit.slug }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-surface hairline",
        !open && "opacity-70",
      )}
    >
      <div className="relative">
        <VaultArt artKey={benefit.art_key} className="h-36 w-full" />
        {!open ? (
          <div className="absolute inset-0 grid place-items-center bg-bg/45">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg/80 px-3 py-1 text-xs text-fg">
              <Lock className="size-3" />
              {need.toLocaleString("en-US")} more members
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <Badge>{CATEGORY_LABEL[benefit.category] ?? benefit.category}</Badge>
          {held ? <span className="text-[11px] tracking-wide text-yes uppercase">Yours</span> : null}
        </div>
        <h3 className="font-display text-xl tracking-tight group-hover:underline">{benefit.name}</h3>
        <p className="text-xs text-muted">{benefit.location}</p>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-subtle">
          <span>{benefit.cadence}</span>
          {open ? (
            <span className="tabular">
              {full
                ? "Full"
                : benefit.capacity > 0
                  ? `${benefit.claimed}/${benefit.capacity} held`
                  : "Standing"}
            </span>
          ) : (
            <span className="tabular">Unlocks at {benefit.unlock_at.toLocaleString("en-US")}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
