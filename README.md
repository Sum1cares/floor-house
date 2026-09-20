# FLOOR

A cooperative investment house. The tape, vaults, markets, a bazaar, and Commons perks that grow with membership.

Ground owns the commons funds and the market wall. Penthouse is the illiquid book — rally cars and private deals.

This is a **demonstration floor**. Simulated capital. Not an offer to sell securities. Eighteen and up.

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

Production is a Vercel / Nitro build (`npm run build`). Set `DATABASE_URL` to a Postgres URL for a durable house. Without it the app uses embedded PGLite.

## Native (Play / App Store)

The Android and iOS shells are Capacitor WebViews of the live house.

```
npm install
npx cap add android
npx cap add ios
npx cap sync
```

`FLOOR_NATIVE_URL` (see `.env.example`) is the host the shells load. Store copy, privacy URLs, and review notes live in `store/listing.md`.

iOS requires Xcode on a Mac and an Apple Developer Program membership. Google Play requires a Play Console account and a signing key. Sign in with Apple is required before a public iOS listing if other social logins stay on the door.
