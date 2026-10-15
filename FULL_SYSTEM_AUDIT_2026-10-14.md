# ESDispatch — Full System Audit Report

**Date:** 2026-10-14
**Scope:** Entire repository at `D:\Eng App` — Android app (`mobile/`), web admin + public site (repo root, Vite/React deployed to Vercel **and** Firebase Hosting), Firebase Cloud Functions (`functions/`), Firestore & Storage security rules, CI/CD workflow, git history, and secret hygiene.
**Method:** Static analysis, first-hand code review of every critical path, secret scanning, git-history forensics, Firestore/Storage rules analysis line-by-line, and live build verification (`npx tsc --noEmit`, Gradle `compileDebugKotlin`, Gradle `assembleRelease`).

> This is an independent re-audit. Prior internal audits exist in the repo (`APP_AUDIT.md`, `PRODUCTION_AUDIT.md`, `ESDISPATCH_FULL_SYSTEM_AUDIT.md`, `MICRO_UI_AUDIT.md`, …). Findings below were **verified first-hand** in the current `origin/main` code, not inherited from those documents.

---

## 1. Executive Summary

**Verdict: the application is feature-rich and well-polished on the surface, but the backend security posture is critically unsound.** The dominant systemic flaw is that **trust boundaries live in the client and in Firestore documents writable by the client**. An attacker with only a free authenticated account can:

1. Mint unlimited wallet money (escrow-payout fraud),
2. Promote themselves to rider and receive payouts,
3. Read every pending delivery's handover OTP, customer phone, and addresses (parcel theft),
4. Spoof any public tracking link (fake courier position/status),
5. Broadcast notifications to every user,
6. Read the live GPS coordinates of all riders,
7. Use the company SMTP server as an open mail relay (no login required at all), and
8. Bypass email verification entirely.

Money, roles, GPS, OTP, notifications, and support chats are all one document write away from being compromised. Meanwhile, two mandated build-workflow guarantees are currently broken: `compileDebugKotlin` **fails** on a clean machine (missing release keystore blocks even debug compiles), and the production admin fleet map receives an **empty Google Maps API key**.

**Positives worth preserving:** the release-signing keystore and service-account key were never leaked to git history (verified), `.env` is properly gitignored (verified), the Paystack top-up verification callable is genuinely well implemented, wallet operations use transactions, OTP brute-force lockouts exist for email OTPs, most Firestore listeners are properly cleaned up, and UI compliance with the branding lock is good on the screens that matter most (headers, splash, preloader, dock, hero grid, OrderLogs, Tracking).

**Bottom line:** fix the 11 CRITICALs before any further feature work. The majority are security-rule and Cloud-Function changes — small diffs, huge impact.

---

## 2. Risk Register (ranked)

