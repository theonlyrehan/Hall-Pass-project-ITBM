const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Pause Button to HUD
if (!html.includes('id="pauseBtn"')) {
  html = html.replace(
    '<div class="hud-card" id="coin-display">',
    '<div class="hud-card" id="pauseBtn" style="cursor:pointer; background:rgba(200,50,50,0.8); margin-right:10px;">⏸ PAUSE</div>\n  <div class="hud-card" id="coin-display">'
  );
}

// 2. Add Pause Menu HTML
const pauseScreenHTML = `
<!-- Pause Screen -->
<div class="screen" id="pause-screen" style="display:none; z-index:50;">
  <div class="arcade-frame" style="border-color:#2a88ff; box-shadow:8px 8px 0px #ffe600, 12px 12px 0px #000;">
    <h1 class="go-title" style="color:#2a88ff; text-shadow:4px 4px 0px #000;">PAUSED</h1>
    <div class="btn-group" style="flex-direction:column; gap:15px; margin-top:20px;">
      <button class="retro-btn" id="resumeBtn">▶ RESUME</button>
      <button class="retro-btn retro-btn-char" id="restartFromPauseBtn">🔄 RESTART</button>
      <button class="retro-btn retro-btn-sec" id="menuFromPauseBtn">🏠 MENU</button>
    </div>
  </div>
</div>
`;
if (!html.includes('id="pause-screen"')) {
  html = html.replace('<div id="flash"></div>', pauseScreenHTML + '\n<div id="flash"></div>');
}

// 3. Add Pause Logic to JS
const pauseLogicJS = `
// ================================================================
//  PAUSE LOGIC INJECTED
// ================================================================
const pauseScreen = document.getElementById('pause-screen');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartFromPauseBtn = document.getElementById('restartFromPauseBtn');
const menuFromPauseBtn = document.getElementById('menuFromPauseBtn');

function togglePause() {
  if (STATE === 'playing') {
    STATE = 'paused';
    pauseScreen.style.display = 'flex';
  } else if (STATE === 'paused') {
    STATE = 'playing';
    pauseScreen.style.display = 'none';
  }
}

pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);
restartFromPauseBtn.addEventListener('click', () => {
  pauseScreen.style.display = 'none';
  startGame();
});
menuFromPauseBtn.addEventListener('click', () => {
  pauseScreen.style.display = 'none';
  document.getElementById('menu').style.display = 'flex';
  STATE = 'menu';
});

// Bind P and Escape to toggle pause
window.addEventListener('keydown', e => {
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (STATE === 'playing' || STATE === 'paused') {
      togglePause();
    }
  }
});
`;

if (!html.includes('PAUSE LOGIC INJECTED')) {
  html = html.replace('// ================================================================', pauseLogicJS + '\n// ================================================================');
}

fs.writeFileSync('index.html', html);
console.log('Pause logic added!');
