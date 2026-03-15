// Epic EHR — Results Review View (Lab results by panel)
const ResultsView = {
  async render(container, patientId) {
    const labs = await API.getLabs(patientId);

    // Group by timestamp+panel
    const groups = {};
    labs.forEach(l => {
      const dateKey = App.formatDateTime(l.timestamp);
      const key = `${dateKey}|||${l.panel}`;
      if (!groups[key]) groups[key] = { panel: l.panel, date: dateKey, timestamp: l.timestamp, results: [] };
      groups[key].results.push(l);
    });

    const panelGroups = Object.values(groups).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">Results Review</span>
      </div>
      <div id="results-panels">
        ${panelGroups.map((group, idx) => `
          <div class="results-panel">
            <div class="results-panel-header" data-panel-idx="${idx}">
              <span>&#9660;</span>
              <span style="flex:1;margin-left:4px;">${group.panel}</span>
              <span class="text-muted" style="font-size:11px;">${group.date}</span>
            </div>
            <div class="results-panel-body" id="results-panel-${idx}">
              <table class="clinical-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Value</th>
                    <th>Units</th>
                    <th>Reference</th>
                    <th>Flag</th>
                    <th style="width:50px">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  ${group.results.map(r => {
                    const flagClass = r.flag === 'Critical' ? 'lab-flag-critical' : r.flag === 'H' ? 'lab-flag-h' : r.flag === 'L' ? 'lab-flag-l' : '';
                    const displayVal = typeof r.value === 'number' ? (r.value % 1 === 0 ? r.value : r.value.toFixed(2)) : r.value;
                    return `
                      <tr>
                        <td>${r.test_name}</td>
                        <td style="font-weight:${r.flag ? '700' : '400'}">${displayVal}</td>
                        <td class="text-muted">${r.unit || ''}</td>
                        <td class="text-muted">${r.reference_low != null ? `${r.reference_low}-${r.reference_high}` : ''}</td>
                        <td>${r.flag ? `<span class="lab-flag ${flagClass}">${r.flag}</span>` : ''}</td>
                        <td><button class="btn btn-sm btn-link" data-test="${r.test_name}" data-patient="${patientId}">&#128200;</button></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Collapsible panels
    container.querySelectorAll('.results-panel-header').forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling;
        const arrow = header.querySelector('span');
        if (body.style.display === 'none') {
          body.style.display = '';
          arrow.innerHTML = '&#9660;';
        } else {
          body.style.display = 'none';
          arrow.innerHTML = '&#9654;';
        }
      });
    });

    // Trend chart buttons
    container.querySelectorAll('[data-test]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const testName = btn.dataset.test;
        const pid = btn.dataset.patient;
        await this.showTrendChart(testName, pid, labs);
      });
    });
  },

  async showTrendChart(testName, patientId, allLabs) {
    const testData = allLabs
      .filter(l => l.test_name === testName)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (testData.length < 2) return;

    const overlay = document.createElement('div');
    overlay.className = 'trend-overlay';
    overlay.innerHTML = `
      <div class="trend-modal">
        <span class="trend-close">&times;</span>
        <h3>${testName} — Trend</h3>
        <canvas id="trend-canvas"></canvas>
        <div style="margin-top:8px;font-size:11px;color:var(--epic-text-secondary);">
          Reference: ${testData[0].reference_low != null ? `${testData[0].reference_low} - ${testData[0].reference_high} ${testData[0].unit || ''}` : 'N/A'}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('.trend-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Draw trend chart
    const canvas = document.getElementById('trend-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 460;
    canvas.height = 200;

    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 20, right: 20, bottom: 30, left: 50 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const values = testData.map(d => d.value);
    const minV = Math.min(...values) * 0.8;
    const maxV = Math.max(...values) * 1.2;

    // Reference range band
    if (testData[0].reference_low != null) {
      const yLow = pad.top + plotH * (1 - (testData[0].reference_low - minV) / (maxV - minV));
      const yHigh = pad.top + plotH * (1 - (testData[0].reference_high - minV) / (maxV - minV));
      ctx.fillStyle = 'rgba(40,167,69,0.1)';
      ctx.fillRect(pad.left, yHigh, plotW, yLow - yHigh);
      ctx.strokeStyle = 'rgba(40,167,69,0.3)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, yLow); ctx.lineTo(w - pad.right, yLow);
      ctx.moveTo(pad.left, yHigh); ctx.lineTo(w - pad.right, yHigh);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw line + points
    ctx.beginPath();
    ctx.strokeStyle = '#1F3A93';
    ctx.lineWidth = 2;
    testData.forEach((d, i) => {
      const x = pad.left + (i / (testData.length - 1)) * plotW;
      const y = pad.top + plotH * (1 - (d.value - minV) / (maxV - minV));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    testData.forEach((d, i) => {
      const x = pad.left + (i / (testData.length - 1)) * plotW;
      const y = pad.top + plotH * (1 - (d.value - minV) / (maxV - minV));
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = d.flag ? '#DC3545' : '#1F3A93';
      ctx.fill();

      // Value labels
      ctx.fillStyle = '#333';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.value % 1 === 0 ? d.value : d.value.toFixed(1), x, y - 8);
    });

    // X-axis labels
    ctx.fillStyle = '#999';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    testData.forEach((d, i) => {
      const x = pad.left + (i / (testData.length - 1)) * plotW;
      ctx.fillText(App.formatDate(d.timestamp), x, h - 6);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const val = minV + (maxV - minV) * (i / ySteps);
      const y = pad.top + plotH * (1 - i / ySteps);
      ctx.fillText(val.toFixed(1), pad.left - 6, y + 3);
    }
  }
};
