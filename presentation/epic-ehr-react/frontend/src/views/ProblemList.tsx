import { useState, useEffect } from 'react';
import type { Problem } from '../types';
import { fetchProblems } from '../api';

interface Props {
  patientId: number;
}

export default function ProblemList({ patientId }: Props) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProblems(patientId).then((data) => {
      setProblems(data);
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

  const active = problems.filter((p) => p.status === 'active');
  const resolved = problems.filter((p) => p.status === 'resolved');

  return (
    <div className="problem-list-view">
      <div className="problem-list-header">
        <h2>Problem List</h2>
      </div>

      <div className="problem-section">
        <h3 className="problem-section-title problem-section--active">
          Active Problems ({active.length})
        </h3>
        {active.length === 0 ? (
          <div className="problem-empty">No active problems</div>
        ) : (
          <table className="problem-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>ICD-10</th>
                <th>Onset Date</th>
                <th>Noted By</th>
              </tr>
            </thead>
            <tbody>
              {active.map((p) => (
                <tr key={p.id} className="problem-row">
                  <td className="problem-desc">{p.description}</td>
                  <td className="problem-icd">
                    <span className="icd-badge">{p.icd10}</span>
                  </td>
                  <td>{p.onset_date}</td>
                  <td>{p.noted_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="problem-section">
        <h3 className="problem-section-title problem-section--resolved">
          Resolved Problems ({resolved.length})
        </h3>
        {resolved.length === 0 ? (
          <div className="problem-empty">No resolved problems</div>
        ) : (
          <table className="problem-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>ICD-10</th>
                <th>Onset Date</th>
                <th>Noted By</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map((p) => (
                <tr key={p.id} className="problem-row problem-row--resolved">
                  <td className="problem-desc">{p.description}</td>
                  <td className="problem-icd">
                    <span className="icd-badge icd-badge--resolved">{p.icd10}</span>
                  </td>
                  <td>{p.onset_date}</td>
                  <td>{p.noted_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
