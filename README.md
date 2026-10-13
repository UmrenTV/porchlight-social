# Porchlight Social

A social network that runs entirely in your browser: feed, friends, reactions, chat, stories, groups — now with hashed passwords, a ranked feed, blocking, reporting, moderation, and real interaction between the tabs of your own browser.

Porchlight Social is a complete, server-free social networking app, modelled on the classic Facebook experience. You create a local account and land in a News Feed that is already populated by a cast of demo neighbours. You can post updates, react, comment, share, and see notifications. Everything lives in your browser's storage. Because there is no server, the "other people" are either scripted demo users or **other tabs of this same browser** — open a second tab, sign in as someone else, and you two genuinely interact live.

## Features

- **Secure local accounts.** Passwords are salted and hashed with Web Crypto PBKDF2-SHA256 (210k iterations) and compared in constant time — no plaintext is ever stored. Existing accounts are migrated automatically on load; passwordless accounts are prompted to set one at next login; the demo account password is `demo1234`.
- **Login lockout and strength rules.** After 5 failed attempts an account locks for 60 seconds (with a growing delay). Sign-up enforces 8+ characters and shows a strength meter. Settings has **Change password** and **Log out everywhere** (which rotates the session token).
- **Ranked feed with Top / Latest.** Top ranks posts by recency (12-hour half-life decay), engagement, affinity with the author and post type; Latest is strict chronological. Your choice is remembered. Every Top post has a **"Why am I seeing this?"** explanation.
- **Real multi-tab interaction.** Open a second tab and sign in as a different account (per-tab sessions). New posts, reactions, comments and messages propagate live between tabs via BroadcastChannel and storage events.
- **Real vs demo accounts.** Sign-up accounts carry a **Real** badge and never auto-reply. Demo users keep their scripted replies, which you can switch off in Settings.
- **Blocking, enforced everywhere.** Blocking removes the friendship and any pending requests and hides the person across feed, search, suggestions, friends lists, comments, reactions, chat, messenger and notifications. Settings lists blocked users for unblocking.
- **Reporting and a moderation queue.** Report posts, comments or profiles with a reason and optional details. Reports go to the admin (the first real account, or demo user Alex), whose actions are Remove, Warn and Dismiss. Reporters see the outcome under "Your reports".
- **Encrypted data export / import.** Export everything to a JSON file, optionally encrypted with a passphrase (AES-GCM, key via PBKDF2). Import previews, then merges or replaces. A wrong passphrase fails safely without changing anything.
- Plus the originals: six-reaction posts, threaded comments, profiles, friend requests, Messenger, groups and events, dark mode and a responsive three-column layout.

## Run it

Open `index.html` in any modern browser. The app is a single static page (HTML, CSS, vanilla JavaScript), works offline, and keeps data in local storage. `manifest.webmanifest` lets browsers install it.

## What still truly needs a real server (and is therefore out of scope)

- **Cross-device realtime.** Multi-user interaction here is between tabs of the *same* browser. Talking to someone on another machine needs a signaling/relay server.
- **Real email.** There is no email delivery; a digest would only be a preview.
- **Durable, large media.** Video and large albums would belong in server storage; this build keeps media in the browser only.
- **Trustworthy identity and real security.** Local accounts are hashed but are not real authentication: anyone with this browser can open them.

## Built with

Claude Opus 5.5 through the Vibe Hub app factory (web target, full scope). No license restrictions: copy, change and sell it.
