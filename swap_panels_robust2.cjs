const fs = require('fs');

try {
  let content = fs.readFileSync('src/App.jsx', 'utf8');

  // Find Pareto panel start and end
  const paretoStartStr = '<div className="panel chart-panel pareto-panel">';
  const paretoStart = content.indexOf(paretoStartStr);
  if (paretoStart === -1) throw new Error("Could not find Pareto panel start");
  
  const paretoEndIndexMatch = content.match(/<\/div>\s*\{conditionData && \(/);
  if (!paretoEndIndexMatch) throw new Error("Could not find Pareto panel end");
  const paretoEnd = paretoEndIndexMatch.index + 6; // include </div>
  const paretoPanel = content.substring(paretoStart, paretoEnd);

  // Find Category panel start and end
  const catStartStr = '<div ref={panelRef} className={`panel chart-panel down-panel ${isFullScreen ? \'full-screen\' : \'\'}`}>';
  const catStart = content.indexOf(catStartStr);
  if (catStart === -1) throw new Error("Could not find Category panel start");
  
  const catEndRegex = /<\/ComposedChart>\s*<\/ResponsiveContainer>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>/;
  const catEndMatch = content.match(catEndRegex);
  if (!catEndMatch) throw new Error("Could not find Category panel end");
  const catEndIndex = catEndMatch.index + catEndMatch[0].length;
  const catPanel = content.substring(catStart, catEndIndex);

  // Find end of Condition panel
  const conditionRegex = /<ConditionBar label="PM"[\s\S]*?\n\s*\)\}/;
  const conditionMatch = content.match(conditionRegex);
  if (!conditionMatch) throw new Error("Could not find Condition panel end");
  const conditionEndIndex = conditionMatch.index + conditionMatch[0].length;

  console.log("Found all panels safely. Proceeding with swap...");

  // Let's find the entire block of `grid-row-top` inner content.
  const topGridRegex = /(<div className="grid-row-top">)[\s\S]*?(<div className="panel chart-panel pareto-panel">[\s\S]*?<\/div>)\s*(\{conditionData && \([\s\S]*?\)\})/;
  const topGridMatch = content.match(topGridRegex);
  if (!topGridMatch) throw new Error("Could not match top grid row");
  
  // Create new top grid
  const newTopGrid = `${topGridMatch[1]}\n                ${topGridMatch[3]}\n\n                ${catPanel}`;
  
  // Replace the old top grid
  content = content.replace(topGridMatch[0], newTopGrid);
  
  // Now we need to replace the original Category panel with the Pareto panel
  content = content.replace(catPanel, paretoPanel);

  fs.writeFileSync('src/App.jsx', content, 'utf8');
  console.log("Swap completed successfully!");
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
