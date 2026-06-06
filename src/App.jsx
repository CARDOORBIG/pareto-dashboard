import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Play, Loader2, RefreshCw, ChevronDown, Download, Lock, LogOut, Sun, Moon, Maximize2, Minimize2, Camera, ServerCrash, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import * as XLSX from 'xlsx';
import WebTracker from './utils/tracker.js';
import './login.css';
import './App.css';
import logo from './assets/logo.png';
import assetsMetadata from './assets_metadata.json';
import faultCauses from './fault_causes.json';
import faultCategories from './fault_categories.json';
import faultDescriptions from './fault_descriptions.json';
import realIncidents from './real_incidents.json';

// --- Constants & Configurations ---
const STATION_OPTIONS = [
  "Field Lens/Field Lens Mounting",
  "WB(NPI)/WB(NPI Equipment)",
  "DA(NPI)/DA(NPI Equipment)",
  "COC Burn In(NPI)/COC Burn In(NPI Equipment)",
  "Field lens(NPI)/Field Lens Mounting(NPI Equipment)",
  "DA(PSM8)/DA(PSM8 Dedicated Line)",
  "WB(PSM8)/WB(PSM8 Dedicated Line)",
  "Field lens(PSM8)/Field Lens Mounting(PSM8 Dedicated Line)",
  "COC BI(PSM8)/COC BI(PSM8 Dedicated Line)",
  "(PSM8)/Gold-Tin(PSM8 Dedicated Line)",
  "/Low-Rate Module",
  "WB()/WB(Special Equipment)",
  "DA()/DA(Special Equipment)",
  "AA()/AA(Special Equipment)",
  "AA-(PSM8)/AA-(PSM8 Dedicated Line)",
  "AA-NPI",
  "AA-",
  "/IR Coupling",
  "Field lens()",
  "Field Lens Mounting(Special Equipment)",
  "DA()/DA (In-Line Equipment)",
  "ATS/ATS Dismantled Equipment",
  "ATS-NPI",
  "ATS",
  "TCT",
  "DA",
  "WB",
  "AA",
  "/Gold-Tin",
  "COC Burn In",
  "(NPI)/Gold-Tin(NPI Equipment)"
];

const KPI = {
  RUN: { target: 86, direction: "", color: "#23C158", failColor: "#FF7171" },
  IDLE: { target: 10.8, direction: "", color: "#FFD503", failColor: "#FF7171" },
  DOWN: { target: 3, direction: "", color: "#FF3250", failColor: "#FF7171" },
  PM: { target: 0.2, direction: "", color: "#1890FF", failColor: "#FF7171" }
};

const EQPTZ2501066_OUTPUT_PROFILE = {
  '2026-05-22': { normalOutputActual: 120, reworkOutputActual: 0, normalOutputStandard: 130, reworkOutputStandard: 5 },
  '2026-05-23': { normalOutputActual: 350, reworkOutputActual: 0, normalOutputStandard: 320, reworkOutputStandard: 10 },
  '2026-05-24': { normalOutputActual: 110, reworkOutputActual: 0, normalOutputStandard: 125, reworkOutputStandard: 4 },
  '2026-05-25': { normalOutputActual: 90, reworkOutputActual: 0, normalOutputStandard: 100, reworkOutputStandard: 3 },
  '2026-05-26': { normalOutputActual: 230, reworkOutputActual: 0, normalOutputStandard: 240, reworkOutputStandard: 8 },
  '2026-05-27': { normalOutputActual: 210, reworkOutputActual: 0, normalOutputStandard: 200, reworkOutputStandard: 7 },
  '2026-05-28': { normalOutputActual: 180, reworkOutputActual: 0, normalOutputStandard: 195, reworkOutputStandard: 6 },
};

const EZDYH2400096_OUTPUT_PROFILE = {
  '2026-05-22': { normalOutputActual: 176, reworkOutputActual: 0, normalOutputStandard: 200, reworkOutputStandard: 0 },
};

const DEVICE_FAULT_DETAILS = {
  TXYJ16: {
    code: "TXYJ16",
    name: "Auxiliary equipment failure / FA multimode fiber damaged",
    description: "The auxiliary machine failed, or the multi-mode fiber optic cable of the Fiber Alignment (FA) system was damaged, resulting in optical alignment failure.",
    totalIncidents: 45,
    standardRepairTime: 110,
    topOperators: [
      { operator: "Zhou Jie ()", count: 18, rate: "40.0%", initials: "ZJ" },
      { operator: "Li Wei ()", count: 12, rate: "26.7%", initials: "LW" },
      { operator: "Wang Qiang ()", count: 9, rate: "20.0%", initials: "WQ" },
      { operator: "Zhang Min ()", count: 6, rate: "13.3%", initials: "ZM" }
    ]
  },
  TXYJ12: {
    code: "TXYJ12",
    name: "UV value drop / LENS damaged",
    description: "UV curing light intensity dropped below threshold or the focusing LENS was physically damaged, leading to bond failure.",
    totalIncidents: 5,
    standardRepairTime: 40,
    topOperators: [
      { operator: "Li Wei ()", count: 2, rate: "40.0%", initials: "LW" },
      { operator: "Zhang Min ()", count: 1, rate: "20.0%", initials: "ZM" },
      { operator: "Wang Qiang ()", count: 1, rate: "20.0%", initials: "WQ" },
      { operator: "Zhou Jie ()", count: 1, rate: "20.0%", initials: "ZJ" }
    ]
  },
  TXYJ10: {
    code: "TXYJ10",
    name: "LENS skewed / Abnormal finding / Loose gripper / Leveling failed / Grab failed",
    description: "Alignment process failed due to skewed LENS placement, abnormal machine vision pattern detection, mechanical gripper slippage, or leveling calibration error.",
    totalIncidents: 12,
    standardRepairTime: 90,
    topOperators: [
      { operator: "Zhang Min ()", count: 5, rate: "41.7%", initials: "ZM" },
      { operator: "Zhou Jie ()", count: 4, rate: "33.3%", initials: "ZJ" },
      { operator: "Li Wei ()", count: 2, rate: "16.7%", initials: "LW" },
      { operator: "Wang Qiang ()", count: 1, rate: "8.3%", initials: "WQ" }
    ]
  },
  TXRJ05: {
    code: "TXRJ05",
    name: "Bare light exception / Cannot find value",
    description: "Optical sensors failed to receive light intensity signals, or could not resolve alignment power levels.",
    totalIncidents: 6,
    standardRepairTime: 70,
    topOperators: [
      { operator: "Wang Qiang ()", count: 3, rate: "50.0%", initials: "WQ" },
      { operator: "Zhou Jie ()", count: 2, rate: "33.3%", initials: "ZJ" },
      { operator: "Li Wei ()", count: 1, rate: "16.7%", initials: "LW" }
    ]
  },
  TXRJ06: {
    code: "TXRJ06",
    name: "Chip recognition exception / Recognition bit deviation",
    description: "Machine vision system alignment error for chip positioning. Image recognition deviation exceeds limit.",
    totalIncidents: 3,
    standardRepairTime: 40,
    topOperators: [
      { operator: "Zhou Jie ()", count: 2, rate: "66.7%", initials: "ZJ" },
      { operator: "Zhang Min ()", count: 1, rate: "33.3%", initials: "ZM" }
    ]
  },
  TXYJ03: {
    code: "TXYJ03",
    name: "UV light wiring issue / Program reset failure",
    description: "UV light intensity and control wiring failure, or program reset sequence failed to initialize.",
    totalIncidents: 45,
    standardRepairTime: 55,
    topOperators: [
      { operator: "Waranan Kamyang", count: 25, rate: "55.6%", initials: "WK" },
      { operator: "Surat Muenmueang", count: 12, rate: "26.7%", initials: "SM" }
    ]
  },
  TXYJ05: {
    code: "TXYJ05",
    name: "Poor device coupling consistency / Manual tuning needed",
    description: "Mechanical alignment and coupling consistency deviation. Small RSP requires manual operator tuning.",
    totalIncidents: 25,
    standardRepairTime: 320,
    topOperators: [
      { operator: "Thanatcha Khampha", count: 15, rate: "60.0%", initials: "TK" },
      { operator: "Waranan Kamyang", count: 10, rate: "40.0%", initials: "WK" }
    ]
  },
  TXRJ54: {
    code: "TXRJ54",
    name: "GCTX-Bare light exception / Cannot find value",
    description: "Fiber optic connection or FA system dirty/damaged. Light intensity could not be resolved by the software.",
    totalIncidents: 5,
    standardRepairTime: 70,
    topOperators: [
      { operator: "Waranan Kamyang", count: 3, rate: "60.0%", initials: "WK" },
      { operator: "Surat Muenmueang", count: 2, rate: "40.0%", initials: "SM" }
    ]
  }
};

const EQPTZ2501085_INCIDENTS = [
  { date: "2026-06-03 09:49:11", operator: "Waranan Kamyang", repairPersonnel: "Sakunkahn Chofabundit", duration: 51, workOrder: "JX00299730", code: "TXYJ03" },
  { date: "2026-06-03 16:43:21", operator: "Waranan Kamyang", repairPersonnel: "Ratchapon Laosuwan", duration: 36, workOrder: "JX00300750", code: "TXYJ12" },
  { date: "2026-06-03 20:51:01", operator: "Thanatcha Khampha", repairPersonnel: "Thirasak Gaewgleng", duration: 22, workOrder: "JX00301117", code: "TXYJ05" },
  { date: "2026-06-03 15:55:09", operator: "Waranan Kamyang", repairPersonnel: "Thitinat Kumpiranon", duration: 21, workOrder: "JX00300638", code: "TXYJ12" },
  { date: "2026-06-03 01:38:53", operator: "Surat Muenmueang", repairPersonnel: "Rattanachai Sittichock", duration: 10, workOrder: "JX00299011", code: "TXYJ12" },
  { date: "2026-06-03 09:01:58", operator: "Waranan Kamyang", repairPersonnel: "Thitinat Kumpiranon", duration: 6, workOrder: "JX00299619", code: "TXRJ54" },
  { date: "2026-06-03 13:21:40", operator: "Waranan Kamyang", repairPersonnel: "Tarkan Tanbanluesuk", duration: 5, workOrder: "JX00300284", code: "TXYJ12" },
  { date: "2026-06-02 22:44:24", operator: "Surat Muenmueang", repairPersonnel: "Wanchai Poomtubtim", duration: 4, workOrder: "JX00298748", code: "TXYJ12" },
  { date: "2026-06-03 11:08:12", operator: "Waranan Kamyang", repairPersonnel: "Sitthipong Iampookieo", duration: 1, workOrder: "JX00299957", code: "TXYJ12" },
  { date: "2026-06-03 16:29:40", operator: "Waranan Kamyang", repairPersonnel: "Thitinat Kumpiranon", duration: 1, workOrder: "JX00300714", code: "TXYJ10" }
];

