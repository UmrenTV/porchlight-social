# Porchlight Social

A full social network in your browser: feed, friends, reactions, chat, stories and groups

Porchlight Social is a complete social networking app that runs entirely in your browser, modelled on the classic Facebook experience. You create a local account and land in a News Feed that is already populated by a cast of demo neighbours. You can post updates and photos, react with six emoji, comment and reply, share posts with your own caption, and see a notification badge each time someone responds. Each person has a profile with a cover photo, avatar, bio and timeline. Friend requests work as you'd expect. Messenger-style chat windows dock at the bottom of the screen, and the demo friends send you believable replies. Stories disappear after 24 hours, and groups and events add community features. On a desktop, the app uses a three-column layout. On a phone, it switches to a single column with a bottom tab bar. All data, including every account, stays in local storage on this device. Accounts are local profiles, not real security: anyone using this browser can open them. Because nothing goes over the network, the other users are simulated. The app suits anyone who wants to explore, demo or prototype a social network without a server, sign-ups or tracking.

## Features

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

## Run it

Open `index.html` in any browser: the app is a single static page (HTML, CSS and vanilla JavaScript), works offline and keeps its data in the browser's local storage. `manifest.webmanifest` lets browsers install it as an app.

## Host it

Upload the folder to any static host (Netlify, Vercel, GitHub Pages, an S3 bucket) or serve it with `npx serve .`.

## Built with

Claude Opus 5.5 through the Vibe Hub app factory (web target, full scope). No license restrictions: copy, change and sell it.
