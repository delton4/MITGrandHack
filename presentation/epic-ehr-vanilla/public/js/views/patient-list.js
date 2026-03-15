// Epic EHR — Patient List View (NICU Census)
const PatientListView = {
  async render(container, searchQuery) {
    const patients = searchQuery
      ? await API.getPatients(searchQuery)
      : await API.getPatients();

    container.innerHTML = `
      <div class="patient-list-header">
        <div>
          <span class="patient-list-title">NICU Census</span>
          <span class="patient-list-count">${patients.length} Patients</span>
        </div>
        <div class="patient-list-search">
          <input type="text" placeholder="Filter census..." id="census-filter" value="${searchQuery || ''}">
        </div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:0;">
        <table class="clinical-table" id="census-table">
          <thead>
            <tr>
              <th style="width:60px">Bed</th>
              <th>Patient Name</th>
              <th>MRN</th>
              <th style="width:60px">GA</th>
              <th style="width:60px">DOL</th>
              <th style="width:70px">Weight</th>
              <th>Diagnosis</th>
              <th style="width:70px">Acuity</th>
              <th style="width:90px">Attending</th>
              <th style="width:60px">Alerts</th>
            </tr>
          </thead>
          <tbody id="census-body">
            ${patients.map(p => this.renderRow(p)).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Click handlers for rows
    container.querySelectorAll('.census-row').forEach(row => {
      row.addEventListener('click', () => {
        const pid = parseInt(row.dataset.patientId);
        App.openPatientChart(pid);
      });
    });

    // Filter input
    const filterInput = container.querySelector('#census-filter');
    let filterTimeout;
    filterInput.addEventListener('input', () => {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(async () => {
        const q = filterInput.value.trim();
        const filtered = q ? await API.getPatients(q) : await API.getPatients();
        const tbody = container.querySelector('#census-body');
        tbody.innerHTML = filtered.map(p => this.renderRow(p)).join('');
        container.querySelector('.patient-list-count').textContent = `${filtered.length} Patients`;
        container.querySelectorAll('.census-row').forEach(row => {
          row.addEventListener('click', () => {
            App.openPatientChart(parseInt(row.dataset.patientId));
          });
        });
      }, 300);
    });
  },

  renderRow(p) {
    const dol = App.dayOfLife(p.dob);
    const ga = App.gaDisplay(p.gestational_age_weeks, p.gestational_age_days);
    const alerts = [];
    if (p.neotherm_alert_active) {
      alerts.push('<span class="alert-dot" title="Active BPA Alert"></span>');
      alerts.push('<span class="thermal-icon" title="NeoTherm Alert">&#127777;</span>');
    }
    return `
      <tr class="census-row clickable" data-patient-id="${p.id}">
        <td><strong>${p.bed}</strong></td>
        <td><strong style="color:var(--epic-primary)">${p.last_name}, ${p.first_name}</strong></td>
        <td>${p.mrn}</td>
        <td>${ga}</td>
        <td>${dol}</td>
        <td>${p.current_weight_g}g</td>
        <td>${p.admitting_diagnosis}</td>
        <td>${p.acuity}</td>
        <td>${p.attending}</td>
        <td><div class="census-alert">${alerts.join('')}</div></td>
      </tr>
    `;
  }
};
