const fs = require('fs');

const chars = ['bhargav', 'zyna', 'mahek', 'shreya', 'rehan'];
let html = fs.readFileSync('index.html', 'utf8');

const b64Data = {};
for (const char of chars) {
  const b64 = fs.readFileSync(char + '.jpg').toString('base64');
  b64Data[char] = 'data:image/jpeg;base64,' + b64;
}

const scriptStr = `
// ================================================================
//  INJECTED TEXTURE DATA
// ================================================================
const TEXTURE_DATA = ${JSON.stringify(b64Data)};
`;

// Insert the script block right after 'use strict';
html = html.replace("'use strict';", "'use strict';" + scriptStr);

// Also modify TextureLoader to use TEXTURE_DATA
html = html.replace("texLoader.load(charId + '.jpg', (texture) => {", "texLoader.load(TEXTURE_DATA[charId], (texture) => {");

fs.writeFileSync('index.html', html);
console.log('Injected images as base64!');
