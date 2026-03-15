# Epic EHR Replica — Design Specification

## Overview

A fully interactive replica of Epic's Hyperdrive (modern web-based) EHR system, focused on the NICU inpatient workflow. The replica demonstrates how NeoTherm's continuous thermal monitoring system integrates with Epic as a third-party clinical device. Built twice in parallel: once with vanilla HTML/CSS/JS + Express (Approach A) and once with React + FastAPI (Approach B).

## Purpose

Interactive prototype for hackathon demos and investor presentations. Users should be able to click through the full EHR, open patient charts, review vitals, enter orders, and experience NeoTherm integration (BPA alerts, flowsheet data, dedicated widget) as if they were using a real Epic system with NeoTherm installed.

---

## Architecture

### Approach A: Express + Vanilla JS

```
epic-ehr-vanilla/
├── server.js                  # Express server + API routes
├── db/
│   ├── seed.js                # Database seeder (generates all NICU data)
│   └── schema.sql             # SQLite schema
├── public/
│   ├── index.html             # SPA shell (Hyperspace chrome)
│   ├── css/
│   │   ├── epic-theme.css     # Hyperdrive visual theme
│   │   ├── storyboard.css     # Patient banner styles
│   │   ├── flowsheet.css      # Vitals grid styles
│   │   └── components.css     # Shared component styles
│   └── js/
│       ├── app.js             # Router, navigation, state management
│       ├── views/             # One file per major view
│       │   ├── patient-list.js
│       │   ├── synopsis.js
│       │   ├── flowsheet.js
│       │   ├── results.js
│       │   ├── orders.js
│       │   ├── mar.js
│       │   ├── notes.js
│       │   ├── problem-list.js
│       │   ├── imaging.js
│       │   └── neotherm-widget.js
│       ├── components/        # Reusable UI pieces
│       │   ├── storyboard.js
│       │   ├── navigator.js
│       │   ├── tab-bar.js
│       │   ├── bpa-modal.js
│       │   └── order-entry.js
│       └── data/
│           └── api.js         # API client
├── package.json
└── README.md
```

**Stack:** Node.js, Express, SQLite (better-sqlite3), vanilla HTML/CSS/JS
**Run:** `npm install && npm start` → opens at localhost:3000

### Approach B: React + FastAPI

