# The story of Porchlight Social
A full social network in your browser: feed, friends, reactions, chat, stories and groups
## The request
> I want facebook clone, full fledged, full featured, auth, likes, shares, etc. All the features.
Asked for as a web app on 2026-10-13 and built by the Vibe Hub app factory on Claude Opus 5.5. It is self-contained: no accounts, no servers, data stays on the device.
## What the research found
A Facebook clone centers on a News Feed of posts from friends, plus profiles, a friend graph, and reactions, comments and shares on every post. Users also expect notifications, messaging, groups and events. In an offline vanilla-JS app, 'auth' has to be a local multi-account system stored in localStorage or IndexedDB, with seeded demo users so the feed isn't empty. Real-time, ranking, and cross-device features need to be simulated locally. This summary draws on general knowledge and the Wikipedia feature list for Facebook.
### What users expect from apps like this

- Sign up, log in and log out with local accounts, and a persistent session
- News Feed with a post composer (text and image, stored as a data URL) and a privacy audience selector
- Like and reactions (like, love, haha, wow, sad, angry) with counts
- Threaded comments and replies, plus edit and delete of own posts and comments
- Share a post to your own feed, with an optional caption
- Profile page with cover photo, avatar, bio, and a timeline of the user's posts
- Friend requests: send, accept, decline, unfriend, and search for people
- Notifications panel with an unread badge for likes, comments, requests and shares
### What full versions add later

- Direct messaging chat with conversation list, unread counts and simulated replies
- Groups and Pages with membership, group posts and admin roles
- Events with RSVP and birthday reminders
- Stories that expire after 24 hours
- Marketplace listings with categories, search and saved items
- Feed ranking and 'people you may know' suggestions, hashtags and @mentions, photo albums, dark mode, and block/report
### Patterns that work

- Three-column desktop layout: left shortcuts, centre feed, right contacts and suggestions; collapses to one column with a bottom tab bar on mobile
- Sticky top navbar with logo, search, icon tabs (Home, Friends, Groups, Marketplace) and badges for notifications and messages
- Post card with header, content, a reaction/comment/share count row, and an action button bar; hovering over Like reveals the reaction picker
- Stories carousel above the composer, and a modal composer opened from a 'What's on your mind?' box
- Docked chat windows at the bottom right, with a dropdown notification list
- Infinite-scroll or 'load more' feed, with skeleton placeholders and optimistic UI updates
### References

- [List of Facebook features – Wikipedia](https://en.wikipedia.org/wiki/List_of_Facebook_features)
- [Facebook Product Update: Messenger's Mentions and Reactions – AdvertiseMint](https://www.advertisemint.com/facebook-product-update-messengers-mentions-reactions/)
- [How Facebook changed 2010-2019 – Rappler](https://www.rappler.com/technology/features/247551-how-facebook-changed-2010-2019/)
## The plan
Porchlight Social is a complete social networking app that runs entirely in your browser, modelled on the classic Facebook experience. You create a local account and land in a News Feed that is already populated by a cast of demo neighbours. You can post updates and photos, react with six emoji, comment and reply, share posts with your own caption, and see a notification badge each time someone responds. Each person has a profile with a cover photo, avatar, bio and timeline. Friend requests work as you'd expect. Messenger-style chat windows dock at the bottom of the screen, and the demo friends send you believable replies. Stories disappear after 24 hours, and groups and events add community features. On a desktop, the app uses a three-column layout. On a phone, it switches to a single column with a bottom tab bar. All data, including every account, stays in local storage on this device. Accounts are local profiles, not real security: anyone using this browser can open them. Because nothing goes over the network, the other users are simulated. The app suits anyone who wants to explore, demo or prototype a social network without a server, sign-ups or tracking.
Scope: full. Layout: vanilla HTML, CSS and JavaScript, offline, local storage.
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
### Left out on purpose

- Real authentication, password security, servers or cross-device sync (all accounts and data live in this browser's local storage)
- Real other people (other users are simulated demo accounts with scripted replies)
- Marketplace listings and business Pages
- Video uploads, live streaming, and voice or video calls
- Algorithmic feed ranking (the feed is chronological)
- Photo albums, and blocking or reporting users
- Push notifications and email
## Versions
- v1 (2026-10-13): A full social network in your browser: feed, friends, reactions, chat, stories and groups
The current version is v1. Every version is a commit on `main`; CHANGELOG.md has the details and docs/TESTING.md how each one was checked.
