const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Colors
content = content.replace(/stroke="#94a3b8"/g, 'stroke="var(--text-muted)"');
content = content.replace(/fill: '#94a3b8'/g, 'fill: \'var(--text-muted)\'');
content = content.replace(/stroke: '#334155'/g, 'stroke: \'var(--border-light)\'');
content = content.replace(/stroke="rgba\(255,255,255,0\.1\)"/g, 'stroke="var(--border-light)"');
content = content.replace(/backgroundColor: 'rgba\(15, 23, 42, 0\.9\)'/g, 'backgroundColor: \'var(--bg-card)\'');
content = content.replace(/borderColor: '#334155'/g, 'borderColor: \'var(--border-light)\'');
content = content.replace(/color: '#f8fafc'/g, 'color: \'var(--text-main)\'');
content = content.replace(/color: '#ffffff'/g, 'color: \'var(--text-main)\'');
content = content.replace(/color: '#cbd5e1'/g, 'color: \'var(--text-muted)\'');
content = content.replace(/background: 'rgba\(15,23,42,0\.5\)'/g, 'background: \'var(--bg-card)\'');
content = content.replace(/border: '1px solid rgba\(255,255,255,0\.05\)'/g, 'border: \'1px solid var(--border-light)\'');
content = content.replace(/rgba\(255,255,255,0\.05\)/g, 'var(--border-light)');
content = content.replace(/rgba\(0,0,0,0\.2\)/g, 'var(--bg-card)');
content = content.replace(/rgba\(59, 130, 246, 0\.2\)/g, 'var(--bg-active-light, rgba(59, 130, 246, 0.2))');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Colors replaced successfully!');
