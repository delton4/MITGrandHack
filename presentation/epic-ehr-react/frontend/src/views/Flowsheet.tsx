import { useState, useEffect } from 'react';
import type { Vital, ThermalReading, GrowthMeasurement, IntakeOutput } from '../types';
import { fetchVitals, fetchThermal, fetchGrowth, fetchIO } from '../api';

interface Props {
  patientId: number;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function tempToColor(temp: number): string {
  if (temp <= 32) return '#3B82F6';
  if (temp <= 33) return '#60A5FA';
  if (temp <= 34) return '#22C55E';
  if (temp <= 35) return '#86EFAC';
  if (temp <= 36) return '#EAB308';
  if (temp <= 36.8) return '#FDE047';
  if (temp <= 37.2) return '#FB923C';
  return '#EF4444';
}

function cptdToColor(cptd: number): string {
  if (cptd <= 1) return '#28A745';
  if (cptd <= 2) return '#FFC107';
  if (cptd <= 3) return '#FD7E14';
  return '#DC3545';
}

type RowGroup = {
  label: string;
  rows: { label: string; cells: { time: string; value: string; color?: string }[] }[];
};

export default function Flowsheet({ patientId }: Props) {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [thermal, setThermal] = useState<ThermalReading[]>([]);
  const [growth, setGrowth] = useState<GrowthMeasurement[]>([]);
  const [io, setIO] = useState<IntakeOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchVitals(patientId),
      fetchThermal(patientId),
      fetchGrowth(patientId),
      fetchIO(patientId),
    ]).then(([v, t, g, i]) => {
      setVitals(v);
      setThermal(t);
      setGrowth(g);
      setIO(i);
      setLoading(false);
    });
  }, [patientId]);

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  // Collect all unique timestamps across vitals and thermal
  const allTimestamps = Array.from(
    new Set([...vitals.map((v) => v.timestamp), ...thermal.map((t) => t.timestamp)])
  ).sort();

  // Build vitals lookup
  const vitalsMap = new Map<string, Vital>();
  vitals.forEach((v) => vitalsMap.set(v.timestamp, v));

  // Build thermal lookup
  const thermalMap = new Map<string, ThermalReading>();
  thermal.forEach((t) => thermalMap.set(t.timestamp, t));

  const groups: RowGroup[] = [
    {
      label: 'Vitals',
      rows: [
        {
          label: 'HR (bpm)',
          cells: allTimestamps.map((ts) => {
            const v = vitalsMap.get(ts);
            const val = v?.hr;
            return {
              time: ts,
              value: val != null ? String(val) : '',
              color: val && (val > 180 || val < 100) ? '#FFF3CD' : undefined,
            };
          }),
        },
        {
          label: 'RR (br/min)',
          cells: allTimestamps.map((ts) => {
            const v = vitalsMap.get(ts);
            const val = v?.rr;
            return {
              time: ts,
              value: val != null ? String(val) : '',
              color: val && (val > 60 || val < 20) ? '#FFF3CD' : undefined,
            };
          }),
        },
        {
          label: 'SpO2 (%)',
          cells: allTimestamps.map((ts) => {
            const v = vitalsMap.get(ts);
            const val = v?.spo2;
            return {
              time: ts,
              value: val != null ? String(val) : '',
              color: val && val < 90 ? '#F8D7DA' : undefined,
            };
          }),
        },
        {
          label: 'Temp (°C)',
          cells: allTimestamps.map((ts) => {
            const v = vitalsMap.get(ts);
            const val = v?.temp_axillary;
            return {
              time: ts,
              value: val != null ? val.toFixed(1) : '',
              color: val && (val > 37.5 || val < 36.0) ? '#FFF3CD' : undefined,
            };
          }),
        },
        {
          label: 'BP (mmHg)',
          cells: allTimestamps.map((ts) => {
            const v = vitalsMap.get(ts);
            return {
              time: ts,
              value: v?.bp_systolic != null ? `${v.bp_systolic}/${v.bp_diastolic}` : '',
            };
          }),
        },
        {
          label: 'MAP',
          cells: allTimestamps.map((ts) => {
            const v = vitalsMap.get(ts);
            return {
              time: ts,
              value: v?.bp_mean != null ? String(v.bp_mean) : '',
            };
          }),
        },
      ],
    },
    {
      label: 'Growth',
      rows: [
        {
          label: 'Weight (g)',
          cells: growth.map((g) => ({
            time: g.timestamp,
            value: String(g.weight_g),
          })),
        },
        {
          label: 'Length (cm)',
          cells: growth
            .filter((g) => g.length_cm != null)
            .map((g) => ({
              time: g.timestamp,
              value: g.length_cm!.toFixed(1),
            })),
        },
        {
          label: 'HC (cm)',
          cells: growth
            .filter((g) => g.head_circumference_cm != null)
            .map((g) => ({
              time: g.timestamp,
              value: g.head_circumference_cm!.toFixed(1),
            })),
        },
      ],
    },
    {
      label: 'I&O',
      rows: (() => {
        const categories = Array.from(new Set(io.map((i) => `${i.type}: ${i.category}`)));
        return categories.map((cat) => ({
          label: cat,
          cells: io
            .filter((i) => `${i.type}: ${i.category}` === cat)
            .map((i) => ({
              time: i.timestamp,
              value: `${i.amount_ml}mL`,
            })),
        }));
      })(),
    },
    {
      label: 'NeoTherm Thermal',
      rows: [
        {
          label: 'CPTD (°C)',
          cells: allTimestamps.map((ts) => {
            const t = thermalMap.get(ts);
            return {
              time: ts,
              value: t?.cptd != null ? t.cptd.toFixed(1) : '',
              color: t?.cptd != null ? cptdToColor(t.cptd) + '30' : undefined,
            };
          }),
        },
        {
          label: 'Core (°C)',
          cells: allTimestamps.map((ts) => {
            const t = thermalMap.get(ts);
            return {
              time: ts,
              value: t?.core_temp != null ? t.core_temp.toFixed(1) : '',
              color: t?.core_temp != null ? tempToColor(t.core_temp) + '30' : undefined,
            };
          }),
        },
        ...(
          ['left_hand', 'right_hand', 'left_foot', 'right_foot', 'left_elbow', 'right_elbow', 'left_knee', 'right_knee'] as const
        ).map((zone) => ({
          label: zone
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') + ' (°C)',
          cells: allTimestamps.map((ts) => {
            const t = thermalMap.get(ts);
            const val = t?.[zone];
            return {
              time: ts,
              value: val != null ? val.toFixed(1) : '',
              color: val != null ? tempToColor(val) + '30' : undefined,
            };
          }),
        })),
      ],
    },
  ];

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flowsheet">
      <div className="flowsheet-scroll">
        <table className="flowsheet-table">
          <thead>
            <tr>
              <th className="flowsheet-param-header">Parameter</th>
              {allTimestamps.map((ts, i) => (
                <th key={i} className="flowsheet-time-header">
                  <div className="flowsheet-time-date">{formatDate(ts)}</div>
                  <div className="flowsheet-time-time">{formatTime(ts)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <>
                <tr
                  key={`group-${group.label}`}
                  className="flowsheet-group-header"
                  onClick={() => toggleGroup(group.label)}
                >
                  <td colSpan={allTimestamps.length + 1}>
                    <span className={`flowsheet-expand-icon ${collapsed[group.label] ? 'collapsed' : ''}`}>
                      {collapsed[group.label] ? '\u25B6' : '\u25BC'}
                    </span>
                    {group.label}
                  </td>
                </tr>
                {!collapsed[group.label] &&
                  group.rows.map((row, ri) => (
                    <tr key={`${group.label}-${ri}`} className="flowsheet-data-row">
                      <td className="flowsheet-param-cell">{row.label}</td>
                      {allTimestamps.map((ts, ci) => {
                        const cell = row.cells.find((c) => c.time === ts);
                        return (
                          <td
                            key={ci}
                            className="flowsheet-value-cell"
                            style={cell?.color ? { backgroundColor: cell.color } : undefined}
                          >
                            {cell?.value ?? ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
