import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ageAttested, attestAge, isLegalPath } from "@/lib/age";

export function AgeGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Fail closed: the tape stays covered until we know the member attested.
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setOk(ageAttested(typeof window === "undefined" ? null : window.localStorage));
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="fixed inset-0 z-[80] bg-bg" aria-hidden="true" />;
  }
  if (ok || isLegalPath(pathname)) return null;

  if (blocked) {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-bg p-6" role="alertdialog" aria-labelledby="age-blocked-title">
        <div className="w-full max-w-md rounded-3xl bg-surface p-6 hairline">
          <h1 id="age-blocked-title" className="font-display text-3xl tracking-tight">
            Come back at eighteen.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            FLOOR is not for anyone under 18. You can still read the privacy policy. Nothing is stored
            about this visit.
          </p>
          <p className="mt-6 text-sm">
            <Link to="/legal/privacy" className="text-fg underline">
              Privacy policy
            </Link>
          </p>
          <button
            type="button"
            className="mt-4 text-xs text-subtle underline"
            onClick={() => setBlocked(false)}
          >
            I made a mistake — I am 18 or older
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-bg/95 p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-surface p-6 hairline">
        <p className="text-xs tracking-[0.22em] text-subtle uppercase">Members’ entrance</p>
        <h1 id="age-gate-title" className="mt-2 font-display text-3xl tracking-tight">
          Eighteen and up.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          FLOOR is a demonstration investment house with a labeled prediction wall. You must be 18
          or older to enter. Paper capital. Not an offer to sell securities.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={() => {
            attestAge(window.localStorage);
            setOk(true);
          }}
        >
          I am 18 or older
        </Button>
        <Button className="mt-2 w-full" variant="ghost" onClick={() => setBlocked(true)}>
          I am under 18
        </Button>
        <p className="mt-4 text-center text-xs text-subtle">
          Read first:{" "}
          <Link to="/legal/terms" className="text-fg underline">
            Terms
          </Link>
          {" · "}
          <Link to="/legal/privacy" className="text-fg underline">
            Privacy
          </Link>
          {" · "}
          <Link to="/legal/delete" className="text-fg underline">
            Delete membership
          </Link>
        </p>
      </div>
    </div>
  );
}
