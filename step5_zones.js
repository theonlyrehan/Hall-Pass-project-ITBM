const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const zoneMats = `
  libFloor: matPhong(0x6b4226),
  libWall: matPhong(0xeedbcc),
  cafFloor: matPhong(0xadd8e6),
  cafWall: matPhong(0xfff0e6),
  bookcase: matPhong(0x3e2723),
  tableTop: matPhong(0xffffff),
`;
html = html.replace('floor: matPhong(0x3D3A40),', 'floor: matPhong(0x3D3A40),\n' + zoneMats);

// Refactor buildChunk
// First, find the function signature
const origBuildChunk = `function buildChunk(zOffset) {
  const g = new THREE.Group();`;

const zoneLogic = `function buildChunk(zOffset) {
  const g = new THREE.Group();
  const zoneIdx = Math.floor((-zOffset) / 500) % 3;

  let floorMat = M.floor;
  let wallTopMat = M.wallTop;
  let wallBotMat = M.wallBot;

  if (zoneIdx === 1) { // Library
    floorMat = M.libFloor;
    wallTopMat = M.libWall;
    wallBotMat = M.libWall;
  } else if (zoneIdx === 2) { // Cafeteria
    floorMat = M.cafFloor;
    wallTopMat = M.cafWall;
    wallBotMat = M.cafWall;
  }
`;

html = html.replace(origBuildChunk, zoneLogic);

// Replace the materials in the rest of buildChunk
html = html.replace('const fl = mesh(box(HALL_W, 0.4, CHUNK_LEN), M.floor);', 'const fl = mesh(box(HALL_W, 0.4, CHUNK_LEN), floorMat);');

html = html.replace(/addBox\(g, \S+, \S+, \S+, M\.wallTop/g, match => match.replace('M.wallTop', 'wallTopMat'));
html = html.replace(/addBox\(g, \S+, \S+, \S+, M\.wallBot/g, match => match.replace('M.wallBot', 'wallBotMat'));
html = html.replace(/mesh\(box\(\S+, \S+, \S+\), M\.wallBot/g, match => match.replace('M.wallBot', 'wallBotMat'));
html = html.replace(/mesh\(box\(\S+, \S+, \S+\), M\.wallTop/g, match => match.replace('M.wallTop', 'wallTopMat'));


// For the Lockers / Doors section:
// Let's replace the whole section starting from "// Props (Lockers / Posters)"
const propsOrig = `  // Props (Lockers / Posters)
  if (Math.random() > 0.3) {
    const lockers = mesh(box(0.6, 2.2, 3.8), M.lockers);
    lockers.position.set(-W/2 + 0.3, 1.1, -CHUNK_LEN/2 + 1);
    g.add(lockers);
  }
  if (Math.random() > 0.4) {
    const poster = mesh(box(0.1, 1.4, 0.9), M.board);
    poster.position.set(W/2 - 0.05, 2.0, -CHUNK_LEN/2 - 2);
    g.add(poster);
  }`;

const propsNew = `  // Props based on Zone
  if (zoneIdx === 0) { // Hallway
    if (Math.random() > 0.3) {
      const lockers = mesh(box(0.6, 2.2, 3.8), M.lockers);
      lockers.position.set(-HALL_W/2 + 0.3, 1.1, -CHUNK_LEN/2 + 1);
      g.add(lockers);
    }
    if (Math.random() > 0.4) {
      const poster = mesh(box(0.1, 1.4, 0.9), M.board);
      poster.position.set(HALL_W/2 - 0.05, 2.0, -CHUNK_LEN/2 - 2);
      g.add(poster);
    }
  } else if (zoneIdx === 1) { // Library
    if (Math.random() > 0.1) {
      // Bookshelves
      const shelf1 = mesh(box(1.2, 3.0, 4.0), M.bookcase);
      shelf1.position.set(-HALL_W/2 + 0.6, 1.5, -CHUNK_LEN/2 + 1);
      g.add(shelf1);
      
      const shelf2 = mesh(box(1.2, 3.0, 4.0), M.bookcase);
      shelf2.position.set(HALL_W/2 - 0.6, 1.5, -CHUNK_LEN/2 - 3);
      g.add(shelf2);
    }
  } else if (zoneIdx === 2) { // Cafeteria
    if (Math.random() > 0.2) {
      // Lunch Tables
      const table = new THREE.Group();
      addBox(table, 2.0, 0.1, 4.0, M.tableTop, 0, 0.8, 0);
      addCyl(table, 0.1, 0.1, 0.8, M.metal, -0.8, 0.4, 1.8);
      addCyl(table, 0.1, 0.1, 0.8, M.metal, 0.8, 0.4, 1.8);
      addCyl(table, 0.1, 0.1, 0.8, M.metal, -0.8, 0.4, -1.8);
      addCyl(table, 0.1, 0.1, 0.8, M.metal, 0.8, 0.4, -1.8);
      table.position.set(-HALL_W/2 + 1.2, 0, -CHUNK_LEN/2 + 1);
      g.add(table);
    }
  }`;

html = html.replace(propsOrig, propsNew);

// UI Indicator for Zone
// Add HUD element for Zone Notification
const zoneNotificationHTML = `
  <div id="zone-notification" style="display:none; position:fixed; top:30%; left:50%; transform:translateX(-50%); font-size:32px; color:#ffe600; text-shadow:4px 4px 0px #000; z-index:40; font-weight:bold;">
    ENTERING LIBRARY
  </div>
`;
html = html.replace('<div id="flash"></div>', zoneNotificationHTML + '\n<div id="flash"></div>');

// Add logic to show notification
const zoneTracker = `
let currentZoneIdx = 0;
function checkZoneTransition() {
  const zIdx = Math.floor((-pZ) / 500) % 3;
  if (zIdx !== currentZoneIdx) {
    currentZoneIdx = zIdx;
    const names = ["HALLWAY", "LIBRARY", "CAFETERIA"];
    const el = document.getElementById('zone-notification');
    el.textContent = "ENTERING " + names[zIdx];
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }
}
`;
html = html.replace('// Rotate Fans & Coins', zoneTracker + '\n  checkZoneTransition();\n  // Rotate Fans & Coins');


fs.writeFileSync('index.html', html);
console.log('Zones implemented!');
