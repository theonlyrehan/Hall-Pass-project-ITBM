const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ============================================================
// 1. FIX POWERUP COLORS - Replace model functions
// ============================================================
html = html.replace(
`function makeMagnet() {
  const g = new THREE.Group();
  addBox(g, 0.4, 0.15, 0.15, M.magnetRed, 0, 0, 0); // Bottom
  addBox(g, 0.15, 0.4, 0.15, M.magnetRed, -0.125, 0.275, 0); // Left arm
  addBox(g, 0.15, 0.4, 0.15, M.magnetRed, 0.125, 0.275, 0); // Right arm
  addBox(g, 0.15, 0.15, 0.15, M.magnetSil, -0.125, 0.55, 0); // Left tip
  addBox(g, 0.15, 0.15, 0.15, M.magnetSil, 0.125, 0.55, 0); // Right tip
  g.scale.set(1.5, 1.5, 1.5);
  return g;
}`,
`function makeMagnet() {
  const g = new THREE.Group();
  const redM = matPhong(0xdd0000);
  const whiteM = matPhong(0xffffff);
  const silverM = matPhong(0xc0c0c0);
  // U-shape body
  addBox(g, 0.50, 0.18, 0.18, redM,   0,      0,      0); // Bottom bar
  addBox(g, 0.18, 0.55, 0.18, redM,  -0.16,  0.36,   0); // Left arm
  addBox(g, 0.18, 0.55, 0.18, redM,   0.16,  0.36,   0); // Right arm
  // White stripe across bottom bar
  addBox(g, 0.50, 0.06, 0.20, whiteM, 0,      0.06,   0);
  // Silver/white tips (opposite poles)
  addBox(g, 0.18, 0.16, 0.20, whiteM,-0.16,  0.70,   0);
  addBox(g, 0.18, 0.16, 0.20, silverM, 0.16,  0.70,   0);
  g.scale.set(1.8, 1.8, 1.8);
  return g;
}`
);

html = html.replace(
`function makeHallPass() {
  const g = new THREE.Group();
  addBox(g, 0.6, 0.4, 0.05, M.hallPass, 0, 0.2, 0);
  g.scale.set(1.5, 1.5, 1.5);
  return g;
}`,
`function makeHallPass() {
  const g = new THREE.Group();
  const cardM  = matPhong(0xffef99);  // yellow card
  const greenM = matPhong(0x228B22);  // green stripe
  const textM  = matPhong(0x000000);  // black for lines
  // Card body
  addBox(g, 0.75, 0.48, 0.06, cardM,  0, 0.24, 0);
  // Green top stripe (title bar)
  addBox(g, 0.75, 0.10, 0.07, greenM, 0, 0.44, 0);
  // 3 black lines representing text
  addBox(g, 0.50, 0.03, 0.07, textM,  0, 0.32, 0);
  addBox(g, 0.50, 0.03, 0.07, textM,  0, 0.22, 0);
  addBox(g, 0.30, 0.03, 0.07, textM, -0.10, 0.12, 0);
  // Gold shield outline ring around the card
  const ringM = matPhong(0xffd700);
  addBox(g, 0.85, 0.06, 0.07, ringM,  0,  0.51, 0); // top
  addBox(g, 0.85, 0.06, 0.07, ringM,  0, -0.03, 0); // bottom
  addBox(g, 0.06, 0.60, 0.07, ringM, -0.43, 0.24, 0); // left
  addBox(g, 0.06, 0.60, 0.07, ringM,  0.43, 0.24, 0); // right
  g.scale.set(1.6, 1.6, 1.6);
  return g;
}`
);

// ============================================================
// 2. FIX SHIELD - add logic in checkCollisions
// ============================================================
html = html.replace(
`    if (obs.type === 'duck') {
      if (pHeadY > obs.yMin) return true;
    } else if (obs.type === 'jump') {
      if (pFeetY < obs.yMax) return true;
    } else if (obs.type === 'dodge') {
      return true;
    }`,
`    let hit = false;
    if (obs.type === 'duck') {
      if (pHeadY > obs.yMin) hit = true;
    } else if (obs.type === 'jump') {
      if (pFeetY < obs.yMax) hit = true;
    } else if (obs.type === 'dodge') {
      hit = true;
    }
    if (hit) {
      if (shieldActive) {
        shieldActive = false;
        if (shieldMesh) shieldMesh.visible = false;
        // Flash the shield to show it was consumed
        SFX.swipe();
        continue;
      }
      return true;
    }`
);

