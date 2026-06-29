const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements to support dark/light mode
  // The current UI uses dark classes. We prefix them with `dark:` and add a light equivalent.
  
  // Backgrounds
  content = content.replace(/bg-slate-900\/(\d+)/g, 'bg-white/80 dark:bg-slate-900/$1');
  content = content.replace(/bg-slate-900(?![\/a-z0-9\-])/g, 'bg-white dark:bg-slate-900');
  
  content = content.replace(/bg-slate-950\/(\d+)/g, 'bg-slate-50 dark:bg-slate-950/$1');
  content = content.replace(/bg-slate-950(?![\/a-z0-9\-])/g, 'bg-slate-50 dark:bg-slate-950');

  content = content.replace(/bg-slate-800(?![\/a-z0-9\-])/g, 'bg-slate-100 dark:bg-slate-800');
  content = content.replace(/bg-slate-850(?![\/a-z0-9\-])/g, 'bg-slate-100 dark:bg-slate-850');
  content = content.replace(/bg-slate-700(?![\/a-z0-9\-])/g, 'bg-slate-200 dark:bg-slate-700');

  // Text
  content = content.replace(/text-white(?![\/a-z0-9\-])/g, 'text-slate-900 dark:text-white');
  content = content.replace(/text-slate-100(?![\/a-z0-9\-])/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-200(?![\/a-z0-9\-])/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-300(?![\/a-z0-9\-])/g, 'text-slate-600 dark:text-slate-300');
  content = content.replace(/text-slate-400(?![\/a-z0-9\-])/g, 'text-slate-500 dark:text-slate-400');
  content = content.replace(/text-slate-500(?![\/a-z0-9\-])/g, 'text-slate-400 dark:text-slate-500');

  // Borders
  content = content.replace(/border-slate-800(?![\/a-z0-9\-])/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/border-slate-850(?![\/a-z0-9\-])/g, 'border-slate-200 dark:border-slate-850');
  content = content.replace(/border-slate-700(?![\/a-z0-9\-])/g, 'border-slate-300 dark:border-slate-700');
  
  // Hover Backgrounds
  content = content.replace(/hover:bg-slate-800(?![\/a-z0-9\-])/g, 'hover:bg-slate-200 dark:hover:bg-slate-800');
  content = content.replace(/hover:bg-slate-700(?![\/a-z0-9\-])/g, 'hover:bg-slate-300 dark:hover:bg-slate-700');
  
  // Prevent double dark:dark: 
  content = content.replace(/dark:dark:/g, 'dark:');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

traverseDir(path.join(__dirname, 'src', 'app'));