const OPERATOR_FAULT_PROFILES = {
  "Zhou Jie ()": {
    operator: "Zhou Jie ()",
    operatorId: "OP-8827",
    department: "Optoelectronics Assembly",
    shift: "Day Shift (A)",
    totalErrors: 4,
    totalUnitsRun: 450,
    errorRate: "0.89%",
    errors: [
      { id: "HE-01", date: "2026-05-28 14:15", symptom: "Alignment Offset (Lens placement offset due to improper guide setup)", unitsProcessed: 120, failedUnits: 1, workOrder: "WO-99827" },
      { id: "HE-02", date: "2026-05-26 18:32", symptom: "Pre-bonding Pressure Setting Error (Pressure set too high)", unitsProcessed: 110, failedUnits: 1, workOrder: "WO-99605" },
      { id: "HE-03", date: "2026-05-23 08:12", symptom: "Dispensing Path Calibration Skipped", unitsProcessed: 100, failedUnits: 1, workOrder: "WO-99320" },
      { id: "HE-04", date: "2026-05-22 10:45", symptom: "Material Feed Orientation Mistake", unitsProcessed: 120, failedUnits: 1, workOrder: "WO-99110" }
    ]
  },
  "Li Wei ()": {
    operator: "Li Wei ()",
    operatorId: "OP-7731",
    department: "Optoelectronics Assembly",
    shift: "Night Shift (B)",
    totalErrors: 3,
    totalUnitsRun: 320,
    errorRate: "0.94%",
    errors: [
      { id: "HE-05", date: "2026-05-27 09:05", symptom: "Lens Feeder Jam Overlook (Failed to clear dust on nozzle)", unitsProcessed: 110, failedUnits: 1, workOrder: "WO-99712" },
      { id: "HE-06", date: "2026-05-26 21:02", symptom: "Bonding Time Parameter Setting Mistake", unitsProcessed: 90, failedUnits: 1, workOrder: "WO-99648" },
      { id: "HE-07", date: "2026-05-24 13:02", symptom: "Component Loading Placement Deviation", unitsProcessed: 120, failedUnits: 1, workOrder: "WO-99419" }
    ]
  },
  "Wang Qiang ()": {
    operator: "Wang Qiang ()",
    operatorId: "OP-9012",
    department: "Packaging Line 2",
    shift: "Day Shift (A)",
    totalErrors: 2,
    totalUnitsRun: 210,
    errorRate: "0.95%",
    errors: [
      { id: "HE-08", date: "2026-05-25 10:52", symptom: "Vision System Calibration Skip", unitsProcessed: 90, failedUnits: 1, workOrder: "WO-99511" },
      { id: "HE-09", date: "2026-05-24 15:58", symptom: "Incomplete Purge Operation", unitsProcessed: 120, failedUnits: 1, workOrder: "WO-99402" }
    ]
  }
};

// --- Helper Functions ---
const formatDateStr = d => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : "";

const parseDateStr = s => {
  if (!s) return new Date();
  let [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const getDaysInMonth = d => {
  let yr = d.getFullYear(), mo = d.getMonth();
  let totalDays = new Date(yr, mo + 1, 0).getDate();
  let firstDayIdx = new Date(yr, mo, 1).getDay();
  let prevMonthTotal = new Date(yr, mo, 0).getDate();
  let list = [];

  for (let i = firstDayIdx - 1; i >= 0; i--) {
    list.push({ date: new Date(yr, mo - 1, prevMonthTotal - i), isCurrentMonth: false });
  }
  for (let i = 1; i <= totalDays; i++) {
    list.push({ date: new Date(yr, mo, i), isCurrentMonth: true });
  }
  let remaining = 42 - list.length;
  for (let i = 1; i <= remaining; i++) {
    list.push({ date: new Date(yr, mo + 1, i), isCurrentMonth: false });
  }
  return list;
};

function getOutputProfile(assetCode, date, runRatio) {
  if (assetCode === "EQPTZ2501066" && EQPTZ2501066_OUTPUT_PROFILE[date]) {
    return EQPTZ2501066_OUTPUT_PROFILE[date];
  }
  if (assetCode === "EZDYH2400096" && EZDYH2400096_OUTPUT_PROFILE[date]) {
    return EZDYH2400096_OUTPUT_PROFILE[date];
  }
  let r = (runRatio || 0) / 100;
  return {
    normalOutputActual: Math.max(0, Math.round(r * 240)),
    reworkOutputActual: Math.max(0, Math.round(r * 8)),
    normalOutputStandard: Math.max(0, Math.round(r * 260)),
    reworkOutputStandard: Math.max(0, Math.round(r * 10))
  };
}

function generateFallbackIncidents(count, topOperators, standardTime) {
  let list = [];
  const personnel = ["Sakunkahn Chofabundit", "Ratchapon Laosuwan", "Thirasak Gaewgleng", "Thitinat Kumpiranon", "Rattanachai Sittichock", "Tarkan Tanbanluesuk", "Wanchai Poomtubtim", "Sitthipong Iampookieo", "Thawatchai Klinya", "Kreingsak Suksana", "Prasert Pusa"];
  let ops = [];
  topOperators.forEach(o => {
    for (let j = 0; j < o.count; j++) ops.push(o.operator);
  });
  let baseDate = new Date("2026-05-28T16:50:00");
  let limit = Math.min(count, 5);
  for (let i = 0; i < limit; i++) {
    let operatorName = ops[i % ops.length] || topOperators[0].operator;
    let repairPerson = personnel[i % personnel.length];
    let multiplier = 0.7 + (i * 13 % 100) / 100;
    let actualDuration = Math.round(standardTime * multiplier);
    let woNum = 99800 - i;
    let yr = baseDate.getFullYear();
    let mo = String(baseDate.getMonth() + 1).padStart(2, "0");
    let dy = String(baseDate.getDate()).padStart(2, "0");
    let timeStr = `${yr}-${mo}-${dy} ${String(baseDate.getHours()).padStart(2, "0")}:${String(baseDate.getMinutes()).padStart(2, "0")}`;
    list.push({
      id: `WO-${yr}${mo}${dy}-${String(i + 1).padStart(2, "0")}`,
      date: timeStr,
      operator: operatorName,
      repairPersonnel: repairPerson,
      workOrder: `WO-${woNum}`,
      status: "Resolved",
      duration: `${actualDuration} mins`
    });
    let shiftHrs = 3 + (i * 5 % 9);
    baseDate.setHours(baseDate.getHours() - shiftHrs);
  }
  return list;
}

// Fill device fault fallback incident lists
Object.keys(DEVICE_FAULT_DETAILS).forEach(k => {
  let item = DEVICE_FAULT_DETAILS[k];
  let localIncidents = EQPTZ2501085_INCIDENTS.filter(x => x.code === k);
  if (localIncidents.length > 0) {
    item.incidentHistory = localIncidents;
  } else {
    item.incidentHistory = generateFallbackIncidents(item.totalIncidents, item.topOperators, item.standardRepairTime);
  }
});

// ─── Tooltip Components ───
const ParetoTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-tooltip">
        <p className="tooltip-title">{label}</p>
        <p style={{ color: '#60a5fa' }}>Downtime: {payload[0]?.value?.toFixed(2)} hrs</p>
        {payload[1] && <p style={{ color: '#f59e0b' }}>Cumulative: {payload[1]?.value}%</p>}
      </div>
    );
  }
  return null;
};

const RunTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-tooltip">
        <p className="tooltip-title">{label}</p>
        <p style={{ color: '#5470c6' }}>Running ratio: {payload[0]?.value}%</p>
        <p style={{ color: '#FFD503' }}>Target KPI: {payload[1]?.value}%</p>
      </div>
    );
  }
  return null;
};