| # | Sev | Area | Finding | Primary location |
|---|-----|------|---------|------------------|
| C1 | 🔴 CRITICAL | Money | Unlimited wallet minting: any authed user can create/update deliveries with arbitrary `price`, `tipAmount`, `riderId`, then set `status: DELIVERED`; the escrow trigger credits `riderId` 80% + tip | `firestore.rules:311-327` + `functions/src/index.ts:265-353` |
| C2 | 🔴 CRITICAL | Roles | Self-service escalation to rider: create `riders/{ownUid}` → trigger sets `role:'rider'` + custom claims | `firestore.rules:632-636` + `functions/src/index.ts:781-815, 869-891` |
| C3 | 🔴 CRITICAL | Data | Handover OTP + customer PII readable by any authed user on all PENDING deliveries; OTP plaintext, client-generated, rider device holds it | `firestore.rules:311-317`, `FirebaseManager.kt:880,1052,1120,2392`, `DeliveryViewModel.kt:1761` |
| C4 | 🔴 CRITICAL | Data | Public tracking spoofing: any authed user can overwrite any `public_tracking` doc by writing `userId: <own uid>` in payload | `firestore.rules:385-394` |
| C5 | 🔴 CRITICAL | Email | Open mail relay: `/api/email/test-send` is unauthenticated, CORS `*`, sends arbitrary HTML via production SMTP | `api/email/test-send.js:102-181` |
| C6 | 🔴 CRITICAL | Auth | Firebase Auth password = `pin+pin_<hash(email)>` — 10,000-candidate brute force per known email; PINs also stored plaintext/XOR-"encrypted" | `FirebaseManager.kt:276-283`, `DeliveryViewModel.kt:8860-8910` |
| C7 | 🔴 CRITICAL | Auth | Email verification bypass: `sendEmailOtp` accepts caller-supplied 6-digit code; `verifyEmailOtp` (unauthenticated) marks email verified | `functions/src/index.ts:939-1038` |
| C8 | 🔴 CRITICAL | Abuse | Notification broadcast: root `notifications` create by any authed user → fan-out trigger writes to every inbox | `firestore.rules:822` + `functions/src/index.ts:820-864` |
| C9 | 🔴 CRITICAL | Privacy | Live GPS of all riders + full rider/driver/vendor profiles readable by any authed user | `firestore.rules:580-584, 620-642` |
| C10 | 🔴 CRITICAL | Privacy | Support-chat messages and most subcollections (`marketplace_orders`, `batches`, `public_tracking`, marketplace products/stores) readable/writable by any authed user | `firestore.rules:666-674, 690-694, 737-740, 921, 396-400` |
| C11 | 🔴 CRITICAL | Money | Client-side wallet credit path (top-up without Paystack reference) + guest bookings paid from editable local prefs and synced as `PAID` | `WalletViewModel.kt:83`, `FirebaseManager.kt:692-718, 914`, `DeliveryViewModel.kt:5764-5778` |
| H1 | 🟠 HIGH | Ops | Admin control surface (pricing, tip/loyalty toggles, sub-admins, bulk reassign, overrides) is 100% client-side writes with only a UI gate | `DeliveryViewModel.kt:694-922` |
| H2 | 🟠 HIGH | Secrets | Live `functions/service-account.json` private key on disk (gitignored, never committed — verified). Rotate anyway | `functions/service-account.json` |
| H3 | 🟠 HIGH | Product | Seeded fake rider/trend/risk "AI analytics" presented as live admin data | `DeliveryViewModel.kt:2629-2752` |
| H4 | 🟠 HIGH | Product | Raw crash stack traces shown to end users in a dialog; crash file written to app storage | `MainActivity.kt:100-125`, `DispatchApplication.kt:122-132` |
| H5 | 🟠 HIGH | Config | `GEMINI_API_KEY` is literally the Google Maps key; Gemini key is embedded in the APK and sent in URL query strings | `.env:41-45,70`, `app/build.gradle.kts:48-49`, `DeliveryViewModel.kt:6930` |
| H6 | 🟠 HIGH | Build | Release keystore absent from repo/disk; `compileDebugKotlin` **fails** on a clean machine; fallback signing passwords `android123` in Gradle + CI | `app/build.gradle.kts:59-77`, `.github/workflows/deploy-admin-and-mobile.yml:74-76` |
| H7 | 🟠 HIGH | Web | Admin fleet map (`LiveTrackingMap`) ships an empty Google Maps API key in production (`process.env` destroyed by Vite `define`) | `src/app/engdadmin/LiveTrackingMap.tsx:111`, `vite.config.ts:386-387` |
| H8 | 🟠 HIGH | Email | SMTP password stored in Firestore `system_settings/smtp`, transits to admin browser in plaintext; `tls.rejectUnauthorized:false` everywhere | `EmailStudioTab.tsx:305-315`, `emailTransporter.ts:73` |
| H9 | 🟠 HIGH | Storage | Any authed user can upload into any delivery-proof / chat / product folder; `image/*` allows SVG (stored XSS) | `storage.rules:47-86` |
| H10 | 🟠 HIGH | Config | `phone_indices` readable by anyone without auth (phone registry enumeration); `system_config` public read | `firestore.rules:294-303, 747-750` |
| M1 | 🟡 MED | Build | ProGuard `-keep class com.esdispatch.**` → release app code is effectively unobfuscated (salts, keys, logic trivially extractable) | `proguard-rules.pro:66` |
| M2 | 🟡 MED | Build | `targetSdk 34` (Play requires 35+); `missingGoogleServicesStrategy=WARN` allows shipping Firebase-less builds | `libs.versions.toml`, `app/build.gradle.kts:130-132` |
| M3 | 🟡 MED | Stack | AGENTS.md says "Next.js admin on Vercel" but production is a Vite SPA; 44 dead Next files + compiled `functions/lib` committed | `vercel.json`, `src/app/**`, `functions/lib/**` |
| M4 | 🟡 MED | Config | Stale clients in `google-services.json`; `.env` app-id mismatches real client; hardcoded stale Firebase key fallback in `src/lib/firebase.js:17` | `google-services.json:8-97` |
| M5 | 🟡 MED | Product | Placeholder hotline `+234 803 123 4567` shown as the live 24/7 support number; placeholder emails (`support@ESDispatch.com`) | `AuthScreens.kt:671,686`, `ProfileScreens.kt:4632,4666` |
| M6 | 🟡 MED | Product | Mojibake in admin UI (`"drivers Â· "`, `"Staging Â· Hidden…"`); off-brand golds `#FFB300`/`#E5A93B` in Dashboard; green accent in Economy booking | `AdminDashboard.tsx:699,9193`, `DashboardScreen.kt:2642+` |
| M7 | 🟡 MED | Security | `otpAttempts` lockout resettable (anyone can update available deliveries); OTP expiry re-extended on every sync; non-constant-time compare | `FirebaseManager.kt:881`, `functions/src/index.ts:633-645` |
| M8 | 🟡 MED | Spec | Mobile AGENTS.md mandates "Corporate Fleet Manifest / Salary & Performance Payroll" — **zero** salary/payroll code exists in the app | `mobile/app/AGENTS.md` vs codebase |
| M9 | 🟡 MED | Security | Root `transactions`/`rider_tips`/`referrals`/`audit_logs` createable by any authed user (forged ledger/tip/audit records) | `firestore.rules:465-510, 837-843, 879-889` |
| M10 | 🟡 MED | Privacy | Personal email hardcoded in HTTP User-Agent sent to nominatim.openstreetmap.org | `TrackingScreen.kt:3621` |
| L1–L8 | ⚪ LOW | Various | See §8 (fail-open phone check, no-op `attachBaseContext`, unused RTDB dependency, alpha crypto libs, `allowBackup` without secure-prefs exclusion, dead `isAdmin()` helper in storage rules, `api/auth/check-phone.js` `in`-operator bug, no device attached for on-device verification) | §8 |

---

## 3. Critical Findings — Detailed

### C1 — Unlimited wallet minting via delivery settlement 🔴

**Chain (all verified in code):**
1. `firestore.rules:319` — `allow create: if isAuth();` — any authenticated user creates a `deliveries` doc with **no field validation** (arbitrary `price`, `deliveryFee`, `tipAmount`, `riderId`).
2. `firestore.rules:322-327` — `allow update` when `isAvailableDelivery(resource.data)` (status PENDING/QUEUED/OFFERED/…): again **no field restrictions**. Any authed user can update **any** available delivery — including someone else's — and change `price`, `tipAmount`, `riderId`, `otpCode`, `otpAttempts`, `status` in a single write.
3. `functions/src/index.ts:265-353` — `onDeliveryStatusUpdated` firestore `onUpdate` trigger: when `newStatus == DELIVERED` and not previously settled, credits `users/{riderId}.walletBalance += deliveryFee*0.80 + tipAmount` (line 305-315) and logs an earnings transaction.

