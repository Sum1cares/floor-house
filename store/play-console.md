# Google Play Console — fill this before submit

Package `house.floor.app` · version `1.0.0` (1) · Finance · 18+

Live URLs (once the host is public):

- Privacy: `https://floor-house.vercel.app/legal/privacy`
- Support: `https://floor-house.vercel.app/legal/support`
- Terms: `https://floor-house.vercel.app/legal/terms`
- Account deletion (web): `https://floor-house.vercel.app/legal/delete`

If the production host changes, set `FLOOR_NATIVE_URL` and re-run `npx cap sync android`.

## Store listing

| Field | Paste |
|---|---|
| App name | FLOOR |
| Short description | Cooperative house: social tape, vaults, markets, bazaar. Paper capital. |
| Full description | See `listing.md` |
| App icon | `store/icon-play.png` (512×512) |
| Feature graphic | `store/feature-graphic.png` (1024×500) |
| Phone screenshots | `store/screenshots/01-tape.png` … `06-books.png` (1080×1920, 9:16) |
| Privacy policy | Live host + `/legal/privacy` |
| Support email | support@floor.house |
| Category | Finance |
| Tags | Social, Simulation |

## App content — answer every questionnaire

### Privacy policy

URL: live host + `/legal/privacy`. Also linked in the app footer, the 18+ gate, and Membership.

### Ads

Does this app contain ads? **No.**

### Content ratings (IARC)

- Category: **Utility / Lifestyle / Finance simulation** — not a casino, not a broker
- User interaction: Users exchange user-generated text (the tape)
- Location sharing: No
- Digital purchases: No (paper credits only)
- Unrestricted internet: Yes (the tape is UGC)
- Age: **18+** because of simulated prediction markets
- Alcohol/tobacco: No
- Violence: No
- Gambling: **Simulated only** — house credits, not cash. Declare “Simulated Gambling” if the questionnaire offers it, and state paper capital in the notes.

### Target audience and content

- Target age: **18 and over only**
- Appeal to children: **No**
- Designed for families: **No** — do not opt into the Families program
- News app: **No**
- COVID-19 contact tracing / status: **No**

### News apps

This app is not a news app.

### COVID-19 contact tracing and status apps

No.

### Data safety

| Type | Collected | Shared | Required | Purpose |
|---|---|---|---|---|
| Name | Yes (if signed in) | No | Yes for membership | App functionality |
| Email | Yes (sign-in provider) | No | Yes for membership | App functionality, Account management |
| User IDs | Yes | No | Yes | App functionality |
| User-generated content | Yes (posts, comments) | No | Optional | App functionality |
| App interactions | Yes (votes, follows) | No | Optional | App functionality |

- Encrypted in transit: **Yes**
- Users can request deletion: **Yes** — in-app Membership → Leave the house, and on the web at `/legal/delete`
- Sold: **No**
- Used for ads / tracking: **No**
- Data is processed ephemerally on the demonstration floor unless `DATABASE_URL` is set
- Approximate location: **No**
- Precise location: **No**
- Photos / videos: **No**
- Contacts: **No**
- Financial info (real): **No** — paper balances only, not collected as payment data
- Device IDs / advertising ID: **No**

### Account deletion

- App allows account creation: **Yes** (Grok sign-in)
- In-app deletion: **Yes** — Membership → Leave the house
- Web deletion URL: live host + `/legal/delete`
- Email deletion: support@floor.house (seven days)
- Deleted: profile, positions, follows, bookmarks, notifications, sessions
- Retained (anonymized): posts/comments as “Former member”

### Government apps

Is this a government app? **No.**

### Financial features

Does this app provide financial features (banking, trading, lending, crypto exchange, insurance, wallet)? **No.**

Notes: FLOOR is a **demonstration**. Paper capital. Not a licensed broker-dealer. Not an offer to sell securities. Not real-money trading or gambling. Do not select “securities trading” or “crypto exchange.”

### Health

Does this app have any health features? **No.**

Do not declare Health Connect.

### Foreground services / photo & video permissions

The app requests **INTERNET** and **ACCESS_NETWORK_STATE** only. No camera, photos, microphone, location, or contacts.

## Ads

No ads. Do not declare an ad SDK.

## Release

1. Connect the live host (Vercel project `floor-house`) so privacy and deletion URLs resolve over HTTPS.
2. Set `FLOOR_NATIVE_URL` to that host, `npx cap sync android`.
3. Generate an upload keystore locally (never commit it):

```
keytool -genkeypair -v -keystore android/keystore/upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

4. Export the SHA-256 for Digital Asset Links (`store/assetlinks.template.json`).
5. `FLOOR_UPLOAD_STORE_FILE=... FLOOR_UPLOAD_STORE_PASSWORD=... npm run android:bundle`
6. Upload the AAB. Enroll in Play App Signing.
7. Internal testing first. New personal Play accounts must run a **closed test with 12 testers for 14 continuous days** before production.
8. Production listing after the privacy URL is live and IARC + Data safety are submitted.

## Native features (policy 4.3 / minimum functionality)

Reviewers should see more than a website:

- 18+ fail-closed age gate
- In-app + web account deletion
- Hardware back
- Native share sheet on tape posts
- Offline banner
- Home-screen shortcuts: Tape, Vaults, Markets
- HTTPS app links + custom scheme
- Adaptive FLOOR icons, splash, status bar
- Demo disclosure always visible: “paper capital · not an offer to sell securities”
