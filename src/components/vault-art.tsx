import { cn } from "@/lib/utils";

const KEY: Record<string, { a: string; b: string; c: string }> = {
  apartments: { a: "#2a2c32", b: "#3d414a", c: "#c8ccd4" },
  franchise: { a: "#26221f", b: "#3a342e", c: "#d2c4b4" },
  land: { a: "#1e2420", b: "#2c3830", c: "#9aaf9c" },
  wheels: { a: "#1c2228", b: "#2a343e", c: "#9bb0c4" },
  commercial: { a: "#221f24", b: "#353038", c: "#c4b8c8" },
  mixed: { a: "#222326", b: "#33363c", c: "#c8ccd4" },
  rally: { a: "#261e1c", b: "#3a2c28", c: "#d2b8a8" },
  solar: { a: "#1c2426", b: "#2a3a3e", c: "#a8c4c8" },
  paper: { a: "#222226", b: "#323238", c: "#c8ccd4" },
  van: { a: "#1c2228", b: "#2a343e", c: "#9bb0c4" },
  car: { a: "#261e1c", b: "#3a2c28", c: "#d2b8a8" },
  service: { a: "#222326", b: "#33363c", c: "#c8ccd4" },
  deal: { a: "#1e2420", b: "#2c3830", c: "#9aaf9c" },
  neon: { a: "#221f24", b: "#353038", c: "#c4b8c8" },
  fleet: { a: "#1c2228", b: "#2a343e", c: "#9bb0c4" },
  lodging: { a: "#2a2c32", b: "#3d414a", c: "#c8ccd4" },
  gathering: { a: "#26221f", b: "#3a342e", c: "#d2c4b4" },
  stage: { a: "#221f24", b: "#353038", c: "#c4b8c8" },
  sponsored: { a: "#1e2420", b: "#2c3830", c: "#9aaf9c" },
};

export function VaultArt({ artKey, className }: { artKey: string; className?: string }) {
  const p = KEY[artKey] ?? KEY.mixed;
  return (
    <div className={cn("relative overflow-hidden", className)} aria-hidden="true">
      <svg viewBox="0 0 400 240" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="240" fill={p.a} />
        <rect x="0" y="150" width="400" height="90" fill={p.b} />
        {artKey === "apartments" || artKey === "commercial" || artKey === "lodging" ? (
          <>
            <rect x="48" y="48" width="120" height="160" fill={p.b} />
            <rect x="180" y="28" width="90" height="180" fill={p.c} opacity="0.18" />
            <rect x="284" y="72" width="70" height="136" fill={p.b} />
            {[0, 1, 2, 3, 4].map((r) =>
              [0, 1, 2].map((c) => (
                <rect
                  key={`${r}-${c}`}
                  x={62 + c * 32}
                  y={64 + r * 26}
                  width="16"
                  height="12"
                  fill={p.c}
                  opacity={0.35}
                />
              )),
            )}
          </>
        ) : artKey === "land" ? (
          <>
            <polygon points="0,170 90,110 170,150 280,80 400,140 400,240 0,240" fill={p.b} />
            <line x1="40" y1="180" x2="360" y2="150" stroke={p.c} strokeWidth="1" opacity="0.35" />
            <line x1="70" y1="200" x2="330" y2="165" stroke={p.c} strokeWidth="1" opacity="0.2" />
          </>
        ) : artKey === "wheels" || artKey === "van" || artKey === "car" || artKey === "rally" || artKey === "fleet" ? (
          <>
            <rect x="70" y="108" width="230" height="52" rx="10" fill={p.b} />
            <rect x="170" y="86" width="110" height="40" rx="6" fill={p.c} opacity="0.2" />
            <circle cx="120" cy="168" r="18" fill={p.c} opacity="0.4" />
            <circle cx="268" cy="168" r="18" fill={p.c} opacity="0.4" />
            <rect x="40" y="188" width="320" height="2" fill={p.c} opacity="0.25" />
          </>
        ) : artKey === "solar" ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <rect
                key={i}
                x={48 + i * 80}
                y={70 + (i % 2) * 10}
                width="68"
                height="44"
                fill={p.c}
                opacity="0.22"
              />
            ))}
            <rect x="0" y="160" width="400" height="80" fill={p.b} />
          </>
        ) : artKey === "franchise" ? (
          <>
            <rect x="80" y="70" width="240" height="110" fill={p.b} />
            <rect x="80" y="70" width="240" height="28" fill={p.c} opacity="0.28" />
            <rect x="168" y="118" width="64" height="62" fill={p.a} />
          </>
        ) : artKey === "gathering" ? (
          <>
            <rect x="48" y="148" width="304" height="12" rx="2" fill={p.b} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={64 + i * 48} y={122} width="20" height="24" rx="3" fill={p.c} opacity="0.28" />
            ))}
            <rect x="160" y="64" width="80" height="36" rx="18" fill={p.c} opacity="0.12" />
          </>
        ) : artKey === "stage" ? (
          <>
            <path d="M36 176 Q200 36 364 176" fill="none" stroke={p.c} strokeWidth="2" opacity="0.35" />
            <rect x="80" y="156" width="240" height="16" fill={p.b} />
            <rect x="170" y="96" width="60" height="48" fill={p.c} opacity="0.18" />
          </>
        ) : artKey === "sponsored" ? (
          <>
            <rect x="110" y="48" width="180" height="120" fill={p.b} />
            <rect x="130" y="68" width="140" height="10" fill={p.c} opacity="0.28" />
            <rect x="130" y="92" width="100" height="8" fill={p.c} opacity="0.16" />
            <rect x="130" y="112" width="120" height="8" fill={p.c} opacity="0.16" />
            <rect x="168" y="148" width="64" height="8" fill={p.c} opacity="0.3" />
          </>
        ) : (
          <>
            <rect x="60" y="50" width="160" height="140" fill={p.b} />
            <rect x="236" y="86" width="100" height="104" fill={p.c} opacity="0.16" />
            <rect x="80" y="70" width="70" height="8" fill={p.c} opacity="0.3" />
            <rect x="80" y="90" width="110" height="6" fill={p.c} opacity="0.18" />
            <rect x="80" y="108" width="90" height="6" fill={p.c} opacity="0.18" />
          </>
        )}
      </svg>
    </div>
  );
}
