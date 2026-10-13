# Architecture of Porchlight Social

A single page of vanilla HTML, CSS and JavaScript. No framework, no build step, no network. State lives in memory and is persisted to `localStorage`. Live interaction between tabs uses `BroadcastChannel` and `storage` events. Passwords and the export file use the Web Crypto API.

## Files

- `index.html` — page shell: topbar, three-column layout, panels, chat dock
- `styles.css` — all styling, including dark theme and the password strength meter
- `app.js` — state, rendering and event handling (one IIFE, classic script)
- `README.md`, `docs/ARCHITECTURE.md`

## Storage keys

- `porchlight.v1` — the whole app state (JSON). `state.v === 2` after migration.
- `porchlight.theme` — `light` / `dark`
- `porchlight.feedmode` — `top` / `latest`
- `sessionStorage['porchlight.tabuser']` — per-tab signed-in user id (falls back to `state.session`)

## State shape (key fields)

`{ v, session, sessionToken, seq, settings:{demoReplies}, users[], accounts[], friends[], requests[], blocks[], reports[], groups[], posts[], events[], threads{}, unread{}, notifs[] }`

- `accounts[]`: `{ userId, email, pass, real, needsPassword, fails, lockUntil }`. `pass` is `{salt,iter,hash}` (base64/int) from PBKDF2, or `{fallback}` when Web Crypto is missing.
- `blocks[]`: `{ by, who }`. `reports[]`: `{ id, by, kind, ref, reason, details, status, time }` with status `open|removed|warned|dismissed`.

## Migration

`migrate()` runs on every `load()`: adds `settings/blocks/reports/sessionToken`, converts old string passwords to `{fallback}`, marks passwordless accounts `needsPassword`, flags sign-up accounts `real`, and sets `v=2`. The demo account's old `demo` fallback is re-hashed to `demo1234`. Sessions stay valid throughout.

## Rendering

`render()` reads `location.hash`, picks a view function (`feedView`, `profileView`, `friendsView`, `groupsView`, `groupView`, `eventsView`, `settingsView`), builds an HTML string with escaped user text, and sets `#main.innerHTML`. Side columns, badges, chat and any open panel re-render too. `softRender()` avoids clobbering a focused input mid-typing.

## Key modules / functions

- **Crypto:** `hashPassword`, `verifyPassword` (PBKDF2, constant-time `constEq`), `encryptJSON`/`decryptJSON` (AES-GCM). `passStrength` drives the meter.
- **Auth:** `attemptLogin` (lockout + growing delay, passwordless→set), `createAccount`, `signIn`, `currentSessionUser`.
- **Blocking:** one shared `visible(id)` used by every list, search, chat, messenger and notification path; `blockUser`/`unblockUser`.
- **Reporting:** `fileReport` / `resolveReport`; admin = `adminId()`.
- **Ranking:** `scorePost` (recency decay + engagement + affinity + type) and `whyText`; `feedMode` toggles Top/Latest.
- **Sync:** `save(broadcast)` posts on `BroadcastChannel('porchlight')`; `reloadFromStorage()` re-reads and re-renders on broadcast or `storage` event (latest write per save wins).
- **Export/import:** `doExport`, `doImport`, `mergeState`.

## Keyboard & touch

`Escape` closes panels/search; forms submit on Enter; focus is restored after actions and moved to `#main` on navigation. All controls are buttons/links with labels and visible focus rings.

## Where to add a feature

Add a view function, route it in the `switch` in `render()`, and add a sidebar/nav link. New per-user data goes in a new `state` array with an `id`; extend `migrate()` to default it and `mergeState()` to merge it. Always filter people through `visible()` so blocking keeps working. Call `save()` after mutations so other tabs sync.
