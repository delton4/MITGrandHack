// Epic EHR — Order Entry Component
const OrderEntry = {
  selectedItem: null,

  render(container, patientId, onOrderPlaced) {
    const panel = document.createElement('div');
    panel.className = 'order-entry-panel';
    panel.innerHTML = `
      <div class="order-entry-header">
        <span>New Order Entry</span>
        <button class="btn btn-sm btn-text" style="color:white" id="order-entry-close">&times; Close</button>
      </div>
      <div class="order-entry-body">
        <input type="text" class="order-search" id="order-catalog-search" placeholder="Search order catalog (e.g., ampicillin, CBC, chest x-ray)..." autocomplete="off">
        <div class="order-catalog-results" id="order-catalog-results"></div>
        <div class="order-form" id="order-form">
          <div style="margin-bottom:8px;font-weight:600;color:var(--epic-primary)" id="order-form-title"></div>
          <div class="order-form-row">
            <div class="order-form-field">
              <label>Dose</label>
              <input type="text" id="order-dose" placeholder="Dose">
            </div>
            <div class="order-form-field">
              <label>Route</label>
              <select id="order-route">
                <option value="">Select route</option>
                <option value="IV">IV</option>
                <option value="PO">PO</option>
                <option value="IM">IM</option>
                <option value="Topical">Topical</option>
                <option value="Ophthalmic">Ophthalmic</option>
                <option value="PR">PR</option>
              </select>
            </div>
            <div class="order-form-field">
              <label>Frequency</label>
              <select id="order-frequency">
                <option value="">Select frequency</option>
                <option value="Once">Once</option>
                <option value="q4h">q4h</option>
                <option value="q6h">q6h</option>
                <option value="q8h">q8h</option>
                <option value="q12h">q12h</option>
                <option value="q24h">q24h</option>
                <option value="Continuous">Continuous</option>
                <option value="PRN">PRN</option>
              </select>
            </div>
            <div class="order-form-field">
              <label>Priority</label>
              <select id="order-priority-select">
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
          </div>
          <div style="text-align:right;margin-top:8px;">
            <button class="btn btn-secondary btn-sm" id="order-cancel">Cancel</button>
            <button class="btn btn-primary btn-sm" id="order-sign" style="margin-left:8px;">Sign Order</button>
          </div>
        </div>
      </div>
    `;

    container.prepend(panel);

    // Search handler
    const searchInput = panel.querySelector('#order-catalog-search');
    const resultsDiv = panel.querySelector('#order-catalog-results');
    const orderForm = panel.querySelector('#order-form');
    let searchTimeout;

    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        const q = searchInput.value.trim();
        if (q.length < 2) {
          resultsDiv.innerHTML = '';
          return;
        }
        const items = await API.searchCatalog(q);
        resultsDiv.innerHTML = items.map(item => `
          <div class="order-catalog-item" data-id="${item.id}" data-name="${item.name}" data-cat="${item.category}" data-dose="${item.default_dose || ''}" data-route="${item.default_route || ''}" data-freq="${item.default_frequency || ''}">
            <span>${item.name}</span>
            <span class="order-catalog-category">${item.category}</span>
          </div>
        `).join('');

        resultsDiv.querySelectorAll('.order-catalog-item').forEach(el => {
          el.addEventListener('click', () => {
            this.selectedItem = {
              name: el.dataset.name,
              category: el.dataset.cat,
              dose: el.dataset.dose,
              route: el.dataset.route,
              frequency: el.dataset.freq,
            };
            panel.querySelector('#order-form-title').textContent = el.dataset.name;
            panel.querySelector('#order-dose').value = el.dataset.dose || '';
            if (el.dataset.route) panel.querySelector('#order-route').value = el.dataset.route;
            if (el.dataset.freq) panel.querySelector('#order-frequency').value = el.dataset.freq;
            orderForm.classList.add('visible');
            resultsDiv.innerHTML = '';
            searchInput.value = '';
          });
        });
      }, 200);
    });

    // Sign order
    panel.querySelector('#order-sign').addEventListener('click', async () => {
      if (!this.selectedItem) return;
      const dose = panel.querySelector('#order-dose').value;
      const route = panel.querySelector('#order-route').value;
      const freq = panel.querySelector('#order-frequency').value;
      const priority = panel.querySelector('#order-priority-select').value;
      const orderText = `${this.selectedItem.name}${dose ? ' ' + dose : ''}${route ? ' ' + route : ''}${freq ? ' ' + freq : ''}`;
      await API.createOrder(patientId, {
        order_text: orderText,
        category: this.selectedItem.category,
        priority,
      });
      orderForm.classList.remove('visible');
      this.selectedItem = null;
      if (onOrderPlaced) onOrderPlaced();
    });

    // Cancel
    panel.querySelector('#order-cancel').addEventListener('click', () => {
      orderForm.classList.remove('visible');
      this.selectedItem = null;
    });

    // Close panel
    panel.querySelector('#order-entry-close').addEventListener('click', () => {
      panel.remove();
    });

    searchInput.focus();
  }
};
