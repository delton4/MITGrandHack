// Epic EHR — Synopsis / Summary View
const SynopsisView = {
  async render(container, patientId) {
    // Fetch all data in parallel
    const [problems, vitals, meds, labs, allergies, notes, thermal] = await Promise.all([
      API.getProblems(patientId),
      API.getVitals(patientId, 6),
      API.getMedications(patientId),
      API.getLabs(patientId),
      API.getAllergies(patientId),
      API.getNotes(patientId),
      API.getThermal(patientId, 6),
    ]);

    const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;
    const latestThermal = thermal.length > 0 ? thermal[thermal.length - 1] : null;

    // Get recent/unique labs (last 5 unique tests)
    const recentLabs = [];
    const seen = new Set();
    for (const lab of labs) {
      if (!seen.has(lab.test_name) && recentLabs.length < 6) {
        seen.add(lab.test_name);
        recentLabs.push(lab);
      }
    }

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">Patient Summary</span>
      </div>
      <div class="synopsis-grid">
        <!-- Active Problems -->
        <div class="synopsis-card">
          <div class="synopsis-card-header">&#9776; Active Problems</div>
          <div class="synopsis-card-body">
            ${problems.filter(p => p.status === 'active').map(p => `
              <div class="synopsis-item">
                <span class="synopsis-item-label">${p.description}</span>
                <span class="synopsis-item-value text-muted">${p.icd10}</span>
              </div>
            `).join('') || '<span class="text-muted">No active problems</span>'}
          </div>
        </div>

        <!-- Vitals Snapshot -->
        <div class="synopsis-card">
          <div class="synopsis-card-header">&#10084; Vitals Snapshot</div>
          <div class="synopsis-card-body">
            ${latestVitals ? `
              <div class="synopsis-item">
                <span class="synopsis-item-label">Heart Rate</span>
                <span class="synopsis-item-value ${latestVitals.hr > 170 ? 'flag-h' : ''}">${latestVitals.hr} bpm</span>
              </div>
              <div class="synopsis-item">
                <span class="synopsis-item-label">Respiratory Rate</span>
                <span class="synopsis-item-value ${latestVitals.rr > 55 ? 'flag-h' : ''}">${latestVitals.rr} /min</span>
              </div>
              <div class="synopsis-item">
                <span class="synopsis-item-label">SpO2</span>
                <span class="synopsis-item-value ${latestVitals.spo2 < 92 ? 'flag-l' : ''}">${latestVitals.spo2}%</span>
              </div>
              <div class="synopsis-item">
                <span class="synopsis-item-label">Temp (Axillary)</span>
                <span class="synopsis-item-value">${latestVitals.temp_axillary}&deg;C</span>
              </div>
              <div class="synopsis-item">
                <span class="synopsis-item-label">BP</span>
                <span class="synopsis-item-value">${latestVitals.bp_systolic}/${latestVitals.bp_diastolic} (${latestVitals.bp_mean})</span>
              </div>
            ` : '<span class="text-muted">No vitals available</span>'}
          </div>
        </div>

        <!-- Active Medications -->
        <div class="synopsis-card">
          <div class="synopsis-card-header">&#128138; Active Medications</div>
          <div class="synopsis-card-body">
            ${meds.map(m => `
              <div class="synopsis-item">
                <span class="synopsis-item-label">${m.drug_name}</span>
                <span class="synopsis-item-value text-muted">${m.dose} ${m.route} ${m.frequency}</span>
              </div>
            `).join('') || '<span class="text-muted">No active medications</span>'}
          </div>
        </div>

        <!-- Recent Results -->
        <div class="synopsis-card">
          <div class="synopsis-card-header">&#9879; Recent Results</div>
          <div class="synopsis-card-body">
            ${recentLabs.map(l => {
              const flagClass = l.flag === 'Critical' ? 'flag-critical' : l.flag === 'H' ? 'flag-h' : l.flag === 'L' ? 'flag-l' : '';
              return `
                <div class="synopsis-item">
                  <span class="synopsis-item-label">${l.test_name}</span>
                  <span class="synopsis-item-value ${flagClass}">${typeof l.value === 'number' ? (l.value % 1 === 0 ? l.value : l.value.toFixed(1)) : l.value} ${l.unit || ''} ${l.flag ? `<span class="lab-flag lab-flag-${l.flag.toLowerCase()}">${l.flag}</span>` : ''}</span>
                </div>
              `;
            }).join('') || '<span class="text-muted">No results available</span>'}
          </div>
        </div>

        <!-- Allergies -->
        <div class="synopsis-card">
          <div class="synopsis-card-header">&#9888; Allergies</div>
          <div class="synopsis-card-body">
            ${allergies.map(a => {
              const isNKDA = a.allergen.includes('No Known');
              return `
                <div class="synopsis-item">
                  <span class="synopsis-item-label">${a.allergen}</span>
                  <span class="synopsis-item-value text-muted">${isNKDA ? '' : `${a.reaction} (${a.severity})`}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Recent Notes -->
        <div class="synopsis-card">
          <div class="synopsis-card-header">&#9998; Recent Notes</div>
          <div class="synopsis-card-body">
            ${notes.slice(0, 3).map(n => `
              <div class="synopsis-item">
                <span class="synopsis-item-label" style="cursor:pointer;color:var(--epic-primary)" onclick="App.setNavItem('notes')">${n.title}</span>
                <span class="synopsis-item-value text-muted">${n.author} &bull; ${App.formatDateTime(n.timestamp)}</span>
              </div>
            `).join('') || '<span class="text-muted">No notes available</span>'}
          </div>
        </div>

        <!-- NeoTherm Summary -->
        <div class="synopsis-card neotherm-card" style="grid-column: 1 / -1">
          <div class="synopsis-card-header">&#127777; NeoTherm Summary</div>
          <div class="synopsis-card-body">
            ${latestThermal ? `
              <div style="display:flex;gap:24px;align-items:flex-start;">
                <div style="flex:0 0 200px;">
                  <div class="synopsis-item">
                    <span class="synopsis-item-label">Current CPTD</span>
                    <span class="synopsis-item-value ${latestThermal.cptd >= 2 ? 'flag-critical' : latestThermal.cptd >= 1 ? 'flag-h' : ''}" style="font-size:18px;font-weight:700;">${latestThermal.cptd.toFixed(1)}&deg;C</span>
                  </div>
                  <div class="synopsis-item">
                    <span class="synopsis-item-label">Alert Level</span>
                    <span class="synopsis-item-value" style="text-transform:capitalize;color:${latestThermal.alert_level === 'critical' ? 'var(--alert-red)' : latestThermal.alert_level === 'high' ? 'var(--alert-orange)' : latestThermal.alert_level === 'warning' ? 'var(--alert-yellow)' : 'var(--alert-green)'}">${latestThermal.alert_level}</span>
                  </div>
                  <div class="synopsis-item">
                    <span class="synopsis-item-label">Core Temp</span>
                    <span class="synopsis-item-value">${latestThermal.core_temp.toFixed(1)}&deg;C</span>
                  </div>
                </div>
                <div style="flex:1;">
                  <div style="font-size:11px;color:var(--epic-text-secondary);margin-bottom:4px;">CPTD Trend (6h)</div>
                  <div class="sparkline-container" id="synopsis-sparkline"></div>
                </div>
              </div>
            ` : '<span class="text-muted">No NeoTherm data available</span>'}
          </div>
        </div>
      </div>
    `;

    // Draw sparkline
    if (thermal.length > 1) {
      this.drawSparkline(thermal);
    }
  },

  drawSparkline(thermal) {
    const container = document.getElementById('synopsis-sparkline');
    if (!container) return;
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = container.clientWidth || 400;
    canvas.height = container.clientHeight || 40;
    const w = canvas.width;
    const h = canvas.height;
    const padding = 4;
    const values = thermal.map(r => r.cptd);
    const minV = 0;
    const maxV = Math.max(4, Math.max(...values) + 0.5);

    // Warning threshold line
    const thresholdY = padding + (h - 2 * padding) * (1 - (2.0 - minV) / (maxV - minV));
    ctx.strokeStyle = 'rgba(253,126,20,0.3)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(w, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw area fill
    ctx.beginPath();
    thermal.forEach((r, i) => {
      const x = padding + (i / (thermal.length - 1)) * (w - 2 * padding);
      const y = padding + (h - 2 * padding) * (1 - (r.cptd - minV) / (maxV - minV));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w - padding, h - padding);
    ctx.lineTo(padding, h - padding);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,180,216,0.1)';
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#00B4D8';
    ctx.lineWidth = 2;
    thermal.forEach((r, i) => {
      const x = padding + (i / (thermal.length - 1)) * (w - 2 * padding);
      const y = padding + (h - 2 * padding) * (1 - (r.cptd - minV) / (maxV - minV));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
};
