(function () {
  "use strict";

  /* ───────── deterministic PRNG (LCG) ───────── */
  var _seed = 42;
  function rand() {
    _seed = (_seed * 1664525 + 1013904223) & 0x7fffffff;
    return _seed / 0x7fffffff;
  }
  function jitter(v, pct) {
    return v + v * (rand() - 0.5) * 2 * (pct || 0.02);
  }

  /* ───────── time helpers ───────── */
  var NOW = new Date("2026-03-15T14:00:00");
  function hoursAgo(h) {
    return new Date(NOW.getTime() - h * 3600000);
  }
  function daysAgo(d) {
    return new Date(NOW.getTime() - d * 86400000);
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* ───────── generators ───────── */
  function generateVitals(n, startH, hr0, hr1, rr0, rr1, spo0, spo1, temp0, temp1, sbp0, sbp1, dbp0, dbp1) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var ts = new Date(NOW.getTime() - startH * 3600000 + (i * startH * 3600000) / (n - 1));
      out.push({
        timestamp: ts.toISOString(),
        hr: Math.round(jitter(lerp(hr0, hr1, t), 0.02)),
        rr: Math.round(jitter(lerp(rr0, rr1, t), 0.03)),
        spo2: Math.round(Math.min(100, jitter(lerp(spo0, spo1, t), 0.005))),
        temp: +jitter(lerp(temp0, temp1, t), 0.003).toFixed(1),
        sbp: Math.round(jitter(lerp(sbp0, sbp1, t), 0.02)),
        dbp: Math.round(jitter(lerp(dbp0, dbp1, t), 0.02)),
      });
    }
    return out;
  }

  function generateThermal(n, startH, cptd0, cptd1, core0, core1, abd0, abd1, lh0, lh1, rh0, rh1, lf0, lf1, rf0, rf1, le0, le1, re0, re1, lk0, lk1, rk0, rk1) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      var ts = new Date(NOW.getTime() - startH * 3600000 + (i * startH * 3600000) / (n - 1));
      var cptd = +jitter(lerp(cptd0, cptd1, t), 0.02).toFixed(2);
      var level = cptd < 1.0 ? "Normal" : cptd < 2.0 ? "Warning" : cptd < 3.0 ? "High" : "Critical";
      out.push({
        timestamp: ts.toISOString(),
        cptd: cptd,
        alertLevel: level,
        coreTemp: +jitter(lerp(core0, core1, t), 0.002).toFixed(1),
        abdomenTemp: +jitter(lerp(abd0, abd1, t), 0.003).toFixed(1),
        leftHand: +jitter(lerp(lh0, lh1, t), 0.004).toFixed(1),
        rightHand: +jitter(lerp(rh0, rh1, t), 0.004).toFixed(1),
        leftFoot: +jitter(lerp(lf0, lf1, t), 0.005).toFixed(1),
        rightFoot: +jitter(lerp(rf0, rf1, t), 0.005).toFixed(1),
        leftElbow: +jitter(lerp(le0, le1, t), 0.003).toFixed(1),
        rightElbow: +jitter(lerp(re0, re1, t), 0.003).toFixed(1),
        leftKnee: +jitter(lerp(lk0, lk1, t), 0.004).toFixed(1),
        rightKnee: +jitter(lerp(rk0, rk1, t), 0.004).toFixed(1),
      });
    }
    return out;
  }

  /* ───────── Baby Garcia — Developing Sepsis ───────── */
  var garcia = {
    id: 1,
    bed: "1A",
    firstName: "Maya",
    lastName: "Garcia",
    sex: "F",
    mrn: "MRN-2026-00147",
    dob: daysAgo(5).toISOString(),
    ga: "28+3",
    birthWeight: 1050,
    currentWeight: 1020,
    length: 36.5,
    hc: 25.0,
    attending: "Dr. Sarah Chen",
    acuity: "Level III",
    codeStatus: "Full Code",
    allergies: ["NKDA"],
    dx: "R/O Sepsis, RDS",
    vitals: generateVitals(25, 12, 150, 178, 42, 56, 97, 93, 36.7, 36.9, 58, 64, 32, 36),
    thermal: generateThermal(25, 12,
      0.8, 3.2,   // cptd
      36.8, 36.8,  // core
      36.2, 36.0,  // abdomen
      34.5, 32.8,  // left hand
      34.6, 32.9,  // right hand
      33.8, 31.5,  // left foot
      33.9, 31.6,  // right foot
      35.0, 33.5,  // left elbow
      35.1, 33.6,  // right elbow
      34.8, 33.0,  // left knee
      34.9, 33.1   // right knee
    ),
    labs: [
      { panel: "C-Reactive Protein", results: [
        { test: "CRP", value: 0.5, units: "mg/dL", range: "0.0-0.5", flag: "", timestamp: hoursAgo(12).toISOString() },
        { test: "CRP", value: 2.1, units: "mg/dL", range: "0.0-0.5", flag: "H", timestamp: hoursAgo(6).toISOString() },
        { test: "CRP", value: 8.4, units: "mg/dL", range: "0.0-0.5", flag: "Critical", timestamp: hoursAgo(2).toISOString() },
      ]},
      { panel: "Complete Blood Count", results: [
        { test: "WBC", value: 18.5, units: "x10³/µL", range: "5.0-15.0", flag: "H", timestamp: hoursAgo(4).toISOString() },
        { test: "Hemoglobin", value: 14.2, units: "g/dL", range: "13.0-17.0", flag: "", timestamp: hoursAgo(4).toISOString() },
        { test: "Hematocrit", value: 42, units: "%", range: "39-51", flag: "", timestamp: hoursAgo(4).toISOString() },
        { test: "Platelets", value: 210, units: "x10³/µL", range: "150-400", flag: "", timestamp: hoursAgo(4).toISOString() },
        { test: "Bands", value: 12, units: "%", range: "0-5", flag: "H", timestamp: hoursAgo(4).toISOString() },
        { test: "I:T Ratio", value: 0.25, units: "", range: "0.00-0.12", flag: "H", timestamp: hoursAgo(4).toISOString() },
      ]},
      { panel: "Basic Metabolic Panel", results: [
        { test: "Sodium", value: 140, units: "mEq/L", range: "136-145", flag: "", timestamp: hoursAgo(4).toISOString() },
        { test: "Potassium", value: 4.5, units: "mEq/L", range: "3.5-5.0", flag: "", timestamp: hoursAgo(4).toISOString() },
        { test: "Glucose", value: 72, units: "mg/dL", range: "45-100", flag: "", timestamp: hoursAgo(4).toISOString() },
        { test: "BUN", value: 12, units: "mg/dL", range: "5-20", flag: "", timestamp: hoursAgo(4).toISOString() },
        { test: "Creatinine", value: 0.6, units: "mg/dL", range: "0.2-0.9", flag: "", timestamp: hoursAgo(4).toISOString() },
      ]},
      { panel: "Blood Gas", results: [
        { test: "pH", value: 7.34, units: "", range: "7.35-7.45", flag: "L", timestamp: hoursAgo(3).toISOString() },
        { test: "pCO₂", value: 42, units: "mmHg", range: "35-45", flag: "", timestamp: hoursAgo(3).toISOString() },
        { test: "pO₂", value: 62, units: "mmHg", range: "60-80", flag: "", timestamp: hoursAgo(3).toISOString() },
        { test: "HCO₃", value: 22, units: "mEq/L", range: "22-26", flag: "", timestamp: hoursAgo(3).toISOString() },
      ]},
      { panel: "Microbiology", results: [
        { test: "Blood Culture", value: "Pending", units: "", range: "", flag: "Pending", timestamp: hoursAgo(4).toISOString() },
      ]},
    ],
    meds: [
      { name: "Ampicillin", dose: "50 mg", route: "IV", frequency: "q12h", startDate: hoursAgo(4).toISOString(),
        mar: [
          { time: hoursAgo(4).toISOString(), status: "given" },
          { time: hoursAgo(4 - 12).toISOString(), status: "scheduled" },
        ]},
      { name: "Gentamicin", dose: "4 mg", route: "IV", frequency: "q36h", startDate: hoursAgo(4).toISOString(),
        mar: [
          { time: hoursAgo(4).toISOString(), status: "given" },
          { time: new Date(NOW.getTime() + 32 * 3600000).toISOString(), status: "scheduled" },
        ]},
      { name: "Caffeine Citrate", dose: "5 mg", route: "PO", frequency: "Daily", startDate: daysAgo(5).toISOString(),
        mar: [
          { time: hoursAgo(2).toISOString(), status: "given" },
          { time: new Date(NOW.getTime() + 22 * 3600000).toISOString(), status: "scheduled" },
        ]},
      { name: "TPN", dose: "80 mL/day", route: "IV", frequency: "Continuous", startDate: daysAgo(5).toISOString(),
        mar: [
          { time: hoursAgo(0).toISOString(), status: "given" },
        ]},
    ],
    orders: [
      { id: 101, order: "Blood Culture x2", category: "Lab", status: "Collected", priority: "STAT", orderedBy: "Dr. Chen", date: hoursAgo(4).toISOString() },
      { id: 102, order: "CBC with Differential", category: "Lab", status: "Completed", priority: "STAT", orderedBy: "Dr. Chen", date: hoursAgo(4).toISOString() },
      { id: 103, order: "CRP", category: "Lab", status: "Active", priority: "Routine", orderedBy: "Dr. Chen", date: hoursAgo(12).toISOString() },
      { id: 104, order: "Basic Metabolic Panel", category: "Lab", status: "Completed", priority: "Routine", orderedBy: "Dr. Chen", date: hoursAgo(4).toISOString() },
      { id: 105, order: "Ampicillin 50mg IV q12h", category: "Medication", status: "Active", priority: "STAT", orderedBy: "Dr. Chen", date: hoursAgo(4).toISOString() },
      { id: 106, order: "Gentamicin 4mg IV q36h", category: "Medication", status: "Active", priority: "STAT", orderedBy: "Dr. Chen", date: hoursAgo(4).toISOString() },
      { id: 107, order: "Continuous Cardiorespiratory Monitoring", category: "Nursing", status: "Active", priority: "Routine", orderedBy: "Dr. Chen", date: daysAgo(5).toISOString() },
      { id: 108, order: "Chest X-Ray AP", category: "Imaging", status: "Completed", priority: "Routine", orderedBy: "Dr. Chen", date: hoursAgo(3).toISOString() },
    ],
    notes: [
      {
        id: 1001, title: "Admission History & Physical", type: "H&P", author: "Dr. Sarah Chen", status: "Signed",
        timestamp: daysAgo(5).toISOString(),
        body: "HISTORY OF PRESENT ILLNESS:\nFemale infant born at 28 weeks and 3 days gestational age via emergent C-section due to severe maternal preeclampsia. Birth weight 1050g (AGA). APGAR scores 5 at 1 minute, 7 at 5 minutes. Required intubation and surfactant administration in the delivery room.\n\nMATERNAL HISTORY:\n28-year-old G2P1 mother. Prenatal labs: GBS negative, rubella immune, HIV negative, HBsAg negative. Received incomplete course of betamethasone (1 dose, 6 hours prior to delivery). No prolonged rupture of membranes.\n\nPHYSICAL EXAMINATION:\nGeneral: Small for gestational age premature female, intubated, on CPAP.\nHEENT: Fontanelles soft and flat. No dysmorphic features.\nChest: Bilateral air entry, mild subcostal retractions.\nCardiovascular: Regular rate and rhythm. No murmurs. Capillary refill 2 seconds.\nAbdomen: Soft, non-distended. Umbilical catheter in place.\nSkin: Thin, translucent. No rashes or lesions.\nNeuro: Age-appropriate tone and reflexes.\n\nASSESSMENT AND PLAN:\n1. Prematurity 28+3 weeks — age-appropriate care, developmental positioning\n2. Respiratory Distress Syndrome — surfactant given, maintain on CPAP, monitor gases\n3. Apnea of Prematurity — caffeine citrate 5mg PO daily\n4. Nutrition — TPN initiated, advance to trophic feeds when stable\n5. Infectious — blood cultures obtained, empiric ampicillin/gentamicin per protocol"
      },
      {
        id: 1002, title: "Progress Note — DOL 5", type: "Progress Note", author: "Dr. Sarah Chen", status: "Signed",
        timestamp: hoursAgo(6).toISOString(),
        body: "SUBJECTIVE:\nDOL 5. Nursing reports increased frequency of apnea/bradycardia episodes overnight. Temperature noted to be labile over the past 6 hours with increasing swings between 36.5-37.2°C. NeoTherm thermal monitoring system flagged rising CPTD values.\n\nOBJECTIVE:\nVitals: HR 168 (up from baseline 150), RR 52, SpO2 94% on CPAP +5, Temp 36.9°C (labile)\nWeight: 1020g (down 30g from birth)\nNeoTherm: CPTD trending from 0.8°C to 2.4°C over 8 hours. Peripheral temperatures dropping — hands 33.1°C, feet 32.0°C. Core temperature maintained at 36.8°C. Pattern consistent with early peripheral vasoconstriction.\n\nLaboratory: CRP rising — 0.5 → 2.1 → 8.4 mg/dL (critical). WBC 18.5 with left shift (12% bands, I:T ratio 0.25). pH 7.34 (mild acidosis).\n\nASSESSMENT:\n1. Clinical concern for early-onset neonatal sepsis — rising inflammatory markers, tachycardia, temperature instability, and NeoTherm CPTD elevation consistent with peripheral vasoconstriction\n2. RDS — stable on current support\n3. Apnea of prematurity — increased events may be sepsis-related\n\nPLAN:\n1. Obtain blood cultures x2, start empiric antibiotics (ampicillin + gentamicin)\n2. Serial CRP q6h, CBC in AM\n3. Continue NeoTherm monitoring with q30min thermal assessments\n4. Increase monitoring frequency\n5. Chest X-ray to evaluate for pneumonia\n6. Maintain IV fluids, hold advancement of feeds\n7. Update parents on clinical status change"
      },
      {
        id: 1003, title: "Nursing Assessment", type: "Nursing Note", author: "RN Sarah Johnson", status: "Signed",
        timestamp: hoursAgo(8).toISOString(),
        body: "ASSESSMENT:\nNeoTherm bedside monitor alarmed at 0600 for CPTD exceeding 2.0°C threshold. Visual inspection of thermal heatmap showed significant cooling of bilateral hands and feet with maintained core temperature. Infant appeared mottled with prolonged capillary refill (3-4 seconds in extremities).\n\nINTERVENTIONS:\n1. Notified Dr. Chen of NeoTherm alert and clinical findings\n2. Obtained stat labs per physician order (CBC, CRP, blood cultures x2, BMP, blood gas)\n3. Administered Ampicillin 50mg IV per order at 1000\n4. Administered Gentamicin 4mg IV per order at 1000\n5. Increased isolette temperature by 0.5°C\n6. Repositioned infant and performed skin assessment\n7. Continued continuous cardiorespiratory monitoring\n8. Parents called and updated on change in condition\n\nCURRENT STATUS:\nInfant tachycardic (HR 170s), mildly tachypneic. Color slightly pale with mottling of extremities. NeoTherm CPTD continues to trend upward. Will continue close monitoring and report any further changes."
      },
    ],
    problems: [
      { description: "Extreme prematurity, 28 completed weeks", icd10: "P07.26", onset: daysAgo(5).toISOString(), notedBy: "Dr. Chen", status: "Active" },
      { description: "Respiratory Distress Syndrome", icd10: "P22.0", onset: daysAgo(5).toISOString(), notedBy: "Dr. Chen", status: "Active" },
      { description: "Rule out neonatal sepsis", icd10: "P36.9", onset: hoursAgo(6).toISOString(), notedBy: "Dr. Chen", status: "Active" },
      { description: "Apnea of prematurity", icd10: "P28.4", onset: daysAgo(4).toISOString(), notedBy: "Dr. Chen", status: "Active" },
    ],
    imaging: [
      {
        id: 2001, modality: "X-Ray", bodyPart: "Chest AP", date: daysAgo(5).toISOString(), status: "Read",
        orderedBy: "Dr. Chen",
        report: "CHEST X-RAY, AP VIEW\n\nCLINICAL INDICATION: Premature infant, respiratory distress.\n\nFINDINGS:\nEndotracheal tube tip projects at the level of T2, in satisfactory position. Umbilical venous catheter tip at the T8-T9 level. Umbilical arterial catheter tip at L3-L4 level.\n\nLungs demonstrate diffuse, bilateral ground-glass opacification with air bronchograms, consistent with surfactant deficiency/RDS. No focal consolidation. No pneumothorax.\n\nCardiac silhouette is normal in size. Mediastinal contours are normal.\n\nIMPRESSION:\n1. Findings consistent with Respiratory Distress Syndrome (hyaline membrane disease)\n2. Lines and tubes in satisfactory position"
      },
      {
        id: 2002, modality: "X-Ray", bodyPart: "Chest AP", date: hoursAgo(3).toISOString(), status: "Read",
        orderedBy: "Dr. Chen",
        report: "CHEST X-RAY, AP VIEW\n\nCLINICAL INDICATION: Premature infant with rising inflammatory markers, rule out pneumonia.\n\nCOMPARISON: Prior chest radiograph from 5 days ago.\n\nFINDINGS:\nPrevious ground-glass opacification has largely resolved. New bilateral patchy opacities noted in the right lower lobe and left lingula, concerning for developing pneumonia in the clinical context of rising inflammatory markers. Small bilateral pleural effusions cannot be excluded.\n\nNo pneumothorax. Cardiac silhouette remains normal. CPAP prongs noted in place.\n\nIMPRESSION:\n1. New bilateral patchy opacities, possibly early pneumonia — correlate clinically\n2. Interval improvement of prior RDS findings\n3. Possible small bilateral pleural effusions"
      },
    ],
    bpaAlerts: [
      {
        id: "bpa-garcia-1",
        alertType: "neotherm_cptd",
        title: "NeoTherm Screening Alert \u2014 Elevated CPTD Detected",
        summary: "NeoTherm continuous thermal monitoring has detected a Core-to-Peripheral Temperature Difference (CPTD) \u2265 2.0\u00b0C sustained for over 4 hours. Current CPTD is 3.2\u00b0C, indicating significant peripheral vasoconstriction. This pattern has been associated with early neonatal sepsis in published studies (sensitivity 89%, specificity 82%). Recommend immediate clinical assessment and consideration of sepsis workup if not already initiated.",
        cptdValue: 3.2,
        triggeredAt: hoursAgo(2).toISOString(),
      },
    ],
  };

  /* ───────── Baby Thompson — Developing NEC ───────── */
  var thompson = {
    id: 2,
    bed: "2C",
    firstName: "James",
    lastName: "Thompson",
    sex: "M",
    mrn: "MRN-2026-00152",
    dob: daysAgo(3).toISOString(),
    ga: "32+1",
    birthWeight: 1680,
    currentWeight: 1640,
    length: 42,
    hc: 29.5,
    attending: "Dr. Michael Patel",
    acuity: "Level III",
    codeStatus: "Full Code",
    allergies: ["NKDA"],
    dx: "Suspected NEC",
    vitals: generateVitals(25, 12, 160, 182, 48, 64, 96, 92, 36.3, 36.0, 62, 56, 34, 30),
    thermal: generateThermal(25, 12,
      1.0, 2.8,
      36.5, 36.5,
      36.0, 34.8,
      34.2, 32.5,
      34.3, 32.6,
      33.5, 31.2,
      33.6, 31.3,
      35.0, 33.8,
      35.1, 33.9,
      34.5, 33.0,
      34.6, 33.1
    ),
    labs: [
      { panel: "Blood Gas", results: [
        { test: "pH", value: 7.28, units: "", range: "7.35-7.45", flag: "Critical", timestamp: hoursAgo(2).toISOString() },
        { test: "pCO₂", value: 38, units: "mmHg", range: "35-45", flag: "", timestamp: hoursAgo(2).toISOString() },
        { test: "Lactate", value: 4.2, units: "mmol/L", range: "0.5-2.0", flag: "H", timestamp: hoursAgo(2).toISOString() },
        { test: "Base Excess", value: -8, units: "mEq/L", range: "-2 to +2", flag: "Critical", timestamp: hoursAgo(2).toISOString() },
      ]},
      { panel: "Complete Blood Count", results: [
        { test: "WBC", value: 14.2, units: "x10³/µL", range: "5.0-15.0", flag: "", timestamp: hoursAgo(3).toISOString() },
        { test: "Platelets", value: 95, units: "x10³/µL", range: "150-400", flag: "L", timestamp: hoursAgo(3).toISOString() },
        { test: "Hemoglobin", value: 15.1, units: "g/dL", range: "13.0-17.0", flag: "", timestamp: hoursAgo(3).toISOString() },
      ]},
      { panel: "C-Reactive Protein", results: [
        { test: "CRP", value: 5.2, units: "mg/dL", range: "0.0-0.5", flag: "H", timestamp: hoursAgo(3).toISOString() },
      ]},
      { panel: "Basic Metabolic Panel", results: [
        { test: "Sodium", value: 138, units: "mEq/L", range: "136-145", flag: "", timestamp: hoursAgo(3).toISOString() },
        { test: "Potassium", value: 4.8, units: "mEq/L", range: "3.5-5.0", flag: "", timestamp: hoursAgo(3).toISOString() },
        { test: "Glucose", value: 58, units: "mg/dL", range: "45-100", flag: "", timestamp: hoursAgo(3).toISOString() },
      ]},
    ],
    meds: [
      { name: "Ampicillin", dose: "75 mg", route: "IV", frequency: "q8h", startDate: hoursAgo(5).toISOString(),
        mar: [
          { time: hoursAgo(5).toISOString(), status: "given" },
          { time: hoursAgo(5 - 8).toISOString(), status: "scheduled" },
        ]},
      { name: "Gentamicin", dose: "6.5 mg", route: "IV", frequency: "q36h", startDate: hoursAgo(5).toISOString(),
        mar: [
          { time: hoursAgo(5).toISOString(), status: "given" },
          { time: new Date(NOW.getTime() + 31 * 3600000).toISOString(), status: "scheduled" },
        ]},
      { name: "Metronidazole", dose: "12 mg", route: "IV", frequency: "q12h", startDate: hoursAgo(5).toISOString(),
        mar: [
          { time: hoursAgo(5).toISOString(), status: "given" },
          { time: hoursAgo(5 - 12).toISOString(), status: "scheduled" },
        ]},
      { name: "TPN", dose: "95 mL/day", route: "IV", frequency: "Continuous", startDate: daysAgo(3).toISOString(),
        mar: [
          { time: hoursAgo(0).toISOString(), status: "given" },
        ]},
    ],
    orders: [
      { id: 201, order: "NPO", category: "Diet", status: "Active", priority: "STAT", orderedBy: "Dr. Patel", date: hoursAgo(5).toISOString() },
      { id: 202, order: "Abdominal X-Ray (KUB)", category: "Imaging", status: "Completed", priority: "STAT", orderedBy: "Dr. Patel", date: hoursAgo(5).toISOString() },
      { id: 203, order: "Blood Gas (Arterial)", category: "Lab", status: "Completed", priority: "STAT", orderedBy: "Dr. Patel", date: hoursAgo(2).toISOString() },
      { id: 204, order: "CBC with Differential", category: "Lab", status: "Completed", priority: "STAT", orderedBy: "Dr. Patel", date: hoursAgo(3).toISOString() },
      { id: 205, order: "Pediatric Surgery Consult", category: "Consult", status: "Ordered", priority: "Urgent", orderedBy: "Dr. Patel", date: hoursAgo(4).toISOString() },
      { id: 206, order: "Ampicillin 75mg IV q8h", category: "Medication", status: "Active", priority: "STAT", orderedBy: "Dr. Patel", date: hoursAgo(5).toISOString() },
      { id: 207, order: "Gentamicin 6.5mg IV q36h", category: "Medication", status: "Active", priority: "STAT", orderedBy: "Dr. Patel", date: hoursAgo(5).toISOString() },
      { id: 208, order: "Metronidazole 12mg IV q12h", category: "Medication", status: "Active", priority: "STAT", orderedBy: "Dr. Patel", date: hoursAgo(5).toISOString() },
      { id: 209, order: "Serial Abdominal X-Ray q6h", category: "Imaging", status: "Active", priority: "Routine", orderedBy: "Dr. Patel", date: hoursAgo(5).toISOString() },
    ],
    notes: [
      {
        id: 2001, title: "Progress Note — Suspected NEC", type: "Progress Note", author: "Dr. Michael Patel", status: "Signed",
        timestamp: hoursAgo(5).toISOString(),
        body: "SUBJECTIVE:\nDOL 3. Previously feeding well on expressed breast milk (EBM) 15mL q3h via OG. Overnight, nursing reported increasing gastric residuals (bilious, 8-10mL). Infant noted to have increasing abdominal distension.\n\nOBJECTIVE:\nVitals: HR 178, RR 58, SpO2 93% on room air, Temp 36.1°C\nAbdomen: Distended, firm, erythematous. Visible bowel loops. Tender to palpation. Absent bowel sounds.\nNeoTherm: CPTD 2.4°C and rising. Notable abdominal cooling pattern — abdomen temperature 35.2°C (normally 36.0-36.5°C in neonates). Peripheral vasoconstriction also present.\n\nLaboratory:\n- Blood gas: pH 7.28 (critical), Lactate 4.2 (H), Base excess -8 (critical)\n- CBC: Platelets 95 (declining), WBC 14.2\n- CRP: 5.2 (H)\n\nImaging: KUB demonstrates pneumatosis intestinalis in RLQ, dilated bowel loops, no free air.\n\nASSESSMENT:\nSuspected Necrotizing Enterocolitis, Bell Stage IIA — pneumatosis intestinalis on imaging with clinical signs of abdominal distension, feeding intolerance, bilious aspirates, metabolic acidosis, and thrombocytopenia. NeoTherm abdominal cooling pattern provides additional supportive evidence.\n\nPLAN:\n1. NPO immediately, place OG to low intermittent suction\n2. Triple antibiotics: Ampicillin + Gentamicin + Metronidazole\n3. Serial abdominal X-rays q6h — monitor for perforation\n4. Urgent pediatric surgery consult\n5. Serial blood gases and CBC q6-8h\n6. TPN for nutrition\n7. Continue NeoTherm monitoring — track abdominal temperature trend\n8. If perforation or clinical deterioration, proceed to OR"
      },
      {
        id: 2002, title: "Nursing Assessment", type: "Nursing Note", author: "RN Michael Torres", status: "Signed",
        timestamp: hoursAgo(7).toISOString(),
        body: "ASSESSMENT:\nInfant noted to have increasing abdominal distension during 0600 cares. Abdominal girth measured 28cm (previously 25cm at admission). Gastric residuals bilious, 10mL aspirated prior to scheduled feeding. Infant appears uncomfortable with increased irritability.\n\nNeoTherm thermal map shows unusual abdominal cooling — temperature 35.4°C compared to core 36.5°C. CPTD elevated at 1.8°C.\n\nINTERVENTIONS:\n1. Held feeding and notified Dr. Patel\n2. Placed OG tube to low intermittent suction per order\n3. Obtained stat labs and KUB per physician order\n4. Initiated NPO status\n5. Monitored vital signs q15 minutes\n6. Parents at bedside, updated on change in clinical status\n\nCURRENT STATUS:\nInfant on NPO with OG to suction. Abdomen remains distended. Awaiting surgical consult. Triple antibiotics initiated. NeoTherm CPTD continuing to trend upward."
      },
    ],
    problems: [
      { description: "Prematurity, 32 completed weeks", icd10: "P07.35", onset: daysAgo(3).toISOString(), notedBy: "Dr. Patel", status: "Active" },
      { description: "Suspected Necrotizing Enterocolitis", icd10: "P77.1", onset: hoursAgo(5).toISOString(), notedBy: "Dr. Patel", status: "Active" },
      { description: "Feeding intolerance", icd10: "P92.9", onset: hoursAgo(7).toISOString(), notedBy: "Dr. Patel", status: "Active" },
      { description: "Metabolic acidosis", icd10: "E87.2", onset: hoursAgo(2).toISOString(), notedBy: "Dr. Patel", status: "Active" },
      { description: "Thrombocytopenia", icd10: "P61.0", onset: hoursAgo(3).toISOString(), notedBy: "Dr. Patel", status: "Active" },
    ],
    imaging: [
      {
        id: 3001, modality: "X-Ray", bodyPart: "Abdomen (KUB)", date: hoursAgo(5).toISOString(), status: "Read",
        orderedBy: "Dr. Patel",
        report: "ABDOMINAL RADIOGRAPH (KUB)\n\nCLINICAL INDICATION: Abdominal distension, bilious aspirates, suspected NEC.\n\nFINDINGS:\nBowel gas pattern is abnormal. There are multiple dilated loops of bowel, predominantly in the right lower quadrant. Linear and bubbly lucencies are seen along the bowel wall in the right lower quadrant, consistent with pneumatosis intestinalis.\n\nNo free intraperitoneal air identified on this supine view. No portal venous gas identified.\n\nThe gastric tube tip projects over the stomach. Umbilical lines are in satisfactory position.\n\nIMPRESSION:\n1. Pneumatosis intestinalis in the right lower quadrant — findings consistent with Necrotizing Enterocolitis (NEC)\n2. Dilated bowel loops suggesting ileus\n3. No evidence of perforation on this study\n4. Recommend clinical correlation and serial imaging"
      },
    ],
    bpaAlerts: [
      {
        id: "bpa-thompson-1",
        alertType: "neotherm_nec_pattern",
        title: "NeoTherm Screening Alert \u2014 Pattern Consistent with NEC",
        summary: "NeoTherm continuous thermal monitoring has detected an abdominal cooling pattern (abdomen temp 34.8\u00b0C, core 36.5\u00b0C) combined with peripheral vasoconstriction (CPTD 2.8\u00b0C). This thermal distribution pattern has been associated with necrotizing enterocolitis in neonates. Combined with clinical signs (abdominal distension, feeding intolerance), recommend urgent surgical evaluation if not already initiated.",
        cptdValue: 2.8,
        triggeredAt: hoursAgo(3).toISOString(),
      },
    ],
  };

  /* ───────── Baby Williams — Healthy Control ───────── */
  var williams = {
    id: 3,
    bed: "3B",
    firstName: "Lily",
    lastName: "Williams",
    sex: "F",
    mrn: "MRN-2026-00155",
    dob: daysAgo(2).toISOString(),
    ga: "36+4",
    birthWeight: 2450,
    currentWeight: 2380,
    length: 47,
    hc: 33,
    attending: "Dr. Sarah Chen",
    acuity: "Level II",
    codeStatus: "Full Code",
    allergies: ["NKDA"],
    dx: "R/O Sepsis (GBS)",
    vitals: generateVitals(25, 12, 138, 142, 36, 40, 98, 98, 36.8, 36.9, 64, 66, 37, 39),
    thermal: generateThermal(25, 12,
      0.4, 0.6,
      36.9, 36.9,
      36.5, 36.5,
      36.0, 36.2,
      36.1, 36.2,
      35.6, 35.8,
      35.7, 35.8,
      36.3, 36.4,
      36.3, 36.4,
      36.0, 36.1,
      36.0, 36.1
    ),
    labs: [
      { panel: "Complete Blood Count", results: [
        { test: "WBC", value: 12.5, units: "x10³/µL", range: "5.0-15.0", flag: "", timestamp: hoursAgo(36).toISOString() },
        { test: "Hemoglobin", value: 16.8, units: "g/dL", range: "13.0-17.0", flag: "", timestamp: hoursAgo(36).toISOString() },
        { test: "Platelets", value: 265, units: "x10³/µL", range: "150-400", flag: "", timestamp: hoursAgo(36).toISOString() },
        { test: "I:T Ratio", value: 0.05, units: "", range: "0.00-0.12", flag: "", timestamp: hoursAgo(36).toISOString() },
      ]},
      { panel: "C-Reactive Protein", results: [
        { test: "CRP", value: 0.3, units: "mg/dL", range: "0.0-0.5", flag: "", timestamp: hoursAgo(36).toISOString() },
      ]},
      { panel: "Microbiology", results: [
        { test: "Blood Culture", value: "No growth at 36h", units: "", range: "", flag: "", timestamp: hoursAgo(36).toISOString() },
      ]},
    ],
    meds: [
      { name: "Ampicillin", dose: "125 mg", route: "IV", frequency: "q12h", startDate: daysAgo(2).toISOString(),
        mar: [
          { time: hoursAgo(12).toISOString(), status: "given" },
          { time: hoursAgo(0).toISOString(), status: "given" },
        ]},
      { name: "Gentamicin", dose: "10 mg", route: "IV", frequency: "q36h", startDate: daysAgo(2).toISOString(),
        mar: [
          { time: hoursAgo(12).toISOString(), status: "given" },
        ]},
    ],
    orders: [
      { id: 301, order: "CBC with Differential", category: "Lab", status: "Completed", priority: "Routine", orderedBy: "Dr. Chen", date: daysAgo(2).toISOString() },
      { id: 302, order: "Blood Culture", category: "Lab", status: "Completed", priority: "Routine", orderedBy: "Dr. Chen", date: daysAgo(2).toISOString() },
      { id: 303, order: "CRP", category: "Lab", status: "Completed", priority: "Routine", orderedBy: "Dr. Chen", date: daysAgo(2).toISOString() },
      { id: 304, order: "Ampicillin 125mg IV q12h", category: "Medication", status: "Active", priority: "Routine", orderedBy: "Dr. Chen", date: daysAgo(2).toISOString() },
      { id: 305, order: "Gentamicin 10mg IV q36h", category: "Medication", status: "Active", priority: "Routine", orderedBy: "Dr. Chen", date: daysAgo(2).toISOString() },
      { id: 306, order: "Breastfeeding on demand", category: "Diet", status: "Active", priority: "Routine", orderedBy: "Dr. Chen", date: daysAgo(2).toISOString() },
    ],
    notes: [
      {
        id: 3001, title: "Admission History & Physical", type: "H&P", author: "Dr. Sarah Chen", status: "Signed",
        timestamp: daysAgo(2).toISOString(),
        body: "HISTORY OF PRESENT ILLNESS:\nFemale infant born at 36 weeks and 4 days gestational age via spontaneous vaginal delivery. Birth weight 2450g (AGA). APGAR scores 8 at 1 minute, 9 at 5 minutes. No resuscitation required.\n\nMATERNAL HISTORY:\n32-year-old G1P1 mother. Prenatal labs: GBS POSITIVE, treated with intrapartum penicillin (received 2 doses, adequate prophylaxis). Rupture of membranes 8 hours prior to delivery. No maternal fever or chorioamnionitis.\n\nPHYSICAL EXAMINATION:\nGeneral: Well-appearing late preterm female, appropriate for gestational age.\nVitals: HR 140, RR 38, SpO2 98% on room air, Temp 36.8°C\nExam: Unremarkable. Good tone, active, feeding well.\n\nASSESSMENT AND PLAN:\n1. Late preterm infant 36+4 weeks — routine care, monitor feeding\n2. Rule out sepsis — maternal GBS positive; obtain blood cultures, CBC, CRP; start empiric antibiotics (ampicillin + gentamicin) per protocol; will discontinue at 48h if cultures negative and clinically well\n3. NeoTherm monitoring initiated per unit protocol — baseline CPTD 0.4°C (normal)\n4. Breastfeeding on demand, monitor for hypoglycemia"
      },
    ],
    problems: [
      { description: "Rule out neonatal sepsis", icd10: "P36.9", onset: daysAgo(2).toISOString(), notedBy: "Dr. Chen", status: "Active" },
      { description: "Maternal GBS colonization — exposure", icd10: "Z83.1", onset: daysAgo(2).toISOString(), notedBy: "Dr. Chen", status: "Active" },
    ],
    imaging: [],
    bpaAlerts: [],
  };

  /* ───────── Background patient factory ───────── */
  function makeBackground(id, bed, first, last, sex, gaWeeks, dol, birthWt, attending, dx, icd, problemDesc) {
    var currentWt = Math.round(birthWt * (1 - 0.005 * dol));
    var cptd = +(0.3 + rand() * 0.2).toFixed(2);
    return {
      id: id,
      bed: bed,
      firstName: first,
      lastName: last,
      sex: sex,
      mrn: "MRN-2026-00" + (160 + id),
      dob: daysAgo(dol).toISOString(),
      ga: gaWeeks + "+0",
      birthWeight: birthWt,
      currentWeight: currentWt,
      length: +(35 + rand() * 15).toFixed(1),
      hc: +(24 + rand() * 10).toFixed(1),
      attending: attending,
      acuity: gaWeeks < 30 ? "Level III" : gaWeeks < 34 ? "Level II" : "Level II",
      codeStatus: "Full Code",
      allergies: ["NKDA"],
      dx: dx,
      vitals: generateVitals(9, 12, 135 + Math.round(rand() * 10), 138 + Math.round(rand() * 10), 34 + Math.round(rand() * 8), 36 + Math.round(rand() * 8), 96, 97, 36.7, 36.8, 55 + Math.round(rand() * 15), 57 + Math.round(rand() * 15), 30 + Math.round(rand() * 10), 32 + Math.round(rand() * 10)),
      thermal: generateThermal(9, 12,
        cptd, cptd + 0.1,
        36.8, 36.8,
        36.4, 36.4,
        35.8, 35.9,
        35.8, 35.9,
        35.5, 35.6,
        35.5, 35.6,
        36.2, 36.2,
        36.2, 36.2,
        35.9, 35.9,
        35.9, 35.9
      ),
      labs: [
        { panel: "Complete Blood Count", results: [
          { test: "WBC", value: +(8 + rand() * 6).toFixed(1), units: "x10³/µL", range: "5.0-15.0", flag: "", timestamp: hoursAgo(12 + rand() * 24).toISOString() },
          { test: "Hemoglobin", value: +(14 + rand() * 3).toFixed(1), units: "g/dL", range: "13.0-17.0", flag: "", timestamp: hoursAgo(12 + rand() * 24).toISOString() },
          { test: "Platelets", value: Math.round(200 + rand() * 100), units: "x10³/µL", range: "150-400", flag: "", timestamp: hoursAgo(12 + rand() * 24).toISOString() },
        ]},
        { panel: "C-Reactive Protein", results: [
          { test: "CRP", value: +(rand() * 0.4).toFixed(1), units: "mg/dL", range: "0.0-0.5", flag: "", timestamp: hoursAgo(12 + rand() * 24).toISOString() },
        ]},
        { panel: "Basic Metabolic Panel", results: [
          { test: "Sodium", value: Math.round(137 + rand() * 6), units: "mEq/L", range: "136-145", flag: "", timestamp: hoursAgo(12 + rand() * 24).toISOString() },
          { test: "Potassium", value: +(3.8 + rand() * 1.0).toFixed(1), units: "mEq/L", range: "3.5-5.0", flag: "", timestamp: hoursAgo(12 + rand() * 24).toISOString() },
          { test: "Glucose", value: Math.round(55 + rand() * 40), units: "mg/dL", range: "45-100", flag: "", timestamp: hoursAgo(12 + rand() * 24).toISOString() },
        ]},
      ],
      meds: [
        { name: "Caffeine Citrate", dose: (3 + Math.round(rand() * 4)) + " mg", route: "PO", frequency: "Daily", startDate: daysAgo(dol).toISOString(),
          mar: [
            { time: hoursAgo(6).toISOString(), status: "given" },
            { time: new Date(NOW.getTime() + 18 * 3600000).toISOString(), status: "scheduled" },
          ]},
      ],
      orders: [
        { id: id * 100 + 1, order: "Caffeine Citrate PO Daily", category: "Medication", status: "Active", priority: "Routine", orderedBy: attending, date: daysAgo(dol).toISOString() },
      ],
      notes: [
        {
          id: id * 1000 + 1, title: "Admission History & Physical", type: "H&P", author: attending, status: "Signed",
          timestamp: daysAgo(dol).toISOString(),
          body: "HISTORY OF PRESENT ILLNESS:\n" + sex + " infant born at " + gaWeeks + " weeks gestational age. Birth weight " + birthWt + "g. Admitted to NICU for " + dx + ".\n\nPHYSICAL EXAMINATION:\nAge-appropriate exam for gestational age. Stable on current support.\n\nASSESSMENT AND PLAN:\n1. " + dx + " — continue current management\n2. NeoTherm monitoring — baseline CPTD normal\n3. Routine NICU care per protocol"
        },
      ],
      problems: [
        { description: problemDesc, icd10: icd, onset: daysAgo(dol).toISOString(), notedBy: attending, status: "Active" },
        { description: "Prematurity, " + gaWeeks + " completed weeks", icd10: "P07.3", onset: daysAgo(dol).toISOString(), notedBy: attending, status: "Active" },
      ],
      imaging: [],
      bpaAlerts: [],
    };
  }

  var backgroundPatients = [
    makeBackground(4, "1B", "Ethan", "Anderson", "M", 30, 8, 1320, "Dr. Sarah Chen", "RDS, Apnea", "P22.0", "Respiratory Distress Syndrome"),
    makeBackground(5, "1C", "Sofia", "Martinez", "F", 34, 4, 2100, "Dr. Michael Patel", "Late preterm", "P07.38", "Late preterm infant"),
    makeBackground(6, "2A", "Liam", "Johnson", "M", 27, 12, 980, "Dr. Sarah Chen", "Extreme prematurity", "P07.25", "Extreme prematurity, 27 weeks"),
    makeBackground(7, "2B", "Ava", "Brown", "F", 35, 3, 2280, "Dr. Michael Patel", "Feeding difficulty", "P92.9", "Feeding difficulty"),
    makeBackground(8, "3A", "Noah", "Davis", "M", 29, 7, 1180, "Dr. Sarah Chen", "RDS, BPD", "P27.1", "Bronchopulmonary dysplasia"),
    makeBackground(9, "3C", "Emma", "Wilson", "F", 33, 5, 1890, "Dr. Michael Patel", "Jaundice", "P59.9", "Neonatal jaundice"),
    makeBackground(10, "4A", "Oliver", "Taylor", "M", 31, 6, 1520, "Dr. Sarah Chen", "Apnea of prematurity", "P28.4", "Apnea of prematurity"),
    makeBackground(11, "4B", "Charlotte", "Lee", "F", 26, 15, 860, "Dr. Sarah Chen", "Extreme prematurity, IVH", "P07.24", "Extreme prematurity, 26 weeks"),
    makeBackground(12, "4C", "Benjamin", "Clark", "M", 37, 1, 2850, "Dr. Michael Patel", "R/O Sepsis", "P36.9", "Rule out neonatal sepsis"),
  ];

  /* ───────── Order Catalog ───────── */
  var orderCatalog = [
    { id: "oc1", name: "CBC with Differential", category: "Lab", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc2", name: "Basic Metabolic Panel", category: "Lab", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc3", name: "C-Reactive Protein (CRP)", category: "Lab", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc4", name: "Blood Culture x2", category: "Lab", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc5", name: "Blood Gas (Arterial)", category: "Lab", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc6", name: "Total & Direct Bilirubin", category: "Lab", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc7", name: "Coagulation Panel (PT/INR/PTT)", category: "Lab", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc8", name: "Ampicillin", category: "Medication", defaultDose: "50 mg", defaultRoute: "IV", defaultFrequency: "q12h" },
    { id: "oc9", name: "Gentamicin", category: "Medication", defaultDose: "4 mg", defaultRoute: "IV", defaultFrequency: "q36h" },
    { id: "oc10", name: "Caffeine Citrate", category: "Medication", defaultDose: "5 mg", defaultRoute: "PO", defaultFrequency: "Daily" },
    { id: "oc11", name: "Vancomycin", category: "Medication", defaultDose: "15 mg", defaultRoute: "IV", defaultFrequency: "q12h" },
    { id: "oc12", name: "Metronidazole", category: "Medication", defaultDose: "12 mg", defaultRoute: "IV", defaultFrequency: "q12h" },
    { id: "oc13", name: "Vitamin K (Phytonadione)", category: "Medication", defaultDose: "1 mg", defaultRoute: "IM", defaultFrequency: "Once" },
    { id: "oc14", name: "TPN (Total Parenteral Nutrition)", category: "Medication", defaultDose: "80 mL/day", defaultRoute: "IV", defaultFrequency: "Continuous" },
    { id: "oc15", name: "Chest X-Ray (AP)", category: "Imaging", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc16", name: "Abdominal X-Ray (KUB)", category: "Imaging", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc17", name: "Head Ultrasound", category: "Imaging", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc18", name: "Echocardiogram", category: "Imaging", defaultDose: "", defaultRoute: "", defaultFrequency: "Once" },
    { id: "oc19", name: "Cardiology Consult", category: "Consult", defaultDose: "", defaultRoute: "", defaultFrequency: "" },
    { id: "oc20", name: "Pediatric Surgery Consult", category: "Consult", defaultDose: "", defaultRoute: "", defaultFrequency: "" },
    { id: "oc21", name: "Ophthalmology (ROP Screening)", category: "Consult", defaultDose: "", defaultRoute: "", defaultFrequency: "" },
    { id: "oc22", name: "Daily Weights", category: "Nursing", defaultDose: "", defaultRoute: "", defaultFrequency: "Daily" },
    { id: "oc23", name: "Strict Intake & Output", category: "Nursing", defaultDose: "", defaultRoute: "", defaultFrequency: "Continuous" },
    { id: "oc24", name: "NPO (Nothing by Mouth)", category: "Diet", defaultDose: "", defaultRoute: "", defaultFrequency: "" },
    { id: "oc25", name: "Advance Feeds per Protocol", category: "Diet", defaultDose: "", defaultRoute: "", defaultFrequency: "" },
  ];

  /* ───────── Export ───────── */
  window.DATA = {
    NOW: NOW,
    patients: [garcia, thompson, williams].concat(backgroundPatients),
    orderCatalog: orderCatalog,
  };
})();
