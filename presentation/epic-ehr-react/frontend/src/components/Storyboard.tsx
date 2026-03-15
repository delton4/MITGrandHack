import { useState, useEffect, useRef } from 'react';
import type { Patient, Allergy, BPAAlert } from '../types';
import { fetchPatient, fetchAllergies, fetchBPA } from '../api';

interface Props {
  patientId: number;
  onBPA: (alerts: BPAAlert[]) => void;
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function Storyboard({ patientId, onBPA }: Props) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const bpaChecked = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPatient(patientId), fetchAllergies(patientId)]).then(
      ([p, a]) => {
        if (cancelled) return;
        setPatient(p);
        setAllergies(a);
      }
    );
    // Check BPA on first mount for this patient
    if (!bpaChecked.current.has(patientId)) {
      bpaChecked.current.add(patientId);
      fetchBPA(patientId).then((alerts) => {
        if (!cancelled && alerts.length > 0) {
          onBPA(alerts);
        }
      });
    }
    return () => { cancelled = true; };
  }, [patientId, onBPA]);

  if (!patient) return <div className="storyboard storyboard--loading" />;

  const dol = daysSince(patient.dob);
  const ga = `${patient.gestational_age_weeks}w${patient.gestational_age_days}d`;

  return (
    <div className={`storyboard ${collapsed ? 'storyboard--collapsed' : ''}`}>
      <div className="storyboard-main">
        <div className="storyboard-avatar">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="storyboard-identity">
          <span className="storyboard-name">
            {patient.last_name}, {patient.first_name}
          </span>
          <span className="storyboard-detail">
            MRN: {patient.mrn} &middot; DOB: {formatDate(patient.dob)} &middot; {patient.sex}
          </span>
          <span className="storyboard-detail">
            GA: {ga} &middot; DOL: {dol} &middot; Bed: {patient.bed}
          </span>
        </div>
        {!collapsed && (
          <>
            <div className="storyboard-vitals-summary">
              <span className="storyboard-detail">Wt: {patient.current_weight_g}g</span>
              {patient.current_length_cm && (
                <span className="storyboard-detail">Len: {patient.current_length_cm}cm</span>
              )}
              {patient.head_circumference_cm && (
                <span className="storyboard-detail">HC: {patient.head_circumference_cm}cm</span>
              )}
              <span className="storyboard-detail">Code: {patient.code_status}</span>
              <span className="storyboard-detail">Attending: {patient.attending}</span>
            </div>
            <div className="storyboard-flags">
              <div className="storyboard-allergies">
                {allergies.length === 0 ? (
                  <span className="allergy-badge allergy-badge--nkda">NKDA</span>
                ) : (
                  allergies.map((a) => (
                    <span
                      key={a.id}
                      className={`allergy-badge ${
                        a.severity === 'severe'
                          ? 'allergy-badge--severe'
                          : 'allergy-badge--mild'
                      }`}
                      title={`${a.allergen}: ${a.reaction} (${a.severity})`}
                    >
                      {a.allergen}
                    </span>
                  ))
                )}
              </div>
              {patient.neotherm_alert_active ? (
                <span className="storyboard-fyi storyboard-fyi--alert" title="NeoTherm Alert Active">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                </span>
              ) : null}
            </div>
          </>
        )}
        <button
          className="storyboard-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(180deg)' : undefined }}
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