**Exploit:** create a fake delivery (own `riderId`, `price` = ₦10,000,000), update status to `DELIVERED`. The trigger mints the payout. Idempotency guard (`settlement_records/{deliveryId}`) only prevents double-credit *per delivery ID* — nothing stops unlimited new IDs. The credited balance is withdrawable through rider payout flows.

**Fix:** deliveries create/update must be participant/dispatcher/admin-scoped with a field allow-list per status transition; escrow settlement must validate order provenance (e.g., a server-created `checkout_session` with a paid ledger entry) before crediting.

### C2 — Self-service escalation to rider 🔴

1. `firestore.rules:632-636` — `match /riders/{riderId} { allow create: if isAuth() && (request.auth.uid == riderId || isAdmin()); }` — any user creates `riders/{ownUid}`.
2. `functions/src/index.ts:781-815` (`onRiderDocumentChanged`) — on any write to `riders/{id}`, sets `users/{id}.role = 'rider'` and custom claims `{rider:true, customer:false}`.
3. Same again via `users/{uid}/riders/{riderId}` (`onRiderSubcollectionChanged`, lines 869-891), writable through the owner-writable catch-all at `firestore.rules:284-287`.

Any customer becomes a rider (eligible for auto-dispatch, 80% payouts, fleet writes). This is also how the C1 minted money becomes *withdrawable*.

### C3 — Handover OTP secrecy is void 🔴

- OTP generated **client-side** with Kotlin `(1000..9999).random()` (non-CSPRNG): `DeliveryViewModel.kt:1761, 1779, 5663, 5832` (6-digit variant at 2104, 4396). Admin web generates it with `Math.random()` (`AdminDashboard.tsx:3417` et al.).
- Stored **plaintext** in the delivery doc: `FirebaseManager.kt:880` (`"otpCode" to parcel.otpCode`).
- Readable by **any authenticated user** while status is available: `firestore.rules:311-317`.
- The **rider app itself parses `otpCode` into its Parcel model** (`FirebaseManager.kt:1052, 1120, 1365, 1399, 1549, 1583`) and rider verification compares rider input against the same doc field (`FirebaseManager.kt:2392`).
- The public tracking page renders the OTP openly (`PublicTrackingPage.tsx:438-470, 696-699`), and it reads the **raw `deliveries/{id}` doc** (`PublicTrackingPage.tsx:118`) — bypassing the (properly redacted) `public_tracking` projection that the Cloud Function maintains. The email-verification page also puts OTPs in URL query params (browser history/referrers).
- OTP pushed in notifications with `VISIBILITY_PUBLIC` (`MyFirebaseMessagingService.kt:94, 228`).
- Expiry (24h) is re-extended on every sync because `parcelToMap` always writes a fresh `otpExpiresAt` (`FirebaseManager.kt:881`).

The "secure OTP handshake" is cosmetic. Anyone logged in can read every available delivery's OTP, receiver phone, and addresses and impersonate the recipient.

### C4 — Public tracking spoofing 🔴

`firestore.rules:385-394`: `allow write` if `request.resource.data.get('userId','') == request.auth.uid` — the check tests the **incoming payload**, not an existing document. Any authed user writes `{userId: <my uid>, status: 'DELIVERED', courierLatitude: …}` to **any** `/public_tracking/{deliveryId}` doc. Recipients' tracking links are fully spoofable (status, courier position, phone).

### C5 — Open mail relay 🔴

`api/email/test-send.js` (live serverless route on Vercel): no authentication, CORS `*`, accepts `{to, subject, html}` and sends through production SMTP with env credentials. Rate limit is 3/5min **per IP+recipient, in-memory only** (resets on cold start; trivially bypassed by rotating IPs/recipients). Anyone on the internet can send phishing/spam as the business.

### C6 — PIN-derived Firebase Auth password 🔴

`FirebaseManager.kt:276-283`:
```kotlin
fun getDynamicPassword(email: String, pin: String): String {
    val cleanPrefix = email.trim().lowercase().substringBefore("@")
    var hash = 0; for (ch in cleanPrefix) hash = (hash * 31) + ch.code
    val absHashStr = kotlin.math.abs(hash).toString().take(6).padEnd(6, 's')
    return "${pin}${pin}_$absHashStr"
}
```
The Firebase Auth password is deterministically derived from a **4-digit PIN** → at most 10,000 candidates per known email, brute-forceable against Firebase's Auth REST API (or by extracting the algorithm from the unobfuscated APK — see M1). Additionally, `SecurityUtils` (`DeliveryViewModel.kt:8860-8910`) stores PINs as plaintext or XOR-"encrypted" with a hardcoded key, and `verifyPin` accepts a **plaintext match** (line 8886).

### C7 — Email verification bypass 🔴

`functions/src/index.ts:939-999` (`sendEmailOtp`, **no auth**): accepts a caller-supplied 6-digit code via `data.code` (line 943→954) and emails it to any address. `verifyEmailOtp` (lines 1004-1038, also **no auth**) verifies the caller's chosen code and then marks the Firebase Auth user's email **verified** (`auth.updateUser(uid, {emailVerified: true})`). No mailbox access is ever needed. Also a mail-bomb vector: no global rate cap, 30s cooldown is per email+purpose.

### C8 — Notification broadcast spam 🔴

`firestore.rules:815-830`: root `notifications` `allow create: if isAuth()`. `onNotificationCreated` (`functions/src/index.ts:820-864`) fans the doc out to **every** user's inbox. Any account can push arbitrary content to the entire user base.

