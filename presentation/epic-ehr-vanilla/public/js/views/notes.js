// Epic EHR — Notes View (Clinical notes list + template editor)
const NotesView = {
  templates: {
    'Admission H&P': `ADMISSION HISTORY & PHYSICAL

CHIEF COMPLAINT:


HISTORY OF PRESENT ILLNESS:


BIRTH HISTORY:
Gestational Age:
Birth Weight:
Delivery Method:
Apgar Scores:

MATERNAL HISTORY:
Prenatal Labs:
Medications:
Complications:

PHYSICAL EXAMINATION:
General:
HEENT:
Cardiovascular:
Respiratory:
Abdomen:
Extremities:
Neurological:
Skin:

ASSESSMENT:
1.
2.
3.

PLAN:
1.
2.
3.
`,
    'Progress Note': `NICU PROGRESS NOTE

SUBJECTIVE:


OBJECTIVE:
Vitals:
Weight:
Respiratory Support:
NeoTherm CPTD:
I&O:

Labs:

ASSESSMENT & PLAN:
1.
2.
3.
`,
    'Nursing Assessment': `NURSING ASSESSMENT

VITAL SIGNS:
HR:    RR:    SpO2:    Temp:

NEUROLOGICAL:


RESPIRATORY:


CARDIOVASCULAR:


GASTROINTESTINAL:


SKIN/INTEGUMENTARY:


IV ACCESS:


PSYCHOSOCIAL/FAMILY:


PLAN:

`,
    'Procedure Note': `PROCEDURE NOTE

PROCEDURE:
DATE/TIME:
OPERATOR:
INDICATION:

CONSENT: Informed consent obtained from parent/guardian.

TECHNIQUE:


FINDINGS:


COMPLICATIONS: None

SPECIMENS SENT:

POST-PROCEDURE PLAN:
`,
    'Consult Note': `CONSULTATION NOTE

REQUESTING SERVICE:
REASON FOR CONSULT:

HISTORY:


PHYSICAL EXAMINATION:


REVIEW OF DATA:
Labs:
Imaging:

ASSESSMENT:
1.
2.

RECOMMENDATIONS:
1.
2.
3.

Thank you for this interesting consultation. We will continue to follow.
`,
  },

  async render(container, patientId) {
    const notes = await API.getNotes(patientId);

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">Clinical Notes</span>
        <button class="btn btn-primary btn-sm" id="new-note-btn">+ New Note</button>
      </div>
      <div id="note-editor-container"></div>
      <div class="notes-list" id="notes-list">
        ${notes.map(n => `
          <div class="note-item">
            <div class="note-item-header" data-note-id="${n.id}">
              <div>
                <span class="note-title">${n.title}</span>
                <span class="note-meta" style="margin-left:8px;">${n.note_type} &bull; ${n.author} &bull; ${App.formatDateTime(n.timestamp)}</span>
              </div>
              <span class="note-status ${n.status}">${n.status}</span>
            </div>
            <div class="note-body" id="note-body-${n.id}">${this.escapeHtml(n.body)}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Toggle note expansion
    container.querySelectorAll('.note-item-header').forEach(header => {
      header.addEventListener('click', () => {
        const noteId = header.dataset.noteId;
        const body = document.getElementById(`note-body-${noteId}`);
        body.classList.toggle('expanded');
      });
    });

    // New note button
    document.getElementById('new-note-btn').addEventListener('click', () => {
      this.showEditor(container, patientId);
    });
  },

  showEditor(container, patientId) {
    const editorContainer = document.getElementById('note-editor-container');
    if (editorContainer.children.length > 0) return;

    const editor = document.createElement('div');
    editor.className = 'note-editor';
    editor.innerHTML = `
      <div class="note-editor-header">
        <span>New Clinical Note</span>
        <button class="btn btn-sm btn-text" style="color:white" id="note-editor-close">&times;</button>
      </div>
      <div class="note-editor-body">
        <select id="note-template-select">
          <option value="">Select note type / template...</option>
          ${Object.keys(this.templates).map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <input type="text" id="note-title-input" placeholder="Note title">
        <textarea id="note-body-input" placeholder="Enter note text..."></textarea>
        <div style="text-align:right;margin-top:8px;">
          <button class="btn btn-secondary btn-sm" id="note-cancel">Cancel</button>
          <button class="btn btn-primary btn-sm" id="note-sign" style="margin-left:8px;">Sign & Save</button>
        </div>
      </div>
    `;

    editorContainer.appendChild(editor);

    // Template selection
    editor.querySelector('#note-template-select').addEventListener('change', (e) => {
      const template = e.target.value;
      if (template && this.templates[template]) {
        editor.querySelector('#note-title-input').value = template;
        editor.querySelector('#note-body-input').value = this.templates[template];
      }
    });

    // Sign & save
    editor.querySelector('#note-sign').addEventListener('click', async () => {
      const title = editor.querySelector('#note-title-input').value.trim();
      const body = editor.querySelector('#note-body-input').value.trim();
      const noteType = editor.querySelector('#note-template-select').value || 'Progress Note';
      if (!title || !body) return;

      await API.createNote(patientId, { title, note_type: noteType, body });
      editor.remove();

      // Refresh notes list
      const notes = await API.getNotes(patientId);
      const notesList = document.getElementById('notes-list');
      notesList.innerHTML = notes.map(n => `
        <div class="note-item">
          <div class="note-item-header" data-note-id="${n.id}">
            <div>
              <span class="note-title">${n.title}</span>
              <span class="note-meta" style="margin-left:8px;">${n.note_type} &bull; ${n.author} &bull; ${App.formatDateTime(n.timestamp)}</span>
            </div>
            <span class="note-status ${n.status}">${n.status}</span>
          </div>
          <div class="note-body" id="note-body-${n.id}">${this.escapeHtml(n.body)}</div>
        </div>
      `).join('');

      notesList.querySelectorAll('.note-item-header').forEach(header => {
        header.addEventListener('click', () => {
          const noteId = header.dataset.noteId;
          document.getElementById(`note-body-${noteId}`).classList.toggle('expanded');
        });
      });
    });

    // Cancel / close
    editor.querySelector('#note-cancel').addEventListener('click', () => editor.remove());
    editor.querySelector('#note-editor-close').addEventListener('click', () => editor.remove());
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
