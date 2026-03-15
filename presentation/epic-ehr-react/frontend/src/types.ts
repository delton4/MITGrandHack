export interface Patient {
  id: number;
  mrn: string;
  first_name: string;
  last_name: string;
  dob: string;
  sex: string;
  gestational_age_weeks: number;
  gestational_age_days: number;
  birth_weight_g: number;
  current_weight_g: number;
  current_length_cm: number | null;
  head_circumference_cm: number | null;
  admit_date: string;
  acuity: string;
  bed: string;
  admitting_diagnosis: string;
  attending: string;
  code_status: string;
  is_index_patient: boolean | number;
  neotherm_alert_active: boolean | number;
}

export interface Vital {
  id: number;
  patient_id: number;
  timestamp: string;
  hr: number;
  rr: number;
  spo2: number;
  temp_axillary: number;
  bp_systolic: number;
  bp_diastolic: number;
  bp_mean: number;
}

export interface ThermalReading {
  id: number;
  patient_id: number;
  timestamp: string;
  cptd: number;
  core_temp: number;
  left_hand: number;
  right_hand: number;
  left_foot: number;
  right_foot: number;
  left_elbow: number;
  right_elbow: number;
  left_knee: number;
  right_knee: number;
  abdomen_temp: number;
  alert_level: string;
}

export interface LabResult {
  id: number;
  patient_id: number;
  timestamp: string;
  panel: string;
  test_name: string;
  value: number;
  unit: string;
  reference_low: number | null;
  reference_high: number | null;
  flag: string | null;
}

export interface Medication {
  id: number;
  patient_id: number;
  drug_name: string;
  dose: string;
  route: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

export interface MAREntry {
  id: number;
  medication_id: number;
  scheduled_time: string;
  status: string;
  administered_by: string | null;
  administered_at: string | null;
  drug_name: string;
  dose: string;
  route: string;
  frequency: string;
}

export interface Order {
  id: number;
  patient_id: number;
  order_text: string;
  category: string;
  status: string;
  priority: string;
  ordered_by: string;
  ordered_at: string;
}

export interface Note {
  id: number;
  patient_id: number;
  title: string;
  note_type: string;
  author: string;
  timestamp: string;
  body: string;
  status: string;
}

export interface Problem {
  id: number;
  patient_id: number;
  description: string;
  icd10: string;
  onset_date: string;
  status: string;
  noted_by: string;
}

export interface ImagingStudy {
  id: number;
  patient_id: number;
  modality: string;
  body_part: string;
  ordered_at: string;
  completed_at: string | null;
  ordering_provider: string;
  report_text: string | null;
  status: string;
}

export interface Allergy {
  id: number;
  patient_id: number;
  allergen: string;
  reaction: string;
  severity: string;
}

export interface BPAAlert {
  id: number;
  patient_id: number;
  alert_type: string;
  title: string;
  summary: string;
  cptd_value: number;
  triggered_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

export interface OrderCatalogItem {
  id: number;
  name: string;
  category: string;
  default_dose: string | null;
  default_route: string | null;
  default_frequency: string | null;
}

export interface GrowthMeasurement {
  id: number;
  patient_id: number;
  timestamp: string;
  weight_g: number;
  length_cm: number | null;
  head_circumference_cm: number | null;
}

export interface IntakeOutput {
  id: number;
  patient_id: number;
  timestamp: string;
  type: string;
  category: string;
  amount_ml: number;
  notes: string | null;
}

export type NavItem =
  | 'Summary'
  | 'Notes'
  | 'Results Review'
  | 'Orders'
  | 'MAR'
  | 'Flowsheets'
  | 'Problem List'
  | 'Imaging'
  | 'NeoTherm';

export interface Tab {
  id: string;
  label: string;
  type: 'census' | 'chart';
  patientId?: number;
}

export interface AppState {
  tabs: Tab[];
  activeTabId: string;
  activeNav: NavItem;
  bpaAlerts: BPAAlert[];
  showBPA: boolean;
}

export type Action =
  | { type: 'OPEN_CHART'; patient: Patient }
  | { type: 'SWITCH_TAB'; tabId: string }
  | { type: 'CLOSE_TAB'; tabId: string }
  | { type: 'SET_NAV'; nav: NavItem }
  | { type: 'SHOW_BPA'; alerts: BPAAlert[] }
  | { type: 'DISMISS_BPA' };
