const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The first script injected it poorly. Let's fix it by appending the logic at the end instead.
const pauseLogicJS = `
<script>
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
</script>
`;

if (!html.includes('PAUSE LOGIC INJECTED')) {
  html = html.replace('</body>', pauseLogicJS + '\n</body>');
} else {
  // If it's already there (mangled), let's just clean it up.
  // Wait, the previous script DID inject it... somewhere. Let's just find and replace the badly placed block.
  html = html.replace(/\/\/ ================================================================\n\/\/  PAUSE LOGIC INJECTED[\s\S]*?\/\/ ================================================================/, '');
  html = html.replace('</body>', pauseLogicJS + '\n</body>');
}

fs.writeFileSync('index.html', html);
console.log('Pause logic added correctly!');
