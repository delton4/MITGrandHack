// Epic EHR — Top Bar Component
const Topbar = {
  render(el) {
    el.innerHTML = `
      <div class="topbar-logo">Epic<span>Hyperdrive</span></div>
      <div class="topbar-search">
        <span class="topbar-search-icon">&#128269;</span>
        <input type="text" placeholder="Search patients by name or MRN..." id="global-search" autocomplete="off">
      </div>
      <div class="topbar-spacer"></div>
      <div class="topbar-context">NICU &mdash; Bay 1-4</div>
      <div class="topbar-bell" id="topbar-bell" title="Notifications">
        &#128276;
        <span class="topbar-bell-badge">2</span>
      </div>
      <div class="topbar-user">
        <div class="topbar-user-avatar">&#9786;</div>
        Dr. Martinez, MD
      </div>
    `;

    // Search functionality
    const searchInput = el.querySelector('#global-search');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
          // Switch to census tab with search
          App.activeTabId = 'census';
          App.renderTabs();
          const container = document.getElementById('view-container');
          container.innerHTML = '';
          await PatientListView.render(container, query);
        } else if (query.length === 0) {
          App.activeTabId = 'census';
          App.renderTabs();
          App.renderActiveView();
        }
      }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.blur();
      }
    });
  }
};
