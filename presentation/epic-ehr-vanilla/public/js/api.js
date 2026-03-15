// Epic EHR — API Client (Fetch wrapper)
const API = {
  base: '/api',

  async get(path) {
    const res = await fetch(this.base + path);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async post(path, data) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  // ── Patient endpoints ──
  getPatients(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.get(`/patients${q}`);
  },

  getPatient(id) {
    return this.get(`/patients/${id}`);
  },

  getVitals(id, hours = 24) {
    return this.get(`/patients/${id}/vitals?hours=${hours}`);
  },

  getThermal(id, hours = 24) {
    return this.get(`/patients/${id}/thermal?hours=${hours}`);
  },

  getLabs(id) {
    return this.get(`/patients/${id}/labs`);
  },

  getMedications(id) {
    return this.get(`/patients/${id}/medications`);
  },

  getMAR(id, date) {
    const q = date ? `?date=${date}` : '';
    return this.get(`/patients/${id}/mar${q}`);
  },

  getOrders(id) {
    return this.get(`/patients/${id}/orders`);
  },

  createOrder(id, data) {
    return this.post(`/patients/${id}/orders`, data);
  },

  getNotes(id) {
    return this.get(`/patients/${id}/notes`);
  },

  createNote(id, data) {
    return this.post(`/patients/${id}/notes`, data);
  },

  getProblems(id) {
    return this.get(`/patients/${id}/problems`);
  },

  getImaging(id) {
    return this.get(`/patients/${id}/imaging`);
  },

  getIO(id) {
    return this.get(`/patients/${id}/io`);
  },

  getAllergies(id) {
    return this.get(`/patients/${id}/allergies`);
  },

  getBPA(id) {
    return this.get(`/patients/${id}/bpa`);
  },

  acknowledgeBPA(patientId, alertId) {
    return this.post(`/patients/${patientId}/bpa/${alertId}/acknowledge`, {});
  },

  updateMAR(patientId, entryId, status) {
    return this.post(`/patients/${patientId}/mar/${entryId}`, { status });
  },

  getGrowth(id) {
    return this.get(`/patients/${id}/growth`);
  },

  searchCatalog(q) {
    const query = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.get(`/orders/catalog${query}`);
  },
};
