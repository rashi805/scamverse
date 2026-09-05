const fs = require('fs');
const path = require('path');

const map = {
  'text-slate-100': 'text-slate-900 dark:text-slate-100',
  'text-slate-200': 'text-slate-800 dark:text-slate-200',
  'text-slate-300': 'text-slate-700 dark:text-slate-300',
  'text-slate-400': 'text-slate-500 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-500',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'bg-slate-900/60': 'bg-surfaceAlt',
  'bg-slate-800': 'bg-surfaceAlt',
  'bg-slate-700': 'bg-border',
  'border-slate-700': 'border-border',
  'border-slate-600': 'border-border',
  'text-cyber-bg': 'text-white',
  'bg-surface': 'bg-surface shadow-sm',
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [oldClass, newClass] of Object.entries(map)) {
      content = content.split(oldClass).join(newClass);
    }
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
