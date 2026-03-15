CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY,
  mrn TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  dob DATETIME,
  sex TEXT,
  gestational_age_weeks INTEGER,
  gestational_age_days INTEGER,
  birth_weight_g INTEGER,
  current_weight_g INTEGER,
  current_length_cm REAL,
  head_circumference_cm REAL,
  admit_date DATETIME,
  acuity TEXT,
  bed TEXT,
  admitting_diagnosis TEXT,
  attending TEXT,
  code_status TEXT DEFAULT 'Full Code',
  is_index_patient BOOLEAN DEFAULT 0,
  neotherm_alert_active BOOLEAN DEFAULT 0
);

CREATE TABLE IF NOT EXISTS allergies (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  allergen TEXT,
  reaction TEXT,
  severity TEXT
);

CREATE TABLE IF NOT EXISTS vitals (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  hr INTEGER,
  rr INTEGER,
  spo2 INTEGER,
  temp_axillary REAL,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  bp_mean INTEGER
);

CREATE TABLE IF NOT EXISTS thermal_readings (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  cptd REAL,
  core_temp REAL,
  left_hand REAL,
  right_hand REAL,
  left_foot REAL,
  right_foot REAL,
  left_elbow REAL,
  right_elbow REAL,
  left_knee REAL,
  right_knee REAL,
  abdomen_temp REAL,
  alert_level TEXT
);

CREATE TABLE IF NOT EXISTS lab_results (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  panel TEXT,
  test_name TEXT,
  value REAL,
  unit TEXT,
  reference_low REAL,
  reference_high REAL,
  flag TEXT
);

CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  drug_name TEXT,
  dose TEXT,
  route TEXT,
  frequency TEXT,
  start_date DATETIME,
  end_date DATETIME,
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS mar_entries (
  id INTEGER PRIMARY KEY,
  medication_id INTEGER REFERENCES medications(id),
  scheduled_time DATETIME,
  status TEXT,
  administered_by TEXT,
  administered_at DATETIME
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  order_text TEXT,
  category TEXT,
  status TEXT,
  priority TEXT,
  ordered_by TEXT,
  ordered_at DATETIME
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  title TEXT,
  note_type TEXT,
  author TEXT,
  timestamp DATETIME,
  body TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS problems (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  description TEXT,
  icd10 TEXT,
  onset_date DATE,
  status TEXT,
  noted_by TEXT
);

CREATE TABLE IF NOT EXISTS imaging_studies (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  modality TEXT,
  body_part TEXT,
  ordered_at DATETIME,
  completed_at DATETIME,
  ordering_provider TEXT,
  report_text TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS growth_measurements (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  weight_g INTEGER,
  length_cm REAL,
  head_circumference_cm REAL
);

CREATE TABLE IF NOT EXISTS bpa_alerts (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  alert_type TEXT,
  title TEXT,
  summary TEXT,
  cptd_value REAL,
  triggered_at DATETIME,
  acknowledged_at DATETIME,
  acknowledged_by TEXT
);

CREATE TABLE IF NOT EXISTS order_catalog (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,
  default_dose TEXT,
  default_route TEXT,
  default_frequency TEXT
);

CREATE TABLE IF NOT EXISTS intake_output (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  type TEXT,
  category TEXT,
  amount_ml REAL,
  notes TEXT
);
