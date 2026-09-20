import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalDoc({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">{kicker}</p>
      <h1 className="font-display text-4xl tracking-tight">{title}</h1>
      <p className="mt-2 text-xs text-subtle">Updated {updated}</p>
      <div className="legal-copy mt-8 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
      <nav className="mt-10 flex flex-wrap gap-4 text-xs text-subtle">
        <Link to="/legal/privacy" className="hover:text-fg">
          Privacy
        </Link>
        <Link to="/legal/terms" className="hover:text-fg">
          Terms
        </Link>
        <Link to="/legal/support" className="hover:text-fg">
          Support
        </Link>
        <Link to="/legal/delete" className="hover:text-fg">
          Delete membership
        </Link>
      </nav>
    </article>
  );
}
