import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/_app/legal/support")({ component: SupportPage });

function SupportPage() {
  return (
    <LegalDoc kicker="Legal" title="Support" updated="September 20, 2026">
      <p>
        This demonstration floor is run as a product, not a call center. Most answers live on the
        tape. Membership, deletion, and store-listing questions come here.
      </p>
      <h2 className="font-display text-xl text-fg">Delete your membership</h2>
      <p>
        Sign in, open Membership, and use Leave the house. That deletes your profile, positions,
        follows, bookmarks, notifications, and sessions. Posts stay on the tape as Former member so
        diligence threads still read.
      </p>
      <p>
        <Link to="/membership" className="text-fg underline">
          Go to membership
        </Link>
      </p>
      <h2 className="font-display text-xl text-fg">Store listings</h2>
      <p>
        FLOOR on the web is the source of truth. Native apps load this house. A Play or App Store
        listing is not a licensed brokerage. If a store build is live, its privacy URL is this
        policy and its support URL is this page.
      </p>
      <h2 className="font-display text-xl text-fg">Write the house</h2>
      <p>
        Email{" "}
        <a className="text-fg underline" href="mailto:support@floor.house">
          support@floor.house
        </a>{" "}
        for privacy, deletion, or accessibility. We aim to answer within seven days.
      </p>
    </LegalDoc>
  );
}
