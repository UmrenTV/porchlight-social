(function () {
  'use strict';

  var KEY = 'porchlight.v1', TKEY = 'porchlight.theme', FKEY = 'porchlight.feedmode';
  var state = null, me = null, openPanel = null, chatWith = null, authMode = 'login', editingProfile = false;
  var feedMode = read(FKEY) === 'latest' ? 'latest' : 'top';
  var D = 86400000, H = 3600000;
  var COLORS = ['#e76f51', '#2a9d8f', '#8e7dbe', '#d4a017', '#457b9d', '#d62828', '#6a994e', '#bc4b51', '#3d5a80'];
  var REPLIES = ['Ha, love that!', 'Sounds good to me.', 'Want to grab coffee this week?', 'Totally agree.',
    'Oh nice, tell me more!', "I'll be on the porch later if you want to stop by.", 'Thanks for reaching out 😊'];
  var DEMO_PASS = 'demo1234';
  var bc = null; // BroadcastChannel for cross-tab sync
  var tabId = Math.random().toString(36).slice(2);

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  /* ---------- Icons ---------- */
  var ICONS = {
    lamp: '<path d="M9 2h6l3 7H6z"/><path d="M12 9v9"/><path d="M8 22h8"/><path d="M12 18v4"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M22 21c0-3-2-5.5-4.5-6.5"/>',
    group: '<circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.5"/><circle cx="19" cy="10" r="2.5"/><path d="M7 20c0-3 2-6 5-6s5 3 5 6"/><path d="M1 19c0-2.5 1.5-4.5 4-4.5"/><path d="M23 19c0-2.5-1.5-4.5-4-4.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
    heart: '<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>',
    comment: '<path d="M4 5h16v11H9l-5 4z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pin: '<path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
    block: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2 2M14 9l2 2"/>'
  };
  function icon(n) {
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[n] || '') + '</svg>';
  }
  function applyIcons() {
    $$('[data-icon]').forEach(function (el) {
      if (!el.querySelector(':scope > svg.ic')) el.insertAdjacentHTML('afterbegin', icon(el.getAttribute('data-icon')));
    });
  }

  /* ---------- Crypto: PBKDF2 password hashing ---------- */
  var cryptoOK = !!(window.crypto && window.crypto.subtle);
  var PBKDF2_ITER = 210000;
  function b64(buf) {
    var bytes = new Uint8Array(buf), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function fromB64(str) {
    var bin = atob(str), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  function randomBytes(n) {
    var a = new Uint8Array(n); window.crypto.getRandomValues(a); return a;
  }
  function deriveBits(pass, salt, iter, len) {
    return window.crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits'])
      .then(function (k) {
        return window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' }, k, len);
      });
  }
  // returns object {salt, iter, hash} all base64/num
  function hashPassword(pass) {
    if (!cryptoOK) return Promise.resolve({ fallback: fallbackHash(pass) });
    var salt = randomBytes(16);
    return deriveBits(pass, salt, PBKDF2_ITER, 256).then(function (bits) {
      return { salt: b64(salt), iter: PBKDF2_ITER, hash: b64(bits) };
    });
  }
  function verifyPassword(pass, rec) {
    if (!rec) return Promise.resolve(false);
    if (rec.fallback != null) return Promise.resolve(constEq(fallbackHash(pass), rec.fallback));
    if (!cryptoOK || !rec.salt) return Promise.resolve(false);
    return deriveBits(pass, fromB64(rec.salt), rec.iter || PBKDF2_ITER, 256).then(function (bits) {
      return constEq(b64(bits), rec.hash);
    });
  }
  function constEq(a, b) {
    a = String(a); b = String(b);
    var len = Math.max(a.length, b.length), r = a.length ^ b.length;
    for (var i = 0; i < len; i++) r |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    return r === 0;
  }
  function fallbackHash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(36);
  }
  function passStrength(pw) {
    var score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  }

  /* ---------- AES-GCM export encryption ---------- */
  function encryptJSON(obj, passphrase) {
    var salt = randomBytes(16), iv = randomBytes(12);
    return window.crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
      .then(function (bk) {
        return window.crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
          bk, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
      }).then(function (key) {
        return window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv },
          key, new TextEncoder().encode(JSON.stringify(obj)));
      }).then(function (ct) {
        return { porchlight: 'encrypted', salt: b64(salt), iv: b64(iv), data: b64(ct) };
      });
  }
  function decryptJSON(pkg, passphrase) {
    var salt = fromB64(pkg.salt), iv = fromB64(pkg.iv), ct = fromB64(pkg.data);
    return window.crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
      .then(function (bk) {
        return window.crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
          bk, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      }).then(function (key) {
        return window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
      }).then(function (pt) {
        return JSON.parse(new TextDecoder().decode(pt));
      });
  }

  /* ---------- Data ---------- */
  function seed() {
    var now = Date.now();
    return {
      v: 2, session: null, seq: 100, sessionToken: 't0',
      settings: { demoReplies: true },
      users: [
        { id: 'u1', name: 'Maya Lopez', bio: 'Gardener, baker, porch-sitter.', city: 'Portland', color: '#e76f51' },
        { id: 'u2', name: 'Theo Grant', bio: 'Weekend woodworker.', city: 'Asheville', color: '#2a9d8f' },
        { id: 'u3', name: 'Priya Shah', bio: 'Running the neighborhood book swap.', city: 'Austin', color: '#8e7dbe' },
        { id: 'u4', name: 'Sam Okafor', bio: 'Coffee first.', city: 'Chicago', color: '#d4a017' },
        { id: 'u5', name: 'Lena Fischer', bio: 'Photos of dogs, mostly.', city: 'Denver', color: '#457b9d' },
        { id: 'u6', name: 'Jonah Reyes', bio: 'Fixing bikes for free on Saturdays.', city: 'Tucson', color: '#d62828' }
      ],
      accounts: [],
      friends: [['u1', 'u3'], ['u2', 'u4'], ['u3', 'u5'], ['u1', 'u5'], ['u2', 'u6']],
      requests: [],
      blocks: [],   // { by, who }
      reports: [],  // { id, by, kind, ref, reason, details, status, time }
      groups: [
        { id: 'g1', name: 'Maple Street Neighbors', desc: 'News, lost pets and borrowed ladders for the block.', members: ['u1', 'u3', 'u5'], color: '#6a994e' },
        { id: 'g2', name: 'Saturday Bike Fix', desc: 'Free repairs, tips and spare parts.', members: ['u6', 'u2'], color: '#d62828' },
        { id: 'g3', name: 'Book Swap Club', desc: 'Bring one, take one. Monthly swaps and reviews.', members: ['u3', 'u4'], color: '#8e7dbe' }
      ],
      posts: [
        { id: 'p1', author: 'u1', text: 'First tomatoes of the season! Anyone want some? I have way too many.', time: now - 2 * H, likes: ['u3', 'u5'], comments: [{ id: 'c1', author: 'u3', text: 'Yes please! I can trade you some basil.', time: now - 1.5 * H }], group: null },
        { id: 'p2', author: 'u3', text: 'Book swap is this Saturday at 10. Bring one, take one 📚', time: now - 5 * H, likes: ['u1'], comments: [], group: 'g3' },
        { id: 'p3', author: 'u5', text: 'Met the friendliest golden retriever on my walk this morning.', time: now - 9 * H, likes: ['u1', 'u3'], comments: [], group: null },
        { id: 'p4', author: 'u6', text: 'Fixed 11 bikes last Saturday. Bring yours by, chain lube is on me.', time: now - 26 * H, likes: ['u2'], comments: [], group: 'g2' },
        { id: 'p5', author: 'u2', text: 'Finished a cedar bench for the front porch. Took three weekends but worth it.', time: now - 30 * H, likes: ['u4'], comments: [{ id: 'c2', author: 'u4', text: 'That looks amazing!', time: now - 29 * H }], group: null },
        { id: 'p6', author: 'u1', text: 'Reminder: street cleaning Tuesday, move your cars to the even side.', time: now - 50 * H, likes: [], comments: [], group: 'g1' }
      ],
      events: [
        { id: 'e1', title: 'Maple Street Potluck', when: now + 3 * D, place: 'Maple St. cul-de-sac', desc: 'Bring a dish to share.', host: 'u1', going: ['u3', 'u5'], interested: [] },
        { id: 'e2', title: 'Saturday Bike Fix', when: now + 5 * D, place: "Jonah's garage", desc: 'Free tune-ups for everyone.', host: 'u6', going: ['u2'], interested: ['u4'] },
        { id: 'e3', title: 'Book Swap', when: now + 7 * D, place: 'Library steps', desc: 'Bring a book you loved.', host: 'u3', going: ['u4'], interested: ['u1'] }
      ],
      threads: {}, unread: {}, notifs: []
    };
  }

  // Admin = first real account, or demo user Alex, or u1 fallback
  function adminId() {
    if (state.accounts.length) return state.accounts[0].userId;
    return 'u1';
  }
  function isAdmin(id) { return id === adminId(); }

  function migrate() {
    var changed = false;
    if (!state.settings) { state.settings = { demoReplies: true }; changed = true; }
    if (!state.blocks) { state.blocks = []; changed = true; }
    if (!state.reports) { state.reports = []; changed = true; }
    if (!state.sessionToken) { state.sessionToken = 't0'; changed = true; }
    // migrate old hashed-string passwords to fallback records; mark v2
    (state.accounts || []).forEach(function (a) {
      if (typeof a.pass === 'string') {
        a.pass = { fallback: a.pass }; changed = true;
      } else if (a.pass == null && !a.needsPassword) {
        a.needsPassword = true; changed = true;
      }
      if (a.real == null) { a.real = true; } // sign-up accounts are real
    });
    if (state.v !== 2) { state.v = 2; changed = true; }
    if (changed) save();
  }

  function load() {
    try { state = JSON.parse(read(KEY)); } catch (e) { state = null; }
    if (!state || (state.v !== 1 && state.v !== 2)) { state = seed(); save(); return; }
    migrate();
    ensureDemoPasswords();
  }
  function ensureDemoPasswords() {
    // seed/upgrade the demo account password to documented hash if present as fallback demo
    var acc = state.accounts.find(function (a) { return a.email === 'demo@porchlight.local'; });
    if (acc && acc.pass && acc.pass.fallback === fallbackHash('demo')) {
      hashPassword(DEMO_PASS).then(function (h) { acc.pass = h; acc.needsPassword = false; save(); });
    }
  }
  function save(broadcast) {
    store(KEY, JSON.stringify(state));
    if (broadcast !== false && bc) { try { bc.postMessage({ t: 'sync', from: tabId }); } catch (e) {} }
  }
  function uid(p) { state.seq++; return p + state.seq; }
  function user(id) { return state.users.find(function (u) { return u.id === id; }); }
  function group(id) { return state.groups.find(function (g) { return g.id === id; }); }
  function findPost(id) { return state.posts.find(function (p) { return p.id === id; }); }
  function findEvent(id) { return state.events.find(function (e) { return e.id === id; }); }
  function account(id) { return state.accounts.find(function (a) { return a.userId === id; }); }
  function isAccount(id) { return state.accounts.some(function (a) { return a.userId === id; }); }
  function isReal(id) { var a = account(id); return a && a.real; }
  function isFriend(a, b) { return state.friends.some(function (f) { return (f[0] === a && f[1] === b) || (f[0] === b && f[1] === a); }); }
  function friendsOf(id) {
    return state.friends.filter(function (f) { return f[0] === id || f[1] === id; })
      .map(function (f) { return f[0] === id ? f[1] : f[0]; }).filter(user);
  }
  function req(from, to) { return state.requests.find(function (r) { return r.from === from && r.to === to; }); }
  function removeReq(from, to) { state.requests = state.requests.filter(function (r) { return !(r.from === from && r.to === to); }); }
  function addFriendship(a, b) { if (!isFriend(a, b)) state.friends.push([a, b]); removeReq(a, b); removeReq(b, a); }
  function tkey(a, b) { return [a, b].sort().join('~'); }
  function notify(to, text, href) {
    state.notifs.unshift({ id: uid('n'), to: to, text: text, href: href || '', time: Date.now(), read: false });
  }

  /* ---------- Blocking (single shared filter) ---------- */
  function blocked(a, b) {
    return state.blocks.some(function (x) {
      return (x.by === a && x.who === b) || (x.by === b && x.who === a);
    });
  }
  // Is `id` visible to me? Used everywhere.
  function visible(id) {
    if (!me) return true;
    if (id === me.id) return true;
    return !blocked(me.id, id);
  }
  function blockUser(id) {
    if (blocked(me.id, id)) return;
    state.blocks.push({ by: me.id, who: id });
    // remove friendship and pending requests both ways
    state.friends = state.friends.filter(function (f) { return !((f[0] === me.id && f[1] === id) || (f[1] === me.id && f[0] === id)); });
    removeReq(me.id, id); removeReq(id, me.id);
    if (chatWith === id) chatWith = null;
  }
  function unblockUser(id) {
    state.blocks = state.blocks.filter(function (x) { return !(x.by === me.id && x.who === id); });
  }

  function first(u) { return (u.name || '').split(' ')[0]; }
  function initials(n) { return (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join(''); }
  function avatar(u, size) {
    return '<span class="av av-' + (size || 'md') + '" style="background:' + esc(u.color) + '" aria-hidden="true">' + esc(initials(u.name)) + '</span>';
  }
  function gicon(g) { return '<span class="gicon" style="background:' + esc(g.color || '#888') + '" aria-hidden="true">' + esc(initials(g.name)) + '</span>'; }
  function badgeReal(id) {
    return isReal(id) ? ' <span class="rbadge" title="Real account">Real</span>' : '';
  }
  function ago(t) {
    var s = Math.round((Date.now() - t) / 1000);
    if (s < 45) return 'just now';
    var m = Math.round(s / 60); if (m < 60) return m + 'm';
    var h = Math.round(m / 60); if (h < 24) return h + 'h';
    var d = Math.round(h / 24); if (d < 7) return d + 'd';
    return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function fmtDate(t) {
    return new Date(t).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- Theme ---------- */
  function currentTheme() {
    var t = read(TKEY);
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme() {
    var t = currentTheme();
    document.documentElement.setAttribute('data-theme', t);
    var b = $('#btnTheme');
    if (b) { b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon'); b.setAttribute('aria-pressed', String(t === 'dark')); }
  }
  function toggleTheme() { store(TKEY, currentTheme() === 'dark' ? 'light' : 'dark'); applyTheme(); if (openPanel === 'me') renderPanel(); }

  /* ---------- Auth ---------- */
  function renderAuth() {
    var login = authMode === 'login';
    $('#auth').innerHTML =
      '<div class="hero"><h1>' + icon('lamp') + 'porchlight</h1><p>Leave the light on for friends and neighbors.</p></div>' +
      '<div class="card">' +
      '<div class="tabs" role="group" aria-label="Sign in or sign up">' +
      '<button type="button" class="btn ' + (login ? 'on' : '') + '" data-act="authmode" data-id="login" aria-pressed="' + login + '">Sign in</button>' +
      '<button type="button" class="btn ' + (!login ? 'on' : '') + '" data-act="authmode" data-id="signup" aria-pressed="' + !login + '">Create account</button></div>' +
      (login
        ? '<form class="form" data-form="login" novalidate>' +
          '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
          '<label>Password<input name="pass" type="password" autocomplete="current-password" required></label>' +
          '<p class="err" id="authErr" role="alert"></p>' +
          '<button class="btn primary block" type="submit">Sign in</button></form>'
        : '<form class="form" data-form="signup" novalidate>' +
          '<label>Full name<input name="name" autocomplete="name" required maxlength="60"></label>' +
          '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
          '<label>Password<input name="pass" id="suPass" type="password" autocomplete="new-password" required minlength="8"></label>' +
          '<div class="meter" id="suMeter" aria-hidden="true"><span></span></div>' +
          '<p class="muted small">At least 8 characters. Try mixing letters, numbers and symbols.</p>' +
          '<p class="err" id="authErr" role="alert"></p>' +
          '<button class="btn primary block" type="submit">Create account</button></form>') +
      '<hr class="sep"><button type="button" class="btn block" data-act="demo">Try the demo account</button>' +
      '<p class="muted small center">Everything is stored only in this browser. Passwords are hashed; other people here are tabs on this device.</p></div>';
    var sp = $('#suPass');
    if (sp) sp.addEventListener('input', function () { updateMeter(sp.value); });
  }
  function updateMeter(pw) {
    var m = $('#suMeter'); if (!m) return;
    var s = passStrength(pw);
    m.className = 'meter s' + s;
    m.querySelector('span').style.width = (s * 25) + '%';
  }
  function authErr(m) { var e = $('#authErr'); if (e) e.textContent = m; }

  function createAccount(name, email, pass, cb) {
    var u = { id: uid('u'), name: name, bio: '', city: '', color: COLORS[Math.floor(Math.random() * COLORS.length)] };
    state.users.push(u);
    var acc = { userId: u.id, email: email, pass: null, real: true, fails: 0, lockUntil: 0 };
    state.accounts.push(acc);
    addFriendship(u.id, 'u1'); addFriendship(u.id, 'u3');
    state.requests.push({ from: 'u2', to: u.id, time: Date.now() });
    var g1 = group('g1'); if (g1 && g1.members.indexOf(u.id) < 0) g1.members.push(u.id);
    state.threads[tkey(u.id, 'u1')] = [{ from: 'u1', text: 'Welcome to Porchlight, ' + first(u) + '! Glad you joined 🏡', time: Date.now() }];
    state.unread[u.id + '|u1'] = 1;
    notify(u.id, 'Welcome to Porchlight! Start by saying hello in your feed.', '#/feed');
    notify(u.id, 'Theo Grant sent you a friend request.', '#/friends');
    hashPassword(pass).then(function (h) { acc.pass = h; acc.needsPassword = false; save(); if (cb) cb(u); });
    return u;
  }
  function signIn(id) {
    state.session = id; save();
    try { sessionStorage.setItem('porchlight.tabuser', id); } catch (e) {}
    if (location.hash !== '#/feed') location.hash = '#/feed';
    render();
  }
  function currentSessionUser() {
    var t = null;
    try { t = sessionStorage.getItem('porchlight.tabuser'); } catch (e) {}
    if (t && user(t)) return t;
    return state.session;
  }

  /* ---------- Feed ranking ---------- */
  var HALF_LIFE = 12 * H;
  function interactionAffinity(authorId) {
    // past interactions: friendship + chat volume + reactions given
    var a = 0;
    if (isFriend(me.id, authorId)) a += 3;
    var th = state.threads[tkey(me.id, authorId)];
    if (th) a += Math.min(th.length, 10) * 0.3;
    return a;
  }
  function scorePost(p) {
    var ageH = (Date.now() - p.time) / H;
    var recency = Math.pow(0.5, (Date.now() - p.time) / HALF_LIFE); // 0..1
    var engagement = p.likes.length * 1 + p.comments.length * 1.5;
    var affinity = interactionAffinity(p.author);
    var typeBoost = 0; // media boost if present (future media field)
    var score = recency * 10 + engagement + affinity + typeBoost;
    return { score: score, recency: recency, engagement: engagement, affinity: affinity, ageH: ageH };
  }
  function whyText(p) {
    var s = scorePost(p);
    var parts = [];
    if (s.affinity >= 3) parts.push('you and ' + esc(first(user(p.author) || { name: 'them' })) + ' interact often');
    else if (isFriend(me.id, p.author)) parts.push('they are your friend');
    if (s.engagement > 2) parts.push('it has engagement (' + p.likes.length + ' likes, ' + p.comments.length + ' comments)');
    if (s.recency > 0.6) parts.push('it is recent');
    if (!parts.length) parts.push('it is from your circle');
    return 'Shown in Top because ' + parts.join(', ') + '.';
  }

  /* ---------- Views ---------- */
  function composer(groupId) {
    return '<form class="card composer" data-form="post" data-group="' + esc(groupId || '') + '">' +
      '<div class="row">' + avatar(me, 'md') +
      '<label class="sr" for="composeText">What\'s on your mind?</label>' +
      '<textarea id="composeText" name="text" rows="2" maxlength="2000" placeholder="What\'s on your mind, ' + esc(first(me)) + '?"></textarea></div>' +
      '<div class="row end"><button class="btn primary" type="submit">Post</button></div></form>';
  }
  function postCard(p) {
    var a = user(p.author) || { id: '', name: 'Unknown', color: '#888' };
    var g = p.group && group(p.group);
    var liked = p.likes.indexOf(me.id) >= 0;
    var likeText = '';
    var vlikes = p.likes.filter(visible);
    if (vlikes.length) {
      likeText = liked ? (vlikes.length === 1 ? 'You' : 'You and ' + plural(vlikes.length - 1, 'other')) : String(vlikes.length);
    }
    var comments = p.comments.filter(function (c) { return visible(c.author); }).map(function (c) {
      var cu = user(c.author) || { id: '', name: 'Unknown', color: '#888' };
      return '<div class="comment">' + avatar(cu, 'xs') +
        '<div class="cb"><a class="name small" href="#/profile/' + esc(cu.id) + '">' + esc(cu.name) + '</a> <span class="muted small">' + ago(c.time) + '</span><p>' + esc(c.text) + '</p></div>' +
        (c.author === me.id ? '<button class="iconbtn" type="button" data-act="delcomment" data-id="' + esc(p.id) + '" data-cid="' + esc(c.id) + '" aria-label="Delete comment">' + icon('trash') + '</button>' :
          '<button class="iconbtn" type="button" data-act="reportcomment" data-id="' + esc(p.id) + '" data-cid="' + esc(c.id) + '" aria-label="Report comment">' + icon('flag') + '</button>') +
        '</div>';
    }).join('');
    var menu = '';
    if (p.author === me.id) {
      menu = '<button class="iconbtn" type="button" data-act="delpost" data-id="' + esc(p.id) + '" aria-label="Delete post">' + icon('trash') + '</button>';
    } else {
      menu = '<button class="iconbtn" type="button" data-act="reportpost" data-id="' + esc(p.id) + '" aria-label="Report post">' + icon('flag') + '</button>' +
        '<button class="iconbtn" type="button" data-act="blockask" data-id="' + esc(a.id) + '" aria-label="Block ' + esc(a.name) + '">' + icon('block') + '</button>';
    }
    if (isAdmin(me.id) && p.author !== me.id) {
      menu += '<button class="iconbtn" type="button" data-act="adminremovepost" data-id="' + esc(p.id) + '" aria-label="Remove as admin">' + icon('shield') + '</button>';
    }
    var why = feedMode === 'top'
      ? '<button type="button" class="why" data-act="why" data-id="' + esc(p.id) + '">' + icon('info') + 'Why am I seeing this?</button>'
      : '';
    return '<article class="card post" data-post="' + esc(p.id) + '">' +
      '<header class="post-h">' + avatar(a, 'md') + '<div class="who"><a class="name" href="#/profile/' + esc(a.id) + '">' + esc(a.name) + '</a>' + badgeReal(a.id) +
      (g ? ' <span class="muted">▸</span> <a class="name" href="#/group/' + esc(g.id) + '">' + esc(g.name) + '</a>' : '') +
      '<div class="muted small"><time datetime="' + new Date(p.time).toISOString() + '">' + ago(p.time) + '</time></div></div>' +
      menu + '</header>' +
      '<p class="post-text">' + esc(p.text) + '</p>' + why +
      '<div class="post-stats muted small"><span>' + (vlikes.length ? icon('heart') + ' ' + esc(likeText) : '') + '</span><span>' + (p.comments.length ? plural(p.comments.filter(function (c) { return visible(c.author); }).length, 'comment') : '') + '</span></div>' +
      '<div class="post-actions"><button type="button" class="act ' + (liked ? 'on' : '') + '" data-act="like" data-id="' + esc(p.id) + '" aria-pressed="' + liked + '">' + icon('heart') + 'Like</button>' +
      '<button type="button" class="act" data-act="focuscomment" data-id="' + esc(p.id) + '">' + icon('comment') + 'Comment</button></div>' +
      '<div class="comments">' + comments +
      '<form class="comment-form" data-form="comment" data-id="' + esc(p.id) + '">' + avatar(me, 'xs') +
      '<label class="sr" for="c-' + esc(p.id) + '">Write a comment</label>' +
      '<input id="c-' + esc(p.id) + '" name="text" placeholder="Write a comment…" autocomplete="off" maxlength="500">' +
      '<button class="iconbtn" type="submit" aria-label="Send comment">' + icon('send') + '</button></form></div>' +
      '</article>';
  }
  function empty(msg) { return '<div class="card empty">' + msg + '</div>'; }
  function sortTime(a, b) { return b.time - a.time; }

  function feedPosts() {
    var circle = [me.id].concat(friendsOf(me.id));
    var gids = state.groups.filter(function (g) { return g.members.indexOf(me.id) >= 0; }).map(function (g) { return g.id; });
    return state.posts.filter(function (p) {
      if (!visible(p.author)) return false;
      return p.group ? gids.indexOf(p.group) >= 0 : circle.indexOf(p.author) >= 0;
    });
  }
  function feedView() {
    var posts = feedPosts();
    if (feedMode === 'top') posts.sort(function (a, b) { return scorePost(b).score - scorePost(a).score; });
    else posts.sort(sortTime);
    var toggle = '<div class="card feedtoggle"><h1 class="sr">Home feed</h1>' +
      '<div class="seg" role="group" aria-label="Feed order">' +
      '<button type="button" class="btn ' + (feedMode === 'top' ? 'on' : '') + '" data-act="feedmode" data-id="top" aria-pressed="' + (feedMode === 'top') + '">Top</button>' +
      '<button type="button" class="btn ' + (feedMode === 'latest' ? 'on' : '') + '" data-act="feedmode" data-id="latest" aria-pressed="' + (feedMode === 'latest') + '">Latest</button>' +
      '</div></div>';
    return toggle + composer() +
      (posts.length ? posts.map(postCard).join('') : empty('Your feed is quiet. <a href="#/friends">Add friends</a> or <a href="#/groups">join groups</a> to see more.'));
  }

  function relationButtons(u) {
    if (u.id === me.id) return '<button type="button" class="btn" data-act="editprofile">Edit profile</button>';
    if (isFriend(me.id, u.id)) {
      return '<button type="button" class="btn primary" data-act="chat" data-id="' + esc(u.id) + '">' + icon('chat') + 'Message</button>' +
        '<button type="button" class="btn" data-act="unfriend" data-id="' + esc(u.id) + '">Unfriend</button>' +
        '<button type="button" class="btn" data-act="blockask" data-id="' + esc(u.id) + '">' + icon('block') + 'Block</button>' +
        '<button type="button" class="btn" data-act="reportprofile" data-id="' + esc(u.id) + '">' + icon('flag') + 'Report</button>';
    }
    if (req(me.id, u.id)) return '<button type="button" class="btn" data-act="cancelreq" data-id="' + esc(u.id) + '">Cancel request</button>' +
      '<button type="button" class="btn" data-act="blockask" data-id="' + esc(u.id) + '">' + icon('block') + 'Block</button>';
    if (req(u.id, me.id)) {
      return '<button type="button" class="btn primary" data-act="accept" data-id="' + esc(u.id) + '">Confirm</button>' +
        '<button type="button" class="btn" data-act="decline" data-id="' + esc(u.id) + '">Delete</button>';
    }
    return '<button type="button" class="btn primary" data-act="addfriend" data-id="' + esc(u.id) + '">' + icon('plus') + 'Add friend</button>' +
      '<button type="button" class="btn" data-act="chat" data-id="' + esc(u.id) + '">' + icon('chat') + 'Message</button>' +
      '<button type="button" class="btn" data-act="blockask" data-id="' + esc(u.id) + '">' + icon('block') + 'Block</button>' +
      '<button type="button" class="btn" data-act="reportprofile" data-id="' + esc(u.id) + '">' + icon('flag') + 'Report</button>';
  }
  function mutualCount(id) {
    var mine = friendsOf(me.id);
    return friendsOf(id).filter(function (f) { return mine.indexOf(f) >= 0; }).length;
  }

  function profileView(id) {
    var u = user(id);
    if (!u) return notFound();
    if (!visible(u.id)) return empty('You have blocked this person. <a href="#/feed">Go to your feed</a>, or unblock them in Settings.');
    var fr = friendsOf(u.id).filter(visible);
    var gids = state.groups.filter(function (g) { return g.members.indexOf(me.id) >= 0; }).map(function (g) { return g.id; });
    var posts = state.posts.filter(function (p) {
      return p.author === u.id && (!p.group || gids.indexOf(p.group) >= 0);
    }).sort(sortTime);
    var isMe = u.id === me.id;
    var html = '<section class="card profile"><div class="cover" style="background:linear-gradient(135deg,' + esc(u.color) + ',#f4a261)"></div>' +
      '<div class="profile-body">' + avatar(u, 'lg') +
      '<div class="info"><h1>' + esc(u.name) + badgeReal(u.id) + '</h1><div class="muted">' + plural(fr.length, 'friend') +
      (!isMe && mutualCount(u.id) ? ' · ' + plural(mutualCount(u.id), 'mutual friend') : '') +
      (u.city ? ' · ' + icon('pin') + ' ' + esc(u.city) : '') + '</div></div>' +
      '<div class="actions">' + relationButtons(u) + '</div></div>' +
      (u.bio ? '<p class="bio">' + esc(u.bio) + '</p>' : '') + '</section>';
    if (isMe && editingProfile) {
      html += '<form class="card form" data-form="profile"><h2>Edit profile</h2>' +
        '<label>Name<input name="name" required maxlength="60" value="' + esc(u.name) + '"></label>' +
        '<label>City<input name="city" maxlength="60" value="' + esc(u.city) + '"></label>' +
        '<label>Bio<textarea name="bio" rows="3" maxlength="300">' + esc(u.bio) + '</textarea></label>' +
        '<div class="row end"><button type="button" class="btn" data-act="canceledit">Cancel</button><button class="btn primary" type="submit">Save</button></div></form>';
    }
    if (fr.length) {
      html += '<section class="card"><h2>Friends</h2><div class="grid">' + fr.slice(0, 6).map(function (fid) {
        var f = user(fid);
        return '<a class="pcard" href="#/profile/' + esc(f.id) + '">' + avatar(f, 'md') + '<span class="name">' + esc(f.name) + '</span></a>';
      }).join('') + '</div></section>';
    }
    if (isMe) html += composer();
    html += posts.length ? posts.map(postCard).join('') : empty(isMe ? 'You haven\'t posted yet.' : esc(first(u)) + ' hasn\'t posted yet.');
    return html;
  }

  function personCard(u, buttons) {
    var m = mutualCount(u.id);
    return '<div class="pcard">' + avatar(u, 'md') + '<a class="name" href="#/profile/' + esc(u.id) + '">' + esc(u.name) + '</a>' + badgeReal(u.id) +
      '<span class="muted small">' + (m ? plural(m, 'mutual friend') : (u.city ? esc(u.city) : '&nbsp;')) + '</span>' +
      '<div class="btns">' + buttons + '</div></div>';
  }
  function friendsView() {
    var incoming = state.requests.filter(function (r) { return r.to === me.id && user(r.from) && visible(r.from); });
    var outgoing = state.requests.filter(function (r) { return r.from === me.id && user(r.to) && visible(r.to); });
    var fr = friendsOf(me.id).filter(visible);
    var sugg = state.users.filter(function (u) {
      return u.id !== me.id && visible(u.id) && !isFriend(me.id, u.id) && !req(me.id, u.id) && !req(u.id, me.id);
    }).sort(function (a, b) { return mutualCount(b.id) - mutualCount(a.id); });
    var html = '<h1 class="sr">Friends</h1>';
    html += '<section class="card"><h2>Friend requests</h2>' + (incoming.length ? '<div class="grid">' + incoming.map(function (r) {
      var u = user(r.from);
      return personCard(u, '<button type="button" class="btn primary" data-act="accept" data-id="' + esc(u.id) + '">Confirm</button><button type="button" class="btn" data-act="decline" data-id="' + esc(u.id) + '">Delete</button>');
    }).join('') + '</div>' : '<p class="muted">No pending requests.</p>') + '</section>';
    if (outgoing.length) {
      html += '<section class="card"><h2>Sent requests</h2><div class="grid">' + outgoing.map(function (r) {
        var u = user(r.to);
        return personCard(u, '<button type="button" class="btn" data-act="cancelreq" data-id="' + esc(u.id) + '">Cancel</button>');
      }).join('') + '</div></section>';
    }
    html += '<section class="card"><h2>Your friends (' + fr.length + ')</h2>' + (fr.length ? '<div class="grid">' + fr.map(function (id) {
      var u = user(id);
      return personCard(u, '<button type="button" class="btn" data-act="chat" data-id="' + esc(u.id) + '">' + icon('chat') + 'Message</button>');
    }).join('') + '</div>' : '<p class="muted">No friends yet. Try the suggestions below.</p>') + '</section>';
    html += '<section class="card"><h2>People you may know</h2>' + (sugg.length ? '<div class="grid">' + sugg.map(function (u) {
      return personCard(u, '<button type="button" class="btn primary" data-act="addfriend" data-id="' + esc(u.id) + '">' + icon('plus') + 'Add friend</button>');
    }).join('') + '</div>' : '<p class="muted">You know everyone here!</p>') + '</section>';
    return html;
  }

  function joinBtn(g) {
    var mem = g.members.indexOf(me.id) >= 0;
    return mem
      ? '<button type="button" class="btn on" data-act="leave" data-id="' + esc(g.id) + '" aria-pressed="true">' + icon('check') + 'Joined</button>'
      : '<button type="button" class="btn primary" data-act="join" data-id="' + esc(g.id) + '" aria-pressed="false">' + icon('plus') + 'Join</button>';
  }
  function groupsView() {
    var html = '<h1 class="sr">Groups</h1>' +
      '<details class="card"><summary>' + icon('plus') + 'Create a group</summary>' +
      '<form class="form" data-form="group"><label>Group name<input name="name" required maxlength="60"></label>' +
      '<label>Description<textarea name="desc" rows="2" maxlength="300"></textarea></label>' +
      '<div class="row end"><button class="btn primary" type="submit">Create group</button></div></form></details>';
    html += '<section class="card"><h2>Groups</h2>' + (state.groups.length ? state.groups.map(function (g) {
      return '<div class="list-row">' + gicon(g) + '<div class="grow"><a class="name" href="#/group/' + esc(g.id) + '">' + esc(g.name) + '</a>' +
        '<div class="muted small">' + plural(g.members.length, 'member') + (g.desc ? ' · ' + esc(g.desc) : '') + '</div></div>' +
        '<div class="btns">' + joinBtn(g) + '</div></div>';
    }).join('') : '<p class="muted">No groups yet.</p>') + '</section>';
    return html;
  }
  function groupView(id) {
    var g = group(id);
    if (!g) return notFound();
    var mem = g.members.indexOf(me.id) >= 0;
    var posts = state.posts.filter(function (p) { return p.group === g.id && visible(p.author); }).sort(sortTime);
    var html = '<section class="card ghead"><div class="cover" style="background:linear-gradient(135deg,' + esc(g.color || '#888') + ',#f4a261)"></div>' +
      '<div class="gbody"><div class="grow"><h1>' + esc(g.name) + '</h1><div class="muted">' + plural(g.members.length, 'member') + '</div>' +
      (g.desc ? '<p>' + esc(g.desc) + '</p>' : '') + '</div>' + joinBtn(g) + '</div></section>';
    html += '<section class="card"><h2>Members</h2><div class="row wrap">' + g.members.map(user).filter(Boolean).filter(function (u) { return visible(u.id); }).map(function (u) {
      return '<a href="#/profile/' + esc(u.id) + '" title="' + esc(u.name) + '" aria-label="' + esc(u.name) + '">' + avatar(u, 'sm') + '</a>';
    }).join('') + '</div></section>';
    if (mem) html += composer(g.id);
    else html += '<div class="card empty">Join this group to post.</div>';
    html += posts.length ? posts.map(postCard).join('') : empty('No posts in this group yet.');
    return html;
  }

  function eventCard(e) {
    var d = new Date(e.when), host = user(e.host) || { id: '', name: 'Unknown' };
    var going = e.going.indexOf(me.id) >= 0, inter = e.interested.indexOf(me.id) >= 0;
    var past = e.when < Date.now();
    return '<article class="card event' + (past ? ' past' : '') + '"><div class="datebox"><span>' +
      esc(d.toLocaleDateString(undefined, { month: 'short' })) + '</span><b>' + d.getDate() + '</b></div>' +
      '<div class="grow"><h3>' + esc(e.title) + '</h3><div class="muted small">' + esc(fmtDate(e.when)) + (e.place ? ' · ' + icon('pin') + ' ' + esc(e.place) : '') + '</div>' +
      (e.desc ? '<p>' + esc(e.desc) + '</p>' : '') +
      '<div class="muted small">Hosted by <a href="#/profile/' + esc(host.id) + '">' + esc(host.name) + '</a> · ' + e.going.length + ' going · ' + e.interested.length + ' interested</div>' +
      '<div class="btns">' + (past ? '' :
        '<button type="button" class="btn ' + (going ? 'on' : '') + '" data-act="going" data-id="' + esc(e.id) + '" aria-pressed="' + going + '">' + icon('check') + 'Going</button>' +
        '<button type="button" class="btn ' + (inter ? 'on' : '') + '" data-act="interested" data-id="' + esc(e.id) + '" aria-pressed="' + inter + '">' + icon('star') + 'Interested</button>') +
      (e.host === me.id ? '<button type="button" class="btn danger" data-act="delevent" data-id="' + esc(e.id) + '">' + icon('trash') + 'Delete</button>' : '') +
      '</div></div></article>';
  }
  function eventsView() {
    var now = Date.now();
    var up = state.events.filter(function (e) { return e.when >= now; }).sort(function (a, b) { return a.when - b.when; });
    var past = state.events.filter(function (e) { return e.when < now; }).sort(function (a, b) { return b.when - a.when; });
    var html = '<h1 class="sr">Events</h1>' +
      '<details class="card"><summary>' + icon('plus') + 'Create an event</summary>' +
      '<form class="form" data-form="event"><label>Title<input name="title" required maxlength="80"></label>' +
      '<div class="two"><label>Date and time<input name="when" type="datetime-local" required></label>' +
      '<label>Location<input name="place" maxlength="80"></label></div>' +
      '<label>Details<textarea name="desc" rows="2" maxlength="400"></textarea></label>' +
      '<p class="err" id="eventErr" role="alert"></p>' +
      '<div class="row end"><button class="btn primary" type="submit">Create event</button></div></form></details>';
    html += '<h2 class="sr">Upcoming events</h2>' + (up.length ? up.map(eventCard).join('') : empty('No upcoming events. Create one!'));
    if (past.length) html += '<h2 class="muted small">Past events</h2>' + past.map(eventCard).join('');
    return html;
  }

  /* ---------- Settings ---------- */
  function settingsView() {
    var acc = account(me.id);
    var myBlocks = state.blocks.filter(function (b) { return b.by === me.id; });
    var html = '<h1 class="sr">Settings</h1>';
    html += '<section class="card"><h2>' + icon('lock') + ' Security</h2>' +
      '<form class="form" data-form="changepass">' +
      (acc && acc.needsPassword ? '<p class="muted small">This account has no password yet. Set one now.</p>' :
        '<label>Current password<input name="cur" type="password" autocomplete="current-password" required></label>') +
      '<label>New password<input name="np" id="cpNew" type="password" autocomplete="new-password" minlength="8" required></label>' +
      '<div class="meter" id="cpMeter" aria-hidden="true"><span></span></div>' +
      '<p class="err" id="cpErr" role="alert"></p>' +
      '<div class="row end"><button class="btn primary" type="submit">Change password</button></div></form>' +
      '<hr style="border:0;border-top:1px solid var(--line);margin:12px 0">' +
      '<button type="button" class="btn" data-act="logouteverywhere">' + icon('key') + 'Log out everywhere</button>' +
      '<p class="muted small">Rotates your session token, signing out all tabs on this browser.</p>' +
      '</section>';

    html += '<section class="card"><h2>' + icon('block') + ' Blocked users</h2>' +
      (myBlocks.length ? myBlocks.map(function (b) {
        var u = user(b.who); if (!u) return '';
        return '<div class="list-row">' + avatar(u, 'sm') + '<span class="grow name">' + esc(u.name) + '</span>' +
          '<button type="button" class="btn" data-act="unblock" data-id="' + esc(u.id) + '">Unblock</button></div>';
      }).join('') : '<p class="muted">You haven\'t blocked anyone.</p>') + '</section>';

    html += '<section class="card"><h2>Demo behaviour</h2>' +
      '<label class="switchrow"><input type="checkbox" data-act="toggledemo"' + (state.settings.demoReplies ? ' checked' : '') + '> Let demo users auto-reply</label>' +
      '<p class="muted small">Real accounts (shown with a "Real" badge) never auto-reply.</p></section>';

    html += '<section class="card"><h2>Move your data</h2>' +
      '<p class="muted small">Export everything to a file to move it to another device. Optionally encrypt it with a passphrase (AES-GCM).</p>' +
      '<form class="form" data-form="export"><label>Encryption passphrase (optional)<input name="pass" type="password" autocomplete="off"></label>' +
      '<div class="row end"><button class="btn primary" type="submit">Export my data</button></div></form>' +
      '<hr style="border:0;border-top:1px solid var(--line);margin:12px 0">' +
      '<form class="form" data-form="import"><label>Import file<input name="file" type="file" accept="application/json,.json"></label>' +
      '<label>Passphrase (if encrypted)<input name="pass" type="password" autocomplete="off"></label>' +
      '<label class="switchrow"><input type="checkbox" name="replace"> Replace all data (otherwise merge)</label>' +
      '<p class="err" id="impErr" role="alert"></p>' +
      '<div class="row end"><button class="btn" type="submit">Import data</button></div></form></section>';

    if (isAdmin(me.id)) {
      var open = state.reports.filter(function (r) { return r.status === 'open'; });
      html += '<section class="card"><h2>' + icon('shield') + ' Moderation queue</h2>' +
        (open.length ? open.map(reportRow).join('') : '<p class="muted">No open reports.</p>') + '</section>';
    }
    // reporter's status view
    var mine = state.reports.filter(function (r) { return r.by === me.id; });
    if (mine.length) {
      html += '<section class="card"><h2>Your reports</h2>' + mine.map(function (r) {
        return '<div class="list-row"><span class="grow small">' + esc(r.kind) + ': ' + esc(r.reason) + '</span><span class="rstatus r-' + esc(r.status) + '">' +
          esc(r.status === 'open' ? 'Pending' : r.status === 'removed' ? 'Removed' : r.status === 'warned' ? 'User warned' : 'Dismissed') + '</span></div>';
      }).join('') + '</section>';
    }
    return html;
  }
  function reportRow(r) {
    var by = user(r.by) || { name: 'Unknown' };
    var label = r.kind + ' reported by ' + esc(by.name) + ' — "' + esc(r.reason) + '"' + (r.details ? ': ' + esc(r.details) : '');
    return '<div class="list-row"><span class="grow small">' + label + '</span>' +
      '<div class="btns">' +
      '<button type="button" class="btn danger" data-act="modremove" data-id="' + esc(r.id) + '">Remove</button>' +
      '<button type="button" class="btn" data-act="modwarn" data-id="' + esc(r.id) + '">Warn</button>' +
      '<button type="button" class="btn" data-act="moddismiss" data-id="' + esc(r.id) + '">Dismiss</button></div></div>';
  }

  function notFound() { return empty('Sorry, that page isn\'t available. <a href="#/feed">Go to your feed</a>.'); }

  function renderLeft() {
    var gs = state.groups.filter(function (g) { return g.members.indexOf(me.id) >= 0; });
    $('#left').innerHTML =
      '<a class="item" href="#/profile/' + esc(me.id) + '">' + avatar(me, 'sm') + '<span class="grow"><span class="name">' + esc(me.name) + '</span></span></a>' +
      '<a class="item" href="#/friends">' + icon('users') + '<span class="grow">Friends</span></a>' +
      '<a class="item" href="#/groups">' + icon('group') + '<span class="grow">Groups</span></a>' +
      '<a class="item" href="#/events">' + icon('calendar') + '<span class="grow">Events</span></a>' +
      '<a class="item" href="#/settings">' + icon('lock') + '<span class="grow">Settings</span></a>' +
      '<button type="button" class="item" data-act="openmsgs">' + icon('chat') + '<span class="grow">Messenger</span></button>' +
      '<hr><h2>Your groups</h2>' +
      (gs.length ? gs.map(function (g) {
        return '<a class="item" href="#/group/' + esc(g.id) + '">' + gicon(g) + '<span class="grow">' + esc(g.name) + '</span></a>';
      }).join('') : '<p class="muted small" style="padding:0 8px">You haven\'t joined any groups.</p>');
  }
  function renderRight() {
    var incoming = state.requests.filter(function (r) { return r.to === me.id && user(r.from) && visible(r.from); });
    var fr = friendsOf(me.id).filter(visible);
    var html = '';
    if (incoming.length) {
      html += '<h2>Friend requests</h2>' + incoming.map(function (r) {
        var u = user(r.from);
        return '<div class="item">' + avatar(u, 'sm') + '<span class="grow"><a class="name" href="#/profile/' + esc(u.id) + '">' + esc(u.name) + '</a></span>' +
          '<button type="button" class="btn primary" data-act="accept" data-id="' + esc(u.id) + '">Confirm</button></div>';
      }).join('') + '<hr>';
    }
    html += '<h2>Contacts</h2>' + (fr.length ? fr.map(function (id) {
      var u = user(id);
      var n = state.unread[me.id + '|' + u.id] || 0;
      return '<button type="button" class="item" data-act="chat" data-id="' + esc(u.id) + '">' + avatar(u, 'sm') +
        '<span class="grow"><span>' + esc(u.name) + '</span></span>' + (n ? '<span class="dot" aria-label="unread messages"></span>' : '') + '</button>';
    }).join('') : '<p class="muted small" style="padding:0 8px">No contacts yet.</p>');
    $('#right').innerHTML = html;
  }

  function unreadThreads() {
    var p = me.id + '|';
    return Object.keys(state.unread).filter(function (k) {
      if (k.indexOf(p) !== 0 || state.unread[k] <= 0) return false;
      var other = k.slice(p.length);
      return visible(other);
    }).length;
  }
  function setBadge(btn, n) {
    if (!btn) return;
    var b = btn.querySelector('.badge');
    var label = btn.getAttribute('data-label') || '';
    if (n > 0) {
      if (!b) { b = document.createElement('span'); b.className = 'badge'; b.setAttribute('aria-hidden', 'true'); btn.appendChild(b); }
      b.textContent = n > 9 ? '9+' : String(n);
      btn.setAttribute('aria-label', label + ', ' + n + ' unread');
    } else {
      if (b) b.remove();
      btn.setAttribute('aria-label', label);
    }
  }
  function renderBadges() {
    if (!me) return;
    setBadge($('#btnMsgs'), unreadThreads());
    setBadge($('#btnNotifs'), state.notifs.filter(function (n) { return n.to === me.id && !n.read; }).length);
  }

  /* ---------- Panels ---------- */
  function renderPanel() {
    var p = $('#panel');
    if (!openPanel || !me) { p.hidden = true; return; }
    var html = '';
    if (openPanel === 'msgs') {
      var keys = Object.keys(state.threads).filter(function (k) {
        if (k.split('~').indexOf(me.id) < 0 || !state.threads[k].length) return false;
        var other = k.split('~').filter(function (x) { return x !== me.id; })[0] || me.id;
        return visible(other);
      });
      keys.sort(function (a, b) { var x = state.threads[a], y = state.threads[b]; return y[y.length - 1].time - x[x.length - 1].time; });
      var withThread = [];
      html = '<h2>Messenger</h2>' + keys.map(function (k) {
        var other = k.split('~').filter(function (x) { return x !== me.id; })[0] || me.id;
        var u = user(other); if (!u) return '';
        withThread.push(other);
        var last = state.threads[k][state.threads[k].length - 1];
        var n = state.unread[me.id + '|' + other] || 0;
        return '<button type="button" class="item' + (n ? ' unread' : '') + '" data-act="chat" data-id="' + esc(u.id) + '">' + avatar(u, 'md') +
          '<span class="grow"><span class="name">' + esc(u.name) + '</span><span class="muted small">' + (last.from === me.id ? 'You: ' : '') + esc(last.text) + ' · ' + ago(last.time) + '</span></span>' +
          (n ? '<span class="dot"></span>' : '') + '</button>';
      }).join('');
      var others = friendsOf(me.id).filter(visible).filter(function (f) { return withThread.indexOf(f) < 0; });
      if (others.length) {
        html += '<h3>Start a chat</h3>' + others.map(function (id) {
          var u = user(id);
          return '<button type="button" class="item" data-act="chat" data-id="' + esc(u.id) + '">' + avatar(u, 'sm') + '<span class="grow"><span>' + esc(u.name) + '</span></span></button>';
        }).join('');
      }
      if (!keys.length && !others.length) html += '<p class="muted center">No conversations yet.</p>';
    } else if (openPanel === 'notifs') {
      var ns = state.notifs.filter(function (n) { return n.to === me.id; }).slice(0, 30);
      html = '<div class="panel-head"><h2>Notifications</h2>' + (ns.length ? '<button type="button" class="btn" data-act="clearnotifs">Clear</button>' : '') + '</div>' +
        (ns.length ? ns.map(function (n) {
          return '<a class="item' + (n.read ? '' : ' unread') + '" href="' + esc(n.href || '#/feed') + '">' + icon('bell') +
            '<span class="grow"><span style="white-space:normal">' + esc(n.text) + '</span><span class="muted small">' + ago(n.time) + '</span></span>' +
            (n.read ? '' : '<span class="dot"></span>') + '</a>';
        }).join('') : '<p class="muted center">You\'re all caught up.</p>');
    } else if (openPanel === 'me') {
      var dark = currentTheme() === 'dark';
      html = '<a class="item" href="#/profile/' + esc(me.id) + '">' + avatar(me, 'md') + '<span class="grow"><span class="name">' + esc(me.name) + badgeReal(me.id) + '</span><span class="muted small">See your profile</span></span></a><hr style="border:0;border-top:1px solid var(--line)">' +
        '<a class="item" href="#/settings">' + icon('lock') + '<span class="grow"><span>Settings</span></span></a>' +
        '<button type="button" class="item" data-act="theme" aria-pressed="' + dark + '">' + icon(dark ? 'sun' : 'moon') + '<span class="grow"><span>' + (dark ? 'Light mode' : 'Dark mode') + '</span></span></button>' +
        '<button type="button" class="item" data-act="logout">' + icon('logout') + '<span class="grow"><span>Log out</span></span></button>';
    }
    p.innerHTML = html;
    p.hidden = false;
  }
  function setExpanded() {
    $$('[data-panel-btn]').forEach(function (b) { b.setAttribute('aria-expanded', String(b.getAttribute('data-panel-btn') === openPanel)); });
  }
  function togglePanel(name) {
    if (openPanel === name) { closePanel(); return; }
    openPanel = name;
    renderPanel();
    setExpanded();
    if (name === 'notifs') {
      var changed = false;
      state.notifs.forEach(function (n) { if (n.to === me.id && !n.read) { n.read = true; changed = true; } });
      if (changed) { save(); renderBadges(); }
    }
  }
  function closePanel() { openPanel = null; $('#panel').hidden = true; setExpanded(); }

  /* ---------- Chat ---------- */
  function renderChat() {
    var dock = $('#chatdock');
    if (!dock) return;
    if (!me || !chatWith || !user(chatWith) || !visible(chatWith)) { dock.innerHTML = ''; return; }
    var prev = $('#chatInput'), val = prev ? prev.value : '', foc = prev && document.activeElement === prev;
    var u = user(chatWith), msgs = state.threads[tkey(me.id, u.id)] || [];
    dock.innerHTML = '<section class="chatwin" aria-label="Chat with ' + esc(u.name) + '">' +
      '<header class="chat-h">' + avatar(u, 'sm') + '<a href="#/profile/' + esc(u.id) + '" class="name">' + esc(u.name) + '</a>' +
      '<button type="button" class="iconbtn" data-act="closechat" aria-label="Close chat">' + icon('x') + '</button></header>' +
      '<div class="chat-body" id="chatBody" aria-live="polite">' + (msgs.length ? msgs.map(function (m) {
        return '<div class="bubble' + (m.from === me.id ? ' mine' : '') + '">' + esc(m.text) + '<time>' + ago(m.time) + '</time></div>';
      }).join('') : '<p class="muted small center">Say hi to ' + esc(first(u)) + '!</p>') + '</div>' +
      '<form class="chat-form" data-form="chat"><label for="chatInput" class="sr">Message ' + esc(u.name) + '</label>' +
      '<input id="chatInput" name="text" autocomplete="off" placeholder="Aa" maxlength="1000">' +
      '<button class="iconbtn" type="submit" aria-label="Send">' + icon('send') + '</button></form></section>';
    var b = $('#chatBody'); b.scrollTop = b.scrollHeight;
    var inp = $('#chatInput'); inp.value = val; if (foc) inp.focus();
  }
  function openChat(id) {
    if (!user(id) || id === me.id || !visible(id)) return;
    chatWith = id;
    state.unread[me.id + '|' + id] = 0;
    save();
    closePanel();
    renderChat(); renderBadges(); renderRight();
    var i = $('#chatInput'); if (i) i.focus();
  }
  function sendMsg(to, text) {
    if (blocked(me.id, to)) { toast('You cannot message a blocked user.'); return; }
    var myId = me.id, k = tkey(myId, to);
    (state.threads[k] = state.threads[k] || []).push({ from: myId, text: text, time: Date.now() });
    if (isAccount(to)) {
      state.unread[to + '|' + myId] = (state.unread[to + '|' + myId] || 0) + 1;
      save(); renderChat();
      return;
    }
    save(); renderChat();
    if (!state.settings.demoReplies) return;
    setTimeout(function () {
      if (!user(to) || blocked(myId, to)) return;
      (state.threads[k] = state.threads[k] || []).push({ from: to, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: Date.now() });
      if (!(currentSessionUser() === myId && chatWith === to)) state.unread[myId + '|' + to] = (state.unread[myId + '|' + to] || 0) + 1;
      save();
      if (currentSessionUser() === myId) { renderChat(); renderBadges(); renderRight(); if (openPanel === 'msgs') renderPanel(); }
    }, 1500 + Math.random() * 1500);
  }

  /* ---------- Simulations ---------- */
  function softRender() {
    if (!me) return;
    var a = document.activeElement, main = $('#main');
    if (a && main.contains(a) && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') && a.value) {
      renderBadges(); renderRight(); renderLeft(); if (openPanel) renderPanel();
      return;
    }
    render();
  }
  function simulateReaction(postId) {
    if (!state.settings.demoReplies) return;
    var myId = me.id;
    var fr = friendsOf(myId).filter(function (id) { return !isAccount(id); });
    if (!fr.length) return;
    setTimeout(function () {
      var p = findPost(postId); if (!p) return;
      var f = fr[Math.floor(Math.random() * fr.length)];
      if (blocked(myId, f)) return;
      if (p.likes.indexOf(f) >= 0) return;
      p.likes.push(f);
      notify(myId, user(f).name + ' liked your post.', '#/profile/' + myId);
      save();
      if (currentSessionUser() === myId) softRender();
    }, 2500 + Math.random() * 2500);
  }
  function simulateAccept(to) {
    var myId = me.id;
    if (isAccount(to) || !state.settings.demoReplies) return;
    setTimeout(function () {
      if (!req(myId, to) || blocked(myId, to)) return;
      addFriendship(myId, to);
      notify(myId, user(to).name + ' accepted your friend request.', '#/profile/' + to);
      save();
      if (currentSessionUser() === myId) softRender();
    }, 2500 + Math.random() * 2000);
  }

  /* ---------- Main render ---------- */
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var p = h.split('/');
    return { name: p[0] || 'feed', id: p[1] ? decodeURIComponent(p[1]) : null };
  }
  function render() {
    var sessUser = currentSessionUser();
    if (!sessUser || !user(sessUser)) {
      me = null; chatWith = null;
      $('#app').hidden = true; $('#auth').hidden = false;
      renderAuth();
      return;
    }
    me = user(sessUser);
    $('#auth').hidden = true; $('#app').hidden = false;
    var r = parse(), html;
    $$('.navtabs a').forEach(function (a) {
      var t = a.getAttribute('data-tab');
      var on = t === r.name || (r.name === 'group' && t === 'groups');
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#btnMe').innerHTML = avatar(me, 'sm');
    switch (r.name) {
      case 'feed': html = feedView(); break;
      case 'friends': html = friendsView(); break;
      case 'groups': html = groupsView(); break;
      case 'group': html = groupView(r.id); break;
      case 'events': html = eventsView(); break;
      case 'settings': html = settingsView(); break;
      case 'profile': html = profileView(r.id || me.id); break;
      default: html = notFound();
    }
    $('#main').innerHTML = html;
    var cn = $('#cpNew'); if (cn) cn.addEventListener('input', function () {
      var m = $('#cpMeter'); if (m) { var s = passStrength(cn.value); m.className = 'meter s' + s; m.querySelector('span').style.width = (s * 25) + '%'; }
    });
    renderBadges(); renderLeft(); renderRight(); renderChat();
    if (openPanel) renderPanel();
  }

  /* ---------- Search (block-aware) ---------- */
  function runSearch() {
    var box = $('#searchResults'), q = $('#q').value.trim().toLowerCase();
    if (!q || !me) { box.hidden = true; box.innerHTML = ''; return; }
    var people = state.users.filter(function (u) { return visible(u.id) && u.name.toLowerCase().indexOf(q) >= 0; }).slice(0, 5);
    var groups = state.groups.filter(function (g) { return g.name.toLowerCase().indexOf(q) >= 0; }).slice(0, 4);
    var gids = state.groups.filter(function (g) { return g.members.indexOf(me.id) >= 0; }).map(function (g) { return g.id; });
    var posts = state.posts.filter(function (p) {
      return visible(p.author) && p.text.toLowerCase().indexOf(q) >= 0 && (!p.group || gids.indexOf(p.group) >= 0);
    }).sort(sortTime).slice(0, 5);
    var html = '';
    if (people.length) html += '<h3>People</h3>' + people.map(function (u) {
      return '<a class="item" href="#/profile/' + esc(u.id) + '">' + avatar(u, 'sm') + '<span class="grow"><span>' + esc(u.name) + '</span>' +
        (u.id !== me.id && isFriend(me.id, u.id) ? '<span class="muted small">Friend</span>' : '') + '</span></a>';
    }).join('');
    if (groups.length) html += '<h3>Groups</h3>' + groups.map(function (g) {
      return '<a class="item" href="#/group/' + esc(g.id) + '">' + gicon(g) + '<span class="grow"><span>' + esc(g.name) + '</span></span></a>';
    }).join('');
    if (posts.length) html += '<h3>Posts</h3>' + posts.map(function (p) {
      var a = user(p.author) || { id: '', name: 'Unknown', color: '#888' };
      var href = p.group ? '#/group/' + p.group : '#/profile/' + a.id;
      return '<a class="item" href="' + esc(href) + '">' + avatar(a, 'sm') + '<span class="grow"><span class="name">' + esc(a.name) + '</span><span class="muted small">' + esc(p.text) + '</span></span></a>';
    }).join('');
    box.innerHTML = html || '<p class="muted center">No results for “' + esc(q) + '”.</p>';
    box.hidden = false;
  }
  function closeSearch() { $('#searchResults').hidden = true; }

  /* ---------- Reporting ---------- */
  function fileReport(kind, ref) {
    var reason = prompt('Why are you reporting this ' + kind + '? (e.g. spam, abuse)');
    if (reason == null) return;
    reason = reason.trim(); if (!reason) return;
    var details = prompt('Optional details (leave blank to skip):') || '';
    state.reports.push({ id: uid('r'), by: me.id, kind: kind, ref: ref, reason: reason, details: details.trim(), status: 'open', time: Date.now() });
    save(); toast('Report sent to moderators.');
    render();
  }
  function resolveReport(id, action) {
    var r = state.reports.find(function (x) { return x.id === id; });
    if (!r) return;
    if (action === 'remove') {
      r.status = 'removed';
      if (r.kind === 'post') { state.posts = state.posts.filter(function (p) { return p.id !== r.ref.post; }); }
      else if (r.kind === 'comment') {
        var p = findPost(r.ref.post);
        if (p) p.comments = p.comments.filter(function (c) { return c.id !== r.ref.comment; });
      }
      notify(r.by, 'Your report was reviewed: content removed.', '#/settings');
    } else if (action === 'warn') {
      r.status = 'warned';
      var target = r.ref.user;
      if (target && isAccount(target)) notify(target, 'A moderator warned you about reported content.', '#/feed');
      notify(r.by, 'Your report was reviewed: the user was warned.', '#/settings');
    } else {
      r.status = 'dismissed';
      notify(r.by, 'Your report was reviewed and dismissed.', '#/settings');
    }
    save(); render(); toast('Report resolved.');
  }

  /* ---------- Export / Import ---------- */
  function doExport(passphrase) {
    var payload = { porchlight: 'plain', v: 2, exported: Date.now(), state: state };
    var done = function (obj, nameTag) {
      var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'porchlight-' + nameTag + '-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
      toast('Data exported.');
    };
    if (passphrase) {
      if (!cryptoOK) { toast('Encryption not available in this browser.'); return; }
      encryptJSON(payload, passphrase).then(function (pkg) { done(pkg, 'encrypted'); })
        .catch(function () { toast('Export failed.'); });
    } else {
      done(payload, 'data');
    }
  }
  function doImport(file, passphrase, replace) {
    var err = $('#impErr'); if (err) err.textContent = '';
    var reader = new FileReader();
    reader.onload = function () {
      var pkg;
      try { pkg = JSON.parse(reader.result); } catch (e) { if (err) err.textContent = 'Not a valid JSON file.'; return; }
      var finish = function (payload) {
        if (!payload || !payload.state) { if (err) err.textContent = 'This file does not contain Porchlight data.'; return; }
        var incoming = payload.state;
        if (replace) {
          state = incoming;
        } else {
          mergeState(incoming);
        }
        migrate();
        save();
        toast('Import complete.');
        location.hash = '#/feed';
        render();
      };
      if (pkg.porchlight === 'encrypted') {
        if (!passphrase) { if (err) err.textContent = 'This file is encrypted. Enter the passphrase.'; return; }
        if (!cryptoOK) { if (err) err.textContent = 'Decryption not available in this browser.'; return; }
        decryptJSON(pkg, passphrase).then(finish).catch(function () {
          if (err) err.textContent = 'Wrong passphrase or corrupt file. Nothing was changed.';
        });
      } else {
        finish(pkg);
      }
    };
    reader.onerror = function () { if (err) err.textContent = 'Could not read the file.'; };
    reader.readAsText(file);
  }
  function mergeState(inc) {
    var byId = function (arr, item, key) { return arr.some(function (x) { return x[key] === item[key]; }); };
    (inc.users || []).forEach(function (u) { if (!byId(state.users, u, 'id')) state.users.push(u); });
    (inc.accounts || []).forEach(function (a) { if (!state.accounts.some(function (x) { return x.email === a.email; })) state.accounts.push(a); });
    (inc.posts || []).forEach(function (p) { if (!byId(state.posts, p, 'id')) state.posts.push(p); });
    (inc.groups || []).forEach(function (g) { if (!byId(state.groups, g, 'id')) state.groups.push(g); });
    (inc.events || []).forEach(function (e) { if (!byId(state.events, e, 'id')) state.events.push(e); });
    (inc.friends || []).forEach(function (f) { if (!isFriend(f[0], f[1])) state.friends.push(f); });
    (inc.blocks || []).forEach(function (b) { if (!state.blocks.some(function (x) { return x.by === b.by && x.who === b.who; })) state.blocks.push(b); });
    (inc.reports || []).forEach(function (r) { if (!byId(state.reports, r, 'id')) state.reports.push(r); });
    Object.keys(inc.threads || {}).forEach(function (k) { if (!state.threads[k]) state.threads[k] = inc.threads[k]; });
    state.seq = Math.max(state.seq, inc.seq || 0);
  }

  /* ---------- Password: login with lockout ---------- */
  function attemptLogin(email, pw) {
    var acc = state.accounts.find(function (a) { return a.email === email; });
    if (!acc || !user(acc.userId)) { authErr('Email or password is incorrect.'); return; }
    if (acc.needsPassword || acc.pass == null) {
      // must set a password — treat the entered password as the new one if >= 8
      if (pw.length < 8) { authErr('This account needs a password (8+ characters). Enter one to set it now.'); return; }
      hashPassword(pw).then(function (h) {
        acc.pass = h; acc.needsPassword = false; acc.fails = 0; save();
        signIn(acc.userId); toast('Password set and signed in.');
      });
      return;
    }
    var now = Date.now();
    if (acc.lockUntil && acc.lockUntil > now) {
      var secs = Math.ceil((acc.lockUntil - now) / 1000);
      authErr('Too many attempts. Locked for ' + secs + 's.');
      return;
    }
    verifyPassword(pw, acc.pass).then(function (ok) {
      if (ok) {
        acc.fails = 0; acc.lockUntil = 0; save();
        signIn(acc.userId);
      } else {
        acc.fails = (acc.fails || 0) + 1;
        if (acc.fails >= 5) {
          var extra = Math.min((acc.fails - 5), 5); // growing delay
          acc.lockUntil = Date.now() + (60 + extra * 30) * 1000;
          save();
          authErr('Too many attempts. Account locked for ' + Math.ceil((acc.lockUntil - Date.now()) / 1000) + 's.');
        } else {
          save();
          authErr('Email or password is incorrect. ' + (5 - acc.fails) + ' attempts left.');
        }
      }
    });
  }

  /* ---------- Actions ---------- */
  function handleAction(act, id, el) {
    var p, e, g;
    switch (act) {
      case 'authmode': authMode = id; renderAuth(); var f = $('#auth input'); if (f) f.focus(); return;
      case 'demo':
        var acc = state.accounts.find(function (a) { return a.email === 'demo@porchlight.local'; });
        if (!acc || !user(acc.userId)) {
          createAccount('Alex Rivera', 'demo@porchlight.local', DEMO_PASS, function (u) { signIn(u.id); toast('Signed in as demo user'); });
          return;
        }
        signIn(acc.userId); toast('Signed in as demo user'); return;
      case 'feedmode':
        feedMode = id; store(FKEY, feedMode); render(); return;
      case 'why':
        p = findPost(id); if (p) alert(whyText(p)); return;
      case 'like':
        p = findPost(id); if (!p) return;
        var i = p.likes.indexOf(me.id);
        if (i >= 0) p.likes.splice(i, 1); else p.likes.push(me.id);
        save(); render(); var lb = $('[data-act="like"][data-id="' + id + '"]'); if (lb) lb.focus(); return;
      case 'delpost':
        if (!confirm('Delete this post?')) return;
        state.posts = state.posts.filter(function (x) { return x.id !== id; }); save(); render(); toast('Post deleted'); return;
      case 'adminremovepost':
        if (!confirm('Remove this post as admin?')) return;
        state.posts = state.posts.filter(function (x) { return x.id !== id; }); save(); render(); toast('Post removed'); return;
      case 'delcomment':
        p = findPost(id); if (!p) return;
        var cid = el.getAttribute('data-cid');
        p.comments = p.comments.filter(function (c) { return c.id !== cid; }); save(); render(); return;
      case 'reportpost':
        p = findPost(id); if (!p) return;
        fileReport('post', { post: id, user: p.author }); return;
      case 'reportcomment':
        p = findPost(id); if (!p) return;
        var rc = el.getAttribute('data-cid');
        var cc = p.comments.find(function (c) { return c.id === rc; });
        fileReport('comment', { post: id, comment: rc, user: cc ? cc.author : null }); return;
      case 'reportprofile':
        fileReport('profile', { user: id }); return;
      case 'blockask':
        if (!confirm('Block ' + (user(id) ? user(id).name : 'this user') + '? They disappear from your feed, search, chat and more.')) return;
        blockUser(id); save(); render(); toast('User blocked'); return;
      case 'unblock':
        unblockUser(id); save(); render(); toast('User unblocked'); return;
      case 'focuscomment': var ci = document.getElementById('c-' + id); if (ci) ci.focus(); return;
      case 'addfriend':
        if (blocked(me.id, id)) return;
        if (isFriend(me.id, id) || req(me.id, id)) return;
        if (req(id, me.id)) { addFriendship(me.id, id); save(); render(); toast('You are now friends'); return; }
        state.requests.push({ from: me.id, to: id, time: Date.now() });
        if (isAccount(id)) notify(id, me.name + ' sent you a friend request.', '#/friends');
        save(); render(); toast('Friend request sent'); simulateAccept(id); return;
      case 'cancelreq': removeReq(me.id, id); save(); render(); return;
      case 'accept':
        addFriendship(me.id, id);
        notify(id, me.name + ' accepted your friend request.', '#/profile/' + me.id);
        save(); render(); toast('You and ' + first(user(id)) + ' are now friends'); return;
      case 'decline': removeReq(id, me.id); save(); render(); return;
      case 'unfriend':
        if (!confirm('Remove ' + user(id).name + ' from your friends?')) return;
        state.friends = state.friends.filter(function (f) { return !((f[0] === me.id && f[1] === id) || (f[1] === me.id && f[0] === id)); });
        save(); render(); return;
      case 'chat': openChat(id); return;
      case 'openmsgs': togglePanel('msgs'); return;
      case 'closechat': chatWith = null; renderChat(); return;
      case 'join':
        g = group(id); if (!g) return;
        if (g.members.indexOf(me.id) < 0) g.members.push(me.id);
        save(); render(); toast('Joined ' + g.name); return;
      case 'leave':
        g = group(id); if (!g) return;
        g.members = g.members.filter(function (m) { return m !== me.id; });
        save(); render(); toast('Left ' + g.name); return;
      case 'going':
      case 'interested':
        e = findEvent(id); if (!e) return;
        var list = e[act], other = act === 'going' ? e.interested : e.going;
        var k = list.indexOf(me.id);
        if (k >= 0) list.splice(k, 1);
        else { list.push(me.id); var o = other.indexOf(me.id); if (o >= 0) other.splice(o, 1); }
        save(); render(); var eb = $('[data-act="' + act + '"][data-id="' + id + '"]'); if (eb) eb.focus(); return;
      case 'delevent':
        if (!confirm('Delete this event?')) return;
        state.events = state.events.filter(function (x) { return x.id !== id; }); save(); render(); return;
      case 'editprofile': editingProfile = true; render(); var pn = $('[data-form="profile"] input'); if (pn) pn.focus(); return;
      case 'canceledit': editingProfile = false; render(); return;
      case 'theme': toggleTheme(); return;
      case 'toggledemo':
        state.settings.demoReplies = !state.settings.demoReplies; save(); render(); toast('Demo auto-replies ' + (state.settings.demoReplies ? 'on' : 'off')); return;
      case 'logouteverywhere':
        state.sessionToken = 't' + Date.now();
        state.session = null;
        try { sessionStorage.removeItem('porchlight.tabuser'); } catch (ex) {}
        chatWith = null; closePanel(); save();
        render(); toast('Logged out everywhere'); return;
      case 'modremove': resolveReport(id, 'remove'); return;
      case 'modwarn': resolveReport(id, 'warn'); return;
      case 'moddismiss': resolveReport(id, 'dismiss'); return;
      case 'clearnotifs':
        state.notifs = state.notifs.filter(function (n) { return n.to !== me.id; }); save(); renderPanel(); renderBadges(); return;
      case 'logout':
        state.session = null;
        try { sessionStorage.removeItem('porchlight.tabuser'); } catch (ex2) {}
        chatWith = null; editingProfile = false;
        closePanel(); closeSearch(); $('#q').value = '';
        save(); authMode = 'login'; render(); toast('Logged out');
        return;
    }
  }

  function handleSubmit(form) {
    var type = form.getAttribute('data-form');
    var fd = function (n) { var el = form.elements[n]; return el ? String(el.value || '') : ''; };
    var text, p;
    switch (type) {
      case 'login': {
        var em = fd('email').trim().toLowerCase(), pw = fd('pass');
        if (!em || !pw) { authErr('Please enter your email and password.'); return; }
        attemptLogin(em, pw); return;
      }
      case 'signup': {
        var nm = fd('name').trim(), em2 = fd('email').trim().toLowerCase(), pw2 = fd('pass');
        if (!nm) { authErr('Please enter your name.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em2)) { authErr('Please enter a valid email.'); return; }
        if (pw2.length < 8) { authErr('Password must be at least 8 characters.'); return; }
        if (state.accounts.some(function (a) { return a.email === em2; })) { authErr('An account with that email already exists.'); return; }
        createAccount(nm, em2, pw2, function (u) { signIn(u.id); toast('Welcome to Porchlight, ' + first(u) + '!'); });
        return;
      }
      case 'changepass': {
        var acc = account(me.id), err = $('#cpErr');
        var np = fd('np');
        if (np.length < 8) { if (err) err.textContent = 'New password must be at least 8 characters.'; return; }
        var apply = function () {
          hashPassword(np).then(function (h) {
            acc.pass = h; acc.needsPassword = false; acc.fails = 0; acc.lockUntil = 0;
            save(); toast('Password changed.');
            location.hash = '#/settings'; render();
          });
        };
        if (acc.needsPassword || acc.pass == null) { apply(); return; }
        var cur = fd('cur');
        verifyPassword(cur, acc.pass).then(function (ok) {
          if (!ok) { if (err) err.textContent = 'Current password is incorrect.'; return; }
          apply();
        });
        return;
      }
      case 'export': { doExport(fd('pass')); return; }
      case 'import': {
        var fileEl = form.elements.file;
        if (!fileEl || !fileEl.files || !fileEl.files[0]) { var ie = $('#impErr'); if (ie) ie.textContent = 'Choose a file first.'; return; }
        doImport(fileEl.files[0], fd('pass'), form.elements.replace && form.elements.replace.checked);
        return;
      }
      case 'post': {
        text = fd('text').trim();
        if (!text) { var ta = form.elements.text; if (ta) ta.focus(); return; }
        var gid = form.getAttribute('data-group') || null;
        if (gid && !group(gid)) gid = null;
        var newp = { id: uid('p'), author: me.id, text: text, time: Date.now(), likes: [], comments: [], group: gid };
        state.posts.push(newp);
        save(); render(); toast('Posted'); simulateReaction(newp.id); return;
      }
      case 'comment': {
        var pid = form.getAttribute('data-id');
        p = findPost(pid); if (!p) return;
        text = fd('text').trim(); if (!text) return;
        p.comments.push({ id: uid('c'), author: me.id, text: text, time: Date.now() });
        if (p.author !== me.id && isAccount(p.author) && !blocked(me.id, p.author)) notify(p.author, me.name + ' commented on your post.', '#/profile/' + p.author);
        save(); render();
        var ci = document.getElementById('c-' + pid); if (ci) ci.focus();
        return;
      }
      case 'profile': {
        var n2 = fd('name').trim();
        if (!n2) { toast('Name is required'); return; }
        me.name = n2; me.city = fd('city').trim(); me.bio = fd('bio').trim();
        editingProfile = false; save(); render(); toast('Profile updated'); return;
      }
      case 'group': {
        var gn = fd('name').trim();
        if (!gn) { var gi = form.elements.name; if (gi) gi.focus(); return; }
        var ng = { id: uid('g'), name: gn, desc: fd('desc').trim(), members: [me.id], color: COLORS[Math.floor(Math.random() * COLORS.length)] };
        state.groups.push(ng); save(); toast('Group created');
        location.hash = '#/group/' + ng.id;
        return;
      }
      case 'event': {
        var title = fd('title').trim(), when = new Date(fd('when')).getTime();
        var errEl = $('#eventErr');
        if (!title) { if (errEl) errEl.textContent = 'Please add a title.'; return; }
        if (!when || isNaN(when)) { if (errEl) errEl.textContent = 'Please choose a date and time.'; return; }
        state.events.push({ id: uid('e'), title: title, when: when, place: fd('place').trim(), desc: fd('desc').trim(), host: me.id, going: [me.id], interested: [] });
        save(); render(); toast('Event created'); return;
      }
      case 'chat': {
        if (!chatWith) return;
        var inp = form.elements.text;
        text = fd('text').trim(); if (!text) return;
        inp.value = '';
        sendMsg(chatWith, text);
        var ci2 = $('#chatInput'); if (ci2) ci2.focus();
        return;
      }
    }
  }

  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    if (!form || !form.getAttribute || !form.getAttribute('data-form')) return;
    ev.preventDefault();
    handleSubmit(form);
  });

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!(t instanceof Element)) return;
    var panelBtn = t.closest('[data-panel-btn]');
    if (panelBtn) { closeSearch(); togglePanel(panelBtn.getAttribute('data-panel-btn')); return; }
    if (t.closest('#btnTheme')) { toggleTheme(); return; }
    var actEl = t.closest('[data-act]');
    if (actEl) {
      handleAction(actEl.getAttribute('data-act'), actEl.getAttribute('data-id'), actEl);
      return;
    }
    var link = t.closest('a[href^="#"]');
    if (link) {
      if (link.closest('#panel')) closePanel();
      if (link.closest('#searchResults')) { closeSearch(); $('#q').value = ''; }
    }
    if (openPanel && !t.closest('#panel')) closePanel();
    if (!t.closest('.search')) closeSearch();
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      if (openPanel) {
        var btn = $('[data-panel-btn="' + openPanel + '"]');
        closePanel(); if (btn) btn.focus();
      }
      if (!$('#searchResults').hidden) closeSearch();
    }
  });

  var q = $('#q');
  q.addEventListener('input', runSearch);
  q.addEventListener('focus', function () { if (q.value.trim()) runSearch(); });

  window.addEventListener('hashchange', function () {
    editingProfile = false;
    closePanel(); closeSearch();
    render();
    window.scrollTo(0, 0);
    var m = $('#main'); if (m && me) m.focus({ preventScroll: true });
  });

  // Cross-tab live sync: storage event + BroadcastChannel
  function reloadFromStorage() {
    var curSess = currentSessionUser();
    load();
    // keep per-tab session user
    if (curSess && user(curSess)) { /* session preserved via sessionStorage */ }
    render();
  }
  window.addEventListener('storage', function (ev) {
    if (ev.key === KEY) { reloadFromStorage(); }
    else if (ev.key === TKEY) applyTheme();
  });
  if (window.BroadcastChannel) {
    try {
      bc = new BroadcastChannel('porchlight');
      bc.onmessage = function (ev) {
        if (ev.data && ev.data.t === 'sync' && ev.data.from !== tabId) reloadFromStorage();
      };
    } catch (e) { bc = null; }
  }

  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onMq = function () { if (!read(TKEY)) applyTheme(); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------- Init ---------- */
  load();
  applyTheme();
  applyIcons();
  render();
})();
