import fs from 'fs';

const path = './dist';

fs.copyFileSync(`${path}/index.html`, `${path}/404.html`);
console.log('✔ index.html copied to 404.html for GitHub Pages routing');
