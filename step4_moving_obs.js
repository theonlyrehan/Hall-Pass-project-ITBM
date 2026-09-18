const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add update() call in game loop
html = html.replace(
  '// Collision Checks',
  'allObs.forEach(o => { if (o.update) o.update(dt); });\n  // Collision Checks'
);

// 2. Add moving obstacles
const movingObs = `
  movingCart(lane) {
    const g = new THREE.Group();
    addBox(g, 1.0, 0.92, 1.6, M.cartBody, 0, 0.75, 0);
    addBox(g, 1.1, 0.08, 1.7, M.cartMetal, 0, 1.25, 0);
    g.position.x = LANE_X[lane];
    return {
      group: g, type: 'dodge', lane,
      hw: 0.6, yMin: 0, yMax: 1.5, hd: 0.8,
      update: function(dt) {
        this.group.position.x += this.vx * dt;
        if (this.group.position.x > 3.0) { this.group.position.x = 3.0; this.vx *= -1; }
        if (this.group.position.x < -3.0) { this.group.position.x = -3.0; this.vx *= -1; }
      },
      vx: (Math.random() < 0.5 ? -2.5 : 2.5)
    };
  },

  paperAirplane(lane) {
    const g = new THREE.Group();
    addBox(g, 0.6, 0.05, 0.8, matPhong(0xffffff), 0, 1.4, 0);
    addBox(g, 0.05, 0.4, 0.4, matPhong(0xffffff), 0, 1.2, -0.2);
    g.position.x = LANE_X[lane];
    return {
      group: g, type: 'duck', lane,
      hw: 0.4, yMin: 1.0, yMax: 1.8, hd: 0.5,
      update: function(dt) {
        this.group.position.z += 8 * dt; 
        this.zPos = this.group.position.z;
      }
    };
  },
`;

html = html.replace('canteenCart(lane) {', movingObs + '\n  canteenCart(lane) {');

// 3. Add to keys
html = html.replace(
  'const DODGE_KEYS    = [\'canteenCart\'];',
  'const DODGE_KEYS    = [\'canteenCart\', \'movingCart\'];'
);
html = html.replace(
  'const DUCK_KEYS     = [\'fan\', \'banner\', \'projectBoard\'];',
  'const DUCK_KEYS     = [\'fan\', \'banner\', \'projectBoard\', \'paperAirplane\'];'
);

fs.writeFileSync('index.html', html);
console.log('Moving obstacles implemented!');
