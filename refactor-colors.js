import fs from 'fs';
import path from 'path';

const dir = './src';

const replacements = [
  { regex: /bg-black/g, replace: 'bg-void' },
  { regex: /bg-\[\#000000\]/g, replace: 'bg-void' },
  { regex: /text-\[\#607575\]/g, replace: 'text-fg' },
  { regex: /text-\[\#33ffff\]/g, replace: 'text-cyan' },
  { regex: /border-\[\#33ffff\]/g, replace: 'border-cyan' },
  { regex: /bg-\[\#33ffff\]/g, replace: 'bg-cyan' },
  
  { regex: /bg-\[\#050d0d\]/g, replace: 'bg-surface' },
  { regex: /bg-\[\#030808\]/g, replace: 'bg-surface' },
  { regex: /bg-\[\#030a08\]/g, replace: 'bg-surface' },
  { regex: /bg-\[\#0a0800\]/g, replace: 'bg-surface' }, // Warning bg
  
  { regex: /bg-\[\#0a1a1a\]/g, replace: 'bg-base' },
  
  { regex: /border-\[\#0d1a1a\]/g, replace: 'border-layer' },
  { regex: /border-\[\#0d2020\]/g, replace: 'border-layer' },
  { regex: /border-\[\#2a1a0a\]/g, replace: 'border-layer' },
  
  { regex: /text-\[\#304040\]/g, replace: 'text-dim' },
  { regex: /text-\[\#405050\]/g, replace: 'text-dim-brt' },
  { regex: /text-\[\#507070\]/g, replace: 'text-dim-brt' },
  
  { regex: /text-\[\#4a7a7a\]/g, replace: 'text-accent' },
  { regex: /text-\[\#335252\]/g, replace: 'text-accent-dim' },
  { regex: /border-\[\#335252\]/g, replace: 'border-accent-dim' },
  
  // Specific analysis alert colors
  { regex: /text-\[\#4a7a5c\]/g, replace: 'text-success' },
  { regex: /border-\[\#335240\]/g, replace: 'border-success' },
  { regex: /bg-\[\#0a1a10\]/g, replace: 'bg-success-dim' },
  
  { regex: /text-\[\#7a6a4a\]/g, replace: 'text-warning' },
  { regex: /border-\[\#524833\]/g, replace: 'border-warning' },
  { regex: /bg-\[\#1a1500\]/g, replace: 'bg-warning-dim' },
  
  { regex: /text-\[\#7a4a4a\]/g, replace: 'text-error' },
  { regex: /border-\[\#523333\]/g, replace: 'border-error' },
  { regex: /bg-\[\#1a0a0a\]/g, replace: 'bg-error-dim' },
  
  // Opacity variations
  { regex: /bg-black\/90/g, replace: 'bg-void/90' },
  { regex: /text-\[\#33ffff\]\/50/g, replace: 'text-cyan/50' },
  { regex: /border-\[\#33ffff\]\/30/g, replace: 'border-cyan/30' },
];

function processDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replace } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(dir);
console.log('Done replacing colors.');
