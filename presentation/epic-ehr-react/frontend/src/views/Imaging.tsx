import { useState, useEffect } from 'react';
import type { ImagingStudy } from '../types';
import { fetchImaging } from '../api';

interface Props {
  patientId: number;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Imaging({ patientId }: Props) {
  const [studies, setStudies] = useState<ImagingStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchImaging(patientId).then((data) => {
      setStudies(data);
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

  return (
    <div className="imaging-view">
      <div className="imaging-header">
        <h2>Imaging Studies</h2>
      </div>

      {studies.length === 0 ? (
        <div className="imaging-empty">No imaging studies</div>
      ) : (
        <table className="imaging-table">
          <thead>
            <tr>
              <th></th>
              <th>Modality</th>
              <th>Body Part</th>
              <th>Status</th>
              <th>Ordered</th>
              <th>Completed</th>
              <th>Provider</th>
            </tr>
          </thead>
          <tbody>
            {studies.map((s) => (
              <>
                <tr
                  key={s.id}
                  className={`imaging-row ${expandedId === s.id ? 'imaging-row--expanded' : ''}`}
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                >
                  <td className="imaging-expand">
                    {s.report_text ? (
                      <span className="imaging-expand-icon">
                        {expandedId === s.id ? '\u25BC' : '\u25B6'}
                      </span>
                    ) : null}
                  </td>
                  <td className="imaging-modality">{s.modality}</td>
                  <td>{s.body_part}</td>
                  <td>
                    <span className={`imaging-status imaging-status--${s.status}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="imaging-time">{formatTime(s.ordered_at)}</td>
                  <td className="imaging-time">
                    {s.completed_at ? formatTime(s.completed_at) : '—'}
                  </td>
                  <td>{s.ordering_provider}</td>
                </tr>
                {expandedId === s.id && s.report_text && (
                  <tr key={`${s.id}-report`} className="imaging-report-row">
                    <td colSpan={7}>
                      <div className="imaging-report">
                        <div className="imaging-report-header">Radiology Report</div>
                        <pre className="imaging-report-text">{s.report_text}</pre>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