```
epic-ehr-react/
├── backend/
│   ├── main.py                # FastAPI app + routes
│   ├── db.py                  # SQLite connection + queries
│   ├── seed.py                # Database seeder
│   ├── schema.sql             # SQLite schema
│   ├── models.py              # Pydantic response models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Root layout (Hyperspace chrome)
│   │   ├── main.tsx           # Entry point
│   │   ├── api/
│   │   │   └── client.ts      # API client (fetch wrapper)
│   │   ├── components/
│   │   │   ├── TopBar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── Navigator.tsx
│   │   │   ├── Storyboard.tsx
│   │   │   ├── BPAModal.tsx
│   │   │   └── OrderEntry.tsx
│   │   ├── views/
│   │   │   ├── PatientList.tsx
│   │   │   ├── Synopsis.tsx
│   │   │   ├── Flowsheet.tsx
│   │   │   ├── Results.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── MAR.tsx
│   │   │   ├── Notes.tsx
│   │   │   ├── ProblemList.tsx
│   │   │   ├── Imaging.tsx
│   │   │   └── NeoThermWidget.tsx
│   │   ├── hooks/
│   │   │   └── usePatient.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       ├── epic-theme.css
│   │       └── components.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

**Stack:** React 18, TypeScript, Vite, FastAPI, SQLite, Pydantic
**Run:** `cd backend && pip install -r requirements.txt && python main.py` + `cd frontend && npm install && npm run dev`

---

## Epic Hyperdrive UI Structure

### Top Bar
- Left: Epic logo (styled text "Epic" in brand blue)
- Center: Global patient search input
- Right: Context selector ("NICU — Bay 1-3"), notification bell with badge, user menu ("Dr. Martinez, MD")

### Tab Bar
- Horizontal tab strip directly below top bar
- Each open activity is a tab: "My Patients", "Garcia, M.", "Thompson, J.", etc.
- Active tab highlighted, close button on hover
- Click tab to switch context
- Visual style: rounded top corners, subtle bottom border on active

### Patient List View (My Patients / Unit Census)
- Its own tab/activity — not a persistent sidebar
- Table columns: Bed, Patient Name, MRN, GA (gestational age), DOL (day of life), Weight, Dx, Acuity, Alerts (icon badges)
- Row click opens patient chart as new tab
- Header: "NICU Census — 12 Patients" with filter/sort controls
- Alert icons: red dot for active BPA, thermal icon for NeoTherm flag

### Patient Chart — Storyboard Banner
- Collapsible demographics strip at top of chart view
- Left: Patient photo placeholder (infant icon), Name, MRN, DOB, Age (GA + DOL)
- Center: Sex, Weight, Length, Head Circumference, Code Status ("Full Code"), Attending
- Right: FYI flags (icons), Allergy badges (red pills: "NKDA" or specific allergies)
- Subtle bottom border separating from chart content

### Patient Chart — Navigator (Left Menu)
- Vertical icon + label list on left side of chart
- Items (top to bottom):
  - Summary (home icon)
  - Notes (pencil icon)
  - Results Review (flask icon)
  - Orders (clipboard icon)
  - MAR (pill icon)
  - Flowsheets (grid icon)
  - Problem List (list icon)
  - Imaging (x-ray icon)
  - NeoTherm (thermal/flame icon) — third-party widget tab
- Active item highlighted with left accent bar
- Click switches main content area

### BPA Modal (Best Practice Alert)
- Standard Epic modal overlay on chart open for flagged patients
- Header: yellow/orange banner "Best Practice Alert"
- Body:
  - Alert title: "NeoTherm Screening Alert — Elevated CPTD Detected"
  - Clinical summary: "CPTD has been ≥2.0°C for 4+ consecutive hours. Current CPTD: 3.2°C"
  - Trend mini-chart showing last 12 hours of CPTD
  - Recommended actions checklist
- Footer buttons: "Acknowledge" (primary), "Order Sepsis Workup" (secondary), "View NeoTherm Detail" (link), "Dismiss" (text button)
- Semi-transparent backdrop

---

## Chart Views (Main Content Area)

### Synopsis / Summary
- Card-based layout (2-column grid)
- Cards:
  - **Active Problems** — problem list with onset dates
  - **Vitals Snapshot** — latest HR, RR, SpO2, Temp, BP, Weight
  - **Active Medications** — current med list with doses/routes
  - **Recent Results** — last 3-5 lab results with values and flags (H/L/Critical)
  - **Allergies** — allergy list with reaction types
  - **Recent Notes** — last 2-3 note titles with authors and timestamps
  - **NeoTherm Summary** — current CPTD, alert level, 6-hour trend sparkline (integrated card)

**Note on time windows:** Different views show different time windows by design — Synopsis = 6h sparkline for at-a-glance context, BPA modal = 12h for clinical decision context, NeoTherm Widget = 24h for full shift review.

### Flowsheets
- Time-series grid: rows = parameters, columns = timestamps (every 15 min for last 24h)
- Scrollable horizontally
- Parameter groups (expandable):
  - **Vitals**: HR, RR, SpO2, Temp (axillary), BP (systolic/diastolic/mean)
  - **Growth**: Weight, Length, Head Circumference (daily granularity, not q15min — sourced from `growth_measurements` table)
  - **I&O**: Intake (TPN, feeds, meds), Output (urine, stool)
  - **NeoTherm Thermal** (new section): CPTD, Core Temp, L Hand, R Hand, L Foot, R Foot, L Elbow, R Elbow, L Knee, R Knee
- Cell color coding for out-of-range values
- Click a cell to see detail/edit
- NeoTherm rows have thermal color gradient (blue→green→yellow→red)

### Results Review
- Lab results grouped by panel/date
- Panels: CBC w/ Differential, CRP, BMP, Blood Gas (ABG/VBG), Blood Culture, Bilirubin (Total/Direct), Coagulation
- Each result shows: value, units, reference range, flag (H/L/Critical), timestamp
- Abnormal values highlighted (yellow for H/L, red for Critical)
- Trend view: click a lab to see historical graph

### Orders
- Active orders list with columns: Order, Status, Priority, Ordered By, Date
- Categories: Medications, Labs, Imaging, Nursing, Diet, Consults
- "New Order" button opens order entry panel:
  - Search bar (type to search order catalog)
  - Common NICU order sets (quick picks)
  - Order detail form: dose, route, frequency, indication
  - Sign/Submit button
- Order entry is functional — adds to the active list

### MAR (Medication Administration Record)
- Grid: rows = medications, columns = scheduled times (24-hour view)
- Each cell shows: scheduled time, status (given ✓, due ○, late !, held ✕)
- Click cell to "administer" — toggles status
- Medication rows show: drug name, dose, route, frequency
- Common NICU meds: Ampicillin, Gentamicin, Caffeine Citrate, TPN, Lipids, Vitamin K, Erythromycin ointment

### Notes
- List of clinical notes with: title, author, date/time, status (signed/unsigned)
- Note types: Admission H&P, Progress Note, Nursing Assessment, Procedure Note, Consult Note
- Click to expand/read full note text
- "New Note" button opens a text editor with template selection
- Templates are client-side only. Available templates: Admission H&P, Progress Note, Nursing Assessment, Procedure Note, Consult Note. Each template pre-fills the note body with section headers (e.g., "SUBJECTIVE:", "OBJECTIVE:", "ASSESSMENT:", "PLAN:" for a Progress Note). No new table needed.
- Notes contain realistic NICU clinical language

### Problem List
- Two sections: Active Problems, Resolved Problems
- Each problem: description, ICD-10 code, onset date, noted by
- Common NICU problems: Prematurity, RDS, Apnea of prematurity, Hyperbilirubinemia, Rule out sepsis, NEC, PDA, Feeding difficulty, Hypoglycemia

### Imaging
- List of imaging studies: modality, body part, date, status, ordering provider
- Common NICU imaging: Chest X-ray, Abdominal X-ray (KUB), Head Ultrasound, Echocardiogram
- Click to view report text (narrative radiology report)
- No actual images needed — just the text reports (this is how most clinicians interact with imaging in Epic)

### NeoTherm Widget (Dedicated Tab)
- Embedded third-party panel (simulating Epic FDI integration)
- Top section: Real-time thermal heatmap — an SVG of an infant in supine position. Each named zone (hands, feet, elbows, knees, core, abdomen) is a distinct SVG path filled with a color from the thermal gradient scale (32°C = blue #3B82F6, 34°C = green #22C55E, 36°C = yellow #EAB308, 37°C+ = red #EF4444). Uses linear interpolation between thresholds.
- Middle section: CPTD trend chart (24-hour view with threshold bands)
- Bottom section: Zone temperature breakdown table (all body zones, current + min/max/avg for last hour)
- Alert status banner: current level with color coding
- "View Full NeoTherm Dashboard" link (could link to the existing NeoTherm demo)

---

## Data Model (SQLite)

### Tables

```sql
-- Core patient record
patients (
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
  acuity TEXT,  -- 'Level I', 'Level II', 'Level III', 'Level IV'
  bed TEXT,
  admitting_diagnosis TEXT,
  attending TEXT,
  code_status TEXT DEFAULT 'Full Code',
  is_index_patient BOOLEAN DEFAULT FALSE,
  neotherm_alert_active BOOLEAN DEFAULT FALSE
)

