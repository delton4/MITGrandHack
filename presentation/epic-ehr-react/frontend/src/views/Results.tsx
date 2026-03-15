import { useState, useEffect, useRef } from 'react';
import type { LabResult } from '../types';
import { fetchLabs } from '../api';

interface Props {
  patientId: number;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function drawTrendChart(canvas: HTMLCanvasElement, data: LabResult[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx || data.length < 2) return;

  const W = canvas.width;
  const H = canvas.height;
  const pad = { t: 15, r: 15, b: 30, l: 45 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(pad.l, pad.t, cw, ch);

  const vals = data.map((d) => d.value);
  const times = data.map((d) => new Date(d.timestamp).getTime());
  const minV = Math.min(...vals) * 0.9;
  const maxV = Math.max(...vals) * 1.1;
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const tRange = maxT - minT || 1;
  const vRange = maxV - minV || 1;

  // Reference range band
  if (data[0].reference_low != null && data[0].reference_high != null) {
    const yLow = pad.t + ch - ((data[0].reference_low - minV) / vRange) * ch;
    const yHigh = pad.t + ch - ((data[0].reference_high - minV) / vRange) * ch;
    ctx.fillStyle = 'rgba(40, 167, 69, 0.08)';
    ctx.fillRect(pad.l, yHigh, cw, yLow - yHigh);

    ctx.strokeStyle = '#28A745';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    [yLow, yHigh].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + cw, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  // Data line
  ctx.strokeStyle = '#1F3A93';
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad.l + ((times[i] - minT) / tRange) * cw;
    const y = pad.t + ch - ((d.value - minV) / vRange) * ch;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Data points
  data.forEach((d, i) => {
    const x = pad.l + ((times[i] - minT) / tRange) * cw;
    const y = pad.t + ch - ((d.value - minV) / vRange) * ch;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = d.flag === 'Critical' ? '#DC3545' : d.flag ? '#FFC107' : '#1F3A93';
    ctx.fill();
  });

  // Axes
  ctx.strokeStyle = '#CCC';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t);
  ctx.lineTo(pad.l, pad.t + ch);
  ctx.lineTo(pad.l + cw, pad.t + ch);
  ctx.stroke();

  // Y labels
  ctx.fillStyle = '#666';
  ctx.font = '10px -apple-system, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const v = minV + (vRange * i) / ySteps;
    const y = pad.t + ch - (i / ySteps) * ch;
    ctx.fillText(v.toFixed(1), pad.l - 5, y + 3);
  }

  // X labels
  ctx.textAlign = 'center';
  const xSteps = Math.min(data.length, 5);
  for (let i = 0; i < xSteps; i++) {
    const idx = Math.round((i / (xSteps - 1)) * (data.length - 1));
    const x = pad.l + ((times[idx] - minT) / tRange) * cw;
    const label = new Date(times[idx]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ctx.fillText(label, x, H - 8);
  }
}

export default function Results({ patientId }: Props) {
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set());
  const [trendTest, setTrendTest] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchLabs(patientId).then((data) => {
      setLabs(data);
      // Auto-expand all panels
      const panels = new Set(data.map((l) => l.panel));
      setExpandedPanels(panels);
      setLoading(false);
    });
  }, [patientId]);

  useEffect(() => {
    if (trendTest && canvasRef.current) {
      const testData = labs
        .filter((l) => l.test_name === trendTest)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      drawTrendChart(canvasRef.current, testData);
    }
  }, [trendTest, labs]);

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  // Group by panel
  const panels = new Map<string, LabResult[]>();
  labs.forEach((l) => {
    const existing = panels.get(l.panel) || [];
    existing.push(l);
    panels.set(l.panel, existing);
  });

  const togglePanel = (panel: string) => {
    setExpandedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(panel)) next.delete(panel);
      else next.add(panel);
      return next;
    });
  };

  return (
    <div className="results-view">
      <div className="results-header">
        <h2>Results Review</h2>
      </div>

      {trendTest && (
        <div className="results-trend">
          <div className="results-trend-header">
            <h3>Trend: {trendTest}</h3>
            <button className="btn btn-text" onClick={() => setTrendTest(null)}>
              &times; Close
            </button>
          </div>
          <canvas ref={canvasRef} width={600} height={200} className="results-trend-chart" />
        </div>
      )}

      <div className="results-panels">
        {Array.from(panels.entries()).map(([panel, results]) => (
          <div key={panel} className="results-panel">
            <div
              className="results-panel-header"
              onClick={() => togglePanel(panel)}
            >
              <span className={`results-expand-icon ${expandedPanels.has(panel) ? '' : 'collapsed'}`}>
                {expandedPanels.has(panel) ? '\u25BC' : '\u25B6'}
              </span>
              <span className="results-panel-name">{panel}</span>
              <span className="results-panel-count">{results.length} results</span>
            </div>
            {expandedPanels.has(panel) && (
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Value</th>
                    <th>Units</th>
                    <th>Ref Range</th>
                    <th>Flag</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr
                      key={r.id}
                      className={`results-row ${r.flag ? `results-row--${r.flag.toLowerCase()}` : ''}`}
                    >
                      <td>
                        <button
                          className="results-test-link"
                          onClick={() => setTrendTest(r.test_name)}
                          title="View trend"
                        >
                          {r.test_name}
                        </button>
                      </td>
                      <td className="results-value">{r.value}</td>
                      <td>{r.unit}</td>
                      <td>
                        {r.reference_low != null && r.reference_high != null
                          ? `${r.reference_low}–${r.reference_high}`
                          : '—'}
                      </td>
                      <td>
                        {r.flag && (
                          <span
                            className={`flag-badge flag-badge--${r.flag.toLowerCase()}`}
                          >
                            {r.flag}
                          </span>
                        )}
                      </td>
                      <td className="results-time">{formatTime(r.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
