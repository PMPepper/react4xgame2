const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '.');
const srcDir = path.join(root, 'src');

function walk(dir, cb) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, cb);
    } else {
      cb(fullPath);
    }
  });
}

const jsxFiles = [];
walk(srcDir, file => {
  if (!file.endsWith('.js')) return;
  const text = fs.readFileSync(file, 'utf8');
  if (/<\s*[A-Za-z\/]/.test(text) && /return\s*<|^\s*<|=>\s*</m.test(text)) {
    jsxFiles.push(file);
  }
});

if (!jsxFiles.length) {
  console.log('No JSX-bearing .js files found.');
  process.exit(0);
}

const renamed = jsxFiles.map(file => {
  const target = file.slice(0, -3) + '.jsx';
  fs.renameSync(file, target);
  return { oldPath: file, newPath: target };
});

const allFiles = [];
walk(srcDir, file => {
  if (/\.(js|jsx|ts|tsx)$/.test(file)) allFiles.push(file);
});

const replacePath = p => p.replace(/\\/g, '/');
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  renamed.forEach(({ oldPath, newPath }) => {
    const relOld = replacePath(path.relative(path.dirname(file), oldPath));
    const relNew = replacePath(path.relative(path.dirname(file), newPath));
    const patterns = [relOld, './' + relOld, '../' + relOld, './' + relOld.replace(/^\.\//, '')];
    const escaped = escapeRegex(relOld);
    const regex = new RegExp(`(['\"])${escaped}\1`, 'g');
    const escapedNew = relNew;
    content = content.replace(regex, `$1${escapedNew}$1`);
    if (content !== fs.readFileSync(file, 'utf8')) {
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log('Renamed', renamed.length, '.js files to .jsx');
renamed.forEach(({ oldPath, newPath }) => {
  console.log(`- ${oldPath} -> ${newPath}`);
});
