// Authoritative Deterministic Game Engine for AI Crisis Command

const { ROLES, CRISES, GENERAL_ACTIONS } = require('./crises');
const NovaAI = require('./novaAI');

class GameRoom {
  constructor(roomCode, hostId, hostName) {
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.createdAt = Date.now();
    
    // Players map: socketId -> Player
    this.players = new Map();
    this.addPlayer(hostId, hostName, true);

    // Game lifecycle state: 'LOBBY', 'ACTION_PHASE', 'ROUND_RESOLUTION', 'GAME_OVER'
    this.state = 'LOBBY';

    // Shared City Statistics (0 - 100)
    this.cityStats = {
      integrity: 75,       // Main health/civic stability
      safety: 80,          // Civilian protection & casualty avoidance
      infrastructure: 75,  // Power, transit, communication lines
      resources: 70        // Emergency funding, fuel, equipment
    };

    this.round = 0;
    this.maxRounds = CRISES.length; // 4 crises
    this.currentCrisis = null;

    // Timer management
    this.timerSeconds = 0;
    this.timerInterval = null;

    // Actions submitted for current round: playerId -> actionObj
    this.submittedActions = new Map();

    // History log of actions and round debriefs
    this.incidentLogs = [];
    this.totalActionsTaken = 0;
    this.lastRoundResolution = null;
    this.finalDebrief = null;
  }

  addPlayer(socketId, name, isHost = false) {
    if (this.players.size >= 8) return false;
    
    // Auto-pick first available role or unassigned
    const assignedRoleIds = Array.from(this.players.values()).map(p => p.roleId);
    const availableRole = ROLES.find(r => !assignedRoleIds.includes(r.id)) || ROLES[0];

    this.players.set(socketId, {
      id: socketId,
      name: name || `Commander ${this.players.size + 1}`,
      isHost: isHost,
      roleId: availableRole.id,
      roleName: availableRole.name,
      roleIcon: availableRole.icon,
      isReady: false,
      hasSubmittedAction: false
    });
    return true;
  }

  removePlayer(socketId) {
    const wasHost = this.players.get(socketId)?.isHost;
    this.players.delete(socketId);
    this.submittedActions.delete(socketId);

    // If host left, elect new host
    if (wasHost && this.players.size > 0) {
      const nextHost = this.players.values().next().value;
      nextHost.isHost = true;
      this.hostId = nextHost.id;
    }
  }

  setPlayerRole(socketId, roleId) {
    const player = this.players.get(socketId);
    if (!player) return false;
    
    // Check if role is taken by someone else
    const isTaken = Array.from(this.players.values()).some(p => p.id !== socketId && p.roleId === roleId);
    if (isTaken) return false;

    const role = ROLES.find(r => r.id === roleId);
    if (!role) return false;

    player.roleId = role.id;
    player.roleName = role.name;
    player.roleIcon = role.icon;
    return true;
  }

