import { useEffect, useRef } from 'react';
import type { BPAAlert } from '../types';
import { acknowledgeBPA, fetchThermal } from '../api';

interface Props {
  alerts: BPAAlert[];
  patientId: number;
  onDismiss: () => void;
  onViewNeoTherm: () => void;
}

function drawCPTDChart(canvas: HTMLCanvasElement, data: { t: number; v: number }[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx || data.length === 0) return;

  const W = canvas.width;
  const H = canvas.height;
  const pad = { t: 20, r: 15, b: 30, l: 40 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(pad.l, pad.t, cw, ch);

  // Threshold bands
  const maxY = 5;
  const yScale = (v: number) => pad.t + ch - (v / maxY) * ch;

  // Normal zone (0-1)
  ctx.fillStyle = 'rgba(40, 167, 69, 0.08)';
  ctx.fillRect(pad.l, yScale(1), cw, yScale(0) - yScale(1));

  // Warning zone (1-2)
  ctx.fillStyle = 'rgba(255, 193, 7, 0.08)';
  ctx.fillRect(pad.l, yScale(2), cw, yScale(1) - yScale(2));

  // High zone (2-3)
  ctx.fillStyle = 'rgba(253, 126, 20, 0.08)';
  ctx.fillRect(pad.l, yScale(3), cw, yScale(2) - yScale(3));

  // Critical zone (3+)
  ctx.fillStyle = 'rgba(220, 53, 69, 0.08)';
  ctx.fillRect(pad.l, yScale(maxY), cw, yScale(3) - yScale(maxY));

  // Threshold lines
  [1, 2, 3].forEach((v) => {
    ctx.strokeStyle = v === 2 ? '#FFC107' : v === 3 ? '#DC3545' : '#28A745';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.l, yScale(v));
    ctx.lineTo(pad.l + cw, yScale(v));
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Data line
  const minT = data[0].t;
  const maxT = data[data.length - 1].t;
  const range = maxT - minT || 1;

  ctx.strokeStyle = '#00B4D8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad.l + ((d.t - minT) / range) * cw;
    const y = yScale(Math.min(d.v, maxY));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = '#666';
  ctx.font = '10px -apple-system, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  [0, 1, 2, 3, 4, 5].forEach((v) => {
    ctx.fillText(`${v}`, pad.l - 5, yScale(v) + 3);
  });

  // Y-axis title
  ctx.save();
  ctx.translate(12, pad.t + ch / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('CPTD (°C)', 0, 0);
  ctx.restore();

  // X-axis time labels
  ctx.textAlign = 'center';
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const t = minT + (range * i) / steps;
    const d = new Date(t);
    const label = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const x = pad.l + (i / steps) * cw;
    ctx.fillText(label, x, H - 8);
  }

  // Axes
  ctx.strokeStyle = '#CCC';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t);
  ctx.lineTo(pad.l, pad.t + ch);
  ctx.lineTo(pad.l + cw, pad.t + ch);
  ctx.stroke();
}

export default function BPAModal({ alerts, patientId, onDismiss, onViewNeoTherm }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const alert = alerts[0];

  useEffect(() => {
    fetchThermal(patientId, 12).then((readings) => {
      if (canvasRef.current && readings.length > 0) {
        const data = readings.map((r) => ({
          t: new Date(r.timestamp).getTime(),
          v: r.cptd,
        }));
        drawCPTDChart(canvasRef.current, data);
      }
    });
  }, [patientId]);

  const handleAcknowledge = async () => {
    await acknowledgeBPA(patientId, alert.id);
    onDismiss();
  };

  const handleOrderSepsis = async () => {
    await acknowledgeBPA(patientId, alert.id);
    onDismiss();
  };

  return (
    <div className="bpa-overlay" onClick={onDismiss}>
      <div className="bpa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bpa-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Best Practice Alert</span>
        </div>
        <div className="bpa-body">
          <h3 className="bpa-title">{alert.title}</h3>
          <p className="bpa-summary">{alert.summary}</p>
          <div className="bpa-detail">
            <span className="bpa-cptd-label">Current CPTD:</span>
            <span className="bpa-cptd-value">{alert.cptd_value.toFixed(1)}°C</span>
          </div>
          <div className="bpa-chart-container">
            <div className="bpa-chart-title">CPTD Trend (Last 12 Hours)</div>
            <canvas ref={canvasRef} width={460} height={200} className="bpa-chart" />
          </div>
          <div className="bpa-recommendations">
            <strong>Recommended Actions:</strong>
            <ul>
              <li>Obtain blood cultures</li>
              <li>Order CBC with differential, CRP, blood gas</li>
              <li>Consider empiric antibiotic therapy</li>
              <li>Increase vital sign monitoring frequency</li>
              <li>Review NeoTherm thermal trends for pattern analysis</li>
            </ul>
          </div>
        </div>
        <div className="bpa-footer">
          <button className="btn btn-primary" onClick={handleAcknowledge}>
            Acknowledge
          </button>
          <button className="btn btn-secondary" onClick={handleOrderSepsis}>
            Order Sepsis Workup
          </button>
          <button className="btn btn-link" onClick={onViewNeoTherm}>
            View NeoTherm Detail
          </button>
          <button className="btn btn-text" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
