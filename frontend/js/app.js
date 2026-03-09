
const API_BASE = 'http://localhost:8080/api';


const state = {
  user: null,
  username: null,
  problems: [],
  currentFilter: 'all',
  isAnonymous: true
};


function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function getFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return localStorage.getItem(key);
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeFromStorage(key) {
  localStorage.removeItem(key);
}


function showToast(message, type = 'info') {
  let container = $('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


const adjectives = ['Silent', 'Hidden', 'Mystic', 'Shadow', 'Cosmic', 'Neon', 'Phantom', 'Velvet', 'Crystal', 'Brave', 'Gentle', 'Wild', 'Calm', 'Bright', 'Dark'];
const nouns = ['Phoenix', 'Wolf', 'Eagle', 'Tiger', 'Panda', 'Fox', 'Owl', 'Lion', 'Bear', 'Hawk', 'Dragon', 'Raven', 'Falcon', 'Lynx', 'Cobra'];

function generateAnonymousName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
}


function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}


function initAuthPage() {
  const loginTab = $('#loginTab');
  const signupTab = $('#signupTab');
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');

  if (!loginTab) return;

  
  const existingUser = getFromStorage('anonymous_user');
  if (existingUser) {
    const hasUsername = getFromStorage('anonymous_username');
    if (hasUsername) {
      window.location.href = 'main.html';
    } else {
      window.location.href = 'dashboard.html';
    }
    return;
  }

  
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const password = $('#loginPassword').value.trim();

    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    
    const users = getFromStorage('anonymous_users') || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      saveToStorage('anonymous_user', user);
      showToast('Welcome back!', 'success');
      setTimeout(() => {
        const hasUsername = getFromStorage('anonymous_username');
        if (hasUsername) {
          window.location.href = 'main.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 800);
    } else {
      showToast('Invalid email or password', 'error');
    }
  });

  
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#signupEmail').value.trim();
    const password = $('#signupPassword').value.trim();
    const confirm = $('#signupConfirm').value.trim();

    if (!email || !password || !confirm) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    const users = getFromStorage('anonymous_users') || [];
    if (users.find(u => u.email === email)) {
      showToast('Email already registered', 'error');
      return;
    }

    const newUser = {
      id: Date.now(),
      email,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveToStorage('anonymous_users', users);
    saveToStorage('anonymous_user', newUser);

    showToast('Account created successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  });
}


function initDashboardPage() {
  const usernameSection = $('#usernameSection');
  const dashboardSection = $('#dashboardSection');

  if (!usernameSection) return;

  
  const user = getFromStorage('anonymous_user');
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const savedUsername = getFromStorage('anonymous_username');

  if (savedUsername) {
   
    usernameSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loadDashboard(savedUsername);
  } else {
    
    usernameSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    initUsernameCreation();
  }
}

function initUsernameCreation() {
  const generatedDisplay = $('#generatedName');
  const generateBtn = $('#generateBtn');
  const customInput = $('#customUsername');
  const saveBtn = $('#saveUsername');

 
  let currentName = generateAnonymousName();
  generatedDisplay.textContent = currentName;

  generateBtn.addEventListener('click', () => {
    currentName = generateAnonymousName();
    generatedDisplay.textContent = currentName;
    generatedDisplay.style.animation = 'none';
    generatedDisplay.offsetHeight; // trigger reflow
    generatedDisplay.style.animation = 'modalIn 0.3s ease';
  });

  saveBtn.addEventListener('click', () => {
    const custom = customInput.value.trim();
    const finalName = custom || currentName;

    if (finalName.length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return;
    }

    saveToStorage('anonymous_username', finalName);
    showToast(`Welcome, ${finalName}! 🎉`, 'success');

    setTimeout(() => {
      $('#usernameSection').classList.add('hidden');
      $('#dashboardSection').classList.remove('hidden');
      loadDashboard(finalName);
    }, 600);
  });
}

function loadDashboard(username) {
  const displayName = $('#displayUsername');
  const navUser = $('#navUsername');

  if (displayName) displayName.textContent = username;
  if (navUser) navUser.textContent = username;

  
  const problems = getFromStorage('anonymous_problems') || [];
  const userProblems = problems.filter(p => p.authorId === getFromStorage('anonymous_user')?.id);

  const totalProblems = $('#totalProblems');
  const totalResponses = $('#totalResponses');
  const totalHelped = $('#totalHelped');

  if (totalProblems) totalProblems.textContent = userProblems.length;
  if (totalResponses) {
    const count = problems.reduce((sum, p) => sum + (p.responses?.length || 0), 0);
    totalResponses.textContent = count;
  }
  if (totalHelped) totalHelped.textContent = Math.floor(Math.random() * 50);

  
  const goMainBtn = $('#goToMain');
  if (goMainBtn) {
    goMainBtn.addEventListener('click', () => {
      window.location.href = 'main.html';
    });
  }
}


function initMainPage() {
  const problemsList = $('#problemsList');

  if (!problemsList) return;

  
  const user = getFromStorage('anonymous_user');
  const username = getFromStorage('anonymous_username');

  if (!user || !username) {
    window.location.href = 'index.html';
    return;
  }

  
  const navUser = $('#navUsername');
  if (navUser) navUser.textContent = username;

  
  loadProblems();

 
  initPostForm(user, username);

  
  initFilters();

  
  const anonToggle = $('#anonToggle');
  if (anonToggle) {
    anonToggle.checked = true;
    anonToggle.addEventListener('change', () => {
      state.isAnonymous = anonToggle.checked;
    });
  }

  
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeFromStorage('anonymous_user');
      removeFromStorage('anonymous_username');
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }
}

function initPostForm(user, username) {
  const submitBtn = $('#submitProblem');
  const titleInput = $('#problemTitle');
  const bodyInput = $('#problemBody');
  const tagBtns = $$('.tag-btn');

  let selectedTag = 'general';

  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tagBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTag = btn.dataset.tag;
    });
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();

      if (!title || !body) {
        showToast('Please fill in title and description', 'error');
        return;
      }

      const problem = {
        id: Date.now(),
        title,
        body,
        tag: selectedTag,
        authorId: user.id,
        authorName: state.isAnonymous ? generateAnonymousName() : username,
        isAnonymous: state.isAnonymous,
        likes: 0,
        likedBy: [],
        responses: [],
        createdAt: new Date().toISOString()
      };

      const problems = getFromStorage('anonymous_problems') || [];
      problems.unshift(problem);
      saveToStorage('anonymous_problems', problems);

      titleInput.value = '';
      bodyInput.value = '';

      showToast('Problem posted anonymously! 🎭', 'success');
      loadProblems();
    });
  }
}