// ============================================================
// 3. FIX ZONES - Replace buildChunk with zone-aware version
// ============================================================

// First inject zone-aware materials alongside existing M object
// Find the const M = { section and add after it
const zoneMatInsert = `
// Zone color sets - updated when zone changes
let ZONE_COLORS = {
  floorA: 0x808080,
  floorB: 0xA0A0A0,
  wallUp:  0xDDD8C8,
  wallLow: 0xB8B4A8,
};
function getZoneIndex() {
  return Math.floor(Math.max(0, -pZ) / 1000) % 3;
}
function applyZoneMats(zIdx) {
  if (zIdx === 0) { // Hallway
    ZONE_COLORS.floorA = 0x808080; ZONE_COLORS.floorB = 0xA0A0A0;
    ZONE_COLORS.wallUp  = 0xDDD8C8; ZONE_COLORS.wallLow = 0xB8B4A8;
  } else if (zIdx === 1) { // Library
    ZONE_COLORS.floorA = 0x7a5c3a; ZONE_COLORS.floorB = 0x5c3d20;
    ZONE_COLORS.wallUp  = 0xe8d5b0; ZONE_COLORS.wallLow = 0xc8a870;
  } else { // Cafeteria
    ZONE_COLORS.floorA = 0x90d0e8; ZONE_COLORS.floorB = 0xc0e0f0;
    ZONE_COLORS.wallUp  = 0xfff8f0; ZONE_COLORS.wallLow = 0xffe0c8;
  }
}
`;

html = html.replace('function buildChunk(zStart) {', zoneMatInsert + '\nfunction buildChunk(zStart) {');

// Now replace the floor tile section in buildChunk to be zone-aware
html = html.replace(
`  // ── FLOOR (Seamless Checkered Tiles) ──
  const nTZ = Math.round(L / tileS);
  const nTX = Math.round(W / tileS);
  for (let tz = 0; tz < nTZ; tz++) {
    for (let tx = 0; tx < nTX; tx++) {
      const m = mesh(
        box(tileS - 0.02, 0.04, tileS - 0.02),
        (tx + tz) % 2 === 0 ? M.floorA : M.floorB,
        { shadow: false, recv: true }
      );
      m.position.set(
        -W/2 + tx * tileS + tileS/2,
        -0.02,
        zStart - tz * tileS - tileS/2
      );
      g.add(m);
    }
  }`,
`  // ── FLOOR (Zone-Aware Tiles) ──
  const chunkZone = Math.floor(Math.max(0, -zStart) / 1000) % 3;
  applyZoneMats(chunkZone);
  const chunkFloorA = matPhong(ZONE_COLORS.floorA);
  const chunkFloorB = matPhong(ZONE_COLORS.floorB);
  const chunkWallUp  = matPhong(ZONE_COLORS.wallUp);
  const chunkWallLow = matPhong(ZONE_COLORS.wallLow);
  const nTZ = Math.round(L / tileS);
  const nTX = Math.round(W / tileS);
  for (let tz = 0; tz < nTZ; tz++) {
    for (let tx = 0; tx < nTX; tx++) {
      const m = mesh(
        box(tileS - 0.02, 0.04, tileS - 0.02),
        (tx + tz) % 2 === 0 ? chunkFloorA : chunkFloorB,
        { shadow: false, recv: true }
      );
      m.position.set(
        -W/2 + tx * tileS + tileS/2,
        -0.02,
        zStart - tz * tileS - tileS/2
      );
      g.add(m);
    }
  }`
);

// Replace the wall sections to use zone colors
html = html.replace(
  'addBox(g, 0.16, H * 0.55, L, M.wallUp,  -W/2 - 0.08, H * 0.725, zStart - L/2);\n  addBox(g, 0.16, H * 0.45, L, M.wallLow, -W/2 - 0.08, H * 0.225, zStart - L/2);',
  'addBox(g, 0.16, H * 0.55, L, chunkWallUp,  -W/2 - 0.08, H * 0.725, zStart - L/2);\n  addBox(g, 0.16, H * 0.45, L, chunkWallLow, -W/2 - 0.08, H * 0.225, zStart - L/2);'
);

html = html.replace(
  'addBox(g, 0.16, H, L, M.wallUp, W/2 + 0.08, H/2, zStart - L/2);',
  'addBox(g, 0.16, H, L, chunkWallUp, W/2 + 0.08, H/2, zStart - L/2);'
);

