const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix Pause Button Position
html = html.replace(
  'id="pauseBtn" style="cursor:pointer; background:rgba(200,50,50,0.8); margin-right:10px;"',
  'id="pauseBtn" style="cursor:pointer; background:rgba(200,50,50,0.8); right:140px; top:16px;"'
);

// 2. Fix Shadow Frustum
html = html.replace('dirLight.shadow.camera.left = -20;', 'dirLight.shadow.camera.left = -40;');
html = html.replace('dirLight.shadow.camera.right = 20;', 'dirLight.shadow.camera.right = 40;');
html = html.replace('dirLight.shadow.camera.top = 18;', 'dirLight.shadow.camera.top = 40;');
html = html.replace('dirLight.shadow.camera.bottom = -4;', 'dirLight.shadow.camera.bottom = -40;');

fs.writeFileSync('index.html', html);
console.log('UI and Shadows fixed!');