function initFilters() {
  const filterBtns = $$('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      loadProblems();
    });
  });
}

function loadProblems() {
  const problemsList = $('#problemsList');
  if (!problemsList) return;

  let problems = getFromStorage('anonymous_problems') || [];

  
  if (problems.length === 0) {
    problems = getSampleProblems();
    saveToStorage('anonymous_problems', problems);
  }

  
  if (state.currentFilter !== 'all') {
    problems = problems.filter(p => p.tag === state.currentFilter);
  }

  if (problems.length === 0) {
    problemsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No problems found</h3>
        <p>Be the first to share something or try a different filter.</p>
      </div>
    `;
    return;
  }

  problemsList.innerHTML = problems.map(problem => createProblemCard(problem)).join('');

  
  attachProblemEvents();
}

function createProblemCard(problem) {
  const tagColors = {
    urgent: 'tag-urgent',
    help: 'tag-help',
    discussion: 'tag-discussion',
    advice: 'tag-advice',
    general: ''
  };

  const tagClass = tagColors[problem.tag] || '';
  const user = getFromStorage('anonymous_user');
  const isLiked = problem.likedBy?.includes(user?.id);
  const initial = problem.authorName?.charAt(0)?.toUpperCase() || '?';

  const responsesHtml = (problem.responses || []).map(r => `
    <div class="response-item">
      <div class="resp-avatar">${r.authorName?.charAt(0)?.toUpperCase() || '?'}</div>
      <div class="resp-content">
        <div class="resp-name">${r.authorName} · <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem">${timeAgo(r.createdAt)}</span></div>
        <div class="resp-text">${r.text}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="problem-card" data-id="${problem.id}">
      <div class="card-header">
        <div class="user-info">
          <div class="avatar">${initial}</div>
          <div>
            <div class="name">${problem.authorName}</div>
            <div class="time">${timeAgo(problem.createdAt)}</div>
          </div>
        </div>
        <span class="tag ${tagClass}">${problem.tag}</span>
      </div>
      <div class="card-title">${problem.title}</div>
      <div class="card-body">${problem.body}</div>
      <div class="card-footer">
        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${problem.id}">
          ${isLiked ? '❤️' : '🤍'} <span>${problem.likes || 0}</span>
        </button>
        <button class="action-btn response-toggle-btn" data-id="${problem.id}">
          💬 <span>${problem.responses?.length || 0} responses</span>
        </button>
        <button class="action-btn share-btn" data-id="${problem.id}">
          🔗 <span>Share</span>
        </button>
      </div>
      <div class="responses-section hidden" id="responses-${problem.id}">
        ${responsesHtml}
        <div class="response-input-group">
          <input type="text" placeholder="Write a supportive response..." id="respInput-${problem.id}">
          <button class="btn btn-accent btn-small send-resp-btn" data-id="${problem.id}">Send</button>
        </div>
      </div>
    </div>
  `;
}

function attachProblemEvents() {
  
  $$('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const user = getFromStorage('anonymous_user');
      const problems = getFromStorage('anonymous_problems') || [];
      const problem = problems.find(p => p.id === id);

      if (!problem) return;

      if (!problem.likedBy) problem.likedBy = [];

      const index = problem.likedBy.indexOf(user.id);
      if (index > -1) {
        problem.likedBy.splice(index, 1);
        problem.likes = Math.max(0, (problem.likes || 0) - 1);
      } else {
        problem.likedBy.push(user.id);
        problem.likes = (problem.likes || 0) + 1;
      }

      saveToStorage('anonymous_problems', problems);
      loadProblems();
    });
  });

  
  $$('.response-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const section = $(`#responses-${id}`);
      if (section) section.classList.toggle('hidden');
    });
  });

  
  $$('.send-resp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const input = $(`#respInput-${id}`);
      const text = input.value.trim();

      if (!text) {
        showToast('Please write a response', 'error');
        return;
      }

      const username = getFromStorage('anonymous_username');
      const problems = getFromStorage('anonymous_problems') || [];
      const problem = problems.find(p => p.id === id);

      if (!problem) return;

      if (!problem.responses) problem.responses = [];

      problem.responses.push({
        id: Date.now(),
        text,
        authorName: state.isAnonymous ? generateAnonymousName() : username,
        createdAt: new Date().toISOString()
      });

      saveToStorage('anonymous_problems', problems);
      showToast('Response sent! 💬', 'success');
      loadProblems();
    });
  });

  
  $$('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Link copied to clipboard!', 'success');
    });
  });
}

