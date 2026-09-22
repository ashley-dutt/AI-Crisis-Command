// AI Crisis Command - Client Controller & Real-Time Multiplayer Link

const socket = io();

// Local player state
let myPlayerId = null;
let currentRoomCode = null;
let latestState = null;
let selectedActionId = null;

// DOM Elements
const connStatus = document.getElementById('connection-status');
const alertBanner = document.getElementById('alert-banner');
const roomCodeTag = document.getElementById('room-code-tag');
const displayRoomCode = document.getElementById('display-room-code');
const btnCopyCode = document.getElementById('btn-copy-code');

// Modal Elements
const btnOpenRules = document.getElementById('btn-open-rules');
const btnCloseRules = document.getElementById('btn-close-rules');
const btnAckRules = document.getElementById('btn-ack-rules');
const modalRules = document.getElementById('modal-rules');

// Views
const views = {
  landing: document.getElementById('view-landing'),
  lobby: document.getElementById('view-lobby'),
  game: document.getElementById('view-game'),
  resolution: document.getElementById('view-resolution'),
  results: document.getElementById('view-results')
};

// Landing Inputs & Buttons
const playerNameInput = document.getElementById('player-name-input');
const btnCreateRoom = document.getElementById('btn-create-room');
const joinCodeInput = document.getElementById('join-code-input');
const btnJoinRoom = document.getElementById('btn-join-room');

// Lobby Elements
const lobbyCodeBadge = document.getElementById('lobby-code-badge');
const playerCountSpan = document.getElementById('player-count');
const lobbyPlayerList = document.getElementById('lobby-player-list');
const rolesGrid = document.getElementById('roles-grid');
const btnToggleReady = document.getElementById('btn-toggle-ready');
const btnStartGame = document.getElementById('btn-start-game');

// Game Elements
const currentRoundNum = document.getElementById('current-round-num');
const crisisSeverityBadge = document.getElementById('crisis-severity-badge');
const crisisTitleDisplay = document.getElementById('crisis-title-display');
const countdownDisplay = document.getElementById('countdown-display');
const crisisSubtitle = document.getElementById('crisis-subtitle');
const crisisThreatDesc = document.getElementById('crisis-threat-desc');
const hazardImpactsList = document.getElementById('hazard-impacts-list');

const valIntegrity = document.getElementById('val-integrity');
const barIntegrity = document.getElementById('bar-integrity');
const valSafety = document.getElementById('val-safety');
const barSafety = document.getElementById('bar-safety');
const valInfra = document.getElementById('val-infra');
const barInfra = document.getElementById('bar-infra');
const valResources = document.getElementById('val-resources');
const barResources = document.getElementById('bar-resources');

const gameMyRoleIcon = document.getElementById('game-my-role-icon');
const gameMyRoleName = document.getElementById('game-my-role-name');
const actionStatusIndicator = document.getElementById('action-status-indicator');

const novaDirective = document.getElementById('nova-directive');
const novaRecommendations = document.getElementById('nova-recommendations');

const roleActionsList = document.getElementById('role-actions-list');
const generalActionsList = document.getElementById('general-actions-list');
const gamePlayerList = document.getElementById('game-player-list');
const incidentLogStream = document.getElementById('incident-log-stream');
const commForm = document.getElementById('comm-form');
const commInput = document.getElementById('comm-input');

// Resolution Elements
const resCrisisTitle = document.getElementById('res-crisis-title');
const resRatingBanner = document.getElementById('res-rating-banner');
const resStatsDiff = document.getElementById('res-stats-diff');
const resSynergiesList = document.getElementById('res-synergies-list');
const resActionsList = document.getElementById('res-actions-list');
const resNovaSummary = document.getElementById('res-nova-summary');

// Results Elements
const resultsCardTheme = document.getElementById('results-card-theme');
const resultsIcon = document.getElementById('results-icon');
const resultsVerdict = document.getElementById('results-verdict');
const resultsGrade = document.getElementById('results-grade');
const resultsMessage = document.getElementById('results-message');
const finalValIntegrity = document.getElementById('final-val-integrity');
const finalValSafety = document.getElementById('final-val-safety');
const finalValInfra = document.getElementById('final-val-infra');
const finalValResources = document.getElementById('final-val-resources');
const btnReturnLobby = document.getElementById('btn-return-lobby');

