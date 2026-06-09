const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add getAcceptanceColor
code = code.replace(/function App\(\) \{/, `const getAcceptanceColor = (duration, std) => {
  const dur = parseFloat(duration) || 0;
  const standard = parseFloat(std) || 1;
  const ratio = dur / standard;
  if (ratio > 1.0) return 'rgba(239, 68, 68, 0.4)';
  if (ratio > 0.8) return 'rgba(234, 179, 8, 0.4)';
  return 'rgba(34, 197, 94, 0.4)';
};

function App() {`);

// 2. Add hiddenSeries
code = code.replace(/const \[outputFaultPieData, setOutputFaultPieData\] = useState\(\[\]\);/, `const [outputFaultPieData, setOutputFaultPieData] = useState([]);
  const [hiddenSeries, setHiddenSeries] = useState({});
  const handleToggleSeries = useCallback((e) => {
    if (e && e.dataKey) {
      setHiddenSeries(prev => ({ ...prev, [e.dataKey]: !prev[e.dataKey] }));
    }
  }, []);`);

// 3. Export to 29 columns
code = code.replace(/const excelData = selectedFaultRecords\.map\(inc => \{[\s\S]*?XLSX\.writeFile\(workbook, `Repair_Records_DrillDown\.xlsx`\);\n  \}, \[selectedFaultRecords\]\);/, `const excelData = selectedFaultRecords.map(inc => {
      const meta = assetsMetadata[inc.assetCode] || {};
      let desc = "Unknown fault code description";
      if (typeof faultDescriptions !== 'undefined' && faultDescriptions[inc.mappedCode]) {
        desc = faultDescriptions[inc.mappedCode];
      } else if (typeof DEVICE_FAULT_DETAILS !== 'undefined' && DEVICE_FAULT_DETAILS[inc.mappedCode]) {
        desc = DEVICE_FAULT_DETAILS[inc.mappedCode].name;
      }

      return {
        'Work Order Code': inc.workOrderCode || inc.workOrder || '',
        'Standard Repair Time (min)': inc.standardRepairTime || '',
        'Repair Duration (min)': inc.duration || '',
        'Request Time': inc.date || '',
        'Requester': inc.operator || '',
        'Equipment Short Name': meta.abbreviation || inc.assetCode,
        'Equipment Type': meta.type || '',
        'Position': '',
        'Model': meta.model || '',
        'Fault Type': inc.mappedCategory || '',
        'Fault Category': inc.mappedCategory || '',
        'Fault Code': inc.mappedCode || '',
        'Fault Description': desc,
        'Analysis and Troubleshooting': '',
        'Repair Time': '',
        'Restart Time': '',
        'Repair Personnel': inc.repairPersonnel || '',
        'Acceptance Personnel': '',
        'Order Response Duration (min)': '',
        'Acceptance Duration (min)': '',
        'Asset Code': inc.assetCode || '',
        'Work Order Duration (min)': inc.duration || '',
        'Work Order Status': 'Closed order',
        'SAP Code': meta.sapCode || '',
        'Equipment Name': meta.name || '',
        'Equipment Model': meta.model || '',
        'Order Receiver': inc.repairPersonnel || '',
        'Supplementary Entry Status': 'Supplemented',
        'Repair Type': 'Internal repair'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Repair Acceptance");
    
    const wscols = Object.keys(excelData[0]).map(k => ({ wch: Math.max(k.length, 15) }));
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, \`Repair_Acceptance_DrillDown.xlsx\`);
  }, [selectedFaultRecords, assetsMetadata]);`);

// 4. Modal Table
code = code.replace(/<table className="custom-table" style=\{\{ width: '100%', fontSize: '0.85rem' \}\}>[\s\S]*?<\/table>/, `<table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Work Order Code</th>
                          <th>Asset Code</th>
                          <th>Standard Repair Time (min)</th>
                          <th>Repair Duration (min)</th>
                          <th>Request Time</th>
                          <th>Requester</th>
                          <th>Equipment Short Name</th>
                          <th>Equipment Type</th>
                          <th>Position</th>
                          <th>Model</th>
                          <th>Fault Type</th>
                          <th>Fault Category</th>
                          <th>Fault Code</th>
                          <th>Fault Description</th>
                          <th>Analysis and Troubleshooting</th>
                          <th>Repair Time</th>
                          <th>Restart Time</th>
                          <th>Repair Personnel</th>
                          <th>Acceptance Personnel</th>
                          <th>Order Response Duration (min)</th>
                          <th>Acceptance Duration (min)</th>
                          <th>Work Order Duration (min)</th>
                          <th>Work Order Status</th>
                          <th>SAP Code</th>
                          <th>Equipment Name</th>
                          <th>Equipment Model</th>
                          <th>Order Receiver</th>
                          <th>Supplementary Entry Status</th>
                          <th>Repair Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFaultRecords.map((inc, i) => {
                          const meta = assetsMetadata[inc.assetCode] || {};
                          let desc = "Unknown fault code description";
                          if (typeof faultDescriptions !== 'undefined' && faultDescriptions[inc.mappedCode]) {
                            desc = faultDescriptions[inc.mappedCode];
                          } else if (typeof DEVICE_FAULT_DETAILS !== 'undefined' && DEVICE_FAULT_DETAILS[inc.mappedCode]) {
                            desc = DEVICE_FAULT_DETAILS[inc.mappedCode].name;
                          }
                          return (
                          <tr key={i}>
                            <td>{inc.workOrderCode || inc.workOrder}</td>
                            <td>{inc.assetCode}</td>
                            <td style={{ position: 'relative', padding: 0 }}>
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: \`\${Math.min(((parseFloat(inc.duration)||0) / (parseFloat(inc.standardRepairTime)||1)) * 100, 100)}%\`,
                                backgroundColor: getAcceptanceColor(inc.duration, inc.standardRepairTime),
                                zIndex: 0
                              }} />
                              <div style={{ position: 'relative', zIndex: 1, padding: '8px' }}>
                                {inc.standardRepairTime}
                              </div>
                            </td>
                            <td>{inc.duration}</td>
                            <td>{inc.date}</td>
                            <td>{inc.operator}</td>
                            <td>{meta.abbreviation || inc.assetCode}</td>
                            <td>{meta.type || ''}</td>
                            <td></td>
                            <td>{meta.model || ''}</td>
                            <td>{inc.mappedCategory}</td>
                            <td>{inc.mappedCategory}</td>
                            <td>{inc.mappedCode}</td>
                            <td>{desc}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>{inc.repairPersonnel}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>{inc.duration}</td>
                            <td>Closed order</td>
                            <td>{meta.sapCode || ''}</td>
                            <td>{meta.name || ''}</td>
                            <td>{meta.model || ''}</td>
                            <td>{inc.repairPersonnel}</td>
                            <td>Supplemented</td>
                            <td>Internal repair</td>
                          </tr>
                        )})}
                        {selectedFaultRecords.length === 0 && (
                          <tr>
                            <td colSpan="29" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>`);

// 5. Output Pareto Chart
code = code.replace(/<Bar\s*yAxisId="left"\s*dataKey="value"\s*name=\{selectedDrillDownCategory \? "Faults" : "Fault Causes"\}\s*fill="#5470c6"\s*radius=\{\[4, 4, 0, 0\]\}\s*isAnimationActive=\{true\}\s*animationDuration=\{600\}\s*animationEasing="ease-out"\s*onClick=\{\(e\) => \{[\s\S]*?style=\{\{ cursor: 'pointer' \}\}\s*>\s*\{[\s\S]*?\}\s*<\/Bar>/, `<Legend onClick={handleToggleSeries} wrapperStyle={{ cursor: 'pointer' }} />
                                <Line
                                  hide={hiddenSeries['value']}
                                  yAxisId="left"
                                  type="linear"
                                  dataKey="value"
                                  name={selectedDrillDownCategory ? "Faults" : "Fault Causes"}
                                  stroke="#5470c6"
                                  strokeWidth={3}
                                  dot={{ r: 4, fill: '#5470c6' }}
                                  activeDot={{ r: 6 }}
                                  isAnimationActive={true}
                                  animationDuration={600}
                                  animationEasing="ease-out"
                                  onClick={(e) => {
                                    const records = filteredIncidents.filter(inc => {
                                      if (selectedDrillDownCategory) {
                                        return inc.mappedCategory === selectedDrillDownCategory && inc.mappedCode === e.name;
                                      } else {
                                        return inc.mappedCategory === e.name;
                                      }
                                    });
                                    setSelectedFaultTitle(selectedDrillDownCategory ? \`Fault: \${e.name}\` : \`Category: \${e.name}\`);
                                    setSelectedFaultRecords(records);
                                    setIsFaultModalVisible(true);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />`);

// 6. Output Pareto Cumulative Line
code = code.replace(/<Line\s*yAxisId="right"\s*type="monotone"\s*dataKey="cumulativePercentage"/, `<Line
                                    hide={hiddenSeries['cumulativePercentage']}
                                    yAxisId="right"
                                    type="linear"
                                    dataKey="cumulativePercentage"`);

// 7. Downtime Pareto Chart
code = code.replace(/<Legend wrapperStyle=\{\{ paddingTop: '20px' \}\} \/>\s*<Bar yAxisId="left" dataKey="downtime" name="Downtime \(hrs\)" fill="#ef4444" radius=\{\[4, 4, 0, 0\]\} \/>\s*<Line yAxisId="right" type=\{chartStyle\.pareto\} dataKey="cumulativePercentage"/, `<Legend onClick={handleToggleSeries} wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} />
                                <Line hide={hiddenSeries['downtime']} yAxisId="left" type="linear" dataKey="downtime" name="Downtime (hrs)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                                <Line hide={hiddenSeries['cumulativePercentage']} yAxisId="right" type="linear" dataKey="cumulativePercentage"`);

// 8. Replace ALL type="monotone" with type="linear" globally across the file
code = code.replace(/type="monotone"/g, 'type="linear"');

fs.writeFileSync('src/App.jsx', code);
console.log("Done");
