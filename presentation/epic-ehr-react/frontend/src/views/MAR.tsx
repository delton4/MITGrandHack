import { useState, useEffect, useCallback } from 'react';
import type { MAREntry } from '../types';
import { fetchMAR, updateMAR } from '../api';

interface Props {
  patientId: number;
}

function formatHour(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const statusIcons: Record<string, string> = {
  given: '\u2713',
  due: '\u25CB',
  late: '!',
  held: '\u2715',
  scheduled: '\u25CB',
};

const statusClasses: Record<string, string> = {
  given: 'mar-status--given',
  due: 'mar-status--due',
  late: 'mar-status--late',
  held: 'mar-status--held',
  scheduled: 'mar-status--scheduled',
};

export default function MAR({ patientId }: Props) {
  const [entries, setEntries] = useState<MAREntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchMAR(patientId).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleAdmin = async (entry: MAREntry) => {
    const newStatus = entry.status === 'given' ? 'scheduled' : 'given';
    await updateMAR(patientId, entry.id, { status: newStatus });
    load();
  };

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  // Group entries by medication
  const medGroups = new Map<string, MAREntry[]>();
  entries.forEach((e) => {
    const key = `${e.drug_name}|${e.dose}|${e.route}|${e.frequency}`;
    const existing = medGroups.get(key) || [];
    existing.push(e);
    medGroups.set(key, existing);
  });

  // Get all unique times across all entries
  const allTimes = Array.from(new Set(entries.map((e) => e.scheduled_time))).sort();

  return (
    <div className="mar-view">
      <div className="mar-header">
        <h2>Medication Administration Record</h2>
      </div>

      <div className="mar-scroll">
        <table className="mar-table">
          <thead>
            <tr>
              <th className="mar-med-header">Medication</th>
              <th className="mar-details-header">Dose / Route / Freq</th>
              {allTimes.map((t, i) => (
                <th key={i} className="mar-time-header">
                  {formatHour(t)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(medGroups.entries()).map(([key, medEntries]) => {
              const first = medEntries[0];
              const entryByTime = new Map<string, MAREntry>();
              medEntries.forEach((e) => entryByTime.set(e.scheduled_time, e));

              return (
                <tr key={key} className="mar-row">
                  <td className="mar-med-name">{first.drug_name}</td>
                  <td className="mar-med-details">
                    {first.dose} {first.route} {first.frequency}
                  </td>
                  {allTimes.map((t, i) => {
                    const entry = entryByTime.get(t);
                    if (!entry) return <td key={i} className="mar-cell mar-cell--empty" />;
                    return (
                      <td
                        key={i}
                        className={`mar-cell ${statusClasses[entry.status] || ''}`}
                        onClick={() => toggleAdmin(entry)}
                        title={`${entry.status} — Click to toggle`}
                      >
                        <span className="mar-status-icon">
                          {statusIcons[entry.status] || '?'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mar-legend">
        <span className="mar-legend-item">
          <span className="mar-status-icon mar-status--given">{statusIcons.given}</span> Given
        </span>
        <span className="mar-legend-item">
          <span className="mar-status-icon mar-status--due">{statusIcons.due}</span> Due/Scheduled
        </span>
        <span className="mar-legend-item">
          <span className="mar-status-icon mar-status--late">{statusIcons.late}</span> Late
        </span>
        <span className="mar-legend-item">
          <span className="mar-status-icon mar-status--held">{statusIcons.held}</span> Held
        </span>
      </div>
    </div>
  );
}
