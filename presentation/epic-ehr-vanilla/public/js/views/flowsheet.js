// Epic EHR — Flowsheet View (Time-series vitals grid)
const FlowsheetView = {
  async render(container, patientId) {
    const [vitals, thermal, growth, io] = await Promise.all([
      API.getVitals(patientId, 24),
      API.getThermal(patientId, 24),
      API.getGrowth(patientId),
      API.getIO(patientId),
    ]);

    // Build time columns — sample every hour for vitals
    const hourlyVitals = this.sampleHourly(vitals);
    const thermalSampled = this.sampleThermalHourly(thermal);
    const timeHeaders = hourlyVitals.map(v => App.formatTime(v.timestamp));

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">Flowsheets</span>
        <span class="text-muted" style="font-size:11px;">Last 24 hours &bull; Hourly</span>
      </div>
      <div class="flowsheet-wrapper">
        <table class="flowsheet-table">
          <thead>
            <tr>
              <th class="row-label" style="position:sticky;left:0;z-index:15;background:var(--epic-chrome);">Parameter</th>
              ${timeHeaders.map(t => `<th>${t}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Vitals Group -->
            <tr class="group-header" onclick="this.dataset.collapsed = this.dataset.collapsed === 'true' ? 'false' : 'true'; this.parentElement.querySelectorAll('.vitals-row').forEach(r => r.style.display = this.dataset.collapsed === 'true' ? 'none' : '')">
              <td colspan="${timeHeaders.length + 1}">&#9660; Vitals</td>
            </tr>
            ${this.renderVitalRow('HR (bpm)', hourlyVitals, 'hr', 120, 170)}
            ${this.renderVitalRow('RR (/min)', hourlyVitals, 'rr', 30, 60)}
            ${this.renderVitalRow('SpO2 (%)', hourlyVitals, 'spo2', 90, 100, true)}
            ${this.renderVitalRow('Temp (°C)', hourlyVitals, 'temp_axillary', 36.3, 37.5)}
            ${this.renderVitalRow('BP Sys', hourlyVitals, 'bp_systolic', 40, 70)}
            ${this.renderVitalRow('BP Dia', hourlyVitals, 'bp_diastolic', 20, 45)}
            ${this.renderVitalRow('BP Mean', hourlyVitals, 'bp_mean', 30, 55)}

            <!-- Growth Group -->
            <tr class="group-header" onclick="this.dataset.collapsed = this.dataset.collapsed === 'true' ? 'false' : 'true'; this.parentElement.querySelectorAll('.growth-row').forEach(r => r.style.display = this.dataset.collapsed === 'true' ? 'none' : '')">
              <td colspan="${timeHeaders.length + 1}">&#9660; Growth</td>
            </tr>
            ${this.renderGrowthRows(growth, timeHeaders.length)}

            <!-- I&O Group -->
            <tr class="group-header" onclick="this.dataset.collapsed = this.dataset.collapsed === 'true' ? 'false' : 'true'; this.parentElement.querySelectorAll('.io-row').forEach(r => r.style.display = this.dataset.collapsed === 'true' ? 'none' : '')">
              <td colspan="${timeHeaders.length + 1}">&#9660; I&amp;O</td>
            </tr>
            ${this.renderIORows(io, timeHeaders.length)}

            <!-- NeoTherm Thermal Group -->
            <tr class="group-header" onclick="this.dataset.collapsed = this.dataset.collapsed === 'true' ? 'false' : 'true'; this.parentElement.querySelectorAll('.thermal-row').forEach(r => r.style.display = this.dataset.collapsed === 'true' ? 'none' : '')" style="color:var(--neotherm-teal-dark)">
              <td colspan="${timeHeaders.length + 1}">&#9660; NeoTherm Thermal</td>
            </tr>
            ${this.renderThermalRow('CPTD (°C)', thermalSampled, 'cptd', 0, 1.0, 2.0, 3.0)}
            ${this.renderThermalRow('Core', thermalSampled, 'core_temp', 35.5, 36.5, 37.5, 38.0)}
            ${this.renderThermalRow('L Hand', thermalSampled, 'left_hand', 32, 33, 35, 36)}
            ${this.renderThermalRow('R Hand', thermalSampled, 'right_hand', 32, 33, 35, 36)}
            ${this.renderThermalRow('L Foot', thermalSampled, 'left_foot', 31, 32, 34, 35)}
            ${this.renderThermalRow('R Foot', thermalSampled, 'right_foot', 31, 32, 34, 35)}
            ${this.renderThermalRow('L Elbow', thermalSampled, 'left_elbow', 33, 34, 35.5, 36.5)}
            ${this.renderThermalRow('R Elbow', thermalSampled, 'right_elbow', 33, 34, 35.5, 36.5)}
            ${this.renderThermalRow('L Knee', thermalSampled, 'left_knee', 33, 34, 35, 36)}
            ${this.renderThermalRow('R Knee', thermalSampled, 'right_knee', 33, 34, 35, 36)}
          </tbody>
        </table>
      </div>
    `;
  },

  sampleHourly(vitals) {
    const hourly = [];
    const buckets = {};
    vitals.forEach(v => {
      const d = new Date(v.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      if (!buckets[key]) buckets[key] = v;
    });
    return Object.values(buckets).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  sampleThermalHourly(thermal) {
    const buckets = {};
    thermal.forEach(r => {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      if (!buckets[key]) buckets[key] = r;
    });
    return Object.values(buckets).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  renderVitalRow(label, data, field, low, high, invertFlag) {
    const cells = data.map(v => {
      const val = v[field];
      if (val == null) return '<td>-</td>';
      const abnormal = invertFlag
        ? (val < low)
        : (val < low || val > high);
      return `<td class="${abnormal ? 'flowsheet-value-abnormal' : ''}">${typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(1)) : val}</td>`;
    }).join('');
    return `<tr class="vitals-row"><td class="row-label">${label}</td>${cells}</tr>`;
  },

  renderThermalRow(label, data, field, coldThresh, coolThresh, warmThresh, hotThresh) {
    const cells = data.map(r => {
      const val = r[field];
      if (val == null) return '<td>-</td>';
      let cls = 'thermal-normal';
      if (val <= coldThresh) cls = 'thermal-cold';
      else if (val <= coolThresh) cls = 'thermal-cool';
      else if (val >= hotThresh) cls = 'thermal-hot';
      else if (val >= warmThresh) cls = 'thermal-warm';
      return `<td class="thermal-cell ${cls}">${val.toFixed(1)}</td>`;
    }).join('');
    return `<tr class="thermal-row"><td class="row-label" style="color:var(--neotherm-teal-dark)">${label}</td>${cells}</tr>`;
  },

  renderGrowthRows(growth, colCount) {
    if (growth.length === 0) {
      return `<tr class="growth-row"><td class="row-label">Weight (g)</td><td colspan="${colCount}" class="text-muted">No data</td></tr>`;
    }
    const latest = growth[growth.length - 1];
    return `
      <tr class="growth-row">
        <td class="row-label">Weight (g)</td>
        <td colspan="${colCount}" style="text-align:left;padding-left:12px;">${latest.weight_g}g (latest: ${App.formatDate(latest.timestamp)})</td>
      </tr>
      <tr class="growth-row">
        <td class="row-label">Length (cm)</td>
        <td colspan="${colCount}" style="text-align:left;padding-left:12px;">${latest.length_cm} cm</td>
      </tr>
      <tr class="growth-row">
        <td class="row-label">Head Circ (cm)</td>
        <td colspan="${colCount}" style="text-align:left;padding-left:12px;">${latest.head_circumference_cm} cm</td>
      </tr>
    `;
  },

  renderIORows(io, colCount) {
    if (io.length === 0) {
      return `<tr class="io-row"><td class="row-label">Intake</td><td colspan="${colCount}" class="text-muted">No data</td></tr>`;
    }
    // Sum intake and output by type
    const intake = io.filter(e => e.type === 'intake');
    const output = io.filter(e => e.type === 'output');
    const totalIntake = intake.reduce((s, e) => s + (e.amount_ml || 0), 0);
    const totalOutput = output.reduce((s, e) => s + (e.amount_ml || 0), 0);
    return `
      <tr class="io-row">
        <td class="row-label">Total Intake (mL)</td>
        <td colspan="${colCount}" style="text-align:left;padding-left:12px;">${totalIntake.toFixed(1)} mL (24h)</td>
      </tr>
      <tr class="io-row">
        <td class="row-label">Total Output (mL)</td>
        <td colspan="${colCount}" style="text-align:left;padding-left:12px;">${totalOutput.toFixed(1)} mL (24h)</td>
      </tr>
      <tr class="io-row">
        <td class="row-label">Net Balance</td>
        <td colspan="${colCount}" style="text-align:left;padding-left:12px;${(totalIntake - totalOutput) > 0 ? 'color:var(--alert-green)' : 'color:var(--alert-orange)'}">${(totalIntake - totalOutput) > 0 ? '+' : ''}${(totalIntake - totalOutput).toFixed(1)} mL</td>
      </tr>
    `;
  }
};
