// Epic EHR — Problem List View
const ProblemListView = {
  async render(container, patientId) {
    const problems = await API.getProblems(patientId);
    const active = problems.filter(p => p.status === 'active');
    const resolved = problems.filter(p => p.status === 'resolved');

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">Problem List</span>
      </div>

      <div class="problem-section">
        <div class="problem-section-header">Active Problems (${active.length})</div>
        ${active.length > 0 ? `
          <table class="clinical-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>ICD-10</th>
                <th>Onset Date</th>
                <th>Noted By</th>
              </tr>
            </thead>
            <tbody>
              ${active.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${p.description}</strong></td>
                  <td class="text-muted">${p.icd10}</td>
                  <td>${App.formatDate(p.onset_date)}</td>
                  <td>${p.noted_by}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p class="text-muted" style="padding:8px 0;">No active problems</p>'}
      </div>

      <div class="problem-section">
        <div class="problem-section-header" style="color:var(--epic-text-secondary);border-bottom-color:var(--epic-border);">Resolved Problems (${resolved.length})</div>
        ${resolved.length > 0 ? `
          <table class="clinical-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>ICD-10</th>
                <th>Onset Date</th>
                <th>Noted By</th>
              </tr>
            </thead>
            <tbody>
              ${resolved.map((p, i) => `
                <tr style="opacity:0.7">
                  <td>${i + 1}</td>
                  <td>${p.description}</td>
                  <td class="text-muted">${p.icd10}</td>
                  <td>${App.formatDate(p.onset_date)}</td>
                  <td>${p.noted_by}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p class="text-muted" style="padding:8px 0;">No resolved problems</p>'}
      </div>
    `;
  }
};