function getSampleProblems() {
  return [
    {
      id: 1,
      title: 'Struggling with social anxiety at college',
      body: 'I just started college and I find it really hard to talk to people. Every time I try to join a conversation, I freeze up. Does anyone have tips for dealing with social anxiety in new environments?',
      tag: 'help',
      authorName: 'SilentPhoenix42',
      authorId: 0,
      isAnonymous: true,
      likes: 24,
      likedBy: [],
      responses: [
        { id: 101, text: 'I went through the same thing! Start small - just say hi to one person each day. It gets easier over time.', authorName: 'GentleOwl88', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 102, text: 'Try joining a club related to your interests. It\'s easier to talk when you share common ground.', authorName: 'BraveFalcon55', createdAt: new Date(Date.now() - 7200000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      title: 'How to deal with burnout as a developer?',
      body: 'I\'ve been coding 10+ hours daily for months. I used to love programming but now I dread opening my laptop. The passion is gone and everything feels like a chore. How do you guys recover from burnout?',
      tag: 'discussion',
      authorName: 'MysticWolf77',
      authorId: 0,
      isAnonymous: true,
      likes: 42,
      likedBy: [],
      responses: [
        { id: 201, text: 'Take a real break. Not just a weekend - at least a full week away from code. Your brain needs to reset.', authorName: 'CalmTiger23', createdAt: new Date(Date.now() - 1800000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 3,
      title: 'Family pressure to choose a career I don\'t want',
      body: 'My parents want me to become a doctor but I\'m passionate about art and design. They say art won\'t pay the bills. I feel stuck between following my dream and keeping my family happy. Need advice urgently.',
      tag: 'urgent',
      authorName: 'CosmicEagle19',
      authorId: 0,
      isAnonymous: true,
      likes: 67,
      likedBy: [],
      responses: [],
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 4,
      title: 'Tips for managing money as a student?',
      body: 'I\'m terrible with money management. By mid-month, I\'m always broke. Looking for practical advice on budgeting and saving as a college student with limited income.',
      tag: 'advice',
      authorName: 'NeonPanda66',
      authorId: 0,
      isAnonymous: true,
      likes: 15,
      likedBy: [],
      responses: [
        { id: 401, text: 'The 50/30/20 rule works great! 50% needs, 30% wants, 20% savings. Track everything with a simple spreadsheet.', authorName: 'WildHawk44', createdAt: new Date(Date.now() - 5400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 259200000).toISOString()
    }
  ];
}


document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  switch (page) {
    case 'auth':
      initAuthPage();
      break;
    case 'dashboard':
      initDashboardPage();
      break;
    case 'main':
      initMainPage();
      break;
  }
});