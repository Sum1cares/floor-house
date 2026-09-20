import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/legal/")({ component: LegalIndex });

function LegalIndex() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs tracking-[0.22em] text-subtle uppercase">The house</p>
      <h1 className="font-display text-4xl tracking-tight">Legal</h1>
      <p className="mt-2 text-sm text-muted">
        FLOOR is a demonstration cooperative house. Paper capital. Simulated vaults and markets.
        Not a broker-dealer. Not an offer to sell securities.
      </p>
      <ul className="mt-8 space-y-3">
        <li>
          <Link to="/legal/privacy" className="block rounded-2xl bg-surface p-5 hairline">
            <p className="font-display text-xl">Privacy policy</p>
            <p className="mt-1 text-xs text-muted">What we keep, and how to leave.</p>
          </Link>
        </li>
        <li>
          <Link to="/legal/terms" className="block rounded-2xl bg-surface p-5 hairline">
            <p className="font-display text-xl">Terms of use</p>
            <p className="mt-1 text-xs text-muted">The rules of the demonstration floor.</p>
          </Link>
        </li>
        <li>
          <Link to="/legal/support" className="block rounded-2xl bg-surface p-5 hairline">
            <p className="font-display text-xl">Support</p>
            <p className="mt-1 text-xs text-muted">Delete your membership. Reach the house.</p>
          </Link>
        </li>
        <li>
          <Link to="/legal/delete" className="block rounded-2xl bg-surface p-5 hairline">
            <p className="font-display text-xl">Delete membership</p>
            <p className="mt-1 text-xs text-muted">The web door the stores require. Same as Leave the house.</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
