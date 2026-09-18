const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Materials
const newMats = `
  magnetRed: matPhong(0xff2222),
  magnetSil: matPhong(0xdddddd),
  energyCan: matPhong(0x00ffff),
  hallPass: matPhong(0xffd700),
`;
html = html.replace('samosas: matPhong(0xffb732),', 'samosas: matPhong(0xffb732),\n' + newMats);

// 2. Add Powerup Generators
const newPowerups = `
function makeMagnet() {
  const g = new THREE.Group();
  addBox(g, 0.4, 0.15, 0.15, M.magnetRed, 0, 0, 0); // Bottom
  addBox(g, 0.15, 0.4, 0.15, M.magnetRed, -0.125, 0.275, 0); // Left arm
  addBox(g, 0.15, 0.4, 0.15, M.magnetRed, 0.125, 0.275, 0); // Right arm
  addBox(g, 0.15, 0.15, 0.15, M.magnetSil, -0.125, 0.55, 0); // Left tip
  addBox(g, 0.15, 0.15, 0.15, M.magnetSil, 0.125, 0.55, 0); // Right tip
  g.scale.set(1.5, 1.5, 1.5);
  return g;
}

function makeEnergyDrink() {
  const g = new THREE.Group();
  addCyl(g, 0.2, 0.2, 0.6, M.energyCan, 0, 0.3, 0);
  addCyl(g, 0.18, 0.18, 0.05, M.magnetSil, 0, 0.625, 0);
  g.scale.set(1.5, 1.5, 1.5);
  return g;
}

function makeHallPass() {
  const g = new THREE.Group();
  addBox(g, 0.6, 0.4, 0.05, M.hallPass, 0, 0.2, 0);
  g.scale.set(1.5, 1.5, 1.5);
  return g;
}
`;
html = html.replace('//  OBSTACLES DEFINITION', newPowerups + '\n// ================================================================\n//  OBSTACLES DEFINITION');

fs.writeFileSync('index.html', html);
console.log('Powerup materials and models added!');
