const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const paretoStart = content.indexOf('<div className="panel chart-panel pareto-panel">');
const paretoEnd = content.indexOf('</div>\n\n                {conditionData && (', paretoStart) + 6;
const paretoPanel = content.substring(paretoStart, paretoEnd);

const catStartStr = '<div ref={panelRef} className={`panel chart-panel down-panel ${isFullScreen ? \'full-screen\' : \'\'}`}>';
const catStart = content.indexOf(catStartStr);
const catEndStr = '</ComposedChart>\n                            </ResponsiveContainer>\n                          </div>\n                        )}\n                      </div>\n                    </div>';
const catEndIndex = content.indexOf(catEndStr, catStart) + catEndStr.length;
const catPanel = content.substring(catStart, catEndIndex);

// Remove Pareto panel from its original position
content = content.replace(paretoPanel + '\n\n', '');

// Insert Category panel after condition-panel
const conditionEndStr = '<ConditionBar label="PM" actual={conditionData.pm} kpi={KPI.PM} isGte={false} isActive={activeCondition === \'PM\'} onClick={() => setActiveCondition(\'PM\')} />\n                    </div>\n                  </div>\n                )}';
const conditionEndIndex = content.indexOf(conditionEndStr) + conditionEndStr.length;

content = content.slice(0, conditionEndIndex) + '\n\n                ' + catPanel + content.slice(conditionEndIndex);

// Replace the original Category panel with Pareto panel
content = content.replace(catPanel, paretoPanel);

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log("Swap completed successfully!");
