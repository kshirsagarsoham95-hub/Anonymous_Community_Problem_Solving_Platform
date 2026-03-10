// ════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const LS = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  del(k) { localStorage.removeItem(k); }
};

// ════════════════════════════════════════
// TOAST
// ════════════════════════════════════════
function toast(msg, type = 'info') {
  let w = $('.toast-wrap');
  if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); }
  const icons = { success: '✅', error: '❌', info: '💡' };
  const el = document.createElement('div');
  el.className = `toast t-${type}`;
  el.innerHTML = `<span>${icons[type] || '💡'}</span><span>${msg}</span>`;
  w.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.35s ease forwards';
    setTimeout(() => el.remove(), 350);
  }, 3000);
}

// ════════════════════════════════════════
// NAME GENERATOR
// ════════════════════════════════════════
const ADJ = ['Silent','Hidden','Mystic','Shadow','Cosmic','Neon','Phantom','Velvet','Crystal','Brave','Gentle','Wild','Calm','Bright','Lunar','Ember','Frost','Storm','Dream','Noble'];
const NOUN = ['Phoenix','Wolf','Eagle','Tiger','Panda','Fox','Owl','Lion','Bear','Hawk','Dragon','Raven','Falcon','Lynx','Cobra','Sparrow','Panther','Orca','Viper','Stag'];

function randomName() {
  return ADJ[Math.floor(Math.random() * ADJ.length)] + NOUN[Math.floor(Math.random() * NOUN.length)] + Math.floor(Math.random() * 999);
}

// ════════════════════════════════════════
// TIME AGO
// ════════════════════════════════════════
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ════════════════════════════════════════
// AVATAR COLOR PICKER
// ════════════════════════════════════════
const AV_COLORS = ['av-teal','av-amber','av-coral','av-sky','av-pink'];
function pickAv(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}

// ════════════════════════════════════════
// AUTH GUARDS
// ════════════════════════════════════════
function guardAuth() {
  if (!LS.get('anon_user')) { window.location.href = 'index.html'; return null; }
  return LS.get('anon_user');
}

function guardUsername() {
  if (!LS.get('anon_username')) { window.location.href = 'username.html'; return null; }
  return LS.get('anon_username');
}

// ════════════════════════════════════════
// DROPDOWN SYSTEM
// ════════════════════════════════════════
function initDropdowns() {
  document.addEventListener('click', (e) => {
    $$('.dropdown').forEach(dd => {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
  });

  $$('.dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = trigger.closest('.dropdown');
      $$('.dropdown').forEach(d => { if (d !== dd) d.classList.remove('open'); });
      dd.classList.toggle('open');
    });
  });

  $$('.dropdown-item[data-action]').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      switch (action) {
        case 'dashboard':
          window.location.href = 'dashboard.html';
          break;
        case 'community':
          window.location.href = 'community.html';
          break;
        case 'change-name':
          LS.del('anon_username');
          window.location.href = 'username.html';
          break;
        case 'clear-posts':
          LS.del('anon_problems');
          toast('All posts cleared', 'info');
          setTimeout(() => location.reload(), 500);
          break;
        case 'logout':
          LS.del('anon_user');
          LS.del('anon_username');
          toast('Logged out', 'info');
          setTimeout(() => { window.location.href = 'index.html'; }, 500);
          break;
      }
    });
  });
}

// Populate dropdown & taskbar info
function populateDropdown() {
  const user = LS.get('anon_user');
  const uname = LS.get('anon_username');

  $$('.dd-username').forEach(el => { if (uname) el.textContent = uname; });
  $$('.dd-email').forEach(el => { if (user) el.textContent = user.email; });
  $$('.trigger-name').forEach(el => { if (uname) el.textContent = uname; });
  $$('.trigger-initial').forEach(el => {
    if (uname) el.textContent = uname.charAt(0).toUpperCase();
  });
}

