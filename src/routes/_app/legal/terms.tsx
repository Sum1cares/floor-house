import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/_app/legal/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <LegalDoc kicker="Legal" title="Terms of use" updated="September 20, 2026">
      <p>
        By entering FLOOR you agree these terms. If you do not, do not sign in. The house is a
        demonstration product — a social tape, paper vaults, labeled prediction markets, a bazaar,
        and Commons perks that scale with membership.
      </p>
      <h2 className="font-display text-xl text-fg">Not an offer</h2>
      <p>
        Nothing here is an offer to sell, or a solicitation to buy, securities, real estate, or any
        other investment. Simulated yields are not returns. Simulated markets are not gambling for
        real money. Do not deploy capital you cannot afford to lose — including play money you might
        confuse with the real thing.
      </p>
      <h2 className="font-display text-xl text-fg">Eligibility</h2>
      <p>You must be 18 or older. You attest that on first entry. Income bands are self-attested for this demonstration.</p>
      <h2 className="font-display text-xl text-fg">The tape</h2>
      <p>
        You own the words you post. Do not post anything illegal, anyone else’s private information,
        or content that sexualizes minors. We may remove posts and close memberships that break the
        house.
      </p>
      <h2 className="font-display text-xl text-fg">Prediction markets</h2>
      <p>
        The wall is labeled. Ground can trade paper contracts on occupancy, rates, and same-store
        sales. These are not regulated event contracts. They settle in house credits, not dollars.
      </p>
      <h2 className="font-display text-xl text-fg">The native apps</h2>
      <p>
        The iOS and Android shells wrap this same house. App Store and Play listing rules still
        apply. Store review may require additional identity providers (including Sign in with Apple)
        before a public listing ships.
      </p>
      <h2 className="font-display text-xl text-fg">Disclaimer</h2>
      <p>
        The house is provided as-is. We are not liable for simulated losses, missed allocations, or
        decisions you make because a thread on the tape sounded like diligence. This is not legal,
        tax, or investment advice.
      </p>
    </LegalDoc>
  );
}