// Synthesized Audio Cues (Zero dependencies)
const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playBeep(freq = 440, duration = 0.08, type = 'sine') {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio optional
  }
}

// UI Helper: Switch View
function switchView(viewKey) {
  Object.keys(views).forEach(k => {
    if (k === viewKey) {
      views[k].classList.remove('hidden');
    } else {
      views[k].classList.add('hidden');
    }
  });
}

// UI Helper: Show Banner Alert
let bannerTimeout = null;
function showAlert(msg, isError = true) {
  alertBanner.textContent = msg;
  alertBanner.style.background = isError ? '#ef4444' : '#10b981';
  alertBanner.classList.remove('hidden');
  if (bannerTimeout) clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => {
    alertBanner.classList.add('hidden');
  }, 4000);
}

// Rules Modal Handlers
btnOpenRules.addEventListener('click', () => modalRules.classList.remove('hidden'));
btnCloseRules.addEventListener('click', () => modalRules.classList.add('hidden'));
btnAckRules.addEventListener('click', () => modalRules.classList.add('hidden'));

// Copy Room Code
btnCopyCode.addEventListener('click', () => {
  if (currentRoomCode) {
    navigator.clipboard.writeText(currentRoomCode);
    showAlert(`Room code ${currentRoomCode} copied to clipboard!`, false);
  }
});

// Socket Lifecycle
socket.on('connect', () => {
  myPlayerId = socket.id;
  connStatus.textContent = 'ONLINE';
  connStatus.className = 'status-indicator online';
});

socket.on('disconnect', () => {
  connStatus.textContent = 'DISCONNECTED';
  connStatus.className = 'status-indicator offline';
  showAlert('Lost connection to Crisis Command server. Attempting reconnect...', true);
});

socket.on('error_message', ({ message }) => {
  showAlert(message, true);
  playBeep(220, 0.2, 'sawtooth');
});

// Room Created / Joined Handlers
socket.on('room_created', ({ roomCode }) => {
  currentRoomCode = roomCode;
  displayRoomCode.textContent = roomCode;
  lobbyCodeBadge.textContent = roomCode;
  roomCodeTag.classList.remove('hidden');
  switchView('lobby');
  playBeep(587, 0.1);
});

socket.on('joined_room', ({ roomCode }) => {
  currentRoomCode = roomCode;
  displayRoomCode.textContent = roomCode;
  lobbyCodeBadge.textContent = roomCode;
  roomCodeTag.classList.remove('hidden');
  switchView('lobby');
  playBeep(587, 0.1);
});

// Real-time Timer Tick
socket.on('timer_tick', ({ seconds }) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  countdownDisplay.textContent = `${m}:${s}`;

  if (seconds <= 10) {
    countdownDisplay.classList.add('timer-urgent');
    playBeep(880, 0.05, 'square');
  } else {
    countdownDisplay.classList.remove('timer-urgent');
  }
});

// Synchronized Master Game State Handler
socket.on('game_state', (state) => {
  latestState = state;
  currentRoomCode = state.roomCode;
  displayRoomCode.textContent = state.roomCode;
  lobbyCodeBadge.textContent = state.roomCode;
  roomCodeTag.classList.remove('hidden');

  // Handle transitions based on server state
  if (state.state === 'LOBBY') {
    renderLobby(state);
    switchView('lobby');
  } else if (state.state === 'ACTION_PHASE') {
    renderGame(state);
    switchView('game');
  } else if (state.state === 'ROUND_RESOLUTION') {
    renderResolution(state);
    switchView('resolution');
  } else if (state.state === 'GAME_OVER') {
    renderResults(state);
    switchView('results');
  }
});

// --- RENDER FUNCTIONS ---

