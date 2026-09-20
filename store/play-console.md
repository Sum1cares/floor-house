# Google Play Console — fill this before submit

Package `house.floor.app` · version `1.0.0` (1) · Finance · 18+

## Store listing

| Field | Paste |
|---|---|
| App name | FLOOR |
| Short description | Cooperative house: social tape, vaults, markets, bazaar. Paper capital. |
| Full description | See `listing.md` |
| App icon | `store/icon-play.png` (512×512) |
| Feature graphic | `store/feature-graphic.png` (1024×500) |
| Phone screenshots | `store/screenshots/01-tape.png` … `06-books.png` |
| Privacy policy | Live host + `/legal/privacy` |
| Support | Live host + `/legal/support` |

## Content rating (IARC)

- Category: **Utility / Lifestyle / Finance simulation** — not a casino, not a broker
- User interaction: Users exchange user-generated text (the tape)
- Location sharing: No
- Digital purchases: No (paper credits only)
- Age: **18+** because of simulated prediction markets
- Alcohol/tobacco: No
- Violence: No
- Gambling: **Simulated only** — house credits, not cash. Declare “Simulated Gambling” if the questionnaire offers it, and state paper capital in the notes.

## Data safety

| Type | Collected | Shared | Required | Purpose |
|---|---|---|---|---|
| Name | Yes (if signed in) | No | Yes for membership | App functionality |
| Email | Yes (sign-in provider) | No | Yes for membership | App functionality, Account management |
| User IDs | Yes | No | Yes | App functionality |
| User-generated content | Yes (posts, comments) | No | Optional | App functionality |
| App interactions | Yes (votes, follows) | No | Optional | App functionality |

- Encrypted in transit: **Yes**
- Users can request deletion: **Yes** — Membership → Leave the house
- Sold: **No**
- Used for ads / tracking: **No**
- Data is processed ephemerally on the demonstration floor

## Ads

No ads. Do not declare an ad SDK.

## News / finance declarations

This is a **demonstration**. Not a licensed broker-dealer. Not an offer to sell securities. Not real-money trading or gambling. Review notes in `listing.md`.

## Release

1. Connect the live host (Vercel project `floor-house`) so privacy URLs resolve.
2. Set `FLOOR_NATIVE_URL` to that host, `npx cap sync android`.
3. Generate an upload key, `bundleRelease` / Play App Signing.
4. Internal testing track first (at least 12 testers, 14 days if you want production on a new personal account).
5. Production listing after the privacy URL is live.
