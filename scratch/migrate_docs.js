const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'app', 'docs');
const destDir = path.join(__dirname, '..', 'docs-site', 'app');

const foldersToMove = [
  'architecture',
  'contracts',
  'features',
  'implementation',
  'setup',
  'usage'
];

foldersToMove.forEach(folder => {
  const src = path.join(srcDir, folder);
  const dest = path.join(destDir, folder);
  
  if (fs.existsSync(src)) {
    // Note: this assumes the destination doesn't exist yet, which it shouldn't.
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${folder} to docs-site/app/${folder}`);
  }
});
