# Changelog

All notable changes to Porchlight Social. Each version is one commit on `main`, published by the Vibe Hub app factory after its checks passed.

## v2 — Local-first social features expansion (2026-10-13)

Porchlight gains most of the features it previously left out, built within its static, in-browser design: hashed passwords with account lockout, a ranked feed with a 'Latest' toggle, photo albums, blocking and reporting with a moderation queue, business Pages, a Marketplace, video posts, in-browser notifications and an email digest preview. Accounts open in other tabs of the same browser now behave like real other people, with live chat, voice and video calls and live streams between tabs. Data can move to another device through an encrypted export file. A real server, cross-device realtime and real email delivery are still out of scope, and the app says so plainly.

### Added

- Hashed passwords, login lockout, change password, log out everywhere
- Encrypted data export and import for moving data to another device
- Real multi-user interaction across tabs in the same browser (live feed, chat, typing)
- Voice and video calls between tabs via WebRTC
- Go Live camera streaming to other tabs with live comments
- Video posts stored in IndexedDB
- Ranked 'Top' feed with 'Why am I seeing this?', alongside 'Latest'
- Photo albums with lightbox
- Blocking enforced on every surface, and a blocked-users list
- Reporting with a moderation queue and report status
- Business Pages with post-as-Page
- Marketplace with listings, filters, saved items and message seller

### Changed

- Login now checks hashed passwords. Existing accounts are migrated, and passwordless accounts must set a password.
- The feed defaults to Top ranking, with Latest one click away and remembered
- Media storage moved from data URLs in local storage to IndexedDB, with existing images moved over automatically
- Demo users are labeled. Real accounts never auto-reply, and auto-replies can be turned off.
- Notifications gain new types: Page follows, listing messages, live started, call missed and moderation outcome
- README 'left out' section rewritten to list what still truly needs a server

Requested as: "finish the left out stuff Real authentication, password security, servers or cross-device sync (all accounts and data live in this browser's local storage); Real other people (other users are simulated demo accounts with scripted replies); Marketplace listings and business Pages; Video uploads, live streaming, and voice or video calls; Algorithmic feed ranking (the feed is chronological); Photo albums, and blocking or reporting users; Push notifications and email."

## v1 — First build (2026-10-13)

A full social network in your browser: feed, friends, reactions, chat, stories and groups

### Features

- Local accounts let you sign up, log in and log out, with a persistent session, a 'switch account' menu and five seeded demo users, so the app works immediately and you can see it from more than one person's view.
- The News Feed shows posts from you and your friends, newest first, with a 'load more' button and skeleton placeholders. A modal composer opens from 'What's on your mind?' and supports text, an attached image (stored as a data URL) and an au
- Each post has six reactions (like, love, haha, wow, sad and angry), picked by hovering over the Like button on desktop or long-pressing it on mobile. Posts show reaction totals, and clicking the totals lists who reacted with what.
- Threaded comments support one level of replies. You can edit or delete your own posts and comments. @mentions notify the person mentioned, and #hashtags link to a page of matching posts.
- Sharing a post reposts it to your timeline with an optional caption. The original post appears embedded inside the share, and the original author is notified.
- Profile pages show a cover photo, avatar, bio, details, a friends list, a photos grid and a timeline of that person's posts and shares. The 'Edit profile' form saves changes immediately.
- The Friends page lets you search people by name and send, cancel, accept or decline friend requests. You can also unfriend people and browse 'People you may know' suggestions ranked by mutual friends.
- The notifications dropdown and the navbar show an unread badge for reactions, comments, mentions, shares, friend requests and accepted requests. Clicking an item opens the related post or profile and marks it as read.
- Messenger includes a conversation list with unread counts. Chat windows dock at the bottom right on desktop and open full screen on mobile. Demo users show typing indicators and reply automatically after a short delay.
- A Stories carousel sits above the composer. You can create a text or photo story and open a full-screen viewer with progress bars and tap-to-advance. Stories expire automatically after 24 hours.
- Groups can be created and joined or left. Each group has its own feed and member list, and the creator is the admin and can remove posts. Events support Going and Interested RSVPs, and a sidebar shows today's friend birthdays.
- The layout is responsive: a sticky top navbar with search and badges, three columns on desktop (shortcuts, feed, contacts) and one column with a bottom tab bar on phones. A dark mode toggle is remembered between visits.
