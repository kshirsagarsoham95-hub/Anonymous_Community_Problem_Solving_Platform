const API_BASE = 'http://localhost:8080/api';


const state = {
  user: null,
  username: null,
  problems: [],
  currentFilter: 'all',
  isAnonymous: true,
  mood: 'neutral',
  streak: 0,
  reputation: 0,
  onlineUsers: 0,
  mentorMode: false
};


const MOODS = {
  happy: { emoji: '😊', color: '#2ecc71', label: 'Happy' },
  sad: { emoji: '😢', color: '#3498db', label: 'Sad' },
  anxious: { emoji: '😰', color: '#e67e22', label: 'Anxious' },
  angry: { emoji: '😤', color: '#e74c3c', label: 'Angry' },
  neutral: { emoji: '😐', color: '#95a5a6', label: 'Neutral' },
  hopeful: { emoji: '🌟', color: '#f1c40f', label: 'Hopeful' },
  confused: { emoji: '😕', color: '#9b59b6', label: 'Confused' }
};


const REP_TIERS = [
  { min: 0, title: 'Newcomer', badge: '🌱', color: '#95a5a6' },
  { min: 10, title: 'Helper', badge: '🤝', color: '#3498db' },
  { min: 30, title: 'Supporter', badge: '💪', color: '#2ecc71' },
  { min: 60, title: 'Mentor', badge: '🧠', color: '#e67e22' },
  { min: 100, title: 'Guardian', badge: '🛡️', color: '#9b59b6' },
  { min: 200, title: 'Legend', badge: '👑', color: '#f1c40f' }
];


const EMPATHY_KEYWORDS = {
  high: ['understand', 'feel', 'been there', 'you\'re not alone', 'hugs', 'support', 'care', 'listen', 'safe', 'brave', 'proud', 'strength', 'together', 'love', 'heart'],
  medium: ['try', 'suggest', 'maybe', 'hope', 'consider', 'helpful', 'advice', 'think', 'believe', 'possible'],
  low: ['just', 'simply', 'obviously', 'easy', 'whatever', 'fine', 'ok']
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

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


const adjectives = ['Silent', 'Hidden', 'Mystic', 'Shadow', 'Cosmic', 'Neon', 'Phantom', 'Velvet', 'Crystal', 'Brave', 'Gentle', 'Wild', 'Calm', 'Bright', 'Dark', 'Frosty', 'Electric', 'Lunar', 'Solar', 'Arctic'];
const nouns = ['Phoenix', 'Wolf', 'Eagle', 'Tiger', 'Panda', 'Fox', 'Owl', 'Lion', 'Bear', 'Hawk', 'Dragon', 'Raven', 'Falcon', 'Lynx', 'Cobra', 'Orchid', 'Storm', 'Comet', 'Reef', 'Aurora'];

function generateAnonymousName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
}


function getMoodPrefix(mood) {
  const prefixes = {
    happy: ['Cheerful', 'Sunny', 'Joyful'],
    sad: ['Gentle', 'Quiet', 'Soft'],
    anxious: ['Brave', 'Strong', 'Steady'],
    angry: ['Fierce', 'Bold', 'Wild'],
    neutral: ['Calm', 'Cool', 'Zen'],
    hopeful: ['Bright', 'Rising', 'Dawn'],
    confused: ['Curious', 'Seeking', 'Wandering']
  };
  const list = prefixes[mood] || prefixes.neutral;
  return list[Math.floor(Math.random() * list.length)];
}

