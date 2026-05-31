import { useState } from "react";
import "./App.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const icons = {
  gel: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="6" x2="8" y2="18"/><line x1="13" y1="6" x2="13" y2="18"/></svg>,
  etbr: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3h6l1 6H8L9 3z"/><rect x="7" y="9" width="10" height="8" rx="1"/><path d="M10 17v3M14 17v3"/><line x1="7" y1="13" x2="17" y2="13"/></svg>,
  template: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg>,
  dilution: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12l2 7H4L6 3z"/><path d="M4 10c0 5 2 9 8 9s8-4 8-9"/><line x1="9" y1="14" x2="15" y2="14"/></svg>,
  dye: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L8 8H4l4 4-2 6 6-3 6 3-2-6 4-4h-4L12 2z"/></svg>,
  buffer: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3h8l2 4v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7l2-4z"/><line x1="6" y1="10" x2="18" y2="10"/><path d="M10 14h4M10 17h4"/></svg>,
  runtime: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  protocols: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
};
const pageOrder = ["gel", "etbr", "template", "dilution", "dye", "buffer", "runtime", "protocols"];
export default function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inputs, setInputs] = useState({
    gelVolume: "",
    gelPercent: "1.0",
    buffer: "TAE",
    etbrStock: "10",
    etbrMethod: "ingel",
    numSamples: "",
    dnaConcInput: "",
    desiredDna: "100",
    finalVolume: "10",
    dyeStock: "6",
    voltage: "5",
    gelLength: "10",
  });

  function updateInput(key, value) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function navigate(p) {
    setPage(p);
    setMenuOpen(false);
    window.history.pushState({ page: p }, "");
  }

  useState(() => {
    const handler = (e) => {
      const p = e.state?.page || "home";
      setPage(p);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      <nav className="navbar">
        <div className="logo">GELCALC</div>
        <div className="nav-links">
          {[["home","Home"],["gel","Gel Mix"],["template","Template"],["etbr","EtBr"],["dilution","Dilution"],["dye","Loading Dye"],["buffer","Buffer"],["runtime","Run Time"],["protocols","Protocols"]].map(([key,label]) => (
            <button key={key} onClick={() => navigate(key)} className={page === key ? "active" : ""}>{label}</button>
          ))}
        </div>
        <div style={{display:"flex", alignItems:"center", gap:"8px", marginLeft:"auto"}}>
          <button className="mode-toggle" onClick={() => setDark(!dark)}>
            {dark ? icons.sun : icons.moon}
          </button>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {[["home","Home"],["gel","Gel Mix"],["template","Template"],["etbr","EtBr"],["dilution","Dilution"],["dye","Loading Dye"],["buffer","Buffer"],["runtime","Run Time"],["protocols","Protocols"]].map(([key,label]) => (
            <button key={key} onClick={() => navigate(key)} className={page === key ? "active" : ""}>{label}</button>
          ))}
        </div>
      )}

      <main>
  <div className="content">
    <HomePage setPage={navigate} dark={dark} />
  </div>
  {page !== "home" && (
    <div className="tool-overlay">
      <div className="tool-inner" id="export-area">
      <div style={{display:"flex", gap:"12px", marginBottom:"32px", flexWrap:"wrap"}}>
  <button className="back-btn" onClick={() => setPage("home")}>
    ← Back to Home
  </button>
  <button className="back-btn" onClick={async () => {
    const element = document.getElementById('export-area');
    const canvas = await html2canvas(element, { 
  scale: 2, 
  useCORS: true,
  backgroundColor: '#ffffff',
  logging: false
});
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`gelcalc-${page}.pdf`);
  }}>
    ⬇ Export PDF
  </button>
</div>
      <div id="export-area">
        {page === "gel" && <GelPage inputs={inputs} updateInput={updateInput} />}
        {page === "etbr" && <EtBrPage inputs={inputs} updateInput={updateInput} />}
        {page === "template" && <TemplatePage inputs={inputs} updateInput={updateInput} />}
        {page === "dilution" && <DilutionPage inputs={inputs} updateInput={updateInput} />}
        {page === "dye" && <DyePage inputs={inputs} updateInput={updateInput} />}
        {page === "buffer" && <BufferPage inputs={inputs} updateInput={updateInput} />}
        {page === "runtime" && <RuntimePage inputs={inputs} updateInput={updateInput} />}
        {page === "protocols" && <ProtocolsPage />}
      </div>

      {page !== "protocols" && (
        <button className="next-btn" onClick={() => {
          const idx = pageOrder.indexOf(page);
          if (idx < pageOrder.length - 1) navigate(pageOrder[idx + 1]);
        }}>
          Next: {(() => {
            const idx = pageOrder.indexOf(page);
            const labels = { gel: "Gel Mix", etbr: "EtBr Amount", template: "Template", dilution: "Dilution", dye: "Loading Dye", buffer: "Buffer Prep", runtime: "Run Time", protocols: "Protocols" };
            return labels[pageOrder[idx + 1]] || "";
          })()} →
        </button>
      )}
      </div>
    </div>
  )}
</main>
    </div>
  );
}