// Add zone-specific props before the final scene.add
const zoneProps = `
  // Zone-specific decorations
  if (chunkZone === 0) { // Hallway - lockers & bulletin boards
    if (Math.random() > 0.3) {
      const lockers = mesh(box(0.6, 2.2, 5.0), M.lockers);
      lockers.castShadow = true;
      lockers.position.set(-W/2 + 0.3, 1.1, zStart - L/2 + 1);
      g.add(lockers);
    }
    if (Math.random() > 0.4) {
      const poster = mesh(box(0.1, 1.4, 0.9), M.board);
      poster.position.set(W/2 - 0.05, 2.0, zStart - L/2 - 2);
      g.add(poster);
    }
  } else if (chunkZone === 1) { // Library - wooden bookshelves
    const shelfMat = matPhong(0x3e2723);
    const bookMats = [matPhong(0xff5252), matPhong(0x4caf50), matPhong(0x2196f3), matPhong(0xff9800)];
    for (let si = 0; si < 2; si++) {
      const sz = zStart - (si + 1) * (L / 3);
      const shelfGrp = new THREE.Group();
      addBox(shelfGrp, 1.2, 3.0, 0.4, shelfMat, 0, 1.5, 0); // back panel
      addBox(shelfGrp, 1.2, 0.08, 0.4, shelfMat, 0, 0.5, 0); // shelf 1
      addBox(shelfGrp, 1.2, 0.08, 0.4, shelfMat, 0, 1.2, 0); // shelf 2
      addBox(shelfGrp, 1.2, 0.08, 0.4, shelfMat, 0, 1.9, 0); // shelf 3
      addBox(shelfGrp, 1.2, 0.08, 0.4, shelfMat, 0, 2.6, 0); // shelf 4
      // books on shelves
      for (let b = 0; b < 6; b++) {
        addBox(shelfGrp, 0.14, 0.55, 0.38, bookMats[b % bookMats.length], -0.48 + b * 0.18, 0.83, 0);
      }
      for (let b = 0; b < 6; b++) {
        addBox(shelfGrp, 0.14, 0.55, 0.38, bookMats[(b+2) % bookMats.length], -0.48 + b * 0.18, 1.53, 0);
      }
      shelfGrp.position.set(-W/2 + 0.7, 0, sz);
      shelfGrp.castShadow = true;
      g.add(shelfGrp);
    }
    // Reading tables
    if (Math.random() > 0.5) {
      const tableMat = matPhong(0x5d4037);
      const tableGrp = new THREE.Group();
      addBox(tableGrp, 2.0, 0.08, 1.0, tableMat, 0, 0.75, 0);
      addBox(tableGrp, 0.08, 0.75, 0.08, tableMat, -0.9, 0.38, -0.4);
      addBox(tableGrp, 0.08, 0.75, 0.08, tableMat,  0.9, 0.38, -0.4);
      addBox(tableGrp, 0.08, 0.75, 0.08, tableMat, -0.9, 0.38,  0.4);
      addBox(tableGrp, 0.08, 0.75, 0.08, tableMat,  0.9, 0.38,  0.4);
      tableGrp.position.set(W/2 - 1.5, 0, zStart - L * 0.6);
      g.add(tableGrp);
    }
  } else if (chunkZone === 2) { // Cafeteria - lunch tables & trays
    const tableMat = matPhong(0xffffff);
    const benchMat = matPhong(0xb0bec5);
    for (let ti = 0; ti < 2; ti++) {
      const tz = zStart - (ti * 2 + 1) * (L / 5);
      const tGrp = new THREE.Group();
      // Table top
      addBox(tGrp, 3.0, 0.1, 0.8, tableMat, 0, 0.75, 0);
      // Legs
      addBox(tGrp, 0.1, 0.75, 0.1, benchMat, -1.4, 0.38, -0.35);
      addBox(tGrp, 0.1, 0.75, 0.1, benchMat,  1.4, 0.38, -0.35);
      addBox(tGrp, 0.1, 0.75, 0.1, benchMat, -1.4, 0.38,  0.35);
      addBox(tGrp, 0.1, 0.75, 0.1, benchMat,  1.4, 0.38,  0.35);
      // Benches
      addBox(tGrp, 3.0, 0.08, 0.4, benchMat, 0, 0.44, -0.7);
      addBox(tGrp, 3.0, 0.08, 0.4, benchMat, 0, 0.44,  0.7);
      // Food tray
      addBox(tGrp, 0.5, 0.04, 0.38, matPhong(0xa0a0ff), -0.8, 0.79, 0);
      addBox(tGrp, 0.5, 0.04, 0.38, matPhong(0xffa0a0), 0.5, 0.79, 0);
      tGrp.position.set(-W/2 + 1.8, 0, tz);
      g.add(tGrp);
    }
  }
`;