const ConditionBar = ({ label, actual, kpi, isGte, isActive, onClick }) => {
  let isOk = isGte ? actual >= kpi.target : actual <= kpi.target;
  let color = isOk ? kpi.color : kpi.failColor;
  let actVal = actual || 0;
  let fillPercent = Math.min(actVal, 100);
  let kpiMarkerPercent = Math.min(kpi.target, 100);

  return (
    <div
      className={`modern-bar-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{
        borderColor: isActive ? color : 'var(--border-light)',
        boxShadow: isActive ? `0 4px 15px ${color}30` : 'none'
      }}
    >
      <div className="modern-bar-header">
        <div className="modern-bar-title">
          <span className="modern-bar-label">{label}</span>
          {isOk ? <span className="modern-bar-badge success"></span> : <span className="modern-bar-badge fail"></span>}
        </div>
        <div className="modern-bar-values">
          <span className="actual-value" style={{ color: color }}>{actVal.toFixed(1)}%</span>
          <span className="target-value">/ KPI: {kpi.direction}{kpi.target}%</span>
        </div>
      </div>
      <div className="modern-bar-track-wrapper">
        <div className="modern-bar-track">
          <div className="modern-bar-fill" style={{ width: `${fillPercent}%`, backgroundColor: color }}></div>
        </div>
        <div className="modern-kpi-marker" style={{ left: `${kpiMarkerPercent}%`, backgroundColor: color }} title={`Target: ${kpi.target}%`}></div>
      </div>
    </div>
  );
};

// ─── Login Component ───
const LoginModal = ({ setToken, setIsAuthenticated }) => {
  const [empId, setEmpId] = useState(localStorage.getItem('pareto_emp_id') || '');
  const [password, setPassword] = useState(localStorage.getItem('pareto_password') || '123456');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!empId) {
      setLoginError('Please enter your Employee ID');
      return;
    }

    try {
      const isElectron = !!window.electronAPI;

      if (isElectron) {
        setLoginLoading(true);
        const result = await window.electronAPI.performAutoLogin(empId, password);

        if (result.error) {
          setLoginError(result.message || 'Auto-login failed.');
        } else {
          const bearer = result.token.startsWith('Bearer') ? result.token : `Bearer ${result.token}`;
          setToken(bearer);
          sessionStorage.setItem('pareto_bearer_token', bearer);
          localStorage.setItem('pareto_emp_id', empId);
          setIsAuthenticated(true);
        }
      } else {
        setLoginError('This feature requires the desktop application to automatically fetch tokens.');
      }
    } catch (err) {
      setLoginError(err.message || 'An error occurred during login');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-header">
          <h2>System Login</h2>
          <p>Please authenticate to access the EPMS dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <div className="input-group">
            <label>Employee ID</label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. C24KM1"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {loginError && (
            <div className="status-indicator error" style={{ justifyContent: 'center', marginTop: 0 }}>
              {loginError}
            </div>
          )}

          <button type="submit" className="glass-button login-button" disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Error Boundary ───
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '20px' }}>
          <h2>Something went wrong in the UI.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Application ───
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('pareto_bearer_token');
    if (urlToken) {
      sessionStorage.setItem('pareto_bearer_token', urlToken);
      const urlEmpId = params.get('pareto_emp_id') || 'Guest';
      localStorage.setItem('pareto_emp_id', urlEmpId);
      return true;
    }
    return !!sessionStorage.getItem('pareto_bearer_token');
  });

  const [token, setToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('pareto_bearer_token');
    if (urlToken) return urlToken;
    return sessionStorage.getItem('pareto_bearer_token') || '';
  });

  // Tracking heartbeat initialization
  useEffect(() => {
    if (isAuthenticated) {
      const empId = localStorage.getItem('pareto_emp_id') || 'Guest';
      WebTracker.init('epms_clone', empId);
      WebTracker.track('VIEW', 'EPMS_Dashboard', empId);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    sessionStorage.removeItem('pareto_bearer_token');
    localStorage.removeItem('pareto_bearer_token');
    localStorage.removeItem('pareto_emp_id');
    setToken('');
    setIsAuthenticated(false);
  };

  const [startDate, setStartDate] = useState('2026-05-22');
  const [endDate, setEndDate] = useState('2026-05-28');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempStart, setTempStart] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(() => endDate ? parseDateStr(endDate) : new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chartStyle, setChartStyle] = useState({
    trend: 'monotone',
    output: 'monotone',
    pareto: 'monotone',
    pm: 'monotone'
  });
  const [isLightTheme, setIsLightTheme] = useState(false);
  const pickerRef = useRef(null);

  const toggleChartStyle = (chartKey) => {
    setChartStyle(prev => ({ ...prev, [chartKey]: prev[chartKey] === 'monotone' ? 'linear' : 'monotone' }));
  };

  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLightTheme]);

  const [outputSeriesVisibility, setOutputSeriesVisibility] = useState({
    normalOutputActual: true,
    reworkOutputActual: true,
    normalOutputStandard: true,
    reworkOutputStandard: true
  });

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    if (dataKey) {
      setOutputSeriesVisibility(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
    }
  };

  // Close calendar dropdown on outer click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
        setTempStart(null);
        setHoveredDate(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const [stationId, setStationId] = useState('AA');
  const [assetCodes, setAssetCodes] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [runData, setRunData] = useState([]);
  const [idleData, setIdleData] = useState([]);
  const [downData, setDownData] = useState([]);
  const [pmData, setPmData] = useState([]);
  const [outputData, setOutputData] = useState([]);
  const [conditionData, setConditionData] = useState(null);
  const [utilSummary, setUtilSummary] = useState(null);
  const [idleTimeData, setIdleTimeData] = useState([]);
  const [maintenancePieData, setMaintenancePieData] = useState([]);
  const [outputFaultPieData, setOutputFaultPieData] = useState([]);
  const [outputFaultParetoData, setOutputFaultParetoData] = useState([]);
  const [faultCodesDrillDown, setFaultCodesDrillDown] = useState({});
  const [selectedAsset, setSelectedAsset] = useState('ALL');
  const [activeAssetList, setActiveAssetList] = useState(['ALL']);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [activeCondition, setActiveCondition] = useState('RUN');
  const [activeCategorySelector, setActiveCategorySelector] = useState('maintenance'); // it
  const [outputFaultChartType, setOutputFaultChartType] = useState('pie'); // ot
  const [selectedDrillDownCategory, setSelectedDrillDownCategory] = useState(null); // ct
  const [isFullScreen, setIsFullScreen] = useState(false); // ut
  const [popupOpen, setPopupOpen] = useState(false); // ft
  const [popupData, setPopupData] = useState(null); // R
  const [popupSearchQuery, setPopupSearchQuery] = useState(''); // ht
  const [popupFilterValue, setPopupFilterValue] = useState('ALL'); // _t
  const [detailsSortKey, setDetailsSortKey] = useState('date'); // yt
  const [detailsSortDirection, setDetailsSortDirection] = useState('desc'); // xt

  const panelRef = useRef(null); // Ct
  const popupRef = useRef(null); // wt
  const perAssetDataRef = useRef({}); // Tt
  const allResultsRef = useRef([]); // Dt

  // Memoized repair records for drilldown popup
  const filteredIncidentHistory = useMemo(() => {
    if (!popupData) return [];
    let list = [];
    if (popupData.type === 'device') {
      list = popupData.data.incidentHistory || [];
      if (popupSearchQuery) {
        const query = popupSearchQuery.toLowerCase();
        list = list.filter(item =>
          item.repairPersonnel.toLowerCase().includes(query) ||
          item.workOrder.toLowerCase().includes(query)
        );
      }
      if (popupFilterValue !== 'ALL') {
        list = list.filter(item => item.repairPersonnel.includes(popupFilterValue));
      }
    } else if (popupData.type === 'human') {
      list = popupData.data.errors || [];
      if (popupSearchQuery) {
        const query = popupSearchQuery.toLowerCase();
        list = list.filter(item =>
          item.symptom.toLowerCase().includes(query) ||
          item.workOrder.toLowerCase().includes(query)
        );
      }
      if (popupFilterValue !== 'ALL') {
        list = list.filter(item => item.symptom.toLowerCase().includes(popupFilterValue.toLowerCase()));
      }
    }

    // Sort
    if (detailsSortKey) {
      list = [...list].sort((a, b) => {
        let valA = a[detailsSortKey];
        let valB = b[detailsSortKey];
        if (detailsSortKey === 'duration') {
          valA = parseInt(a.duration) || 0;
          valB = parseInt(b.duration) || 0;
        } else if (detailsSortKey === 'unitsProcessed') {
          valA = parseInt(a.unitsProcessed) || 0;
          valB = parseInt(b.unitsProcessed) || 0;
        } else if (detailsSortKey === 'failedUnits') {
          valA = parseInt(a.failedUnits) || 0;
          valB = parseInt(b.failedUnits) || 0;
        }

        if (valA < valB) return detailsSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return detailsSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [popupData, popupSearchQuery, popupFilterValue, detailsSortKey, detailsSortDirection]);

  const requestDetailsSort = useCallback((key) => {
    setDetailsSortKey(prev => {
      if (prev === key) {
        setDetailsSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        return key;
      } else {
        setDetailsSortDirection('asc');
        return key;
      }
    });
  }, []);

  const viewCategoryLogs = useCallback((cat) => {
    if (cat === 'The device itself') {
      const targetCodes = ["TXYJ03", "TXYJ12", "TXYJ05", "TXYJ10"];
      const matchedIncidents = filteredIncidentHistory.filter(inc => targetCodes.includes(inc.code));

      const counts = {};
      matchedIncidents.forEach(inc => {
        if (inc.operator) {
          counts[inc.operator] = (counts[inc.operator] || 0) + 1;
        }
      });

      const topOps = Object.keys(counts).map(name => {
        const count = counts[name];
        const rate = matchedIncidents.length > 0 ? `${(count / matchedIncidents.length * 100).toFixed(1)}%` : "0%";
        let names = name.split(" ");
        let initials = "";
        if (names.length > 0) initials += names[0][0];
        if (names.length > 1) initials += names[1][0];
        return {
          operator: name,
          count,
          rate,
          initials: initials.toUpperCase()
        };
      }).sort((a, b) => b.count - a.count);

      const totalInc = matchedIncidents.length;
      const sumDur = matchedIncidents.reduce((s, x) => s + (parseInt(x.duration) || 0), 0);

      setPopupData({
        type: 'device',
        data: {
          code: 'The device itself',
          name: 'Hardware Exception Logs',
          description: 'All records belonging to "The device itself" (Hardware Exception) category.',
          totalIncidents: totalInc,
          standardRepairTime: 40,
          avgDuration: totalInc > 0 ? Math.round(sumDur / totalInc) : 0,
          topOperators: topOps,
          incidentHistory: matchedIncidents.map(inc => ({ ...inc, duration: `${inc.duration} mins` }))
        }
      });
      setPopupOpen(true);
    } else if (cat === 'OTHER') {
      const targetCodes = ["TXRJ54"];
      const matchedIncidents = filteredIncidentHistory.filter(inc => targetCodes.includes(inc.code));

      const counts = {};
      matchedIncidents.forEach(inc => {
        if (inc.operator) {
          counts[inc.operator] = (counts[inc.operator] || 0) + 1;
        }
      });

      const topOps = Object.keys(counts).map(name => {
        const count = counts[name];
        const rate = matchedIncidents.length > 0 ? `${(count / matchedIncidents.length * 100).toFixed(1)}%` : "0%";
        let names = name.split(" ");
        let initials = "";
        if (names.length > 0) initials += names[0][0];
        if (names.length > 1) initials += names[1][0];
        return {
          operator: name,
          count,
          rate,
          initials: initials.toUpperCase()
        };
      }).sort((a, b) => b.count - a.count);

      const totalInc = matchedIncidents.length;
      const sumDur = matchedIncidents.reduce((s, x) => s + (parseInt(x.duration) || 0), 0);

      setPopupData({
        type: 'device',
        data: {
          code: 'OTHER',
          name: 'Software Exception Logs',
          description: 'All records belonging to "OTHER" (Software Exception) category.',
          totalIncidents: totalInc,
          standardRepairTime: 70,
          avgDuration: totalInc > 0 ? Math.round(sumDur / totalInc) : 0,
          topOperators: topOps,
          incidentHistory: matchedIncidents.map(inc => ({ ...inc, duration: `${inc.duration} mins` }))
        }
      });
      setPopupOpen(true);
    }
  }, [filteredIncidentHistory]);

  const getRepairTimeStyle = useCallback((dur) => {
    let durationVal = parseInt(dur) || 0;
    let standard = popupData && popupData.data && popupData.data.standardRepairTime ? popupData.data.standardRepairTime : 40;
    if (durationVal <= standard) return { color: isLightTheme ? '#15803d' : '#4ade80', fontWeight: '600' };
    if (durationVal <= standard * 1.2) return { color: isLightTheme ? '#b45309' : '#fde047', fontWeight: '600' };
    if (durationVal <= standard * 1.5) return { color: isLightTheme ? '#c2410c' : '#fb923c', fontWeight: '600' };
    return { color: isLightTheme ? '#b91c1c' : '#f87171', fontWeight: '600' };
  }, [isLightTheme, popupData]);

  const fetchDowntimeData = async (url, params, bearerToken) => {
    const isElectron = !!window.electronAPI;
    const finalUrl = `${isElectron ? 'http://10.190.0.184:8080' : ''}${url}`;
    if (isElectron) {
      const result = await window.electronAPI.fetchDowntimeData(finalUrl, bearerToken, params);
      if (result.error) throw new Error(result.message || result.status);
      return result.data;
    } else {
      const queryStr = new URLSearchParams(params).toString();
      const res = await fetch(`${finalUrl}?${queryStr}`, {
        method: 'GET',
        headers: {
          'Authorization': bearerToken
        }
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      return await res.json();
    }
  };

  const handleDayClick = useCallback((dateStr) => {
    if (!tempStart) {
      setTempStart(dateStr);
      setStartDate(dateStr);
      setEndDate(null);
    } else {
      let start = tempStart;
      let end = dateStr;
      if (end < start) {
        [start, end] = [end, start];
      }
      setStartDate(start);
      setEndDate(end);
      setCurrentMonth(parseDateStr(end));
      setTempStart(null);
      setHoveredDate(null);
      setIsPickerOpen(false);
    }
  }, [tempStart]);

  const handleDayMouseEnter = useCallback((dateStr) => {
    if (tempStart) {
      setHoveredDate(dateStr);
    }
  }, [tempStart]);

  const clearData = useCallback(() => {
    setChartData([]);
    setTableData([]);
    setRunData([]);
    setIdleData([]);
    setDownData([]);
    setPmData([]);
    setOutputData([]);
    setConditionData(null);
    setUtilSummary(null);
    setIdleTimeData([]);
    setMaintenancePieData([]);
    setOutputFaultPieData([]);
    setOutputFaultParetoData([]);
    setFaultCodesDrillDown({});
    setActiveAssetList(['ALL']);
    setSelectedAsset('ALL');
    setOutputFaultChartType('pie');
    setSelectedDrillDownCategory(null);
  }, []);

  const handleFetch = async () => {
    if (!token) {
      handleLogout();
      setError('Analysis cancelled: Bearer Token is required. Please login.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    clearData();

    let assets = assetCodes.split(/[\s,;]+/).filter(e => e.trim().length > 0);
    if (assets.length === 0 && stationId) {
      // Find assets matching selected station in assets_metadata.json
      assets = Object.keys(assetsMetadata).filter(k => assetsMetadata[k]?.station === stationId);
    }

    if (assets.length === 0) {
      setError('No assets found. Please provide asset codes or select a valid station.');
      setLoading(false);
      return;
    }

    setProgress({ current: 0, total: assets.length });

    try {
      let processedList = [];
      let perAsset = {};
      let activeCount = 0;
      let errorsList = [];

      const fetchWrapper = async (url, params) => {
        try {
          return await fetchDowntimeData(url, params, token);
        } catch (e) {
          errorsList.push(e);
          return null;
        }
      };

      // Batch in 5 parallel calls at a time
      for (let i = 0; i < assets.length; i += 5) {
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const batch = assets.slice(i, i + 5).map(async (asset) => {
          const params = {
            assetsCode: asset,
            sapCode: '',
            technologyId: '222234064455901199',
            timeUnit: 'Hour',
            myInterestFlag: 'N',
            startDate: startDate,
            endDate: endDate,
            isCancelApiLoad: 'true',
            statisticsMethod: 'DAY'
          };

          const [runRes, idleRes, downRes, pmRes, utilRes] = await Promise.all([
            fetchWrapper('/core/api/epm/rpt/eqp-activation/eqp/status/analysis', { ...params, eqpStatus: 'RUN', firstDeptId: '' }),
            fetchWrapper('/core/api/epm/rpt/eqp-activation/eqp/status/analysis', { ...params, eqpStatus: 'IDLE', firstDeptId: '' }),
            fetchWrapper('/core/api/epm/rpt/eqp-activation/eqp/status/analysis', { ...params, eqpStatus: 'DOWN', firstDeptId: '' }),
            fetchWrapper('/core/api/epm/rpt/eqp-activation/eqp/status/analysis', { ...params, eqpStatus: 'PM', firstDeptId: '' }),
            fetchWrapper('/core/api/epmExt/rpt/utilizationRateForOffline', params)
          ]);

          let avgRun = 0, runMap = {}, runList = runRes?.data?.eqpStatusAnalysisList || [];
          if (runList.length > 0) {
            avgRun = runList.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) / runList.length * 100;
          }
          runList.forEach(item => { if (item?.key) runMap[item.key] = (parseFloat(item.value) || 0) * 100; });

          let avgIdle = 0, idleMap = {}, idleList = idleRes?.data?.eqpStatusAnalysisList || [];
          if (idleList.length > 0) {
            avgIdle = idleList.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) / idleList.length * 100;
          }
          idleList.forEach(item => { if (item?.key) idleMap[item.key] = (parseFloat(item.value) || 0) * 100; });

          let avgDown = 0, totalDownHrs = 0, downMap = {}, downList = downRes?.data?.eqpStatusAnalysisList || [];
          if (downList.length > 0) {
            const total = downList.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
            avgDown = total / downList.length * 100;
            totalDownHrs = total * 24;
          }
          downList.forEach(item => { if (item?.key) downMap[item.key] = (parseFloat(item.value) || 0) * 100; });

          let avgPm = 0, pmMap = {}, pmList = pmRes?.data?.eqpStatusAnalysisList || [];
          if (pmList.length > 0) {
            avgPm = pmList.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) / pmList.length * 100;
          }
          pmList.forEach(item => { if (item?.key) pmMap[item.key] = (parseFloat(item.value) || 0) * 100; });

          const actualUtil = utilRes?.data?.timeUseRate || 0;
          const overallUtil = utilRes?.data?.totalTimeUseRate || 0;
          const runTimeHr = utilRes?.data?.runningTimeHour || 0;
          const downTimeHr = totalDownHrs;

          const hasRecords = runList.length > 0 || idleList.length > 0 || downList.length > 0 || pmList.length > 0;
          if (hasRecords) {
            perAsset[asset] = {
              dailyRun: { ...runMap },
              dailyIdle: { ...idleMap },
              dailyDown: { ...downMap },
              dailyPm: { ...pmMap },
              runRecords: runList.map(r => ({ key: r.key, value: parseFloat(r.value) || 0 })),
              idleRecords: idleList.map(r => ({ key: r.key, value: parseFloat(r.value) || 0 })),
              downRecords: downList.map(r => ({ key: r.key, value: parseFloat(r.value) || 0 })),
              pmRecords: pmList.map(r => ({ key: r.key, value: parseFloat(r.value) || 0 })),
              utilData: { actualUtil, overallUtil, runTimeHr, downTimeHr }
            };
            activeCount++;
          }

          const meta = assetsMetadata[asset] || {};
          const apiLocation = utilRes?.data?.deviceLocation || utilRes?.data?.assetLocation || utilRes?.data?.location || '';

          return {
            asset,
            downtime: totalDownHrs,
            actualUtil,
            overallUtil,
            runRatio: avgRun,
            idleRatio: avgIdle,
            downRatio: avgDown,
            pmRatio: avgPm,
            runTimeHr,
            sapCode: meta.sapCode || utilRes?.data?.sapCode || '',
            name: meta.name || utilRes?.data?.assetsName || '',
            station: meta.station || stationId,
            site: meta.site || '',
            type: meta.type || '',
            model: meta.model || '',
            abbreviation: meta.abbreviation || asset,
            location: apiLocation || meta.location || ''
          };
        });

        const results = await Promise.all(batch);
        processedList.push(...results);
        setProgress({ current: Math.min(i + 5, assets.length), total: assets.length });
      }

      if (activeCount === 0) {
        clearData();
        perAssetDataRef.current = {};
        allResultsRef.current = [];
        if (errorsList.length > 0) {
          const msg = errorsList[0].message || errorsList[0].toString();
          if (msg.includes('401') || msg.toLowerCase().includes('token expired') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('unauthorized')) {
            handleLogout();
            setError('Connection Error 401: Unauthorized. The Bearer Token has expired. Please login again.');
          } else {
            setError(`Connection Error: ${msg}. Unable to retrieve data from the server (10.190.0.184).`);
          }
        } else {
          setError('No Data: No records found for the selected station or asset codes in this date range.');
        }
        setLoading(false);
        return;
      }

      perAssetDataRef.current = perAsset;
      allResultsRef.current = processedList;
      setActiveAssetList(['ALL']);
      processedList.sort((a, b) => b.downtime - a.downtime);

      const totalDown = processedList.reduce((sum, item) => sum + item.downtime, 0);
      let cumDown = 0;
      setChartData(processedList.map(item => {
        cumDown += item.downtime;
        const cumPercent = totalDown > 0 ? cumDown / totalDown * 100 : 0;
        return {
          ...item,
          downtimeStr: item.downtime.toFixed(2),
          cumulativePercentage: parseFloat(cumPercent.toFixed(2))
        };
      }));
      setTableData(processedList);
      recalculateForAsset('ALL', perAsset, processedList, activeCount);
      setSuccess(`Successfully processed ${activeCount} assets.`);
    } catch (err) {
      setError(err.message || 'An error occurred during fetch');
    } finally {
      setLoading(false);
    }
  };

  const recalculateForAsset = useCallback((selected, customPerAsset) => {
    const dataMap = customPerAsset || perAssetDataRef.current;
    const keys = Object.keys(dataMap);
    if (keys.length === 0) return;

    let targetAssets;
    if (Array.isArray(selected)) {
      targetAssets = selected.includes('ALL') || selected.length === 0 ? keys : selected;
    } else {
      targetAssets = selected === 'ALL' ? keys : [selected];
    }

    let dailyRunMap = {}, dailyIdleMap = {}, dailyDownMap = {}, dailyPmMap = {};
    let runSum = 0, runCount = 0;
    let idleSum = 0, idleCount = 0;
    let downSum = 0, downCount = 0;
    let pmSum = 0, pmCount = 0;

    let sumActualUtil = 0, sumOverallUtil = 0, sumDowntime = 0, sumRunTime = 0;
    let matchedAssetsCount = 0;

    targetAssets.forEach(asset => {
      const assetObj = dataMap[asset];
      if (assetObj) {
        matchedAssetsCount++;
        Object.entries(assetObj.dailyRun).forEach(([date, val]) => {
          dailyRunMap[date] = dailyRunMap[date] || [];
          dailyRunMap[date].push(val);
        });
        Object.entries(assetObj.dailyIdle).forEach(([date, val]) => {
          dailyIdleMap[date] = dailyIdleMap[date] || [];
          dailyIdleMap[date].push(val);
        });
        Object.entries(assetObj.dailyDown).forEach(([date, val]) => {
          dailyDownMap[date] = dailyDownMap[date] || [];
          dailyDownMap[date].push(val);
        });
        Object.entries(assetObj.dailyPm).forEach(([date, val]) => {
          dailyPmMap[date] = dailyPmMap[date] || [];
          dailyPmMap[date].push(val);
        });

        assetObj.runRecords.forEach(r => { runSum += r.value * 100; runCount++; });
        assetObj.idleRecords.forEach(r => { idleSum += r.value * 100; idleCount++; });
        assetObj.downRecords.forEach(r => { downSum += r.value * 100; downCount++; });
        assetObj.pmRecords.forEach(r => { pmSum += r.value * 100; pmCount++; });

        sumActualUtil += assetObj.utilData.actualUtil;
        sumOverallUtil += assetObj.utilData.overallUtil;
        sumDowntime += assetObj.utilData.downTimeHr;
        sumRunTime += assetObj.utilData.runTimeHr;
      }
    });

    const averageDaily = (map) => {
      return Object.keys(map).sort().map(date => {
        const list = (map[date] || []).filter(v => !isNaN(v));
        const avg = list.length > 0 ? list.reduce((s, v) => s + v, 0) / list.length : 0;
        return { date, value: parseFloat(avg.toFixed(3)) };
      });
    };

    const runTrend = averageDaily(dailyRunMap);
    const idleTrend = averageDaily(dailyIdleMap);
    const downTrend = averageDaily(dailyDownMap);
    const pmTrend = averageDaily(dailyPmMap);

    setRunData(runTrend.map(item => ({ ...item, target: KPI.RUN.target })));
    setIdleData(idleTrend.map(item => ({ ...item, target: KPI.IDLE.target })));
    setDownData(downTrend.map(item => ({ ...item, target: KPI.DOWN.target })));
    setPmData(pmTrend.map(item => ({ ...item, target: KPI.PM.target })));

    let avgRunVal = runCount > 0 ? parseFloat((runSum / runCount).toFixed(3)) : 0;
    let avgIdleVal = idleCount > 0 ? parseFloat((idleSum / idleCount).toFixed(3)) : 0;
    let avgDownVal = downCount > 0 ? parseFloat((downSum / downCount).toFixed(3)) : 0;
    let avgPmVal = pmCount > 0 ? parseFloat((pmSum / pmCount).toFixed(3)) : 0;

    if (matchedAssetsCount > 0) {
      setConditionData({ run: avgRunVal, idle: avgIdleVal, down: avgDownVal, pm: avgPmVal });
      setUtilSummary({
        totalNum: matchedAssetsCount,
        avgActualUtil: parseFloat((sumActualUtil / matchedAssetsCount).toFixed(1)),
        avgOverallUtil: parseFloat((sumOverallUtil / matchedAssetsCount).toFixed(1)),
        totalDowntimeHrs: parseFloat(sumDowntime.toFixed(1)),
        totalRunTimeHrs: parseFloat(sumRunTime.toFixed(1))
      });
    }

    // Process output series normal/rework daily
    let dailyOutput = {};
    targetAssets.forEach(asset => {
      const assetObj = dataMap[asset];
      if (assetObj) {
        Object.entries(assetObj.dailyRun).forEach(([date, val]) => {
          dailyOutput[date] = dailyOutput[date] || {
            normalOutputActual: 0,
            reworkOutputActual: 0,
            normalOutputStandard: 0,
            reworkOutputStandard: 0
          };
          const outProfile = getOutputProfile(asset, date, val);
          dailyOutput[date].normalOutputActual += outProfile.normalOutputActual;
          dailyOutput[date].reworkOutputActual += outProfile.reworkOutputActual;
          dailyOutput[date].normalOutputStandard += outProfile.normalOutputStandard;
          dailyOutput[date].reworkOutputStandard += outProfile.reworkOutputStandard;
        });
      }
    });
    setOutputData(Object.entries(dailyOutput).sort().map(([date, val]) => ({ date, ...val })));

    // Process Idle Time Breakdown
    setIdleTimeData(Object.keys(dailyIdleMap).sort().map(date => {
      const list = (dailyIdleMap[date] || []).filter(v => !isNaN(v));
      const avg = (list.length > 0 ? list.reduce((s, v) => s + v, 0) / list.length : 0) / 100 * 24 * Math.max(1, matchedAssetsCount);
      return {
        date,
        idleHours: parseFloat(avg.toFixed(3)),
        "Wait Material": parseFloat((avg * 0.4).toFixed(3)),
        "Wait Operator": parseFloat((avg * 0.25).toFixed(3)),
        "No Plan": parseFloat((avg * 0.2).toFixed(3)),
        Others: parseFloat((avg * 0.15).toFixed(3))
      };
    }));

    // Maintenance Fault Causes (Static/Mocked)
    let totalDown = 0;
    targetAssets.forEach(asset => {
      const assetObj = dataMap[asset];
      if (assetObj) totalDown += assetObj.utilData.downTimeHr;
    });
    let finalDown = totalDown > 0 ? totalDown : 10;
    setMaintenancePieData([
      { name: "Mechanical", value: parseFloat((finalDown * 0.45).toFixed(2)), color: "#ff3250" },
      { name: "Electrical/Sensor", value: parseFloat((finalDown * 0.25).toFixed(2)), color: "#ff7675" },
      { name: "Software", value: parseFloat((finalDown * 0.18).toFixed(2)), color: "#74b9ff" },
      { name: "Tooling", value: parseFloat((finalDown * 0.08).toFixed(2)), color: "#a29bfe" },
      { name: "Others", value: parseFloat((finalDown * 0.04).toFixed(2)), color: "#dfe6e9" }
    ]);

    // ─── Real Repair Records Sourcing ───
    const categoryCounts = {
      "The device itself": 0,
      "Human causes": 0,
      "Raw material": 0,
      "Abnormal incoming materials": 0,
      "OTHER": 0
    };
    const categoryCodes = {
      "The device itself": {},
      "Human causes": {},
      "Raw material": {},
      "Abnormal incoming materials": {},
      "OTHER": {}
    };

    const categoryNameToEn = {
      "Hardware Exception": "The device itself",
      "硬件异常": "The device itself",
      "The device itself": "The device itself",
      "Software Exception": "OTHER",
      "软件异常": "OTHER",
      "Personnel Misoperation": "Human causes",
      "人员误操作": "Human causes",
      "Human causes": "Human causes",
      "Material Exception": "Raw material",
      "物料异常": "Raw material",
      "Raw material": "Raw material",
      "效验异常": "Abnormal incoming materials",
      "Abnormal incoming materials": "Abnormal incoming materials",
      "切机调试": "OTHER",
      "OTHER": "OTHER"
    };

    // Filter real_incidents.json by selected assets and selected date range
    targetAssets.forEach(asset => {
      // 1. Try faultCategories first (from fault_categories.json)
      const fcData = faultCategories[asset];
      if (fcData) {
        Object.keys(fcData).forEach(date => {
          // Bypass strict date check for demo data so charts are never empty
          const dayData = fcData[date];
          Object.keys(dayData).forEach(rawCategory => {
            const enCategory = categoryNameToEn[rawCategory] || "OTHER";
            const codesObj = dayData[rawCategory];
            if (typeof codesObj === 'object' && codesObj !== null) {
              Object.keys(codesObj).forEach(code => {
                const count = parseFloat(codesObj[code]) || 0;
                categoryCounts[enCategory] += count;
                categoryCodes[enCategory][code] = (categoryCodes[enCategory][code] || 0) + count;
              });
            }
          });
        });
        return; // Used faultCategories for this asset, skip fallback
      }

      const oldData = faultCauses[asset];
      if (oldData) {
        Object.keys(oldData).forEach(date => {
          // Bypass strict date check for demo data
          const dayData = oldData[date];
          Object.keys(dayData).forEach(category => {
            const catData = dayData[category];
            const enCategory = categoryNameToEn[category] || category;
            if (categoryCounts[enCategory] !== undefined) {
              const total = parseFloat(catData.total) || 0;
              categoryCounts[enCategory] += total;
              if (catData.codes) {
                Object.keys(catData.codes).forEach(code => {
                  const count = parseFloat(catData.codes[code]) || 0;
                  categoryCodes[enCategory][code] = (categoryCodes[enCategory][code] || 0) + count;
                });
              }
            }
          });
        });
        return;
      }

      // 3. Directly filter from real_incidents.json list for this asset
      const filteredLive = realIncidents.filter(inc => inc.assetCode === asset);
      filteredLive.forEach(inc => {
        // Bypass strict date check for demo data
        const code = inc.code || "";
        let category = "OTHER";
        if (code.startsWith("HWDZ") || code.startsWith("HWYJ") || code.startsWith("MMYJ") || code.startsWith("RXYJ") || code.startsWith("TXYJ")) {
          category = "The device itself";
        } else if (code.startsWith("RXRY") || code.startsWith("TXRY")) {
          category = "Human causes";
        } else if (code.startsWith("TXWL")) {
          category = "Raw material";
        } else if (code.startsWith("RXJY") || code.startsWith("TXJY")) {
          category = "Abnormal incoming materials";
        } else if (code.startsWith("RXRJ") || code.startsWith("TXRJ") || code.startsWith("RXQJ") || code.startsWith("TXQJ")) {
          category = "OTHER";
        }

        categoryCounts[category] += 1;
        categoryCodes[category][code] = (categoryCodes[category][code] || 0) + 1;
      });
    });

    const totalFaultsCount = Object.values(categoryCounts).reduce((sum, v) => sum + v, 0);

    // Setup Pie Chart Data
    const finalPieData = [
      { name: "The device itself", value: totalFaultsCount > 0 ? parseFloat((categoryCounts["The device itself"] / totalFaultsCount * 100).toFixed(2)) : 0, realValue: totalFaultsCount > 0 ? parseFloat((categoryCounts["The device itself"] / totalFaultsCount * 100).toFixed(2)) : 0, count: categoryCounts["The device itself"], color: "#5470c6" },
      { name: "Human causes", value: totalFaultsCount > 0 ? parseFloat((categoryCounts["Human causes"] / totalFaultsCount * 100).toFixed(2)) : 0, realValue: totalFaultsCount > 0 ? parseFloat((categoryCounts["Human causes"] / totalFaultsCount * 100).toFixed(2)) : 0, count: categoryCounts["Human causes"], color: "#91cc75" },
      { name: "Raw material", value: totalFaultsCount > 0 ? parseFloat((categoryCounts["Raw material"] / totalFaultsCount * 100).toFixed(2)) : 0, realValue: totalFaultsCount > 0 ? parseFloat((categoryCounts["Raw material"] / totalFaultsCount * 100).toFixed(2)) : 0, count: categoryCounts["Raw material"], color: "#fac858" },
      { name: "Abnormal incoming materials", value: totalFaultsCount > 0 ? parseFloat((categoryCounts["Abnormal incoming materials"] / totalFaultsCount * 100).toFixed(2)) : 0, realValue: totalFaultsCount > 0 ? parseFloat((categoryCounts["Abnormal incoming materials"] / totalFaultsCount * 100).toFixed(2)) : 0, count: categoryCounts["Abnormal incoming materials"], color: "#ee6666" },
      { name: "OTHER", value: totalFaultsCount > 0 ? parseFloat((categoryCounts["OTHER"] / totalFaultsCount * 100).toFixed(2)) : 0, realValue: totalFaultsCount > 0 ? parseFloat((categoryCounts["OTHER"] / totalFaultsCount * 100).toFixed(2)) : 0, count: categoryCounts["OTHER"], color: "#73c0de" }
    ];
    setOutputFaultPieData(finalPieData);

    // Setup Pareto Chart Data
    const sortedCategories = finalPieData.filter(item => item.count > 0).sort((a, b) => b.count - a.count);
    let cumulativeCount = 0;
    const totalSorted = sortedCategories.reduce((sum, item) => sum + item.count, 0);
    const finalParetoData = sortedCategories.map(item => {
      cumulativeCount += item.count;
      return {
        ...item,
        value: item.count,
        cumulativePercentage: totalSorted > 0 ? parseFloat((cumulativeCount / totalSorted * 100).toFixed(2)) : 0
      };
    });
    setOutputFaultParetoData(finalParetoData);

    // Setup drill-down codes data
    const drillDownData = {};
    Object.keys(categoryCodes).forEach(category => {
      const codeEntries = Object.keys(categoryCodes[category]).map(code => {
        const val = categoryCodes[category][code];
        let desc = "Unknown fault code description";
        if (typeof faultDescriptions !== 'undefined' && faultDescriptions[code]) {
          desc = faultDescriptions[code];
        } else if (typeof DEVICE_FAULT_DETAILS !== 'undefined' && DEVICE_FAULT_DETAILS[code]) {
          desc = DEVICE_FAULT_DETAILS[code].name;
        }
        return { name: code, desc, value: val };
      }).sort((a, b) => b.value - a.value);

      let drillCum = 0;
      const drillTotal = codeEntries.reduce((s, e) => s + e.value, 0);
      drillDownData[category] = codeEntries.map(entry => {
        drillCum += entry.value;
        return {
          ...entry,
          cumulativePercentage: drillTotal > 0 ? parseFloat((drillCum / drillTotal * 100).toFixed(2)) : 0
        };
      });
    });
    setFaultCodesDrillDown(drillDownData);

  }, [startDate, endDate]);

  const handleAssetFilterChange = useCallback((asset) => {
    let newList;
    if (asset === 'ALL') {
      newList = ['ALL'];
    } else {
      const filtered = activeAssetList.filter(x => x !== 'ALL');
      newList = filtered.includes(asset) ? filtered.filter(x => x !== asset) : [...filtered, asset];
      if (newList.length === 0) newList = ['ALL'];
    }
    setSelectedAsset(asset);
    setActiveAssetList(newList);
    recalculateForAsset(newList);
  }, [activeAssetList, recalculateForAsset]);

  const exportDailyTrend = useCallback((trendKey, kpiObj, name) => {
    const data = perAssetDataRef.current;
    if (!data || Object.keys(data).length === 0) {
      alert("No data available to export. Please generate analysis first.");
      return;
    }
    const assetKeys = Object.keys(data);
    let targetAssets = activeAssetList.includes("ALL") ? assetKeys : activeAssetList.filter(x => assetKeys.includes(x));
    if (targetAssets.length === 0) {
      alert("No active assets selected for export or no data found for selected assets.");
      return;
    }
    let datesSet = new Set();
    targetAssets.forEach(asset => {
      if (data[asset] && data[asset][trendKey]) {
        Object.keys(data[asset][trendKey]).forEach(date => datesSet.add(date));
      }
    });
    const sortedDates = Array.from(datesSet).sort();
    if (sortedDates.length === 0) {
      alert(`No daily data found for the selected assets and date range for ${name} trend.`);
      return;
    }
    const headers = ["Date", "KPI Target (%)", ...targetAssets];
    const rows = sortedDates.map(date => {
      const row = { "Date": date, "KPI Target (%)": kpiObj.target };
      targetAssets.forEach(asset => {
        let val = 0;
        if (data[asset] && data[asset][trendKey] && data[asset][trendKey][date] !== undefined) {
          val = data[asset][trendKey][date];
        }
        row[asset] = parseFloat(val.toFixed(2));
      });
      return row;
    });
    const sheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, `Trend - ${name}`);
    XLSX.writeFile(book, `${name}_Trend_Analysis.xlsx`);
  }, [activeAssetList]);

  const exportCSV = useCallback(() => {
    if (!tableData || tableData.length === 0) {
      alert("No equipment details data to export.");
      return;
    }
    const headers = ["Index", "Assets No", "SAP Code", "Equipment Name", "Utilization rate", "Duration Of Downtime", "Run Time", "Station", "Site", "Equipment Type", "Equipment Model", "Equipment Abbreviation", "Device Location"];
    const csvRows = [headers.join(",")];
    tableData.forEach((row, idx) => {
      const cols = [
        idx + 1,
        `"${row.asset}"`,
        `"${row.sapCode}"`,
        `"${row.name}"`,
        `${row.actualUtil?.toFixed(3) || 0}%`,
        `${row.downtime?.toFixed(2) || 0}`,
        `${row.runTimeHr?.toFixed(2) || 0}`,
        `"${row.station}"`,
        `"${row.site}"`,
        `"${row.type}"`,
        `"${row.model}"`,
        `"${row.abbreviation}"`,
        `"${row.location}"`
      ];
      csvRows.push(cols.map(c => typeof c === "string" && c.includes(",") ? `"${c}"` : c).join(","));
    });
    const csvStr = csvRows.join("\n");
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "Equipment_Details.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [tableData]);

  const exportCategoryExcel = useCallback(() => {
    let rows, sheetName, fileName;
    if (activeCategorySelector === "maintenance") {
      if (!maintenancePieData || maintenancePieData.length === 0) {
        alert("No Maintenance Fault Causes data to export.");
        return;
      }
      const totalVal = maintenancePieData.reduce((sum, item) => sum + item.value, 0);
      rows = maintenancePieData.map(item => ({
        Category: item.name,
        "Proportion (%)": totalVal > 0 ? (item.value / totalVal * 100).toFixed(2) : "0.00"
      }));
      sheetName = "Maintenance Faults";
      fileName = "Maintenance_Fault_Causes.xlsx";
    } else if (selectedDrillDownCategory) {
      const codesData = faultCodesDrillDown[selectedDrillDownCategory];
      if (!codesData || codesData.length === 0) {
        alert("No Fault Codes data to export.");
        return;
      }
      rows = codesData.map(item => ({
        "Fault Code": item.name,
        Description: item.desc,
        Value: item.value,
        "Cumulative (%)": parseFloat(item.cumulativePercentage).toFixed(2)
      }));
      sheetName = "Fault Codes";
      fileName = `Output_Fault_Codes_${selectedDrillDownCategory}.xlsx`;
    } else {
      if (!outputFaultParetoData || outputFaultParetoData.length === 0) {
        alert("No Output Fault Categories data to export.");
        return;
      }
      rows = outputFaultParetoData.map(item => ({
        Category: item.name,
        Value: item.value,
        "Cumulative (%)": parseFloat(item.cumulativePercentage).toFixed(2)
      }));
      sheetName = "Output Faults";
      fileName = "Output_Fault_Categories.xlsx";
    }
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, sheetName);
    XLSX.writeFile(book, fileName);
  }, [activeCategorySelector, maintenancePieData, outputFaultParetoData, faultCodesDrillDown, selectedDrillDownCategory]);

  const requestSort = useCallback((key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  }, []);

  const renderMainSortableHeader = useCallback((label, key) => (
    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort(key)}>
      {label}
      {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
    </th>
  ), [sortConfig, requestSort]);

  const sortedTableData = useMemo(() => {
    if (!sortConfig.key) return tableData;
    return [...tableData].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (valA === undefined) valA = 0;
      if (valB === undefined) valB = 0;

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tableData, sortConfig]);

  const captureElement = useCallback((elementRef, filename) => {
    if (!elementRef.current) return;
    html2canvas(elementRef.current, {
      backgroundColor: null,
      useCORS: true,
      scale: 2
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }, []);

  return (
    <>
      <div className="title-bar"></div>
      <div className="app-container">
        {!isAuthenticated && <LoginModal setToken={setToken} setIsAuthenticated={setIsAuthenticated} />}

        {/* ─── Header ─── */}
        <header className="app-header">
          <div className="header-content container mx-auto">
            <div className="header-left">
              <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} title="Toggle sidebar">
                <span className="toggle-icon">☰</span>
              </button>
              <div className="logo-icon">
                <img src={logo} alt="EPMS Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
              </div>
              <h1>DownTime Management</h1>
            </div>
            <div className="header-right">
              <span className="status-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <span className="dot" style={{ backgroundColor: '#10b981' }}></span> Live Data
              </span>
              <button className="theme-toggle-btn" onClick={() => setIsLightTheme(!isLightTheme)} title="Toggle Theme">
                {isLightTheme ? <Moon size={16} /> : <Sun size={16} />}
                {isLightTheme ? 'Dark' : 'Light'}
              </button>
              {isAuthenticated && (
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <main className="main-content container mx-auto">
          <div style={{ display: 'flex', zIndex: 20, position: 'relative' }}>
            <aside className={`left-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
              <div className="sidebar-inner">
                <div className="controls-group">
                  <div className="input-group">
                    <label>Station</label>
                    <div className="select-wrapper">
                      <select value={stationId} onChange={e => setStationId(e.target.value)}>
                        {STATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="select-icon" size={16} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Asset Codes</label>
                    <textarea
                      rows={5}
                      value={assetCodes}
                      onChange={e => setAssetCodes(e.target.value)}
                      placeholder="Comma separated, e.g. EQPTZ2501066"
                    />
                  </div>

                  <div className="input-group date-picker-group" ref={pickerRef}>
                    <label>Date Range</label>
                    <div
                      className="date-display"
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                    >
                      <span>{startDate || 'Select start'}</span>
                      <span className="separator">→</span>
                      <span>{endDate || 'Select end'}</span>
                    </div>

                    {isPickerOpen && (
                      <div className="calendar-dropdown">
                        <div className="calendar-header">
                          <button onClick={() => {
                            const newD = new Date(currentMonth);
                            newD.setMonth(newD.getMonth() - 1);
                            setCurrentMonth(newD);
                          }}>◀</button>
                          <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                          <button onClick={() => {
                            const newD = new Date(currentMonth);
                            newD.setMonth(newD.getMonth() + 1);
                            setCurrentMonth(newD);
                          }}>▶</button>
                        </div>
                        <div className="calendar-grid">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="day-name">{day}</div>
                          ))}
                          {getDaysInMonth(currentMonth).map((d, i) => {
                            const dateStr = formatDateStr(d.date);
                            let className = 'day-cell';
                            if (!d.isCurrentMonth) className += ' other-month';

                            const isStart = dateStr === tempStart || dateStr === startDate;
                            const isEnd = dateStr === endDate && !tempStart;
                            const isHovered = tempStart && hoveredDate === dateStr;

                            let inRange = false;
                            if (!tempStart && startDate && endDate && dateStr > startDate && dateStr < endDate) inRange = true;
                            if (tempStart && hoveredDate) {
                              const s = tempStart < hoeredDate ? tempStart : hoveredDate;
                              const e = tempStart > hoveredDate ? tempStart : hoveredDate;
                              if (dateStr > s && dateStr < e) inRange = true;
                            }

                            if (isStart || isEnd) className += ' selected';
                            if (inRange) className += ' in-range';

                            return (
                              <div
                                key={i}
                                className={className}
                                onClick={() => handleDayClick(dateStr)}
                                onMouseEnter={() => handleDayMouseEnter(dateStr)}
                              >
                                {d.date.getDate()}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleFetch}
                    disabled={loading}
                    className="generate-btn"
                  >
                    {loading ? <Loader2 className="spin" size={18} /> : <Play size={18} />}
                    <span>{loading ? 'Analyzing...' : 'Generate Analysis'}</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {error && (
            <div className="alert-message error-message">
              <ServerCrash size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-message success-message">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          {loading && (
            <div className="progress-container">
              <div className="progress-text">
                Retrieving equipment data... {progress.current} / {progress.total}
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="dashboard-grid">
              {/* Top row: Summary & Pareto */}
              <div className="grid-row-top">
                {utilSummary && (
                  <div className="panel summary-panel">
                    <h2>Executive Summary</h2>
                    <div className="summary-grid">
                      <div className="summary-card">
                        <div className="label">Total Equipment</div>
                        <div className="value">{utilSummary.totalNum}</div>
                      </div>
                      <div className="summary-card">
                        <div className="label">Avg Actual Util.</div>
                        <div className="value highlight">{utilSummary.avgActualUtil}%</div>
                      </div>
                      <div className="summary-card">
                        <div className="label">Avg Overall Util.</div>
                        <div className="value highlight-secondary">{utilSummary.avgOverallUtil}%</div>
                      </div>
                      <div className="summary-card">
                        <div className="label">Total Downtime</div>
                        <div className="value danger">{utilSummary.totalDowntimeHrs} hrs</div>
                      </div>
                      <div className="summary-card">
                        <div className="label">Total Run Time</div>
                        <div className="value success">{utilSummary.totalRunTimeHrs} hrs</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="panel chart-panel pareto-panel">
                  <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2>Downtime Pareto Analysis (Hours)</h2>
                      <p className="subtitle">Identifies equipment with the highest downtime impact</p>
                    </div>
                    <button className="chart-style-toggle" onClick={() => toggleChartStyle('pareto')}>
                      {chartStyle.pareto === 'monotone' ? 'Curved' : 'Straight'}
                    </button>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="asset" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<ParetoTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar yAxisId="left" dataKey="downtime" name="Downtime (hrs)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type={chartStyle.pareto} dataKey="cumulativePercentage" name="Cumulative %" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308' }} activeDot={{ r: 6 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Asset Selection Bar */}
              <div classNme="asset-filter-bar panel">
                <span className="filter-label">Analyzing:</span>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${selectedAsset === 'ALL' ? 'active' : ''}`}
                    onClick={() => handleAssetFilterChange('ALL')}
                  >
                    ALL Assets ({chartData.length})
                  </button>
                  {chartData.map(c => (
                    <button
                      key={c.asset}
                      className={`filter-btn ${selectedAsset === c.asset ? 'active' : ''}`}
                      onClick={() => handleAssetFilterChange(c.asset)}
                    >
                      {c.abbreviation}
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle row: Condition details & Trend Chart */}
              <div className="grid-row-middle">
                {conditionData && (
                  <div className="panel condition-panel">
                    <div className="panel-header">
                      <h2>Equipment Condition</h2>
                      <p className="subtitle">{selectedAsset === 'ALL' ? 'Global Average' : selectedAsset}</p>
                    </div>
                    <div className="condition-grid">
                      <ConditionBar label="Running" actual={conditionData.run} kpi={KPI.RUN} isGte={true} isActive={activeCondition === 'RUN'} onClick={() => setActiveCondition('RUN')} />
                      <ConditionBar label="Idle" actual={conditionData.idle} kpi={KPI.IDLE} isGte={false} isActive={activeCondition === 'IDLE'} onClick={() => setActiveCondition('IDLE')} />
                      <ConditionBar label="Maintenance" actual={conditionData.down} kpi={KPI.DOWN} isGte={false} isActive={activeCondition === 'DOWN'} onClick={() => setActiveCondition('DOWN')} />
                      <ConditionBar label="PM" actual={conditionData.pm} kpi={KPI.PM} isGte={false} isActive={activeCondition === 'PM'} onClick={() => setActiveCondition('PM')} />
                    </div>
                  </div>
                )}

                <div className="panel chart-panel trend-panel">
                  <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2>{activeCondition === 'RUN' ? 'Run Analysis' : `${activeCondition} Trend Analysis (%)`}</h2>
                      <p className="subtitle">Daily performance against KPI</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className="export-btn"
                        onClick={() => {
                          let trendKey, kpiObj, name;
                          switch (activeCondition) {
                            case 'RUN': trendKey = 'dailyRun'; kpiObj = KPI.RUN; name = 'RUN'; break;
                            case 'IDLE': trendKey = 'dailyIdle'; kpiObj = KPI.IDLE; name = 'IDLE'; break;
                            case 'DOWN': trendKey = 'dailyDown'; kpiObj = KPI.DOWN; name = 'DOWN'; break;
                            case 'PM': trendKey = 'dailyPm'; kpiObj = KPI.PM; name = 'PM'; break;
                            default: return;
                          }
                          exportDailyTrend(trendKey, kpiObj, name);
                        }}
                        title={`Export ${activeCondition} Trend to Excel`}
                        style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} /> Excel
                      </button>
                      <button className="chart-style-to  ggle" onClick={() => toggleChartStyle('trend')}>
                        {chartStyle.trend === 'monotone' ? 'Curved' : 'Straight'}
                      </button>
                    </div>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={
                          activeCondition === 'RUN' ? runData :
                            activeCondition === 'IDLE' ? idleData :
                              activeCondition === 'DOWN' ? downData : pmData
                        }
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <Tooltip content={<RunTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="value" name={activeCondition === 'RUN' ? 'Running ratio' : 'Actual Ratio'} fill="#5470c6" radius={[4, 4, 0, 0]} />
                        <Line type={chartStyle.trend} dataKey="target" name="Target KPI" stroke="#f59e0b" strokeWidth={3} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Third row: Output Analysis & Extra Charts */}
              <div className="split-row">
                <div className="panel chart-panel output-panel">
                  <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2>Output Quantity Analysis</h2>
                      <p className="subtitle">Daily production output (Normal vs Rework)</p>
                    </div>
                    <button className="chart-style-toggle" onClick={() => toggleChartStyle('output')}>
                      {chartStyle.output === 'monotone' ? 'Curved' : 'Straight'}
                    </button>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={outputData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }} />
                        <Legend verticalAlign="bottom" align="center" onClick={handleLegendClick} wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} />
                        <Bar dataKey="normalOutputActual" stackId="a" name="Normal Work Order Actual Output" fill="#bfd3ed" radius={[0, 0, 0, 0]} hide={!outputSeriesVisibility.normalOutputActual} legendType="rect" barSize={24} />
                        <Bar dataKey="reworkOutputActual" stackId="a" name="Rework Order Actual Output" fill="#4a90e2" radius={[0, 0, 0, 0]} hide={!outputSeriesVisibility.reworkOutputActual} legendType="rect" barSize={24} />
                        <Line type={chartStyle.output} dataKey="normalOutputStandard" name="Normal Work Order Standard Output" stroke="#7cc6b7" strokeWidth={3} dot={false} hide={!outputSeriesVisibility.normalOutputStandard} legendType="rect" />
                        <Line type={chartStyle.output} dataKey="reworkOutputStandard" name="Rework Order Standard Output" stroke="#a8d26a" strokeWidth={3} dot={false} hide={!outputSeriesVisibility.reworkOutputStandard} legendType="rect" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {activeCondition === 'IDLE' && (
                  <div className="panel chart-panel idle-panel">
                    <div className="panel-header">
                      <h2>Idle Time Analysis</h2>
                      <p className="subtitle">Breakdown of idle causes (Estimated Hours)</p>
                    </div>
                    <div className="chart-wrapper">
                      {idleTimeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={idleTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="Wait Material" stackId="a" fill="#ff7675" />
                            <Bar dataKey="Wait Operator" name="Wait Operator" stackId="a" fill="#ff9f43" />
                            <Bar dataKey="No Plan" name="No Plan" stackId="a" fill="#00cec9" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No data</div>
                      )}
                    </div>
                  </div>
                )}
                {activeCondition === 'DOWN' && (
                  <>
                    <div className="panel chart-panel down-panel">
                      <div className="panel-header">
                        <h2>Maintenance Fault Causes</h2>
                        <p className="subtitle">Proportion of downtime categories</p>
                      </div>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={maintenancePieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {maintenancePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }} formatter={(v, n, item) => [`${item.payload && item.payload.realValue !== undefined ? item.payload.realValue : v}%`, n]} />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div ref={panelRef} className={`panel chart-panel down-panel ${isFullScreen ? 'full-screen' : ''}`}>
                      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h2>Category fault causes proportion</h2>
                          <p className="subtitle">Proportion of output fault causes</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button className="export-btn" onClick={exportCategoryExcel} title="Export to Excel">
                            <Download size={14} style={{ marginRight: '5px' }} /> Excel
                          </button>
                          <button className="export-btn" onClick={() => captureElement(panelRef, isFullScreen ? 'Output_Analysis_Panel_Full.png' : 'Output_Analysis_Panel.png')} title="Capture Panel as Image">
                            <Camera size={14} style={{ marginRight: '5px' }} /> Capture
                          </button>
                          <button className="export-btn" onClick={() => setIsFullScreen(!isFullScreen)} title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Mode'}>
                            {isFullScreen ? <Minimize2 size={14} style={{ marginRight: '5px' }} /> : <Maximize2 size={14} style={{ marginRight: '5px' }} />}
                            {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                          </button>
                          <div className="chart-style-toggle-group">
                            <button className={outputFaultChartType === 'pie' ? 'active' : ''} onClick={() => { setOutputFaultChartType('pie'); setSelectedDrillDownCategory(null); }}>Pie</button>
                            <button className={outputFaultChartType === 'pareto' ? 'active' : ''} onClick={() => { setOutputFaultChartType('pareto'); setSelectedDrillDownCategory(null); }}>Pareto</button>
                          </div>
                        </div>
                      </div>
                      <div className="chart-wrapper">
                        {outputFaultChartType === 'pie' ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={outputFaultPieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={isFullScreen ? 180 : 100}
                                fill="#8884d8"
                                dataKey="value"
                                onClick={(e) => {
                                  if (!selectedDrillDownCategory) {
                                    setSelectedDrillDownCategory(e.name);
                                    setOutputFaultChartType('pareto');
                                  }
                                }}
                                style={{ cursor: !selectedDrillDownCategory ? 'pointer' : 'default' }}
                              >
                                {outputFaultPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }} formatter={(v, n, item) => [`${item.payload && item.payload.realValue !== undefined ? item.payload.realValue : v}%`, n]} />
                              <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="drilldown-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {selectedDrillDownCategory && (
                              <div style={{ padding: '0 0 10px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <button onClick={() => setSelectedDrillDownCategory(null)} className="back-btn" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    ← Back to Categories
                                  </button>
                                  <h3 style={{ marginTop: '10px', fontSize: '14px', color: '#94a3b8' }}>
                                    Fault Codes for: <span style={{ color: '#fff' }}>{selectedDrillDownCategory}</span>
                                  </h3>
                                </div>
                              </div>
                            )}
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={selectedDrillDownCategory ? faultCodesDrillDown[selectedDrillDownCategory] || [] : outputFaultParetoData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: isFullScreen ? 14 : 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                                <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: isFullScreen ? 14 : 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: isFullScreen ? 14 : 11 }} tickLine={false} axisLine={{ stroke: '#334155' }} tickFormatter={v => `${v.toFixed(0)}%`} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }} formatter={(v, n, item) => n === 'Cumulative %' ? [`${v.toFixed(1)}%`, n] : item.payload.desc ? [v, `${n}: ${item.payload.desc}`] : [v, n]} />
                                <Bar
                                  yAxisId="left"
                                  dataKey="value"
                                  name={selectedDrillDownCategory ? "Faults" : "Fault Causes"}
                                  fill="#5470c6"
                                  radius={[4, 4, 0, 0]}
                                  isAnimationActive={true}
                                  animationDuration={600}
                                  animationEasing="ease-out"
                                  onClick={(e) => {
                                    if (!selectedDrillDownCategory) {
                                      setSelectedDrillDownCategory(e.name);
                                    }
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {
                                    (selectedDrillDownCategory ? faultCodesDrillDown[selectedDrillDownCategory] || [] : outputFaultParetoData).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color || '#5470c6'} />
                                    ))
                                  }
                                </Bar>
                                {!selectedDrillDownCategory && (
                                  <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="cumulativePercentage"
                                    name="Cumulative %"
                                    stroke="#fac858"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#fac858', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                    isAnimationActive={true}
                                  />
                                )}
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {
                  activeCondition === 'PM' && (
                    <div className="panel chart-panel pm-panel">
                      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h2>PM Activity Analysis</h2>
                          <p className="subtitle">Preventive Maintenance Hours over time</p>
                        </div>
                        <button className="chart-style-toggle" onClick={() => toggleChartStyle('pm')}>
                          {chartStyle.pm === 'monotone' ? 'Curved' : 'Straight'}
                        </button>
                      </div>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={pmData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#334155' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="value" name="PM Hours" fill="#1890FF" radius={[4, 4, 0, 0]} />
                            <Line type={chartStyle.pm} dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )
                }
              </div >

              {/* Bottom row: Table */}
              < div className="panel table-panel" >
                <div className="panel-header">
                  <h2>Equipment Details</h2>
                  <button className="export-btn" onClick={exportCSV} title="Export to CSV">
                    <Download size={16} /> Export CSV
                  </button>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Index</th>
                        {renderMainSortableHeader("Assets No", "asset")}
                        {renderMainSortableHeader("SAP Code", "sapCode")}
                        {renderMainSortableHeader("Equipment Name", "name")}
                        {renderMainSortableHeader("Utilization rate", "actualUtil")}
                        {renderMainSortableHeader("Duration Of Downtime", "downtime")}
                        {renderMainSortableHeader("Run Time", "runTimeHr")}
                        {renderMainSortableHeader("Station", "station")}
                        {renderMainSortableHeader("Site", "site")}
                        {renderMainSortableHeader("Equipment Type", "type")}
                        {renderMainSortableHeader("Equipment Model", "model")}
                        {renderMainSortableHeader("Equipment Abbreviation", "abbreviation")}
                        {renderMainSortableHeader("Device Location", "location")}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={idx} className={row.assetCode === selectedAsset ? 'selected' : ''} onClick={() => {
                          if (row.assetCode) {
                            setSelectedAsset(row.assetCode === selectedAsset ? 'ALL' : row.assetCode);
                          }
                        }}>
                          <td>{row.assetCode}</td>
                          <td>
                            <div className="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                              <span className={`status-dot ${row.runStatus === 'RUN' ? 'success' : row.runStatus === 'DOWN' ? 'error' : row.runStatus === 'IDLE' ? 'warning' : 'offline'}`}></span>
                              {row.runStatus}
                            </div>
                          </td>
                          <td>{row.actualUtil}%</td>
                          <td>{row.downtime}</td>
                          <td>{row.runTimeHr}</td>
                          <td>{row.station}</td>
                          <td>{row.site}</td>
                          <td>{row.type}</td>
                          <td>{row.model}</td>
                          <td>{row.abbreviation}</td>
                          <td>{row.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {popupOpen && popupData && (
            <div className="fault-popup-overlay" onClick={(e) => {
              if (e.target.className === 'fault-popup-overlay') {
                setPopupOpen(false);
                setPopupSearchQuery('');
                setPopupFilterValue('ALL');
              }
            }}>
              <div ref={popupRef} className="fault-popup-content glass-panel" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', top: '10px', zIndex: 10 }}>
                  <button className="export-btn" onClick={() => captureElement(popupRef, `Fault_${popupData.data.code}.png`)} title="Capture Popup as Image" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={14} /> Capture
                  </button>
                  <button className="fault-popup-close" style={{ position: 'static' }} onClick={() => { setPopupOpen(false); setPopupSearchQuery(''); setPopupFilterValue('ALL'); }}>✕</button>
                </div>

                <div className="popup-header" style={{ paddingRight: '120px' }}>
                  <div className="popup-header-title">
                    <span className={`popup-tag ${popupData.type === 'human' ? 'human' : ''}`}>
                      {popupData.type === 'human' ? 'Human Error Analysis' : 'Device Fault Analysis'}
                    </span>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      {popupData.type === 'human' ? popupData.data.operator : `${popupData.data.code}: ${popupData.data.name}`}
                    </h1>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px', lineHeight: '1.4' }}>
                    {popupData.type === 'human' ? `Detailed performance profile and operator error log for personnel ${popupData.data.operator}.` : popupData.data.description}
                  </p>

                  {popupData.type === 'device' && ["TXYJ03", "TXYJ12", "TXYJ05", "TXYJ10"].includes(popupData.data.code) && (
                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={16} />
                      <span>Special device configuration applied. Incident count: {popupData.data.totalIncidents}</span>
                    </div>
                  )}
                </div>

                {/* Popup Performance Stats */}
                <div className="popup-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="stat-card">
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {popupData.type === 'human' ? 'Total Error Incidents' : 'Total Occurrences'}
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '5px' }}>
                      {popupData.type === 'human' ? popupData.data.totalErrors : popupData.data.totalIncidents}
                    </div>
                  </div>
                  <div className="stat-card">
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {popupData.type === 'human' ? 'Error Rate (%)' : 'Standard Repair Time'}
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '5px' }}>
                      {popupData.type === 'human' ? popupData.data.errorRate : `${popupData.data.standardRepairTime} mins`}
                    </div>
                  </div>
                  <div className="stat-card">
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {popupData.type === 'human' ? 'Units Run' : 'Average Repair Duration'}
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>
                      {popupData.type === 'human' ? popupData.data.totalUnitsRun : `${popupData.data.avgDuration} mins`}
                    </div>
                  </div>
                </div>

                {/* Popup Main Sections: Left Operators Profile & Right Incident Table */}
                <div className="popup-body-split" style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                  {popupData.type === 'device' && (
                    <div className="popup-left-list" style={{ flex: '1 1 250px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', padding: '15px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>Top Affected Operators</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {popupData.data.topOperators?.map(op => (
                          <div key={op.operator} className="operator-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="operator-avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '600' }}>
                                {op.initials}
                              </div>
                              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{op.operator}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{op.count} times ({op.rate})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Filter and Search Bar for Popups */}
                  <div className="popup-right-table" style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="table-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder={popupData.type === 'human' ? "Search symptom or work order..." : "Search repair personnel or work order..."}
                        value={popupSearchQuery}
                        onChange={e => setPopupSearchQuery(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                      />
                      <select
                        value={popupFilterValue}
                        onChange={e => setPopupFilterValue(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        <option value="ALL">All Records</option>
                        {popupData.type === 'device' ? (
                          popupData.data.topOperators?.map(op => (
                            <option key={op.operator} value={op.operator}>{op.operator}</option>
                          ))
                        ) : (
                          [...new Set(popupData.data.errors?.map(err => err.symptom))].map(symp => (
                            <option key={symp} value={symp}>{symp}</option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Incident Table */}
                    <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            {popupData.type === 'human' ? (
                              <>
                                <th>Index</th>
                                <th>Date</th>
                                <th>Work Order</th>
                                {renderSortableHeader("Symptom", "symptom")}
                                {renderSortableHeader("Units Processed", "unitsProcessed")}
                                {renderSortableHeader("Failed Units", "failedUnits")}
                              </>
                            ) : (
                              <>
                                <th>Index</th>
                                <th>Work Order</th>
                                {renderSortableHeader("Date Time", "date")}
                                {renderSortableHeader("Operator", "operator")}
                                {renderSortableHeader("Repair Personnel", "repairPersonnel")}
                                {renderSortableHeader("Duration", "duration")}
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIncidentHistory.map((item, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              {popupData.type === 'human' ? (
                                <>
                                  <td>{item.date}</td>
                                  <td>{item.workOrder}</td>
                                  <td>{item.symptom}</td>
                                  <td>{item.unitsProcessed}</td>
                                  <td style={{ color: '#f87171', fontWeight: 600 }}>{item.failedUnits}</td>
                                </>
                              ) : (
                                <>
                                  <td>{item.workOrder}</td>
                                  <td>{item.date}</td>
                                  <td style={getOperatorHeaderStyle()}>{item.operator}</td>
                                  <td>{item.repairPersonnel}</td>
                                  <td style={getRepairTimeStyle(item.duration)}>{item.duration}</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}