-- Allergies
allergies (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  allergen TEXT,
  reaction TEXT,
  severity TEXT
)

-- Vitals (standard bedside monitor data)
vitals (
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
)

-- NeoTherm thermal readings (q15min summaries from continuous camera)
thermal_readings (
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
  alert_level TEXT  -- normal, warning, high, critical
)

-- Lab results
lab_results (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  panel TEXT,
  test_name TEXT,
  value REAL,
  unit TEXT,
  reference_low REAL,
  reference_high REAL,
  flag TEXT  -- NULL, H, L, Critical
)

-- Medications (active med list)
medications (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  drug_name TEXT,
  dose TEXT,
  route TEXT,
  frequency TEXT,
  start_date DATETIME,
  end_date DATETIME,
  status TEXT DEFAULT 'Active'
)

-- MAR entries
mar_entries (
  id INTEGER PRIMARY KEY,
  medication_id INTEGER REFERENCES medications(id),
  scheduled_time DATETIME,
  status TEXT,  -- scheduled, given, due, late, held
  administered_by TEXT,
  administered_at DATETIME
)

-- Orders
orders (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  order_text TEXT,
  category TEXT,  -- medication, lab, imaging, nursing, diet, consult
  status TEXT,    -- active, completed, discontinued
  priority TEXT,  -- routine, stat, urgent
  ordered_by TEXT,
  ordered_at DATETIME
)

