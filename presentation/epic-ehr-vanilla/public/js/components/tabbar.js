// Epic EHR — Tab Bar Component
const Tabbar = {
  render(el, tabs, activeTabId) {
    el.innerHTML = '';
    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
      tabEl.innerHTML = `
        ${tab.hasAlert ? '<span class="tab-alert-dot"></span>' : ''}
        <span class="tab-label">${tab.label}</span>
        ${tab.id !== 'census' ? '<span class="tab-close">&times;</span>' : ''}
      `;

      tabEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) {
          e.stopPropagation();
          App.closeTab(tab.id);
          return;
        }
        App.switchTab(tab.id);
      });

      el.appendChild(tabEl);
    });
  }
};
