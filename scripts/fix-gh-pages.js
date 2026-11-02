import fs from 'fs';
import path from 'path';

if (!process.env.GITHUB_ACTIONS || process.env.DEPLOY_TARGET === 'cloudways') {
  process.exit(0);
}

const distDir = path.resolve('dist');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (/\.(html|js|css|json)$/i.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/(['"\(]|&quot;)\/(assets|tokens)\//g, '$1/the-abc-pro-dev/$2/');
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

walk(distDir);
console.log('GitHub Pages asset paths patched with /the-abc-pro-dev prefix.');