-- Clinical notes
notes (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  title TEXT,
  note_type TEXT,
  author TEXT,
  timestamp DATETIME,
  body TEXT,
  status TEXT  -- signed, unsigned, cosign_needed
)

-- Problem list
problems (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  description TEXT,
  icd10 TEXT,
  onset_date DATE,
  status TEXT,  -- active, resolved
  noted_by TEXT
)

-- Imaging studies
imaging_studies (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  modality TEXT,
  body_part TEXT,
  ordered_at DATETIME,
  completed_at DATETIME,
  ordering_provider TEXT,
  report_text TEXT,
  status TEXT  -- ordered, completed, read
)

-- Growth measurements (daily, separate from q15min vitals)
growth_measurements (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  weight_g INTEGER,
  length_cm REAL,
  head_circumference_cm REAL
)

-- BPA alerts (persists acknowledgment state)
bpa_alerts (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  alert_type TEXT,          -- 'neotherm_cptd', 'neotherm_nec_pattern'
  title TEXT,
  summary TEXT,
  cptd_value REAL,
  triggered_at DATETIME,
  acknowledged_at DATETIME, -- NULL if not yet acknowledged
  acknowledged_by TEXT
)

-- Order catalog (searchable catalog for order entry)
order_catalog (
  id INTEGER PRIMARY KEY,
  name TEXT,
  category TEXT,       -- medication, lab, imaging, nursing, diet, consult
  default_dose TEXT,
  default_route TEXT,
  default_frequency TEXT
)

