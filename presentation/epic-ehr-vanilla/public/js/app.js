// Epic EHR — Main Application (State, Tabs, Navigation, Rendering)

const App = {
  // ── State ──
  tabs: [{ id: 'census', label: 'My Patients', type: 'census' }],
  activeTabId: 'census',
  activeNavItem: 'synopsis',
  patientCache: {},
  storyboardCollapsed: {},

  // ── Initialize ──
  async init() {
    this.renderTopbar();
    this.renderTabs();
    await this.renderActiveView();
  },

  // ── Topbar ──
  renderTopbar() {
    Topbar.render(document.getElementById('topbar'));
  },

  // ── Tab Management ──
  renderTabs() {
    Tabbar.render(document.getElementById('tabbar'), this.tabs, this.activeTabId);
  },

  switchTab(tabId) {
    this.activeTabId = tabId;
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && tab.type === 'patient') {
      this.activeNavItem = 'synopsis';
    }
    this.renderTabs();
    this.renderActiveView();
  },

  closeTab(tabId) {
    if (tabId === 'census') return;
    const idx = this.tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;
    this.tabs.splice(idx, 1);
    if (this.activeTabId === tabId) {
      this.activeTabId = this.tabs[Math.max(0, idx - 1)].id;
    }
    this.renderTabs();
    this.renderActiveView();
  },

  async openPatientChart(patientId) {
    const existing = this.tabs.find(t => t.patientId === patientId);
    if (existing) {
      this.switchTab(existing.id);
      return;
    }
    // Load patient data
    this.showLoading();
    try {
      const patient = await API.getPatient(patientId);
      this.patientCache[patientId] = patient;
      const tabId = `patient-${patientId}`;
      const label = `${patient.last_name}, ${patient.first_name.charAt(0)}.`;
      this.tabs.push({
        id: tabId,
        label,
        type: 'patient',
        patientId,
        hasAlert: patient.neotherm_alert_active,
      });
      this.activeTabId = tabId;
      this.activeNavItem = 'synopsis';
      this.renderTabs();
      await this.renderActiveView();

      // Check for BPA alerts
      const alerts = await API.getBPA(patientId);
      if (alerts.length > 0) {
        BPAModal.show(alerts[0], patientId);
      }
    } catch (e) {
      console.error('Error opening chart:', e);
    }
    this.hideLoading();
  },

  // ── Navigation ──
  setNavItem(item) {
    this.activeNavItem = item;
    this.renderActiveView();
  },

  // ── Storyboard toggle ──
  toggleStoryboard(patientId) {
    this.storyboardCollapsed[patientId] = !this.storyboardCollapsed[patientId];
    const el = document.querySelector('.storyboard');
    if (el) el.classList.toggle('collapsed');
  },

  // ── Render Active View ──
  async renderActiveView() {
    const container = document.getElementById('view-container');
    const tab = this.tabs.find(t => t.id === this.activeTabId);
    if (!tab) return;

    if (tab.type === 'census') {
      container.innerHTML = '';
      await PatientListView.render(container);
    } else if (tab.type === 'patient') {
      container.innerHTML = '';
      const patientId = tab.patientId;
      const patient = this.patientCache[patientId] || await API.getPatient(patientId);
      this.patientCache[patientId] = patient;

      // Chart layout: storyboard + (navigator + content)
      const layout = document.createElement('div');
      layout.className = 'chart-layout';

      // Storyboard
      const storyboardEl = document.createElement('div');
      const allergies = await API.getAllergies(patientId);
      Storyboard.render(storyboardEl, patient, allergies, this.storyboardCollapsed[patientId]);
      layout.appendChild(storyboardEl);

      // Body (navigator + content)
      const body = document.createElement('div');
      body.className = 'chart-body';

      // Navigator
      const navEl = document.createElement('div');
      Navigator.render(navEl, this.activeNavItem);
      body.appendChild(navEl);

      // Content area
      const content = document.createElement('div');
      content.className = 'chart-content';
      content.id = 'chart-content';
      body.appendChild(content);

      layout.appendChild(body);
      container.appendChild(layout);

      // Render the active view
      await this.renderChartView(content, patientId);
    }
  },

  async renderChartView(container, patientId) {
    this.showLoading();
    try {
      switch (this.activeNavItem) {
        case 'synopsis':
          await SynopsisView.render(container, patientId);
          break;
        case 'notes':
          await NotesView.render(container, patientId);
          break;
        case 'results':
          await ResultsView.render(container, patientId);
          break;
        case 'orders':
          await OrdersView.render(container, patientId);
          break;
        case 'mar':
          await MARView.render(container, patientId);
          break;
        case 'flowsheet':
          await FlowsheetView.render(container, patientId);
          break;
        case 'problems':
          await ProblemListView.render(container, patientId);
          break;
        case 'imaging':
          await ImagingView.render(container, patientId);
          break;
        case 'neotherm':
          await NeoThermView.render(container, patientId);
          break;
      }
    } catch (e) {
      console.error('Error rendering view:', e);
      container.innerHTML = `<div style="padding:40px;text-align:center;color:#999;">Error loading view</div>`;
    }
    this.hideLoading();
  },

  // ── Loading ──
  showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
  },
  hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
  },

  // ── Utility ──
  formatDate(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
  formatDateTime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  },
  formatTime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  },
  dayOfLife(dobStr) {
    if (!dobStr) return '';
    const dob = new Date(dobStr);
    const now = new Date();
    return Math.floor((now - dob) / 86400000);
  },
  gaDisplay(weeks, days) {
    return `${weeks}+${days}`;
  },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
