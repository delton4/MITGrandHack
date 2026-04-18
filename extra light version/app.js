(function () {
  "use strict";

  var NOW = DATA.NOW;
  var patients = DATA.patients;
  var orderCatalog = DATA.orderCatalog;

  /* ═══════════ STATE ═══════════ */
  var state = {
    tabs: [{ id: "census", type: "census", label: "My Patients" }],
    activeTabId: "census",
    activeNav: "Summary",
    bpaAcknowledged: {},
    storyboardCollapsed: false,
    expandedNotes: {},
    expandedImaging: {},
    orderFormVisible: false,
    orderFormData: { name: "", dose: "", route: "", frequency: "", category: "" },
    noteFormVisible: false,
  };

  /* ═══════════ HELPERS ═══════════ */
  function getPatient(id) {
    for (var i = 0; i < patients.length; i++) {
      if (patients[i].id === id) return patients[i];
    }
    return null;
  }

  function formatDate(d) {
    var dt = new Date(d);
    return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear();
  }

  function formatTime(d) {
    var dt = new Date(d);
    var h = dt.getHours();
    var m = dt.getMinutes();
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  function formatDateTime(d) {
    return formatDate(d) + " " + formatTime(d);
  }

  function calcDOL(dob) {
    return Math.floor((NOW - new Date(dob)) / 86400000);
  }

  function esc(s) {
    if (s == null) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function tempToColor(temp) {
    if (temp <= 32) return "#3B82F6";
    if (temp <= 34) {
      var t = (temp - 32) / 2;
      return lerpColor("#3B82F6", "#22C55E", t);
    }
    if (temp <= 36) {
      var t2 = (temp - 34) / 2;
      return lerpColor("#22C55E", "#EAB308", t2);
    }
    if (temp <= 37) {
      var t3 = (temp - 36);
      return lerpColor("#EAB308", "#EF4444", t3);
    }
    return "#EF4444";
  }

  function lerpColor(c1, c2, t) {
    var r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    var r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    var r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function flagClass(flag) {
    if (!flag) return "";
    if (flag === "Critical") return "flag-Critical";
    if (flag === "H") return "flag-H";
    if (flag === "L") return "flag-L";
    if (flag === "Pending") return "flag-Pending";
    return "";
  }

  function flagBg(flag) {
    if (flag === "H" || flag === "L") return " val-abnormal";
    if (flag === "Critical") return " val-critical";
    return "";
  }

  /* ═══════════ SPARKLINE ═══════════ */
  function cptdSparkline(thermalReadings, width, height) {
    var recent = thermalReadings.slice(-12);
    if (recent.length < 2) return "";
    var max = 5;
    var pts = [];
    for (var i = 0; i < recent.length; i++) {
      var x = (i / (recent.length - 1)) * (width - 8) + 4;
      var y = height - 4 - (recent[i].cptd / max) * (height - 8);
      pts.push(x.toFixed(1) + "," + y.toFixed(1));
    }
    return '<svg width="' + width + '" height="' + height + '" style="display:block;margin:0 auto">' +
      '<rect x="0" y="' + (height - 4 - (1 / max) * (height - 8)) + '" width="' + width + '" height="' + ((1 / max) * (height - 8)) + '" fill="#28A745" opacity="0.12"/>' +
      '<rect x="0" y="' + (height - 4 - (2 / max) * (height - 8)) + '" width="' + width + '" height="' + ((1 / max) * (height - 8)) + '" fill="#FFC107" opacity="0.12"/>' +
      '<rect x="0" y="' + (height - 4 - (3 / max) * (height - 8)) + '" width="' + width + '" height="' + ((1 / max) * (height - 8)) + '" fill="#FD7E14" opacity="0.12"/>' +
      '<rect x="0" y="' + (height - 4 - (5 / max) * (height - 8)) + '" width="' + width + '" height="' + ((2 / max) * (height - 8)) + '" fill="#DC3545" opacity="0.10"/>' +
      '<polyline fill="none" stroke="#00B4D8" stroke-width="2" points="' + pts.join(" ") + '"/>' +
      '</svg>';
  }

  /* ═══════════ TOP BAR ═══════════ */
  function renderTopBar() {
    var alertCount = 0;
    patients.forEach(function (p) {
      if (p.bpaAlerts && p.bpaAlerts.length) {
        p.bpaAlerts.forEach(function (a) {
          if (!state.bpaAcknowledged[a.id]) alertCount++;
        });
      }
    });
    document.getElementById("topbar").innerHTML =
      '<span class="top-logo">Epic</span>' +
      '<div class="top-search"><input type="text" placeholder="Search patients, orders, results..." /></div>' +
      '<span class="top-context">NICU &mdash; Bay 1-4</span>' +
      '<span class="top-bell">&#128276;' + (alertCount > 0 ? '<span class="badge">' + alertCount + '</span>' : '') + '</span>' +
      '<div class="top-user"><span class="top-avatar">RM</span>Dr. Martinez, MD</div>';
  }

  /* ═══════════ TAB BAR ═══════════ */
  function renderTabBar() {
    var h = '';
    state.tabs.forEach(function (tab) {
      var active = tab.id === state.activeTabId ? " active" : "";
      var icon = tab.type === "census" ? "&#128203;" : "&#128100;";
      var close = tab.type !== "census" ? ' <span class="close-tab" data-close-tab="' + tab.id + '">&times;</span>' : '';
      h += '<div class="tab' + active + '" data-tab-id="' + tab.id + '"><span class="tab-icon">' + icon + '</span>' + esc(tab.label) + close + '</div>';
    });
    document.getElementById("tabbar").innerHTML = h;
  }

  /* ═══════════ NAVIGATOR ═══════════ */
  var navItems = [
    { key: "Summary", icon: "S", teal: false },
    { key: "Notes", icon: "N", teal: false },
    { key: "Results", icon: "R", teal: false },
    { key: "Orders", icon: "O", teal: false },
    { key: "MAR", icon: "M", teal: false },
    { key: "Flowsheets", icon: "F", teal: false },
    { key: "Problems", icon: "P", teal: false },
    { key: "Imaging", icon: "I", teal: false },
    { key: "NeoTherm", icon: "T", teal: true },
  ];

  function renderNavigator() {
    var nav = document.getElementById("navigator");
    var activeTab = getActiveTab();
    if (activeTab.type === "census") {
      nav.style.display = "none";
      return;
    }
    nav.style.display = "block";
    var h = '';
    navItems.forEach(function (item) {
      var active = item.key === state.activeNav ? " active" : "";
      var cls = item.teal ? "teal" : "blue";
      h += '<div class="nav-item' + active + '" data-nav="' + item.key + '">' +
        '<span class="nav-icon ' + cls + '">' + item.icon + '</span>' +
        '<span class="nav-label">' + item.key + '</span></div>';
    });
    nav.innerHTML = h;
  }

  /* ═══════════ TAB MANAGEMENT ═══════════ */
  function getActiveTab() {
    for (var i = 0; i < state.tabs.length; i++) {
      if (state.tabs[i].id === state.activeTabId) return state.tabs[i];
    }
    return state.tabs[0];
  }

  function openPatientTab(patientId) {
    var p = getPatient(patientId);
    if (!p) return;
    var tabId = "patient-" + patientId;
    var existing = false;
    state.tabs.forEach(function (t) { if (t.id === tabId) existing = true; });
    if (!existing) {
      state.tabs.push({ id: tabId, type: "patient", label: p.lastName + ", " + p.firstName.charAt(0) + ".", patientId: patientId });
    }
    state.activeTabId = tabId;
    state.activeNav = "Summary";
    render();
    checkBPA(p);
  }

  function switchTab(tabId) {
    state.activeTabId = tabId;
    if (tabId !== "census") {
      var tab = getActiveTab();
      if (tab.patientId) {
        var p = getPatient(tab.patientId);
        if (p) checkBPA(p);
      }
    }
    render();
  }

  function closeTab(tabId) {
    state.tabs = state.tabs.filter(function (t) { return t.id !== tabId; });
    if (state.activeTabId === tabId) {
      state.activeTabId = state.tabs[state.tabs.length - 1].id;
    }
    render();
  }

  /* ═══════════ BPA ═══════════ */
  function checkBPA(patient) {
    if (!patient.bpaAlerts || !patient.bpaAlerts.length) return;
    var unacked = patient.bpaAlerts.filter(function (a) { return !state.bpaAcknowledged[a.id]; });
    if (unacked.length === 0) return;
    showBPA(unacked[0], patient);
  }

  function showBPA(alert, patient) {
    var overlay = document.getElementById("modal-overlay");
    overlay.innerHTML =
      '<div class="bpa-card">' +
        '<div class="bpa-header">&#9888;&#65039; Best Practice Alert</div>' +
        '<div class="bpa-body">' +
          '<div class="bpa-title">' + esc(alert.title) + '</div>' +
          '<div class="bpa-summary">' + esc(alert.summary) + '</div>' +
          '<div class="bpa-cptd">Current CPTD: ' + alert.cptdValue + '&deg;C</div>' +
        '</div>' +
        '<div class="bpa-footer">' +
          '<button class="btn btn-text" data-bpa-dismiss>Dismiss</button>' +
          '<button class="btn btn-link" data-bpa-view="' + patient.id + '">View NeoTherm Detail</button>' +
          '<button class="btn btn-secondary" data-bpa-order>Order Sepsis Workup</button>' +
          '<button class="btn btn-primary" data-bpa-ack="' + alert.id + '">Acknowledge</button>' +
        '</div>' +
      '</div>';
    overlay.classList.add("active");
  }

  function closeBPA() {
    var overlay = document.getElementById("modal-overlay");
    overlay.classList.remove("active");
    overlay.innerHTML = "";
  }

  /* ═══════════ STORYBOARD ═══════════ */
  function renderStoryboard(patient) {
    var dol = calcDOL(patient.dob);
    var collapsed = state.storyboardCollapsed ? " collapsed" : "";
    var allergies = '';
    patient.allergies.forEach(function (a) {
      var cls = a === "NKDA" ? " nkda" : "";
      allergies += '<span class="allergy-badge' + cls + '">' + esc(a) + '</span>';
    });
    return '<div class="storyboard' + collapsed + '">' +
      '<span class="sb-name">' + esc(patient.lastName) + ', ' + esc(patient.firstName) + '</span>' +
      '<div class="sb-details">' +
        '<span class="sb-detail"><b>MRN:</b> ' + esc(patient.mrn) + '</span>' +
        '<span class="sb-detail"><b>DOB:</b> ' + formatDate(patient.dob) + '</span>' +
        '<span class="sb-detail"><b>GA:</b> ' + esc(patient.ga) + ' wk</span>' +
        '<span class="sb-detail"><b>DOL:</b> ' + dol + '</span>' +
        '<span class="sb-detail"><b>Sex:</b> ' + (patient.sex === "F" ? "Female" : "Male") + '</span>' +
        '<span class="sb-detail"><b>Weight:</b> ' + patient.currentWeight + 'g</span>' +
        '<span class="sb-detail"><b>Code:</b> ' + esc(patient.codeStatus) + '</span>' +
        '<span class="sb-detail"><b>Attending:</b> ' + esc(patient.attending) + '</span>' +
        allergies +
      '</div>' +
      '<button class="sb-toggle" data-sb-toggle>' + (state.storyboardCollapsed ? "Expand" : "Collapse") + '</button>' +
    '</div>';
  }

  /* ═══════════ CENSUS VIEW ═══════════ */
  function renderCensus() {
    var h = '<div class="view-header">NICU Census &mdash; ' + patients.length + ' Patients</div>';
    h += '<table class="data-table"><thead><tr>' +
      '<th>Bed</th><th>Patient Name</th><th>MRN</th><th>GA</th><th>DOL</th><th>Weight</th><th>Dx</th><th>Acuity</th><th>Alerts</th>' +
      '</tr></thead><tbody>';
    patients.forEach(function (p) {
      var dol = calcDOL(p.dob);
      var acuityCls = p.acuity === "Level III" ? "iii" : "ii";
      var alerts = '';
      if (p.bpaAlerts && p.bpaAlerts.length) {
        var unacked = p.bpaAlerts.filter(function (a) { return !state.bpaAcknowledged[a.id]; });
        if (unacked.length) alerts += '<span class="alert-dot red" title="Active BPA"></span> ';
      }
      var lastThermal = p.thermal && p.thermal.length ? p.thermal[p.thermal.length - 1] : null;
      if (lastThermal && lastThermal.alertLevel !== "Normal") {
        alerts += '<span class="thermal-icon" title="NeoTherm flag">&#9670;</span>';
      }
      h += '<tr data-patient-id="' + p.id + '">' +
        '<td><b>' + esc(p.bed) + '</b></td>' +
        '<td>' + esc(p.lastName) + ', ' + esc(p.firstName) + '</td>' +
        '<td>' + esc(p.mrn) + '</td>' +
        '<td>' + esc(p.ga) + '</td>' +
        '<td>' + dol + '</td>' +
        '<td>' + p.currentWeight + 'g</td>' +
        '<td>' + esc(p.dx) + '</td>' +
        '<td><span class="acuity-badge ' + acuityCls + '">' + esc(p.acuity) + '</span></td>' +
        '<td>' + alerts + '</td>' +
        '</tr>';
    });
    h += '</tbody></table>';
    return h;
  }

  /* ═══════════ SYNOPSIS VIEW ═══════════ */
  function renderSynopsis(patient) {
    var lastVitals = patient.vitals[patient.vitals.length - 1];
    var lastThermal = patient.thermal[patient.thermal.length - 1];
    var h = '<div class="synopsis-grid">';

    // Active Problems
    h += '<div class="card"><div class="card-header">Active Problems</div><div class="card-body"><table>';
    patient.problems.forEach(function (prob) {
      if (prob.status !== "Active") return;
      h += '<tr><td>' + esc(prob.description) + '</td><td class="problem-icd">' + esc(prob.icd10) + '</td></tr>';
    });
    h += '</table></div></div>';

    // Vitals Snapshot
    var hrClass = lastVitals.hr > 180 ? " crit" : lastVitals.hr > 170 ? " warn" : "";
    var rrClass = lastVitals.rr > 60 ? " crit" : lastVitals.rr > 55 ? " warn" : "";
    var spo2Class = lastVitals.spo2 < 90 ? " crit" : lastVitals.spo2 < 94 ? " warn" : "";
    h += '<div class="card"><div class="card-header">Vitals Snapshot</div><div class="card-body">' +
      '<div class="vitals-grid">' +
        '<div class="vital-item"><div class="vital-label">HR</div><div class="vital-value' + hrClass + '">' + lastVitals.hr + '</div></div>' +
        '<div class="vital-item"><div class="vital-label">RR</div><div class="vital-value' + rrClass + '">' + lastVitals.rr + '</div></div>' +
        '<div class="vital-item"><div class="vital-label">SpO2</div><div class="vital-value' + spo2Class + '">' + lastVitals.spo2 + '%</div></div>' +
        '<div class="vital-item"><div class="vital-label">Temp</div><div class="vital-value">' + lastVitals.temp + '&deg;C</div></div>' +
        '<div class="vital-item"><div class="vital-label">BP</div><div class="vital-value">' + lastVitals.sbp + '/' + lastVitals.dbp + '</div></div>' +
      '</div></div></div>';

    // Active Medications
    h += '<div class="card"><div class="card-header">Active Medications</div><div class="card-body"><table>' +
      '<tr><th>Medication</th><th>Dose</th><th>Route</th><th>Freq</th></tr>';
    patient.meds.forEach(function (med) {
      h += '<tr><td>' + esc(med.name) + '</td><td>' + esc(med.dose) + '</td><td>' + esc(med.route) + '</td><td>' + esc(med.frequency) + '</td></tr>';
    });
    h += '</table></div></div>';

    // Recent Results
    h += '<div class="card"><div class="card-header">Recent Results</div><div class="card-body"><table>' +
      '<tr><th>Test</th><th>Value</th><th>Units</th><th>Range</th></tr>';
    var allResults = [];
    patient.labs.forEach(function (panel) {
      panel.results.forEach(function (r) { allResults.push(r); });
    });
    allResults.sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    allResults.slice(0, 5).forEach(function (r) {
      h += '<tr class="' + flagBg(r.flag) + '"><td>' + esc(r.test) + '</td><td class="' + flagClass(r.flag) + '">' + r.value + '</td><td>' + esc(r.units) + '</td><td class="text-muted">' + esc(r.range) + '</td></tr>';
    });
    h += '</table></div></div>';

    // Allergies
    h += '<div class="card"><div class="card-header">Allergies</div><div class="card-body">';
    patient.allergies.forEach(function (a) {
      var cls = a === "NKDA" ? " nkda" : "";
      h += '<span class="allergy-badge' + cls + '" style="font-size:12px;padding:4px 12px">' + esc(a) + '</span> ';
    });
    h += '</div></div>';

    // Recent Notes
    h += '<div class="card"><div class="card-header">Recent Notes</div><div class="card-body"><table>' +
      '<tr><th>Title</th><th>Author</th><th>Date</th></tr>';
    var sortedNotes = patient.notes.slice().sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    sortedNotes.slice(0, 3).forEach(function (n) {
      h += '<tr><td>' + esc(n.title) + '</td><td class="text-muted">' + esc(n.author) + '</td><td class="text-muted">' + formatDateTime(n.timestamp) + '</td></tr>';
    });
    h += '</table></div></div>';

    // NeoTherm Summary
    h += '<div class="card"><div class="card-header teal">&#9670; NeoTherm Summary</div><div class="card-body">';
    if (lastThermal) {
      var alertCls = lastThermal.alertLevel;
      h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' +
        '<span style="font-size:22px;font-weight:700;color:' + (alertCls === "Normal" ? "#28A745" : alertCls === "Warning" ? "#FFC107" : alertCls === "High" ? "#FD7E14" : "#DC3545") + '">' + lastThermal.cptd + '&deg;C</span>' +
        '<span class="acuity-badge ' + (alertCls === "Normal" ? "" : alertCls === "Warning" ? "" : "iii") + '" style="background:' + (alertCls === "Normal" ? "#D4EDDA" : alertCls === "Warning" ? "#FFF3CD" : alertCls === "High" ? "#FDE8D0" : "#F8D7DA") + ';color:' + (alertCls === "Normal" ? "#155724" : alertCls === "Warning" ? "#856404" : alertCls === "High" ? "#7B3F00" : "#721C24") + '">' + alertCls + '</span>' +
        '</div>';
      h += '<div class="sparkline-container">' + cptdSparkline(patient.thermal, 280, 60) + '</div>';
      h += '<div class="text-muted text-sm" style="text-align:center">6-hour CPTD trend</div>';
    }
    h += '</div></div>';

    h += '</div>';
    return h;
  }

  /* ═══════════ FLOWSHEET VIEW ═══════════ */
  function renderFlowsheet(patient) {
    var readings = patient.vitals.slice(-12);
    var thermalReadings = patient.thermal.slice(-12);
    var h = '<div class="flowsheet-wrap"><table class="flowsheet-table"><thead><tr><td></td>';
    readings.forEach(function (r) {
      h += '<td>' + formatTime(r.timestamp) + '</td>';
    });
    h += '</tr></thead><tbody>';

    // Vitals group
    h += '<tr><td colspan="' + (readings.length + 1) + '" class="group-header">Vitals</td></tr>';
    var vitalParams = [
      { label: "HR (bpm)", key: "hr", lo: 120, hi: 170, clo: 100, chi: 190 },
      { label: "RR (bpm)", key: "rr", lo: 30, hi: 55, clo: 20, chi: 65 },
      { label: "SpO2 (%)", key: "spo2", lo: 92, hi: 100, clo: 88, chi: 101 },
      { label: "Temp (\u00b0C)", key: "temp", lo: 36.3, hi: 37.2, clo: 36.0, chi: 37.5 },
      { label: "SBP (mmHg)", key: "sbp", lo: 45, hi: 75, clo: 40, chi: 85 },
      { label: "DBP (mmHg)", key: "dbp", lo: 25, hi: 45, clo: 20, chi: 55 },
    ];
    vitalParams.forEach(function (vp) {
      h += '<tr><th>' + vp.label + '</th>';
      readings.forEach(function (r) {
        var v = r[vp.key];
        var cls = "";
        if (v < vp.clo || v > vp.chi) cls = " cell-crit";
        else if (v < vp.lo || v > vp.hi) cls = " cell-warn";
        h += '<td class="' + cls + '">' + v + '</td>';
      });
      h += '</tr>';
    });

    // NeoTherm Thermal group
    h += '<tr><td colspan="' + (readings.length + 1) + '" class="group-header teal">NeoTherm Thermal</td></tr>';
    var thermalParams = [
      { label: "CPTD (\u00b0C)", key: "cptd" },
      { label: "Core", key: "coreTemp" },
      { label: "Abdomen", key: "abdomenTemp" },
      { label: "L Hand", key: "leftHand" },
      { label: "R Hand", key: "rightHand" },
      { label: "L Foot", key: "leftFoot" },
      { label: "R Foot", key: "rightFoot" },
      { label: "L Elbow", key: "leftElbow" },
      { label: "R Elbow", key: "rightElbow" },
      { label: "L Knee", key: "leftKnee" },
      { label: "R Knee", key: "rightKnee" },
    ];
    thermalParams.forEach(function (tp) {
      h += '<tr><th>' + tp.label + '</th>';
      thermalReadings.forEach(function (r) {
        var v = r[tp.key];
        var style = '';
        if (tp.key !== "cptd") {
          var bg = tempToColor(v);
          style = ' style="background:' + bg + '22;color:' + bg + ';font-weight:600"';
        } else {
          var cls = "";
          if (v >= 3) cls = " cell-crit";
          else if (v >= 2) cls = " cell-warn";
          style = cls ? ' class="' + cls + '"' : '';
        }
        h += '<td' + style + '>' + v + '</td>';
      });
      h += '</tr>';
    });

    h += '</tbody></table></div>';
    return h;
  }

  /* ═══════════ RESULTS VIEW ═══════════ */
  function renderResults(patient) {
    var h = '<div class="view-header">Results Review</div><div style="padding:8px 0">';
    patient.labs.forEach(function (panel) {
      h += '<div class="results-panel">' +
        '<div class="results-panel-header">&#9654; ' + esc(panel.panel) + '</div>' +
        '<div class="results-panel-body">';
      panel.results.forEach(function (r) {
        h += '<div class="results-row' + flagBg(r.flag) + '">' +
          '<span class="test-name">' + esc(r.test) + '</span>' +
          '<span class="' + flagClass(r.flag) + '">' + r.value + (r.flag && r.flag !== "Pending" ? ' <b>' + r.flag + '</b>' : '') + '</span>' +
          '<span class="text-muted">' + esc(r.units) + '</span>' +
          '<span class="text-muted">' + esc(r.range) + '</span>' +
          '<span class="text-muted text-sm">' + formatDateTime(r.timestamp) + '</span>' +
          '</div>';
      });
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  }

  /* ═══════════ ORDERS VIEW ═══════════ */
  function renderOrders(patient) {
    var h = '<div class="view-header">Active Orders <button class="btn btn-primary btn-sm" data-toggle-order-form style="margin-left:12px">+ New Order</button></div>';

    if (state.orderFormVisible) {
      h += '<div class="order-entry"><h3>New Order Entry</h3>' +
        '<input class="order-search" type="text" placeholder="Search order catalog..." data-order-search />' +
        '<div class="order-results" id="order-catalog-results">';
      var query = (state.orderSearchQuery || "").toLowerCase();
      if (query.length > 0) {
        orderCatalog.forEach(function (oc) {
          if (oc.name.toLowerCase().indexOf(query) !== -1) {
            h += '<div class="order-result-item" data-oc-id="' + oc.id + '">' + esc(oc.name) + ' <span class="cat">' + esc(oc.category) + '</span></div>';
          }
        });
      }
      h += '</div>';
      if (state.orderFormData.name) {
        h += '<div style="margin-bottom:6px;font-weight:600">Selected: ' + esc(state.orderFormData.name) + ' <span class="text-muted">(' + esc(state.orderFormData.category) + ')</span></div>';
        h += '<div class="order-form">' +
          '<label>Dose <input type="text" data-order-dose value="' + esc(state.orderFormData.dose) + '" /></label>' +
          '<label>Route <input type="text" data-order-route value="' + esc(state.orderFormData.route) + '" /></label>' +
          '<label>Frequency <input type="text" data-order-freq value="' + esc(state.orderFormData.frequency) + '" /></label>' +
          '</div>';
        h += '<div style="margin-top:10px"><button class="btn btn-primary" data-sign-order="' + patient.id + '">Sign Order</button> <button class="btn btn-text" data-toggle-order-form>Cancel</button></div>';
      }
      h += '</div>';
    }

    h += '<table class="data-table"><thead><tr>' +
      '<th>Order</th><th>Category</th><th>Status</th><th>Priority</th><th>Ordered By</th><th>Date</th>' +
      '</tr></thead><tbody>';
    patient.orders.forEach(function (o) {
      h += '<tr>' +
        '<td>' + esc(o.order) + '</td>' +
        '<td>' + esc(o.category) + '</td>' +
        '<td>' + esc(o.status) + '</td>' +
        '<td>' + esc(o.priority) + '</td>' +
        '<td class="text-muted">' + esc(o.orderedBy) + '</td>' +
        '<td class="text-muted">' + formatDateTime(o.date) + '</td>' +
        '</tr>';
    });
    h += '</tbody></table>';
    return h;
  }

  /* ═══════════ MAR VIEW ═══════════ */
  function renderMAR(patient) {
    var h = '<div class="view-header">Medication Administration Record</div>';
    h += '<div class="mar-wrap"><table class="mar-table"><thead><tr><th>Medication</th>';
    // Collect all times
    var allTimes = [];
    patient.meds.forEach(function (med) {
      med.mar.forEach(function (entry) {
        if (allTimes.indexOf(entry.time) === -1) allTimes.push(entry.time);
      });
    });
    allTimes.sort(function (a, b) { return new Date(a) - new Date(b); });
    allTimes.forEach(function (t) {
      h += '<td>' + formatTime(t) + '<br><span class="text-muted text-sm">' + formatDate(t) + '</span></td>';
    });
    h += '</tr></thead><tbody>';

    patient.meds.forEach(function (med, mIdx) {
      h += '<tr><th>' + esc(med.name) + '<br><span class="text-muted text-sm">' + esc(med.dose) + ' ' + esc(med.route) + ' ' + esc(med.frequency) + '</span></th>';
      allTimes.forEach(function (t) {
        var entry = null;
        for (var i = 0; i < med.mar.length; i++) {
          if (med.mar[i].time === t) { entry = med.mar[i]; break; }
        }
        if (!entry) {
          h += '<td></td>';
        } else {
          var isLate = entry.status === "scheduled" && new Date(entry.time) < NOW;
          var icon, cls, clickable = "";
          if (entry.status === "given") {
            icon = "\u2713"; cls = "given";
          } else if (isLate) {
            icon = "!"; cls = "late"; clickable = " clickable";
          } else {
            icon = "\u25CB"; cls = "scheduled"; clickable = " clickable";
          }
          h += '<td class="mar-cell ' + cls + clickable + '" data-mar-med="' + mIdx + '" data-mar-time="' + esc(t) + '">' + icon + '</td>';
        }
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  /* ═══════════ NOTES VIEW ═══════════ */
  function renderNotes(patient) {
    var h = '<div class="view-header">Notes <button class="btn btn-primary btn-sm" data-toggle-note-form style="margin-left:12px">+ New Note</button></div>';

    if (state.noteFormVisible) {
      h += '<div class="note-form"><h3>New Note</h3>' +
        '<select data-note-template>' +
          '<option value="Progress Note">Progress Note</option>' +
          '<option value="Nursing Assessment">Nursing Assessment</option>' +
          '<option value="Procedure Note">Procedure Note</option>' +
        '</select>' +
        '<textarea placeholder="Enter note text..." data-note-text></textarea>' +
        '<button class="btn btn-primary" data-save-note="' + patient.id + '">Save Note</button> ' +
        '<button class="btn btn-text" data-toggle-note-form>Cancel</button>' +
      '</div>';
    }

    h += '<div class="notes-list">';
    var sorted = patient.notes.slice().sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    sorted.forEach(function (n) {
      var open = state.expandedNotes[n.id] ? " open" : "";
      h += '<div class="note-item">' +
        '<div class="note-item-header" data-toggle-note="' + n.id + '">' +
          '<span class="note-type-badge">' + esc(n.type) + '</span>' +
          '<span class="note-title">' + esc(n.title) + '</span>' +
          '<span class="note-status">' + esc(n.status) + '</span>' +
          '<span class="note-meta">' + esc(n.author) + ' &middot; ' + formatDateTime(n.timestamp) + '</span>' +
        '</div>' +
        '<div class="note-body' + open + '">' + esc(n.body) + '</div>' +
      '</div>';
    });
    h += '</div>';
    return h;
  }

  /* ═══════════ PROBLEMS VIEW ═══════════ */
  function renderProblems(patient) {
    var active = patient.problems.filter(function (p) { return p.status === "Active"; });
    var resolved = patient.problems.filter(function (p) { return p.status === "Resolved"; });
    var h = '<div class="view-header">Problem List</div><div class="problems-section">';
    h += '<h3>Active Problems</h3>';
    active.forEach(function (p) {
      h += '<div class="problem-row">' +
        '<span>' + esc(p.description) + '</span>' +
        '<span class="problem-icd">' + esc(p.icd10) + '</span>' +
        '<span class="problem-onset">' + formatDate(p.onset) + '</span>' +
        '<span class="text-muted text-sm">' + esc(p.notedBy) + '</span>' +
        '</div>';
    });
    if (resolved.length) {
      h += '<h3>Resolved Problems</h3>';
      resolved.forEach(function (p) {
        h += '<div class="problem-row">' +
          '<span>' + esc(p.description) + '</span>' +
          '<span class="problem-icd">' + esc(p.icd10) + '</span>' +
          '<span class="problem-onset">' + formatDate(p.onset) + '</span>' +
          '<span class="text-muted text-sm">' + esc(p.notedBy) + '</span>' +
          '</div>';
      });
    }
    h += '</div>';
    return h;
  }

  /* ═══════════ IMAGING VIEW ═══════════ */
  function renderImaging(patient) {
    var h = '<div class="view-header">Imaging Studies</div><div class="imaging-list">';
    if (!patient.imaging || !patient.imaging.length) {
      h += '<div class="p-20 text-muted">No imaging studies on file.</div>';
    } else {
      patient.imaging.forEach(function (img) {
        var open = state.expandedImaging[img.id] ? " open" : "";
        var statusCls = img.status.toLowerCase().replace(/\s/g, "");
        h += '<div class="imaging-item">' +
          '<div class="imaging-header" data-toggle-imaging="' + img.id + '">' +
            '<span class="modality-badge">' + esc(img.modality) + '</span>' +
            '<span style="font-weight:600">' + esc(img.bodyPart) + '</span>' +
            '<span class="text-muted text-sm">' + formatDateTime(img.date) + '</span>' +
            '<span class="status-badge ' + statusCls + '">' + esc(img.status) + '</span>' +
            '<span class="text-muted text-sm" style="margin-left:auto">' + esc(img.orderedBy) + '</span>' +
          '</div>' +
          '<div class="imaging-report' + open + '">' + esc(img.report) + '</div>' +
        '</div>';
      });
    }
    h += '</div>';
    return h;
  }

  /* ═══════════ NEOTHERM WIDGET ═══════════ */
  function renderNeoTherm(patient) {
    var last = patient.thermal[patient.thermal.length - 1];
    if (!last) return '<div class="p-20 text-muted">No NeoTherm data available.</div>';

    var level = last.alertLevel;
    var h = '<div class="neotherm-section">';

    // Alert banner
    h += '<div class="neotherm-alert-banner ' + level + '">' +
      '<span style="font-size:20px">' + (level === "Normal" ? "\u2714" : level === "Warning" ? "\u26A0" : "\u26A0") + '</span>' +
      'NeoTherm Status: ' + level + ' &mdash; CPTD ' + last.cptd + '&deg;C</div>';

    h += '<div class="neotherm-grid">';

    // Heatmap card
    h += '<div class="neotherm-heatmap-card"><h4>Thermal Heatmap</h4>';
    h += buildHeatmapSVG(last);
    h += '</div>';

    // CPTD Trend Chart card
    h += '<div class="neotherm-chart-card"><h4>CPTD Trend (12 hours)</h4>' +
      '<canvas id="cptd-canvas" width="500" height="200" style="width:100%;max-width:500px;height:200px"></canvas>' +
      '</div>';

    h += '</div>'; // close grid

    // Zone Temperature Table
    h += '<div class="neotherm-zone-table"><table><thead><tr><th>Zone</th><th>Current Temp</th><th>Status</th></tr></thead><tbody>';
    var zones = [
      { label: "Core", val: last.coreTemp },
      { label: "Abdomen", val: last.abdomenTemp },
      { label: "Left Hand", val: last.leftHand },
      { label: "Right Hand", val: last.rightHand },
      { label: "Left Foot", val: last.leftFoot },
      { label: "Right Foot", val: last.rightFoot },
      { label: "Left Elbow", val: last.leftElbow },
      { label: "Right Elbow", val: last.rightElbow },
      { label: "Left Knee", val: last.leftKnee },
      { label: "Right Knee", val: last.rightKnee },
    ];
    zones.forEach(function (z) {
      var status = z.val >= 36 ? "Normal" : z.val >= 34 ? "Cool" : z.val >= 32 ? "Cold" : "Very Cold";
      var statusColor = z.val >= 36 ? "#28A745" : z.val >= 34 ? "#FFC107" : z.val >= 32 ? "#FD7E14" : "#DC3545";
      h += '<tr><td>' + z.label + '</td><td style="color:' + tempToColor(z.val) + ';font-weight:700">' + z.val + '&deg;C</td><td style="color:' + statusColor + ';font-weight:600">' + status + '</td></tr>';
    });
    h += '</tbody></table></div>';

    h += '<span class="neotherm-link">View Full NeoTherm Dashboard &rarr;</span>';
    h += '</div>';
    return h;
  }

  /* ═══════════ HEATMAP SVG ═══════════ */
  function buildHeatmapSVG(thermal) {
    var w = 250, ht = 400;
    var svg = '<svg width="' + w + '" height="' + ht + '" viewBox="0 0 250 400" xmlns="http://www.w3.org/2000/svg">';

    // Head (no temp coloring)
    svg += '<ellipse cx="125" cy="48" rx="28" ry="32" fill="#F0E6D6" stroke="#CCC" stroke-width="1"/>';

    // Neck
    svg += '<rect x="117" y="78" width="16" height="14" rx="3" fill="#DDD"/>';

    // Torso/Core
    svg += '<rect id="zone-core" x="85" y="90" width="80" height="80" rx="12" fill="' + tempToColor(thermal.coreTemp) + '" opacity="0.8" stroke="' + tempToColor(thermal.coreTemp) + '" stroke-width="1"/>';

    // Abdomen
    svg += '<rect id="zone-abdomen" x="88" y="170" width="74" height="55" rx="10" fill="' + tempToColor(thermal.abdomenTemp) + '" opacity="0.8" stroke="' + tempToColor(thermal.abdomenTemp) + '" stroke-width="1"/>';

    // Upper arms (neutral gray connectors)
    svg += '<rect x="55" y="100" width="30" height="10" rx="4" fill="#DDD"/>';  // left upper arm
    svg += '<rect x="165" y="100" width="30" height="10" rx="4" fill="#DDD"/>'; // right upper arm

    // Left Elbow
    svg += '<circle id="zone-left-elbow" cx="46" cy="130" r="9" fill="' + tempToColor(thermal.leftElbow) + '" stroke="' + tempToColor(thermal.leftElbow) + '" stroke-width="1" opacity="0.85"/>';
    // Right Elbow
    svg += '<circle id="zone-right-elbow" cx="204" cy="130" r="9" fill="' + tempToColor(thermal.rightElbow) + '" stroke="' + tempToColor(thermal.rightElbow) + '" stroke-width="1" opacity="0.85"/>';

    // Forearms (neutral connectors)
    svg += '<rect x="40" y="106" width="8" height="24" rx="3" fill="#DDD"/>';
    svg += '<rect x="200" y="106" width="8" height="24" rx="3" fill="#DDD"/>';

    // Lower arms
    svg += '<rect x="38" y="139" width="10" height="28" rx="3" fill="#DDD"/>';
    svg += '<rect x="198" y="139" width="10" height="28" rx="3" fill="#DDD"/>';

    // Left Hand
    svg += '<circle id="zone-left-hand" cx="43" cy="178" r="11" fill="' + tempToColor(thermal.leftHand) + '" stroke="' + tempToColor(thermal.leftHand) + '" stroke-width="1" opacity="0.85"/>';
    // Right Hand
    svg += '<circle id="zone-right-hand" cx="205" cy="178" r="11" fill="' + tempToColor(thermal.rightHand) + '" stroke="' + tempToColor(thermal.rightHand) + '" stroke-width="1" opacity="0.85"/>';

    // Upper legs (neutral connectors)
    svg += '<rect x="96" y="225" width="16" height="50" rx="6" fill="#DDD"/>';
    svg += '<rect x="138" y="225" width="16" height="50" rx="6" fill="#DDD"/>';

    // Left Knee
    svg += '<circle id="zone-left-knee" cx="104" cy="288" r="10" fill="' + tempToColor(thermal.leftKnee) + '" stroke="' + tempToColor(thermal.leftKnee) + '" stroke-width="1" opacity="0.85"/>';
    // Right Knee
    svg += '<circle id="zone-right-knee" cx="146" cy="288" r="10" fill="' + tempToColor(thermal.rightKnee) + '" stroke="' + tempToColor(thermal.rightKnee) + '" stroke-width="1" opacity="0.85"/>';

    // Lower legs
    svg += '<rect x="98" y="298" width="12" height="45" rx="4" fill="#DDD"/>';
    svg += '<rect x="140" y="298" width="12" height="45" rx="4" fill="#DDD"/>';

    // Left Foot
    svg += '<ellipse id="zone-left-foot" cx="104" cy="358" rx="14" ry="10" fill="' + tempToColor(thermal.leftFoot) + '" stroke="' + tempToColor(thermal.leftFoot) + '" stroke-width="1" opacity="0.85"/>';
    // Right Foot
    svg += '<ellipse id="zone-right-foot" cx="146" cy="358" rx="14" ry="10" fill="' + tempToColor(thermal.rightFoot) + '" stroke="' + tempToColor(thermal.rightFoot) + '" stroke-width="1" opacity="0.85"/>';

    // Labels
    var fontSize = 9;
    svg += '<text x="125" y="135" text-anchor="middle" font-size="' + fontSize + '" fill="#fff" font-weight="700">' + thermal.coreTemp + '°</text>';
    svg += '<text x="125" y="200" text-anchor="middle" font-size="' + fontSize + '" fill="#fff" font-weight="700">' + thermal.abdomenTemp + '°</text>';
    svg += '<text x="43" y="182" text-anchor="middle" font-size="' + (fontSize - 1) + '" fill="#fff" font-weight="700">' + thermal.leftHand + '°</text>';
    svg += '<text x="205" y="182" text-anchor="middle" font-size="' + (fontSize - 1) + '" fill="#fff" font-weight="700">' + thermal.rightHand + '°</text>';
    svg += '<text x="104" y="362" text-anchor="middle" font-size="' + (fontSize - 1) + '" fill="#fff" font-weight="700">' + thermal.leftFoot + '°</text>';
    svg += '<text x="146" y="362" text-anchor="middle" font-size="' + (fontSize - 1) + '" fill="#fff" font-weight="700">' + thermal.rightFoot + '°</text>';

    // Legend
    svg += '<rect x="10" y="382" width="230" height="14" rx="3" fill="url(#tempGrad)"/>';
    svg += '<defs><linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#3B82F6"/>' +
      '<stop offset="40%" stop-color="#22C55E"/>' +
      '<stop offset="80%" stop-color="#EAB308"/>' +
      '<stop offset="100%" stop-color="#EF4444"/>' +
      '</linearGradient></defs>';
    svg += '<text x="10" y="379" font-size="8" fill="#888">32°C</text>';
    svg += '<text x="105" y="379" font-size="8" fill="#888">34°</text>';
    svg += '<text x="195" y="379" font-size="8" fill="#888">36°</text>';
    svg += '<text x="230" y="379" font-size="8" fill="#888">37°+</text>';

    svg += '</svg>';
    return svg;
  }

  /* ═══════════ CPTD CANVAS CHART ═══════════ */
  function drawCPTDChart(patient) {
    var canvas = document.getElementById("cptd-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 500, H = 200;
    canvas.width = W;
    canvas.height = H;

    var padL = 40, padR = 10, padT = 10, padB = 28;
    var cW = W - padL - padR;
    var cH = H - padT - padB;

    // Background threshold bands
    var bands = [
      { y0: 0, y1: 1, color: "rgba(40,167,69,0.15)" },
      { y0: 1, y1: 2, color: "rgba(255,193,7,0.15)" },
      { y0: 2, y1: 3, color: "rgba(253,126,20,0.15)" },
      { y0: 3, y1: 5, color: "rgba(220,53,69,0.12)" },
    ];
    var maxY = 5;
    bands.forEach(function (b) {
      var top = padT + cH - (b.y1 / maxY) * cH;
      var bot = padT + cH - (b.y0 / maxY) * cH;
      ctx.fillStyle = b.color;
      ctx.fillRect(padL, top, cW, bot - top);
    });

    // Grid lines
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= maxY; i++) {
      var gy = padT + cH - (i / maxY) * cH;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
      ctx.fillStyle = "#888";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(i + "°C", padL - 4, gy + 3);
    }

    // Data
    var data = patient.thermal;
    if (data.length < 2) return;
    var t0 = new Date(data[0].timestamp).getTime();
    var t1 = new Date(data[data.length - 1].timestamp).getTime();
    var tRange = t1 - t0 || 1;

    // Plot line
    ctx.strokeStyle = "#00B4D8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach(function (d, idx) {
      var x = padL + ((new Date(d.timestamp).getTime() - t0) / tRange) * cW;
      var y = padT + cH - (Math.min(d.cptd, maxY) / maxY) * cH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    ctx.fillStyle = "#00B4D8";
    data.forEach(function (d) {
      var x = padL + ((new Date(d.timestamp).getTime() - t0) / tRange) * cW;
      var y = padT + cH - (Math.min(d.cptd, maxY) / maxY) * cH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // X-axis labels (first, middle, last)
    ctx.fillStyle = "#888";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(formatTime(data[0].timestamp), padL, H - 4);
    var midIdx = Math.floor(data.length / 2);
    var mx = padL + ((new Date(data[midIdx].timestamp).getTime() - t0) / tRange) * cW;
    ctx.fillText(formatTime(data[midIdx].timestamp), mx, H - 4);
    ctx.fillText(formatTime(data[data.length - 1].timestamp), W - padR, H - 4);
  }

  /* ═══════════ MAIN RENDER ═══════════ */
  function render() {
    renderTopBar();
    renderTabBar();
    renderNavigator();

    var content = document.getElementById("content");
    var activeTab = getActiveTab();

    if (activeTab.type === "census") {
      content.innerHTML = renderCensus();
      return;
    }

    var patient = getPatient(activeTab.patientId);
    if (!patient) {
      content.innerHTML = '<div class="p-20 text-muted">Patient not found.</div>';
      return;
    }

    var h = renderStoryboard(patient);

    switch (state.activeNav) {
      case "Summary":
        h += renderSynopsis(patient);
        break;
      case "Notes":
        h += renderNotes(patient);
        break;
      case "Results":
        h += renderResults(patient);
        break;
      case "Orders":
        h += renderOrders(patient);
        break;
      case "MAR":
        h += renderMAR(patient);
        break;
      case "Flowsheets":
        h += renderFlowsheet(patient);
        break;
      case "Problems":
        h += renderProblems(patient);
        break;
      case "Imaging":
        h += renderImaging(patient);
        break;
      case "NeoTherm":
        h += renderNeoTherm(patient);
        break;
      default:
        h += '<div class="p-20">View not found.</div>';
    }

    content.innerHTML = h;

    // Draw canvas chart if NeoTherm view
    if (state.activeNav === "NeoTherm") {
      setTimeout(function () { drawCPTDChart(patient); }, 0);
    }
  }

  /* ═══════════ EVENT DELEGATION ═══════════ */

  // Tab bar clicks
  document.getElementById("tabbar").addEventListener("click", function (e) {
    var closeBtn = e.target.closest("[data-close-tab]");
    if (closeBtn) {
      e.stopPropagation();
      closeTab(closeBtn.getAttribute("data-close-tab"));
      return;
    }
    var tab = e.target.closest("[data-tab-id]");
    if (tab) {
      switchTab(tab.getAttribute("data-tab-id"));
    }
  });

  // Navigator clicks
  document.getElementById("navigator").addEventListener("click", function (e) {
    var item = e.target.closest("[data-nav]");
    if (item) {
      state.activeNav = item.getAttribute("data-nav");
      state.orderFormVisible = false;
      state.noteFormVisible = false;
      render();
    }
  });

  // Content area clicks
  document.getElementById("content").addEventListener("click", function (e) {
    // Census row click
    var row = e.target.closest("[data-patient-id]");
    if (row) {
      openPatientTab(parseInt(row.getAttribute("data-patient-id")));
      return;
    }

    // Storyboard toggle
    if (e.target.closest("[data-sb-toggle]")) {
      state.storyboardCollapsed = !state.storyboardCollapsed;
      render();
      return;
    }

    // Note expand
    var noteToggle = e.target.closest("[data-toggle-note]");
    if (noteToggle) {
      var nid = parseInt(noteToggle.getAttribute("data-toggle-note"));
      state.expandedNotes[nid] = !state.expandedNotes[nid];
      render();
      return;
    }

    // Imaging expand
    var imgToggle = e.target.closest("[data-toggle-imaging]");
    if (imgToggle) {
      var iid = parseInt(imgToggle.getAttribute("data-toggle-imaging"));
      state.expandedImaging[iid] = !state.expandedImaging[iid];
      render();
      return;
    }

    // Order form toggle
    if (e.target.closest("[data-toggle-order-form]")) {
      state.orderFormVisible = !state.orderFormVisible;
      state.orderFormData = { name: "", dose: "", route: "", frequency: "", category: "" };
      state.orderSearchQuery = "";
      render();
      return;
    }

    // Order catalog item click
    var ocItem = e.target.closest("[data-oc-id]");
    if (ocItem) {
      var ocId = ocItem.getAttribute("data-oc-id");
      var oc = null;
      for (var i = 0; i < orderCatalog.length; i++) {
        if (orderCatalog[i].id === ocId) { oc = orderCatalog[i]; break; }
      }
      if (oc) {
        state.orderFormData = { name: oc.name, dose: oc.defaultDose, route: oc.defaultRoute, frequency: oc.defaultFrequency, category: oc.category };
        render();
      }
      return;
    }

    // Sign order
    var signBtn = e.target.closest("[data-sign-order]");
    if (signBtn) {
      var pid = parseInt(signBtn.getAttribute("data-sign-order"));
      var pt = getPatient(pid);
      if (pt && state.orderFormData.name) {
        // Read current form values
        var doseEl = document.querySelector("[data-order-dose]");
        var routeEl = document.querySelector("[data-order-route]");
        var freqEl = document.querySelector("[data-order-freq]");
        var orderText = state.orderFormData.name;
        if (doseEl && doseEl.value) orderText += " " + doseEl.value;
        if (routeEl && routeEl.value) orderText += " " + routeEl.value;
        if (freqEl && freqEl.value) orderText += " " + freqEl.value;
        pt.orders.unshift({
          id: Date.now(),
          order: orderText,
          category: state.orderFormData.category,
          status: "Ordered",
          priority: "Routine",
          orderedBy: "Dr. Martinez",
          date: NOW.toISOString(),
        });
        state.orderFormVisible = false;
        state.orderFormData = { name: "", dose: "", route: "", frequency: "", category: "" };
        render();
      }
      return;
    }

    // Note form toggle
    if (e.target.closest("[data-toggle-note-form]")) {
      state.noteFormVisible = !state.noteFormVisible;
      render();
      return;
    }

    // Save note
    var saveNoteBtn = e.target.closest("[data-save-note]");
    if (saveNoteBtn) {
      var ptId = parseInt(saveNoteBtn.getAttribute("data-save-note"));
      var ptN = getPatient(ptId);
      if (ptN) {
        var tmplEl = document.querySelector("[data-note-template]");
        var textEl = document.querySelector("[data-note-text]");
        var tmpl = tmplEl ? tmplEl.value : "Progress Note";
        var text = textEl ? textEl.value : "";
        if (text.trim()) {
          ptN.notes.push({
            id: Date.now(),
            title: tmpl,
            type: tmpl,
            author: "Dr. Martinez, MD",
            status: "Signed",
            timestamp: NOW.toISOString(),
            body: text,
          });
          state.noteFormVisible = false;
          render();
        }
      }
      return;
    }

    // MAR cell click
    var marCell = e.target.closest("[data-mar-med]");
    if (marCell && (marCell.classList.contains("scheduled") || marCell.classList.contains("late"))) {
      var activeTab2 = getActiveTab();
      if (activeTab2.patientId) {
        var ptM = getPatient(activeTab2.patientId);
        var mIdx = parseInt(marCell.getAttribute("data-mar-med"));
        var mTime = marCell.getAttribute("data-mar-time");
        if (ptM && ptM.meds[mIdx]) {
          for (var j = 0; j < ptM.meds[mIdx].mar.length; j++) {
            if (ptM.meds[mIdx].mar[j].time === mTime) {
              ptM.meds[mIdx].mar[j].status = "given";
              break;
            }
          }
          render();
        }
      }
      return;
    }
  });

  // Order search input
  document.getElementById("content").addEventListener("input", function (e) {
    if (e.target.matches("[data-order-search]")) {
      state.orderSearchQuery = e.target.value;
      // Rerender just the catalog results
      var resultsDiv = document.getElementById("order-catalog-results");
      if (resultsDiv) {
        var query = e.target.value.toLowerCase();
        var rh = '';
        if (query.length > 0) {
          orderCatalog.forEach(function (oc) {
            if (oc.name.toLowerCase().indexOf(query) !== -1) {
              rh += '<div class="order-result-item" data-oc-id="' + oc.id + '">' + esc(oc.name) + ' <span class="cat">' + esc(oc.category) + '</span></div>';
            }
          });
        }
        resultsDiv.innerHTML = rh;
      }
    }
  });

  // Modal clicks
  document.getElementById("modal-overlay").addEventListener("click", function (e) {
    // Acknowledge
    var ackBtn = e.target.closest("[data-bpa-ack]");
    if (ackBtn) {
      var alertId = ackBtn.getAttribute("data-bpa-ack");
      state.bpaAcknowledged[alertId] = true;
      closeBPA();
      render();
      return;
    }
    // Dismiss
    if (e.target.closest("[data-bpa-dismiss]")) {
      closeBPA();
      return;
    }
    // View NeoTherm
    var viewBtn = e.target.closest("[data-bpa-view]");
    if (viewBtn) {
      state.activeNav = "NeoTherm";
      closeBPA();
      render();
      return;
    }
    // Order Sepsis Workup
    if (e.target.closest("[data-bpa-order]")) {
      closeBPA();
      return;
    }
    // Click backdrop to dismiss
    if (e.target === document.getElementById("modal-overlay")) {
      closeBPA();
    }
  });

  /* ═══════════ INIT ═══════════ */
  render();
})();