function generateMoodName(mood) {
  const prefix = getMoodPrefix(mood);
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${prefix}${noun}${num}`;
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


function calculateEmpathyScore(text) {
  const lower = text.toLowerCase();
  let score = 0;

  EMPATHY_KEYWORDS.high.forEach(kw => {
    if (lower.includes(kw)) score += 3;
  });
  EMPATHY_KEYWORDS.medium.forEach(kw => {
    if (lower.includes(kw)) score += 1;
  });
  EMPATHY_KEYWORDS.low.forEach(kw => {
    if (lower.includes(kw)) score -= 1;
  });

  
  if (text.length > 100) score += 2;
  if (text.length > 200) score += 3;

 
  const questionCount = (text.match(/\?/g) || []).length;
  score += questionCount;

  return Math.max(0, Math.min(10, score));
}

function getEmpathyLabel(score) {
  if (score >= 8) return { label: 'Deeply Empathetic', emoji: '💖', color: '#e74c3c' };
  if (score >= 5) return { label: 'Supportive', emoji: '💛', color: '#f1c40f' };
  if (score >= 3) return { label: 'Helpful', emoji: '👍', color: '#2ecc71' };
  return { label: 'Acknowledged', emoji: '📝', color: '#95a5a6' };
}


function calculateUrgency(problem) {
  const hoursOld = (Date.now() - new Date(problem.createdAt).getTime()) / (1000 * 60 * 60);
  const baseUrgency = problem.tag === 'urgent' ? 100 : problem.tag === 'help' ? 70 : 40;
  const responseDecay = (problem.responses?.length || 0) * 15;
  const timeDecay = Math.min(hoursOld * 2, 50);
  const urgency = Math.max(0, baseUrgency - responseDecay - timeDecay);
  return Math.round(urgency);
}

function getUrgencyInfo(urgency) {
  if (urgency >= 80) return { label: '🔴 Critical', color: '#e74c3c', glow: true };
  if (urgency >= 50) return { label: '🟠 High', color: '#e67e22', glow: false };
  if (urgency >= 25) return { label: '🟡 Moderate', color: '#f1c40f', glow: false };
  return { label: '🟢 Low', color: '#2ecc71', glow: false };
}


function getReputation(userId) {
  const reps = getFromStorage('anonymous_reputations') || {};
  return reps[userId] || 0;
}

function addReputation(userId, amount, reason) {
  const reps = getFromStorage('anonymous_reputations') || {};
  reps[userId] = (reps[userId] || 0) + amount;
  saveToStorage('anonymous_reputations', reps);

  
  const logs = getFromStorage('anonymous_rep_logs') || [];
  logs.unshift({
    userId,
    amount,
    reason,
    timestamp: new Date().toISOString()
  });
  saveToStorage('anonymous_rep_logs', logs.slice(0, 100)); 

  return reps[userId];
}

function getRepTier(rep) {
  let tier = REP_TIERS[0];
  for (const t of REP_TIERS) {
    if (rep >= t.min) tier = t;
  }
  return tier;
}


function updateStreak(userId) {
  const streaks = getFromStorage('anonymous_streaks') || {};
  const today = new Date().toDateString();
  const userData = streaks[userId] || { lastActive: null, count: 0, longest: 0 };

  if (userData.lastActive === today) {
    return userData; 
  }

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (userData.lastActive === yesterday) {
    userData.count += 1;
  } else if (userData.lastActive !== today) {
    userData.count = 1; 
  }

  userData.longest = Math.max(userData.longest, userData.count);
  userData.lastActive = today;
  streaks[userId] = userData;
  saveToStorage('anonymous_streaks', streaks);

  return userData;
}

function getStreakInfo(userId) {
  const streaks = getFromStorage('anonymous_streaks') || {};
  return streaks[userId] || { count: 0, longest: 0 };
}


function simulateOnlineUsers() {
  const base = 12;
  const variance = Math.floor(Math.random() * 20);
  state.onlineUsers = base + variance;
  return state.onlineUsers;
}


function findMentorMatch(problemTag) {
  const problems = getFromStorage('anonymous_problems') || [];
  const user = getFromStorage('anonymous_user');

  
  const responders = {};
  problems.forEach(p => {
    if (p.tag === problemTag) {
      (p.responses || []).forEach(r => {
        if (r.authorId && r.authorId !== user?.id) {
          const score = calculateEmpathyScore(r.text);
          if (!responders[r.authorName] || responders[r.authorName] < score) {
            responders[r.authorName] = score;
          }
        }
      });
    }
  });

  
  const sorted = Object.entries(responders).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(([name, score]) => ({ name, score }));
}


function analyzeSentiment(text) {
  const positive = ['happy', 'great', 'good', 'love', 'amazing', 'wonderful', 'better', 'thanks', 'grateful', 'improved', 'excited', 'hope'];
  const negative = ['sad', 'bad', 'terrible', 'hate', 'awful', 'worse', 'depressed', 'anxious', 'scared', 'angry', 'frustrated', 'hopeless', 'alone', 'struggling'];

  const lower = text.toLowerCase();
  let score = 0;

  positive.forEach(w => { if (lower.includes(w)) score += 1; });
  negative.forEach(w => { if (lower.includes(w)) score -= 1; });

  if (score > 1) return { sentiment: 'positive', emoji: '🌈', suggestion: null };
  if (score < -1) return { sentiment: 'negative', emoji: '💙', suggestion: 'Remember: You\'re not alone. This community is here for you.' };
  return { sentiment: 'neutral', emoji: '💭', suggestion: null };
}


function generateWordCloudData() {
  const problems = getFromStorage('anonymous_problems') || [];
  const wordCount = {};
  const stopWords = new Set(['the', 'a', 'an', 'is', 'it', 'to', 'and', 'of', 'in', 'for', 'on', 'with', 'i', 'my', 'me', 'but', 'that', 'this', 'have', 'has', 'was', 'are', 'be', 'do', 'at', 'not', 'so', 'if', 'or', 'as', 'just', 'can', 'how', 'all', 'from', 'they', 'you', 'what', 'been', 'more']);

  problems.forEach(p => {
    const words = (p.title + ' ' + p.body).toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    words.forEach(w => {
      if (w.length > 3 && !stopWords.has(w)) {
        wordCount[w] = (wordCount[w] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count }));
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
      updateStreak(user.id);
      const streak = getStreakInfo(user.id);
      showToast(`Welcome back! 🔥 ${streak.count} day streak!`, 'success');
      setTimeout(() => {
        const hasUsername = getFromStorage('anonymous_username');
        window.location.href = hasUsername ? 'main.html' : 'dashboard.html';
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

    
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUpper || !hasNumber) {
      showToast('Password needs at least 1 uppercase letter and 1 number', 'warning');
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

    
    addReputation(newUser.id, 5, 'Welcome bonus');
    updateStreak(newUser.id);

    showToast('Account created! Welcome to the community! 🎉', 'success');
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
    generatedDisplay.offsetHeight;
    generatedDisplay.style.animation = 'modalIn 0.3s ease';
  });

  saveBtn.addEventListener('click', () => {
    const custom = customInput.value.trim();
    const finalName = custom || currentName;

    if (finalName.length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return;
    }

    
    const blocked = ['admin', 'moderator', 'system', 'anonymous'];
    if (blocked.some(b => finalName.toLowerCase().includes(b))) {
      showToast('That username is reserved. Try another!', 'error');
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

  const user = getFromStorage('anonymous_user');
  const problems = getFromStorage('anonymous_problems') || [];
  const userProblems = problems.filter(p => p.authorId === user?.id);

  
  const totalProblems = $('#totalProblems');
  const totalResponses = $('#totalResponses');
  const totalHelped = $('#totalHelped');

  if (totalProblems) totalProblems.textContent = userProblems.length;
  if (totalResponses) {
    const count = problems.reduce((sum, p) => {
      return sum + (p.responses || []).filter(r => r.authorId === user?.id).length;
    }, 0);
    totalResponses.textContent = count;
  }

  
  const rep = getReputation(user?.id);
  const tier = getRepTier(rep);
  if (totalHelped) {
    totalHelped.textContent = rep;
    totalHelped.title = `${tier.badge} ${tier.title}`;
  }

  
  const repBadge = $('#repBadge');
  if (repBadge) {
    repBadge.innerHTML = `${tier.badge} ${tier.title}`;
    repBadge.style.color = tier.color;
  }

  
  const streakInfo = getStreakInfo(user?.id);
  const streakEl = $('#streakCount');
  if (streakEl) {
    streakEl.textContent = `🔥 ${streakInfo.count} day streak`;
  }

 
  const onlineEl = $('#onlineUsers');
  if (onlineEl) {
    onlineEl.textContent = `🟢 ${simulateOnlineUsers()} online`;
  }

  
  renderTrendingWords();

  
  const goMainBtn = $('#goToMain');
  if (goMainBtn) {
    goMainBtn.addEventListener('click', () => {
      window.location.href = 'main.html';
    });
  }
}

function renderTrendingWords() {
  const container = $('#trendingWords');
  if (!container) return;

  const words = generateWordCloudData();
  if (words.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No trending topics yet</p>';
    return;
  }

  const maxCount = words[0].count;
  container.innerHTML = words.map(({ word, count }) => {
    const size = 0.75 + (count / maxCount) * 0.8;
    const opacity = 0.5 + (count / maxCount) * 0.5;
    return `<span class="trending-word" style="font-size:${size}rem;opacity:${opacity};margin:4px 6px;display:inline-block;color:var(--primary);cursor:pointer;" title="${count} mentions">${word}</span>`;
  }).join('');
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

 
  updateStreak(user.id);

 
  const navUser = $('#navUsername');
  if (navUser) {
    const rep = getReputation(user.id);
    const tier = getRepTier(rep);
    navUser.innerHTML = `${tier.badge} ${username}`;
  }

  
  const onlineEl = $('#onlineUsers');
  if (onlineEl) {
    onlineEl.textContent = `🟢 ${simulateOnlineUsers()} online`;
    
    setInterval(() => {
      onlineEl.textContent = `🟢 ${simulateOnlineUsers()} online`;
    }, 30000);
  }

  
  loadProblems();

  
  initPostForm(user, username);

  
  initFilters();

 
  initMoodSelector();

 
  const anonToggle = $('#anonToggle');
  if (anonToggle) {
    anonToggle.checked = true;
    anonToggle.addEventListener('change', () => {
      state.isAnonymous = anonToggle.checked;
    });
  }

  
  const mentorToggle = $('#mentorToggle');
  if (mentorToggle) {
    mentorToggle.addEventListener('change', () => {
      state.mentorMode = mentorToggle.checked;
      if (state.mentorMode) {
        showToast('Mentor mode ON — you\'ll see problems that need the most help first 🧠', 'info');
        loadProblems(); 
      } else {
        showToast('Mentor mode OFF', 'info');
        loadProblems();
      }
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

  
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const submitBtn = $('#submitProblem');
      if (submitBtn) submitBtn.click();
    }
  });
}

function initMoodSelector() {
  const moodContainer = $('#moodSelector');
  if (!moodContainer) return;

  moodContainer.innerHTML = Object.entries(MOODS).map(([key, val]) => `
    <button class="mood-btn ${key === state.mood ? 'active' : ''}" data-mood="${key}" title="${val.label}" style="font-size:1.3rem;padding:8px 12px;border:2px solid transparent;border-radius:12px;background:var(--bg-input);cursor:pointer;transition:var(--transition);">
      ${val.emoji}
    </button>
  `).join('');

  moodContainer.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      moodContainer.querySelectorAll('.mood-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'transparent';
        b.style.transform = 'scale(1)';
      });
      btn.classList.add('active');
      state.mood = btn.dataset.mood;
      btn.style.borderColor = MOODS[state.mood].color;
      btn.style.transform = 'scale(1.15)';
      showToast(`Mood set to ${MOODS[state.mood].label} ${MOODS[state.mood].emoji}`, 'info');
    });
  });
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

  
  if (bodyInput) {
    let debounceTimer;
    bodyInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const sentiment = analyzeSentiment(bodyInput.value);
        const sentimentHint = $('#sentimentHint');
        if (sentimentHint) {
          sentimentHint.innerHTML = `${sentiment.emoji} ${sentiment.suggestion || ''}`;
          sentimentHint.style.display = sentiment.suggestion ? 'block' : 'none';
        }
      }, 500);
    });
  }

  
  if (bodyInput) {
    const counter = document.createElement('div');
    counter.id = 'charCounter';
    counter.style.cssText = 'text-align:right;font-size:0.75rem;color:var(--text-muted);margin-top:4px;';
    counter.textContent = '0 / 2000';
    bodyInput.parentNode?.appendChild(counter);

    bodyInput.setAttribute('maxlength', '2000');
    bodyInput.addEventListener('input', () => {
      const len = bodyInput.value.length;
      counter.textContent = `${len} / 2000`;
      counter.style.color = len > 1800 ? 'var(--danger)' : 'var(--text-muted)';
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();

      if (!title || !body) {
        showToast('Please fill in title and description', 'error');
        return;
      }

      if (title.length < 5) {
        showToast('Title should be at least 5 characters', 'error');
        return;
      }

      
      const existing = getFromStorage('anonymous_problems') || [];
      const isDuplicate = existing.some(p =>
        p.title.toLowerCase() === title.toLowerCase() &&
        p.authorId === user.id &&
        (Date.now() - new Date(p.createdAt).getTime()) < 300000 
      );

      if (isDuplicate) {
        showToast('You already posted something similar recently!', 'warning');
        return;
      }

      const authorName = state.isAnonymous ? generateMoodName(state.mood) : username;
      const sentiment = analyzeSentiment(body);

      const problem = {
        id: Date.now(),
        title,
        body,
        tag: selectedTag,
        mood: state.mood,
        sentiment: sentiment.sentiment,
        authorId: user.id,
        authorName,
        isAnonymous: state.isAnonymous,
        likes: 0,
        likedBy: [],
        bookmarkedBy: [],
        responses: [],
        urgency: selectedTag === 'urgent' ? 100 : selectedTag === 'help' ? 70 : 40,
        createdAt: new Date().toISOString()
      };

      const problems = getFromStorage('anonymous_problems') || [];
      problems.unshift(problem);
      saveToStorage('anonymous_problems', problems);

      
      addReputation(user.id, 2, 'Posted a problem');

      titleInput.value = '';
      bodyInput.value = '';

      const charCounter = $('#charCounter');
      if (charCounter) charCounter.textContent = '0 / 2000';

      
      if (sentiment.sentiment === 'negative') {
        showToast('Your problem has been shared. Remember, you\'re not alone 💙', 'success');
      } else {
        showToast('Problem posted anonymously! 🎭', 'success');
      }

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

  
  const searchInput = $('#searchProblems');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        loadProblems(searchInput.value.trim());
      }, 300);
    });
  }
}

function loadProblems(searchQuery = '') {
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

 
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    problems = problems.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q)
    );
  }

  
  if (state.mentorMode) {
    problems.sort((a, b) => calculateUrgency(b) - calculateUrgency(a));
  }

 
  updateFilterCounts();

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

function updateFilterCounts() {
  const allProblems = getFromStorage('anonymous_problems') || [];
  const counts = {
    all: allProblems.length,
    urgent: allProblems.filter(p => p.tag === 'urgent').length,
    help: allProblems.filter(p => p.tag === 'help').length,
    discussion: allProblems.filter(p => p.tag === 'discussion').length,
    advice: allProblems.filter(p => p.tag === 'advice').length,
    general: allProblems.filter(p => p.tag === 'general').length
  };

  Object.entries(counts).forEach(([key, count]) => {
    const el = $(`.filter-btn[data-filter="${key}"] .count`);
    if (el) el.textContent = count;
  });
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
  const isBookmarked = problem.bookmarkedBy?.includes(user?.id);
  const initial = problem.authorName?.charAt(0)?.toUpperCase() || '?';

  
  const urgency = calculateUrgency(problem);
  const urgencyInfo = getUrgencyInfo(urgency);

 
  const moodInfo = MOODS[problem.mood] || MOODS.neutral;

  
  const authorRep = getReputation(problem.authorId);
  const authorTier = getRepTier(authorRep);

 
  const responsesHtml = (problem.responses || []).map(r => {
    const empathyScore = calculateEmpathyScore(r.text);
    const empathyInfo = getEmpathyLabel(empathyScore);
    return `
      <div class="response-item">
        <div class="resp-avatar">${r.authorName?.charAt(0)?.toUpperCase() || '?'}</div>
        <div class="resp-content">
          <div class="resp-name">
            ${r.authorName} · 
            <span style="color:var(--text-muted);font-weight:400;font-size:0.8rem">${timeAgo(r.createdAt)}</span>
            <span style="margin-left:8px;font-size:0.7rem;padding:2px 8px;border-radius:10px;background:${empathyInfo.color}22;color:${empathyInfo.color};">${empathyInfo.emoji} ${empathyInfo.label}</span>
          </div>
          <div class="resp-text">${r.text}</div>
        </div>
      </div>
    `;
  }).join('');

  const urgencyBar = `
    <div style="margin:10px 0;height:4px;border-radius:2px;background:var(--bg-input);overflow:hidden;">
      <div style="height:100%;width:${urgency}%;background:${urgencyInfo.color};border-radius:2px;transition:width 0.5s ease;${urgencyInfo.glow ? 'box-shadow:0 0 10px ' + urgencyInfo.color + ';' : ''}"></div>
    </div>
    <div style="font-size:0.7rem;color:${urgencyInfo.color};margin-bottom:8px;">${urgencyInfo.label} urgency — ${urgency}%</div>
  `;

  return `
    <div class="problem-card" data-id="${problem.id}" ${urgencyInfo.glow ? `style="border-color:${urgencyInfo.color}40;box-shadow:0 0 20px ${urgencyInfo.color}15;"` : ''}>
      <div class="card-header">
        <div class="user-info">
          <div class="avatar" style="background:linear-gradient(135deg, ${moodInfo.color}, ${authorTier.color});">${initial}</div>
          <div>
            <div class="name">${problem.authorName} <span style="font-size:0.75rem;">${authorTier.badge}</span></div>
            <div class="time">${timeAgo(problem.createdAt)} · ${moodInfo.emoji} ${moodInfo.label}</div>
          </div>
        </div>
        <span class="tag ${tagClass}">${problem.tag}</span>
      </div>
      ${urgencyBar}
      <div class="card-title">${problem.title}</div>
      <div class="card-body">${problem.body}</div>
      <div class="card-footer">
        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${problem.id}">
          ${isLiked ? '❤️' : '🤍'} <span>${problem.likes || 0}</span>
        </button>
        <button class="action-btn response-toggle-btn" data-id="${problem.id}">
          💬 <span>${problem.responses?.length || 0} responses</span>
        </button>
        <button class="action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-id="${problem.id}">
          ${isBookmarked ? '🔖' : '📌'} <span>${isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
        <button class="action-btn share-btn" data-id="${problem.id}">
          🔗 <span>Share</span>
        </button>
      </div>
      <div class="responses-section hidden" id="responses-${problem.id}">
        ${responsesHtml}
        <div id="sentimentHintResp-${problem.id}" style="display:none;font-size:0.8rem;color:var(--text-muted);padding:4px 0;"></div>
        <div class="response-input-group">
          <input type="text" placeholder="Write a supportive response..." id="respInput-${problem.id}" maxlength="500">
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
        
        if (problem.authorId !== user.id) {
          addReputation(problem.authorId, -1, 'Like removed');
        }
      } else {
        problem.likedBy.push(user.id);
        problem.likes = (problem.likes || 0) + 1;
        
        if (problem.authorId !== user.id) {
          addReputation(problem.authorId, 1, 'Received a like');
        }
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

  
  $$('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const user = getFromStorage('anonymous_user');
      const problems = getFromStorage('anonymous_problems') || [];
      const problem = problems.find(p => p.id === id);

      if (!problem) return;

      if (!problem.bookmarkedBy) problem.bookmarkedBy = [];

      const index = problem.bookmarkedBy.indexOf(user.id);
      if (index > -1) {
        problem.bookmarkedBy.splice(index, 1);
        showToast('Removed from bookmarks', 'info');
      } else {
        problem.bookmarkedBy.push(user.id);
        showToast('Saved to bookmarks! 🔖', 'success');
      }

      saveToStorage('anonymous_problems', problems);
      loadProblems();
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

      if (text.length < 10) {
        showToast('Responses should be at least 10 characters to be meaningful 💭', 'warning');
        return;
      }

      const user = getFromStorage('anonymous_user');
      const username = getFromStorage('anonymous_username');
      const problems = getFromStorage('anonymous_problems') || [];
      const problem = problems.find(p => p.id === id);

      if (!problem) return;

      if (!problem.responses) problem.responses = [];

      
      const empathyScore = calculateEmpathyScore(text);
      const empathyInfo = getEmpathyLabel(empathyScore);

      problem.responses.push({
        id: Date.now(),
        text,
        authorId: user.id,
        authorName: state.isAnonymous ? generateMoodName(state.mood) : username,
        empathyScore,
        createdAt: new Date().toISOString()
      });

      saveToStorage('anonymous_problems', problems);

     
      let repGain = 1;
      if (empathyScore >= 8) repGain = 5;
      else if (empathyScore >= 5) repGain = 3;
      else if (empathyScore >= 3) repGain = 2;

      const newRep = addReputation(user.id, repGain, `Response (empathy: ${empathyScore})`);
      const tier = getRepTier(newRep);

      showToast(`Response sent! ${empathyInfo.emoji} ${empathyInfo.label} (+${repGain} rep)`, 'success');

      
      const prevRep = newRep - repGain;
      const prevTier = getRepTier(prevRep);
      if (tier.title !== prevTier.title) {
        setTimeout(() => {
          showToast(`🎉 You've reached ${tier.badge} ${tier.title} status!`, 'success');
        }, 1500);
      }

      loadProblems();
    });
  });

  
  $$('.response-input-group input').forEach(input => {
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const id = input.id.replace('respInput-', '');
        const hint = $(`#sentimentHintResp-${id}`);
        if (!hint) return;

        const text = input.value.trim();
        if (text.length < 5) {
          hint.style.display = 'none';
          return;
        }

        const score = calculateEmpathyScore(text);
        const info = getEmpathyLabel(score);
        hint.innerHTML = `${info.emoji} Empathy score: ${score}/10 — ${info.label}`;
        hint.style.display = 'block';
        hint.style.color = info.color;
      }, 300);
    });
  });

  
  $$('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const shareText = `Check out this problem on Anonymous Community: Problem #${id}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          showToast('Link copied to clipboard! 🔗', 'success');
        }).catch(() => {
          showToast('Link copied to clipboard!', 'success');
        });
      } else {
        showToast('Link copied to clipboard!', 'success');
      }
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
      mood: 'anxious',
      sentiment: 'negative',
      authorName: 'SilentPhoenix42',
      authorId: 0,
      isAnonymous: true,
      likes: 24,
      likedBy: [],
      bookmarkedBy: [],
      responses: [
        { id: 101, text: 'I completely understand how you feel — I went through the same thing! Start small, just say hi to one person each day. You\'re braver than you think, and it genuinely gets easier over time. You\'re not alone in this.', authorName: 'GentleOwl88', authorId: 0, empathyScore: 8, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 102, text: 'Try joining a club related to your interests. It\'s so much easier to talk when you share common ground. I believe in you!', authorName: 'BraveFalcon55', authorId: 0, empathyScore: 6, createdAt: new Date(Date.now() - 7200000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      title: 'How to deal with burnout as a developer?',
      body: 'I\'ve been coding 10+ hours daily for months. I used to love programming but now I dread opening my laptop. The passion is gone and everything feels like a chore. How do you guys recover from burnout?',
      tag: 'discussion',
      mood: 'sad',
      sentiment: 'negative',
      authorName: 'MysticWolf77',
      authorId: 0,
      isAnonymous: true,
      likes: 42,
      likedBy: [],
      bookmarkedBy: [],
      responses: [
        { id: 201, text: 'Take a real break. Not just a weekend — at least a full week away from code. Your brain needs to reset. I\'ve been there and I understand the feeling. It does get better, I promise.', authorName: 'CalmTiger23', authorId: 0, empathyScore: 7, createdAt: new Date(Date.now() - 1800000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 3,
      title: 'Family pressure to choose a career I don\'t want',
      body: 'My parents want me to become a doctor but I\'m passionate about art and design. They say art won\'t pay the bills. I feel stuck between following my dream and keeping my family happy. Need advice urgently.',
      tag: 'urgent',
      mood: 'confused',
      sentiment: 'negative',
      authorName: 'CosmicEagle19',
      authorId: 0,
      isAnonymous: true,
      likes: 67,
      likedBy: [],
      bookmarkedBy: [],
      responses: [],
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 4,
      title: 'Tips for managing money as a student?',
      body: 'I\'m terrible with money management. By mid-month, I\'m always broke. Looking for practical advice on budgeting and saving as a college student with limited income.',
      tag: 'advice',
      mood: 'neutral',
      sentiment: 'neutral',
      authorName: 'NeonPanda66',
      authorId: 0,
      isAnonymous: true,
      likes: 15,
      likedBy: [],
      bookmarkedBy: [],
      responses: [
        { id: 401, text: 'The 50/30/20 rule works great! 50% needs, 30% wants, 20% savings. I\'ve been in your situation and I understand how stressful it can be. Track everything with a simple spreadsheet — you\'ll feel so much more in control.', authorName: 'WildHawk44', authorId: 0, empathyScore: 6, createdAt: new Date(Date.now() - 5400000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 5,
      title: 'Finally overcame my fear of public speaking!',
      body: 'After months of practice and support from this community, I gave my first presentation today without freezing up. I was shaking but I did it! Just wanted to share some hope — things DO get better. Thank you all!',
      tag: 'discussion',
      mood: 'happy',
      sentiment: 'positive',
      authorName: 'RisingAurora77',
      authorId: 0,
      isAnonymous: true,
      likes: 89,
      likedBy: [],
      bookmarkedBy: [],
      responses: [
        { id: 501, text: 'This is amazing! I\'m so proud of you! 🎉 Your courage is inspiring to all of us here.', authorName: 'BrightDragon22', authorId: 0, empathyScore: 9, createdAt: new Date(Date.now() - 900000).toISOString() }
      ],
      createdAt: new Date(Date.now() - 43200000).toISOString()
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