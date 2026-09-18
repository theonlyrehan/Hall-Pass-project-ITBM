const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Variables
const powerupVars = `
let allPowerups = [];
let magnetActive = false;
let energyActive = false;
let shieldActive = false;
let powerupTimer = 0;
let samosaMult = 1;
let shieldMesh = null;
let energyParticle = null;
`;
html = html.replace('let allCoins     = [];', 'let allCoins     = [];\n' + powerupVars);

// 2. Add Powerup spawning logic in spawnObstaclesInChunk
const powerupSpawnLogic = `
  // 20% chance to spawn a powerup in this chunk
  if (Math.random() < 0.20 && zStart < -SAFE_ZONE) {
    const lane = Math.floor(Math.random() * 3);
    const pz = zStart - Math.random() * CHUNK_LEN;
    
    // Check if it's clear
    const isBlocked = occupiedZones.some(zone => {
      const isSameLane = (zone.lane === -1 || zone.lane === lane);
      return isSameLane && (pz >= zone.zMin && pz <= zone.zMax);
    });
    
    if (!isBlocked) {
      const pRoll = Math.random();
      let type, mesh;
      if (pRoll < 0.33) { type = 'magnet'; mesh = makeMagnet(); }
      else if (pRoll < 0.66) { type = 'energy'; mesh = makeEnergyDrink(); }
      else { type = 'shield'; mesh = makeHallPass(); }
      
      mesh.position.set(LANE_X[lane], 1.0, pz);
      scene.add(mesh);
      
      const pObj = { mesh, type, zPos: pz, lane };
      allPowerups.push(pObj);
      
      // Need a way to track chunk association so it gets removed.
      // We will push to obsArr just for chunk cleanup
      obsArr.push({ group: mesh, _isPowerup: true }); 
    }
  }
`;
html = html.replace('function spawnObstaclesInChunk(zStart, obsArr, occupiedZones) {', 'function spawnObstaclesInChunk(zStart, obsArr, occupiedZones) {\n' + powerupSpawnLogic);

// 3. Add Powerup Pickup Logic
const powerupPickupLogic = `
  // Powerups
  for (let i = allPowerups.length - 1; i >= 0; i--) {
    const p = allPowerups[i];
    p.mesh.rotation.y += 0.05;
    if (Math.abs(p.zPos - pZ) < 1.5 && Math.abs(LANE_X[p.lane] - pX) < 1.5 && pY < 2.0) {
      // Picked up!
      scene.remove(p.mesh);
      allPowerups.splice(i, 1);
      activatePowerup(p.type);
    }
  }
`;
html = html.replace('function checkCoinPickups() {', 'function checkCoinPickups() {\n' + powerupPickupLogic);

// 4. Powerup Activation Function
const activatePowerupJS = `
function activatePowerup(type) {
  SFX.jump(); // Re-use sound
  if (type === 'shield') {
    shieldActive = true;
    if (!shieldMesh) {
      shieldMesh = mesh(cyl(1.5, 1.5, 0.1, 16), matPhong(0xffd700, { transparent:true, opacity:0.5 }));
      shieldMesh.position.y = 1.0;
      playerMesh.add(shieldMesh);
    }
    shieldMesh.visible = true;
  } else if (type === 'magnet') {
    magnetActive = true;
    powerupTimer = 10;
  } else if (type === 'energy') {
    if (!energyActive) {
      speed += 6;
      samosaMult = 2;
    }
    energyActive = true;
    powerupTimer = 10;
  }
}

function updatePowerups(dt) {
  if (magnetActive || energyActive) {
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
}
`;
html = html.replace('//  BOOT', activatePowerupJS + '\n// ================================================================\n//  BOOT');

// 5. Magnet Physics & Update Call
const magnetLogic = `
  if (magnetActive) {
    allCoins.forEach(c => {
      if (c.position.z - pZ < 0 && c.position.z - pZ > -15) {
        // Move towards player
        const dx = pX - c.position.x;
        const dz = pZ - c.position.z;
        const dy = (pY + 1.0) - c.position.y;
        c.position.x += dx * dt * 5;
        c.position.z += dz * dt * 5;
        c.position.y += dy * dt * 5;
      }
    });
  }
`;
html = html.replace('// Rotate Fans & Coins', 'updatePowerups(dt);\n  ' + magnetLogic + '\n  // Rotate Fans & Coins');

// Samosa multiplier
html = html.replace('runCoins++; progressMission("samosas", 1);', 'runCoins += samosaMult; progressMission("samosas", samosaMult);');

// 6. Shield logic in collisions
const shieldCollision = `
    if (hit) {
      if (shieldActive) {
        shieldActive = false;
        if (shieldMesh) shieldMesh.visible = false;
        // Destroy the obstacle
        scene.remove(obs.group);
        allObs.splice(i, 1);
        SFX.swipe();
        continue;
      }
      return true;
    }
`;
html = html.replace('if (hit) return true;', shieldCollision);

fs.writeFileSync('index.html', html);
console.log('Powerups logic implemented!');
