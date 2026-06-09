const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.css');
let content = fs.readFileSync(filePath, 'utf8');

// The goal is to replace explicitly hardcoded dark backgrounds with the CSS variables we defined.
// This allows them to switch correctly when body.light-theme is applied.

const replacements = [
  // Backgrounds
  { pattern: /background:\s*#0f172a[0-9a-f]{2,};?/g, replacement: 'background: var(--bg-card);' },
  { pattern: /background:\s*#0f172a;?/g, replacement: 'background: var(--bg-dark);' },
  { pattern: /background:\s*#1e293b[0-9a-f]{2,};?/g, replacement: 'background: var(--bg-card);' },
  { pattern: /background:\s*#1e293b;?/g, replacement: 'background: var(--bg-card);' },
  { pattern: /background:\s*linear-gradient\(135deg,\s*#1e293bf2\s*0%,\s*#0f172afa\s*100%\);?/g, replacement: 'background: var(--bg-card);' },
  
  // Minor transparent white backgrounds used for hover effects
  { pattern: /background:\s*#ffffff0d;?/g, replacement: 'background: var(--bg-card-hover);' },
  { pattern: /background:\s*#ffffff14;?/g, replacement: 'background: var(--bg-card-hover);' },
  { pattern: /background:\s*#ffffff1a;?/g, replacement: 'background: var(--bg-card-hover);' },
  { pattern: /background:\s*#ffffff26;?/g, replacement: 'background: var(--bg-card-hover);' },
  { pattern: /background:\s*#ffffff05;?/g, replacement: 'background: var(--bg-card-hover);' },

  // Borders
  { pattern: /border:\s*1px\s*solid\s*#ffffff[0-9a-f]{2};?/g, replacement: 'border: 1px solid var(--border-light);' },
  { pattern: /border-bottom:\s*1px\s*solid\s*#ffffff[0-9a-f]{2};?/g, replacement: 'border-bottom: 1px solid var(--border-light);' },
  { pattern: /border-bottom:\s*2px\s*solid\s*#ffffff[0-9a-f]{2};?/g, replacement: 'border-bottom: 2px solid var(--border-light);' },
  { pattern: /border-color:\s*#ffffff[0-9a-f]{2};?/g, replacement: 'border-color: var(--border-light);' },
  { pattern: /border-right:\s*1px\s*solid\s*#ffffff[0-9a-f]{2};?/g, replacement: 'border-right: 1px solid var(--border-light);' }
];

let newContent = content;

replacements.forEach(r => {
  newContent = newContent.replace(r.pattern, r.replacement);
});

// Avoid modifying :root variables definitions
newContent = newContent.replace('--border-light: var(--border-light);', '--border-light: #ffffff1a;');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('App.css variables substituted.');
