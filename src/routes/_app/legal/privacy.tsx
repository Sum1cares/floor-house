import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/_app/legal/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <LegalDoc kicker="Legal" title="Privacy policy" updated="September 20, 2026">
      <p>
        FLOOR is a demonstration social-investment house. It is not a licensed broker, adviser, bank,
        or exchange. Balances, vaults, markets, and Commons perks are simulated for the demo.
      </p>
      <h2 className="font-display text-xl text-fg">What we collect</h2>
      <p>
        If you sign in, we keep a membership profile: display name, handle, bio, attested income
        band, and activity on the tape, vaults, markets, bazaar, and Commons. Sign-in identity comes
        from the Grok auth broker (name, email, and avatar the provider already has). We do not ask
        for a Social Security number, bank account, or government ID.
      </p>
      <h2 className="font-display text-xl text-fg">What we do not collect</h2>
      <p>
        No real-money payments. No location tracking beyond what you type into a listing. No sale of
        personal data. No advertising SDKs. The native shells load this same house in a WebView.
      </p>
      <h2 className="font-display text-xl text-fg">How long</h2>
      <p>
        Profile and session data live while your membership is open. Posts you wrote stay on the
        tape as “Former member” after you leave, so the diligence thread still reads. Votes,
        follows, bookmarks, positions, notifications, and the profile itself are deleted when you
        delete membership from Membership → Leave the house, or by writing support.
      </p>
      <h2 className="font-display text-xl text-fg">Cookies and local storage</h2>
      <p>
        A session cookie (or a preview bearer token) keeps you signed in. Local storage remembers
        that you attested you are 18 or older. That is it.
      </p>
      <h2 className="font-display text-xl text-fg">Children</h2>
      <p>The house is 18+. We do not knowingly collect data from anyone under 18.</p>
      <h2 className="font-display text-xl text-fg">Contact</h2>
      <p>
        Privacy questions: the Support page. California residents may request a copy or deletion of
        personal data the same way — use Leave the house, or write support.
      </p>
    </LegalDoc>
  );
}
