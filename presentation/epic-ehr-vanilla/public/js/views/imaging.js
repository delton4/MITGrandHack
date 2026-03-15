// Epic EHR — Imaging View (Studies + Reports)
const ImagingView = {
  async render(container, patientId) {
    const studies = await API.getImaging(patientId);

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">Imaging Studies</span>
      </div>
      ${studies.length > 0 ? studies.map(s => `
        <div class="imaging-item">
          <div class="imaging-item-header" data-study-id="${s.id}">
            <div>
              <span class="imaging-modality">${s.modality}</span>
              <span class="imaging-body-part" style="margin-left:8px;">&mdash; ${s.body_part}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="imaging-status ${s.status}">${s.status}</span>
              <span class="imaging-date">${App.formatDateTime(s.ordered_at)}</span>
              <span class="text-muted" style="font-size:11px;">${s.ordering_provider}</span>
            </div>
          </div>
          <div class="imaging-report" id="imaging-report-${s.id}">${this.escapeHtml(s.report_text || 'No report available')}</div>
        </div>
      `).join('') : '<p class="text-muted" style="padding:20px 0;text-align:center;">No imaging studies on record</p>'}
    `;

    // Toggle report expansion
    container.querySelectorAll('.imaging-item-header').forEach(header => {
      header.addEventListener('click', () => {
        const studyId = header.dataset.studyId;
        const report = document.getElementById(`imaging-report-${studyId}`);
        report.classList.toggle('expanded');
      });
    });
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};
