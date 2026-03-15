// Epic EHR Replica — NICU Data Seed
// Generates 12 patients (3 index with deep clinical stories + 9 background)

module.exports = function seed(db) {
  const NOW = new Date();
  const hour = 3600000;
  const minute = 60000;
  const day = 86400000;

  function iso(d) { return new Date(d).toISOString(); }
  function hoursAgo(h) { return new Date(NOW.getTime() - h * hour); }
  function daysAgo(d) { return new Date(NOW.getTime() - d * day); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function jitter(val, pct) { return val + val * (Math.random() - 0.5) * 2 * pct; }

  // ── Clear all tables ──
  const tables = [
    'intake_output', 'order_catalog', 'bpa_alerts', 'growth_measurements',
    'imaging_studies', 'problems', 'notes', 'orders', 'mar_entries',
    'medications', 'lab_results', 'thermal_readings', 'vitals', 'allergies', 'patients'
  ];
  for (const t of tables) db.exec(`DELETE FROM ${t}`);

  // ── Order Catalog (50 items) ──
  const catalog = [
    // Medications (15)
    ['Ampicillin', 'medication', '50 mg/kg', 'IV', 'q12h'],
    ['Gentamicin', 'medication', '4 mg/kg', 'IV', 'q24h'],
    ['Caffeine Citrate', 'medication', '5 mg/kg', 'IV/PO', 'q24h'],
    ['Vancomycin', 'medication', '15 mg/kg', 'IV', 'q12h'],
    ['Acyclovir', 'medication', '20 mg/kg', 'IV', 'q8h'],
    ['TPN', 'medication', 'Per pharmacy', 'IV', 'Continuous'],
    ['Lipids 20%', 'medication', '3 g/kg/day', 'IV', 'Continuous'],
    ['Vitamin K', 'medication', '1 mg', 'IM', 'Once'],
    ['Erythromycin Ointment', 'medication', '0.5%', 'Ophthalmic', 'Once'],
    ['Morphine', 'medication', '0.05 mg/kg', 'IV', 'q4h PRN'],
    ['Fentanyl', 'medication', '1 mcg/kg', 'IV', 'q2h PRN'],
    ['Dopamine', 'medication', '5 mcg/kg/min', 'IV', 'Continuous'],
    ['Indomethacin', 'medication', '0.2 mg/kg', 'IV', 'q12h x3'],
    ['Iron Supplement', 'medication', '2 mg/kg', 'PO', 'q24h'],
    ['Vitamin D', 'medication', '400 IU', 'PO', 'q24h'],
    // Labs (10)
    ['CBC with Differential', 'lab', null, null, null],
    ['CRP', 'lab', null, null, null],
    ['BMP', 'lab', null, null, null],
    ['Blood Gas (ABG/VBG)', 'lab', null, null, null],
    ['Blood Culture', 'lab', null, null, null],
    ['Bilirubin Total/Direct', 'lab', null, null, null],
    ['Coagulation Panel', 'lab', null, null, null],
    ['Type and Screen', 'lab', null, null, null],
    ['Urinalysis', 'lab', null, null, null],
    ['CSF Studies', 'lab', null, null, null],
    // Imaging (8)
    ['Chest X-Ray (AP/Lat)', 'imaging', null, null, null],
    ['Abdominal X-Ray (KUB)', 'imaging', null, null, null],
    ['Head Ultrasound', 'imaging', null, null, null],
    ['Echocardiogram', 'imaging', null, null, null],
    ['Renal Ultrasound', 'imaging', null, null, null],
    ['VCUG', 'imaging', null, null, null],
    ['Upper GI Series', 'imaging', null, null, null],
    ['MRI Brain', 'imaging', null, null, null],
    // Nursing (7)
    ['Daily Weight', 'nursing', null, null, 'q24h'],
    ['I&O Monitoring', 'nursing', null, null, 'q1h'],
    ['Neuro Checks', 'nursing', null, null, 'q4h'],
    ['Skin Assessment', 'nursing', null, null, 'q8h'],
    ['Developmental Care', 'nursing', null, null, 'q shift'],
    ['Phototherapy', 'nursing', null, null, 'Continuous'],
    ['Wound Care', 'nursing', null, null, 'q8h'],
    // Diet (5)
    ['NPO', 'diet', null, null, null],
    ['Trophic Feeds', 'diet', '10-20 mL/kg/day', 'PO/OG', 'q3h'],
    ['Advance Feeds', 'diet', '20 mL/kg/day increase', 'PO/OG', 'q3h'],
    ['Breast Milk', 'diet', 'Ad lib', 'PO/OG', 'q3h'],
    ['Formula (Similac Special Care)', 'diet', '24 kcal/oz', 'PO/OG', 'q3h'],
    // Consults (5)
    ['Cardiology Consult', 'consult', null, null, null],
    ['Pediatric Surgery Consult', 'consult', null, null, null],
    ['Ophthalmology (ROP Screen)', 'consult', null, null, null],
    ['OT/PT Consult', 'consult', null, null, null],
    ['Social Work Consult', 'consult', null, null, null],
  ];
  const insertCatalog = db.prepare(
    'INSERT INTO order_catalog (name, category, default_dose, default_route, default_frequency) VALUES (?,?,?,?,?)'
  );
  for (const c of catalog) insertCatalog.run(...c);

  // ── Helper: Generate vitals ──
  function generateVitals(patientId, hours, trendFn) {
    const insertVital = db.prepare(
      'INSERT INTO vitals (patient_id, timestamp, hr, rr, spo2, temp_axillary, bp_systolic, bp_diastolic, bp_mean) VALUES (?,?,?,?,?,?,?,?,?)'
    );
    for (let h = hours; h >= 0; h--) {
      const t = hoursAgo(h);
      const v = trendFn(h, hours);
      insertVital.run(
        patientId, iso(t),
        Math.round(v.hr), Math.round(v.rr), Math.round(v.spo2),
        Math.round(v.temp * 10) / 10,
        Math.round(v.bpSys), Math.round(v.bpDia), Math.round(v.bpMean)
      );
    }
  }

  // ── Helper: Generate thermal readings (q15min) ──
  function generateThermal(patientId, hours, trendFn) {
    const insertThermal = db.prepare(
      'INSERT INTO thermal_readings (patient_id, timestamp, cptd, core_temp, left_hand, right_hand, left_foot, right_foot, left_elbow, right_elbow, left_knee, right_knee, abdomen_temp, alert_level) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    for (let m = hours * 60; m >= 0; m -= 15) {
      const t = new Date(NOW.getTime() - m * minute);
      const progress = 1 - m / (hours * 60);
      const v = trendFn(progress);
      const alertLevel = v.cptd < 1.0 ? 'normal' : v.cptd < 2.0 ? 'warning' : v.cptd < 3.0 ? 'high' : 'critical';
      insertThermal.run(
        patientId, iso(t),
        Math.round(v.cptd * 100) / 100,
        Math.round(v.core * 100) / 100,
        Math.round(v.lHand * 100) / 100,
        Math.round(v.rHand * 100) / 100,
        Math.round(v.lFoot * 100) / 100,
        Math.round(v.rFoot * 100) / 100,
        Math.round(v.lElbow * 100) / 100,
        Math.round(v.rElbow * 100) / 100,
        Math.round(v.lKnee * 100) / 100,
        Math.round(v.rKnee * 100) / 100,
        Math.round(v.abdomen * 100) / 100,
        alertLevel
      );
    }
  }

  // ── Helper: Insert labs ──
  const insertLab = db.prepare(
    'INSERT INTO lab_results (patient_id, timestamp, panel, test_name, value, unit, reference_low, reference_high, flag) VALUES (?,?,?,?,?,?,?,?,?)'
  );
  function addLab(pid, ts, panel, name, val, unit, lo, hi) {
    let flag = null;
    if (val < lo) flag = 'L';
    if (val > hi) flag = 'H';
    if (val < lo * 0.7 || val > hi * 1.5) flag = 'Critical';
    insertLab.run(pid, iso(ts), panel, name, val, unit, lo, hi, flag);
  }

  // ── Helper: Insert medication + MAR entries ──
  const insertMed = db.prepare(
    'INSERT INTO medications (patient_id, drug_name, dose, route, frequency, start_date, end_date, status) VALUES (?,?,?,?,?,?,?,?)'
  );
  const insertMAR = db.prepare(
    'INSERT INTO mar_entries (medication_id, scheduled_time, status, administered_by, administered_at) VALUES (?,?,?,?,?)'
  );
  function addMedWithMAR(pid, drug, dose, route, freq, startDate) {
    const result = insertMed.run(pid, drug, dose, route, freq, iso(startDate), null, 'Active');
    const medId = result.lastInsertRowid;
    // Generate MAR entries
    let intervalHours;
    switch (freq) {
      case 'q4h': intervalHours = 4; break;
      case 'q6h': intervalHours = 6; break;
      case 'q8h': intervalHours = 8; break;
      case 'q12h': intervalHours = 12; break;
      case 'q24h': intervalHours = 24; break;
      case 'q3h': intervalHours = 3; break;
      case 'Continuous': intervalHours = 4; break; // document q4h for continuous
      default: intervalHours = 8;
    }
    const startMs = startDate.getTime();
    const endMs = NOW.getTime() + 24 * hour; // schedule 24h into future
    for (let t = startMs; t < endMs; t += intervalHours * hour) {
      const schedTime = new Date(t);
      let status, adminBy, adminAt;
      if (t < NOW.getTime() - hour) {
        status = 'given';
        adminBy = 'RN Smith';
        adminAt = iso(new Date(t + randInt(0, 15) * minute));
      } else if (t < NOW.getTime() + hour) {
        status = 'due';
        adminBy = null;
        adminAt = null;
      } else {
        status = 'scheduled';
        adminBy = null;
        adminAt = null;
      }
      insertMAR.run(medId, iso(schedTime), status, adminBy, adminAt);
    }
    return medId;
  }

  // ── Helper: Insert order ──
  const insertOrder = db.prepare(
    'INSERT INTO orders (patient_id, order_text, category, status, priority, ordered_by, ordered_at) VALUES (?,?,?,?,?,?,?)'
  );

  // ── Helper: Insert note ──
  const insertNote = db.prepare(
    'INSERT INTO notes (patient_id, title, note_type, author, timestamp, body, status) VALUES (?,?,?,?,?,?,?)'
  );

  // ── Helper: Insert problem ──
  const insertProblem = db.prepare(
    'INSERT INTO problems (patient_id, description, icd10, onset_date, status, noted_by) VALUES (?,?,?,?,?,?)'
  );

  // ── Helper: Insert imaging ──
  const insertImaging = db.prepare(
    'INSERT INTO imaging_studies (patient_id, modality, body_part, ordered_at, completed_at, ordering_provider, report_text, status) VALUES (?,?,?,?,?,?,?,?)'
  );

  // ── Helper: Insert allergy ──
  const insertAllergy = db.prepare(
    'INSERT INTO allergies (patient_id, allergen, reaction, severity) VALUES (?,?,?,?)'
  );

  // ── Helper: Insert growth ──
  const insertGrowth = db.prepare(
    'INSERT INTO growth_measurements (patient_id, timestamp, weight_g, length_cm, head_circumference_cm) VALUES (?,?,?,?,?)'
  );

  // ── Helper: Insert I/O ──
  const insertIO = db.prepare(
    'INSERT INTO intake_output (patient_id, timestamp, type, category, amount_ml, notes) VALUES (?,?,?,?,?,?)'
  );

  // ── Helper: Insert BPA ──
  const insertBPA = db.prepare(
    'INSERT INTO bpa_alerts (patient_id, alert_type, title, summary, cptd_value, triggered_at, acknowledged_at, acknowledged_by) VALUES (?,?,?,?,?,?,?,?)'
  );

  // ── Insert patient ──
  const insertPatient = db.prepare(
    'INSERT INTO patients (id, mrn, first_name, last_name, dob, sex, gestational_age_weeks, gestational_age_days, birth_weight_g, current_weight_g, current_length_cm, head_circumference_cm, admit_date, acuity, bed, admitting_diagnosis, attending, code_status, is_index_patient, neotherm_alert_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  );

  // ══════════════════════════════════════════════
  // INDEX PATIENT 1: Baby Garcia — Developing Sepsis
  // ══════════════════════════════════════════════
  const garciaDOB = daysAgo(5);
  const garciaAdmit = new Date(garciaDOB.getTime() + 2 * hour);
  insertPatient.run(1, 'MRN-2026-0001', 'Miguel', 'Garcia', iso(garciaDOB), 'M',
    28, 3, 1050, 1020, 36.5, 25.2, iso(garciaAdmit),
    'Level III', '1A', 'Prematurity, RDS', 'Dr. Sarah Chen', 'Full Code', 1, 1);

  // Allergies — NKDA
  insertAllergy.run(1, 'No Known Drug Allergies', 'N/A', 'N/A');

  // Vitals — 48h hourly, last 8h trending up
  generateVitals(1, 48, (hAgo, total) => {
    const inLastEight = hAgo <= 8;
    const sepsisProg = inLastEight ? (8 - hAgo) / 8 : 0;
    return {
      hr: jitter(150 + sepsisProg * 25, 0.02),
      rr: jitter(45 + sepsisProg * 10, 0.03),
      spo2: jitter(95 - sepsisProg * 4, 0.01),
      temp: jitter(36.8 + (inLastEight ? Math.sin(hAgo * 0.8) * 0.3 : 0), 0.005),
      bpSys: jitter(55 - sepsisProg * 5, 0.03),
      bpDia: jitter(32 - sepsisProg * 3, 0.03),
      bpMean: jitter(40 - sepsisProg * 4, 0.03),
    };
  });

  // Thermal — 48h q15min, last 8h CPTD rising
  generateThermal(1, 48, (progress) => {
    const inLastEight = progress > (48 - 8) / 48;
    const sepsisProg = inLastEight ? (progress - (48 - 8) / 48) / (8 / 48) : 0;
    const core = 36.8 + jitter(0, 0.005);
    const handDrop = sepsisProg * 1.7;
    const footDrop = sepsisProg * 2.3;
    const elbowDrop = sepsisProg * 0.8;
    const kneeDrop = sepsisProg * 1.0;
    const lHand = jitter(34.5 - handDrop, 0.01);
    const rHand = jitter(34.4 - handDrop, 0.01);
    const lFoot = jitter(33.8 - footDrop, 0.01);
    const rFoot = jitter(33.7 - footDrop, 0.01);
    const lElbow = jitter(35.2 - elbowDrop, 0.01);
    const rElbow = jitter(35.1 - elbowDrop, 0.01);
    const lKnee = jitter(34.8 - kneeDrop, 0.01);
    const rKnee = jitter(34.7 - kneeDrop, 0.01);
    const avgPeriph = (lHand + rHand + lFoot + rFoot + lElbow + rElbow + lKnee + rKnee) / 8;
    const cptd = Math.max(0, core - avgPeriph);
    return { cptd, core, lHand, rHand, lFoot, rFoot, lElbow, rElbow, lKnee, rKnee, abdomen: jitter(36.5, 0.005) };
  });

  // Labs — Garcia
  // Admission CBC (DOL 0)
  const garciaLab1 = daysAgo(5);
  addLab(1, garciaLab1, 'CBC w/ Differential', 'WBC', 12.5, 'x10^3/uL', 5.0, 20.0);
  addLab(1, garciaLab1, 'CBC w/ Differential', 'Hemoglobin', 15.2, 'g/dL', 13.0, 20.0);
  addLab(1, garciaLab1, 'CBC w/ Differential', 'Hematocrit', 45.0, '%', 39.0, 59.0);
  addLab(1, garciaLab1, 'CBC w/ Differential', 'Platelets', 220, 'x10^3/uL', 150, 400);
  addLab(1, garciaLab1, 'CBC w/ Differential', 'Neutrophils', 55, '%', 30, 70);
  addLab(1, garciaLab1, 'CBC w/ Differential', 'Bands', 5, '%', 0, 10);
  addLab(1, garciaLab1, 'CBC w/ Differential', 'I:T Ratio', 0.08, 'ratio', 0, 0.2);
  addLab(1, garciaLab1, 'CRP', 'C-Reactive Protein', 0.5, 'mg/L', 0, 1.0);
  addLab(1, garciaLab1, 'Blood Culture', 'Blood Culture', 0, 'status', 0, 0); // 0 = no growth

  // 24h CBC
  const garciaLab2 = daysAgo(4);
  addLab(1, garciaLab2, 'CBC w/ Differential', 'WBC', 14.8, 'x10^3/uL', 5.0, 20.0);
  addLab(1, garciaLab2, 'CBC w/ Differential', 'Hemoglobin', 14.8, 'g/dL', 13.0, 20.0);
  addLab(1, garciaLab2, 'CBC w/ Differential', 'Hematocrit', 43.5, '%', 39.0, 59.0);
  addLab(1, garciaLab2, 'CBC w/ Differential', 'Platelets', 195, 'x10^3/uL', 150, 400);
  addLab(1, garciaLab2, 'CBC w/ Differential', 'Neutrophils', 60, '%', 30, 70);
  addLab(1, garciaLab2, 'CBC w/ Differential', 'Bands', 8, '%', 0, 10);
  addLab(1, garciaLab2, 'CBC w/ Differential', 'I:T Ratio', 0.12, 'ratio', 0, 0.2);
  addLab(1, garciaLab2, 'CRP', 'C-Reactive Protein', 2.1, 'mg/L', 0, 1.0);

  // Today's labs — sepsis markers up
  const garciaLab3 = hoursAgo(4);
  addLab(1, garciaLab3, 'CBC w/ Differential', 'WBC', 18.5, 'x10^3/uL', 5.0, 20.0);
  addLab(1, garciaLab3, 'CBC w/ Differential', 'Hemoglobin', 14.2, 'g/dL', 13.0, 20.0);
  addLab(1, garciaLab3, 'CBC w/ Differential', 'Hematocrit', 42.0, '%', 39.0, 59.0);
  addLab(1, garciaLab3, 'CBC w/ Differential', 'Platelets', 165, 'x10^3/uL', 150, 400);
  addLab(1, garciaLab3, 'CBC w/ Differential', 'Neutrophils', 72, '%', 30, 70);
  addLab(1, garciaLab3, 'CBC w/ Differential', 'Bands', 15, '%', 0, 10);
  addLab(1, garciaLab3, 'CBC w/ Differential', 'I:T Ratio', 0.25, 'ratio', 0, 0.2);
  addLab(1, garciaLab3, 'CRP', 'C-Reactive Protein', 8.4, 'mg/L', 0, 1.0);
  addLab(1, garciaLab3, 'Blood Culture', 'Blood Culture', 0, 'status', 0, 0); // pending

  // Blood gas
  addLab(1, garciaLab3, 'Blood Gas (ABG)', 'pH', 7.32, '', 7.35, 7.45);
  addLab(1, garciaLab3, 'Blood Gas (ABG)', 'pCO2', 48, 'mmHg', 35, 45);
  addLab(1, garciaLab3, 'Blood Gas (ABG)', 'pO2', 62, 'mmHg', 60, 80);
  addLab(1, garciaLab3, 'Blood Gas (ABG)', 'HCO3', 21, 'mEq/L', 22, 26);
  addLab(1, garciaLab3, 'Blood Gas (ABG)', 'Base Excess', -4, 'mEq/L', -2, 2);
  addLab(1, garciaLab3, 'Blood Gas (ABG)', 'Lactate', 3.2, 'mmol/L', 0.5, 2.0);

  // BMP
  addLab(1, garciaLab3, 'BMP', 'Glucose', 68, 'mg/dL', 40, 110);
  addLab(1, garciaLab3, 'BMP', 'Sodium', 138, 'mEq/L', 135, 145);
  addLab(1, garciaLab3, 'BMP', 'Potassium', 4.8, 'mEq/L', 3.5, 5.5);
  addLab(1, garciaLab3, 'BMP', 'Calcium', 8.2, 'mg/dL', 7.0, 11.0);
  addLab(1, garciaLab3, 'BMP', 'BUN', 12, 'mg/dL', 3, 25);
  addLab(1, garciaLab3, 'BMP', 'Creatinine', 0.6, 'mg/dL', 0.2, 1.0);

  // Medications — Garcia
  addMedWithMAR(1, 'Caffeine Citrate', '5 mg/kg (5 mg)', 'IV', 'q24h', daysAgo(4));
  addMedWithMAR(1, 'TPN', 'Per pharmacy protocol', 'IV', 'Continuous', daysAgo(5));
  addMedWithMAR(1, 'Ampicillin', '50 mg/kg (52 mg)', 'IV', 'q12h', hoursAgo(4));
  addMedWithMAR(1, 'Gentamicin', '4 mg/kg (4.2 mg)', 'IV', 'q24h', hoursAgo(4));

  // Orders — Garcia
  insertOrder.run(1, 'Ampicillin 50 mg/kg IV q12h', 'medication', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(4)));
  insertOrder.run(1, 'Gentamicin 4 mg/kg IV q24h', 'medication', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(4)));
  insertOrder.run(1, 'CBC with Differential', 'lab', 'completed', 'stat', 'Dr. Chen', iso(hoursAgo(4)));
  insertOrder.run(1, 'CRP', 'lab', 'completed', 'stat', 'Dr. Chen', iso(hoursAgo(4)));
  insertOrder.run(1, 'Blood Culture x2', 'lab', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(4)));
  insertOrder.run(1, 'Blood Gas (ABG)', 'lab', 'completed', 'stat', 'Dr. Chen', iso(hoursAgo(4)));
  insertOrder.run(1, 'Caffeine Citrate 5 mg/kg IV q24h', 'medication', 'active', 'routine', 'Dr. Chen', iso(daysAgo(4)));
  insertOrder.run(1, 'TPN per pharmacy', 'medication', 'active', 'routine', 'Dr. Chen', iso(daysAgo(5)));
  insertOrder.run(1, 'Chest X-Ray AP', 'imaging', 'completed', 'routine', 'Dr. Chen', iso(daysAgo(5)));
  insertOrder.run(1, 'Daily Weight', 'nursing', 'active', 'routine', 'Dr. Chen', iso(daysAgo(5)));
  insertOrder.run(1, 'I&O Monitoring q1h', 'nursing', 'active', 'routine', 'Dr. Chen', iso(daysAgo(5)));
  insertOrder.run(1, 'CPAP 5 cmH2O FiO2 0.25', 'nursing', 'active', 'routine', 'Dr. Chen', iso(daysAgo(5)));
  insertOrder.run(1, 'BMP', 'lab', 'completed', 'stat', 'Dr. Chen', iso(hoursAgo(4)));

  // Notes — Garcia
  insertNote.run(1, 'Admission H&P', 'Admission H&P', 'Dr. Sarah Chen', iso(daysAgo(5)),
    `ADMISSION HISTORY & PHYSICAL

PATIENT: Garcia, Miguel    MRN: MRN-2026-0001    DOB: ${iso(garciaDOB).slice(0,10)}
GESTATIONAL AGE: 28 weeks 3 days
BIRTH WEIGHT: 1050 grams (ELBW)

HISTORY OF PRESENT ILLNESS:
Baby boy Garcia was born via emergent cesarean section to a 31-year-old G2P1 mother at 28+3 weeks gestational age due to preeclampsia with severe features. Apgar scores were 5 at 1 minute and 7 at 5 minutes. Infant required CPAP in the delivery room. No surfactant administered in DR.

MATERNAL HISTORY:
Prenatal labs: O+, Ab negative, RPR non-reactive, Rubella immune, HBsAg negative, HIV negative, GBS unknown. Received betamethasone x2 doses completed 48h prior to delivery. Magnesium sulfate given for neuroprotection.

PHYSICAL EXAMINATION:
General: Preterm male infant, appropriate for gestational age. Active, responsive.
HEENT: Anterior fontanelle soft and flat. Eyes fused bilaterally (expected for GA).
Cardiovascular: Regular rate and rhythm, no murmur. Capillary refill <3 seconds.
Respiratory: Mild subcostal retractions on CPAP. Bilateral air entry equal.
Abdomen: Soft, non-distended. Umbilical cord with 3 vessels.
Extremities: Well perfused, normal tone for GA.
Skin: Pink, no rashes.

ASSESSMENT:
1. Prematurity at 28+3 weeks
2. Respiratory distress syndrome — on CPAP
3. ELBW infant — 1050g

PLAN:
1. CPAP 5 cmH2O, FiO2 0.25, monitor for surfactant need
2. TPN + lipids, advance to trophic feeds when stable
3. Caffeine citrate for apnea prophylaxis
4. Admission labs: CBC, CRP, blood culture (rule out sepsis per protocol)
5. NeoTherm continuous thermal monitoring initiated
6. Developmental care, minimal stimulation
7. Daily weights, strict I&O

Attending: Dr. Sarah Chen, MD — NICU`, 'signed');

  insertNote.run(1, 'Progress Note — DOL 3', 'Progress Note', 'Dr. Sarah Chen', iso(daysAgo(2)),
    `NICU PROGRESS NOTE — DOL 3

SUBJECTIVE:
Baby Garcia remains on CPAP, tolerating well. No apnea or bradycardia events in past 24 hours. Started trophic feeds yesterday, tolerating 10 mL/kg/day of maternal breast milk via OG tube.

OBJECTIVE:
Weight: 1030g (down 20g from birth weight, expected)
Vitals: HR 148, RR 42, SpO2 96%, Temp 36.8°C (axillary)
NeoTherm CPTD: 0.6°C (normal range)
CPAP: 5 cmH2O, FiO2 0.21 (room air)
I&O: Intake 78 mL, Output 52 mL (adequate UOP 2.1 mL/kg/hr)

ASSESSMENT & PLAN:
1. Prematurity — stable, following growth curve
2. RDS — improving, weaned to RA on CPAP. Will attempt CPAP trial off if continues well.
3. Nutrition — advance feeds by 10 mL/kg/day as tolerated
4. NeoTherm — normal readings, continue monitoring

Dr. Sarah Chen, MD`, 'signed');

  insertNote.run(1, 'Progress Note — DOL 5 (Today)', 'Progress Note', 'Dr. Sarah Chen', iso(hoursAgo(6)),
    `NICU PROGRESS NOTE — DOL 5

SUBJECTIVE:
Nursing reports increased temperature instability over last 6-8 hours. Baby appears slightly less active. No feed intolerance. No apnea events.

OBJECTIVE:
Weight: 1020g
Vitals: HR 172 (trending up from baseline 150), RR 52, SpO2 92%, Temp 37.1°C but labile (36.5-37.2 over past 4h)
NeoTherm: CPTD 3.2°C (CRITICAL — rising from 0.8°C over 8 hours)
  - Core temp stable at 36.8°C
  - Peripheral cooling: hands 32.8°C, feet 31.5°C
  - Pattern consistent with peripheral vasoconstriction (sepsis screening pattern)
Labs (obtained 4h ago):
  - WBC 18.5 (rising), Bands 15%, I:T ratio 0.25
  - CRP 8.4 mg/L (was 2.1 yesterday, 0.5 on admission)
  - Blood gas: pH 7.32, pCO2 48, lactate 3.2
  - Blood cultures pending

ASSESSMENT:
1. Prematurity — now DOL 5
2. RDS — stable on CPAP
3. **Rule out sepsis — HIGH CONCERN**
   - NeoTherm CPTD alert triggered (≥2.0°C for 4+ hours)
   - Rising inflammatory markers (CRP 0.5→2.1→8.4)
   - Left-shifted WBC with bandemia
   - Clinical signs: tachycardia, temperature instability
   - NeoTherm peripheral cooling pattern preceded clinical signs by ~4 hours

PLAN:
1. Started Ampicillin + Gentamicin empirically
2. Blood cultures x2 obtained
3. Continue close monitoring of NeoTherm trends
4. Repeat CBC/CRP in 12 hours
5. Consider LP if cultures positive
6. Notify attending of NeoTherm screening alert
7. Continue CPAP, hold feed advancement

Dr. Sarah Chen, MD`, 'signed');

  insertNote.run(1, 'Nursing Assessment', 'Nursing Assessment', 'RN Jessica Smith', iso(hoursAgo(2)),
    `NURSING ASSESSMENT — 2-HOUR CHECK

Patient: Garcia, Miguel    Bed: 1A

VITAL SIGNS: HR 175, RR 54, SpO2 91%, Temp 36.6°C (axillary)
NeoTherm Alert: ACTIVE — CPTD 3.2°C (Critical level)

NEUROLOGICAL: Baby is less active than baseline. Decreased spontaneous movement. Responsive to stimulation but returns to quiet state quickly. Tone appropriate for GA.

RESPIRATORY: On CPAP 5 cmH2O, FiO2 increased to 0.28 from 0.21 over shift. Mild subcostal retractions. Bilateral breath sounds equal. No desaturation events requiring intervention.

CARDIOVASCULAR: Heart rate trending up (baseline 150, now 175). Cap refill 3 seconds (was 2 seconds at start of shift). Extremities cool to touch — noted before NeoTherm alert flagged.

GI: OG feeds held per order. Abdomen soft, non-distended. Last stool 4 hours ago, normal.

SKIN: Mottling noted on extremities. NeoTherm camera showing cool peripherals. No rashes or skin breakdown.

IV ACCESS: PICC line right upper extremity — flushing well, no redness. Ampicillin and Gentamicin administered via PICC per new orders.

PLAN: Continue q1h vital signs. NeoTherm continuous monitoring. Notify MD of any further deterioration.

— RN Jessica Smith, BSN`, 'signed');

  // Problems — Garcia
  insertProblem.run(1, 'Prematurity (28+3 weeks)', 'P07.32', iso(daysAgo(5)).slice(0,10), 'active', 'Dr. Chen');
  insertProblem.run(1, 'Respiratory Distress Syndrome', 'P22.0', iso(daysAgo(5)).slice(0,10), 'active', 'Dr. Chen');
  insertProblem.run(1, 'Extremely Low Birth Weight (1050g)', 'P07.02', iso(daysAgo(5)).slice(0,10), 'active', 'Dr. Chen');
  insertProblem.run(1, 'Rule Out Sepsis', 'P36.9', iso(hoursAgo(4)).slice(0,10), 'active', 'Dr. Chen');

  // Imaging — Garcia
  insertImaging.run(1, 'X-Ray', 'Chest AP', iso(daysAgo(5)), iso(daysAgo(5)),
    'Dr. Chen',
    `CHEST X-RAY AP — PORTABLE

CLINICAL INDICATION: Premature infant, respiratory distress, CPAP placement

FINDINGS:
Endotracheal tube/CPAP: CPAP prongs in appropriate position.
Lungs: Diffuse bilateral granular opacities consistent with surfactant deficiency/RDS. No focal consolidation. No pneumothorax.
Heart: Normal cardiomediastinal silhouette. Heart size normal for age.
Lines/Tubes: OG tube tip at T10, appropriate position. PICC line tip projects over the SVC.
Osseous: No fractures identified.

IMPRESSION:
1. Findings consistent with respiratory distress syndrome (RDS) in the setting of prematurity.
2. No pneumothorax.
3. Lines and tubes in appropriate position.

Radiologist: Dr. Robert Kim, MD`, 'read');

  // BPA — Garcia
  insertBPA.run(1, 'neotherm_cptd',
    'NeoTherm Screening Alert — Elevated CPTD Detected',
    'CPTD has been ≥2.0°C for 4+ consecutive hours. Current CPTD: 3.2°C. Pattern consistent with peripheral vasoconstriction, which may indicate developing sepsis. Consider sepsis workup if not already initiated.',
    3.2, iso(hoursAgo(4)), null, null);

  // Growth — Garcia (DOL 0-5)
  for (let d = 5; d >= 0; d--) {
    insertGrowth.run(1, iso(daysAgo(d)),
      1050 - d * 6 + (5 - d) * (d < 3 ? -3 : 2), // slight weight loss then gain
      36.5, 25.2 + (5 - d) * 0.05);
  }

  // I/O — Garcia (last 24h, q4h)
  for (let h = 24; h >= 0; h -= 4) {
    const t = hoursAgo(h);
    insertIO.run(1, iso(t), 'intake', 'TPN', rand(8, 12), 'TPN at 4 mL/hr');
    insertIO.run(1, iso(t), 'intake', 'feeds', h > 6 ? rand(2, 4) : 0, h > 6 ? 'Breast milk via OG' : 'Feeds held');
    insertIO.run(1, iso(t), 'output', 'urine', rand(4, 8), null);
    if (h % 8 === 0) insertIO.run(1, iso(t), 'output', 'stool', 1, 'Small meconium');
  }

  // ══════════════════════════════════════════════
  // INDEX PATIENT 2: Baby Thompson — Developing NEC
  // ══════════════════════════════════════════════
  const thompsonDOB = daysAgo(3);
  const thompsonAdmit = new Date(thompsonDOB.getTime() + 1 * hour);
  insertPatient.run(2, 'MRN-2026-0002', 'James', 'Thompson', iso(thompsonDOB), 'M',
    32, 1, 1680, 1650, 41.0, 29.5, iso(thompsonAdmit),
    'Level III', '2C', 'Prematurity, Feeding Intolerance', 'Dr. Sarah Chen', 'Full Code', 1, 1);

  // Allergies — Thompson: Penicillin allergy
  insertAllergy.run(2, 'Penicillin', 'Rash', 'Moderate');
  insertAllergy.run(2, 'Latex', 'Contact dermatitis', 'Mild');

  // Vitals — Thompson 48h
  generateVitals(2, 48, (hAgo, total) => {
    const inLast12 = hAgo <= 12;
    const necProg = inLast12 ? (12 - hAgo) / 12 : 0;
    return {
      hr: jitter(155 + necProg * 25, 0.02),
      rr: jitter(48 + necProg * 12, 0.03),
      spo2: jitter(96 - necProg * 3, 0.01),
      temp: jitter(36.5 - necProg * 0.4, 0.005),
      bpSys: jitter(58 - necProg * 8, 0.03),
      bpDia: jitter(34 - necProg * 5, 0.03),
      bpMean: jitter(42 - necProg * 6, 0.03),
    };
  });

  // Thermal — Thompson
  generateThermal(2, 48, (progress) => {
    const inLast12 = progress > (48 - 12) / 48;
    const necProg = inLast12 ? (progress - (48 - 12) / 48) / (12 / 48) : 0;
    const core = 36.5 - necProg * 0.3 + jitter(0, 0.005);
    const handDrop = necProg * 1.5;
    const footDrop = necProg * 2.0;
    const elbowDrop = necProg * 0.7;
    const kneeDrop = necProg * 0.9;
    const abdomenDrop = necProg * 1.2; // NEC: abdomen cools
    const lHand = jitter(34.2 - handDrop, 0.01);
    const rHand = jitter(34.1 - handDrop, 0.01);
    const lFoot = jitter(33.5 - footDrop, 0.01);
    const rFoot = jitter(33.4 - footDrop, 0.01);
    const lElbow = jitter(35.0 - elbowDrop, 0.01);
    const rElbow = jitter(34.9 - elbowDrop, 0.01);
    const lKnee = jitter(34.5 - kneeDrop, 0.01);
    const rKnee = jitter(34.4 - kneeDrop, 0.01);
    const abdomen = jitter(36.2 - abdomenDrop, 0.01);
    const avgPeriph = (lHand + rHand + lFoot + rFoot + lElbow + rElbow + lKnee + rKnee) / 8;
    const cptd = Math.max(0, core - avgPeriph);
    return { cptd, core, lHand, rHand, lFoot, rFoot, lElbow, rElbow, lKnee, rKnee, abdomen };
  });

  // Labs — Thompson
  // Admission labs
  const thompLab1 = daysAgo(3);
  addLab(2, thompLab1, 'CBC w/ Differential', 'WBC', 11.2, 'x10^3/uL', 5.0, 20.0);
  addLab(2, thompLab1, 'CBC w/ Differential', 'Hemoglobin', 16.1, 'g/dL', 13.0, 20.0);
  addLab(2, thompLab1, 'CBC w/ Differential', 'Hematocrit', 47.0, '%', 39.0, 59.0);
  addLab(2, thompLab1, 'CBC w/ Differential', 'Platelets', 245, 'x10^3/uL', 150, 400);
  addLab(2, thompLab1, 'CBC w/ Differential', 'Neutrophils', 52, '%', 30, 70);
  addLab(2, thompLab1, 'CBC w/ Differential', 'Bands', 3, '%', 0, 10);
  addLab(2, thompLab1, 'CRP', 'C-Reactive Protein', 0.3, 'mg/L', 0, 1.0);

  // Today's labs — NEC markers
  const thompLab2 = hoursAgo(3);
  addLab(2, thompLab2, 'CBC w/ Differential', 'WBC', 15.8, 'x10^3/uL', 5.0, 20.0);
  addLab(2, thompLab2, 'CBC w/ Differential', 'Hemoglobin', 14.5, 'g/dL', 13.0, 20.0);
  addLab(2, thompLab2, 'CBC w/ Differential', 'Hematocrit', 42.5, '%', 39.0, 59.0);
  addLab(2, thompLab2, 'CBC w/ Differential', 'Platelets', 95, 'x10^3/uL', 150, 400);
  addLab(2, thompLab2, 'CBC w/ Differential', 'Neutrophils', 65, '%', 30, 70);
  addLab(2, thompLab2, 'CBC w/ Differential', 'Bands', 12, '%', 0, 10);
  addLab(2, thompLab2, 'CRP', 'C-Reactive Protein', 5.8, 'mg/L', 0, 1.0);

  // Blood gas — metabolic acidosis
  addLab(2, thompLab2, 'Blood Gas (VBG)', 'pH', 7.28, '', 7.35, 7.45);
  addLab(2, thompLab2, 'Blood Gas (VBG)', 'pCO2', 42, 'mmHg', 35, 45);
  addLab(2, thompLab2, 'Blood Gas (VBG)', 'HCO3', 18, 'mEq/L', 22, 26);
  addLab(2, thompLab2, 'Blood Gas (VBG)', 'Base Excess', -7, 'mEq/L', -2, 2);
  addLab(2, thompLab2, 'Blood Gas (VBG)', 'Lactate', 4.5, 'mmol/L', 0.5, 2.0);

  // Medications — Thompson
  addMedWithMAR(2, 'TPN', 'Per pharmacy protocol', 'IV', 'Continuous', daysAgo(3));
  addMedWithMAR(2, 'Ampicillin', '50 mg/kg (84 mg)', 'IV', 'q12h', hoursAgo(3));
  addMedWithMAR(2, 'Gentamicin', '4 mg/kg (6.7 mg)', 'IV', 'q24h', hoursAgo(3));
  addMedWithMAR(2, 'Metronidazole', '7.5 mg/kg (12.6 mg)', 'IV', 'q12h', hoursAgo(3));

  // Orders — Thompson
  insertOrder.run(2, 'NPO', 'diet', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(6)));
  insertOrder.run(2, 'TPN per pharmacy', 'medication', 'active', 'routine', 'Dr. Chen', iso(daysAgo(3)));
  insertOrder.run(2, 'Ampicillin 50 mg/kg IV q12h', 'medication', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(3)));
  insertOrder.run(2, 'Gentamicin 4 mg/kg IV q24h', 'medication', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(3)));
  insertOrder.run(2, 'Metronidazole 7.5 mg/kg IV q12h', 'medication', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(3)));
  insertOrder.run(2, 'Abdominal X-Ray (KUB)', 'imaging', 'completed', 'stat', 'Dr. Chen', iso(hoursAgo(4)));
  insertOrder.run(2, 'CBC with Differential', 'lab', 'completed', 'stat', 'Dr. Chen', iso(hoursAgo(3)));
  insertOrder.run(2, 'Blood Gas (VBG)', 'lab', 'completed', 'stat', 'Dr. Chen', iso(hoursAgo(3)));
  insertOrder.run(2, 'Blood Culture x2', 'lab', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(3)));
  insertOrder.run(2, 'Pediatric Surgery Consult', 'consult', 'active', 'urgent', 'Dr. Chen', iso(hoursAgo(2)));
  insertOrder.run(2, 'Serial abdominal exams q4h', 'nursing', 'active', 'stat', 'Dr. Chen', iso(hoursAgo(3)));

  // Notes — Thompson
  insertNote.run(2, 'Admission H&P', 'Admission H&P', 'Dr. Sarah Chen', iso(daysAgo(3)),
    `ADMISSION HISTORY & PHYSICAL

PATIENT: Thompson, James    MRN: MRN-2026-0002    DOB: ${iso(thompsonDOB).slice(0,10)}
GESTATIONAL AGE: 32 weeks 1 day
BIRTH WEIGHT: 1680 grams

HISTORY OF PRESENT ILLNESS:
Baby boy Thompson was born via vaginal delivery at 32+1 weeks gestational age due to preterm premature rupture of membranes (PPROM). Apgar scores were 7 at 1 minute and 8 at 5 minutes. Infant transitioned well with brief nasal cannula support, weaned to room air by 2 hours of life.

MATERNAL HISTORY:
28-year-old G1P0 mother. Prenatal labs unremarkable. Received betamethasone course complete. GBS negative.

PHYSICAL EXAMINATION:
General: Preterm male infant, appropriate for gestational age. Active.
Respiratory: Room air, no distress.
Cardiovascular: RRR, no murmur, cap refill <2 seconds.
Abdomen: Soft, non-distended, active bowel sounds.

ASSESSMENT & PLAN:
1. Prematurity at 32+1 weeks
2. Begin trophic feeds, advance as tolerated
3. NeoTherm monitoring initiated
4. Routine preterm labs

Dr. Sarah Chen, MD`, 'signed');

  insertNote.run(2, 'Progress Note — DOL 3 (Today)', 'Progress Note', 'Dr. Sarah Chen', iso(hoursAgo(3)),
    `NICU PROGRESS NOTE — DOL 3

SUBJECTIVE:
Nursing reports feeding intolerance — bilious aspirates and increasing abdominal distension. Baby has been irritable with episodes of apnea.

OBJECTIVE:
Weight: 1650g
Vitals: HR 178 (up from baseline 155), RR 58, SpO2 93%, Temp 36.1°C (low)
NeoTherm: CPTD 2.8°C (HIGH)
  - Peripheral cooling pattern present
  - Abdominal thermal imaging showing regional cool zones
Abdomen: Distended, tense, discolored (erythematous). Absent bowel sounds. Tender to palpation.
Labs: Platelets 95K (down from 245K), pH 7.28, lactate 4.5, CRP 5.8
AXR: Pneumatosis intestinalis in RLQ, dilated loops

ASSESSMENT:
1. **Suspected NEC (Stage IIA-IIB)** — pneumatosis on imaging, clinical deterioration
   - NeoTherm abdominal thermal pattern correlates with area of concern
   - CPTD 2.8 indicating systemic inflammatory response
2. Thrombocytopenia — likely consumptive, monitor closely
3. Metabolic acidosis — NEC-related

PLAN:
1. NPO, OG to low intermittent suction
2. Triple antibiotics: Ampicillin, Gentamicin, Metronidazole
3. Surgical consult placed — Dr. Williams notified
4. Serial abdominal exams q4h with girth measurements
5. Repeat KUB in 6 hours
6. Type and screen, crossmatch PRBCs and platelets
7. NeoTherm continuous monitoring — correlate abdominal thermal trends

Dr. Sarah Chen, MD`, 'signed');

  // Problems — Thompson
  insertProblem.run(2, 'Prematurity (32+1 weeks)', 'P07.35', iso(daysAgo(3)).slice(0,10), 'active', 'Dr. Chen');
  insertProblem.run(2, 'Feeding Intolerance', 'P92.9', iso(daysAgo(1)).slice(0,10), 'active', 'Dr. Chen');
  insertProblem.run(2, 'Suspected Necrotizing Enterocolitis', 'P77.1', iso(hoursAgo(4)).slice(0,10), 'active', 'Dr. Chen');
  insertProblem.run(2, 'Thrombocytopenia', 'P61.0', iso(hoursAgo(3)).slice(0,10), 'active', 'Dr. Chen');
  insertProblem.run(2, 'Metabolic Acidosis', 'E87.2', iso(hoursAgo(3)).slice(0,10), 'active', 'Dr. Chen');

  // Imaging — Thompson
  insertImaging.run(2, 'X-Ray', 'Abdomen KUB', iso(hoursAgo(4)), iso(hoursAgo(3.5)),
    'Dr. Chen',
    `ABDOMINAL X-RAY (KUB) — PORTABLE

CLINICAL INDICATION: Abdominal distension, feeding intolerance, concern for NEC

FINDINGS:
Bowel gas pattern: Multiple dilated loops of small bowel. Pneumatosis intestinalis noted in the right lower quadrant, with a bubbly/linear pattern along the bowel wall. No portal venous gas identified. No free intraperitoneal air (no pneumoperitoneum).

Soft tissues: Mild generalized abdominal distension. No calcifications.

Lines/Tubes: OG tube tip in stomach in appropriate position. Umbilical venous catheter tip projects at T9.

IMPRESSION:
1. Pneumatosis intestinalis in the right lower quadrant — findings consistent with necrotizing enterocolitis (NEC), Stage IIA per modified Bell staging.
2. Dilated loops of bowel suggesting ileus.
3. No free air to suggest perforation at this time.
4. Recommend serial abdominal radiographs and close clinical monitoring.

Radiologist: Dr. Robert Kim, MD`, 'read');

  insertImaging.run(2, 'Ultrasound', 'Head', iso(daysAgo(2)), iso(daysAgo(2)),
    'Dr. Chen',
    `HEAD ULTRASOUND

CLINICAL INDICATION: Preterm infant, routine screening

FINDINGS:
Ventricles: Normal size and configuration. No intraventricular hemorrhage. Germinal matrix appears intact bilaterally.
Brain parenchyma: Normal echogenicity. No periventricular leukomalacia. No cystic changes.
Posterior fossa: Normal appearance of cerebellum.

IMPRESSION:
1. Normal head ultrasound for gestational age.
2. No intraventricular hemorrhage.

Radiologist: Dr. Robert Kim, MD`, 'read');

  // BPA — Thompson
  insertBPA.run(2, 'neotherm_nec_pattern',
    'NeoTherm Screening Alert — Abdominal Thermal Pattern Consistent with NEC',
    'CPTD 2.8°C with abdominal regional cooling detected. Thermal pattern shows decreased perfusion in right lower quadrant correlating with clinical findings. This pattern has been associated with bowel ischemia in preterm infants.',
    2.8, iso(hoursAgo(5)), null, null);

  // Growth — Thompson (DOL 0-3)
  for (let d = 3; d >= 0; d--) {
    insertGrowth.run(2, iso(daysAgo(d)),
      1680 - d * 10 + (3 - d) * (d < 2 ? -5 : 3),
      41.0, 29.5 + (3 - d) * 0.05);
  }

  // I/O — Thompson
  for (let h = 24; h >= 0; h -= 4) {
    const t = hoursAgo(h);
    insertIO.run(2, iso(t), 'intake', 'TPN', rand(10, 14), 'TPN at 6 mL/hr');
    insertIO.run(2, iso(t), 'intake', 'feeds', h > 6 ? rand(3, 6) : 0, h > 6 ? 'Formula via OG' : 'NPO');
    insertIO.run(2, iso(t), 'output', 'urine', rand(5, 10), null);
    if (h % 12 === 0) insertIO.run(2, iso(t), 'output', 'stool', h > 8 ? 1 : 0, h <= 8 ? 'No stool' : 'Guaiac positive');
  }


  // ══════════════════════════════════════════════
  // INDEX PATIENT 3: Baby Williams — Healthy Control
  // ══════════════════════════════════════════════
  const williamsDOB = daysAgo(2);
  const williamsAdmit = new Date(williamsDOB.getTime() + 1 * hour);
  insertPatient.run(3, 'MRN-2026-0003', 'Ava', 'Williams', iso(williamsDOB), 'F',
    36, 0, 2450, 2410, 46.5, 33.0, iso(williamsAdmit),
    'Level II', '3B', 'Rule out sepsis (maternal GBS+)', 'Dr. Michael Torres', 'Full Code', 1, 0);

  // Allergies — Williams: NKDA
  insertAllergy.run(3, 'No Known Drug Allergies', 'N/A', 'N/A');

  // Vitals — Williams: stable
  generateVitals(3, 48, (hAgo, total) => ({
    hr: jitter(140, 0.03),
    rr: jitter(42, 0.04),
    spo2: jitter(97, 0.01),
    temp: jitter(36.8, 0.005),
    bpSys: jitter(65, 0.03),
    bpDia: jitter(38, 0.03),
    bpMean: jitter(47, 0.03),
  }));

  // Thermal — Williams: normal stable
  generateThermal(3, 48, (progress) => {
    const core = jitter(36.8, 0.003);
    const lHand = jitter(34.8, 0.01);
    const rHand = jitter(34.7, 0.01);
    const lFoot = jitter(34.2, 0.01);
    const rFoot = jitter(34.1, 0.01);
    const lElbow = jitter(35.5, 0.008);
    const rElbow = jitter(35.4, 0.008);
    const lKnee = jitter(35.0, 0.008);
    const rKnee = jitter(34.9, 0.008);
    const avgPeriph = (lHand + rHand + lFoot + rFoot + lElbow + rElbow + lKnee + rKnee) / 8;
    const cptd = Math.max(0, core - avgPeriph);
    return { cptd, core, lHand, rHand, lFoot, rFoot, lElbow, rElbow, lKnee, rKnee, abdomen: jitter(36.5, 0.005) };
  });

  // Labs — Williams: normal
  const willLab1 = daysAgo(2);
  addLab(3, willLab1, 'CBC w/ Differential', 'WBC', 13.2, 'x10^3/uL', 5.0, 20.0);
  addLab(3, willLab1, 'CBC w/ Differential', 'Hemoglobin', 17.5, 'g/dL', 13.0, 20.0);
  addLab(3, willLab1, 'CBC w/ Differential', 'Hematocrit', 51.0, '%', 39.0, 59.0);
  addLab(3, willLab1, 'CBC w/ Differential', 'Platelets', 280, 'x10^3/uL', 150, 400);
  addLab(3, willLab1, 'CBC w/ Differential', 'Neutrophils', 48, '%', 30, 70);
  addLab(3, willLab1, 'CBC w/ Differential', 'Bands', 2, '%', 0, 10);
  addLab(3, willLab1, 'CBC w/ Differential', 'I:T Ratio', 0.04, 'ratio', 0, 0.2);
  addLab(3, willLab1, 'CRP', 'C-Reactive Protein', 0.3, 'mg/L', 0, 1.0);
  addLab(3, willLab1, 'Blood Culture', 'Blood Culture (36h)', 0, 'status', 0, 0); // negative

  // Bilirubin
  addLab(3, daysAgo(1), 'Bilirubin', 'Total Bilirubin', 8.2, 'mg/dL', 0, 12.0);
  addLab(3, daysAgo(1), 'Bilirubin', 'Direct Bilirubin', 0.4, 'mg/dL', 0, 0.5);

  // BMP
  addLab(3, willLab1, 'BMP', 'Glucose', 72, 'mg/dL', 40, 110);
  addLab(3, willLab1, 'BMP', 'Sodium', 140, 'mEq/L', 135, 145);
  addLab(3, willLab1, 'BMP', 'Potassium', 4.2, 'mEq/L', 3.5, 5.5);
  addLab(3, willLab1, 'BMP', 'Calcium', 9.5, 'mg/dL', 7.0, 11.0);

  // Medications — Williams
  addMedWithMAR(3, 'Ampicillin', '50 mg/kg (122 mg)', 'IV', 'q12h', daysAgo(2));
  addMedWithMAR(3, 'Gentamicin', '4 mg/kg (9.8 mg)', 'IV', 'q24h', daysAgo(2));

  // Orders — Williams
  insertOrder.run(3, 'Ampicillin 50 mg/kg IV q12h x 48h', 'medication', 'active', 'routine', 'Dr. Torres', iso(daysAgo(2)));
  insertOrder.run(3, 'Gentamicin 4 mg/kg IV q24h x 48h', 'medication', 'active', 'routine', 'Dr. Torres', iso(daysAgo(2)));
  insertOrder.run(3, 'CBC with Differential', 'lab', 'completed', 'routine', 'Dr. Torres', iso(daysAgo(2)));
  insertOrder.run(3, 'Blood Culture', 'lab', 'completed', 'routine', 'Dr. Torres', iso(daysAgo(2)));
  insertOrder.run(3, 'CRP', 'lab', 'completed', 'routine', 'Dr. Torres', iso(daysAgo(2)));
  insertOrder.run(3, 'Breast Milk ad lib q3h', 'diet', 'active', 'routine', 'Dr. Torres', iso(daysAgo(2)));
  insertOrder.run(3, 'Bilirubin Total/Direct', 'lab', 'completed', 'routine', 'Dr. Torres', iso(daysAgo(1)));
  insertOrder.run(3, 'Daily Weight', 'nursing', 'active', 'routine', 'Dr. Torres', iso(daysAgo(2)));

  // Notes — Williams
  insertNote.run(3, 'Admission H&P', 'Admission H&P', 'Dr. Michael Torres', iso(daysAgo(2)),
    `ADMISSION HISTORY & PHYSICAL

PATIENT: Williams, Ava    MRN: MRN-2026-0003    DOB: ${iso(williamsDOB).slice(0,10)}
GESTATIONAL AGE: 36 weeks 0 days
BIRTH WEIGHT: 2450 grams

HISTORY OF PRESENT ILLNESS:
Baby girl Williams was born via normal spontaneous vaginal delivery at 36+0 weeks to a 34-year-old G3P2 mother. Delivery uncomplicated. Apgar scores 8 and 9. Infant transitioned well on room air. Admitted for 48-hour rule-out sepsis due to maternal GBS colonization with inadequate intrapartum antibiotic prophylaxis (IAP received <4 hours before delivery).

PHYSICAL EXAMINATION:
General: Late preterm female infant, well-appearing, vigorous.
All systems within normal limits for gestational age.

ASSESSMENT & PLAN:
1. Late preterm (36+0) — monitor for feeding and temperature regulation
2. Rule out sepsis — Ampicillin + Gentamicin x 48h, blood culture sent
3. Breastfeeding — mother at bedside, lactation support
4. NeoTherm monitoring as part of NICU standard care

Dr. Michael Torres, MD`, 'signed');

  insertNote.run(3, 'Progress Note — DOL 2 (Today)', 'Progress Note', 'Dr. Michael Torres', iso(hoursAgo(8)),
    `NICU PROGRESS NOTE — DOL 2

SUBJECTIVE:
Baby Williams doing very well. Breastfeeding vigorously. No temperature instability, no apnea/bradycardia, no feeding intolerance.

OBJECTIVE:
Weight: 2410g (expected physiological weight loss)
Vitals: All within normal limits. HR 140, RR 42, SpO2 97%, Temp 36.8°C
NeoTherm: CPTD 0.5°C (normal, stable for entire admission)
Blood culture: No growth at 36 hours
Labs: CBC normal, CRP 0.3 (normal)

ASSESSMENT & PLAN:
1. Rule out sepsis — blood culture negative at 36h, CRP normal. Will complete 48h antibiotic course and discontinue.
2. Anticipate discharge tomorrow if continues well
3. NeoTherm confirms stable thermoregulation — excellent control
4. Continue breastfeeding, monitor bilirubin

Dr. Michael Torres, MD`, 'signed');

  // Problems — Williams
  insertProblem.run(3, 'Rule Out Sepsis (maternal GBS+)', 'P36.9', iso(daysAgo(2)).slice(0,10), 'active', 'Dr. Torres');
  insertProblem.run(3, 'Late Preterm Infant (36+0 weeks)', 'P07.39', iso(daysAgo(2)).slice(0,10), 'active', 'Dr. Torres');
  insertProblem.run(3, 'Maternal GBS Colonization', 'P00.82', iso(daysAgo(2)).slice(0,10), 'active', 'Dr. Torres');

  // Growth — Williams
  for (let d = 2; d >= 0; d--) {
    insertGrowth.run(3, iso(daysAgo(d)),
      2450 - d * 20 + (2 - d) * 5,
      46.5, 33.0 + (2 - d) * 0.03);
  }

  // I/O — Williams
  for (let h = 24; h >= 0; h -= 4) {
    const t = hoursAgo(h);
    insertIO.run(3, iso(t), 'intake', 'feeds', rand(15, 25), 'Breast milk, breastfeeding');
    insertIO.run(3, iso(t), 'output', 'urine', rand(8, 15), 'Adequate');
    if (h % 8 === 0) insertIO.run(3, iso(t), 'output', 'stool', 1, 'Transitional');
  }


  // ══════════════════════════════════════════════
  // BACKGROUND PATIENTS (9 patients, id 4-12)
  // ══════════════════════════════════════════════
  const bgPatients = [
    { id: 4, mrn: 'MRN-2026-0004', first: 'Sophia', last: 'Martinez', sex: 'F', gaW: 30, gaD: 2, bw: 1320, bed: '1B', dx: 'Prematurity, Apnea of Prematurity', acuity: 'Level III', attending: 'Dr. Chen', dol: 8 },
    { id: 5, mrn: 'MRN-2026-0005', first: 'Liam', last: 'Johnson', sex: 'M', gaW: 34, gaD: 5, bw: 2100, bed: '1C', dx: 'Hyperbilirubinemia', acuity: 'Level II', attending: 'Dr. Torres', dol: 3 },
    { id: 6, mrn: 'MRN-2026-0006', first: 'Emma', last: 'Davis', sex: 'F', gaW: 29, gaD: 0, bw: 1180, bed: '2A', dx: 'Prematurity, RDS', acuity: 'Level III', attending: 'Dr. Chen', dol: 10 },
    { id: 7, mrn: 'MRN-2026-0007', first: 'Noah', last: 'Wilson', sex: 'M', gaW: 33, gaD: 3, bw: 1850, bed: '2B', dx: 'Feeding Difficulty', acuity: 'Level II', attending: 'Dr. Torres', dol: 5 },
    { id: 8, mrn: 'MRN-2026-0008', first: 'Olivia', last: 'Brown', sex: 'F', gaW: 27, gaD: 4, bw: 980, bed: '3A', dx: 'Prematurity, BPD', acuity: 'Level III', attending: 'Dr. Chen', dol: 21 },
    { id: 9, mrn: 'MRN-2026-0009', first: 'Ethan', last: 'Taylor', sex: 'M', gaW: 35, gaD: 1, bw: 2280, bed: '3C', dx: 'Hypoglycemia', acuity: 'Level II', attending: 'Dr. Torres', dol: 2 },
    { id: 10, mrn: 'MRN-2026-0010', first: 'Isabella', last: 'Anderson', sex: 'F', gaW: 31, gaD: 6, bw: 1520, bed: '4A', dx: 'Prematurity, PDA', acuity: 'Level III', attending: 'Dr. Chen', dol: 7 },
    { id: 11, mrn: 'MRN-2026-0011', first: 'Mason', last: 'Thomas', sex: 'M', gaW: 37, gaD: 2, bw: 2680, bed: '4B', dx: 'TTN (Transient Tachypnea)', acuity: 'Level II', attending: 'Dr. Torres', dol: 1 },
    { id: 12, mrn: 'MRN-2026-0012', first: 'Charlotte', last: 'Jackson', sex: 'F', gaW: 26, gaD: 5, bw: 890, bed: '4C', dx: 'Prematurity, IVH Grade I', acuity: 'Level IV', attending: 'Dr. Chen', dol: 14 },
  ];

  const bgProblems = {
    4: [['Prematurity (30+2 weeks)', 'P07.33'], ['Apnea of Prematurity', 'P28.4']],
    5: [['Hyperbilirubinemia', 'P59.9'], ['Late Preterm Infant', 'P07.38']],
    6: [['Prematurity (29+0 weeks)', 'P07.32'], ['Respiratory Distress Syndrome', 'P22.0'], ['Anemia of Prematurity', 'P61.2']],
    7: [['Feeding Difficulty', 'P92.9'], ['Moderate Preterm Infant', 'P07.36']],
    8: [['Prematurity (27+4 weeks)', 'P07.31'], ['Bronchopulmonary Dysplasia', 'P27.1'], ['Retinopathy of Prematurity', 'H35.10']],
    9: [['Neonatal Hypoglycemia', 'P70.4'], ['Late Preterm Infant', 'P07.38']],
    10: [['Prematurity (31+6 weeks)', 'P07.34'], ['Patent Ductus Arteriosus', 'Q25.0']],
    11: [['Transient Tachypnea of Newborn', 'P22.1']],
    12: [['Prematurity (26+5 weeks)', 'P07.31'], ['IVH Grade I', 'P52.0'], ['Extremely Low Birth Weight', 'P07.02']],
  };

  const bgMeds = {
    4: [['Caffeine Citrate', '5 mg/kg', 'IV', 'q24h'], ['TPN', 'Per pharmacy', 'IV', 'Continuous']],
    5: [['Phototherapy', 'Continuous', 'Topical', 'Continuous']],
    6: [['Caffeine Citrate', '5 mg/kg', 'IV', 'q24h'], ['TPN', 'Per pharmacy', 'IV', 'Continuous'], ['Iron Supplement', '2 mg/kg', 'PO', 'q24h']],
    7: [['Vitamin D', '400 IU', 'PO', 'q24h']],
    8: [['Caffeine Citrate', '5 mg/kg', 'IV', 'q24h'], ['Vitamin D', '400 IU', 'PO', 'q24h'], ['Iron Supplement', '2 mg/kg', 'PO', 'q24h']],
    9: [['D10W', '80 mL/kg/day', 'IV', 'Continuous']],
    10: [['Indomethacin', '0.2 mg/kg', 'IV', 'q12h'], ['TPN', 'Per pharmacy', 'IV', 'Continuous']],
    11: [],
    12: [['Caffeine Citrate', '5 mg/kg', 'IV', 'q24h'], ['TPN', 'Per pharmacy', 'IV', 'Continuous'], ['Vitamin D', '400 IU', 'PO', 'q24h']],
  };

  const bgAllergies = {
    4: [['No Known Drug Allergies', 'N/A', 'N/A']],
    5: [['No Known Drug Allergies', 'N/A', 'N/A']],
    6: [['Vancomycin', 'Red Man Syndrome', 'Moderate']],
    7: [['No Known Drug Allergies', 'N/A', 'N/A']],
    8: [['Morphine', 'Respiratory depression', 'Severe'], ['Ibuprofen', 'GI bleeding', 'Moderate']],
    9: [['No Known Drug Allergies', 'N/A', 'N/A']],
    10: [['No Known Drug Allergies', 'N/A', 'N/A']],
    11: [['No Known Drug Allergies', 'N/A', 'N/A']],
    12: [['Amoxicillin', 'Rash', 'Mild']],
  };

  for (const p of bgPatients) {
    const dob = daysAgo(p.dol);
    const admitDate = new Date(dob.getTime() + randInt(1, 4) * hour);
    const currentWeight = p.bw + (p.dol > 5 ? randInt(10, 50) : -randInt(10, 30));
    const length = 30 + p.gaW * 0.5 + rand(0, 2);
    const hc = 22 + p.gaW * 0.35 + rand(0, 1);

    insertPatient.run(p.id, p.mrn, p.first, p.last, iso(dob), p.sex,
      p.gaW, p.gaD, p.bw, currentWeight,
      Math.round(length * 10) / 10, Math.round(hc * 10) / 10,
      iso(admitDate), p.acuity, p.bed, p.dx, p.attending,
      'Full Code', 0, 0);

    // Allergies
    for (const a of bgAllergies[p.id]) {
      insertAllergy.run(p.id, a[0], a[1], a[2]);
    }

    // Vitals — 24h stable
    generateVitals(p.id, 24, () => ({
      hr: jitter(p.gaW < 32 ? 155 : 140, 0.04),
      rr: jitter(p.gaW < 32 ? 48 : 42, 0.05),
      spo2: jitter(96, 0.01),
      temp: jitter(36.7, 0.005),
      bpSys: jitter(p.gaW < 32 ? 52 : 62, 0.04),
      bpDia: jitter(p.gaW < 32 ? 30 : 36, 0.04),
      bpMean: jitter(p.gaW < 32 ? 38 : 45, 0.04),
    }));

    // Thermal — 24h stable normal
    generateThermal(p.id, 24, () => {
      const core = jitter(36.7, 0.004);
      const lHand = jitter(34.5, 0.015);
      const rHand = jitter(34.4, 0.015);
      const lFoot = jitter(34.0, 0.015);
      const rFoot = jitter(33.9, 0.015);
      const lElbow = jitter(35.3, 0.01);
      const rElbow = jitter(35.2, 0.01);
      const lKnee = jitter(34.8, 0.01);
      const rKnee = jitter(34.7, 0.01);
      const avgPeriph = (lHand + rHand + lFoot + rFoot + lElbow + rElbow + lKnee + rKnee) / 8;
      const cptd = Math.max(0, core - avgPeriph);
      return { cptd, core, lHand, rHand, lFoot, rFoot, lElbow, rElbow, lKnee, rKnee, abdomen: jitter(36.3, 0.005) };
    });

    // Labs — 1 normal CBC
    const labTs = daysAgo(Math.min(p.dol, 3));
    addLab(p.id, labTs, 'CBC w/ Differential', 'WBC', jitter(12, 0.15), 'x10^3/uL', 5.0, 20.0);
    addLab(p.id, labTs, 'CBC w/ Differential', 'Hemoglobin', jitter(15.5, 0.08), 'g/dL', 13.0, 20.0);
    addLab(p.id, labTs, 'CBC w/ Differential', 'Hematocrit', jitter(46, 0.08), '%', 39.0, 59.0);
    addLab(p.id, labTs, 'CBC w/ Differential', 'Platelets', jitter(250, 0.15), 'x10^3/uL', 150, 400);
    addLab(p.id, labTs, 'CRP', 'C-Reactive Protein', jitter(0.3, 0.3), 'mg/L', 0, 1.0);

    // Problems
    for (const prob of bgProblems[p.id]) {
      insertProblem.run(p.id, prob[0], prob[1], iso(daysAgo(p.dol)).slice(0,10), 'active', p.attending);
    }

    // Medications + MAR
    for (const med of bgMeds[p.id]) {
      addMedWithMAR(p.id, med[0], med[1], med[2], med[3], daysAgo(Math.min(p.dol, 5)));
    }

    // Orders (basic)
    insertOrder.run(p.id, 'Daily Weight', 'nursing', 'active', 'routine', p.attending, iso(daysAgo(p.dol)));
    insertOrder.run(p.id, 'I&O Monitoring', 'nursing', 'active', 'routine', p.attending, iso(daysAgo(p.dol)));
    for (const med of bgMeds[p.id]) {
      insertOrder.run(p.id, `${med[0]} ${med[1]} ${med[2]} ${med[3]}`, 'medication', 'active', 'routine', p.attending, iso(daysAgo(p.dol)));
    }

    // Notes (1 admission note each)
    insertNote.run(p.id, 'Admission H&P', 'Admission H&P', p.attending, iso(daysAgo(p.dol)),
      `ADMISSION HISTORY & PHYSICAL\n\nPATIENT: ${p.last}, ${p.first}    MRN: ${p.mrn}\nGESTATIONAL AGE: ${p.gaW} weeks ${p.gaD} days\nBIRTH WEIGHT: ${p.bw} grams\n\nDIAGNOSIS: ${p.dx}\n\nAdmitted to NICU for monitoring and management of ${p.dx.toLowerCase()}. Infant is appropriate for gestational age. Initial assessment unremarkable. NeoTherm continuous thermal monitoring initiated per protocol.\n\n${p.attending}`,
      'signed');

    // Growth (daily)
    for (let d = Math.min(p.dol, 5); d >= 0; d--) {
      insertGrowth.run(p.id, iso(daysAgo(d)),
        p.bw + (p.dol - d) * (p.dol > 5 ? 8 : -5),
        Math.round(length * 10) / 10, Math.round(hc * 10) / 10);
    }

    // I/O (last 24h, q4h)
    for (let h = 24; h >= 0; h -= 4) {
      const t = hoursAgo(h);
      insertIO.run(p.id, iso(t), 'intake', 'TPN', rand(5, 15), 'TPN');
      insertIO.run(p.id, iso(t), 'intake', 'feeds', rand(5, 20), 'Breast milk / formula');
      insertIO.run(p.id, iso(t), 'output', 'urine', rand(4, 12), null);
    }
  }

  // Background imaging for select patients
  insertImaging.run(5, 'X-Ray', 'Chest AP', iso(daysAgo(2)), iso(daysAgo(2)), 'Dr. Torres',
    'CHEST X-RAY: Normal cardiac silhouette. Clear lung fields. No acute abnormality.', 'read');
  insertImaging.run(8, 'X-Ray', 'Chest AP', iso(daysAgo(5)), iso(daysAgo(5)), 'Dr. Chen',
    'CHEST X-RAY: Chronic lung changes consistent with developing BPD. Hyperinflation with scattered areas of atelectasis. No acute infiltrate.', 'read');
  insertImaging.run(10, 'Echocardiogram', 'Heart', iso(daysAgo(3)), iso(daysAgo(3)), 'Dr. Chen',
    'ECHOCARDIOGRAM: Small patent ductus arteriosus (PDA), 2.1mm, left-to-right shunt. Left atrial to aortic root ratio 1.4:1 suggesting moderate hemodynamic significance. Normal biventricular function. No other structural abnormality.', 'read');
  insertImaging.run(12, 'Ultrasound', 'Head', iso(daysAgo(7)), iso(daysAgo(7)), 'Dr. Chen',
    'HEAD ULTRASOUND: Small Grade I intraventricular hemorrhage (germinal matrix hemorrhage) in the left caudothalamic groove. No ventricular dilation. No parenchymal involvement. Recommend follow-up in 1 week.', 'read');
};
