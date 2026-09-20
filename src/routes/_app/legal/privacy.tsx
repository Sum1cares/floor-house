import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "@/components/legal-doc";

export const Route = createFileRoute("/_app/legal/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <LegalDoc kicker="Legal" title="Privacy policy" updated="September 20, 2026">
      <p>
        FLOOR (“the house”) is a demonstration social-investment product. It is not a licensed
        broker, adviser, bank, or exchange. Balances, vaults, markets, and Commons perks are
        simulated. This policy covers the web house and the Android / iOS shells that load it.
      </p>
      <h2 className="font-display text-xl text-fg">Who runs this</h2>
      <p>
        The operator of this demonstration is the FLOOR house. Privacy questions and deletion
        requests:{" "}
        <a className="text-fg underline" href="mailto:support@floor.house">
          support@floor.house
        </a>
        . California residents may use the same door.
      </p>
      <h2 className="font-display text-xl text-fg">What we collect</h2>
      <p>If you sign in we keep a membership profile:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Display name, handle, bio, and self-attested income band</li>
        <li>Sign-in identity from the Grok auth broker (name, email, avatar the provider already has)</li>
        <li>User-generated content: posts, comments, restacks, bazaar listings</li>
        <li>App activity: votes, follows, bookmarks, paper vault and market positions, Commons claims</li>
        <li>A session cookie (or preview bearer) so you stay signed in</li>
      </ul>
      <p>
        On your device, local storage remembers only that you attested you are 18 or older. Native
        shells also keep ordinary WebView cookies for the session.
      </p>
      <h2 className="font-display text-xl text-fg">What we do not collect</h2>
      <p>
        No Social Security number, bank account, government ID, precise location, contacts, photos,
        microphone, or advertising identifiers. No real-money payments. No sale of personal data. No
        advertising SDKs. No analytics SDK beyond what the host logs to keep the floor up.
      </p>
      <h2 className="font-display text-xl text-fg">Why we collect it</h2>
      <p>
        App functionality and account management: to run membership, the tape, vaults, markets, the
        bazaar, and Commons. We do not use this data for ads, tracking, or credit decisions. Paper
        capital is not a financial product.
      </p>
      <h2 className="font-display text-xl text-fg">How we share</h2>
      <p>
        We do not sell personal information. We do not share it with data brokers. Processors that
        see data only to run the house: the sign-in broker (Grok / xAI), and the host that serves
        the app (currently Vercel). Law enforcement if we are compelled. Nothing else.
      </p>
      <h2 className="font-display text-xl text-fg">Retention and deletion</h2>
      <p>
        Profile and session data live while your membership is open. Delete in-app at Membership →
        Leave the house, on the web at Delete membership, or by writing support. We close the
        membership within seven days of an email request. Votes, follows, bookmarks, positions,
        notifications, and the profile itself are deleted. Posts you wrote stay on the tape as
        “Former member” so diligence threads still read. Native shells do not back up membership
        data.
      </p>
      <h2 className="font-display text-xl text-fg">Security</h2>
      <p>
        Transport is HTTPS only. The Android shell forbids cleartext. Passwords are not stored by
        FLOOR — sign-in is through the broker. This is still a demonstration floor; do not put
        secrets in a bio.
      </p>
      <h2 className="font-display text-xl text-fg">Children</h2>
      <p>
        The house is 18+. We do not knowingly collect data from anyone under 18. If we learn we
        have, we delete it. The age gate fails closed until you attest.
      </p>
      <h2 className="font-display text-xl text-fg">California / similar rights</h2>
      <p>
        You may request a copy or deletion of personal data via Leave the house or
        support@floor.house. We do not sell or share personal information as those words are used
        in the CCPA. We do not use sensitive personal information to infer characteristics.
      </p>
      <h2 className="font-display text-xl text-fg">International</h2>
      <p>
        The demonstration host may process data in the United States. Do not sign in if that is not
        acceptable.
      </p>
      <h2 className="font-display text-xl text-fg">Changes</h2>
      <p>
        We will date this page when it changes. Continued use after a dated update is acceptance of
        the new policy.
      </p>
    </LegalDoc>
  );
}