// ════════════════════════════════════════
// CATEGORIES DROPDOWN
// ════════════════════════════════════════
function initCategoryDropdown() {
  const items = $$('.cat-dropdown-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.dataset.filter;
      activeFilter = filter;

      // Update active state
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update sidebar filter items too
      $$('.filter-item').forEach(f => {
        f.classList.toggle('active', f.dataset.filter === filter);
      });

      // Update dropdown label
      const label = $('.cat-label');
      if (label) {
        const emojiMap = { all: '🌐', urgent: '🔴', help: '🟡', discussion: '🔵', advice: '🟣', general: '⚪' };
        label.textContent = `${emojiMap[filter] || '🌐'} ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      }

      // Close dropdown
      item.closest('.dropdown')?.classList.remove('open');

      renderFeed();
    });
  });
}

// ════════════════════════════════════════
// TASKBAR
// ════════════════════════════════════════
function initTaskbar() {
  // Compose button opens modal
  const composeBtn = $('#tbCompose');
  const overlay = $('#composerModal');
  const closeBtn = $('#modalClose');

  if (composeBtn && overlay) {
    composeBtn.addEventListener('click', () => {
      overlay.classList.add('show');
    });
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.remove('show');
    });
  }

  // Taskbar nav items
  $$('.tb-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      window.location.href = item.dataset.page;
    });
  });
}

// ════════════════════════════════════════
// PAGE 1: AUTH
// ════════════════════════════════════════
function initAuth() {
  const lt = $('#tabLogin'), st = $('#tabSignup');
  const lf = $('#formLogin'), sf = $('#formSignup');
  if (!lt) return;

  if (LS.get('anon_user')) {
    window.location.href = LS.get('anon_username') ? 'community.html' : 'username.html';
    return;
  }

  lt.onclick = () => {
    lt.classList.add('active'); st.classList.remove('active');
    lf.classList.remove('hidden'); sf.classList.add('hidden');
  };
  st.onclick = () => {
    st.classList.add('active'); lt.classList.remove('active');
    sf.classList.remove('hidden'); lf.classList.add('hidden');
  };

  lf.onsubmit = (e) => {
    e.preventDefault();
    const email = $('#lEmail').value.trim();
    const pass = $('#lPass').value.trim();
    if (!email || !pass) return toast('Fill all fields', 'error');
    const users = LS.get('anon_users') || [];
    const found = users.find(u => u.email === email && u.password === pass);
    if (!found) return toast('Invalid credentials', 'error');
    LS.set('anon_user', found);
    toast('Welcome back! 🎉', 'success');
    setTimeout(() => {
      window.location.href = LS.get('anon_username') ? 'community.html' : 'username.html';
    }, 700);
  };

  sf.onsubmit = (e) => {
    e.preventDefault();
    const email = $('#sEmail').value.trim();
    const pass = $('#sPass').value.trim();
    const conf = $('#sConfirm').value.trim();
    if (!email || !pass || !conf) return toast('Fill all fields', 'error');
    if (pass.length < 6) return toast('Password: 6+ chars', 'error');
    if (pass !== conf) return toast('Passwords don\'t match', 'error');
    const users = LS.get('anon_users') || [];
    if (users.find(u => u.email === email)) return toast('Email taken', 'error');
    const nu = { id: Date.now(), email, password: pass, created: new Date().toISOString() };
    users.push(nu);
    LS.set('anon_users', users);
    LS.set('anon_user', nu);
    toast('Account created! 🚀', 'success');
    setTimeout(() => { window.location.href = 'username.html'; }, 700);
  };
}

// ════════════════════════════════════════
// PAGE 2: USERNAME
// ════════════════════════════════════════
function initUsername() {
  const badge = $('#genBadge'), genBtn = $('#genBtn'), cin = $('#customName'), saveBtn = $('#saveName');
  if (!badge) return;
  if (!guardAuth()) return;
  if (LS.get('anon_username')) { window.location.href = 'dashboard.html'; return; }

  let cur = randomName();
  badge.textContent = cur;

  genBtn.onclick = () => {
    cur = randomName();
    badge.textContent = cur;
    badge.classList.remove('pop');
    void badge.offsetWidth;
    badge.classList.add('pop');
  };

  saveBtn.onclick = () => {
    const custom = cin.value.trim();
    const final = custom || cur;
    if (final.length < 3) return toast('Min 3 characters', 'error');
    LS.set('anon_username', final);
    toast(`Identity: ${final} 🎭`, 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
  };
}

// ════════════════════════════════════════
// PAGE 3: DASHBOARD
// ════════════════════════════════════════
function initDashboard() {
  const heroName = $('#heroName');
  if (!heroName) return;
  const user = guardAuth(); if (!user) return;
  const uname = guardUsername(); if (!uname) return;

  heroName.textContent = uname;
  populateDropdown();

  const problems = LS.get('anon_problems') || [];
  const mine = problems.filter(p => p.authorId === user.id);
  const rc = problems.reduce((s, p) => s + (p.responses?.length || 0), 0);

  const ep = $('#statProblems'), er = $('#statResponses'), eh = $('#statHelped');
  if (ep) animNum(ep, mine.length);
  if (er) animNum(er, rc);
  if (eh) animNum(eh, Math.floor(Math.random() * 30) + mine.length);

  const go = $('#goBoard');
  if (go) go.onclick = () => { window.location.href = 'community.html'; };

  initTaskbar();
}

function animNum(el, target) {
  let cur = 0;
  const step = Math.max(1, Math.floor(target / 25));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = cur;
  }, 35);
}

// ════════════════════════════════════════
// PAGE 4: COMMUNITY
// ════════════════════════════════════════
let activeFilter = 'all';
let isAnon = true;

function initCommunity() {
  const feed = $('#feed');
  if (!feed) return;
  const user = guardAuth(); if (!user) return;
  const uname = guardUsername(); if (!uname) return;

  populateDropdown();

  if (!LS.get('anon_problems')) LS.set('anon_problems', seedData());

  renderFeed();
  initModalComposer(user, uname);
  initFilters();
  initCategoryDropdown();
  initTaskbar();

  const tog = $('#anonToggle');
  if (tog) { tog.checked = true; tog.onchange = () => { isAnon = tog.checked; }; }
}

function initModalComposer(user, uname) {
  const chips = $$('.modal-glass .tag-chip');
  let selTag = 'general';

  chips.forEach(c => {
    c.onclick = () => {
      chips.forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      selTag = c.dataset.tag;
    };
  });

  const pb = $('#modalPostBtn');
  if (pb) {
    pb.onclick = () => {
      const title = $('#mTitle').value.trim();
      const body = $('#mBody').value.trim();
      if (!title || !body) return toast('Title & description needed', 'error');

      const tog = $('#mAnonToggle');
      const anon = tog ? tog.checked : true;

      const prob = {
        id: Date.now(), title, body, tag: selTag,
        authorId: user.id,
        authorName: anon ? randomName() : uname,
        isAnonymous: anon,
        likes: 0, likedBy: [], responses: [],
        created: new Date().toISOString()
      };

      const all = LS.get('anon_problems') || [];
      all.unshift(prob);
      LS.set('anon_problems', all);
      $('#mTitle').value = '';
      $('#mBody').value = '';
      chips.forEach(x => x.classList.remove('active'));
      selTag = 'general';

      // Close modal
      const overlay = $('#composerModal');
      if (overlay) overlay.classList.remove('show');

      toast('Posted anonymously 🎭', 'success');
      renderFeed();
    };
  }
}

function initFilters() {
  $$('.filter-item').forEach(btn => {
    btn.onclick = () => {
      $$('.filter-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;

      // Also update category dropdown active
      $$('.cat-dropdown-item').forEach(i => {
        i.classList.toggle('active', i.dataset.filter === activeFilter);
      });

      // Update label
      const label = $('.cat-label');
      if (label) {
        const emojiMap = { all: '🌐', urgent: '🔴', help: '🟡', discussion: '🔵', advice: '🟣', general: '⚪' };
        label.textContent = `${emojiMap[activeFilter] || '🌐'} ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`;
      }

      renderFeed();
    };
  });
}

function renderFeed() {
  const feed = $('#feed');
  if (!feed) return;

  let problems = LS.get('anon_problems') || [];

  // Counts
  const counts = { all: problems.length, urgent: 0, help: 0, discussion: 0, advice: 0, general: 0 };
  problems.forEach(p => { if (counts[p.tag] !== undefined) counts[p.tag]++; });
  $$('.filter-item').forEach(f => {
    const c = f.querySelector('.f-count');
    if (c) c.textContent = counts[f.dataset.filter] ?? '';
  });
  // Also update category dropdown counts
  $$('.cat-dropdown-item').forEach(f => {
    const c = f.querySelector('.f-count');
    if (c) c.textContent = counts[f.dataset.filter] ?? '';
  });

  if (activeFilter !== 'all') problems = problems.filter(p => p.tag === activeFilter);

  if (!problems.length) {
    feed.innerHTML = `<div class="empty"><div class="empty-icon">🌌</div><h3>Nothing here yet</h3><p>Be the first to share anonymously.</p></div>`;
    return;
  }

  feed.innerHTML = problems.map(p => buildPost(p)).join('');
  bindPostEvents();
}

function buildPost(p) {
  const av = pickAv(p.authorName);
  const init = p.authorName.charAt(0).toUpperCase();
  const user = LS.get('anon_user');
  const liked = (p.likedBy || []).includes(user?.id);
  const tm = { urgent:'t-urgent', help:'t-help', discussion:'t-discussion', advice:'t-advice', general:'t-general' };

  const resps = (p.responses || []).map(r => `
    <div class="resp-item">
      <div class="resp-av">${r.authorName.charAt(0).toUpperCase()}</div>
      <div>
        <div class="resp-name">${r.authorName} <span>· ${timeAgo(r.created)}</span></div>
        <div class="resp-text">${r.text}</div>
      </div>
    </div>`).join('');

  return `
    <div class="post-glass glass-static" data-id="${p.id}">
      <div class="post-top">
        <div class="post-user">
          <div class="post-avatar ${av}">${init}</div>
          <div>
            <div class="post-name">${p.authorName}</div>
            <div class="post-time">${timeAgo(p.created)}</div>
          </div>
        </div>
        <span class="post-tag ${tm[p.tag] || 't-general'}">${p.tag}</span>
      </div>
      <div class="post-title">${p.title}</div>
      <div class="post-body">${p.body}</div>
      <div class="post-actions">
        <button class="act-btn like-btn ${liked?'liked':''}" data-id="${p.id}">${liked?'❤️':'🤍'} ${p.likes||0}</button>
        <button class="act-btn reply-toggle" data-id="${p.id}">💬 ${p.responses?.length||0} replies</button>
        <button class="act-btn share-btn">🔗 Share</button>
      </div>
      <div class="responses-wrap hidden" id="rw-${p.id}">
        ${resps}
        <div class="resp-input-row">
          <input class="field-input field-input--plain" placeholder="Write a kind response…" id="ri-${p.id}">
          <button class="btn btn-amber btn-sm send-resp" data-id="${p.id}">Send</button>
        </div>
      </div>
    </div>`;
}

function bindPostEvents() {
  $$('.like-btn').forEach(b => {
    b.onclick = () => {
      const id = +b.dataset.id;
      const user = LS.get('anon_user');
      const all = LS.get('anon_problems') || [];
      const p = all.find(x => x.id === id);
      if (!p) return;
      if (!p.likedBy) p.likedBy = [];
      const idx = p.likedBy.indexOf(user.id);
      if (idx > -1) { p.likedBy.splice(idx, 1); p.likes = Math.max(0, (p.likes||0)-1); }
      else { p.likedBy.push(user.id); p.likes = (p.likes||0)+1; }
      LS.set('anon_problems', all);
      renderFeed();
    };
  });

  $$('.reply-toggle').forEach(b => {
    b.onclick = () => { const w = $(`#rw-${b.dataset.id}`); if (w) w.classList.toggle('hidden'); };
  });

  $$('.send-resp').forEach(b => {
    b.onclick = () => {
      const id = +b.dataset.id;
      const input = $(`#ri-${id}`);
      const text = input?.value.trim();
      if (!text) return toast('Write something', 'error');
      const uname = LS.get('anon_username');
      const all = LS.get('anon_problems') || [];
      const p = all.find(x => x.id === id);
      if (!p) return;
      if (!p.responses) p.responses = [];
      p.responses.push({ id: Date.now(), text, authorName: isAnon ? randomName() : uname, created: new Date().toISOString() });
      LS.set('anon_problems', all);
      toast('Reply sent 💬', 'success');
      renderFeed();
    };
  });

  $$('.share-btn').forEach(b => { b.onclick = () => toast('Link copied!', 'success'); });
}

