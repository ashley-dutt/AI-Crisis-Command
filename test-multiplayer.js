// Test script to verify 2-player multiplayer flow
const { io } = require('socket.io-client');

async function runTest() {
  console.log('Testing 2-player multiplayer flow on http://localhost:3000 ...');

  const p1 = io('http://localhost:3000');
  const p2 = io('http://localhost:3000');

  let roomCode = null;

  await new Promise((resolve) => {
    let connected = 0;
    p1.on('connect', () => {
      console.log('Player 1 connected:', p1.id);
      connected++;
      if (connected === 2) resolve();
    });
    p2.on('connect', () => {
      console.log('Player 2 connected:', p2.id);
      connected++;
      if (connected === 2) resolve();
    });
  });

  // Player 1 creates room
  p1.emit('create_room', { playerName: 'Commander Alpha' });

  await new Promise((resolve) => {
    p1.on('room_created', (data) => {
      roomCode = data.roomCode;
      console.log('Room created successfully. Code:', roomCode);
      resolve();
    });
  });

  // Player 2 joins room
  p2.emit('join_room', { roomCode: roomCode, playerName: 'Commander Bravo' });

  await new Promise((resolve) => {
    p2.on('joined_room', (data) => {
      console.log('Player 2 successfully joined room:', data.roomCode);
      resolve();
    });
  });

  // Player 2 selects Infrastructure Lead
  p2.emit('select_role', { roleId: 'infra_director' });

  // Ready up
  p1.emit('toggle_ready');
  p2.emit('toggle_ready');

  // Wait a moment and verify both players are in state
  await new Promise(r => setTimeout(r, 500));

  // Host starts game
  console.log('Host launching operation...');
  p1.emit('start_game');

  // Verify game state is ACTION_PHASE and Round 1 begins
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Game start timed out')), 5000);
    p1.on('game_state', (state) => {
      if (state.state === 'ACTION_PHASE') {
        clearTimeout(timeout);
        console.log(`Game started! Round: ${state.round}, Crisis: ${state.currentCrisis.title}`);
        console.log(`Initial City Vitals:`, state.cityStats);
        console.log(`NOVA Directive:`, state.novaBriefing.primaryDirective);
        resolve();
      }
    });
  });

  // Both players submit actions
  console.log('Submitting actions for both commanders...');
  p1.emit('submit_action', { actionId: 'sc_traffic_patrol' });
  p2.emit('submit_action', { actionId: 'id_isolate_substations' });

  // Verify resolution occurs
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Round resolution timed out')), 5000);
    p1.on('game_state', (state) => {
      if (state.state === 'ROUND_RESOLUTION') {
        clearTimeout(timeout);
        console.log('Round 1 successfully resolved!');
        console.log('Resolution Rating:', state.lastRoundResolution.debrief.rating);
        console.log('Net Stat Changes:', state.lastRoundResolution.netChanges);
        console.log('Updated City Stats:', state.cityStats);
        resolve();
      }
    });
  });

  p1.disconnect();
  p2.disconnect();
  console.log('ALL 2-PLAYER MULTIPLAYER TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

