import type {
  Patient,
  Vital,
  ThermalReading,
  LabResult,
  Medication,
  MAREntry,
  Order,
  Note,
  Problem,
  ImagingStudy,
  Allergy,
  BPAAlert,
  OrderCatalogItem,
  GrowthMeasurement,
  IntakeOutput,
} from './types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ── Patient Census ──
export const fetchPatients = (search?: string): Promise<Patient[]> =>
  get<Patient[]>(search ? `/patients?search=${encodeURIComponent(search)}` : '/patients');

export const fetchPatient = (id: number): Promise<Patient> =>
  get<Patient>(`/patients/${id}`);

// ── Clinical Data ──
export const fetchVitals = (id: number, hours = 24): Promise<Vital[]> =>
  get<Vital[]>(`/patients/${id}/vitals?hours=${hours}`);

export const fetchThermal = (id: number, hours = 24): Promise<ThermalReading[]> =>
  get<ThermalReading[]>(`/patients/${id}/thermal?hours=${hours}`);

export const fetchLabs = (id: number): Promise<LabResult[]> =>
  get<LabResult[]>(`/patients/${id}/labs`);

export const fetchMedications = (id: number): Promise<Medication[]> =>
  get<Medication[]>(`/patients/${id}/medications`);

export const fetchMAR = (id: number, date?: string): Promise<MAREntry[]> =>
  get<MAREntry[]>(`/patients/${id}/mar${date ? `?date=${date}` : ''}`);

export const fetchOrders = (id: number): Promise<Order[]> =>
  get<Order[]>(`/patients/${id}/orders`);

export const fetchNotes = (id: number): Promise<Note[]> =>
  get<Note[]>(`/patients/${id}/notes`);

export const fetchProblems = (id: number): Promise<Problem[]> =>
  get<Problem[]>(`/patients/${id}/problems`);

export const fetchImaging = (id: number): Promise<ImagingStudy[]> =>
  get<ImagingStudy[]>(`/patients/${id}/imaging`);

export const fetchIO = (id: number): Promise<IntakeOutput[]> =>
  get<IntakeOutput[]>(`/patients/${id}/io`);

export const fetchAllergies = (id: number): Promise<Allergy[]> =>
  get<Allergy[]>(`/patients/${id}/allergies`);

export const fetchBPA = (id: number): Promise<BPAAlert[]> =>
  get<BPAAlert[]>(`/patients/${id}/bpa`);

export const fetchGrowth = (id: number): Promise<GrowthMeasurement[]> =>
  get<GrowthMeasurement[]>(`/patients/${id}/growth`);

// ── Order Catalog ──
export const searchCatalog = (q?: string): Promise<OrderCatalogItem[]> =>
  get<OrderCatalogItem[]>(q ? `/orders/catalog?q=${encodeURIComponent(q)}` : '/orders/catalog');

// ── Mutations ──
export const createOrder = (
  patientId: number,
  body: { order_text: string; category: string; priority: string }
): Promise<{ id: number }> =>
  post<{ id: number }>(`/patients/${patientId}/orders`, body);

export const createNote = (
  patientId: number,
  body: { title: string; note_type: string; body: string }
): Promise<{ id: number }> =>
  post<{ id: number }>(`/patients/${patientId}/notes`, body);

export const updateMAR = (
  patientId: number,
  entryId: number,
  body: { status: string }
): Promise<{ success: boolean }> =>
  post<{ success: boolean }>(`/patients/${patientId}/mar/${entryId}`, body);

export const acknowledgeBPA = (
  patientId: number,
  alertId: number
): Promise<{ success: boolean }> =>
  post<{ success: boolean }>(`/patients/${patientId}/bpa/${alertId}/acknowledge`, {});
