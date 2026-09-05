const fs = require('fs');
const path = require('path');

const map = {
  'text-slate-900 dark:text-slate-100': 'text-text',
  'text-slate-800 dark:text-slate-200': 'text-text',
  'text-slate-700 dark:text-slate-300': 'text-textMuted',
  'text-slate-500 dark:text-slate-500 dark:text-slate-400': 'text-textMuted',
  'text-slate-500 dark:text-slate-500': 'text-textMuted',
  'text-slate-600 dark:text-slate-400': 'text-textMuted',
  'text-slate-400 hover:text-slate-900 dark:text-slate-100': 'text-textMuted hover:text-text',
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
    
    // Manual regex fix for App.jsx line 44
    content = content.replace(/'text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 border border-transparent hover:border-border'/g, "'text-textMuted hover:text-text border border-transparent hover:border-border'");

    for (const [oldClass, newClass] of Object.entries(map)) {
      content = content.split(oldClass).join(newClass);
    }
    
    // Also clean up leftover raw slate colors that might have been missed
    content = content.replace(/text-slate-900/g, 'text-text');
    content = content.replace(/text-slate-100/g, 'text-text');
    content = content.replace(/text-slate-200/g, 'text-text');
    content = content.replace(/text-slate-300/g, 'text-textMuted');
    content = content.replace(/text-slate-400/g, 'text-textMuted');
    content = content.replace(/text-slate-500/g, 'text-textMuted');
    content = content.replace(/text-slate-600/g, 'text-textMuted');
    content = content.replace(/text-slate-700/g, 'text-textMuted');
    content = content.replace(/text-slate-800/g, 'text-text');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned ${filePath}`);
    }
  }
});
