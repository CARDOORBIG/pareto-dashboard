const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'App.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const startMarker = '{isFaultModalVisible && (';
const endMarker = '      </div>{/* end dashboard-content */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const beforeBlock = content.substring(0, startIndex);
const afterBlock = content.substring(endIndex);

const newModalCode = `
          {isFaultModalVisible && (() => {
            const totalIncidents = sortedModalRecords.length;
            const totalDuration = sortedModalRecords.reduce((acc, r) => acc + (parseFloat(r.duration) || 0), 0);
            const avgResolution = totalIncidents > 0 ? Math.round(totalDuration / totalIncidents) : 0;
            const criticality = avgResolution > 60 ? 'High' : avgResolution > 30 ? 'Medium' : 'Low';

            const operatorCounts = sortedModalRecords.reduce((acc, r) => {
              const op = r.operator || 'Unknown';
              acc[op] = (acc[op] || 0) + 1;
              return acc;
            }, {});
            const topOperators = Object.entries(operatorCounts)
              .map(([name, count]) => ({ name, count, percentage: (count / totalIncidents * 100).toFixed(1) }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            const isFaultCode = selectedFaultTitle.startsWith('Fault Code: ');
            const code = isFaultCode ? selectedFaultTitle.replace('Fault Code: ', '') : null;
            let titleText = selectedFaultTitle;
            let desc = "Detailed incident history and analysis for the selected fault category.";
            
            if (code) {
              if (typeof faultDescriptions !== 'undefined' && faultDescriptions[code]) {
                titleText = \`\${code}: \${faultDescriptions[code]}\`;
              } else if (typeof DEVICE_FAULT_DETAILS !== 'undefined' && DEVICE_FAULT_DETAILS[code]) {
                titleText = \`\${code}: \${DEVICE_FAULT_DETAILS[code].name}\`;
                desc = DEVICE_FAULT_DETAILS[code].desc || desc;
              }
            }

            return (
              <div className="modal-overlay" style={{ zIndex: 9999, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onMouseDown={handleModalBackdropClick}>
                <div className="modal-content table-modal" style={{ width: '95%', maxWidth: '1400px', maxHeight: '90vh', overflowY: 'auto', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }} onClick={(e) => e.stopPropagation()}>
                  
                  {/* Header Section */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', lineHeight: '1.2' }}>
                        DEVICE FAULT<br/>ANALYSIS
                      </div>
                      <div>
                        <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {titleText}
                        </h2>
                        <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '0.9rem', maxWidth: '800px', lineHeight: '1.4' }}>{desc}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="export-btn" onClick={() => captureElement(document.querySelector('.table-modal'), 'Fault_Analysis_Capture.png')} title="Capture Image" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>
                        <Camera size={14} /> Capture
                      </button>
                      <button onClick={() => setIsFaultModalVisible(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', cursor: 'pointer', fontSize: '16px', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>&times;</button>
                    </div>
                  </div>

                  {/* Body Section (2 Columns) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* Summary Panel */}
                      <div className="panel chart-panel" style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', borderRadius: '8px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
                          <span style={{ color: '#cbd5e1' }}>Total Incidents:</span>
                          <span style={{ color: '#f87171', fontWeight: 'bold' }}>{totalIncidents} times</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem' }}>
                          <span style={{ color: '#cbd5e1' }}>Avg Resolution:</span>
                          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{avgResolution} mins</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span style={{ color: '#cbd5e1' }}>Criticality:</span>
                          <span style={{ color: criticality === 'High' ? '#f59e0b' : criticality === 'Medium' ? '#fbbf24' : '#34d399', fontWeight: 'bold' }}>{criticality}</span>
                        </div>
                      </div>

                      {/* Top Operators Panel */}
                      <div className="panel chart-panel" style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', borderRadius: '8px', flex: 1 }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Top Operators Involved</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {topOperators.map((op, idx) => {
                            const initials = op.name.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase() || 'OP';
                            return (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {initials}
                                  </div>
                                  <span style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{op.name}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.1rem', marginRight: '6px' }}>{op.count}</span>
                                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({op.percentage}%)</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Table */}
                    <div className="panel chart-panel" style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #1e293b', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Machine Incident Log History</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Search by Operator, Tech or Work Order..."
                          value={modalSearchQuery}
                          onChange={(e) => setModalSearchQuery(e.target.value)}
                          className="modern-select"
                          style={{ flex: 1, maxWidth: '400px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '4px' }}
                        />
                        <select className="modern-select" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', color: '#f8fafc', padding: '8px 12px', borderRadius: '4px' }}>
                          <option>All Records</option>
                        </select>
                      </div>

                      <div className="table-responsive" style={{ flex: 1, border: 'none', background: 'transparent' }}>
                        <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th style={{ background: 'transparent', borderBottom: '1px solid #334155' }}>No.</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid #334155' }}>Date/Time</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid #334155' }}>Operator</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid #334155' }}>Repair Tech</th>
                              <th style={{ background: 'transparent', borderBottom: '1px solid #334155' }}>Work Order</th>
                              {renderModalSortableHeader('Duration', 'duration')}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedModalRecords.map((inc, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ color: '#f8fafc', fontWeight: 'bold' }}>{i + 1}</td>
                                <td>{inc.date || '-'}</td>
                                <td style={{ color: '#a78bfa' }}>{inc.operator || '-'}</td>
                                <td style={{ color: '#34d399' }}>{inc.repairPersonnel || inc.acceptancePersonnel || '-'}</td>
                                <td style={{ color: '#38bdf8' }}>{inc.workOrderCode || inc.workOrder || '-'}</td>
                                <td style={{ color: '#34d399', fontWeight: 'bold' }}>{inc.duration ? \`\${inc.duration} mins\` : '-'}</td>
                              </tr>
                            ))}
                            {sortedModalRecords.length === 0 && (
                              <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })()}
`;

fs.writeFileSync(targetFile, beforeBlock + newModalCode + '\\n' + afterBlock);
console.log("Modal layout updated successfully.");
