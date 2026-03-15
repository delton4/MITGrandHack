// Epic EHR — Orders View
const OrdersView = {
  async render(container, patientId) {
    const orders = await API.getOrders(patientId);

    container.innerHTML = `
      <div class="orders-toolbar">
        <span class="view-title">Orders</span>
        <div style="flex:1"></div>
        <button class="btn btn-primary btn-sm" id="new-order-btn">+ New Order</button>
      </div>
      <div id="order-entry-container"></div>
      <table class="clinical-table" id="orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th style="width:100px">Category</th>
            <th style="width:90px">Status</th>
            <th style="width:70px">Priority</th>
            <th style="width:120px">Ordered By</th>
            <th style="width:140px">Date/Time</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td><strong>${o.order_text}</strong></td>
              <td style="text-transform:capitalize">${o.category}</td>
              <td><span class="order-status ${o.status}">${o.status}</span></td>
              <td><span class="order-priority ${o.priority}">${o.priority}</span></td>
              <td>${o.ordered_by}</td>
              <td class="text-muted">${App.formatDateTime(o.ordered_at)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // New order button
    document.getElementById('new-order-btn').addEventListener('click', () => {
      const entryContainer = document.getElementById('order-entry-container');
      if (entryContainer.children.length > 0) return; // already open
      OrderEntry.render(entryContainer, patientId, async () => {
        // Refresh orders list
        const updated = await API.getOrders(patientId);
        const tbody = container.querySelector('#orders-table tbody');
        tbody.innerHTML = updated.map(o => `
          <tr>
            <td><strong>${o.order_text}</strong></td>
            <td style="text-transform:capitalize">${o.category}</td>
            <td><span class="order-status ${o.status}">${o.status}</span></td>
            <td><span class="order-priority ${o.priority}">${o.priority}</span></td>
            <td>${o.ordered_by}</td>
            <td class="text-muted">${App.formatDateTime(o.ordered_at)}</td>
          </tr>
        `).join('');
      });
    });
  }
};
