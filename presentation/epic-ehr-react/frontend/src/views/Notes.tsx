import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';
import { fetchNotes, createNote } from '../api';

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

const templates: Record<string, { type: string; body: string }> = {
  'Admission H&P': {
    type: 'Admission H&P',
    body: `CHIEF COMPLAINT:


HISTORY OF PRESENT ILLNESS:


BIRTH HISTORY:
  Gestational Age:
  Birth Weight:
  Delivery:
  Apgar Scores:
  Resuscitation:

MATERNAL HISTORY:
  GBS Status:
  Rupture of Membranes:
  Prenatal Labs:

REVIEW OF SYSTEMS:


PHYSICAL EXAMINATION:
  General:
  HEENT:
  Cardiovascular:
  Respiratory:
  Abdomen:
  Skin:
  Neurologic:

ASSESSMENT:


PLAN:
`,
  },
  'Progress Note': {
    type: 'Progress Note',
    body: `SUBJECTIVE:


OBJECTIVE:
  Vitals:
  Weight:
  Physical Exam:

  Labs/Studies:

ASSESSMENT:


PLAN:
  Respiratory:
  Fluids/Nutrition:
  Infectious Disease:
  Neuro:
  Disposition:
`,
  },
  'Nursing Assessment': {
    type: 'Nursing Assessment',
    body: `SHIFT ASSESSMENT:

NEUROLOGIC:
  Activity:
  Tone:
  Fontanelle:

RESPIRATORY:
  Support:
  Breath Sounds:
  Work of Breathing:

CARDIOVASCULAR:
  Heart Rate:
  Perfusion:
  Color:

GASTROINTESTINAL:
  Feeding:
  Tolerance:
  Abdomen:
  Stool:

SKIN:
  Color:
  Integrity:
  Temperature:

PARENT INTERACTION:

PLAN OF CARE:
`,
  },
  'Procedure Note': {
    type: 'Procedure Note',
    body: `PROCEDURE:

DATE/TIME:

INDICATION:

CONSENT: Informed consent obtained from parent/guardian

TECHNIQUE:
  Preparation:
  Procedure:
  Complications:

SPECIMENS:

ESTIMATED BLOOD LOSS:

CONDITION FOLLOWING PROCEDURE:

PLAN:
`,
  },
  'Consult Note': {
    type: 'Consult Note',
    body: `REQUESTING SERVICE:
REASON FOR CONSULTATION:

HISTORY OF PRESENT ILLNESS:


RELEVANT HISTORY:


PHYSICAL EXAMINATION:


LABS/STUDIES REVIEWED:


ASSESSMENT:


RECOMMENDATIONS:
  1.
  2.
  3.

Thank you for this consultation. We will continue to follow.
`,
  },
};

export default function Notes({ patientId }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState('Progress Note');
  const [newBody, setNewBody] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchNotes(patientId).then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTemplateChange = (name: string) => {
    setNewTemplate(name);
    setNewTitle(name);
    setNewBody(templates[name]?.body ?? '');
  };

  const handleSave = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    await createNote(patientId, {
      title: newTitle,
      note_type: templates[newTemplate]?.type ?? newTemplate,
      body: newBody,
    });
    setSaving(false);
    setShowNew(false);
    setNewTitle('');
    setNewBody('');
    load();
  };

  if (loading) {
    return (
      <div className="view-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="notes-view">
      <div className="notes-header">
        <h2>Clinical Notes</h2>
        <button className="btn btn-primary" onClick={() => { setShowNew(true); handleTemplateChange('Progress Note'); }}>
          + New Note
        </button>
      </div>

      {showNew && (
        <div className="notes-editor">
          <div className="notes-editor-header">
            <h3>New Note</h3>
            <button className="btn btn-text" onClick={() => setShowNew(false)}>&times;</button>
          </div>
          <div className="notes-editor-fields">
            <div className="notes-field">
              <label>Template</label>
              <select
                value={newTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                {Object.keys(templates).map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="notes-field">
              <label>Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note title..."
              />
            </div>
            <div className="notes-field">
              <label>Body</label>
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={18}
              />
            </div>
          </div>
          <div className="notes-editor-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Sign Note'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="notes-empty">No clinical notes recorded</div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className={`notes-item ${expandedId === n.id ? 'notes-item--expanded' : ''}`}>
              <div
                className="notes-item-header"
                onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
              >
                <div className="notes-item-info">
                  <span className="notes-item-title">{n.title}</span>
                  <span className="notes-item-type">{n.note_type}</span>
                </div>
                <div className="notes-item-meta">
                  <span className="notes-item-author">{n.author}</span>
                  <span className="notes-item-time">{formatTime(n.timestamp)}</span>
                  <span className={`notes-item-status notes-status--${n.status}`}>
                    {n.status}
                  </span>
                </div>
                <span className="notes-expand-icon">
                  {expandedId === n.id ? '\u25BC' : '\u25B6'}
                </span>
              </div>
              {expandedId === n.id && (
                <div className="notes-item-body">
                  <pre>{n.body}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
