// Epic EHR — NeoTherm Widget View (SVG heatmap, CPTD trend, zone table)
const NeoThermView = {
  async render(container, patientId) {
    const thermal = await API.getThermal(patientId, 24);
    const latest = thermal.length > 0 ? thermal[thermal.length - 1] : null;

    if (!latest) {
      container.innerHTML = `<div style="padding:40px;text-align:center;color:#999;">No NeoTherm data available</div>`;
      return;
    }

    // Compute stats for zone table (last hour)
    const lastHourData = thermal.filter(r => {
      const diff = new Date(thermal[thermal.length - 1].timestamp) - new Date(r.timestamp);
      return diff <= 3600000;
    });

    const zones = [
      { name: 'Core', field: 'core_temp' },
      { name: 'Abdomen', field: 'abdomen_temp' },
      { name: 'Left Hand', field: 'left_hand' },
      { name: 'Right Hand', field: 'right_hand' },
      { name: 'Left Foot', field: 'left_foot' },
      { name: 'Right Foot', field: 'right_foot' },
      { name: 'Left Elbow', field: 'left_elbow' },
      { name: 'Right Elbow', field: 'right_elbow' },
      { name: 'Left Knee', field: 'left_knee' },
      { name: 'Right Knee', field: 'right_knee' },
    ];

    const zoneStats = zones.map(z => {
      const vals = lastHourData.map(r => r[z.field]).filter(v => v != null);
      return {
        name: z.name,
        current: latest[z.field],
        min: vals.length ? Math.min(...vals) : null,
        max: vals.length ? Math.max(...vals) : null,
        avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
      };
    });

    const alertLevel = latest.alert_level || 'normal';
    const alertLabels = {
      normal: 'Normal — All zones within expected range',
      warning: 'Warning — CPTD elevated, monitor closely',
      high: 'High — CPTD significantly elevated, consider evaluation',
      critical: 'Critical — CPTD critically elevated, immediate evaluation recommended',
    };

    container.innerHTML = `
      <div class="neotherm-widget">
        <div class="neotherm-widget-header">
          &#127777; NeoTherm Continuous Thermal Monitoring
          <span class="neotherm-logo">NeoTherm&trade; Integration</span>
        </div>
        <div class="neotherm-alert-banner ${alertLevel}">
          <span style="font-size:16px;">${alertLevel === 'normal' ? '&#9989;' : alertLevel === 'warning' ? '&#9888;' : '&#128308;'}</span>
          <span>Alert Status: <strong style="text-transform:uppercase;">${alertLevel}</strong> &mdash; ${alertLabels[alertLevel]}</span>
        </div>
        <div class="neotherm-body">
          <!-- SVG Heatmap -->
          <div class="neotherm-heatmap-section">
            <div class="neotherm-section-title">Infant Thermal Map (Current)</div>
            <div class="neotherm-heatmap" id="neotherm-heatmap">
              ${this.renderInfantSVG(latest)}
            </div>
            <div style="margin-top:8px;display:flex;justify-content:center;gap:4px;font-size:10px;align-items:center;">
              <span style="width:20px;height:10px;background:#3B82F6;display:inline-block;border-radius:2px;"></span>32°C
              <span style="width:20px;height:10px;background:#22C55E;display:inline-block;border-radius:2px;margin-left:8px;"></span>34°C
              <span style="width:20px;height:10px;background:#EAB308;display:inline-block;border-radius:2px;margin-left:8px;"></span>36°C
              <span style="width:20px;height:10px;background:#EF4444;display:inline-block;border-radius:2px;margin-left:8px;"></span>37°C+
            </div>
          </div>

          <!-- CPTD Trend Chart (24h) -->
          <div class="neotherm-chart-section">
            <div class="neotherm-section-title">CPTD Trend (24 Hours)</div>
            <div class="neotherm-chart" id="neotherm-cptd-chart"></div>
            <div style="margin-top:6px;text-align:center;font-size:20px;font-weight:700;color:${latest.cptd >= 3 ? 'var(--alert-red)' : latest.cptd >= 2 ? 'var(--alert-orange)' : latest.cptd >= 1 ? 'var(--alert-yellow)' : 'var(--alert-green)'}">
              CPTD: ${latest.cptd.toFixed(1)}&deg;C
            </div>
          </div>

          <!-- Zone Temperature Table -->
          <div class="neotherm-zones-table">
            <div class="neotherm-section-title">Zone Temperature Breakdown (Last Hour)</div>
            <table class="neotherm-zone-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Current (°C)</th>
                  <th>Min (°C)</th>
                  <th>Max (°C)</th>
                  <th>Avg (°C)</th>
                </tr>
              </thead>
              <tbody>
                ${zoneStats.map(z => `
                  <tr>
                    <td><strong>${z.name}</strong></td>
                    <td class="temp-value" style="color:${this.tempColor(z.current)}">${z.current != null ? z.current.toFixed(1) : '-'}</td>
                    <td>${z.min != null ? z.min.toFixed(1) : '-'}</td>
                    <td>${z.max != null ? z.max.toFixed(1) : '-'}</td>
                    <td>${z.avg != null ? z.avg.toFixed(1) : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Link -->
          <div class="neotherm-link">
            <a href="#" onclick="return false;">View Full NeoTherm Dashboard &rarr;</a>
          </div>
        </div>
      </div>
    `;

    // Draw CPTD trend chart
    this.drawCPTDTrend(thermal);
  },

  tempToColor(temp) {
    // Linear interpolation: 32°C blue, 34°C green, 36°C yellow, 37°C+ red
    if (temp <= 32) return '#3B82F6';
    if (temp <= 34) {
      const t = (temp - 32) / 2;
      return this.lerpColor('#3B82F6', '#22C55E', t);
    }
    if (temp <= 36) {
      const t = (temp - 34) / 2;
      return this.lerpColor('#22C55E', '#EAB308', t);
    }
    if (temp <= 37) {
      const t = (temp - 36) / 1;
      return this.lerpColor('#EAB308', '#EF4444', t);
    }
    return '#EF4444';
  },

  lerpColor(a, b, t) {
    const ah = parseInt(a.slice(1), 16);
    const bh = parseInt(b.slice(1), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
  },

  tempColor(temp) {
    if (temp == null) return '#999';
    if (temp >= 37) return '#EF4444';
    if (temp >= 36) return '#EAB308';
    if (temp >= 34) return '#22C55E';
    return '#3B82F6';
  },

  renderInfantSVG(data) {
    const coreColor = this.tempToColor(data.core_temp);
    const abdomenColor = this.tempToColor(data.abdomen_temp);
    const lHandColor = this.tempToColor(data.left_hand);
    const rHandColor = this.tempToColor(data.right_hand);
    const lFootColor = this.tempToColor(data.left_foot);
    const rFootColor = this.tempToColor(data.right_foot);
    const lElbowColor = this.tempToColor(data.left_elbow);
    const rElbowColor = this.tempToColor(data.right_elbow);
    const lKneeColor = this.tempToColor(data.left_knee);
    const rKneeColor = this.tempToColor(data.right_knee);

    return `
    <svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;">
      <!-- Head -->
      <ellipse cx="100" cy="35" rx="30" ry="32" fill="${coreColor}" stroke="#333" stroke-width="1.5" opacity="0.85"/>
      <!-- Body/Torso (core) -->
      <rect x="70" y="65" width="60" height="70" rx="10" fill="${coreColor}" stroke="#333" stroke-width="1.5" opacity="0.85"/>
      <!-- Abdomen -->
      <ellipse cx="100" cy="120" rx="25" ry="18" fill="${abdomenColor}" stroke="#333" stroke-width="1" opacity="0.7"/>
      <text x="100" y="124" text-anchor="middle" font-size="8" fill="#333">${data.abdomen_temp.toFixed(1)}°</text>

      <!-- Left Upper Arm -->
      <rect x="42" y="72" width="28" height="16" rx="6" fill="${lElbowColor}" stroke="#333" stroke-width="1" opacity="0.8"/>
      <!-- Right Upper Arm -->
      <rect x="130" y="72" width="28" height="16" rx="6" fill="${rElbowColor}" stroke="#333" stroke-width="1" opacity="0.8"/>

      <!-- Left Elbow -->
      <circle cx="42" cy="96" r="8" fill="${lElbowColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="42" y="99" text-anchor="middle" font-size="6" fill="#333">${data.left_elbow.toFixed(1)}°</text>
      <!-- Right Elbow -->
      <circle cx="158" cy="96" r="8" fill="${rElbowColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="158" y="99" text-anchor="middle" font-size="6" fill="#333">${data.right_elbow.toFixed(1)}°</text>

      <!-- Left Forearm -->
      <rect x="28" y="100" width="16" height="24" rx="5" fill="${lHandColor}" stroke="#333" stroke-width="1" opacity="0.75"/>
      <!-- Right Forearm -->
      <rect x="156" y="100" width="16" height="24" rx="5" fill="${rHandColor}" stroke="#333" stroke-width="1" opacity="0.75"/>

      <!-- Left Hand -->
      <ellipse cx="36" cy="132" rx="10" ry="8" fill="${lHandColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="36" y="135" text-anchor="middle" font-size="6" fill="#333">${data.left_hand.toFixed(1)}°</text>
      <!-- Right Hand -->
      <ellipse cx="164" cy="132" rx="10" ry="8" fill="${rHandColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="164" y="135" text-anchor="middle" font-size="6" fill="#333">${data.right_hand.toFixed(1)}°</text>

      <!-- Left Upper Leg -->
      <rect x="72" y="140" width="20" height="40" rx="6" fill="${lKneeColor}" stroke="#333" stroke-width="1" opacity="0.8"/>
      <!-- Right Upper Leg -->
      <rect x="108" y="140" width="20" height="40" rx="6" fill="${rKneeColor}" stroke="#333" stroke-width="1" opacity="0.8"/>

      <!-- Left Knee -->
      <circle cx="82" cy="188" r="8" fill="${lKneeColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="82" y="191" text-anchor="middle" font-size="6" fill="#333">${data.left_knee.toFixed(1)}°</text>
      <!-- Right Knee -->
      <circle cx="118" cy="188" r="8" fill="${rKneeColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="118" y="191" text-anchor="middle" font-size="6" fill="#333">${data.right_knee.toFixed(1)}°</text>

      <!-- Left Lower Leg -->
      <rect x="74" y="196" width="16" height="35" rx="5" fill="${lFootColor}" stroke="#333" stroke-width="1" opacity="0.75"/>
      <!-- Right Lower Leg -->
      <rect x="110" y="196" width="16" height="35" rx="5" fill="${rFootColor}" stroke="#333" stroke-width="1" opacity="0.75"/>

      <!-- Left Foot -->
      <ellipse cx="82" cy="240" rx="12" ry="8" fill="${lFootColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="82" y="243" text-anchor="middle" font-size="6" fill="#333">${data.left_foot.toFixed(1)}°</text>
      <!-- Right Foot -->
      <ellipse cx="118" cy="240" rx="12" ry="8" fill="${rFootColor}" stroke="#333" stroke-width="1" opacity="0.85"/>
      <text x="118" y="243" text-anchor="middle" font-size="6" fill="#333">${data.right_foot.toFixed(1)}°</text>

      <!-- Core temp label -->
      <text x="100" y="95" text-anchor="middle" font-size="9" fill="white" font-weight="bold">${data.core_temp.toFixed(1)}°C</text>
      <text x="100" y="106" text-anchor="middle" font-size="7" fill="white">Core</text>
    </svg>
    `;
  },

  drawCPTDTrend(thermal) {
    const chartContainer = document.getElementById('neotherm-cptd-chart');
    if (!chartContainer || thermal.length === 0) return;

    const canvas = document.createElement('canvas');
    chartContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = chartContainer.clientWidth || 400;
    canvas.height = chartContainer.clientHeight || 180;

    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 15, right: 15, bottom: 25, left: 45 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const values = thermal.map(r => r.cptd);
    const minV = 0;
    const maxV = Math.max(4, Math.max(...values) + 0.5);

    // Threshold bands
    const bands = [
      { from: 0, to: 1.0, color: 'rgba(40,167,69,0.08)', label: 'Normal' },
      { from: 1.0, to: 2.0, color: 'rgba(255,193,7,0.1)', label: 'Warning' },
      { from: 2.0, to: 3.0, color: 'rgba(253,126,20,0.12)', label: 'High' },
      { from: 3.0, to: maxV, color: 'rgba(220,53,69,0.1)', label: 'Critical' },
    ];

    bands.forEach(band => {
      const y1 = pad.top + plotH * (1 - (band.to - minV) / (maxV - minV));
      const y2 = pad.top + plotH * (1 - (band.from - minV) / (maxV - minV));
      ctx.fillStyle = band.color;
      ctx.fillRect(pad.left, y1, plotW, y2 - y1);
    });

    // Threshold lines
    [1.0, 2.0, 3.0].forEach(thresh => {
      const y = pad.top + plotH * (1 - (thresh - minV) / (maxV - minV));
      ctx.strokeStyle = '#DDD';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#AAA';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${thresh.toFixed(1)}`, pad.left - 4, y + 3);
    });

    // Area fill under curve
    ctx.beginPath();
    thermal.forEach((r, i) => {
      const x = pad.left + (i / (thermal.length - 1)) * plotW;
      const y = pad.top + plotH * (1 - (r.cptd - minV) / (maxV - minV));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,180,216,0.15)';
    ctx.fill();

    // Main line — color-coded by CPTD value
    for (let i = 1; i < thermal.length; i++) {
      const x1 = pad.left + ((i - 1) / (thermal.length - 1)) * plotW;
      const y1 = pad.top + plotH * (1 - (thermal[i - 1].cptd - minV) / (maxV - minV));
      const x2 = pad.left + (i / (thermal.length - 1)) * plotW;
      const y2 = pad.top + plotH * (1 - (thermal[i].cptd - minV) / (maxV - minV));
      const avgCptd = (thermal[i - 1].cptd + thermal[i].cptd) / 2;
      ctx.beginPath();
      ctx.strokeStyle = avgCptd >= 3 ? '#DC3545' : avgCptd >= 2 ? '#FD7E14' : avgCptd >= 1 ? '#FFC107' : '#00B4D8';
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // X-axis labels (5 time labels)
    ctx.fillStyle = '#999';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    const labelCount = 5;
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.floor(i * (thermal.length - 1) / (labelCount - 1));
      if (thermal[idx]) {
        const x = pad.left + (idx / (thermal.length - 1)) * plotW;
        ctx.fillText(App.formatTime(thermal[idx].timestamp), x, h - 6);
      }
    }

    // Y-axis 0 label
    ctx.textAlign = 'right';
    ctx.fillText('0', pad.left - 4, pad.top + plotH + 3);
    ctx.fillText(maxV.toFixed(1), pad.left - 4, pad.top + 8);
  }
};
