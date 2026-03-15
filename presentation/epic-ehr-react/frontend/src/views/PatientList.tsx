import { useState, useEffect } from 'react';
import type { Patient } from '../types';
import { fetchPatients } from '../api';

interface Props {
  onOpenChart: (patient: Patient) => void;
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

export default function PatientList({ onOpenChart }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchPatients(search || undefined).then((data) => {
      setPatients(data);
      setLoading(false);
    });
  }, [search]);

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="patient-list">
      <div className="patient-list-header">
        <h2>NICU Census &mdash; {patients.length} Patients</h2>
        <div className="patient-list-search">
          <input
            type="text"
            placeholder="Filter patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <table className="census-table">
        <thead>
          <tr>
            <th>Bed</th>
            <th>Patient Name</th>
            <th>MRN</th>
            <th>GA</th>
            <th>DOL</th>
            <th>Weight</th>
            <th>Dx</th>
            <th>Acuity</th>
            <th>Alerts</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr
              key={p.id}
              className="census-row"
              onClick={() => onOpenChart(p)}
            >
              <td className="cell-bed">{p.bed}</td>
              <td className="cell-name">
                {p.last_name}, {p.first_name}
              </td>
              <td className="cell-mrn">{p.mrn}</td>
              <td>
                {p.gestational_age_weeks}w{p.gestational_age_days}d
              </td>
              <td>{daysSince(p.dob)}</td>
              <td>{p.current_weight_g}g</td>
              <td className="cell-dx">{p.admitting_diagnosis}</td>
              <td>
                <span className={`acuity-badge acuity-${p.acuity.replace(/\s+/g, '-').toLowerCase()}`}>
                  {p.acuity}
                </span>
              </td>
              <td className="cell-alerts">
                {p.neotherm_alert_active ? (
                  <span className="alert-icon alert-icon--thermal" title="NeoTherm Alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                    </svg>
                  </span>
                ) : null}
                {p.neotherm_alert_active ? (
                  <span className="alert-icon alert-icon--bpa" title="Active BPA">
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <circle cx="5" cy="5" r="5" fill="#DC3545" />
                    </svg>
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
