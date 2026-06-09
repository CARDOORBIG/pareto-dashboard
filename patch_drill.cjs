const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf-8');

// 1. Add states
const stateInsert = `
  const [faultCodesDrillDown, setFaultCodesDrillDown] = useState({});
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [isFaultModalVisible, setIsFaultModalVisible] = useState(false);
  const [selectedFaultRecords, setSelectedFaultRecords] = useState([]);
  const [selectedFaultTitle, setSelectedFaultTitle] = useState('');
`;
code = code.replace("const [faultCodesDrillDown, setFaultCodesDrillDown] = useState({});", stateInsert.trim());

// 2. Add mappedCategory to allSourceIncidents
let loopCodeOld = `      allSourceIncidents.forEach(inc => {
        const code = inc.code || "OTHER";
        let category = inc.category || "OTHER";

        // Re-classify based on code prefixes if category is not explicitly set to something else
        if (category === "OTHER" || !inc.category) {
          if (code.startsWith("HWDZ") || code.startsWith("HWYJ") || code.startsWith("MMYJ") || code.startsWith("RXYJ") || code.startsWith("TXYJ") || code.startsWith("RXJY") || code.startsWith("TXJY")) {
            category = "The device itself"; // Including RXJY ( ^O,,,) as The device itself per user example
          } else if (code.startsWith("RXRY") || code.startsWith("TXRY")) {
            category = "Human causes";
          } else if (code.startsWith("TXWL")) {
            category = "Raw material";
          } else if (code.startsWith("RXRJ") || code.startsWith("TXRJ") || code.startsWith("RXQJ") || code.startsWith("TXQJ")) {
            category = "OTHER";
          }
        }`;
let loopCodeNew = `      allSourceIncidents.forEach(inc => {
        const code = inc.code || inc.faultCode || "OTHER";
        let category = inc.category || "OTHER";

        // Re-classify based on code prefixes if category is not explicitly set to something else
        if (category === "OTHER" || !inc.category) {
          if (code.startsWith("HWDZ") || code.startsWith("HWYJ") || code.startsWith("MMYJ") || code.startsWith("RXYJ") || code.startsWith("TXYJ") || code.startsWith("RXJY") || code.startsWith("TXJY")) {
            category = "The device itself"; 
          } else if (code.startsWith("RXRY") || code.startsWith("TXRY")) {
            category = "Human causes";
          } else if (code.startsWith("TXWL")) {
            category = "Raw material";
          } else if (code.startsWith("RXRJ") || code.startsWith("TXRJ") || code.startsWith("RXQJ") || code.startsWith("TXQJ")) {
            category = "OTHER";
          }
        }
        inc.mappedCategory = category;
        inc.mappedCode = code;`;
code = code.replace(loopCodeOld, loopCodeNew);

// 3. Set filteredIncidents and map colors for drillDownData
let drillDownOld = `        drillDownData[category] = codeEntries.map(entry => {
          drillCum += entry.value;
          return {
            ...entry,
            cumulativePercentage: drillTotal > 0 ? parseFloat((drillCum / drillTotal * 100).toFixed(2)) : 0
          };
        });
      });
      setFaultCodesDrillDown(drillDownData);`;

let drillDownNew = `        const COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
        drillDownData[category] = codeEntries.map((entry, index) => {
          drillCum += entry.value;
          return {
            ...entry,
            color: COLORS[index % COLORS.length],
            cumulativePercentage: drillTotal > 0 ? parseFloat((drillCum / drillTotal * 100).toFixed(2)) : 0
          };
        });
      });
      setFaultCodesDrillDown(drillDownData);
      setFilteredIncidents(allSourceIncidents);`;
code = code.replace(drillDownOld, drillDownNew);

// 4. Modify Pie Chart
let pieOld = `                  data={maintenancePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={isFullScreen ? 180 : 100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {maintenancePieData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                  ))}
                </Pie>`;
let pieNew = `                  data={maintenancePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={isFullScreen ? 180 : 100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(e) => {
                    const records = filteredIncidents.filter(inc => inc.mappedCategory === e.name);
                    setSelectedFaultRecords(records);
                    setSelectedFaultTitle('Category: ' + e.name);
                    setIsFaultModalVisible(true);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {maintenancePieData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                  ))}
                </Pie>`;
code = code.replace(pieOld, pieNew);

// 5. Modify Bar Chart
let barOld = `                    <Bar
                      yAxisId="left"
                      dataKey="value"
                      name="Incidents"
                      radius={[4, 4, 0, 0]}
                      onClick={(e) => {
                        if (!selectedDrillDownCategory) {
                          setSelectedDrillDownCategory(e.name);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {
                        (selectedDrillDownCategory ? faultCodesDrillDown[selectedDrillDownCategory] || [] : outputFaultParetoData).map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={entry.color || '#5470c6'} />
                        ))
                      }
                    </Bar>`;
let barNew = `                    <Bar
                      yAxisId="left"
                      dataKey="value"
                      name="Incidents"
                      radius={[4, 4, 0, 0]}
                      onClick={(e) => {
                        const records = filteredIncidents.filter(inc => {
                          if (selectedDrillDownCategory) {
                            return inc.mappedCategory === selectedDrillDownCategory && inc.mappedCode === e.name;
                          } else {
                            return inc.mappedCategory === e.name;
                          }
                        });
                        setSelectedFaultRecords(records);
                        setSelectedFaultTitle(selectedDrillDownCategory ? 'Fault Code: ' + e.name : 'Category: ' + e.name);
                        setIsFaultModalVisible(true);
                        
                        if (!selectedDrillDownCategory) {
                          setSelectedDrillDownCategory(e.name);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {
                        (selectedDrillDownCategory ? faultCodesDrillDown[selectedDrillDownCategory] || [] : outputFaultParetoData).map((entry, index) => (
                          <Cell key={\`cell-\${index}\`} fill={entry.color || '#5470c6'} />
                        ))
                      }
                    </Bar>`;
code = code.replace(barOld, barNew);

// 6. Add Modal JSX
let modalOld = `  return (
    <div className="app-container">`;
let modalNew = `  return (
    <div className="app-container">
      <Modal
        title={selectedFaultTitle}
        open={isFaultModalVisible}
        onCancel={() => setIsFaultModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Order</th>
                <th>Asset Code</th>
                <th>Category</th>
                <th>Fault Code</th>
              </tr>
            </thead>
            <tbody>
              {selectedFaultRecords.map((inc, i) => (
                <tr key={i}>
                  <td>{inc.date}</td>
                  <td>{inc.workOrderCode || inc.workOrder}</td>
                  <td>{inc.assetCode}</td>
                  <td>{inc.mappedCategory}</td>
                  <td>{inc.mappedCode}</td>
                </tr>
              ))}
              {selectedFaultRecords.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>`;
code = code.replace(modalOld, modalNew);

fs.writeFileSync('src/App.jsx', code);
console.log('Patch complete.');