function renderLobby(state) {
  playerCountSpan.textContent = state.players.length;

  const me = state.players.find(p => p.id === myPlayerId) || {};
  const isHost = me.isHost;

  // Render player roster
  lobbyPlayerList.innerHTML = '';
  state.players.forEach(p => {
    const isMe = p.id === myPlayerId;
    const div = document.createElement('div');
    div.className = `player-slot ${isMe ? 'me' : ''}`;
    div.innerHTML = `
      <div class="player-info">
        <span class="player-role-icon">${p.roleIcon}</span>
        <span class="player-name-text">${escapeHtml(p.name)}</span>
        ${p.isHost ? '<span class="host-tag">HOST</span>' : ''}
      </div>
      <div class="player-status-tag ${p.isReady ? 'ready' : 'waiting'}">
        ${p.isReady ? 'READY' : 'STANDBY'}
      </div>
    `;
    lobbyPlayerList.appendChild(div);
  });

  // Ready button state
  if (me.isReady) {
    btnToggleReady.textContent = 'Cancel Ready';
    btnToggleReady.classList.add('ready-active');
  } else {
    btnToggleReady.textContent = 'Ready Up';
    btnToggleReady.classList.remove('ready-active');
  }

  // Host Launch button
  if (isHost) {
    btnStartGame.classList.remove('hidden');
    const canStart = state.players.length >= 2;
    btnStartGame.disabled = !canStart;
    btnStartGame.style.opacity = canStart ? '1' : '0.6';
    btnStartGame.title = canStart ? 'Launch the mission!' : 'Requires at least 2 commanders.';
  } else {
    btnStartGame.classList.add('hidden');
  }

  // Render role grid
  rolesGrid.innerHTML = '';
  state.availableRoles.forEach(role => {
    const occupant = state.players.find(p => p.roleId === role.id);
    const isMyRole = me.roleId === role.id;
    const isTakenByOther = occupant && occupant.id !== myPlayerId;

    const card = document.createElement('div');
    card.className = `role-card ${isMyRole ? 'selected' : ''} ${isTakenByOther ? 'taken' : ''}`;
    card.innerHTML = `
      <div class="role-header">
        <span class="role-icon">${role.icon}</span>
        <span class="role-title">${role.name}</span>
      </div>
      <p class="role-desc">${role.description}</p>
      ${occupant ? `<div class="role-occupant">${isMyRole ? '★ You are assigned here' : `Claimed by: ${escapeHtml(occupant.name)}`}</div>` : '<div class="role-occupant" style="color:#10b981;">● Available for selection</div>'}
    `;

    if (!isTakenByOther && !isMyRole) {
      card.addEventListener('click', () => {
        socket.emit('select_role', { roleId: role.id });
        playBeep(440, 0.05);
      });
    }

    rolesGrid.appendChild(card);
  });
}