// ════════════════════════════════════════
// SEED DATA
// ════════════════════════════════════════
function seedData() {
  return [
    {
      id: 1, title: 'Struggling with social anxiety at college',
      body: 'I just started college and find it really hard to talk to people. Every time I try to join a conversation, I freeze. Does anyone have tips?',
      tag: 'help', authorName: 'SilentPhoenix42', authorId: 0, isAnonymous: true,
      likes: 24, likedBy: [],
      responses: [
        { id: 101, text: 'Start small — say hi to one person a day. It builds up!', authorName: 'GentleOwl88', created: new Date(Date.now() - 3600000).toISOString() },
        { id: 102, text: 'Join a club around your interests. Common ground helps.', authorName: 'BraveFalcon55', created: new Date(Date.now() - 7200000).toISOString() }
      ],
      created: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2, title: 'How to deal with developer burnout?',
      body: "Been coding 10+ hours daily for months. The passion is gone. Everything feels like a chore. How do you recover?",
      tag: 'discussion', authorName: 'MysticWolf77', authorId: 0, isAnonymous: true,
      likes: 42, likedBy: [],
      responses: [
        { id: 201, text: 'Take a real break. Not a weekend — a full week off code.', authorName: 'CalmTiger23', created: new Date(Date.now() - 1800000).toISOString() }
      ],
      created: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 3, title: 'Family pressure about career choices',
      body: "Parents want me to be a doctor but I'm passionate about art. They say art won't pay bills. I feel stuck between my dream and family expectations.",
      tag: 'urgent', authorName: 'CosmicEagle19', authorId: 0, isAnonymous: true,
      likes: 67, likedBy: [], responses: [],
      created: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 4, title: 'Budgeting tips for students?',
      body: "Terrible with money. Always broke by mid-month. Need practical budgeting advice for someone with limited income.",
      tag: 'advice', authorName: 'NeonPanda66', authorId: 0, isAnonymous: true,
      likes: 15, likedBy: [],
      responses: [
        { id: 401, text: '50/30/20 rule: 50% needs, 30% wants, 20% savings. Track everything!', authorName: 'WildHawk44', created: new Date(Date.now() - 5400000).toISOString() }
      ],
      created: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 5, title: 'Feeling lost after graduation',
      body: "Graduated 3 months ago with no plan. Everyone seems sorted. I feel like I'm falling behind. Anyone else feel this?",
      tag: 'general', authorName: 'VelvetRaven31', authorId: 0, isAnonymous: true,
      likes: 33, likedBy: [],
      responses: [
        { id: 501, text: "Comparison is the thief of joy. Most people are just as lost.", authorName: 'FrostDragon12', created: new Date(Date.now() - 9000000).toISOString() },
        { id: 502, text: "There's no universal timeline for success. Be kind to yourself.", authorName: 'EmberSparrow99', created: new Date(Date.now() - 4500000).toISOString() }
      ],
      created: new Date(Date.now() - 432000000).toISOString()
    }
  ];
}

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  initDropdowns();

  switch (page) {
    case 'auth': initAuth(); break;
    case 'username': initUsername(); break;
    case 'dashboard': initDashboard(); break;
    case 'community': initCommunity(); break;
  }
});