-- I&O tracking
intake_output (
  id INTEGER PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  timestamp DATETIME,
  type TEXT,       -- intake, output
  category TEXT,   -- TPN, feeds, meds, urine, stool
  amount_ml REAL,
  notes TEXT
)
```

---

## Generated Data — Index Patients

### Baby Garcia (Bed 1A) — Developing Sepsis
- 28 weeks GA, DOL 5, birth weight 1050g
- Story: Was stable on CPAP, started showing subtle temperature instability 8 hours ago
- Vitals: HR trending up (150→175), temp becoming labile, SpO2 dipping
- NeoTherm: CPTD rising from 0.8°C to 3.2°C over 8 hours (peripheral cooling from vasoconstriction)
  - Hand temps: dropping from 34.5°C to 32.8°C
  - Foot temps: dropping from 33.8°C to 31.5°C
  - Core stable at 36.8°C
- Labs: CRP climbing (0.5 → 2.1 → 8.4 mg/L), WBC 18.5, I:T ratio 0.25, blood culture pending
- BPA fires on chart open
- Active problems: Prematurity, RDS, Rule out sepsis (added today)
- Meds: Ampicillin, Gentamicin (started 4h ago), Caffeine, TPN

### Baby Thompson (Bed 2C) — Developing NEC
- 32 weeks GA, DOL 3, birth weight 1680g
- Story: Feeding intolerance developing, abdomen becoming distended
- Vitals: HR elevated (160→180), temp low (36.1°C), RR increasing
- NeoTherm: CPTD 2.8°C (gut ischemia causes similar peripheral cooling pattern)
  - Abdominal thermal pattern showing cool zones (simulated in widget)
- Labs: Metabolic acidosis on blood gas (pH 7.28), lactate elevated, thrombocytopenia (platelets 95K)
- Imaging: AXR showing pneumatosis intestinalis
- BPA fires: "NeoTherm Screening Alert — Pattern consistent with NEC"
- Active problems: Prematurity, Feeding intolerance, Suspected NEC
- Meds: NPO, TPN, Ampicillin, Gentamicin, Flagyl

### Baby Williams (Bed 3B) — Healthy Control
- 36 weeks GA, DOL 2, birth weight 2450g
- Story: Admitted for observation, rule-out sepsis (maternal GBS+), doing well
- Vitals: All normal and stable
- NeoTherm: CPTD 0.4-0.6°C (normal, stable)
  - All zones within normal ranges
- Labs: CBC normal, CRP <0.5, blood culture negative at 36h
- No BPA fires
- Active problems: Rule out sepsis (resolving), Maternal GBS colonization
- Meds: Ampicillin/Gentamicin (completing 48h rule-out course)

### Background Patients (9 patients)
Generated with stable vitals, common NICU diagnoses, and normal NeoTherm readings. Enough data to populate the census and allow clicking through charts, but without deep clinical narratives.

---

## Visual Theme — Epic Hyperdrive

- **Background:** White (#FFFFFF) main content, light gray (#F5F5F5) chrome/sidebar
- **Primary accent:** Epic blue (#1F3A93 or similar deep blue)
- **Text:** Dark gray (#333333) primary, medium gray (#666666) secondary
- **Borders:** Light gray (#E0E0E0), 1px
- **Typography:** System sans-serif (Segoe UI, -apple-system), clean and readable
- **Tab bar:** White tabs with rounded top corners, active tab has blue bottom border
- **Navigator:** Left-aligned vertical menu, 48px-wide icons, hover/active states with blue left accent bar
- **Storyboard:** Subtle gray background strip, compact typography
- **Tables/Grids:** Alternating row shading, compact row height (~32px)
- **Buttons:** Rounded corners (4px), blue primary, white secondary with border
- **Modals (BPA):** Centered overlay, white card with drop shadow, yellow/orange alert header bar
- **Alert colors:** Green (#28A745), Yellow (#FFC107), Orange (#FD7E14), Red (#DC3545)
- **NeoTherm branding:** Teal/cyan accent (#00B4D8) within the NeoTherm widget sections to distinguish third-party integration from native Epic

---

## API Endpoints (shared between both implementations)

```
GET    /api/patients                    — Census list (query: ?search=<name_or_mrn>)
GET    /api/patients/:id                — Full patient record
GET    /api/patients/:id/vitals         — Vital signs (query: ?hours=24)
GET    /api/patients/:id/thermal        — NeoTherm thermal readings
GET    /api/patients/:id/labs           — Lab results
GET    /api/patients/:id/medications    — Active medications
GET    /api/patients/:id/mar            — MAR entries (query: ?date=YYYY-MM-DD)
GET    /api/patients/:id/orders         — Orders list
POST   /api/patients/:id/orders         — Place new order
GET    /api/patients/:id/notes          — Clinical notes
POST   /api/patients/:id/notes          — Create new note
GET    /api/patients/:id/problems       — Problem list
GET    /api/patients/:id/imaging        — Imaging studies
GET    /api/patients/:id/io             — Intake/output
GET    /api/patients/:id/allergies      — Allergies
GET    /api/patients/:id/bpa            — Check for active BPAs
POST   /api/patients/:id/mar/:entryId   — Update MAR status (administer/hold)
GET    /api/orders/catalog              — Searchable order catalog (query: ?q=<search_term>)
GET    /api/patients/:id/growth        — Growth measurements
POST   /api/patients/:id/bpa/:alertId/acknowledge — Acknowledge a BPA
```

**MAR query note:** `mar_entries` references `medication_id`, not `patient_id` directly. API implementations must join through `medications` to filter by patient.

**Routing strategy:** Both implementations use client-side tab/state management rather than URL-based routing. There is no need for React Router — the active tab and active navigator item are managed via component state.

---

## Interactive Functionality

All of these work in both implementations:

1. **Patient list → chart navigation:** Click patient row → opens chart tab
2. **Tab management:** Open multiple charts, switch between them, close tabs
3. **Navigator switching:** Click left menu items to swap main content view
4. **BPA interaction:** Modal fires on chart open for flagged patients, buttons work
5. **Order entry:** Search catalog, fill order form, submit → appears in orders list
6. **MAR administration:** Click scheduled med → toggle to "given" with timestamp
7. **Note creation:** Select template, write text, save → appears in notes list
8. **Flowsheet scrolling:** Horizontal scroll through time-series data
9. **Lab trend view:** Click a lab result → see historical trend chart
10. **NeoTherm widget:** Interactive CPTD trend chart, zone breakdown, thermal body outline
11. **Storyboard collapse/expand:** Toggle the demographics banner

---

## UI States

- Show a subtle loading spinner centered in the content area while API calls are in flight
- No error state needed — the demo assumes a local server that is always available
- Designed for 1920x1080 desktop displays only — no responsive/mobile layout required

---

## Success Criteria

1. A clinician or judge looking at the screen should believe they are looking at Epic
2. Clicking through tabs, patients, and views feels responsive and natural
3. NeoTherm integration appears native — not bolted on
4. The 3 index patients tell a compelling clinical story through their data
5. Both implementations (vanilla + React) achieve feature parity
6. Each can be started with a single command (`npm start` / `python main.py + npm run dev`)
