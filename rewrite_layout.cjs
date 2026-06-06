const fs = require('fs');

try {
  let content = fs.readFileSync('src/App.jsx', 'utf8');

  // We need to carefully extract the components.
  // We'll search for the main return block and replace it.
  
  // Find the start of the return statement
  const returnStartRegex = /return\s*\(\s*<>\s*<div className="app-container/;
  const match = content.match(returnStartRegex);
  if (!match) throw new Error("Could not find start of App return statement");
  
  let beforeReturn = content.substring(0, match.index);
  
  // Find the header section
  const headerStart = content.indexOf('<header className="app-header">', match.index);
  const headerEndStr = '</header>';
  const headerEnd = content.indexOf(headerEndStr, headerStart) + headerEndStr.length;
  let headerHTML = content.substring(headerStart, headerEnd);
  
  // Inject sidebar toggle into header
  headerHTML = headerHTML.replace(
    '<div className="header-left">',
    '<div className="header-left">\n            <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>\n              <Menu size={20} />\n            </button>'
  );

  // Find the controls
  // Station
  const stationStart = content.indexOf('<div className="input-group">', headerEnd);
  let controls = [];
  let currentIndex = stationStart;
  for (let i=0; i<3; i++) {
    let divEnd = content.indexOf('</div>', currentIndex);
    // actually, input-group has select/input inside.
    let fullGroupEnd = content.indexOf('</div>', content.indexOf('</div>', currentIndex) + 6) + 6;
    // this is brittle. Let's just use regex for the whole top-bar.
  }
  
  const topBarStart = content.indexOf('<div className="top-bar">');
  const topBarEnd = content.indexOf('</div>', content.indexOf('<button className="generate-btn"')) + 6 + 6; // </div> of top-bar might be further down
  
  // Let's just find the entire top-bar div by matching div nesting
  function getBlock(str, startIdx) {
      let openCount = 0;
      let i = startIdx;
      while (i < str.length) {
          if (str.substr(i, 4) === '<div') openCount++;
          if (str.substr(i, 5) === '</div') {
              openCount--;
              if (openCount === 0) return str.substring(startIdx, i + 6);
          }
          i++;
      }
      return null;
  }
  
  const topBarHtml = getBlock(content, topBarStart);
  
  // Extract inputs and button from top-bar
  const stationRegex = /<div className="input-group">[\s\S]*?Station[\s\S]*?<\/div>\s*<\/div>/;
  const assetRegex = /<div className="input-group">[\s\S]*?Asset Codes[\s\S]*?<\/div>/;
  const dateRegex = /<div className="input-group">[\s\S]*?Date Range[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const generateBtnRegex = /<button className="generate-btn"[\s\S]*?<\/button>/;
  
  const stationInput = topBarHtml.match(stationRegex)[0];
  const assetInput = topBarHtml.match(assetRegex)[0];
  const dateInput = topBarHtml.match(dateRegex)[0];
  const generateBtn = topBarHtml.match(generateBtnRegex)[0];

  // Extract the panels
  const conditionStart = content.indexOf('{conditionData && (');
  let conditionPanel = content.substring(conditionStart, content.indexOf(')}', conditionStart) + 2);
  
  const utilStart = content.indexOf('{utilSummary && (');
  let utilPanel = content.substring(utilStart, content.indexOf(')}', utilStart) + 2);
  
  const idleStart = content.indexOf('{idleTimeData.length > 0 && (');
  let idlePanel = content.substring(idleStart, content.indexOf(')}', idleStart) + 2);
  
  const categoryStart = content.indexOf('{outputFaultChartType === \'pie\'');
  let categoryPanelStr = getBlock(content, content.lastIndexOf('<div ref={panelRef}', categoryStart));
  if(!categoryPanelStr) categoryPanelStr = getBlock(content, content.lastIndexOf('<div className="panel chart-panel down-panel"', categoryStart));
  
  const paretoStart = content.indexOf('<div className="panel chart-panel pareto-panel">');
  const paretoPanel = getBlock(content, paretoStart);
  
  const pmStart = content.indexOf('activeCondition === \'PM\'');
  let pmPanel = getBlock(content, content.indexOf('<div className="panel chart-panel pm-panel">', pmStart));

  // Extract Tables
  const eqpDetailsStart = content.indexOf('<h2>Equipment Details</h2>');
  const eqpDetailsPanel = getBlock(content, content.lastIndexOf('<div className="panel table-panel"', eqpDetailsStart));
  
  const detailedRecordsStart = content.indexOf('<h2>Equipment Detailed Records</h2>');
  const detailedRecordsPanel = getBlock(content, content.lastIndexOf('<div className="panel table-panel"', detailedRecordsStart));

  // Extract popup overlay
  const popupStart = content.indexOf('{popupOpen && popupData && (');
  const popupEndStr = '</div>\n          )}\n        </main>\n      </div>\n    </>\n  );';
  const popupPanelMatch = content.substring(popupStart);
  const popupPanel = popupPanelMatch.substring(0, popupPanelMatch.indexOf(popupEndStr));

  // Reassemble
  const newLayout = `
      ${headerHTML}

      <div className="main-content">
        <aside className={\`left-sidebar \${!isSidebarOpen ? 'sidebar-closed' : ''}\`}>
          <div className="sidebar-inner">
            <div className="controls-group">
              ${stationInput}
              ${assetInput}
              ${dateInput}
            </div>
            ${generateBtn}
          </div>
        </aside>

        <div className="dashboard-content">
          {loading && (
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px', marginBottom: '20px' }}>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: \`\${(progress.current / Math.max(progress.total, 1)) * 100}%\` }}></div>
                </div>
              </div>
              <p className="progress-text">Analyzing data: {progress.current} / {progress.total} incidents processed</p>
            </div>
          )}

          {!loading && !conditionData && !error && (
            <div className="empty-state-container">
              <h2>Ready for Analysis</h2>
              <p>Select a station, enter your asset codes, and specify a date range to generate comprehensive downtime analytics.</p>
            </div>
          )}

          {!loading && error && (
            <div className="alert-message error-message">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {!loading && success && (
            <div className="alert-message success-message">
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          {!loading && conditionData && (
            <div className="dashboard-grid">
              
              <div className="grid-row-top">
                ${categoryPanelStr}
                ${conditionPanel}
              </div>

              <div className="grid-row-middle">
                ${utilPanel}
                ${idlePanel}
              </div>

              <div className="grid-row-bottom">
                ${paretoPanel}
                ${pmPanel}
              </div>
              
              <div className="grid-row-bottom">
                ${eqpDetailsPanel}
              </div>
              
              <div className="grid-row-bottom">
                ${detailedRecordsPanel}
              </div>

            </div>
          )}
        </div>
      </div>

      ${popupPanel}
    </>
  );
}
`;

  const finalContent = beforeReturn + 'return (\n    <>\n' + newLayout;
  
  // add Menu to lucide-react imports if not there
  let newFinalContent = finalContent;
  if (!newFinalContent.includes('Menu,')) {
      newFinalContent = newFinalContent.replace(/import {([^}]+)} from 'lucide-react';/, (match, p1) => {
          return "import { Menu, " + p1 + " } from 'lucide-react';";
      });
  }

  fs.writeFileSync('src/App.jsx.new', newFinalContent, 'utf8');
  console.log("Successfully generated src/App.jsx.new");
} catch(e) {
  console.error(e);
}
