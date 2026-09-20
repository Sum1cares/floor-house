import { SignInGate } from "@/lib/auth/gates";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function NeedSignIn({ message }: { message: string }) {
  return (
    <SignInGate
      fallback={
        <div className="rounded-2xl bg-elevated p-4 hairline">
          <p className="text-sm text-muted">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                size="sm"
                variant="secondary"
                onClick={() => signIn(p.providerId, { callbackURL: window.location.pathname })}
              >
                Continue with {p.label}
              </Button>
            ))}
          </div>
        </div>
      }
    >
      {null}
    </SignInGate>
  );
}