  toggleReady(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      player.isReady = !player.isReady;
      return player.isReady;
    }
    return false;
  }

  canStartGame() {
    if (this.players.size < 2) return { canStart: false, reason: 'At least 2 players are required to start.' };
    return { canStart: true };
  }

  startGame(onStateChange, onTimerTick) {
    const check = this.canStartGame();
    if (!check.canStart) return check;

    this.state = 'ACTION_PHASE';
    this.round = 1;
    this.cityStats = { integrity: 75, safety: 80, infrastructure: 75, resources: 70 };
    this.incidentLogs = [];
    this.totalActionsTaken = 0;
    this.startRound(onStateChange, onTimerTick);
    return { canStart: true };
  }

  startRound(onStateChange, onTimerTick) {
    this.state = 'ACTION_PHASE';
    this.submittedActions.clear();
    for (const player of this.players.values()) {
      player.hasSubmittedAction = false;
    }

    const crisisData = CRISES[this.round - 1];
    this.currentCrisis = crisisData;
    this.timerSeconds = crisisData.timerSeconds || 40;

    // Generate NOVA tactical briefing
    const activePlayersList = Array.from(this.players.values());
    this.currentNovaBriefing = NovaAI.generateBriefing(crisisData, this.cityStats, activePlayersList);

    this.addLog(`--- ROUND ${this.round}: ${crisisData.title} ---`, 'alert');
    this.addLog(this.currentCrisis.threatDescription, 'info');

    // Notify initial state
    if (onStateChange) onStateChange();

    // Start synchronized timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      if (onTimerTick) onTimerTick(this.timerSeconds);

      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.resolveRound(onStateChange, onTimerTick);
      }
    }, 1000);
  }

  submitAction(socketId, actionId, onStateChange, onTimerTick) {
    if (this.state !== 'ACTION_PHASE') return false;
    const player = this.players.get(socketId);
    if (!player || player.hasSubmittedAction) return false;

    // Find the action in player's role actions or general actions
    const roleActions = (this.currentCrisis.actions && this.currentCrisis.actions[player.roleId]) || [];
    let action = roleActions.find(a => a.id === actionId);
    if (!action) {
      action = GENERAL_ACTIONS.find(a => a.id === actionId);
    }
    if (!action) return false;

    player.hasSubmittedAction = true;
    this.submittedActions.set(socketId, {
      player: player,
      action: action
    });
    this.totalActionsTaken++;

    const commentary = NovaAI.getActionCommentary(player.name, player.roleName, action);
    this.addLog(commentary, 'action');

    // If all players submitted actions, resolve early!
    const allSubmitted = Array.from(this.players.values()).every(p => p.hasSubmittedAction);
    if (allSubmitted) {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.resolveRound(onStateChange, onTimerTick);
    } else {
      if (onStateChange) onStateChange();
    }
    return true;
  }

  resolveRound(onStateChange, onTimerTick) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.state = 'ROUND_RESOLUTION';

    // 1. Authoritative Deterministic Calculation:
    // Scale base threat slightly with player count: 2 players = 0.8x threat, 4 players = 1.0x, 8 players = 1.4x
    const playerCount = Math.max(1, this.players.size);
    const scalingFactor = 0.6 + (playerCount * 0.1);

    const base = this.currentCrisis.baseThreat;
    const scaledThreat = {
      integrity: Math.round(base.integrity * scalingFactor),
      safety: Math.round(base.safety * scalingFactor),
      infrastructure: Math.round(base.infrastructure * scalingFactor),
      resources: Math.round(base.resources * scalingFactor)
    };

    // 2. Sum up action effects
    const actionEffects = { integrity: 0, safety: 0, infrastructure: 0, resources: 0 };
    const executedActions = [];

    for (const { player, action } of this.submittedActions.values()) {
      executedActions.push({
        playerName: player.name,
        roleName: player.roleName,
        actionLabel: action.label,
        effects: action.effects
      });

      for (const [stat, val] of Object.entries(action.effects)) {
        if (actionEffects[stat] !== undefined) {
          actionEffects[stat] += val;
        }
      }
    }

    // 3. Synergy bonuses (deterministic rewards for cooperative combinations)
    const synergyBonuses = [];
    const submittedRoleIds = new Set(Array.from(this.submittedActions.values()).map(item => item.player.roleId));

    if (submittedRoleIds.has('safety_chief') && submittedRoleIds.has('medical_lead')) {
      actionEffects.safety += 6;
      synergyBonuses.push('COOPERATIVE SYNERGY: Rapid Evacuation Triage (+6 Public Safety)');
    }
    if (submittedRoleIds.has('infra_director') && submittedRoleIds.has('cyber_officer')) {
      actionEffects.infrastructure += 6;
      synergyBonuses.push('COOPERATIVE SYNERGY: Hardened Grid Cyber-Shield (+6 Infrastructure)');
    }
    if (submittedRoleIds.has('env_specialist') && submittedRoleIds.has('intel_analyst')) {
      actionEffects.safety += 4;
      actionEffects.integrity += 4;
      synergyBonuses.push('COOPERATIVE SYNERGY: Guided Chemical/Flood Countermeasures (+4 Safety, +4 Integrity)');
    }
    if (submittedRoleIds.has('logistics_coordinator') && submittedRoleIds.has('city_admin')) {
      actionEffects.resources += 8;
      synergyBonuses.push('COOPERATIVE SYNERGY: Streamlined Federal Aid Pipeline (+8 Resources)');
    }

    // 4. Net stat change calculation
    const netChanges = {
      integrity: scaledThreat.integrity + actionEffects.integrity,
      safety: scaledThreat.safety + actionEffects.safety,
      infrastructure: scaledThreat.infrastructure + actionEffects.infrastructure,
      resources: scaledThreat.resources + actionEffects.resources
    };

    // Apply deterministic changes with clamping between 0 and 100
    this.cityStats.integrity = Math.max(0, Math.min(100, this.cityStats.integrity + netChanges.integrity));
    this.cityStats.safety = Math.max(0, Math.min(100, this.cityStats.safety + netChanges.safety));
    this.cityStats.infrastructure = Math.max(0, Math.min(100, this.cityStats.infrastructure + netChanges.infrastructure));
    this.cityStats.resources = Math.max(0, Math.min(100, this.cityStats.resources + netChanges.resources));

    // 5. NOVA AI round debrief analysis
    const debrief = NovaAI.generateRoundDebrief(
      this.currentCrisis,
      netChanges,
      this.cityStats,
      this.submittedActions.size
    );

    this.lastRoundResolution = {
      round: this.round,
      crisisTitle: this.currentCrisis.title,
      threatImpact: scaledThreat,
      actionTotal: actionEffects,
      netChanges: netChanges,
      synergies: synergyBonuses,
      actions: executedActions,
      debrief: debrief
    };

    this.addLog(`Round ${this.round} Resolution: ${debrief.rating} - ${debrief.netSummary}`, 'resolution');

    // 6. Win / Loss Condition Check
    const cityCollapsed = this.cityStats.integrity <= 0 || this.cityStats.safety <= 0 || this.cityStats.infrastructure <= 0;
    const isLastRound = this.round >= this.maxRounds;

    if (onStateChange) onStateChange();

    // After 6 seconds in resolution screen, proceed to next round or game over
    setTimeout(() => {
      if (cityCollapsed) {
        this.endGame(false, onStateChange);
      } else if (isLastRound) {
        this.endGame(true, onStateChange);
      } else {
        this.round++;
        this.startRound(onStateChange, onTimerTick);
      }
    }, 6500);
  }

  endGame(isVictory, onStateChange) {
    this.state = 'GAME_OVER';
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.finalDebrief = NovaAI.generateFinalDebrief(
      isVictory,
      this.cityStats,
      this.round,
      this.totalActionsTaken
    );

    this.addLog(
      isVictory ? `MISSION VICTORY: All crises averted!` : `MISSION FAILED: City stability collapsed!`,
      isVictory ? 'victory' : 'defeat'
    );

    if (onStateChange) onStateChange();
  }

  resetToLobby() {
    this.state = 'LOBBY';
    this.round = 0;
    this.currentCrisis = null;
    this.submittedActions.clear();
    this.incidentLogs = [];
    this.lastRoundResolution = null;
    this.finalDebrief = null;
    this.cityStats = { integrity: 75, safety: 80, infrastructure: 75, resources: 70 };
    for (const player of this.players.values()) {
      player.isReady = false;
      player.hasSubmittedAction = false;
    }
  }

  addLog(message, type = 'info') {
    this.incidentLogs.push({
      time: new Date().toLocaleTimeString(),
      text: message,
      type: type
    });
    if (this.incidentLogs.length > 50) this.incidentLogs.shift();
  }

  getPublicState(requestingSocketId) {
    const playerList = Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      roleId: p.roleId,
      roleName: p.roleName,
      roleIcon: p.roleIcon,
      isReady: p.isReady,
      hasSubmittedAction: p.hasSubmittedAction
    }));

    const currentPlayer = this.players.get(requestingSocketId);
    let myRoleActions = [];
    if (this.currentCrisis && currentPlayer) {
      myRoleActions = (this.currentCrisis.actions && this.currentCrisis.actions[currentPlayer.roleId]) || [];
    }

    return {
      roomCode: this.roomCode,
      hostId: this.hostId,
      state: this.state,
      round: this.round,
      maxRounds: this.maxRounds,
      timerSeconds: this.timerSeconds,
      cityStats: this.cityStats,
      players: playerList,
      currentCrisis: this.currentCrisis ? {
        id: this.currentCrisis.id,
        round: this.currentCrisis.round,
        title: this.currentCrisis.title,
        subtitle: this.currentCrisis.subtitle,
        severity: this.currentCrisis.severity,
        threatDescription: this.currentCrisis.threatDescription,
        baseThreat: this.currentCrisis.baseThreat
      } : null,
      novaBriefing: this.currentNovaBriefing || null,
      myRoleActions: myRoleActions,
      generalActions: GENERAL_ACTIONS,
      lastRoundResolution: this.lastRoundResolution,
      finalDebrief: this.finalDebrief,
      recentLogs: this.incidentLogs.slice(-15),
      availableRoles: ROLES
    };
  }
}

module.exports = GameRoom;

