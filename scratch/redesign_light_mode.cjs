const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.css');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the appended block at the bottom
const appendedBlockMarker = '/* =========================================\r\n   LIGHT THEME OVERRIDES & FIXES\r\n   ========================================= */';
const appendedBlockMarkerLF = '/* =========================================\n   LIGHT THEME OVERRIDES & FIXES\n   ========================================= */';

const markerIndex = content.indexOf(appendedBlockMarker) !== -1 
  ? content.indexOf(appendedBlockMarker) 
  : content.indexOf(appendedBlockMarkerLF);

if (markerIndex !== -1) {
  content = content.substring(0, markerIndex);
}

// 2. Globally replace hardcoded dark hex colors with CSS variables (so they naturally adapt to themes)
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

replacements.forEach(r => {
  content = content.replace(r.pattern, r.replacement);
});

// Protect :root declaration
content = content.replace('--border-light: var(--border-light);', '--border-light: #ffffff1a;');

// 3. Redesign body.light-theme completely!
const newLightModeVariables = `body.light-theme {
  --bg-dark: #f8fafc;
  --bg-card: rgba(255, 255, 255, 0.7);
  --bg-card-hover: rgba(255, 255, 255, 0.95);
  --border-light: rgba(148, 163, 184, 0.2);
  --text-main: #0f172a;
  --text-muted: #64748b;
  --bg-active-light: rgba(59, 130, 246, 0.1);
  background-color: #f8fafc;
  background-image: 
    radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.12) 0px, transparent 50%), 
    radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.12) 0px, transparent 50%),
    linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  background-attachment: fixed;
}`;

// Use regex to replace the existing body.light-theme block (lines 17-25 approx)
content = content.replace(/body\.light-theme\s*\{[\s\S]*?\}/, newLightModeVariables);

// 4. Inject specific beautiful overrides for Glassmorphism Light Mode!
const beautifulGlassmorphism = `

/* =========================================
   PREMIUM LIGHT THEME GLASSMORPHISM
   ========================================= */

body.light-theme .panel,
body.light-theme .summary-card,
body.light-theme .modern-bar-card,
body.light-theme .chart-panel,
body.light-theme .popup-card,
body.light-theme .util-summary,
body.light-theme .left-sidebar,
body.light-theme .down-panel.full-screen,
body.light-theme .analyzing-section {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

body.light-theme .app-header {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

body.light-theme .input-group input,
body.light-theme .input-group textarea,
body.light-theme .select-wrapper select,
body.light-theme .date-display,
body.light-theme .calendar-dropdown {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  color: var(--text-main);
}

body.light-theme .input-group input:focus,
body.light-theme .input-group textarea:focus,
body.light-theme .select-wrapper select:focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

body.light-theme .fault-popup-content,
body.light-theme .modal-content {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

body.light-theme .export-btn,
body.light-theme .filter-btn,
body.light-theme .chart-style-toggle-group button {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  color: var(--text-muted);
}

body.light-theme .export-btn:hover,
body.light-theme .filter-btn:hover,
body.light-theme .chart-style-toggle-group button:hover {
  background: #ffffff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  color: var(--text-main);
}

body.light-theme .filter-btn.active,
body.light-theme .chart-style-toggle-group button.active {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
}

body.light-theme .fault-popup-close {
  color: var(--text-muted);
}
body.light-theme .fault-popup-close:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fca5a5;
}

/* Typography fix */
body.light-theme h2,
body.light-theme h3 {
  color: #1e293b;
}

body.light-theme .summary-card .value,
body.light-theme .actual-value {
  color: #0f172a;
}

/* Explode animation for pie chart */
.recharts-pie-sector {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  outline: none;
  transform-origin: center;
  transform-box: fill-box;
}

.recharts-pie-sector:hover {
  transform: scale(1.08);
  filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3));
  z-index: 10;
}
`;

fs.writeFileSync(filePath, content + beautifulGlassmorphism, 'utf8');
console.log('Premium Light Mode Glassmorphism Theme applied successfully!');
