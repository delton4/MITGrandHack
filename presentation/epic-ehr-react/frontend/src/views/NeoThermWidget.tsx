import { useState, useEffect, useRef } from 'react';
import type { ThermalReading } from '../types';
import { fetchThermal } from '../api';

interface Props {
  patientId: number;
}

function tempToColor(temp: number): string {
  if (temp <= 32) return '#3B82F6';
  if (temp <= 33) {
    const t = (temp - 32) / 1;
    return lerpColor('#3B82F6', '#22C55E', t);
  }
  if (temp <= 34) {
    const t = (temp - 33) / 1;
    return lerpColor('#22C55E', '#22C55E', t);
  }
  if (temp <= 35) {
    const t = (temp - 34) / 1;
    return lerpColor('#22C55E', '#EAB308', t);
  }
  if (temp <= 36) {
    const t = (temp - 35) / 1;
    return lerpColor('#EAB308', '#EAB308', t);
  }
  if (temp <= 37) {
    const t = (temp - 36) / 1;
    return lerpColor('#EAB308', '#EF4444', t);
  }
  return '#EF4444';
}

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bv.toString(16).padStart(2, '0')}`;
}

function alertLevelColor(level: string): string {
  switch (level) {
    case 'normal': return '#28A745';
    case 'warning': return '#FFC107';
    case 'high': return '#FD7E14';
    case 'critical': return '#DC3545';
    default: return '#666';
  }
}

function draw24hChart(canvas: HTMLCanvasElement, data: { t: number; v: number }[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx || data.length === 0) return;

  const W = canvas.width;
  const H = canvas.height;
  const pad = { t: 25, r: 20, b: 35, l: 50 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(pad.l, pad.t, cw, ch);

  const maxY = 5;
  const yScale = (v: number) => pad.t + ch - (v / maxY) * ch;

  // Threshold bands
  const bands = [
    { from: 0, to: 1, color: 'rgba(40, 167, 69, 0.1)' },
    { from: 1, to: 2, color: 'rgba(255, 193, 7, 0.1)' },
    { from: 2, to: 3, color: 'rgba(253, 126, 20, 0.1)' },
    { from: 3, to: 5, color: 'rgba(220, 53, 69, 0.1)' },
  ];
  bands.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(pad.l, yScale(b.to), cw, yScale(b.from) - yScale(b.to));
  });

  // Threshold labels
  const thresholds = [
    { v: 1, label: 'Normal', color: '#28A745' },
    { v: 2, label: 'Warning', color: '#FFC107' },
    { v: 3, label: 'High', color: '#FD7E14' },
  ];
  thresholds.forEach((th) => {
    ctx.strokeStyle = th.color;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad.l, yScale(th.v));
    ctx.lineTo(pad.l + cw, yScale(th.v));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = th.color;
    ctx.font = '9px -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(th.label, pad.l + cw + 3, yScale(th.v) + 3);
  });

  const minT = data[0].t;
  const maxT = data[data.length - 1].t;
  const range = maxT - minT || 1;

  // Area fill
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad.l + ((d.t - minT) / range) * cw;
    const y = yScale(Math.min(d.v, maxY));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.l + cw, yScale(0));
  ctx.lineTo(pad.l, yScale(0));
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 180, 216, 0.12)';
  ctx.fill();

  // Data line
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

  // Latest point
  const last = data[data.length - 1];
  const lx = pad.l + cw;
  const ly = yScale(Math.min(last.v, maxY));
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = last.v >= 3 ? '#DC3545' : last.v >= 2 ? '#FD7E14' : '#00B4D8';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Axes
  ctx.strokeStyle = '#CCC';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.l, pad.t);
  ctx.lineTo(pad.l, pad.t + ch);
  ctx.lineTo(pad.l + cw, pad.t + ch);
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = '#666';
  ctx.font = '10px -apple-system, "Segoe UI", sans-serif';
  ctx.textAlign = 'right';
  [0, 1, 2, 3, 4, 5].forEach((v) => {
    ctx.fillText(`${v}°C`, pad.l - 5, yScale(v) + 4);
  });

  // Y-axis title
  ctx.save();
  ctx.translate(13, pad.t + ch / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = '11px -apple-system, "Segoe UI", sans-serif';
  ctx.fillText('CPTD (°C)', 0, 0);
  ctx.restore();

  // X-axis labels
  ctx.textAlign = 'center';
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const t = minT + (range * i) / steps;
    const d = new Date(t);
    const label = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const x = pad.l + (i / steps) * cw;
    ctx.fillText(label, x, H - 10);
  }

  // Title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px -apple-system, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CPTD Trend (24 Hours)', pad.l, 14);
}

const zoneLabels: { key: keyof ThermalReading; label: string }[] = [
  { key: 'core_temp', label: 'Core' },
  { key: 'abdomen_temp', label: 'Abdomen' },
  { key: 'left_hand', label: 'Left Hand' },
  { key: 'right_hand', label: 'Right Hand' },
  { key: 'left_foot', label: 'Left Foot' },
  { key: 'right_foot', label: 'Right Foot' },
  { key: 'left_elbow', label: 'Left Elbow' },
  { key: 'right_elbow', label: 'Right Elbow' },
  { key: 'left_knee', label: 'Left Knee' },
  { key: 'right_knee', label: 'Right Knee' },
];

export default function NeoThermWidget({ patientId }: Props) {
  const [readings, setReadings] = useState<ThermalReading[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchThermal(patientId, 24).then((data) => {
      setReadings(data);
      setLoading(false);
    });
  }, [patientId]);

  useEffect(() => {
    if (chartRef.current && readings.length > 0) {
      draw24hChart(
        chartRef.current,
        readings.map((r) => ({ t: new Date(r.timestamp).getTime(), v: r.cptd }))
      );
    }
  }, [readings]);

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  const latest = readings.length > 0 ? readings[readings.length - 1] : null;

  // Compute hourly stats for zone table
  const lastHourReadings = readings.filter((r) => {
    const t = new Date(r.timestamp).getTime();
    const latest_t = readings.length > 0 ? new Date(readings[readings.length - 1].timestamp).getTime() : 0;
    return t >= latest_t - 3600000;
  });

  const zoneStats = zoneLabels.map(({ key, label }) => {
    const vals = lastHourReadings
      .map((r) => r[key] as number)
      .filter((v) => v != null);
    return {
      label,
      current: latest ? (latest[key] as number) : null,
      min: vals.length > 0 ? Math.min(...vals) : null,
      max: vals.length > 0 ? Math.max(...vals) : null,
      avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
    };
  });

  return (
    <div className="neotherm-widget">
      {/* Alert Banner */}
      {latest && (
        <div
          className="neotherm-alert-banner"
          style={{ borderLeftColor: alertLevelColor(latest.alert_level) }}
        >
          <div className="neotherm-alert-indicator" style={{ backgroundColor: alertLevelColor(latest.alert_level) }} />
          <div className="neotherm-alert-info">
            <span className="neotherm-alert-label">Alert Level:</span>
            <span className="neotherm-alert-value" style={{ color: alertLevelColor(latest.alert_level) }}>
              {latest.alert_level.toUpperCase()}
            </span>
          </div>
          <div className="neotherm-cptd-display">
            <span className="neotherm-cptd-label">Current CPTD:</span>
            <span className="neotherm-cptd-val" style={{ color: alertLevelColor(latest.alert_level) }}>
              {latest.cptd.toFixed(1)}°C
            </span>
          </div>
        </div>
      )}

      <div className="neotherm-content">
        {/* SVG Infant Heatmap */}
        <div className="neotherm-heatmap-section">
          <h3 className="neotherm-section-title">Thermal Heatmap</h3>
          <div className="neotherm-heatmap-container">
            {latest && (
              <svg viewBox="0 0 200 320" width="200" height="320" className="neotherm-infant-svg">
                {/* Head */}
                <ellipse cx="100" cy="35" rx="25" ry="28"
                  fill={tempToColor(latest.core_temp)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Torso / Core */}
                <rect x="72" y="60" width="56" height="70" rx="8"
                  fill={tempToColor(latest.core_temp)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Abdomen */}
                <rect x="76" y="115" width="48" height="40" rx="6"
                  fill={tempToColor(latest.abdomen_temp)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Upper Arm */}
                <rect x="48" y="65" width="22" height="40" rx="6"
                  fill={tempToColor(latest.left_elbow)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Upper Arm */}
                <rect x="130" y="65" width="22" height="40" rx="6"
                  fill={tempToColor(latest.right_elbow)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Elbow */}
                <circle cx="52" cy="112" r="8"
                  fill={tempToColor(latest.left_elbow)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Elbow */}
                <circle cx="148" cy="112" r="8"
                  fill={tempToColor(latest.right_elbow)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Forearm */}
                <rect x="38" y="117" width="18" height="35" rx="5"
                  fill={tempToColor(latest.left_hand)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Forearm */}
                <rect x="144" y="117" width="18" height="35" rx="5"
                  fill={tempToColor(latest.right_hand)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Hand */}
                <ellipse cx="44" cy="160" rx="10" ry="8"
                  fill={tempToColor(latest.left_hand)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Hand */}
                <ellipse cx="156" cy="160" rx="10" ry="8"
                  fill={tempToColor(latest.right_hand)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Thigh */}
                <rect x="72" y="158" width="24" height="50" rx="6"
                  fill={tempToColor(latest.left_knee)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Thigh */}
                <rect x="104" y="158" width="24" height="50" rx="6"
                  fill={tempToColor(latest.right_knee)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Knee */}
                <circle cx="84" cy="215" r="9"
                  fill={tempToColor(latest.left_knee)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Knee */}
                <circle cx="116" cy="215" r="9"
                  fill={tempToColor(latest.right_knee)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Shin */}
                <rect x="74" y="226" width="20" height="45" rx="5"
                  fill={tempToColor(latest.left_foot)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Shin */}
                <rect x="106" y="226" width="20" height="45" rx="5"
                  fill={tempToColor(latest.right_foot)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Left Foot */}
                <ellipse cx="84" cy="280" rx="13" ry="8"
                  fill={tempToColor(latest.left_foot)} stroke="#666" strokeWidth="0.5" opacity="0.85" />
                {/* Right Foot */}
                <ellipse cx="116" cy="280" rx="13" ry="8"
                  fill={tempToColor(latest.right_foot)} stroke="#666" strokeWidth="0.5" opacity="0.85" />

                {/* Temperature labels */}
                <text x="100" y="95" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">
                  {latest.core_temp.toFixed(1)}°
                </text>
                <text x="100" y="138" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">
                  {latest.abdomen_temp.toFixed(1)}°
                </text>
                <text x="44" cy="160" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" y="163">
                  {latest.left_hand.toFixed(1)}°
                </text>
                <text x="156" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" y="163">
                  {latest.right_hand.toFixed(1)}°
                </text>
                <text x="84" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" y="283">
                  {latest.left_foot.toFixed(1)}°
                </text>
                <text x="116" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" y="283">
                  {latest.right_foot.toFixed(1)}°
                </text>
              </svg>
            )}

            {/* Color scale legend */}
            <div className="neotherm-scale">
              <div className="neotherm-scale-bar">
                <div className="scale-gradient" />
              </div>
              <div className="neotherm-scale-labels">
                <span>32°C</span>
                <span>34°C</span>
                <span>36°C</span>
                <span>37°C+</span>
              </div>
            </div>
          </div>
        </div>

        {/* 24h CPTD Trend Chart */}
        <div className="neotherm-chart-section">
          <canvas ref={chartRef} width={700} height={260} className="neotherm-trend-chart" />
        </div>
      </div>

      {/* Zone Temperature Table */}
      <div className="neotherm-zones-section">
        <h3 className="neotherm-section-title">Zone Temperature Breakdown (Last Hour)</h3>
        <table className="neotherm-zones-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Current (°C)</th>
              <th>Min (°C)</th>
              <th>Max (°C)</th>
              <th>Avg (°C)</th>
            </tr>
          </thead>
          <tbody>
            {zoneStats.map((z) => (
              <tr key={z.label}>
                <td className="zone-label">{z.label}</td>
                <td
                  className="zone-value"
                  style={{ color: z.current != null ? tempToColor(z.current) : undefined }}
                >
                  {z.current != null ? z.current.toFixed(1) : '—'}
                </td>
                <td>{z.min != null ? z.min.toFixed(1) : '—'}</td>
                <td>{z.max != null ? z.max.toFixed(1) : '—'}</td>
                <td>{z.avg != null ? z.avg.toFixed(1) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Link to full dashboard */}
      <div className="neotherm-footer">
        <a href="/neotherm" className="neotherm-dashboard-link" target="_blank" rel="noopener">
          View Full NeoTherm Dashboard &rarr;
        </a>
      </div>
    </div>
  );
}
