import { createFileRoute, Link } from "@tanstack/react-router";
import { Mark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-bg text-fg">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />
      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-muted">
            <Mark className="size-7 text-fg" />
            <span className="font-display text-2xl text-fg">Floor</span>
          </Link>
          <h1 className="mt-10 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Take your
            <br />
            floor.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            A cooperative investment house. Ground owns the commons funds and the market wall.
            Penthouse is the illiquid book — rally cars and private deals. The tape is public.
          </p>
        </div>
        <div className="rounded-3xl bg-surface p-8 hairline">
          <p className="text-xs tracking-[0.2em] text-subtle uppercase">Members’ entrance</p>
          <h2 className="mt-2 font-display text-3xl">Sign in</h2>
          <p className="mt-2 text-sm text-muted">Ground membership is open. Buying power is issued on first entry.</p>
          <div className="mt-8 space-y-3">
            {authEnabled ? (
              GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Continue with {p.label}
                </Button>
              ))
            ) : (
              <p className="text-sm text-muted">Sign-in is disabled.</p>
            )}
          </div>
          <p className="mt-8 text-xs leading-relaxed text-subtle">
            Eighteen and up. This is a demonstration floor. Assets, yields, and markets are
            simulated. Not an offer to sell securities.{" "}
            <Link to="/legal/terms" className="text-fg underline">
              Terms
            </Link>
            {" · "}
            <Link to="/legal/privacy" className="text-fg underline">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
