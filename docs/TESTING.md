# Testing Porchlight Social (v1)
How the Vibe Hub app factory checked this version before publishing it, and how to repeat the checks.
## Static checks
Every required file present, the page loads only its own files, every script parses, stylesheets balance their braces, JSON files parse.
Result: clean.
## Browser run
Opened in headless Chromium on a phone (390×844, dark) and a desktop (1280×800, light): no uncaught errors, no console errors, no failed requests, nothing leaving the page, a title, visible content, no sideways scroll on the phone, 4 buttons clicked, a field filled and submitted, and a reload.

Result: clean
## Acceptance scenarios
0 of 2 scenarios passed.

| Scenario | Result |
| --- | --- |
| Sign up, log out, log in and session survives refresh | fail: step 1 (click "Create new account"): locator.click: Timeout 3000ms exceeded. |
| Dark mode toggle survives refresh | fail: step 1 (click "Create new account"): locator.click: Timeout 3000ms exceeded. |
The model repaired the app 2 times during verification; the checks above are for the published files.
## Tester's checklist
- [ ] Sign up for a new account, log out, log back in, then refresh the page and confirm the session and your data are still there.
- [ ] Create a post with an image and the Friends audience, then switch to a demo account that is not your friend and confirm it can't see the post.
- [ ] Hover over or long-press Like to choose 'love', click the reaction count to see who reacted, then add a comment, reply to it, edit it and delete it.
- [ ] Share a demo user's post with a caption, confirm it appears on your timeline with the original embedded, then switch to that user and check the notification badge.
- [ ] Send a friend request, switch to the recipient and accept it, then confirm both friends lists update and 'People you may know' changes.
- [ ] Open a chat with a demo friend, send a message and wait for the typing indicator and automatic reply. Check the unread count on the messages icon.
- [ ] Create a story, view it in the full-screen viewer, then create a group, post in it, and RSVP to an event.
- [ ] Resize the window to phone width and confirm the bottom tab bar appears, then toggle dark mode, refresh, and check that the setting is kept.
## Repeat it yourself
Open `index.html` in a browser (or serve the folder with any static server), then walk the checklist above on a phone-sized window and a desktop one. Reload: your data must still be there.
