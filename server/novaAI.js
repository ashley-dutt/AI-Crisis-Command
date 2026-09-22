// NOVA AI Command System (Networked Operations Vector Assistant)
// Provides contextual analysis, real-time threat advisory, and after-action debriefs.
// All scoring and state changes remain strictly deterministic and authoritative.

class NovaAI {
  /**
   * Generates NOVA's opening tactical briefing for a crisis given the active room roles and city status.
   */
  static generateBriefing(crisis, cityStats, activePlayers) {
    const roleNames = activePlayers.map(p => p.roleName).filter(Boolean);
    const criticalStats = [];
    if (cityStats.integrity < 40) criticalStats.push('STRUCTURAL INTEGRITY');
    if (cityStats.safety < 40) criticalStats.push('PUBLIC CASUALTIES');
    if (cityStats.infrastructure < 40) criticalStats.push('POWER & TRANSIT INFRASTRUCTURE');
    if (cityStats.resources < 40) criticalStats.push('RESERVE SUPPLIES');

    let advisoryAlert = crisis.novaAdvisory;
    if (criticalStats.length > 0) {
      advisoryAlert += ` WARNING: Prior systemic damage detected in [${criticalStats.join(', ')}]. Additional vulnerability multipliers are active.`;
    }

    const recommendations = [];
    if (roleNames.length > 0) {
      recommendations.push(`Command team deployed: ${roleNames.slice(0, 3).join(', ')}${roleNames.length > 3 ? ' +' + (roleNames.length - 3) + ' more' : ''}.`);
    }

    // Role-specific tactical tips based on present players
    const presentRoleIds = new Set(activePlayers.map(p => p.roleId));
    if (presentRoleIds.has('infra_director') && crisis.baseThreat.infrastructure < -15) {
      recommendations.push('TACTICAL RECOM: Infrastructure Lead should prioritize substation & structural isolation.');
    }
    if (presentRoleIds.has('medical_lead') && crisis.baseThreat.safety < -15) {
      recommendations.push('TACTICAL RECOM: Triage Medical Lead must establish forward casualty treatment immediately.');
    }
    if (presentRoleIds.has('cyber_officer') && (crisis.id === 'crisis_1' || crisis.id === 'crisis_4')) {
      recommendations.push('TACTICAL RECOM: Cyber & Comms Officer must guard against digital subversion & DDoS floods.');
    }
    if (presentRoleIds.has('env_specialist') && (crisis.id === 'crisis_2' || crisis.id === 'crisis_3')) {
      recommendations.push('TACTICAL RECOM: Hazmat & Environmental Lead is pivotal for toxic plume scrubbing and water diversion.');
    }

    return {
      callsign: 'NOVA CORE // TACTICAL INTELLIGENCE',
      headline: `OPERATIONAL ANALYSIS: ${crisis.title.toUpperCase()}`,
      threatAssessment: crisis.threatDescription,
      primaryDirective: advisoryAlert,
      recommendations: recommendations.length > 0 ? recommendations : ['All available units synchronize simultaneous countermeasures before the countdown expires.']
    };
  }

  /**
   * Generates dynamic commentary when team members submit actions.
   */
  static getActionCommentary(playerName, roleName, action) {
    const templates = [
      `NOVA Telemetry: ${playerName} (${roleName}) deployed [${action.label}]. Mitigation in progress...`,
      `NOVA Command Feed: Unit action confirmed from ${roleName}. Telemetry registering impact vectors.`,
      `NOVA Vector Update: ${action.label} initiated by ${playerName}. Emergency responders advancing.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generates post-round debriefing.
   */
  static generateRoundDebrief(crisis, netChanges, newStats, actionsCount) {
    const netTotal = (netChanges.integrity || 0) + (netChanges.safety || 0) + (netChanges.infrastructure || 0) + (netChanges.resources || 0);

    let summaryText = '';
    let rating = '';

    if (netTotal >= 20) {
      rating = 'SUPERIOR MITIGATION';
      summaryText = `NOVA Debrief: Command response neutralized the bulk of ${crisis.title}. Strategic coordination minimized civic collateral damage.`;
    } else if (netTotal >= 0) {
      rating = 'CONTAINED WITH DAMAGE';
      summaryText = `NOVA Debrief: ${crisis.title} held at defensive perimeter. Key sectors sustained measurable wear, but catastrophic collapse was prevented.`;
    } else if (netTotal >= -20) {
      rating = 'CRITICAL OVERRUN';
      summaryText = `NOVA Debrief: Emergency response fell behind the hazard curve. Heavy degradation registered across municipal networks.`;
    } else {
      rating = 'SEVERE SYSTEMIC FAILURE';
      summaryText = `NOVA Debrief: Insufficient coordinated countermeasures. Cascade failures reported across multiple city districts.`;
    }

    return {
      rating,
      summary: summaryText,
      netSummary: `Integrity: ${netChanges.integrity > 0 ? '+' : ''}${netChanges.integrity}%, Safety: ${netChanges.safety > 0 ? '+' : ''}${netChanges.safety}%, Infrastructure: ${netChanges.infrastructure > 0 ? '+' : ''}${netChanges.infrastructure}%, Resources: ${netChanges.resources > 0 ? '+' : ''}${netChanges.resources}%`
    };
  }

  /**
   * Generates final operation debrief for victory or defeat.
   */
  static generateFinalDebrief(isVictory, finalStats, roundsCompleted, totalActions) {
    if (!isVictory) {
      return {
        verdict: 'CIVIC ORDER COLLAPSED',
        callsign: 'NOVA CRITICAL FAILURE ARCHIVE',
        grade: 'MISSION FAILED',
        message: 'City emergency threshold was breached. Municipal services collapsed under cascading disasters. Emergency rule has been transferred to external authorities.',
        metrics: finalStats
      };
    }

    const avgStat = Math.round((finalStats.integrity + finalStats.safety + finalStats.infrastructure + finalStats.resources) / 4);
    let grade = 'BRONZE COMMENDATION';
    if (avgStat >= 75) grade = 'LEGENDARY GOLD COMMENDATION';
    else if (avgStat >= 55) grade = 'SILVER COMMENDATION';

    return {
      verdict: 'ALL CRISES NEUTRALIZED - CITY SECURED',
      callsign: 'NOVA MISSION COMPLETION LOG',
      grade: grade,
      message: `The Crisis Command Team successfully survived all ${roundsCompleted} critical emergencies. Coordinated tactical deployments maintained civic order and infrastructure stability.`,
      metrics: finalStats,
      totalActions: totalActions
    };
  }
}

module.exports = NovaAI;

