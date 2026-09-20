import { Link, createFileRoute } from "@tanstack/react-router";
import { LeaveHouse } from "@/components/leave-house";
import { LegalDoc } from "@/components/legal-doc";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/_app/legal/delete")({ component: DeletePage });

function DeletePage() {
  const { user, isPending } = useCurrentUserState();

  return (
    <LegalDoc kicker="Legal" title="Delete your membership" updated="September 20, 2026">
      <p>
        Play and the App Store require a way to close an account both inside the app and on the web.
        This page is that web door. Inside the app: Membership → Leave the house.
      </p>
      <h2 className="font-display text-xl text-fg">What we delete</h2>
      <p>
        Profile, income band, paper positions, follows, bookmarks, notifications, bazaar orders, and
        sessions. The Grok sign-in record for this house is removed. Posts and comments stay on the
        tape as “Former member” so a rent-roll thread still reads.
      </p>
      <h2 className="font-display text-xl text-fg">What we do not keep</h2>
      <p>
        No backups of membership data on the native shells. Age attestation lives only in local
        storage on your device.
      </p>
      {isPending ? (
        <p>Checking your session…</p>
      ) : user ? (
        <div className="pt-2">
          <LeaveHouse />
        </div>
      ) : (
        <p>
          Sign in first, then come back here or open{" "}
          <Link to="/membership" className="text-fg underline">
            Membership
          </Link>
          . You can also email{" "}
          <a className="text-fg underline" href="mailto:support@floor.house">
            support@floor.house
          </a>{" "}
          from outside the app — we close the membership within seven days.
        </p>
      )}
    </LegalDoc>
  );
}