function renderGame(state) {
  const me = state.players.find(p => p.id === myPlayerId) || {};
  const crisis = state.currentCrisis;
  if (!crisis) return;

  // Round & Crisis info
  currentRoundNum.textContent = state.round;
  crisisSeverityBadge.textContent = crisis.severity;
  crisisTitleDisplay.textContent = crisis.title;
  crisisSubtitle.textContent = crisis.subtitle;
  crisisThreatDesc.textContent = crisis.threatDescription;

  // Hazard impacts
  hazardImpactsList.innerHTML = '';
  const threatEntries = Object.entries(crisis.baseThreat);
  threatEntries.forEach(([stat, val]) => {
    const span = document.createElement('span');
    span.className = 'hazard-tag';
    span.textContent = `${stat.toUpperCase()}: ${val}% / turn`;
    hazardImpactsList.appendChild(span);
  });

  // City Vitals
  updateVitals(state.cityStats);

  // My Role
  gameMyRoleIcon.textContent = me.roleIcon || '🛡️';
  gameMyRoleName.textContent = me.roleName || 'Commander';

  // Action status
  if (me.hasSubmittedAction) {
    actionStatusIndicator.textContent = 'COUNTERMEASURE DISPATCHED';
    actionStatusIndicator.className = 'action-committed';
  } else {
    actionStatusIndicator.textContent = 'AWAITING YOUR ORDER';
    actionStatusIndicator.className = 'action-pending';
  }

  // NOVA Advisory
  if (state.novaBriefing) {
    novaDirective.textContent = state.novaBriefing.primaryDirective;
    novaRecommendations.innerHTML = '';
    state.novaBriefing.recommendations.forEach(r => {
      const p = document.createElement('p');
      p.textContent = `▶ ${r}`;
      novaRecommendations.appendChild(p);
    });
  }

  // Render Role Actions
  roleActionsList.innerHTML = '';
  state.myRoleActions.forEach(action => {
    const btn = createActionCard(action, me.hasSubmittedAction);
    roleActionsList.appendChild(btn);
  });

  // Render General Actions
  generalActionsList.innerHTML = '';
  state.generalActions.forEach(action => {
    const btn = createActionCard(action, me.hasSubmittedAction);
    generalActionsList.appendChild(btn);
  });

  // Commander Readiness Status
  gamePlayerList.innerHTML = '';
  state.players.forEach(p => {
    const div = document.createElement('div');
    div.className = 'game-player-card';
    div.innerHTML = `
      <div class="game-player-details">
        <span class="game-player-name">${p.roleIcon} ${escapeHtml(p.name)}</span>
        <span class="game-player-role">${p.roleName}</span>
      </div>
      <span class="action-state-badge ${p.hasSubmittedAction ? 'done' : 'thinking'}">
        ${p.hasSubmittedAction ? '✓ DEPLOYED' : '⏳ PLANNING'}
      </span>
    `;
    gamePlayerList.appendChild(div);
  });

  // Incident & Comm Logs
  incidentLogStream.innerHTML = '';
  state.recentLogs.forEach(log => {
    const p = document.createElement('div');
    p.className = `log-item ${log.type || 'info'}`;
    p.textContent = `[${log.time}] ${log.text}`;
    incidentLogStream.appendChild(p);
  });
  incidentLogStream.scrollTop = incidentLogStream.scrollHeight;
}

function createActionCard(action, hasSubmitted) {
  const card = document.createElement('button');
  card.className = `action-btn-card ${selectedActionId === action.id ? 'active-selected' : ''}`;
  card.disabled = hasSubmitted;

  // Effects badges
  const effectsHtml = Object.entries(action.effects).map(([stat, val]) => {
    const isPos = val > 0;
    return `<span class="effect-badge ${isPos ? 'eff-pos' : 'eff-neg'}">${stat.substring(0,3).toUpperCase()} ${isPos ? '+' : ''}${val}%</span>`;
  }).join('');

  card.innerHTML = `
    <div class="act-title-row">
      <span class="act-label">${action.label}</span>
      <div class="act-effects-tags">${effectsHtml}</div>
    </div>
    <p class="act-desc">${action.desc}</p>
  `;

  card.addEventListener('click', () => {
    if (hasSubmitted) return;
    selectedActionId = action.id;
    socket.emit('submit_action', { actionId: action.id });
    playBeep(659, 0.12, 'triangle');
  });

  return card;
}

function updateVitals(stats) {
  valIntegrity.textContent = `${stats.integrity}%`;
  barIntegrity.style.width = `${stats.integrity}%`;

  valSafety.textContent = `${stats.safety}%`;
  barSafety.style.width = `${stats.safety}%`;

  valInfra.textContent = `${stats.infrastructure}%`;
  barInfra.style.width = `${stats.infrastructure}%`;

  valResources.textContent = `${stats.resources}%`;
  barResources.style.width = `${stats.resources}%`;
}

