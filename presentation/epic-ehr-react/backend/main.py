from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3
from datetime import datetime, timedelta

from db import init_db, get_db, rows_to_list, row_to_dict, get_connection
from seed import seed_database
from models import CreateOrder, CreateNote, UpdateMAR


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    conn = get_connection()
    count = conn.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    if count == 0:
        print("Seeding database...")
        seed_database(conn)
        print("Database seeded.")
    conn.close()
    yield


app = FastAPI(title="Epic EHR Replica API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/patients")
def list_patients(search: str | None = None, conn: sqlite3.Connection = Depends(get_db)):
    if search:
        rows = conn.execute(
            "SELECT * FROM patients WHERE first_name LIKE ? OR last_name LIKE ? OR mrn LIKE ?",
            (f"%{search}%", f"%{search}%", f"%{search}%"),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM patients").fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    row = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    return row_to_dict(row)


@app.get("/api/patients/{patient_id}/vitals")
def get_vitals(patient_id: int, hours: int = 24, conn: sqlite3.Connection = Depends(get_db)):
    since = (datetime.now() - timedelta(hours=hours)).isoformat()
    rows = conn.execute(
        "SELECT * FROM vitals WHERE patient_id = ? AND timestamp >= ? ORDER BY timestamp",
        (patient_id, since),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/thermal")
def get_thermal(patient_id: int, hours: int = 24, conn: sqlite3.Connection = Depends(get_db)):
    since = (datetime.now() - timedelta(hours=hours)).isoformat()
    rows = conn.execute(
        "SELECT * FROM thermal_readings WHERE patient_id = ? AND timestamp >= ? ORDER BY timestamp",
        (patient_id, since),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/labs")
def get_labs(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM lab_results WHERE patient_id = ? ORDER BY timestamp DESC",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/medications")
def get_medications(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM medications WHERE patient_id = ? AND status = 'Active'",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/mar")
def get_mar(patient_id: int, date: str | None = None, conn: sqlite3.Connection = Depends(get_db)):
    query = """
        SELECT me.*, m.drug_name, m.dose, m.route, m.frequency
        FROM mar_entries me
        JOIN medications m ON me.medication_id = m.id
        WHERE m.patient_id = ? AND m.status = 'Active'
    """
    params: list = [patient_id]
    if date:
        query += " AND DATE(me.scheduled_time) = ?"
        params.append(date)
    query += " ORDER BY me.scheduled_time"
    rows = conn.execute(query, params).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/orders")
def get_orders(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM orders WHERE patient_id = ? ORDER BY ordered_at DESC",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.post("/api/patients/{patient_id}/orders")
def create_order(patient_id: int, order: CreateOrder, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.execute(
        "INSERT INTO orders (patient_id, order_text, category, status, priority, ordered_by, ordered_at) VALUES (?, ?, ?, 'active', ?, 'Dr. Martinez', ?)",
        (patient_id, order.order_text, order.category, order.priority, datetime.now().isoformat()),
    )
    conn.commit()
    return {"id": cursor.lastrowid}


@app.get("/api/patients/{patient_id}/notes")
def get_notes(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM notes WHERE patient_id = ? ORDER BY timestamp DESC",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.post("/api/patients/{patient_id}/notes")
def create_note(patient_id: int, note: CreateNote, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.execute(
        "INSERT INTO notes (patient_id, title, note_type, author, timestamp, body, status) VALUES (?, ?, ?, 'Dr. Martinez', ?, ?, 'signed')",
        (patient_id, note.title, note.note_type, datetime.now().isoformat(), note.body),
    )
    conn.commit()
    return {"id": cursor.lastrowid}


@app.get("/api/patients/{patient_id}/problems")
def get_problems(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM problems WHERE patient_id = ? ORDER BY status, onset_date",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/imaging")
def get_imaging(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM imaging_studies WHERE patient_id = ? ORDER BY ordered_at DESC",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/io")
def get_io(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM intake_output WHERE patient_id = ? ORDER BY timestamp DESC",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/allergies")
def get_allergies(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM allergies WHERE patient_id = ?",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/bpa")
def get_bpa(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM bpa_alerts WHERE patient_id = ? AND acknowledged_at IS NULL",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.get("/api/patients/{patient_id}/growth")
def get_growth(patient_id: int, conn: sqlite3.Connection = Depends(get_db)):
    rows = conn.execute(
        "SELECT * FROM growth_measurements WHERE patient_id = ? ORDER BY timestamp",
        (patient_id,),
    ).fetchall()
    return rows_to_list(rows)


@app.post("/api/patients/{patient_id}/mar/{entry_id}")
def update_mar(patient_id: int, entry_id: int, update: UpdateMAR, conn: sqlite3.Connection = Depends(get_db)):
    conn.execute(
        "UPDATE mar_entries SET status = ?, administered_by = 'RN Smith', administered_at = ? WHERE id = ?",
        (update.status, datetime.now().isoformat(), entry_id),
    )
    conn.commit()
    return {"success": True}


@app.post("/api/patients/{patient_id}/bpa/{alert_id}/acknowledge")
def acknowledge_bpa(patient_id: int, alert_id: int, conn: sqlite3.Connection = Depends(get_db)):
    conn.execute(
        "UPDATE bpa_alerts SET acknowledged_at = ?, acknowledged_by = 'Dr. Martinez' WHERE id = ?",
        (datetime.now().isoformat(), alert_id),
    )
    conn.commit()
    return {"success": True}


@app.get("/api/orders/catalog")
def search_catalog(q: str | None = None, conn: sqlite3.Connection = Depends(get_db)):
    if q:
        rows = conn.execute(
            "SELECT * FROM order_catalog WHERE name LIKE ? ORDER BY category, name",
            (f"%{q}%",),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM order_catalog ORDER BY category, name").fetchall()
    return rows_to_list(rows)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
