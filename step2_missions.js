const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Mission UI to Main Menu
const missionMenuHTML = `
    <div id="mission-card" style="background: #111424; border: 2px dashed #00ffcc; padding: 10px; margin-top: 15px; width: 100%; color: #fff;">
      <div style="font-size:10px; color:#00ffcc; margin-bottom:5px;">🎯 CURRENT MISSION</div>
      <div id="mission-desc" style="font-size:12px; margin-bottom:5px;">Loading...</div>
      <div style="width:100%; background:#333; height:10px; border:1px solid #fff;">
        <div id="mission-progress-bar" style="width:0%; background:#ffe600; height:100%;"></div>
      </div>
      <div id="mission-progress-text" style="font-size:10px; text-align:right; margin-top:5px; color:#aaa;">0/0</div>
    </div>
`;
// Insert before .controls-card in menu
html = html.replace('<div class="controls-card">', missionMenuHTML + '\n    <div class="controls-card">');

// 2. Add Mission Complete Popup to HUD
const missionPopupHTML = `
  <div id="mission-popup" class="hud-card" style="display:none; top:70px; left:50%; transform:translateX(-50%); background:rgba(0,255,204,0.9); border-color:#fff; color:#000; text-align:center; padding:15px; box-shadow:0px 0px 20px #00ffcc;">
    <div style="font-size:14px; font-weight:bold; margin-bottom:5px;">🌟 MISSION COMPLETE! 🌟</div>
    <div id="mission-popup-reward" style="font-size:16px; color:#ffe600; text-shadow:1px 1px 0px #000;">+500 🥟</div>
  </div>
`;
html = html.replace('<div class="hud-card" id="pauseBtn"', missionPopupHTML + '\n  <div class="hud-card" id="pauseBtn"');

// 3. Inject Mission Logic Script
const missionLogicJS = `
// ================================================================
//  MISSIONS LOGIC
// ================================================================
const MISSION_TYPES = [
  { type: 'samosas', desc: 'Collect {target} Samosas in one run', targets: [20, 50, 100], reward: 200 },
  { type: 'slide', desc: 'Slide {target} times in one run', targets: [5, 15, 30], reward: 150 },
  { type: 'distance', desc: 'Run {target}m in one run', targets: [200, 500, 1000], reward: 300 },
  { type: 'jump', desc: 'Jump {target} times in one run', targets: [10, 25, 50], reward: 150 }
];

let activeMission = JSON.parse(localStorage.getItem('hp_mission'));
if (!activeMission) assignNewMission();

function assignNewMission() {
  const t = MISSION_TYPES[Math.floor(Math.random() * MISSION_TYPES.length)];
  const target = t.targets[Math.floor(Math.random() * t.targets.length)];
  activeMission = { type: t.type, desc: t.desc.replace('{target}', target), target: target, progress: 0, reward: t.reward, completed: false };
  saveMission();
}

function saveMission() {
  localStorage.setItem('hp_mission', JSON.stringify(activeMission));
  updateMissionUI();
}

function updateMissionUI() {
  const descEl = document.getElementById('mission-desc');
  const barEl = document.getElementById('mission-progress-bar');
  const textEl = document.getElementById('mission-progress-text');
  if (descEl) {
    descEl.textContent = activeMission.desc;
    const pct = Math.min(100, (activeMission.progress / activeMission.target) * 100);
    barEl.style.width = pct + '%';
    textEl.textContent = activeMission.progress + ' / ' + activeMission.target;
  }
}

function progressMission(type, amount=1) {
  if (activeMission.completed || activeMission.type !== type) return;
  
  if (type === 'distance') {
    activeMission.progress = Math.floor(amount);
  } else {
    activeMission.progress += amount;
  }

  if (activeMission.progress >= activeMission.target) {
    activeMission.progress = activeMission.target;
    activeMission.completed = true;
    completeMission();
  }
  // We do NOT save progress mid-run, so it resets if they die.
}

function completeMission() {
  const reward = activeMission.reward;
  totalCoins += reward;
  localStorage.setItem('hp_retro_coins', totalCoins);
  
  // Show popup
  const pop = document.getElementById('mission-popup');
  document.getElementById('mission-popup-reward').textContent = '+' + reward + ' 🥟';
  pop.style.display = 'block';
  setTimeout(() => { pop.style.display = 'none'; }, 3000);
  SFX.coin(); // Play sound
  
  // Assign next mission for next run
  assignNewMission();
}

// Hook into existing game loops
const _origJump = jump;
jump = function() {
  const res = _origJump();
  progressMission('jump', 1);
  return res;
};

const _origSlide = slide;
slide = function() {
  const res = _origSlide();
  progressMission('slide', 1);
  return res;
};
`;

html = html.replace('//  BOOT', missionLogicJS + '\n// ================================================================\n//  BOOT');

// 4. Hook coin collection & distance
// We need to inject into checkCoinPickups
html = html.replace(
  'runCoins++;', 
  'runCoins++; progressMission("samosas", 1);'
);

// Inject into update loop for distance
html = html.replace(
  'runScore = Math.floor(Math.max(0, -pZ));',
  'runScore = Math.floor(Math.max(0, -pZ)); progressMission("distance", runScore);'
);

// Ensure mission progress resets on Game Over (since it's "in one run")
html = html.replace(
  'function endGame() {',
  `function endGame() {
  if (!activeMission.completed) {
    activeMission.progress = 0; // Reset for next run
  }
  updateMissionUI();`
);

// Call updateMissionUI initially
html = html.replace('hudHS.textContent = `${highScore}m`;', 'hudHS.textContent = `${highScore}m`;\n  updateMissionUI();');

fs.writeFileSync('index.html', html);
console.log('Missions system implemented!');
