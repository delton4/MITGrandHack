const express = require('express');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Database initialization ──
const db = new Database(path.join(__dirname, 'db', 'ehr.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Auto-seed if empty
const count = db.prepare('SELECT COUNT(*) as n FROM patients').get().n;
if (count === 0) {
  console.log('Seeding database...');
  require('./db/seed')(db);
  console.log('Database seeded.');
}

// ══════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════

// Census list with optional search
app.get('/api/patients', (req, res) => {
  const { search } = req.query;
  let patients;
  if (search) {
    patients = db.prepare(
      "SELECT * FROM patients WHERE first_name LIKE ? OR last_name LIKE ? OR mrn LIKE ?"
    ).all(`%${search}%`, `%${search}%`, `%${search}%`);
  } else {
    patients = db.prepare('SELECT * FROM patients ORDER BY bed').all();
  }
  res.json(patients);
});

// Full patient record
app.get('/api/patients/:id', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// Vitals
app.get('/api/patients/:id/vitals', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const since = new Date(Date.now() - hours * 3600000).toISOString();
  const vitals = db.prepare(
    'SELECT * FROM vitals WHERE patient_id = ? AND timestamp >= ? ORDER BY timestamp'
  ).all(req.params.id, since);
  res.json(vitals);
});

// Thermal readings
app.get('/api/patients/:id/thermal', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const since = new Date(Date.now() - hours * 3600000).toISOString();
  const readings = db.prepare(
    'SELECT * FROM thermal_readings WHERE patient_id = ? AND timestamp >= ? ORDER BY timestamp'
  ).all(req.params.id, since);
  res.json(readings);
});

// Labs
app.get('/api/patients/:id/labs', (req, res) => {
  const labs = db.prepare(
    'SELECT * FROM lab_results WHERE patient_id = ? ORDER BY timestamp DESC, panel, test_name'
  ).all(req.params.id);
  res.json(labs);
});

// Active medications
app.get('/api/patients/:id/medications', (req, res) => {
  const meds = db.prepare(
    "SELECT * FROM medications WHERE patient_id = ? AND status = 'Active'"
  ).all(req.params.id);
  res.json(meds);
});

// MAR entries (join through medications for patient filtering)
app.get('/api/patients/:id/mar', (req, res) => {
  const { date } = req.query;
  let query = `
    SELECT me.*, m.drug_name, m.dose, m.route, m.frequency
    FROM mar_entries me
    JOIN medications m ON me.medication_id = m.id
    WHERE m.patient_id = ? AND m.status = 'Active'
  `;
  const params = [req.params.id];
  if (date) {
    query += ` AND DATE(me.scheduled_time) = ?`;
    params.push(date);
  }
  query += ` ORDER BY m.drug_name, me.scheduled_time`;
  const entries = db.prepare(query).all(...params);
  res.json(entries);
});

// Orders
app.get('/api/patients/:id/orders', (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE patient_id = ? ORDER BY ordered_at DESC'
  ).all(req.params.id);
  res.json(orders);
});

// Notes
app.get('/api/patients/:id/notes', (req, res) => {
  const notes = db.prepare(
    'SELECT * FROM notes WHERE patient_id = ? ORDER BY timestamp DESC'
  ).all(req.params.id);
  res.json(notes);
});

// Problems
app.get('/api/patients/:id/problems', (req, res) => {
  const problems = db.prepare(
    'SELECT * FROM problems WHERE patient_id = ? ORDER BY status, onset_date'
  ).all(req.params.id);
  res.json(problems);
});

// Imaging
app.get('/api/patients/:id/imaging', (req, res) => {
  const studies = db.prepare(
    'SELECT * FROM imaging_studies WHERE patient_id = ? ORDER BY ordered_at DESC'
  ).all(req.params.id);
  res.json(studies);
});

// Intake/Output
app.get('/api/patients/:id/io', (req, res) => {
  const io = db.prepare(
    'SELECT * FROM intake_output WHERE patient_id = ? ORDER BY timestamp DESC'
  ).all(req.params.id);
  res.json(io);
});

// Allergies
app.get('/api/patients/:id/allergies', (req, res) => {
  const allergies = db.prepare(
    'SELECT * FROM allergies WHERE patient_id = ?'
  ).all(req.params.id);
  res.json(allergies);
});

// BPA (unacknowledged alerts)
app.get('/api/patients/:id/bpa', (req, res) => {
  const alerts = db.prepare(
    'SELECT * FROM bpa_alerts WHERE patient_id = ? AND acknowledged_at IS NULL'
  ).all(req.params.id);
  res.json(alerts);
});

// Growth measurements
app.get('/api/patients/:id/growth', (req, res) => {
  const measurements = db.prepare(
    'SELECT * FROM growth_measurements WHERE patient_id = ? ORDER BY timestamp'
  ).all(req.params.id);
  res.json(measurements);
});

// Order catalog search
app.get('/api/orders/catalog', (req, res) => {
  const { q } = req.query;
  let items;
  if (q) {
    items = db.prepare(
      'SELECT * FROM order_catalog WHERE name LIKE ? ORDER BY category, name'
    ).all(`%${q}%`);
  } else {
    items = db.prepare('SELECT * FROM order_catalog ORDER BY category, name').all();
  }
  res.json(items);
});

// ── POST routes ──

// Place new order
app.post('/api/patients/:id/orders', (req, res) => {
  const { order_text, category, priority } = req.body;
  const result = db.prepare(
    'INSERT INTO orders (patient_id, order_text, category, status, priority, ordered_by, ordered_at) VALUES (?, ?, ?, "active", ?, "Dr. Martinez", ?)'
  ).run(req.params.id, order_text, category, priority || 'routine', new Date().toISOString());
  res.json({ id: Number(result.lastInsertRowid) });
});

// Create note
app.post('/api/patients/:id/notes', (req, res) => {
  const { title, note_type, body } = req.body;
  const result = db.prepare(
    'INSERT INTO notes (patient_id, title, note_type, author, timestamp, body, status) VALUES (?, ?, ?, "Dr. Martinez", ?, ?, "signed")'
  ).run(req.params.id, title, note_type, new Date().toISOString(), body);
  res.json({ id: Number(result.lastInsertRowid) });
});

// Update MAR entry
app.post('/api/patients/:id/mar/:entryId', (req, res) => {
  const { status } = req.body;
  db.prepare(
    'UPDATE mar_entries SET status = ?, administered_by = "RN Smith", administered_at = ? WHERE id = ?'
  ).run(status, new Date().toISOString(), req.params.entryId);
  res.json({ success: true });
});

// Acknowledge BPA
app.post('/api/patients/:id/bpa/:alertId/acknowledge', (req, res) => {
  db.prepare(
    'UPDATE bpa_alerts SET acknowledged_at = ?, acknowledged_by = "Dr. Martinez" WHERE id = ?'
  ).run(new Date().toISOString(), req.params.alertId);
  res.json({ success: true });
});

// ── Start server ──
app.listen(PORT, () => {
  console.log(`Epic EHR running at http://localhost:${PORT}`);
});
