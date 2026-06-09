const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// The layout replace block starts at:
const startMarker = '<div className="top-metrics-wrapper"';
const endMarker = '{/* Bottom row: Table */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const beforeBlock = content.substring(0, startIndex);
const afterBlock = content.substring(endIndex);

// We need to extract the 3 panels from the middle block.
// 1. Trend Panel
const trendStartStr = '{/* Left: Trend Panel */}';
const trendEndStr = '{/* Right: Context specific panel */}';
const trendStartIdx = content.indexOf(trendStartStr);
const trendEndIdx = content.indexOf(trendEndStr);
const trendPanelRaw = content.substring(trendStartIdx + trendStartStr.length, trendEndIdx).trim();

// 2. Faults Panel
// Wait, the Faults Panel is wrapped in {(activeCondition === 'RUN' || activeCondition === 'DOWN') && (
const faultStartStr = `<div ref={panelRef} className={\`panel chart-panel down-panel \${isFullScreen ? 'full-screen' : ''}\`}>`;
// The panel closes with </div> </div> (chart-wrapper and panel)
// Let's find it.
const faultStartIndex = content.indexOf(faultStartStr);
// We know Output Quantity Analysis comes after it.
// Let's use a simple brace/div matcher or just find the end.
const faultEndStr = `{activeCondition === 'IDLE' && (`;
const faultEndIndex = content.indexOf(faultEndStr);
let faultPanelRaw = content.substring(faultStartIndex, faultEndIndex);
// Trim the trailing spaces and `)}` from the condition.
faultPanelRaw = faultPanelRaw.substring(0, faultPanelRaw.lastIndexOf('</div>') + 6).trim();

// 3. Output Panel
const outputStartStr = '<div className="panel chart-panel output-panel">';
const outputEndStr = '{activeCondition === \'DOWN\' && (';
const outputStartIndex = content.indexOf(outputStartStr);
const outputEndIndex = content.indexOf(outputEndStr);
let outputPanelRaw = content.substring(outputStartIndex, outputEndIndex);
// Trim trailing spaces and `</div> </div> )}`
outputPanelRaw = outputPanelRaw.substring(0, outputPanelRaw.lastIndexOf('</div>') + 6).trim();

// Construct the new layout
const newLayout = `
                <div className="dashboard-2x2-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  
                  {/* Top Left: Conditions */}
                  <div className="panel chart-panel">
                    <div className="panel-header">
                      <h2>Actual device condition</h2>
                      <p className="subtitle">Global Average</p>
                    </div>
                    <div className="chart-wrapper condition-bars-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', padding: '10px 0' }}>
                      {conditionData && (
                        <>
                          <ConditionBar label="Running" actual={conditionData.run} kpi={KPI.RUN} isGte={true} isActive={activeCondition === 'RUN'} onClick={() => setActiveCondition('RUN')} />
                          <ConditionBar label="Idle" actual={conditionData.idle} kpi={KPI.IDLE} isGte={false} isActive={activeCondition === 'IDLE'} onClick={() => setActiveCondition('IDLE')} />
                          <ConditionBar label="Maintenance" actual={conditionData.down} kpi={KPI.DOWN} isGte={false} isActive={activeCondition === 'DOWN'} onClick={() => setActiveCondition('DOWN')} />
                          <ConditionBar label="PM" actual={conditionData.pm} kpi={KPI.PM} isGte={false} isActive={activeCondition === 'PM'} onClick={() => setActiveCondition('PM')} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Top Right: Trend Panel */}
                  ${trendPanelRaw}

                  {/* Bottom Left: Output Quantity Analysis */}
                  ${outputPanelRaw}

                  {/* Bottom Right: Faults Dropdown Panel */}
                  ${faultPanelRaw}

                </div>

`;

fs.writeFileSync(targetFile, beforeBlock + newLayout + afterBlock);
console.log("Layout updated successfully.");
