import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "floor.age.ok";

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(KEY) !== "1");
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-bg/95 p-6 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-surface p-6 hairline">
        <p className="text-xs tracking-[0.22em] text-subtle uppercase">Members’ entrance</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Eighteen and up.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          FLOOR is a demonstration investment house with a labeled prediction wall. You must be 18
          or older to enter. Paper capital. Not an offer to sell securities.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={() => {
            try {
              window.localStorage.setItem(KEY, "1");
            } catch {
              /* ignore */
            }
            setOpen(false);
          }}
        >
          I am 18 or older
        </Button>
        <p className="mt-4 text-center text-xs text-subtle">
          <Link to="/legal/terms" className="hover:text-fg">
            Terms
          </Link>
          {" · "}
          <Link to="/legal/privacy" className="hover:text-fg">
            Privacy
          </Link>
        </p>
      </div>
    </div>
  );
}