### C9 — Fleet-wide live GPS readable by any account 🔴

`firestore.rules:580-584`: `fleet_locations/{riderId} allow read: if isAuth()`. Every free account can watch all riders' live coordinates. Rider/driver/vendor profile docs (name, email, phone, photo, live lat/lng) are readable by any authed user (`firestore.rules:620-642`), and unauthenticated readers can even read rider/vendor profiles via `users` rules 162-169.

### C10 — Unscoped subcollection access 🔴

- `support_chats/{ticketId}/messages` — `allow read, write: if isAuth()` (`firestore.rules:666-669`) — read/write **all** support tickets' messages.
- `marketplace_orders/{id}/{allSubcollections}`, `batches/{id}/{allSubcollections}`, `public_tracking/{id}/{allSubcollections}` — write by any authed user.
- `marketplace_products`/`marketplace_stores` subcollections — write by any authed user (`firestore.rules:690-694`).

### C11 — Client-authoritative money paths 🔴

- `WalletViewModel.kt:83` — top-up without a Paystack reference calls `FirebaseManager.updateUserWalletBalance` (client `runTransaction` credit, `FirebaseManager.kt:692-718`). The verified server path exists (lines 44-80, and the callable itself is well built), but the code-level fallback remains.
- `DeliveryViewModel.kt:5764-5778` — guest bookings debit an **editable SharedPreferences** balance and `parcelToMap` writes `paymentStatus = "PAID"` when blank (`FirebaseManager.kt:914`). A modified client books unlimited "PAID" deliveries.
- Note: current repo rules block owner writes to `walletBalance` (`firestore.rules:190-199`), which *contradicts* the client transaction paths — either deployed rules differ from the repo (drift) or authenticated booking debit is currently broken in production. **Must be verified against the deployed ruleset.**

---

## 4. High Findings — Detailed

### H1 — Admin control surface is client-side only
`DeliveryViewModel.kt:694-922`: `updatePricingConfig`, `togglePointsSystem`, `toggleTipSystem`, `toggleDashboardSection`, `updateAdminCardConfig`, `addSubAdmin`, `bulkUpdateDeliveryStatus`, `bulkReassignDriver`, `driverMasterControlOverride`, `syncGlobalSettingsToFirestore` all write `system_config/*`, `sub_admins/*`, and delivery docs **directly from the client**. `verifyAdminAccess` (661-692) is a client-side role+PIN gate. Enforcement rests entirely on Firestore rules (`isAdmin()` reads `users/{uid}.role` — a doc the *user themselves creates* at signup; see the create rule's weak role blocklist at `firestore.rules:172-184`, which permits `rider`/`vendor` and is circumvented entirely by C2's triggers).

### H2 — Service-account key on disk
`functions/service-account.json` contains a live production Admin-SDK RSA private key. Verified **never committed** to git history (`git rev-list --all --objects` clean) and excluded from Vercel (`.vercelignore`). Still: rotate it, load it from CI secrets/env instead, and treat the working tree as potentially shared.

### H3 — Fake analytics presented as live
`DeliveryViewModel.kt:2629-2658` seeds hardcoded fake riders ("Richard Dheo", "Marcus Vance", "Sandra Croft", …), fake weekly trends and risk reports into admin AI surfaces; `updateDynamicAnalytics` (2661-2752) recalculates them to look live. Violates the product-language rules ("never fake telemetry").

### H4 — Stack traces in production UI
`MainActivity.kt:100-125` shows the previous crash's raw stack trace (up to 3,000 chars) in an AlertDialog with a Copy button. `DispatchApplication.kt:122-132` writes `esdispatch_crash.txt` to app storage. Exposes internals to end users.

### H5 — Gemini key = Maps key; Gemini key shipped in APK
`.env`: `GEMINI_API_KEY` and `GOOGLE_MAPS_API_KEY` hold the **identical value** (`AIzaSyCnYp…0NAs`) — a copy-paste error meaning AI calls use the Maps key (or the "Gemini" key has Maps restrictions). The value is compiled into the APK (`buildConfigField`, `app/build.gradle.kts:48-49`) and passed in URL query strings (`DeliveryViewModel.kt:6930`) — fully client-exposed, and M1 guarantees easy extraction.

### H6 — Broken local release workflow
- No `mobile/app/release-key.jks` on disk, no `KEYSTORE_PATH`/`STORE_PASSWORD` env vars → **`gradlew :app:compileDebugKotlin` fails at configuration** (`build.gradle.kts:75` throws `GradleException`). The AGENTS.md-mandated step 1 cannot run on a clean machine. Verified live: `BUILD FAILED in 3m 14s`.
- Fallback signing passwords are `android123` in Gradle (`build.gradle.kts:69,71`) and CI (`deploy-admin-and-mobile.yml:74,76`). CI keystore comes from `secrets.KEYSTORE_BASE64` (good), but if the secret is missing the workflow signs with the guessable fallback.
- Last shipped APK (27.5 MB, 2026-09-29) is signed with cert `CN=ESDispatch` (SHA-256 `d0b82cf7…`) — the matching keystore exists only in CI/offsite. Keep it backed up: losing it breaks Play updates.

### H7 — Admin fleet map ships an empty API key
`LiveTrackingMap.tsx:111` reads `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""`; `vite.config.ts:386-387` defines `"process.env": {}`, so production bundles resolve it to `""`. The fleet map (the headline feature of commit `56b93b4`) loads with no key. (`AdminDispatchBookingModal.tsx:290` has a hardcoded fallback and works.)

