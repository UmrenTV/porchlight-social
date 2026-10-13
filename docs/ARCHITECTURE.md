# Architecture of Porchlight Social

A single page of vanilla HTML, CSS and JavaScript. No framework, no build step, no network: state lives in memory and is persisted to `localStorage` so a reload brings everything back.

## Files

- `index.html` (2.3 KB): markup and the page shell
- `README.md` (4.2 KB): how to run it
- `styles.css` (13.9 KB): all styling, including the dark theme
- `app.js` (52.3 KB): state, rendering and event handling

## Data

Everything the user enters is kept in `localStorage` under the app's own keys; export and import, where present, move the same JSON.

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