function HomePage({ setPage, dark }) {
  const cards = [
    { key: "gel", icon: "gel", title: "Gel Mix", desc: "Calculate agarose and buffer amounts" },
    { key: "etbr", icon: "etbr", title: "EtBr Amount", desc: "Safe staining calculations" },
    { key: "template", icon: "template", title: "Template Selector", desc: "Find the right gel template" },
    { key: "dilution", icon: "dilution", title: "Sample Dilution", desc: "DNA dilution calculations" },
    { key: "dye", icon: "dye", title: "Loading Dye", desc: "Dye prep and mixing guide" },
    { key: "buffer", icon: "buffer", title: "Buffer Prep", desc: "TAE and TBE calculations" },
    { key: "runtime", icon: "runtime", title: "Run Time", desc: "Voltage and time calculator" },
    { key: "protocols", icon: "protocols", title: "Protocols", desc: "Full protocol + troubleshooting" },
  ];

  return (
    <div className="home" style={{
  backgroundImage: dark
    ? `linear-gradient(rgba(8,8,8,0.7), rgba(8,8,8,0.7)), url('/bg.jpg')`
    : `linear-gradient(rgba(240,246,250,0.55), rgba(240,246,250,0.55)), url('/bg.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: '80px 60px',
  borderRadius: '16px',
}}>
  
      <h1>Agarose Gel<br />Calculator</h1>
      <p className="subtitle">Your complete lab assistant for gel electrophoresis</p>
      <div className="card-grid">
        {cards.map(c => (
          <div className="card" key={c.key} onClick={() => setPage(c.key)}>
            <span className="card-icon">{icons[c.icon]}</span>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GelPage({ inputs, updateInput }) {
  const [result, setResult] = useState(null);

  function calculate() {
    const vol = parseFloat(inputs.gelVolume);
    if (!vol || vol <= 0) return;
    const agarose = ((parseFloat(inputs.gelPercent) * vol) / 100).toFixed(3);
    const bufferVol = vol.toFixed(1);
    let stockVol, waterVol, stockLabel;
    if (inputs.buffer === "TAE") {
      stockVol = (vol / 50).toFixed(2);
      waterVol = (vol - vol / 50).toFixed(2);
      stockLabel = "50x TAE stock";
    } else {
      stockVol = (vol / 10).toFixed(2);
      waterVol = (vol - vol / 10).toFixed(2);
      stockLabel = "10x TBE stock";
    }
    setResult({ agarose, bufferVol, stockVol, waterVol, stockLabel });
  }

  return (
    <div className="page">
      <h2>Gel Mix Calculator</h2>
      <p className="page-subtitle">Calculate agarose and buffer amounts for your gel</p>

      <div className="input-group">
        <label>Gel Volume (mL)</label>
        <input type="number" placeholder="e.g. 50" value={inputs.gelVolume} onChange={e => updateInput("gelVolume", e.target.value)} />
      </div>

      <div className="input-group">
        <label>Gel Percentage (%)</label>
        <div className="select-wrap">
          <select value={inputs.gelPercent} onChange={e => updateInput("gelPercent", e.target.value)}>
            <option value="0.5">0.5% — Very large DNA (&gt;12 kb)</option>
            <option value="0.8">0.8% — Large DNA (1–12 kb)</option>
            <option value="1.0">1.0% — Standard PCR</option>
            <option value="1.2">1.2% — Medium fragments</option>
            <option value="1.5">1.5% — Small fragments</option>
            <option value="2.0">2.0% — Very small (&lt;500 bp)</option>
          </select>
        </div>
      </div>

      <div className="input-group">
        <label>Buffer Type</label>
        <div className="select-wrap">
          <select value={inputs.buffer} onChange={e => updateInput("buffer", e.target.value)}>
            <option value="TAE">TAE (most common, DNA extraction)</option>
            <option value="TBE">TBE (small DNA, no extraction)</option>
          </select>
        </div>
      </div>

      <button className="btn" onClick={calculate}>Calculate</button>

      {result && (
        <div className="result-box output">
          <h3>Results</h3>
          <div className="result-row">
            <span className="result-label">Agarose powder</span>
            <span className="result-value">{result.agarose} g</span>
          </div>
          <div className="result-row">
            <span className="result-label">Total buffer volume</span>
            <span className="result-value">{result.bufferVol} mL</span>
          </div>
          <div className="result-row">
            <span className="result-label">{result.stockLabel}</span>
            <span className="result-value">{result.stockVol} mL</span>
          </div>
          <div className="result-row">
            <span className="result-label">Distilled water</span>
            <span className="result-value">{result.waterVol} mL</span>
          </div>
        </div>
      )}

      <div className="warning-box" style={{marginTop: "32px"}}>
        ⚠️ Heat agarose in microwave in 30-second intervals until completely clear. Cool to ~60°C before adding EtBr. Ensure tray is level before pouring.
      </div>
    </div>
  );
}
function EtBrPage({ inputs, updateInput }) {
  const [result, setResult] = useState(null);

  function calculate() {
    const vol = parseFloat(inputs.gelVolume);
    const stock = parseFloat(inputs.etbrStock);
    if (!vol || vol <= 0) return;
    const etbrUL = ((0.5 * vol) / (stock * 1000)) * 1000000;
    setResult({ etbrUL: etbrUL.toFixed(2) });
  }

  return (
    <div className="page">
      <h2>EtBr Calculator</h2>
      <p className="page-subtitle">Uses gel volume from Gel Mix page — enter it there first</p>

      <div className="result-box" style={{marginBottom: "24px"}}>
        <h3>Using from Gel Mix</h3>
        <div className="result-row">
          <span className="result-label">Gel Volume</span>
          <span className="result-value">{inputs.gelVolume ? inputs.gelVolume + " mL" : "Not set — go to Gel Mix first"}</span>
        </div>
      </div>

      <div className="input-group">
        <label>EtBr Stock Concentration</label>
        <div className="select-wrap">
          <select value={inputs.etbrStock} onChange={e => updateInput("etbrStock", e.target.value)}>
            <option value="10">10 mg/mL (standard)</option>
            <option value="1">1 mg/mL</option>
            <option value="0.5">0.5 mg/mL</option>
          </select>
        </div>
      </div>

      <div className="input-group">
        <label>Staining Method</label>
        <div className="select-wrap">
          <select value={inputs.etbrMethod} onChange={e => updateInput("etbrMethod", e.target.value)}>
            <option value="ingel">In-gel (added before pouring)</option>
            <option value="poststain">Post-stain (after running)</option>
          </select>
        </div>
      </div>

      <button className="btn" onClick={calculate}>Calculate</button>

      {result && (
        <div className="result-box output">
          <h3>Results — Target: 0.5 µg/mL</h3>
          <div className="result-row">
            <span className="result-label">EtBr to add</span>
            <span className="result-value">{result.etbrUL} µL</span>
          </div>
          <div className="result-row">
            <span className="result-label">Final concentration</span>
            <span className="result-value">0.5 µg/mL</span>
          </div>
          <div className="result-row">
            <span className="result-label">Method</span>
            <span className="result-value">{inputs.etbrMethod === "ingel" ? "Add to cooled gel (~60°C)" : "Stain 15–60 min after run"}</span>
          </div>
        </div>
      )}

      <div className="warning-box" style={{marginTop: "32px"}}>
        ⚠️ EtBr is mutagenic and carcinogenic. Always wear gloves, lab coat and safety goggles. Dispose as hazardous waste. Consider safer alternatives: GelRed, SYBR Safe, or methylene blue.
      </div>
    </div>
  );
}
function TemplatePage({ inputs, updateInput }) {
  const [result, setResult] = useState(null);

  function calculate() {
    const n = parseInt(inputs.numSamples);
    if (!n || n <= 0) return;
    const total = n + 1;
    let tray, comb, wellVol, gelVol, note, trayKey;

    if (total <= 7) {
      tray = "Mini"; comb = "6-well"; wellVol = "40–50 µL"; gelVol = "25–30 mL"; trayKey = "mini6";
    } else if (total <= 11) {
      tray = "Mini"; comb = "10-well"; wellVol = "25–30 µL"; gelVol = "30–35 mL"; trayKey = "mini10";
    } else if (total <= 13) {
      tray = "Medium"; comb = "12-well"; wellVol = "20–25 µL"; gelVol = "50–60 mL"; trayKey = "medium12";
    } else if (total <= 21) {
      tray = "Medium"; comb = "20-well"; wellVol = "15–20 µL"; gelVol = "60–75 mL"; trayKey = "medium20";
    } else {
      tray = "Large"; comb = "20-well × 2 rows"; wellVol = "15–20 µL"; gelVol = "100–120 mL"; trayKey = "large";
    }

    note = parseFloat(inputs.gelPercent) <= 0.8
      ? "Low % gel — use large tray for better separation"
      : parseFloat(inputs.gelPercent) >= 1.5
      ? "High % gel — mini tray works well for small fragments"
      : "Standard gel — recommended tray selected";

    setResult({ tray, comb, wellVol, gelVol, total, note, trayKey });
  }

  const TrayDiagram = ({ trayKey }) => {
    const trays = {
      mini6: { w: 70, h: 70, wells: 6, rows: 1, label: "Mini Tray — 7 × 7 cm", volLabel: "25–30 mL gel" },
      mini10: { w: 70, h: 70, wells: 10, rows: 1, label: "Mini Tray — 7 × 7 cm", volLabel: "30–35 mL gel" },
      medium12: { w: 100, h: 100, wells: 12, rows: 1, label: "Medium Tray — 10 × 10 cm", volLabel: "50–60 mL gel" },
      medium20: { w: 100, h: 100, wells: 20, rows: 1, label: "Medium Tray — 10 × 10 cm", volLabel: "60–75 mL gel" },
      large: { w: 150, h: 150, wells: 20, rows: 2, label: "Large Tray — 15 × 15 cm", volLabel: "100–120 mL gel" },
    };
    const t = trays[trayKey];
    const scale = 3.2;
    const W = t.w * scale, H = t.h * scale;
    const pad = 28, wallT = 8;
    const wellW = 10, wellH = 16;
    const wellsPerRow = t.wells;
const innerW = W - pad * 2;
const gap = wellsPerRow > 1 ? (innerW - wellsPerRow * wellW) / (wellsPerRow - 1) : 0;
const wellStartX = pad + (innerW - (wellsPerRow * wellW + (wellsPerRow - 1) * gap)) / 2;
    const wellStartY = pad + 20;

    const renderWells = (rowIdx) =>
      Array.from({ length: wellsPerRow }).map((_, i) => (
        <rect
          key={`${rowIdx}-${i}`}
          x={wellStartX + i * (wellW + gap)}
          y={wellStartY + rowIdx * (wellH + 30)}
          width={wellW} height={wellH}
          rx="2"
          fill="#7dd3fc" fillOpacity="0.25"
          stroke="#7dd3fc" strokeWidth="1"
        />
      ));

    return (
      <div style={{ marginTop: 24 }}>
        <svg width={W + 100} height={H + 100} viewBox={`-50 -30 ${W + 100} ${H + 100}`} style={{ display: "block", margin: "0 auto" }}>
          {/* Tray body */}
          <rect x={0} y={0} width={W} height={H} rx="6" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeOpacity="0.4" />
          {/* Tray walls (inner) */}
          <rect x={wallT} y={wallT} width={W - wallT * 2} height={H - wallT * 2} rx="4" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.2" />

          {/* Wells */}
          {Array.from({ length: t.rows }).map((_, r) => renderWells(r))}

          {/* Width dimension line */}
          <line x1={0} y1={H + 20} x2={W} y2={H + 20} stroke="#3a7a94" strokeWidth="1" />
          <line x1={0} y1={H + 14} x2={0} y2={H + 26} stroke="#3a7a94" strokeWidth="1" />
          <line x1={W} y1={H + 14} x2={W} y2={H + 26} stroke="#3a7a94" strokeWidth="1" />
          <text x={W / 2} y={H + 38} textAnchor="middle" fill="#7dd3fc" fontSize="11" fontFamily="EB Garamond, serif">{t.w} mm</text>

          {/* Height dimension line */}
          <line x1={W + 20} y1={0} x2={W + 20} y2={H} stroke="#3a7a94" strokeWidth="1" />
          <line x1={W + 14} y1={0} x2={W + 26} y2={0} stroke="#3a7a94" strokeWidth="1" />
          <line x1={W + 14} y1={H} x2={W + 26} y2={H} stroke="#3a7a94" strokeWidth="1" />
          <text x={W + 36} y={H / 2} textAnchor="middle" fill="#7dd3fc" fontSize="11" fontFamily="EB Garamond, serif" transform={`rotate(90, ${W + 36}, ${H / 2})`}>{t.h} mm</text>

          {/* Well count label */}
          <text x={W / 2} y={-12} textAnchor="middle" fill="#c8e8f5" fontSize="12" fontFamily="EB Garamond, serif" fontWeight="700">{t.label}</text>
          <text x={W / 2} y={H + 58} textAnchor="middle" fill="#3a7a94" fontSize="11" fontFamily="EB Garamond, serif">{t.volLabel} · {t.wells * t.rows} wells</text>

          {/* Well width label */}
          <line x1={wellStartX} y1={wellStartY + wellH + 8} x2={wellStartX + wellW} y2={wellStartY + wellH + 8} stroke="#3a7a94" strokeWidth="0.8" strokeDasharray="3,2" />
          <text x={wellStartX + wellW / 2} y={wellStartY + wellH + 18} textAnchor="middle" fill="#3a7a94" fontSize="9" fontFamily="EB Garamond, serif">10 mm</text>
        </svg>
      </div>
    );
  };

  const allTrays = [
    { key: "mini6", label: "Mini — 6 well", dim: "7 × 7 cm", wells: 6, vol: "25–30 mL", use: "≤5 samples" },
    { key: "mini10", label: "Mini — 10 well", dim: "7 × 7 cm", wells: 10, vol: "30–35 mL", use: "6–9 samples" },
    { key: "medium12", label: "Medium — 12 well", dim: "10 × 10 cm", wells: 12, vol: "50–60 mL", use: "10–11 samples" },
    { key: "medium20", label: "Medium — 20 well", dim: "10 × 10 cm", wells: 20, vol: "60–75 mL", use: "12–19 samples" },
    { key: "large", label: "Large — 20 well × 2", dim: "15 × 15 cm", wells: 40, vol: "100–120 mL", use: "20+ samples" },
  ];

  return (
    <div className="page">
      <h2>Template Selector</h2>
      <p className="page-subtitle">Find the right gel tray and comb for your experiment</p>

      <div className="result-box info" style={{ marginBottom: 24 }}>
        <h3>From previous inputs</h3>
        <div className="result-row">
          <span className="result-label">Gel Volume</span>
          <span className="result-value">{inputs.gelVolume ? inputs.gelVolume + " mL" : "Not set"}</span>
        </div>
        <div className="result-row">
          <span className="result-label">Gel Percentage</span>
          <span className="result-value">{inputs.gelPercent}%</span>
        </div>
      </div>

      <div className="input-group">
        <label>Number of Samples</label>
        <input type="number" placeholder="e.g. 8" value={inputs.numSamples} onChange={e => updateInput("numSamples", e.target.value)} />
      </div>

      <button className="btn" onClick={calculate}>Find Template</button>

      {result && (
        <>
          <div className="result-box output" style={{ marginTop: 24 }}>
            <h3>Recommended Setup</h3>
            <div className="result-row"><span className="result-label">Gel Tray</span><span className="result-value">{result.tray}</span></div>
            <div className="result-row"><span className="result-label">Comb</span><span className="result-value">{result.comb}</span></div>
            <div className="result-row"><span className="result-label">Well Volume Capacity</span><span className="result-value">{result.wellVol}</span></div>
            <div className="result-row"><span className="result-label">Gel Volume Needed</span><span className="result-value">{result.gelVol}</span></div>
            <div className="result-row"><span className="result-label">Total Wells Needed</span><span className="result-value">{result.total} (samples + ladder)</span></div>
          </div>
          <TrayDiagram trayKey={result.trayKey} />
          <div className="warning-box" style={{ marginTop: 16 }}>💡 {result.note}</div>
        </>
      )}

      <h3 style={{ fontSize: "1.4rem", marginTop: 48, marginBottom: 20 }}>All Standard Tray Sizes</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {allTrays.map(t => (
          <div key={t.key} className="protocol-card">
            <div style={{ flex: 1 }}>
              <div className="protocol-title">{t.label}</div>
              <div className="protocol-body">{t.dim} · {t.vol} gel · Use for: {t.use}</div>
            </div>
            <TrayDiagram trayKey={t.key} />
          </div>
        ))}
      </div>
    </div>
  );
}
function DilutionPage({ inputs, updateInput }) {
  const [result, setResult] = useState(null);

  function calculate() {
    const c1 = parseFloat(inputs.dnaConcInput);
    const desiredDna = parseFloat(inputs.desiredDna);
    const finalVol = parseFloat(inputs.finalVolume);
    if (!c1 || !desiredDna || !finalVol) return;

    const dnaVol = desiredDna / c1;
    const waterVol = finalVol - dnaVol;
    const dyeVol = (dnaVol + waterVol) / 5;
    const totalVol = dnaVol + waterVol + dyeVol;
    const samples = parseInt(inputs.numSamples) || 1;

    setResult({
      dnaVol: dnaVol.toFixed(2),
      waterVol: waterVol.toFixed(2),
      dyeVol: dyeVol.toFixed(2),
      totalVol: totalVol.toFixed(2),
      totalDna: (dnaVol * samples * 1.1).toFixed(2),
      totalWater: (waterVol * samples * 1.1).toFixed(2),
      totalDye: (dyeVol * samples * 1.1).toFixed(2),
      samples,
    });
  }

  return (
    <div className="page">
      <h2>Sample Dilution</h2>
      <p className="page-subtitle">Calculate DNA, water and loading dye volumes per sample</p>

      <div className="result-box info" style={{marginBottom: "24px"}}>
        <h3>From previous inputs</h3>
        <div className="result-row">
          <span className="result-label">Number of Samples</span>
          <span className="result-value">{inputs.numSamples || "Not set"}</span>
        </div>
        <div className="result-row">
          <span className="result-label">Gel Percentage</span>
          <span className="result-value">{inputs.gelPercent}%</span>
        </div>
      </div>

      <div className="input-group">
        <label>DNA Concentration (ng/µL)</label>
        <input type="number" placeholder="e.g. 50" value={inputs.dnaConcInput} onChange={e => updateInput("dnaConcInput", e.target.value)} />
      </div>

      <div className="input-group">
        <label>Desired DNA per Lane (ng)</label>
        <input type="number" placeholder="e.g. 100" value={inputs.desiredDna} onChange={e => updateInput("desiredDna", e.target.value)} />
      </div>

      <div className="input-group">
        <label>Final Volume per Lane (µL)</label>
        <input type="number" placeholder="e.g. 10" value={inputs.finalVolume} onChange={e => updateInput("finalVolume", e.target.value)} />
      </div>

      <button className="btn" onClick={calculate}>Calculate</button>

      {result && (
        <>
          <div className="result-box output" style={{marginTop: "24px"}}>
            <h3>Per Sample</h3>
            <div className="result-row">
              <span className="result-label">DNA volume</span>
              <span className="result-value">{result.dnaVol} µL</span>
            </div>
            <div className="result-row">
              <span className="result-label">Nuclease-free water</span>
              <span className="result-value">{result.waterVol} µL</span>
            </div>
            <div className="result-row">
              <span className="result-label">6x Loading dye</span>
              <span className="result-value">{result.dyeVol} µL</span>
            </div>
            <div className="result-row">
              <span className="result-label">Total volume per lane</span>
              <span className="result-value">{result.totalVol} µL</span>
            </div>
          </div>

          <div className="result-box output" style={{marginTop: "16px"}}>
            <h3>Total for {result.samples} samples (+10% extra)</h3>
            <div className="result-row">
              <span className="result-label">Total DNA</span>
              <span className="result-value">{result.totalDna} µL</span>
            </div>
            <div className="result-row">
              <span className="result-label">Total water</span>
              <span className="result-value">{result.totalWater} µL</span>
            </div>
            <div className="result-row">
              <span className="result-label">Total loading dye</span>
              <span className="result-value">{result.totalDye} µL</span>
            </div>
          </div>
        </>
      )}

      <div className="warning-box" style={{marginTop: "24px"}}>
        💡 Mix by pipetting up and down 5–10 times. Centrifuge briefly at 10,000 rpm for 5 sec. Load immediately or store at 4°C short term.
      </div>
    </div>
  );
}
function DyePage({ inputs, updateInput }) {
  const [result, setResult] = useState(null);

  function calculate() {
    const stockConc = parseFloat(inputs.dyeStock);
    const sampleVol = parseFloat(inputs.finalVolume);
    const samples = parseInt(inputs.numSamples) || 1;
    if (!stockConc || !sampleVol) return;

    const dyePerSample = sampleVol / (stockConc - 1);
    const totalDye = (dyePerSample * samples * 1.1).toFixed(2);

    setResult({ dyePerSample: dyePerSample.toFixed(2), totalDye, samples });
  }

  return (
    <div className="page">
      <h2>Loading Dye</h2>
      <p className="page-subtitle">Prep and dilution calculator for loading dye</p>

      <div className="result-box info" style={{marginBottom: "24px"}}>
        <h3>Carried over</h3>
        <div className="result-row">
          <span className="result-label">Final volume per lane</span>
          <span className="result-value">{inputs.finalVolume} µL</span>
        </div>
        <div className="result-row">
          <span className="result-label">Number of samples</span>
          <span className="result-value">{inputs.numSamples || "Not set"}</span>
        </div>
      </div>

      <div className="input-group">
        <label>Loading Dye Stock Concentration <span className="prefilled">e.g. 6x</span></label>
        <input type="number" placeholder="e.g. 6" value={inputs.dyeStock} onChange={e => updateInput("dyeStock", e.target.value)} />
      </div>

      <button className="btn" onClick={calculate}>Calculate</button>

      {result && (
        <div className="result-box output" style={{marginTop: "24px"}}>
          <h3>Results</h3>
          <div className="result-row">
            <span className="result-label">Dye per sample</span>
            <span className="result-value">{result.dyePerSample} µL</span>
          </div>
          <div className="result-row">
            <span className="result-label">Total dye for {result.samples} samples (+10%)</span>
            <span className="result-value">{result.totalDye} µL</span>
          </div>
          <div className="result-row">
            <span className="result-label">Final concentration</span>
            <span className="result-value">1x</span>
          </div>
        </div>
      )}

      <div className="result-box info" style={{marginTop: "24px"}}>
        <h3>6x Loading Dye Recipe (make 5 mL)</h3>
        <div className="result-row">
          <span className="result-label">Glycerol (30% v/v)</span>
          <span className="result-value">1.5 mL</span>
        </div>
        <div className="result-row">
          <span className="result-label">Bromophenol blue (0.25% w/v)</span>
          <span className="result-value">12.5 mg</span>
        </div>
        <div className="result-row">
          <span className="result-label">Xylene cyanol FF (0.25% w/v)</span>
          <span className="result-value">12.5 mg</span>
        </div>
        <div className="result-row">
          <span className="result-label">Distilled water</span>
          <span className="result-value">To 5 mL</span>
        </div>
      </div>

      <div className="warning-box" style={{marginTop: "16px"}}>
        💡 Bromophenol blue migrates ~300–500 bp. Xylene cyanol migrates ~2000–4000 bp. Store at 4°C. Vortex before use.
      </div>
    </div>
  );
}
function BufferPage({ inputs, updateInput }) {
  const [result, setResult] = useState(null);

  function calculate() {
    const vol = parseFloat(inputs.gelVolume);
    if (!vol) return;

    let stockVol, waterVol, stockLabel, stockConc;
    if (inputs.buffer === "TAE") {
      stockConc = 50;
      stockLabel = "50x TAE stock";
    } else {
      stockConc = 10;
      stockLabel = "10x TBE stock";
    }
    stockVol = (vol / stockConc).toFixed(2);
    waterVol = (vol - vol / stockConc).toFixed(2);

    setResult({ stockVol, waterVol, stockLabel });
  }

  return (
    <div className="page">
      <h2>Buffer Prep</h2>
      <p className="page-subtitle">TAE and TBE buffer preparation calculator</p>

      <div className="result-box info" style={{marginBottom: "24px"}}>
        <h3>Carried over</h3>
        <div className="result-row">
          <span className="result-label">Gel Volume</span>
          <span className="result-value">{inputs.gelVolume ? inputs.gelVolume + " mL" : "Not set"}</span>
        </div>
        <div className="result-row">
          <span className="result-label">Buffer Type</span>
          <span className="result-value">{inputs.buffer}</span>
        </div>
      </div>

      <div className="input-group">
        <label>Buffer Type</label>
        <div className="select-wrap">
          <select value={inputs.buffer} onChange={e => updateInput("buffer", e.target.value)}>
            <option value="TAE">TAE — most common, use for DNA extraction</option>
            <option value="TBE">TBE — high buffering, small DNA, no extraction</option>
          </select>
        </div>
      </div>

      <button className="btn" onClick={calculate}>Calculate</button>

      {result && (
        <div className="result-box output" style={{marginTop: "24px"}}>
          <h3>To make {inputs.gelVolume} mL of 1x {inputs.buffer}</h3>
          <div className="result-row">
            <span className="result-label">{result.stockLabel}</span>
            <span className="result-value">{result.stockVol} mL</span>
          </div>
          <div className="result-row">
            <span className="result-label">Distilled water</span>
            <span className="result-value">{result.waterVol} mL</span>
          </div>
        </div>
      )}

      <div className="result-box info" style={{marginTop: "24px"}}>
        <h3>50x TAE Stock Recipe (1 Litre)</h3>
        <div className="result-row">
          <span className="result-label">Tris base</span>
          <span className="result-value">242 g</span>
        </div>
        <div className="result-row">
          <span className="result-label">Glacial acetic acid</span>
          <span className="result-value">57.1 mL</span>
        </div>
        <div className="result-row">
          <span className="result-label">0.5M EDTA (pH 8.0)</span>
          <span className="result-value">100 mL</span>
        </div>
        <div className="result-row">
          <span className="result-label">Deionized water</span>
          <span className="result-value">To 1 L</span>
        </div>
      </div>

      <div className="result-box info" style={{marginTop: "16px"}}>
        <h3>10x TBE Stock Recipe (1 Litre)</h3>
        <div className="result-row">
          <span className="result-label">Tris base</span>
          <span className="result-value">108 g</span>
        </div>
        <div className="result-row">
          <span className="result-label">Boric acid</span>
          <span className="result-value">55 g</span>
        </div>
        <div className="result-row">
          <span className="result-label">0.5M EDTA (pH 8.0)</span>
          <span className="result-value">40 mL</span>
        </div>
        <div className="result-row">
          <span className="result-label">Deionized water</span>
          <span className="result-value">To 1 L</span>
        </div>
      </div>

      <div className="result-box info" style={{marginTop: "16px"}}>
        <h3>Buffer Selection Guide</h3>
        <div className="result-row">
          <span className="result-label">Small DNA (&lt;1000 bp), no extraction</span>
          <span className="result-value">1x TBE</span>
        </div>
        <div className="result-row">
          <span className="result-label">Large DNA (&gt;12 kb)</span>
          <span className="result-value">1x TAE</span>
        </div>
        <div className="result-row">
          <span className="result-label">DNA extraction / gel purification</span>
          <span className="result-value">1x TAE</span>
        </div>
      </div>
    </div>
  );
}

function RuntimePage({ inputs, updateInput }) {
  const [result, setResult] = useState(null);

  function calculate() {
    const voltage = parseFloat(inputs.voltage);
    const gelLength = parseFloat(inputs.gelLength);
    if (!voltage || !gelLength) return;

    const vcm = voltage / gelLength;
    let timeMin, timeNote;

    const pct = parseFloat(inputs.gelPercent);

    if (vcm < 3) { timeMin = 120; timeNote = "Very slow — risk of band diffusion"; }
    else if (vcm <= 4) { timeMin = 90; timeNote = "Good for large DNA (>5 kb)"; }
    else if (vcm <= 5) { timeMin = 60; timeNote = "Standard run — recommended"; }
    else if (vcm <= 7) { timeMin = 45; timeNote = "Fast run — monitor closely"; }
    else if (vcm <= 10) { timeMin = 30; timeNote = "Very fast — risk of overheating"; }
    else { timeMin = 20; timeNote = "⚠️ Too high — band smearing likely"; }

    // adjust for gel %
    if (pct >= 1.5) timeMin = Math.round(timeMin * 0.8);
    if (pct <= 0.8) timeMin = Math.round(timeMin * 1.3);

    setResult({ vcm: vcm.toFixed(1), timeMin, timeNote });
  }

  return (
    <div className="page">
      <h2>Run Time Calculator</h2>
      <p className="page-subtitle">Estimate gel run time based on voltage and gel length</p>

      <div className="result-box info" style={{marginBottom: "24px"}}>
        <h3>Carried over</h3>
        <div className="result-row">
          <span className="result-label">Gel Percentage</span>
          <span className="result-value">{inputs.gelPercent}%</span>
        </div>
        <div className="result-row">
          <span className="result-label">Buffer</span>
          <span className="result-value">{inputs.buffer}</span>
        </div>
      </div>

      <div className="input-group">
        <label>Voltage (V) <span className="prefilled">recommended: 50–100V</span></label>
        <input type="number" placeholder="e.g. 80" value={inputs.voltage} onChange={e => updateInput("voltage", e.target.value)} />
      </div>

      <div className="input-group">
        <label>Gel Length (cm) <span className="prefilled">measure your tray</span></label>
        <input type="number" placeholder="e.g. 10" value={inputs.gelLength} onChange={e => updateInput("gelLength", e.target.value)} />
      </div>

      <button className="btn" onClick={calculate}>Calculate</button>

      {result && (
        <div className="result-box output" style={{marginTop: "24px"}}>
          <h3>Results</h3>
          <div className="result-row">
            <span className="result-label">Voltage per cm</span>
            <span className="result-value">{result.vcm} V/cm</span>
          </div>
          <div className="result-row">
            <span className="result-label">Estimated run time</span>
            <span className="result-value">{result.timeMin} min</span>
          </div>
          <div className="result-row">
            <span className="result-label">Note</span>
            <span className="result-value">{result.timeNote}</span>
          </div>
        </div>
      )}

      <div className="result-box info" style={{marginTop: "24px"}}>
        <h3>Quick Reference</h3>
        <div className="result-row">
          <span className="result-label">0.8% gel — large DNA</span>
          <span className="result-value">4–5 V/cm, 1–2 hrs</span>
        </div>
        <div className="result-row">
          <span className="result-label">1.0% gel — standard PCR</span>
          <span className="result-value">5 V/cm, ~45–60 min</span>
        </div>
        <div className="result-row">
          <span className="result-label">1.2% gel — medium fragments</span>
          <span className="result-value">5–7 V/cm, ~40 min</span>
        </div>
        <div className="result-row">
          <span className="result-label">1.5% gel — small fragments</span>
          <span className="result-value">7–8 V/cm, ~35 min</span>
        </div>
        <div className="result-row">
          <span className="result-label">2.0% gel — very small</span>
          <span className="result-value">8–10 V/cm, ~30 min</span>
        </div>
      </div>

      <div className="warning-box" style={{marginTop: "16px"}}>
        ⚠️ Stop when bromophenol blue has migrated 2/3 to 3/4 of gel length. Never exceed 10 V/cm — causes overheating and band smearing. Monitor buffer level throughout run.
      </div>
    </div>
  );
}
function ProtocolsPage() {
  const steps = [
    { num: "01", title: "Calculate & Weigh Agarose", body: "Use the Gel Mix calculator for your agarose amount. Weigh on analytical balance into a 500 mL Erlenmeyer flask.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="18" height="12" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="6" x2="8" y2="18"/></svg> },
    { num: "02", title: "Add Buffer", body: "Add calculated 1x TAE or TBE buffer. Swirl gently to suspend agarose. Do not heat yet.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3h8l2 4v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7l2-4z"/><line x1="6" y1="10" x2="18" y2="10"/></svg> },
    { num: "03", title: "Dissolve Agarose", body: "Microwave on high, 30-second intervals. Wear face shield and heat-resistant gloves. Heat until completely clear — no particles.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M6 6V4M12 6V4M18 6V4"/><circle cx="17" cy="13" r="2"/></svg> },
    { num: "04", title: "Cool to ~60°C", body: "Let cool 5–10 minutes until flask is comfortable to hold. Never add EtBr to hot agarose — it degrades.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v10M12 22a4 4 0 100-8 4 4 0 000 8z"/><path d="M12 12V8M8 6h8"/></svg> },
    { num: "05", title: "Add EtBr / Stain", body: "Add 0.5 µg/mL EtBr to cooled gel. Swirl gently. Wear gloves — EtBr is mutagenic. Consider GelRed or SYBR Safe.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3h6l1 6H8L9 3z"/><rect x="7" y="9" width="10" height="8" rx="1"/><path d="M10 17v3M14 17v3"/></svg> },
    { num: "06", title: "Pour Gel", body: "Pour into level casting tray with comb inserted. Remove bubbles with pipette tip. Target 3–4 mm thickness.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="8" width="20" height="12" rx="2"/><path d="M7 8V6M12 8V6M17 8V6"/><path d="M7 8v4M12 8v4M17 8v4"/></svg> },
    { num: "07", title: "Solidify", body: "Wait 20–30 minutes at room temperature until completely opaque. Comb should remove cleanly.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg> },
    { num: "08", title: "Setup Electrophoresis", body: "Wells at CATHODE (black terminal). Add buffer to cover gel 3–5 mm. Check all connections.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="12" x2="18" y2="12"/><circle cx="6" cy="12" r="2" fill="currentColor"/><circle cx="18" cy="12" r="2" fill="currentColor"/></svg> },
    { num: "09", title: "Load Samples", body: "Load DNA ladder first. Use fresh tip per sample. Pipette gently into well — do not pierce gel.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="2" x2="12" y2="22"/><path d="M8 6l4-4 4 4"/><rect x="9" y="14" width="6" height="6" rx="1"/></svg> },
    { num: "10", title: "Run Gel", body: "Set 5 V/cm. Bubbles confirm current flow. Stop when bromophenol blue reaches 2/3–3/4 of gel.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
    { num: "11", title: "Visualize", body: "View under UV transilluminator with safety goggles. For post-stain: soak 15–60 min in EtBr, destain in water 15–30 min.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  ];

  const mistakes = [
    { title: "Uneven Migration", cause: "Tray not level when pouring", fix: "Use a spirit level. Ensure bench is flat before pouring.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="10"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="16"/></svg> },
    { title: "Distorted Bands", cause: "Too much DNA per lane (>100 ng)", fix: "Load maximum 100 ng per band. Reduce sample volume.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12c3-6 6 6 9 0s6-6 9 0"/></svg> },
    { title: "Fuzzy Bands", cause: "Gel thicker than 5 mm", fix: "Use 3–4 mm thickness. Pour less volume.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="9" width="18" height="6" rx="3"/><rect x="5" y="7" width="14" height="10" rx="3" opacity="0.3"/></svg> },
    { title: "Horizontal Streaks", cause: "Salt contamination in DNA sample", fix: "Clean up samples. Use ethanol precipitation or spin column.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="16" x2="21" y2="16"/></svg> },
    { title: "Poor Resolution", cause: "Wrong gel percentage for DNA size", fix: "0.8% for >1 kb, 1% standard, 1.5–2% for small fragments.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg> },
    { title: "Uneven Wells", cause: "Comb inserted unevenly or too deep", fix: "Set comb evenly. Use thin 1 mm comb for sharp bands.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="4" x2="4" y2="14"/><line x1="8" y1="4" x2="8" y2="10"/><line x1="12" y1="4" x2="12" y2="14"/><line x1="16" y1="4" x2="16" y2="8"/><line x1="20" y1="4" x2="20" y2="14"/><line x1="2" y1="16" x2="22" y2="16"/></svg> },
    { title: "Buffer Too Low", cause: "Gel not fully submerged during run", fix: "Cover gel by 3–5 mm. Check buffer level during run.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 18h18M3 14h18"/><path d="M7 10v4M12 8v6M17 10v4"/></svg> },
    { title: "Band Smearing", cause: "Voltage too high (>10 V/cm)", fix: "Use 4–10 V/cm. For genomic DNA keep below 40V.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
    { title: "DNA Runs Off Gel", cause: "Run too long, dye not monitored", fix: "Stop when bromophenol blue hits 2/3–3/4 of gel length.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="15 8 19 12 15 16"/><line x1="19" y1="12" x2="23" y2="12"/></svg> },
    { title: "High Background", cause: "Too much EtBr or no destaining", fix: "Destain in distilled water 15–30 min. Use 0.5 µg/mL EtBr.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg> },
    { title: "Bubbles in Gel", cause: "Poured too fast or at wrong angle", fix: "Pour slowly. Remove bubbles immediately with pipette tip.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="14" r="3"/><circle cx="15" cy="10" r="4"/><circle cx="18" cy="17" r="2"/></svg> },
    { title: "Lane Contamination", cause: "Pipette tip touching adjacent well", fix: "Use fresh tip per sample. Load slowly and carefully.", icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="4" height="16" rx="1"/><rect x="10" y="4" width="4" height="16" rx="1"/><rect x="16" y="4" width="4" height="16" rx="1"/><path d="M8 10h2" strokeDasharray="2"/></svg> },
  ];

  return (
    <div className="page">
      <h2>Protocols & Troubleshooting</h2>
      <p className="page-subtitle">Step-by-step protocol and research-based mistake guide</p>

      <h3 style={{fontSize: "1.6rem", marginBottom: "20px", marginTop: "8px"}}>Standard Protocol</h3>

      <div className="protocol-grid">
        {steps.map((s, i) => (
          <div className="protocol-card" key={i}>
            <div className="protocol-icon">{s.icon}</div>
            <div className="protocol-content">
              <div className="protocol-num">{s.num}</div>
              <div className="protocol-title">{s.title}</div>
              <div className="protocol-body">{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{fontSize: "1.6rem", marginBottom: "20px", marginTop: "48px"}}>Common Mistakes & Fixes</h3>

      <div className="mistake-grid">
        {mistakes.map((m, i) => (
          <div className="mistake-card" key={i}>
            <div className="mistake-icon">{m.icon}</div>
            <div className="mistake-content">
              <div className="mistake-title">{m.title}</div>
              <div className="mistake-cause"><strong>Cause:</strong> {m.cause}</div>
              <div className="mistake-fix"><strong>Fix:</strong> {m.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}