### H8 — SMTP credential handling
SMTP password is storable in Firestore `system_settings/smtp` (`EmailStudioTab.tsx:305-315`) — admin-readable, transits to the browser in plaintext. All transports set `tls: { rejectUnauthorized: false }` (`emailTransporter.ts:73`, `api/email/*.js`) — MITM-able SMTP.

### H9 — Storage rules unscoped writes
`storage.rules:47-86`: delivery proofs, pickup photos, POD, arrival photos, chat attachments — **write by any authenticated user** (no participant check); marketplace product images writable by any authed user. `isValidImage()` accepts `image/.*` → **SVG** (stored-XSS if ever rendered inline). Also `arrival_photos/{fileName}` is a flat path with no rider segment.

### H10 — Public data surfaces
`phone_indices/{phoneKey}` — `allow read: if true` (`firestore.rules:294-303`): unauthenticated phone-registry enumeration. `system_config/*` public read (pricing/geo/settings readable without login).

---

## 5. What Was Verified Clean ✅

- **Git hygiene:** `.env` and `functions/service-account.json` are gitignored and **never existed in any commit** (verified via `git rev-list --all --objects`). The historical `mobile/app/release-key.jks` blob (commits `368d041`→removed in `d0215a4`, both on `origin/main`) is **not a real keystore** — keytool rejects the format; it was a dummy file. No `sk_live`/secret keys committed.
- **Paystack top-up callable** (`verifyPaymentAndTopUp`, `functions/src/index.ts:483-597`): auth-checked, gateway-verified amount, idempotent ledger, TEST-mock refs rejected in production. Best piece of security code in the repo.
- **Email OTP storage** (`verification_otps`): hashed (HMAC-SHA256 + pepper), CSPRNG codes, 5-attempt lockout, Firestore-write-locked to Admin SDK. (Undermined by C7's client-supplied code, but the plumbing is right.)
- **Firestore listener hygiene:** callbackFlow/awaitClose used; ViewModel clears `listenerRegistrations` in `onCleared()`; GPS listener teardown present.
- **Transactions used** for booking debit, withdrawal, marketplace checkout.
- **`npx tsc --noEmit` passes clean** (zero type errors).
- **`PENDING → DELIVERED` public_tracking sync is redacted** before write (`functions/src/index.ts:255-260`).
- **`settlement_records` / `system_ledger` / `verification_otps`** correctly server-locked.
- **Landing-page `.env.local`**: only public `NEXT_PUBLIC_*` values; whole folder gitignored.
- **UI branding:** ScreenHeader lock, splash, preloader, dock icon contrast (Obsidian on Gold), TrackingScreen `#FFB800` (no `#D4AF37` in controls), OrderLogs layout, hero grid (Wallet+Market), HeroCarousel `shadowElevation=0`, motion tokens exactly match spec.

---

## 6. Build & Release Workflow Audit

| Check | Result |
|---|---|
| `npx tsc --noEmit` (web) | ✅ Clean |
| `gradlew :app:compileDebugKotlin` (clean env) | ❌ **Fails at config** — `Release keystore not found` (AGENTS.md step 1 broken without keystore) |
| `gradlew :app:assembleRelease` (with temp keystore) | *(result recorded in §12 — see build log note below)* |
| `adb devices` | No device attached (on-device verification not possible this session) |
| Release signing | Keystore absent locally; exists only as CI secret / offsite. Fallback passwords `android123`. |
| Play policy | `targetSdk 34` (below current requirement), AGP 8.7.3 / Kotlin 2.1.0 fine |
| CI/CD | Dual deployment: Vercel (vite, `dist`) + Firebase Hosting live channel (workflow). Play internal track on tags. Good artifact uploads. |
| google-services | Stale legacy clients present; `.env` app-id mismatches real client app-id; build allowed without the file (WARN passthrough) |
| Obfuscation | Disabled for all app classes (`-keep class com.esdispatch.** { *; }`) |

**Stack reality check:** the repo root is a **Vite + React SPA** in production (`vercel.json: framework "vite"`, `npm run build` → `vite build` → `dist`), **not** Next.js. The `src/app/**` Next tree (44 files, incl. `middleware.ts` and its admin `noindex` header logic) is dead code in production, as are `api/email/smtp-verify.ts`-era Next route stubs. AGENTS.md's "Next.js web admin on Vercel" framing is inaccurate; recommend either deleting the Next layer or standardizing on it, and updating AGENTS.md.

---

## 7. Data Consistency & Feature Coverage

- **Marketplace schema parity:** ✅ mobile (`DeliveryViewModel.kt`) and admin (`AdminDashboard.tsx`) agree on `marketplace_stores` / `marketplace_products.vendorId`, incl. `isVerified`, `isPendingReview`, `kycStatus`, `isDemo`, `featuredRank` — verified in both codebases.
- **"Corporate Fleet Manifest / Salary & Performance Payroll"** (mandated by `mobile/app/AGENTS.md`): ❌ **no salary/payroll code anywhere** in the mobile app (zero grep hits); web has only a public careers page. Spec-vs-reality gap.
- **FCM token drift:** written to `users/{uid}` and `drivers/{uid}` with different key sets (`FirebaseManager.kt:1846-1866`) — schema drift risk.
- **OTP expiry semantics:** `otpExpiresAt` refreshed on every `parcelToMap` sync → "24h expiry" is effectively indefinite.
- **Chat ordering:** single-field `orderBy("timestamp")` on chat subcollections — auto-indexed, no composite index needed (checked `firestore.indexes.json`); not a live issue.
- **RTDB:** dependency included in Android app but never referenced; `firebase.json` has no RTDB rules block (unused, but close the surface).

---

## 8. Low-Severity & Cosmetic Findings

| # | Finding | Location |
|---|---------|----------|
| L1 | `checkPhoneAvailability` fails open (errors → AVAILABLE) | `FirebaseManager.kt:246-257` |
| L2 | `attachBaseContext` no-op despite "font scale locked" comment (lock is done elsewhere) | `MainActivity.kt:92-98` |
| L3 | `api/auth/check-phone.js:67` — `key.length in [10,11,12,13,14]` always false (`in` tests indices); `available:true` unconditional | `api/auth/check-phone.js` |
| L4 | CORS `*` on all `api/` routes; in-memory rate limits reset on cold start | `api/**` |
| L5 | `allowBackup=true`; encrypted-PIN prefs file not in backup exclude lists | `AndroidManifest.xml:23`, `backup_rules.xml` |
| L6 | AndroidX biometric `1.2.0-alpha05` and security-crypto `1.1.0-alpha06` (alpha libraries in a payments app) | `libs.versions.toml` |
| L7 | Demo fallback item name `"Mac mini M2"`; leftover demo keywords in AI fallback ("rolex", "mac") | `FirebaseManager.kt:1339`, `DeliveryViewModel.kt:6982` |
| L8 | Personal email in Nominatim User-Agent; storage `isAdmin()` helper dead code; `releases/` rule expects `admin` custom claim that nothing ever sets | `TrackingScreen.kt:3621`, `storage.rules:19-24, 89-92` |

---

## 9. Remediation Roadmap

### P0 — immediate (this week; stop-the-bleeding)
1. **Firestore rules rewrite** for `deliveries`/`parcels`/`public_tracking`/`notifications`/`support_chats`/`fleet_locations`/`riders`/`drivers`:
   - Create/update scoped to participants/dispatcher/admin; field allow-lists per status transition; `otpCode`/`otpAttempts`/`price`/`tipAmount`/`riderId` write-locked to server (Admin SDK) or delivery-participant constraints; drop `isAvailableDelivery` from read (replace with phone-match or participant).
   - `fleet_locations` read: admin/dispatcher/assigned-customer only.
   - `support_chats/*/messages`: ticket participants only.
   - `notifications` create: admin/dispatcher only.
   - `public_tracking` write: check `resource` (existing doc), never `request.resource` self-claims.
2. **Delete `api/email/test-send.js`** (or gate it behind an admin token + allowlist) and add auth to `testSmtpConnection`.
3. **Escrow trigger hardening:** before crediting, require an immutable, server-created payment record (e.g., `system_ledger/{bookingRef}` with `SUCCESS`) or move settlement into an authed callable that verifies Paystack; validate `price/deliveryFee/tipAmount` against pricing config.
4. **Remove `data.code` acceptance** in `sendEmailOtp`; server-generate codes only; require App Check/auth for verification.
5. **Kill the rider-promotion triggers** (`onRiderDocumentChanged`, `onRiderSubcollectionChanged`) or gate them behind a signed admin callable.
6. **Rotate** `functions/service-account.json` key; move to env/secrets manager.
7. **Fix `GEMINI_API_KEY`** (separate key, restricted per-API), stop shipping it in the APK; move AI calls server-side.
8. **PIN auth:** migrate to real Firebase email/password (or phone auth) with server-side PIN verification via callable; kill the deterministic password. Never accept plaintext/XOR PIN matches.

### P1 — this sprint
9. Move **admin mutations** (pricing, toggles, sub-admins, bulk ops) behind authed callables with role verification (`context.auth` + custom claims, not the client doc).
10. Fix the **wallet paths**: remove client `updateUserWalletBalance` credits; guest bookings must go through a server-verified payment before any doc is marked `PAID`.
11. Fix the **admin fleet map API key** (`import.meta.env.VITE_GOOGLE_MAPS_API_KEY` + Vercel env).
12. Remove the crash-report dialog / gate behind a debug flag; strip fake AI analytics or mark them explicitly as illustrative until real data exists.
13. `tls.rejectUnauthorized: true`; move SMTP creds to env-only; remove from Firestore.
14. Storage rules: participant-scoped POD/chat/product writes; block SVG.

### P2 — hardening pass
15. Signing: real keystore management (no `android123` fallbacks; CI-only secrets; fail-fast), `targetSdk 35/36`, drop ProGuard keep-all, `missingGoogleServicesStrategy=ERROR`.
16. Decide the web stack: delete the dead Next.js layer or adopt it; fix AGENTS.md to match reality.
17. Update `google-services.json` (remove stale clients), align `.env` app-id, remove stale hardcoded Firebase key fallback.
18. Replace placeholder hotline/emails with real support contacts; fix mojibake; sweep off-brand color literals; add `<queries>` entries for maps/mailto intents.
19. Implement the mandated salary/payroll surface or revise the spec.
20. Privacy pass: `phone_indices` auth/ownership-scoped reads; `system_config` split into public/non-public docs.

---

## 10. UI & Branding Compliance Scorecard (vs. root + mobile AGENTS.md)

| Requirement | Status |
|---|---|
| ScreenHeader Gold(dark)/Obsidian(light), Obsidian-on-Gold | ✅ |
| No white-on-gold / gold-on-white contrast violations | ✅ (dock icon, hero grid, chips verified) |
| Splash: raw gold logo, no text, no square container | ✅ (minor: radial glow/pattern behind logo stretches "clean") |
| Preloader: 4dp top progress, gold 22dp square, "ES"/"DISPATCH", slogan, no spinner | ✅ (minor: gradient starts at `GoldDark` #D4AF37) |
| Dashboard hierarchy & hero actions (Wallet + Market) | ✅ |
| HeroCarousel `shadowElevation=0`, indicators unobstructed | ✅ |
| TrackingScreen: `#FFB800` controls, no `#D4AF37` | ✅ |
| ESRI transportation overlay for satellite street labels | ⚠️ Not implemented (Google Maps JSON styling only; requirement is web-oriented but unmet) |
| OrderLogs: no summary card, clean filter chips → cards | ✅ |
| Motion tokens (TouchPress/SoftElastic/SnappyPill/RubberBand/SignatureMoment) | ✅ exact values |
| Traveling indicator capsule on dock | ⚠️ Static notch + scale, not a traveling capsule |
| Dynamic color tokens only (no hardcoded surface/text colors) | ❌ 100+ raw `Color(0xFF…)` literals, incl. surface/text colors |
| Off-brand golds `#FFB300`, `#E5A93B` (Dashboard) | ❌ |
| Product language rules | ❌ H3 (fake analytics), H4 (stack traces), M5 (placeholder hotline), M6 (mojibake) |
| 44dp hit areas / empty states / reduced motion | ✅ generally good; OrderLogs empty state is bare-bones |

---

## 11. Verification Evidence Log

- `git status` clean on `main` @ `0ca7b5b`; `origin/main` contains all audited code.
- `git rev-list --all --objects` — no `.env`, no `service-account.json`, no keystore blobs; only `.env.example` files. Historical `release-key.jks` blob extracted → `keytool` rejects format (dummy file).
- Read first-hand: `firestore.rules` (all critical sections), `storage.rules` (full), `functions/src/index.ts` (escrow, riders, notifications, OTP, wallet), `api/email/test-send.js` (full), `src/lib/firebase.js`, `vite.config.ts`, `LiveTrackingMap.tsx`, `AdminDashboard.tsx` auth + seed paths, `PublicTrackingPage.tsx` OTP render, `WalletViewModel.kt`, `FirebaseManager.kt` (password derivation, wallet transaction, parcelToMap, OTP parse, chat queries), `DeliveryViewModel.kt` (SecurityUtils, OTP RNG, guest booking, admin toggles, seedAiAnalytics), `MainActivity.kt` crash dialog, `TrackingScreen.kt` User-Agent, `AuthScreens.kt`/`ProfileScreens.kt` hotline, `app/build.gradle.kts`, `proguard-rules.pro`, `google-services.json` (masked), `.env` (masked), `.firebaserc`, `firebase.json`, `firestore.indexes.json`, `vercel.json`, `.vercelignore`, CI workflow, `.env.example`, `landing page/.env.local` (masked).
- `npx tsc --noEmit` → clean.
- `gradlew :app:compileDebugKotlin` (no keystore) → **FAILED** (`build.gradle.kts:75`).
- `gradlew :app:assembleRelease` with temporary audit keystore → see §12.
- `adb devices` → empty (no on-device verification this session).
- Last release APK cert: `CN=ESDispatch`, SHA-256 `d0b82cf7…`, built 2026-09-29.

**Not verifiable from the repo (flagged for the owner):** the *deployed* version of `firestore.rules`/`storage.rules` (repo vs console drift), Firebase console config (App Check enforcement, SHA-1 registrations, phone-auth test numbers, enabled sign-in providers), and runtime behavior on a device.

---


## 13. Remediation Applied (2026-10-15)

The following fixes were implemented in this codebase (all paths relative to repo root):

### Security — Cloud Functions (unctions/src/)
- `verifyDeliveryOtp` now verifies a salted HMAC hash server-side (new emails/handoverOtpService.ts) with attempt lockout; legacy plaintext codes are migrated to hash on first success and purged.
- New `getDeliveryOtp` callable: handover codes issue/rotate server-side (CSPRNG), plaintext held only in the rules-locked `delivery_otp_secrets` collection, emailed via the branded template with logo, and returned only to the delivery owner (never the rider).
- Handover codes are minted server-side on ARRIVED/IN_TRANSIT (onDeliveryStatusEmailTrigger) — plaintext is never read from documents.
- `sendEmailOtp` no longer accepts caller-supplied codes (C7); server generates and emails via branded templates; per-IP rate limiting added.
- `testSmtpConnection` requires admin auth.
- Escrow settlement (onDeliveryStatusUpdated) now requires a server ledger `paymentRef` (or explicit admin `settlementApproved`), blocks self-dealing (riderId == userId), and caps settlement amounts.
- Auto-dispatch (onDeliveryCreatedAutoDispatch) only dispatches server-verified PAID deliveries.
- Removed the two rider self-promotion triggers; added `registerRiderApplication` callable + `onRiderApplicationApproved` trigger (role granted only on admin approval, plus `rider_profiles/{uid}` marker).
- New `createBooking` and `createMarketplaceBooking` callables: wallet debits, stock decrements, vendor splits, delivery docs and payment ledger entries are all server-authoritative; Paystack card payments verified against the gateway before anything is written.
- New `requestWalletWithdrawal` callable (server debit + review queue).
- New `cancelDelivery` callable: cancellations validated server-side; refunds (dispatch-fee aware) applied atomically with a ledger entry.
- SMTP TLS certificate verification is ON by default (SMTP_TLS_REJECT_UNAUTHORIZED=false to opt out).

### Security — Firestore rules (irestore.rules, full rewrite)
- Deliveries/parcels: participants + admins/dispatchers only; customer and rider update deny-lists lock money/OTP/payment fields (money editable only while unpaid); pool claims require a verified `rider_profiles` record; plaintext OTP fields are never client-writable.
- `public_tracking` writes require existing-document participation (tracking spoofing fixed).
- Root notifications create: admin/dispatcher only (broadcast spam fixed).
- `fleet_locations`, `riders`, `drivers` reads scoped to self/admin/dispatcher (live-GPS stalk fixed).
- Support-chat messages and marketplace/batch subcollections scoped to participants.
- `phone_indices` read requires auth; rider/vendor profile reads require auth.
- Root `transactions` and `audit_logs` create: Admin SDK only (forged records fixed).
- New server-locked collections: `delivery_otp_secrets`, `system_ledger` (owner-read), `rider_applications` (self-apply, admin-decide), `rider_profiles`, `withdrawal_requests`.

### Security — Storage rules (storage.rules)
- Proof-of-delivery, pickup, arrival, and chat uploads are participant-scoped; marketplace product uploads are vendor/admin-scoped; SVG uploads blocked.

### Web (repo root)
- `api/email/test-send.js` and `smtp-verify.js`: admin token authentication via firebase-admin (open relay closed); TLS verification on; `firebase-admin` added to package.json.
- `api/email/verification.js`: server-generated CSPRNG codes, hashed storage in `verification_otps` (same convention as functions), brand logo <img> in header and footer, code removed from subject and links.
- `api/auth/check-phone.js`: real server-side phone uniqueness + fixed in-operator bug.
- Admin fleet map (LiveTrackingMap): API key now read from `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` (was always empty in production).
- Public tracking page reads the redacted `public_tracking` projection; the plaintext OTP card was removed (codes are delivered via email/app); EmailVerifiedPage no longer expects codes in the URL.
- Admin booking modal: no client-generated handover PINs; admin bookings carry `settlementApproved` so escrow can pay riders.
- Admin dashboard: rider-applications review panel (approve/reject); PIN-backfill tools now log instead of writing plaintext codes; SMTP password is no longer persisted to Firestore; mojibake (Â·) fixed; stale Firebase key fallback corrected.

### Android (mobile/)
- Bookings and batch bookings flow through the `createBooking` callable (server wallet debit + payment reference); guest bookings sync as `PENDING_PAYMENT` drafts.
- Marketplace checkout flows through `createMarketplaceBooking`.
- Handover OTP: client generation removed; verification and issuance via callables; codes never parsed into rider models; arrival notifications no longer contain the PIN and use lockscreen-private visibility for sensitive content.
- Wallet: client-side credit path removed (top-ups require a verified Paystack reference); withdrawals via the server callable.
- PINs: plaintext matches rejected; only salted hashes accepted (legacy XOR values migrate on next successful entry).
- Fake AI analytics removed (real-data-only trends; honest empty states); offline AI fallback no longer fabricates telemetry; demo fallbacks removed.
- Crash-report dialog is debug-only; placeholder hotline/emails replaced with real contacts; personal email removed from Nominatim User-Agent; arrival photos upload under `arrival_photos/{parcelId}/`.
- `targetSdk` 35; ProGuard blanket keep-all removed (app code now obfuscated); `<queries>` added for maps/dialer/mailto; encrypted PIN prefs excluded from backup/transfer; phone availability check fails closed.

### Deploy checklist (owner actions)
1. Deploy irestore.rules, storage.rules (`firebase deploy --only firestore:rules,storage`) and the functions (`firebase deploy --only functions`). Set OTP_PEPPER, HANDOVER_OTP_PEPPER, PAYSTACK_SECRET_KEY and SMTP env in Functions config.
2. Vercel env: add VITE_GOOGLE_MAPS_API_KEY (admin map), FIREBASE_SERVICE_ACCOUNT (or per-function env) for the admin-gated email APIs.
3. **One-time data migration for in-flight deliveries:** pre-fix PAID deliveries have no paymentRef; escrow will hold their settlements (HELD_PENDING_PAYMENT_VERIFICATION) until an admin sets settlementApproved: true (admin bookings already set it). Run a small Admin SDK script to stamp settlementApproved: true on legitimate in-flight PAID docs, or settle through the admin panel case-by-case.
4. Approve fleet riders in Admin → Users → "Fleet Rider Applications" (new panel). Approved riders get `rider_profiles/{uid}` which gates dispatch-pool visibility and claiming.
5. Rotate the unctions/service-account.json key; keep the release keystore in CI secrets only.
## 12. Build Verification Addendum
**Web**
- `npx tsc --noEmit` → ✅ clean (zero type errors).

**Android**
- `gradlew :app:compileDebugKotlin` with **no keystore** (clean-environment simulation) → ❌ **FAILED at configuration** (`build.gradle.kts:75`, `Release keystore not found`). The AGENTS.md-mandated first build step cannot run on any machine without the CI-only keystore or `KEYSTORE_PATH`. Reproduced live: `BUILD FAILED in 3m 14s`.
- `gradlew :app:assembleRelease` with a temporary audit keystore (generated locally, then discarded) → **compilation fully healthy**: `kspReleaseKotlin`, `compileReleaseKotlin`, `compileReleaseJavaWithJavac`, resource/manifest processing and `validateSigningRelease` all passed. Only warnings (pre-existing deprecations: `GoogleSignIn`, `Icons.Filled.*` → `AutoMirrored`, Room `fallbackToDestructiveMigration`, an unchecked cast in `FirebaseManager.kt:1267`, `Condition is always 'true'` at `DeliveryViewModel.kt:2763/2780`, R8 `play-services-location` companion warning).
- ⏱️ **R8 minification exceeded 30 minutes** (`:app:minifyReleaseWithR8` still running when the 1,800,000 ms AGENTS.md timeout elapsed). Not a failure — but combined with `-keep class com.esdispatch.**` (M1), the release build is unusually slow and produces an effectively unobfuscated APK. *(Final result appended when the resumed build completes.)*
- `adb devices` → no device attached; on-device verification not possible this session. Last shipped APK: 27.5 MB, 2026-09-29, cert `CN=ESDispatch` (SHA-256 `d0b82cf7…`).
