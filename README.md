# FLOOR

A cooperative investment house. The tape, vaults, markets, a bazaar, and Commons perks that grow with membership.

Ground owns the commons funds and the market wall. Penthouse is the illiquid book — rally cars and private deals.

This is a **demonstration floor**. Simulated capital. Not an offer to sell securities. Eighteen and up.

**GitHub:** [Sum1cares/floor-house](https://github.com/Sum1cares/floor-house)

## Product

- **Tape** — Hot / New / Top / Following. Restacks, nested diligence, karma.
- **Vaults** — Ground book, the climb, Penthouse book.
- **Markets** — Labeled prediction wall, open on Ground.
- **Bazaar** — Secondaries and deal flow.
- **Commons** — Perks that unlock as the house grows.
- **Membership** — Income attestation, capital climb, account deletion.

## Web

```
npm install
npm run dev
```

Production is a Vercel / Nitro build (`npm run build`). The Vercel project is `floor-house` on the sum1cares team. Set `DATABASE_URL` to a Postgres URL for a durable house. Without it the app uses embedded PGLite.

Privacy, terms, and support (required by the stores): `/legal/privacy`, `/legal/terms`, `/legal/support`.

## Native (Play / App Store)

The Android and iOS shells are Capacitor WebViews of the live house (`house.floor.app`).

Store copy, 1024px App Store icon, 512px Play icon, feature graphic, and phone screenshots live in `store/`. Paste `store/listing.md` into Play Console and App Store Connect.

iOS requires Xcode on a Mac and an Apple Developer Program membership. Google Play requires a Play Console account and a signing key. Sign in with Apple is required before a public iOS listing if other social logins stay on the door.