function renderResolution(state) {
  selectedActionId = null; // reset for next round
  const res = state.lastRoundResolution;
  if (!res) return;

  resCrisisTitle.textContent = `ROUND ${res.round} RESOLUTION: ${res.crisisTitle.toUpperCase()}`;
  resRatingBanner.textContent = res.debrief.rating;

  // Stats Diff
  resStatsDiff.innerHTML = '';
  const statKeys = [
    { key: 'integrity', label: 'City Integrity' },
    { key: 'safety', label: 'Public Safety' },
    { key: 'infrastructure', label: 'Infrastructure' },
    { key: 'resources', label: 'Emergency Resources' }
  ];

  statKeys.forEach(({ key, label }) => {
    const delta = res.netChanges[key] || 0;
    const isPos = delta >= 0;
    const row = document.createElement('div');
    row.className = 'stat-diff-row';
    row.innerHTML = `
      <span>${label}</span>
      <span class="delta-tag ${isPos ? 'delta-pos' : 'delta-neg'}">${isPos ? '+' : ''}${delta}% (Now: ${state.cityStats[key]}%)</span>
    `;
    resStatsDiff.appendChild(row);
  });

  // Synergies
  resSynergiesList.innerHTML = '';
  if (res.synergies && res.synergies.length > 0) {
    res.synergies.forEach(syn => {
      const div = document.createElement('div');
      div.className = 'synergy-item';
      div.textContent = `★ ${syn}`;
      resSynergiesList.appendChild(div);
    });
  }

  // Executed Actions
  resActionsList.innerHTML = '';
  res.actions.forEach(a => {
    const div = document.createElement('div');
    div.textContent = `• ${a.playerName} (${a.roleName}): ${a.actionLabel}`;
    resActionsList.appendChild(div);
  });

  // NOVA Summary
  resNovaSummary.textContent = res.debrief.summary;
  playBeep(493, 0.15);
}

function renderResults(state) {
  const debrief = state.finalDebrief;
  if (!debrief) return;

  const isVictory = debrief.grade !== 'MISSION FAILED';
  resultsVerdict.textContent = debrief.verdict;
  resultsGrade.textContent = debrief.grade;
  resultsMessage.textContent = debrief.message;

  if (isVictory) {
    resultsIcon.textContent = '🏆';
    resultsCardTheme.className = 'results-card victory-theme';
    playBeep(784, 0.3, 'sine');
  } else {
    resultsIcon.textContent = '⚠️';
    resultsCardTheme.className = 'results-card defeat-theme';
    playBeep(220, 0.4, 'sawtooth');
  }

  finalValIntegrity.textContent = `${state.cityStats.integrity}%`;
  finalValSafety.textContent = `${state.cityStats.safety}%`;
  finalValInfra.textContent = `${state.cityStats.infrastructure}%`;
  finalValResources.textContent = `${state.cityStats.resources}%`;

  const me = state.players.find(p => p.id === myPlayerId);
  if (me && me.isHost) {
    btnReturnLobby.textContent = 'Reopen Command Briefing Room';
    btnReturnLobby.disabled = false;
  } else {
    btnReturnLobby.textContent = 'Awaiting Host to Reset Briefing...';
    btnReturnLobby.disabled = true;
  }
}

// --- USER ACTION LISTENERS ---

// Create Room
btnCreateRoom.addEventListener('click', () => {
  const name = playerNameInput.value.trim() || 'Commander 1';
  socket.emit('create_room', { playerName: name });
});

// Join Room
btnJoinRoom.addEventListener('click', () => {
  const code = joinCodeInput.value.trim();
  const name = playerNameInput.value.trim() || 'Commander 2';
  if (!code) {
    return showAlert('Please enter a valid 4-character room code.');
  }
  socket.emit('join_room', { roomCode: code, playerName: name });
});

// Auto-uppercase room code input
joinCodeInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.toUpperCase();
});

// Toggle Ready
btnToggleReady.addEventListener('click', () => {
  socket.emit('toggle_ready');
  playBeep(523, 0.05);
});

// Host Start Game
btnStartGame.addEventListener('click', () => {
  socket.emit('start_game');
  playBeep(659, 0.1);
});

// Comms Chat Submit
commForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = commInput.value.trim();
  if (text) {
    socket.emit('send_comm', { text: text });
    commInput.value = '';
    playBeep(523, 0.03);
  }
});

// Return to Lobby (Host)
btnReturnLobby.addEventListener('click', () => {
  socket.emit('restart_game');
});

// Utility: HTML Escape
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

