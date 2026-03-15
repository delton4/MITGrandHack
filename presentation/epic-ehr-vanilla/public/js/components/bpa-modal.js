// Epic EHR — BPA Modal (Best Practice Alert)
const BPAModal = {
  currentAlert: null,
  currentPatientId: null,

  show(alert, patientId) {
    this.currentAlert = alert;
    this.currentPatientId = patientId;
    const overlay = document.getElementById('bpa-overlay');
    overlay.classList.remove('hidden');

    overlay.innerHTML = `
      <div class="bpa-modal">
        <div class="bpa-modal-header">
          <span class="bpa-modal-header-icon">&#9888;</span>
          Best Practice Alert
        </div>
        <div class="bpa-modal-body">
          <div class="bpa-alert-title">${alert.title}</div>
          <div class="bpa-alert-summary">${alert.summary}</div>
          <div class="bpa-cptd-value">${alert.cptd_value.toFixed(1)}&deg;C</div>
          <div class="bpa-cptd-label">Current CPTD (Core-Peripheral Temperature Difference)</div>
          <div class="bpa-chart" id="bpa-cptd-chart"></div>
          <div class="bpa-recommendations">
            <h4>Recommended Actions:</h4>
            <label><input type="checkbox"> Obtain blood cultures</label>
            <label><input type="checkbox"> Order CBC with differential, CRP</label>
            <label><input type="checkbox"> Consider empiric antibiotics</label>
            <label><input type="checkbox"> Increase monitoring frequency</label>
            <label><input type="checkbox"> Notify attending physician</label>
          </div>
        </div>
        <div class="bpa-modal-footer">
          <button class="btn btn-text" id="bpa-dismiss">Dismiss</button>
          <button class="btn btn-link" id="bpa-view-neotherm">View NeoTherm Detail</button>
          <button class="btn btn-secondary" id="bpa-order-workup">Order Sepsis Workup</button>
          <button class="btn btn-primary" id="bpa-acknowledge">Acknowledge</button>
        </div>
      </div>
    `;

    // Draw CPTD trend chart
    this.drawCPTDChart(patientId);

    // Button handlers
    document.getElementById('bpa-acknowledge').addEventListener('click', () => this.acknowledge());
    document.getElementById('bpa-dismiss').addEventListener('click', () => this.dismiss());
    document.getElementById('bpa-view-neotherm').addEventListener('click', () => {
      this.dismiss();
      App.setNavItem('neotherm');
    });
    document.getElementById('bpa-order-workup').addEventListener('click', () => {
      this.dismiss();
      App.setNavItem('orders');
    });

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.dismiss();
    });
  },

  async drawCPTDChart(patientId) {
    try {
      const thermal = await API.getThermal(patientId, 12);
      const chartContainer = document.getElementById('bpa-cptd-chart');
      if (!chartContainer || thermal.length === 0) return;

      const canvas = document.createElement('canvas');
      chartContainer.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      const w = canvas.width;
      const h = canvas.height;
      const padding = { top: 10, right: 10, bottom: 20, left: 40 };
      const plotW = w - padding.left - padding.right;
      const plotH = h - padding.top - padding.bottom;

      const values = thermal.map(r => r.cptd);
      const minV = 0;
      const maxV = Math.max(4, Math.max(...values) + 0.5);

      // Draw threshold bands
      const thresholds = [
        { y: 1.0, color: 'rgba(255,193,7,0.15)', label: '1.0' },
        { y: 2.0, color: 'rgba(253,126,20,0.15)', label: '2.0' },
        { y: 3.0, color: 'rgba(220,53,69,0.15)', label: '3.0' },
      ];
      thresholds.forEach(t => {
        const yPos = padding.top + plotH * (1 - (t.y - minV) / (maxV - minV));
        ctx.fillStyle = t.color;
        ctx.fillRect(padding.left, yPos, plotW, padding.top + plotH - yPos);
        ctx.strokeStyle = '#DDD';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(w - padding.right, yPos);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#999';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(t.label + '°C', padding.left - 4, yPos + 3);
      });

      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = '#DC3545';
      ctx.lineWidth = 2;
      thermal.forEach((r, i) => {
        const x = padding.left + (i / (thermal.length - 1)) * plotW;
        const y = padding.top + plotH * (1 - (r.cptd - minV) / (maxV - minV));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // X-axis labels
      ctx.fillStyle = '#999';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      [0, Math.floor(thermal.length / 2), thermal.length - 1].forEach(i => {
        if (thermal[i]) {
          const x = padding.left + (i / (thermal.length - 1)) * plotW;
          ctx.fillText(App.formatTime(thermal[i].timestamp), x, h - 4);
        }
      });
    } catch (e) {
      console.error('Error drawing BPA chart:', e);
    }
  },

  async acknowledge() {
    if (this.currentAlert && this.currentPatientId) {
      await API.acknowledgeBPA(this.currentPatientId, this.currentAlert.id);
    }
    this.dismiss();
  },

  dismiss() {
    document.getElementById('bpa-overlay').classList.add('hidden');
    this.currentAlert = null;
    this.currentPatientId = null;
  }
};
