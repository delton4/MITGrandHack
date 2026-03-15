import { useState, useEffect, useRef } from 'react';
import type {
  Problem,
  Vital,
  Medication,
  LabResult,
  Allergy,
  Note,
  ThermalReading,
} from '../types';
import {
  fetchProblems,
  fetchVitals,
  fetchMedications,
  fetchLabs,
  fetchAllergies,
  fetchNotes,
  fetchThermal,
} from '../api';

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

function drawSparkline(canvas: HTMLCanvasElement, data: { t: number; v: number }[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx || data.length < 2) return;
  const W = canvas.width;
  const H = canvas.height;
  const pad = 4;
  const w = W - pad * 2;
  const h = H - pad * 2;

  ctx.clearRect(0, 0, W, H);

  const vals = data.map((d) => d.v);
  const minV = Math.min(...vals) - 0.2;
  const maxV = Math.max(...vals) + 0.2;
  const minT = data[0].t;
  const maxT = data[data.length - 1].t;
  const tRange = maxT - minT || 1;
  const vRange = maxV - minV || 1;

  // Warning/Critical threshold lines
  [2, 3].forEach((th) => {
    if (th >= minV && th <= maxV) {
      const y = pad + h - ((th - minV) / vRange) * h;
      ctx.strokeStyle = th === 2 ? '#FFC107' : '#DC3545';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(pad + w, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Area fill
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad + ((d.t - minT) / tRange) * w;
    const y = pad + h - ((d.v - minV) / vRange) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  const lastX = pad + ((data[data.length - 1].t - minT) / tRange) * w;
  ctx.lineTo(lastX, pad + h);
  ctx.lineTo(pad, pad + h);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 180, 216, 0.1)';
  ctx.fill();

  // Line
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = pad + ((d.t - minT) / tRange) * w;
    const y = pad + h - ((d.v - minV) / vRange) * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#00B4D8';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export default function Synopsis({ patientId }: Props) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [thermal, setThermal] = useState<ThermalReading[]>([]);
  const [loading, setLoading] = useState(true);
  const sparkRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProblems(patientId),
      fetchVitals(patientId, 6),
      fetchMedications(patientId),
      fetchLabs(patientId),
      fetchAllergies(patientId),
      fetchNotes(patientId),
      fetchThermal(patientId, 6),
    ]).then(([pr, vi, me, la, al, no, th]) => {
      setProblems(pr);
      setVitals(vi);
      setMeds(me);
      setLabs(la);
      setAllergies(al);
      setNotes(no);
      setThermal(th);
      setLoading(false);
    });
  }, [patientId]);

  useEffect(() => {
    if (sparkRef.current && thermal.length > 0) {
      drawSparkline(
        sparkRef.current,
        thermal.map((r) => ({ t: new Date(r.timestamp).getTime(), v: r.cptd }))
      );
    }
  }, [thermal]);

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const latestThermal = thermal.length > 0 ? thermal[thermal.length - 1] : null;
  const activeProblems = problems.filter((p) => p.status === 'active');
  const recentLabs = labs.slice(0, 5);
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="synopsis">
      <div className="synopsis-grid">
        {/* Active Problems */}
        <div className="synopsis-card">
          <div className="synopsis-card-header">Active Problems</div>
          <div className="synopsis-card-body">
            {activeProblems.length === 0 ? (
              <div className="synopsis-empty">No active problems</div>
            ) : (
              <ul className="synopsis-list">
                {activeProblems.map((p) => (
                  <li key={p.id}>
                    <span className="synopsis-problem-desc">{p.description}</span>
                    <span className="synopsis-problem-date">{p.onset_date}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Vitals Snapshot */}
        <div className="synopsis-card">
          <div className="synopsis-card-header">Vitals Snapshot</div>
          <div className="synopsis-card-body">
            {latestVital ? (
              <div className="synopsis-vitals-grid">
                <div className="vital-item">
                  <span className="vital-label">HR</span>
                  <span className="vital-value">{latestVital.hr}</span>
                  <span className="vital-unit">bpm</span>
                </div>
                <div className="vital-item">
                  <span className="vital-label">RR</span>
                  <span className="vital-value">{latestVital.rr}</span>
                  <span className="vital-unit">br/min</span>
                </div>
                <div className="vital-item">
                  <span className="vital-label">SpO2</span>
                  <span className="vital-value">{latestVital.spo2}</span>
                  <span className="vital-unit">%</span>
                </div>
                <div className="vital-item">
                  <span className="vital-label">Temp</span>
                  <span className="vital-value">{latestVital.temp_axillary?.toFixed(1)}</span>
                  <span className="vital-unit">°C</span>
                </div>
                <div className="vital-item">
                  <span className="vital-label">BP</span>
                  <span className="vital-value">
                    {latestVital.bp_systolic}/{latestVital.bp_diastolic}
                  </span>
                  <span className="vital-unit">({latestVital.bp_mean})</span>
                </div>
              </div>
            ) : (
              <div className="synopsis-empty">No vitals recorded</div>
            )}
          </div>
        </div>

        {/* Active Medications */}
        <div className="synopsis-card">
          <div className="synopsis-card-header">Active Medications</div>
          <div className="synopsis-card-body">
            {meds.length === 0 ? (
              <div className="synopsis-empty">No active medications</div>
            ) : (
              <ul className="synopsis-list">
                {meds.map((m) => (
                  <li key={m.id}>
                    <span className="synopsis-med-name">{m.drug_name}</span>
                    <span className="synopsis-med-detail">
                      {m.dose} {m.route} {m.frequency}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="synopsis-card">
          <div className="synopsis-card-header">Recent Results</div>
          <div className="synopsis-card-body">
            {recentLabs.length === 0 ? (
              <div className="synopsis-empty">No lab results</div>
            ) : (
              <ul className="synopsis-list">
                {recentLabs.map((l) => (
                  <li key={l.id} className="synopsis-lab-row">
                    <span className="synopsis-lab-name">{l.test_name}</span>
                    <span className={`synopsis-lab-value ${l.flag ? `flag-${l.flag.toLowerCase()}` : ''}`}>
                      {l.value} {l.unit}
                      {l.flag && <span className="flag-badge">{l.flag}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className="synopsis-card">
          <div className="synopsis-card-header">Allergies</div>
          <div className="synopsis-card-body">
            {allergies.length === 0 ? (
              <div className="synopsis-allergy-nkda">
                <span className="allergy-badge allergy-badge--nkda">NKDA</span>
                No Known Drug Allergies
              </div>
            ) : (
              <ul className="synopsis-list">
                {allergies.map((a) => (
                  <li key={a.id}>
                    <span className="allergy-badge allergy-badge--severe">{a.allergen}</span>
                    <span className="synopsis-allergy-reaction">
                      {a.reaction} ({a.severity})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="synopsis-card">
          <div className="synopsis-card-header">Recent Notes</div>
          <div className="synopsis-card-body">
            {recentNotes.length === 0 ? (
              <div className="synopsis-empty">No notes</div>
            ) : (
              <ul className="synopsis-list">
                {recentNotes.map((n) => (
                  <li key={n.id}>
                    <span className="synopsis-note-title">{n.title}</span>
                    <span className="synopsis-note-meta">
                      {n.author} &middot; {formatTime(n.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* NeoTherm Summary */}
        <div className="synopsis-card synopsis-card--neotherm">
          <div className="synopsis-card-header synopsis-card-header--neotherm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
            NeoTherm Summary
          </div>
          <div className="synopsis-card-body">
            {latestThermal ? (
              <div className="neotherm-summary">
                <div className="neotherm-summary-top">
                  <div className="neotherm-cptd">
                    <span className="neotherm-cptd-label">CPTD</span>
                    <span
                      className={`neotherm-cptd-value alert-${latestThermal.alert_level}`}
                    >
                      {latestThermal.cptd.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="neotherm-alert-level">
                    <span
                      className={`neotherm-level-badge alert-badge-${latestThermal.alert_level}`}
                    >
                      {latestThermal.alert_level.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="neotherm-sparkline-container">
                  <span className="sparkline-label">6h trend</span>
                  <canvas ref={sparkRef} width={240} height={50} className="neotherm-sparkline" />
                </div>
              </div>
            ) : (
              <div className="synopsis-empty">No NeoTherm data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