html = html.replace('  scene.add(g);\n  return g;\n}\n', zoneProps + '\n  scene.add(g);\n  return g;\n}\n');

// ============================================================
// 4. FIX ZONE NOTIFICATION - update to use 1000m distance
// ============================================================
html = html.replace(
  `const zIdx = Math.floor((-pZ) / 500) % 3;`,
  `const zIdx = Math.floor(Math.max(0, -pZ) / 1000) % 3;`
);
html = html.replace(
  `const chunkZone = Math.floor(Math.max(0, -zStart) / 500) % 3;`,
  `const chunkZone = Math.floor(Math.max(0, -zStart) / 1000) % 3;`
);

// ============================================================
// 5. REDUCE POWERUP SPAWN RATE - from 0.20 to 0.08
// ============================================================
html = html.replace(
  'if (Math.random() < 0.20 && zStart < -SAFE_ZONE) {',
  'if (Math.random() < 0.08 && zStart < -SAFE_ZONE) {'
);

// ============================================================
// 6. ADD POWERUP TIMER BAR TO HUD
// ============================================================
const powerupTimerHTML = `
  <div id="powerup-hud" class="hud-card" style="display:none; bottom:50px; left:50%; transform:translateX(-50%); background:#111424; border-color:#ffe600; text-align:center; min-width:200px; padding:10px 16px;">
    <div id="powerup-name" style="font-size:11px; color:#ffe600; margin-bottom:6px;">⚡ ENERGY</div>
    <div style="width:100%; background:#333; height:12px; border:2px solid #fff; border-radius:2px;">
      <div id="powerup-timer-bar" style="width:100%; height:100%; background:#00ffcc; transition:width 0.1s linear;"></div>
    </div>
  </div>
`;

// insert before flash div
html = html.replace('<div id="flash"></div>', powerupTimerHTML + '\n<div id="flash"></div>');

// inject JS to update the timer bar
const timerBarJS = `
const powerupHUD = document.getElementById('powerup-hud');
const powerupNameEl = document.getElementById('powerup-name');
const powerupTimerBarEl = document.getElementById('powerup-timer-bar');
const POWERUP_MAX_TIMER = 10;

function updatePowerupHUD() {
  const active = magnetActive || energyActive;
  if (active) {
    powerupHUD.style.display = 'block';
    const pct = Math.max(0, (powerupTimer / POWERUP_MAX_TIMER) * 100);
    powerupTimerBarEl.style.width = pct + '%';
    if (magnetActive) {
      powerupNameEl.textContent = '🧲 MAGNET';
      powerupTimerBarEl.style.background = '#ff4444';
    } else {
      powerupNameEl.textContent = '⚡ ENERGY';
      powerupTimerBarEl.style.background = '#00ffcc';
    }
  } else if (shieldActive) {
    powerupHUD.style.display = 'block';
    powerupNameEl.textContent = '🛡 SHIELD';
    powerupTimerBarEl.style.width = '100%';
    powerupTimerBarEl.style.background = '#ffd700';
  } else {
    powerupHUD.style.display = 'none';
  }
}
`;

// Add updatePowerupHUD call inside updatePowerups, and inject the JS vars before BOOT
html = html.replace(
  'function updatePowerups(dt) {',
  timerBarJS + '\nfunction updatePowerups(dt) {'
);

// Call updatePowerupHUD at end of updatePowerups
html = html.replace(
  `  if (magnetActive || energyActive) {
    powerupTimer -= dt;
    if (powerupTimer <= 0) {
      magnetActive = false;
      if (energyActive) {
        speed -= 6;
        samosaMult = 1;
        energyActive = false;
      }
    }
  }
}`,
  `  if (magnetActive || energyActive) {
    powerupTimer -= dt;
    if (powerupTimer <= 0) {
      magnetActive = false;
      if (energyActive) {
        speed -= 6;
        samosaMult = 1;
        energyActive = false;
      }
    }
  }
  updatePowerupHUD();
}`
);

fs.writeFileSync('index.html', html);
console.log('All fixes applied!');
