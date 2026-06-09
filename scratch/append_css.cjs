const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.css');
let content = fs.readFileSync(filePath, 'utf8');

const newCSS = `

/* =========================================
   LIGHT THEME OVERRIDES & FIXES
   ========================================= */

body.light-theme {
  --bg-dark: #f1f5f9 !important;
  --bg-card: #ffffff !important;
  --bg-card-hover: #f8fafc !important;
  --border-light: #e2e8f0 !important;
  --text-main: #1e293b !important;
  --text-muted: #64748b !important;
  --bg-active-light: #eff6ff !important;
  background-image: none !important;
}

table th, table td { vertical-align: middle; }

.recharts-pie-sector { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); outline: none; transform-origin: center; transform-box: fill-box; }
.recharts-pie-sector:hover { transform: scale(1.08); filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3)); z-index: 10; }

.light-theme .fault-popup-content, .light-theme .modal-content, .light-theme .popup-body-split > div { background: var(--bg-card) !important; border-color: var(--border-light) !important; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; color: var(--text-main) !important; }
.light-theme .fault-popup-close { color: var(--text-muted) !important; background: transparent !important; border-color: var(--border-light) !important; }
.light-theme .fault-popup-close:hover { background: #fef2f2 !important; color: #ef4444 !important; border-color: #fca5a5 !important; }
.light-theme .popup-header { border-bottom: 1px solid var(--border-light) !important; }
.light-theme .popup-card { background: var(--bg-card-hover) !important; border: 1px solid var(--border-light) !important; }
.light-theme .popup-card h3 { color: var(--text-muted) !important; }
.light-theme .leaderboard-item { border-bottom: 1px solid var(--border-light) !important; }
.light-theme .popup-table th { color: var(--text-muted) !important; border-bottom: 2px solid var(--border-light) !important; }
.light-theme .popup-table td { color: var(--text-main) !important; border-bottom: 1px solid var(--border-light) !important; }
.light-theme .popup-table tr:hover, .light-theme .data-table tbody tr:hover, .light-theme .custom-table tr:hover { background: var(--bg-active-light) !important; }
.light-theme .down-panel.full-screen { background: var(--bg-card) !important; }
.light-theme select, .light-theme input, .light-theme textarea, .light-theme .export-btn, .light-theme .generate-btn { background: var(--bg-card) !important; border-color: var(--border-light) !important; color: var(--text-main) !important; }
.light-theme .analyzing-section { background: var(--bg-card) !important; border-color: var(--border-light) !important; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important; }
.light-theme .panel.chart-panel { background: var(--bg-card) !important; border: 1px solid var(--border-light) !important; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important; }
.light-theme .panel.chart-panel h3 { color: var(--text-muted) !important; }
.light-theme .select-wrapper select, .light-theme .input-group input, .light-theme .input-group textarea, .light-theme .date-display { background: var(--bg-card) !important; border: 1px solid var(--border-light) !important; color: var(--text-main) !important; }
.light-theme .calendar-dropdown { background: var(--bg-card) !important; border: 1px solid var(--border-light) !important; color: var(--text-main) !important; }
`;

fs.writeFileSync(filePath, content + newCSS, 'utf8');
console.log('Appended light mode overrides.');
