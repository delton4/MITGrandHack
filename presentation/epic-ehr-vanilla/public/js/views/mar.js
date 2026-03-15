// Epic EHR — MAR View (Medication Administration Record)
const MARView = {
  async render(container, patientId) {
    const marEntries = await API.getMAR(patientId);

    // Group entries by medication
    const medGroups = {};
    marEntries.forEach(entry => {
      const key = entry.medication_id;
      if (!medGroups[key]) {
        medGroups[key] = {
          drugName: entry.drug_name,
          dose: entry.dose,
          route: entry.route,
          frequency: entry.frequency,
          entries: [],
        };
      }
      medGroups[key].entries.push(entry);
    });

    // Get all unique hours for the time columns (show today's 24h)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hours = [];
    for (let h = 0; h < 24; h++) {
      hours.push(h);
    }

    container.innerHTML = `
      <div class="section-header">
        <span class="section-title">Medication Administration Record</span>
        <span class="text-muted" style="font-size:11px;">Click a cell to administer</span>
      </div>
      <div class="mar-grid-wrapper">
        <table class="mar-table" id="mar-table">
          <thead>
            <tr>
              <th class="med-name-cell" style="position:sticky;left:0;z-index:15;background:var(--epic-chrome);">Medication</th>
              ${hours.map(h => `<th>${String(h).padStart(2, '0')}:00</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${Object.entries(medGroups).map(([medId, group]) => {
              const cells = hours.map(h => {
                const entry = group.entries.find(e => {
                  const d = new Date(e.scheduled_time);
                  return d.getHours() === h && d.getDate() === now.getDate();
                });
                if (!entry) return '<td></td>';
                const statusIcon = {
                  given: '&#10003;',
                  due: '&#9675;',
                  late: '&#33;',
                  held: '&#10005;',
                  scheduled: '&#8226;',
                };
                return `<td class="mar-cell ${entry.status}" data-entry-id="${entry.id}" data-patient-id="${patientId}" title="${entry.status === 'given' ? 'Given at ' + App.formatTime(entry.administered_at) + ' by ' + entry.administered_by : entry.status}">${statusIcon[entry.status] || '&#8226;'}</td>`;
              }).join('');

              return `
                <tr>
                  <td class="med-name-cell">
                    <div>${group.drugName}</div>
                    <div class="med-detail">${group.dose} ${group.route} ${group.frequency}</div>
                  </td>
                  ${cells}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top:12px;font-size:11px;color:var(--epic-text-secondary);">
        <span style="margin-right:16px;"><span class="mar-cell given" style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;border:1px solid var(--epic-border);border-radius:3px;">&#10003;</span> Given</span>
        <span style="margin-right:16px;"><span class="mar-cell due" style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;border:1px solid var(--epic-border);border-radius:3px;">&#9675;</span> Due</span>
        <span style="margin-right:16px;"><span class="mar-cell late" style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;border:1px solid var(--epic-border);border-radius:3px;">&#33;</span> Late</span>
        <span style="margin-right:16px;"><span class="mar-cell held" style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;border:1px solid var(--epic-border);border-radius:3px;">&#10005;</span> Held</span>
        <span><span class="mar-cell scheduled" style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;border:1px solid var(--epic-border);border-radius:3px;">&#8226;</span> Scheduled</span>
      </div>
    `;

    // Click to administer
    container.querySelectorAll('.mar-cell[data-entry-id]').forEach(cell => {
      cell.addEventListener('click', async () => {
        const entryId = cell.dataset.entryId;
        const pid = cell.dataset.patientId;
        const currentStatus = cell.className.replace('mar-cell ', '').trim();
        let newStatus;
        if (currentStatus === 'given') return; // already given
        if (currentStatus === 'scheduled' || currentStatus === 'due' || currentStatus === 'late') {
          newStatus = 'given';
        } else if (currentStatus === 'held') {
          newStatus = 'given';
        } else {
          newStatus = 'given';
        }
        await API.updateMAR(pid, entryId, newStatus);
        // Update cell visually
        cell.className = `mar-cell ${newStatus}`;
        cell.innerHTML = '&#10003;';
        cell.title = `Given at ${App.formatTime(new Date().toISOString())} by RN Smith`;
      });
    });
  }
};
