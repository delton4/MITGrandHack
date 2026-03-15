"""Seed the EHR database with realistic NICU patient data."""
import sqlite3
import random
from datetime import datetime, timedelta

random.seed(42)

NOW = datetime.now()


def seed_database(conn: sqlite3.Connection):
    seed_order_catalog(conn)
    seed_index_patients(conn)
    seed_background_patients(conn)
    conn.commit()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ts(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def _insert(conn, table, data: dict):
    cols = ", ".join(data.keys())
    placeholders = ", ".join(["?"] * len(data))
    cur = conn.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", list(data.values()))
    return cur.lastrowid


def generate_vitals(conn, patient_id, hours, trend=None):
    """Generate hourly vitals. trend is a dict with keys like 'hr_start', 'hr_end', etc."""
    base_time = NOW - timedelta(hours=hours)
    for h in range(hours):
        t = h / max(hours - 1, 1)  # 0..1 progress
        ts = base_time + timedelta(hours=h)
        if trend:
            hr = int(trend.get("hr_start", 145) + (trend.get("hr_end", 145) - trend.get("hr_start", 145)) * t)
            rr = int(trend.get("rr_start", 42) + (trend.get("rr_end", 42) - trend.get("rr_start", 42)) * t)
            spo2 = int(trend.get("spo2_start", 96) + (trend.get("spo2_end", 96) - trend.get("spo2_start", 96)) * t)
            temp = trend.get("temp_start", 36.8) + (trend.get("temp_end", 36.8) - trend.get("temp_start", 36.8)) * t
            bp_s = int(trend.get("bp_s_start", 55) + (trend.get("bp_s_end", 55) - trend.get("bp_s_start", 55)) * t)
        else:
            hr = random.randint(130, 160)
            rr = random.randint(35, 50)
            spo2 = random.randint(94, 99)
            temp = round(random.uniform(36.5, 37.2), 1)
            bp_s = random.randint(50, 65)

        # Add jitter
        hr += random.randint(-3, 3)
        rr += random.randint(-2, 2)
        spo2 = min(100, max(85, spo2 + random.randint(-1, 1)))
        temp = round(temp + random.uniform(-0.1, 0.1), 1)
        bp_s += random.randint(-2, 2)
        bp_d = bp_s - random.randint(15, 25)
        bp_m = (bp_s + 2 * bp_d) // 3

        _insert(conn, "vitals", {
            "patient_id": patient_id, "timestamp": _ts(ts),
            "hr": hr, "rr": rr, "spo2": spo2, "temp_axillary": temp,
            "bp_systolic": bp_s, "bp_diastolic": bp_d, "bp_mean": bp_m
        })


def generate_thermal(conn, patient_id, hours, cptd_trend=None):
    """Generate q15min thermal readings."""
    base_time = NOW - timedelta(hours=hours)
    n_readings = hours * 4  # q15min
    for i in range(n_readings):
        t = i / max(n_readings - 1, 1)
        ts = base_time + timedelta(minutes=15 * i)

        if cptd_trend:
            core = cptd_trend.get("core", 36.8) + random.uniform(-0.1, 0.1)
            cptd_val = cptd_trend.get("cptd_start", 0.5) + (cptd_trend.get("cptd_end", 0.5) - cptd_trend.get("cptd_start", 0.5)) * t
            lh = core - cptd_val * cptd_trend.get("hand_factor", 0.7) + random.uniform(-0.1, 0.1)
            rh = core - cptd_val * cptd_trend.get("hand_factor", 0.7) + random.uniform(-0.15, 0.15)
            lf = core - cptd_val * cptd_trend.get("foot_factor", 1.0) + random.uniform(-0.1, 0.1)
            rf = core - cptd_val * cptd_trend.get("foot_factor", 1.0) + random.uniform(-0.15, 0.15)
            le = core - cptd_val * 0.3 + random.uniform(-0.1, 0.1)
            re = core - cptd_val * 0.3 + random.uniform(-0.1, 0.1)
            lk = core - cptd_val * 0.4 + random.uniform(-0.1, 0.1)
            rk = core - cptd_val * 0.4 + random.uniform(-0.1, 0.1)
            abd = core - cptd_val * cptd_trend.get("abd_factor", 0.1) + random.uniform(-0.05, 0.05)
        else:
            core = round(random.uniform(36.5, 37.2), 1)
            cptd_val = round(random.uniform(0.3, 0.8), 2)
            lh = core - cptd_val * 0.7 + random.uniform(-0.1, 0.1)
            rh = core - cptd_val * 0.7 + random.uniform(-0.1, 0.1)
            lf = core - cptd_val * 1.0 + random.uniform(-0.1, 0.1)
            rf = core - cptd_val * 1.0 + random.uniform(-0.1, 0.1)
            le = core - cptd_val * 0.3 + random.uniform(-0.1, 0.1)
            re = core - cptd_val * 0.3 + random.uniform(-0.1, 0.1)
            lk = core - cptd_val * 0.4 + random.uniform(-0.1, 0.1)
            rk = core - cptd_val * 0.4 + random.uniform(-0.1, 0.1)
            abd = core - 0.05 + random.uniform(-0.05, 0.05)

        cptd_val = round(cptd_val + random.uniform(-0.05, 0.05), 2)
        if cptd_val < 2.0:
            alert = "normal"
        elif cptd_val < 3.5:
            alert = "warning"
        elif cptd_val < 5.0:
            alert = "high"
        else:
            alert = "critical"

        _insert(conn, "thermal_readings", {
            "patient_id": patient_id, "timestamp": _ts(ts),
            "cptd": round(cptd_val, 2), "core_temp": round(core, 1),
            "left_hand": round(lh, 1), "right_hand": round(rh, 1),
            "left_foot": round(lf, 1), "right_foot": round(rf, 1),
            "left_elbow": round(le, 1), "right_elbow": round(re, 1),
            "left_knee": round(lk, 1), "right_knee": round(rk, 1),
            "abdomen_temp": round(abd, 1), "alert_level": alert,
        })


def generate_labs(conn, patient_id, panels: list[dict]):
    """panels: list of {timestamp, tests: [{panel, test_name, value, unit, ref_low, ref_high, flag}]}"""
    for panel in panels:
        for test in panel["tests"]:
            _insert(conn, "lab_results", {
                "patient_id": patient_id,
                "timestamp": panel["timestamp"],
                "panel": test["panel"],
                "test_name": test["test_name"],
                "value": test["value"],
                "unit": test["unit"],
                "reference_low": test.get("ref_low"),
                "reference_high": test.get("ref_high"),
                "flag": test.get("flag"),
            })


def generate_mar(conn, med_id, start: datetime, freq_hours: int, hours_back: int = 48):
    """Generate MAR entries for a medication."""
    t = start
    end = NOW + timedelta(hours=8)
    while t < end:
        if t < NOW - timedelta(hours=1):
            status = "given"
            admin_by = random.choice(["RN Smith", "RN Johnson", "RN Davis"])
            admin_at = _ts(t + timedelta(minutes=random.randint(0, 15)))
        elif t < NOW + timedelta(minutes=30):
            status = "due"
            admin_by = None
            admin_at = None
        else:
            status = "scheduled"
            admin_by = None
            admin_at = None
        _insert(conn, "mar_entries", {
            "medication_id": med_id,
            "scheduled_time": _ts(t),
            "status": status,
            "administered_by": admin_by,
            "administered_at": admin_at,
        })
        t += timedelta(hours=freq_hours)


def generate_io(conn, patient_id, hours=24):
    base = NOW - timedelta(hours=hours)
    for h in range(0, hours, 4):
        ts = base + timedelta(hours=h)
        _insert(conn, "intake_output", {
            "patient_id": patient_id, "timestamp": _ts(ts),
            "type": "intake", "category": "TPN",
            "amount_ml": round(random.uniform(8, 15), 1), "notes": "TPN via PICC"
        })
        _insert(conn, "intake_output", {
            "patient_id": patient_id, "timestamp": _ts(ts),
            "type": "intake", "category": "feeds",
            "amount_ml": round(random.uniform(5, 25), 1), "notes": "Breast milk via OG"
        })
        _insert(conn, "intake_output", {
            "patient_id": patient_id, "timestamp": _ts(ts),
            "type": "output", "category": "urine",
            "amount_ml": round(random.uniform(5, 20), 1), "notes": None
        })
        if random.random() > 0.5:
            _insert(conn, "intake_output", {
                "patient_id": patient_id, "timestamp": _ts(ts),
                "type": "output", "category": "stool",
                "amount_ml": round(random.uniform(2, 10), 1), "notes": None
            })


def generate_growth(conn, patient_id, dol: int, birth_weight: int, birth_length=None, birth_hc=None):
    for d in range(dol):
        ts = NOW - timedelta(days=dol - d)
        w = birth_weight + d * random.randint(-15, 25)
        l = (birth_length or 38.0) + d * 0.1
        hc = (birth_hc or 28.0) + d * 0.05
        _insert(conn, "growth_measurements", {
            "patient_id": patient_id, "timestamp": _ts(ts),
            "weight_g": w, "length_cm": round(l, 1),
            "head_circumference_cm": round(hc, 1),
        })


# ---------------------------------------------------------------------------
# Order Catalog
# ---------------------------------------------------------------------------

def seed_order_catalog(conn):
    catalog = [
        # Medications (15)
        ("Ampicillin", "medication", "50 mg/kg", "IV", "q8h"),
        ("Gentamicin", "medication", "4 mg/kg", "IV", "q24h"),
        ("Caffeine Citrate", "medication", "5 mg/kg", "IV/PO", "q24h"),
        ("Vancomycin", "medication", "15 mg/kg", "IV", "q12h"),
        ("Acyclovir", "medication", "20 mg/kg", "IV", "q8h"),
        ("TPN", "medication", "Per pharmacy", "IV", "Continuous"),
        ("Lipids 20%", "medication", "3 g/kg/day", "IV", "Continuous"),
        ("Vitamin K", "medication", "1 mg", "IM", "Once"),
        ("Erythromycin Ointment", "medication", "0.5%", "Ophthalmic", "Once"),
        ("Morphine", "medication", "0.05 mg/kg", "IV", "q4h PRN"),
        ("Fentanyl", "medication", "1 mcg/kg", "IV", "q2h PRN"),
        ("Dopamine", "medication", "5 mcg/kg/min", "IV", "Continuous"),
        ("Indomethacin", "medication", "0.2 mg/kg", "IV", "q12h x3"),
        ("Iron Supplement", "medication", "2 mg/kg", "PO", "q24h"),
        ("Vitamin D", "medication", "400 IU", "PO", "q24h"),
        # Labs (10)
        ("CBC with Differential", "lab", None, None, None),
        ("C-Reactive Protein", "lab", None, None, None),
        ("Basic Metabolic Panel", "lab", None, None, None),
        ("Blood Gas (ABG/VBG)", "lab", None, None, None),
        ("Blood Culture", "lab", None, None, None),
        ("Bilirubin Total/Direct", "lab", None, None, None),
        ("Coagulation Panel", "lab", None, None, None),
        ("Type and Screen", "lab", None, None, None),
        ("Urinalysis", "lab", None, None, None),
        ("CSF Studies", "lab", None, None, None),
        # Imaging (8)
        ("Chest X-Ray", "imaging", None, None, None),
        ("Abdominal X-Ray (KUB)", "imaging", None, None, None),
        ("Head Ultrasound", "imaging", None, None, None),
        ("Echocardiogram", "imaging", None, None, None),
        ("Renal Ultrasound", "imaging", None, None, None),
        ("VCUG", "imaging", None, None, None),
        ("Upper GI Series", "imaging", None, None, None),
        ("MRI Brain", "imaging", None, None, None),
        # Nursing (7)
        ("Daily Weight", "nursing", None, None, None),
        ("I&O Monitoring", "nursing", None, None, None),
        ("Neuro Checks q4h", "nursing", None, None, None),
        ("Skin Assessment", "nursing", None, None, None),
        ("Developmental Care", "nursing", None, None, None),
        ("Phototherapy", "nursing", None, None, None),
        ("Wound Care", "nursing", None, None, None),
        # Diet (5)
        ("NPO", "diet", None, None, None),
        ("Trophic Feeds", "diet", "10 mL/kg/day", "OG/NG", "q3h"),
        ("Advance Feeds", "diet", "20 mL/kg/day", "OG/NG", "q3h"),
        ("Breast Milk", "diet", "Per protocol", "OG/NG", "q3h"),
        ("Preterm Formula", "diet", "Per protocol", "OG/NG", "q3h"),
        # Consults (5)
        ("Cardiology Consult", "consult", None, None, None),
        ("Surgery Consult", "consult", None, None, None),
        ("Ophthalmology (ROP Screen)", "consult", None, None, None),
        ("OT/PT Consult", "consult", None, None, None),
        ("Social Work Consult", "consult", None, None, None),
    ]
    for name, cat, dose, route, freq in catalog:
        _insert(conn, "order_catalog", {
            "name": name, "category": cat,
            "default_dose": dose, "default_route": route, "default_frequency": freq,
        })


# ---------------------------------------------------------------------------
# Index Patients
# ---------------------------------------------------------------------------

def seed_index_patients(conn):
    _seed_garcia(conn)
    _seed_thompson(conn)
    _seed_williams(conn)


def _seed_garcia(conn):
    pid = _insert(conn, "patients", {
        "mrn": "MRN0001", "first_name": "Miguel", "last_name": "Garcia",
        "dob": _ts(NOW - timedelta(days=5)), "sex": "M",
        "gestational_age_weeks": 28, "gestational_age_days": 0,
        "birth_weight_g": 1050, "current_weight_g": 1020,
        "current_length_cm": 36.5, "head_circumference_cm": 25.2,
        "admit_date": _ts(NOW - timedelta(days=5)),
        "acuity": "Level III", "bed": "1A",
        "admitting_diagnosis": "Prematurity, RDS", "attending": "Dr. Chen",
        "code_status": "Full Code", "is_index_patient": 1,
        "neotherm_alert_active": 1,
    })

    # Vitals: stable first 40h, then trending bad last 8h
    generate_vitals(conn, pid, 40)
    generate_vitals(conn, pid, 8, trend={
        "hr_start": 150, "hr_end": 178,
        "rr_start": 45, "rr_end": 58,
        "spo2_start": 95, "spo2_end": 91,
        "temp_start": 36.8, "temp_end": 37.3,
        "bp_s_start": 55, "bp_s_end": 48,
    })

    # Thermal: rising CPTD
    generate_thermal(conn, pid, 40)
    generate_thermal(conn, pid, 8, cptd_trend={
        "core": 36.8, "cptd_start": 0.8, "cptd_end": 3.2,
        "hand_factor": 0.7, "foot_factor": 1.0, "abd_factor": 0.1,
    })

    # Labs
    generate_labs(conn, pid, [
        {"timestamp": _ts(NOW - timedelta(days=5)), "tests": [
            {"panel": "CBC", "test_name": "WBC", "value": 12.5, "unit": "K/uL", "ref_low": 5.0, "ref_high": 21.0, "flag": None},
            {"panel": "CBC", "test_name": "Hemoglobin", "value": 16.2, "unit": "g/dL", "ref_low": 13.0, "ref_high": 20.0, "flag": None},
            {"panel": "CBC", "test_name": "Platelets", "value": 225, "unit": "K/uL", "ref_low": 150, "ref_high": 400, "flag": None},
            {"panel": "CBC", "test_name": "Neutrophils", "value": 55, "unit": "%", "ref_low": 30, "ref_high": 70, "flag": None},
            {"panel": "CBC", "test_name": "Bands", "value": 5, "unit": "%", "ref_low": 0, "ref_high": 10, "flag": None},
            {"panel": "CRP", "test_name": "C-Reactive Protein", "value": 0.5, "unit": "mg/L", "ref_low": 0, "ref_high": 1.0, "flag": None},
        ]},
        {"timestamp": _ts(NOW - timedelta(days=1)), "tests": [
            {"panel": "CBC", "test_name": "WBC", "value": 15.8, "unit": "K/uL", "ref_low": 5.0, "ref_high": 21.0, "flag": None},
            {"panel": "CBC", "test_name": "Hemoglobin", "value": 15.5, "unit": "g/dL", "ref_low": 13.0, "ref_high": 20.0, "flag": None},
            {"panel": "CBC", "test_name": "Platelets", "value": 198, "unit": "K/uL", "ref_low": 150, "ref_high": 400, "flag": None},
            {"panel": "CBC", "test_name": "Bands", "value": 12, "unit": "%", "ref_low": 0, "ref_high": 10, "flag": "H"},
            {"panel": "CRP", "test_name": "C-Reactive Protein", "value": 2.1, "unit": "mg/L", "ref_low": 0, "ref_high": 1.0, "flag": "H"},
        ]},
        {"timestamp": _ts(NOW - timedelta(hours=4)), "tests": [
            {"panel": "CBC", "test_name": "WBC", "value": 18.5, "unit": "K/uL", "ref_low": 5.0, "ref_high": 21.0, "flag": None},
            {"panel": "CBC", "test_name": "Hemoglobin", "value": 14.8, "unit": "g/dL", "ref_low": 13.0, "ref_high": 20.0, "flag": None},
            {"panel": "CBC", "test_name": "Platelets", "value": 172, "unit": "K/uL", "ref_low": 150, "ref_high": 400, "flag": None},
            {"panel": "CBC", "test_name": "Bands", "value": 18, "unit": "%", "ref_low": 0, "ref_high": 10, "flag": "H"},
            {"panel": "CBC", "test_name": "I:T Ratio", "value": 0.25, "unit": "ratio", "ref_low": 0, "ref_high": 0.2, "flag": "H"},
            {"panel": "CRP", "test_name": "C-Reactive Protein", "value": 8.4, "unit": "mg/L", "ref_low": 0, "ref_high": 1.0, "flag": "Critical"},
            {"panel": "Blood Culture", "test_name": "Blood Culture", "value": None, "unit": "", "ref_low": None, "ref_high": None, "flag": None},
            {"panel": "BMP", "test_name": "Glucose", "value": 62, "unit": "mg/dL", "ref_low": 40, "ref_high": 100, "flag": None},
            {"panel": "BMP", "test_name": "Sodium", "value": 138, "unit": "mEq/L", "ref_low": 135, "ref_high": 145, "flag": None},
            {"panel": "BMP", "test_name": "Potassium", "value": 4.8, "unit": "mEq/L", "ref_low": 3.5, "ref_high": 5.5, "flag": None},
            {"panel": "Blood Gas", "test_name": "pH", "value": 7.32, "unit": "", "ref_low": 7.35, "ref_high": 7.45, "flag": "L"},
            {"panel": "Blood Gas", "test_name": "pCO2", "value": 48, "unit": "mmHg", "ref_low": 35, "ref_high": 45, "flag": "H"},
            {"panel": "Blood Gas", "test_name": "HCO3", "value": 21, "unit": "mEq/L", "ref_low": 22, "ref_high": 26, "flag": "L"},
        ]},
    ])

    # Medications + MAR
    meds = [
        ("Caffeine Citrate", "5 mg/kg", "IV", "q24h", NOW - timedelta(days=5), 24),
        ("TPN", "Per pharmacy", "IV", "Continuous", NOW - timedelta(days=5), 1),
        ("Ampicillin", "50 mg/kg", "IV", "q8h", NOW - timedelta(hours=4), 8),
        ("Gentamicin", "4 mg/kg", "IV", "q24h", NOW - timedelta(hours=4), 24),
    ]
    for drug, dose, route, freq, start, freq_h in meds:
        mid = _insert(conn, "medications", {
            "patient_id": pid, "drug_name": drug, "dose": dose,
            "route": route, "frequency": freq,
            "start_date": _ts(start), "end_date": None, "status": "Active",
        })
        generate_mar(conn, mid, start, freq_h)

    # Notes
    _insert(conn, "notes", {
        "patient_id": pid, "title": "Admission H&P",
        "note_type": "Admission H&P", "author": "Dr. Chen",
        "timestamp": _ts(NOW - timedelta(days=5)),
        "body": "HISTORY OF PRESENT ILLNESS:\n28+0 week male infant born via emergent C-section for maternal preeclampsia. Apgars 5/7. Required CPAP in delivery room. Birth weight 1050g.\n\nBIRTH HISTORY:\nMaternal age 32, G2P1. Prenatal labs: GBS negative, HIV negative, RPR non-reactive. Received full course of betamethasone 48h prior. ROM at delivery.\n\nPHYSICAL EXAM:\nAFEBRILE. HR 148, RR 52, SpO2 94% on CPAP +6. Weight 1050g.\nHEENT: Anterior fontanelle soft, flat. Palate intact.\nLungs: Mild subcostal retractions, fair air entry bilateral.\nCV: Regular rate and rhythm, no murmur.\nAbdomen: Soft, non-distended, 3-vessel cord.\nNeuro: Age-appropriate tone and reflexes.\n\nASSESSMENT:\n1. Prematurity at 28 weeks\n2. Respiratory distress syndrome\n3. Rule out sepsis\n\nPLAN:\n1. CPAP +6, wean as tolerated\n2. Caffeine citrate for apnea prevention\n3. Blood culture obtained, start ampicillin/gentamicin empirically\n4. TPN via PICC\n5. Trophic feeds when stable",
        "status": "signed",
    })
    _insert(conn, "notes", {
        "patient_id": pid, "title": "Progress Note - DOL 4",
        "note_type": "Progress Note", "author": "Dr. Chen",
        "timestamp": _ts(NOW - timedelta(days=1)),
        "body": "SUBJECTIVE:\nInfant weaned from CPAP to nasal cannula. Tolerating trophic breast milk feeds. Blood culture negative at 48h — antibiotics discontinued per protocol.\n\nOBJECTIVE:\nVS: HR 148, RR 42, SpO2 96% on NC 0.5L, Temp 36.8°C\nWeight: 1025g (down 2.4% from birth — expected)\nExam: Alert, active. Lungs clear. Abdomen soft.\n\nASSESSMENT:\nStable 28-weeker, improving respiratory status.\n\nPLAN:\n1. Wean NC as tolerated\n2. Advance feeds to 20 mL/kg/day\n3. Continue caffeine\n4. Routine labs in AM",
        "status": "signed",
    })
    _insert(conn, "notes", {
        "patient_id": pid, "title": "Progress Note - DOL 5 (Sepsis Concern)",
        "note_type": "Progress Note", "author": "Dr. Chen",
        "timestamp": _ts(NOW - timedelta(hours=2)),
        "body": "SUBJECTIVE:\nNursing reports infant appears less active. Increased apnea episodes over last 4 hours. NeoTherm system flagging elevated CPTD.\n\nOBJECTIVE:\nVS: HR 175 (trending up from 150), RR 55, SpO2 91% on NC (was 96%), Temp 37.1°C (labile)\nNeoTherm CPTD: 3.2°C (rising from 0.8°C over 8 hours)\nLabs: CRP 8.4 (was 0.5), WBC 18.5, I:T ratio 0.25, bands 18%\n\nASSESSMENT:\nClinical picture concerning for late-onset sepsis. NeoTherm thermal screening detected peripheral vasoconstriction pattern consistent with sepsis 4 hours before clinical deterioration became apparent.\n\nPLAN:\n1. Blood culture obtained — restart ampicillin/gentamicin\n2. Consider LP when stable\n3. Increase monitoring — continuous pulse ox\n4. Hold feeds pending clinical improvement\n5. Follow serial CRP and NeoTherm trends",
        "status": "signed",
    })
    _insert(conn, "notes", {
        "patient_id": pid, "title": "Nursing Assessment",
        "note_type": "Nursing Assessment", "author": "RN Smith",
        "timestamp": _ts(NOW - timedelta(hours=1)),
        "body": "ASSESSMENT:\nInfant in isolette, appearing less vigorous than prior shift. Skin mottled, capillary refill 3 seconds. NeoTherm alert active — CPTD elevated.\n\nVITAL SIGNS:\nHR 178, RR 56, SpO2 91%, Temp 37.2°C axillary. Blood pressure 46/28 (MAP 34).\n\nINTERVENTIONS:\nNotified Dr. Chen of vital sign changes and NeoTherm alert. Antibiotics restarted per order. Positioned for comfort. IV access confirmed patent. Feeds held.\n\nPATIENT RESPONSE:\nHR remains elevated. Monitoring closely per physician orders. Parents updated at bedside.",
        "status": "signed",
    })

    # Problems
    for desc, icd, onset_d, status in [
        ("Prematurity, 28 weeks", "P07.32", 5, "active"),
        ("Respiratory Distress Syndrome", "P22.0", 5, "active"),
        ("Rule out sepsis", "P36.9", 0, "active"),
        ("Apnea of prematurity", "P28.4", 4, "active"),
    ]:
        _insert(conn, "problems", {
            "patient_id": pid, "description": desc, "icd10": icd,
            "onset_date": (NOW - timedelta(days=onset_d)).strftime("%Y-%m-%d"),
            "status": status, "noted_by": "Dr. Chen",
        })

    # Orders
    for text, cat, st, pri, hrs_ago in [
        ("Ampicillin 50 mg/kg IV q8h", "medication", "active", "stat", 4),
        ("Gentamicin 4 mg/kg IV q24h", "medication", "active", "stat", 4),
        ("Blood Culture x2", "lab", "active", "stat", 4),
        ("CBC with Differential", "lab", "completed", "stat", 4),
        ("CRP", "lab", "completed", "stat", 4),
        ("Basic Metabolic Panel", "lab", "completed", "stat", 4),
        ("Blood Gas", "lab", "completed", "stat", 4),
        ("Chest X-Ray", "imaging", "completed", "routine", 120),
        ("Caffeine Citrate 5 mg/kg IV q24h", "medication", "active", "routine", 120),
        ("TPN Per pharmacy IV Continuous", "medication", "active", "routine", 120),
        ("Daily Weight", "nursing", "active", "routine", 120),
        ("I&O Monitoring", "nursing", "active", "routine", 120),
    ]:
        _insert(conn, "orders", {
            "patient_id": pid, "order_text": text, "category": cat,
            "status": st, "priority": pri, "ordered_by": "Dr. Chen",
            "ordered_at": _ts(NOW - timedelta(hours=hrs_ago)),
        })

    # Imaging
    _insert(conn, "imaging_studies", {
        "patient_id": pid, "modality": "X-Ray", "body_part": "Chest",
        "ordered_at": _ts(NOW - timedelta(days=5)),
        "completed_at": _ts(NOW - timedelta(days=5, hours=-1)),
        "ordering_provider": "Dr. Chen",
        "report_text": "CHEST X-RAY (AP)\n\nCLINICAL INDICATION: Premature infant with respiratory distress.\n\nFINDINGS: Bilateral diffuse granular opacities consistent with surfactant deficiency / RDS. Air bronchograms present. ET tube tip appropriately positioned. UAC tip at T8. UVC tip at T9. No pneumothorax. Heart size normal.\n\nIMPRESSION: Findings consistent with respiratory distress syndrome (RDS) in premature infant. Lines appropriately positioned.",
        "status": "read",
    })

    # BPA
    _insert(conn, "bpa_alerts", {
        "patient_id": pid, "alert_type": "neotherm_cptd",
        "title": "NeoTherm Screening Alert — Elevated CPTD Detected",
        "summary": f"Core-peripheral temperature difference has been ≥2.0°C for 4+ consecutive hours. Current CPTD: 3.2°C. Peripheral vasoconstriction pattern detected — consistent with early sepsis.",
        "cptd_value": 3.2,
        "triggered_at": _ts(NOW - timedelta(hours=2)),
        "acknowledged_at": None, "acknowledged_by": None,
    })

    # I/O, Growth, Allergies
    generate_io(conn, pid, 48)
    generate_growth(conn, pid, 5, 1050, 36.5, 25.2)
    # Garcia: NKDA (no allergy records)


def _seed_thompson(conn):
    pid = _insert(conn, "patients", {
        "mrn": "MRN0002", "first_name": "Jayden", "last_name": "Thompson",
        "dob": _ts(NOW - timedelta(days=3)), "sex": "M",
        "gestational_age_weeks": 32, "gestational_age_days": 0,
        "birth_weight_g": 1680, "current_weight_g": 1650,
        "current_length_cm": 41.0, "head_circumference_cm": 28.5,
        "admit_date": _ts(NOW - timedelta(days=3)),
        "acuity": "Level III", "bed": "2C",
        "admitting_diagnosis": "Prematurity, Feeding intolerance",
        "attending": "Dr. Patel", "code_status": "Full Code",
        "is_index_patient": 1, "neotherm_alert_active": 1,
    })

    # Vitals — worsening
    generate_vitals(conn, pid, 24)
    generate_vitals(conn, pid, 12, trend={
        "hr_start": 160, "hr_end": 182,
        "rr_start": 48, "rr_end": 62,
        "spo2_start": 95, "spo2_end": 90,
        "temp_start": 36.4, "temp_end": 36.0,
        "bp_s_start": 58, "bp_s_end": 45,
    })

    # Thermal — NEC pattern with abdominal cooling
    generate_thermal(conn, pid, 24)
    generate_thermal(conn, pid, 12, cptd_trend={
        "core": 36.2, "cptd_start": 1.2, "cptd_end": 2.8,
        "hand_factor": 0.6, "foot_factor": 0.9, "abd_factor": 0.5,
    })

    # Labs
    generate_labs(conn, pid, [
        {"timestamp": _ts(NOW - timedelta(days=3)), "tests": [
            {"panel": "CBC", "test_name": "WBC", "value": 11.2, "unit": "K/uL", "ref_low": 5.0, "ref_high": 21.0, "flag": None},
            {"panel": "CBC", "test_name": "Platelets", "value": 215, "unit": "K/uL", "ref_low": 150, "ref_high": 400, "flag": None},
            {"panel": "CRP", "test_name": "C-Reactive Protein", "value": 0.3, "unit": "mg/L", "ref_low": 0, "ref_high": 1.0, "flag": None},
        ]},
        {"timestamp": _ts(NOW - timedelta(hours=6)), "tests": [
            {"panel": "CBC", "test_name": "WBC", "value": 22.5, "unit": "K/uL", "ref_low": 5.0, "ref_high": 21.0, "flag": "H"},
            {"panel": "CBC", "test_name": "Platelets", "value": 95, "unit": "K/uL", "ref_low": 150, "ref_high": 400, "flag": "L"},
            {"panel": "CBC", "test_name": "Hemoglobin", "value": 13.8, "unit": "g/dL", "ref_low": 13.0, "ref_high": 20.0, "flag": None},
            {"panel": "CRP", "test_name": "C-Reactive Protein", "value": 12.5, "unit": "mg/L", "ref_low": 0, "ref_high": 1.0, "flag": "Critical"},
            {"panel": "Blood Gas", "test_name": "pH", "value": 7.28, "unit": "", "ref_low": 7.35, "ref_high": 7.45, "flag": "L"},
            {"panel": "Blood Gas", "test_name": "Lactate", "value": 4.2, "unit": "mmol/L", "ref_low": 0.5, "ref_high": 2.0, "flag": "Critical"},
            {"panel": "Blood Gas", "test_name": "pCO2", "value": 52, "unit": "mmHg", "ref_low": 35, "ref_high": 45, "flag": "H"},
            {"panel": "Blood Gas", "test_name": "HCO3", "value": 18, "unit": "mEq/L", "ref_low": 22, "ref_high": 26, "flag": "L"},
            {"panel": "BMP", "test_name": "Glucose", "value": 48, "unit": "mg/dL", "ref_low": 40, "ref_high": 100, "flag": None},
            {"panel": "BMP", "test_name": "Sodium", "value": 134, "unit": "mEq/L", "ref_low": 135, "ref_high": 145, "flag": "L"},
        ]},
    ])

    # Medications
    meds = [
        ("TPN", "Per pharmacy", "IV", "Continuous", NOW - timedelta(days=3), 1),
        ("Ampicillin", "50 mg/kg", "IV", "q8h", NOW - timedelta(hours=6), 8),
        ("Gentamicin", "4 mg/kg", "IV", "q24h", NOW - timedelta(hours=6), 24),
        ("Metronidazole", "7.5 mg/kg", "IV", "q12h", NOW - timedelta(hours=6), 12),
    ]
    for drug, dose, route, freq, start, freq_h in meds:
        mid = _insert(conn, "medications", {
            "patient_id": pid, "drug_name": drug, "dose": dose,
            "route": route, "frequency": freq,
            "start_date": _ts(start), "end_date": None, "status": "Active",
        })
        generate_mar(conn, mid, start, freq_h)

    # Notes
    _insert(conn, "notes", {
        "patient_id": pid, "title": "Admission H&P",
        "note_type": "Admission H&P", "author": "Dr. Patel",
        "timestamp": _ts(NOW - timedelta(days=3)),
        "body": "HISTORY OF PRESENT ILLNESS:\n32+0 week male infant born via SVD. Apgars 7/8. Mild respiratory distress resolved. Birth weight 1680g.\n\nPHYSICAL EXAM:\nTemp 36.6, HR 152, RR 42, SpO2 97% RA. Well-appearing preterm. Lungs clear. Abdomen soft, non-distended.\n\nASSESSMENT:\n1. Prematurity at 32 weeks\n2. Rule out sepsis (maternal fever)\n\nPLAN:\n1. Blood cultures, empiric antibiotics x 48h\n2. Initiate trophic feeds\n3. Standard preterm monitoring",
        "status": "signed",
    })
    _insert(conn, "notes", {
        "patient_id": pid, "title": "Progress Note - Suspected NEC",
        "note_type": "Progress Note", "author": "Dr. Patel",
        "timestamp": _ts(NOW - timedelta(hours=4)),
        "body": "SUBJECTIVE:\nInfant with increasing abdominal distension, bilious gastric residuals. Three episodes of bloody stools. NeoTherm alert active — abdominal thermal pattern showing cooling consistent with gut ischemia.\n\nOBJECTIVE:\nVS: HR 180, RR 58, SpO2 90%, Temp 36.0°C, BP 45/25\nAbdomen: Markedly distended, tense, discolored. Absent bowel sounds.\nNeoTherm CPTD: 2.8°C with abdominal cooling pattern\nLabs: pH 7.28, lactate 4.2, platelets 95K, CRP 12.5\nAXR: Pneumatosis intestinalis in RLQ\n\nASSESSMENT:\nNecrotizing enterocolitis Stage IIA (Bell's criteria)\nNeoTherm thermal screening detected abdominal cooling pattern prior to clinical deterioration.\n\nPLAN:\n1. NPO, OG to continuous suction\n2. Triple antibiotics: Ampicillin, Gentamicin, Metronidazole\n3. Serial AXR q6h\n4. Surgery consult\n5. IV fluid bolus for hypotension\n6. Serial labs q6h",
        "status": "signed",
    })

    # Problems
    for desc, icd, onset_d, status in [
        ("Prematurity, 32 weeks", "P07.34", 3, "active"),
        ("Feeding intolerance", "P92.9", 1, "active"),
        ("Necrotizing enterocolitis, suspected", "P77.9", 0, "active"),
        ("Thrombocytopenia", "P61.0", 0, "active"),
        ("Metabolic acidosis", "P74.0", 0, "active"),
    ]:
        _insert(conn, "problems", {
            "patient_id": pid, "description": desc, "icd10": icd,
            "onset_date": (NOW - timedelta(days=onset_d)).strftime("%Y-%m-%d"),
            "status": status, "noted_by": "Dr. Patel",
        })

    # Orders
    for text, cat, st, pri, hrs_ago in [
        ("NPO", "diet", "active", "stat", 6),
        ("Ampicillin 50 mg/kg IV q8h", "medication", "active", "stat", 6),
        ("Gentamicin 4 mg/kg IV q24h", "medication", "active", "stat", 6),
        ("Metronidazole 7.5 mg/kg IV q12h", "medication", "active", "stat", 6),
        ("CBC, CRP, BMP q6h", "lab", "active", "stat", 6),
        ("Blood Gas q6h", "lab", "active", "stat", 6),
        ("Blood Culture x2", "lab", "active", "stat", 6),
        ("AXR (KUB) q6h", "imaging", "active", "stat", 6),
        ("Surgery Consult", "consult", "active", "urgent", 4),
        ("TPN Per pharmacy IV Continuous", "medication", "active", "routine", 72),
    ]:
        _insert(conn, "orders", {
            "patient_id": pid, "order_text": text, "category": cat,
            "status": st, "priority": pri, "ordered_by": "Dr. Patel",
            "ordered_at": _ts(NOW - timedelta(hours=hrs_ago)),
        })

    # Imaging
    _insert(conn, "imaging_studies", {
        "patient_id": pid, "modality": "X-Ray", "body_part": "Abdomen (KUB)",
        "ordered_at": _ts(NOW - timedelta(hours=6)),
        "completed_at": _ts(NOW - timedelta(hours=5, minutes=30)),
        "ordering_provider": "Dr. Patel",
        "report_text": "ABDOMINAL X-RAY (KUB)\n\nCLINICAL INDICATION: Premature infant with abdominal distension, bloody stools, concern for NEC.\n\nFINDINGS: Pneumatosis intestinalis noted in the right lower quadrant with intramural gas pattern. Dilated loops of bowel with air-fluid levels. Bowel wall thickening suspected. No free intraperitoneal air identified. No portal venous gas.\n\nIMPRESSION: Findings consistent with Necrotizing Enterocolitis (NEC), Bell Stage IIA. No evidence of perforation. Recommend serial imaging and surgical consultation.",
        "status": "read",
    })
    _insert(conn, "imaging_studies", {
        "patient_id": pid, "modality": "Ultrasound", "body_part": "Head",
        "ordered_at": _ts(NOW - timedelta(days=2)),
        "completed_at": _ts(NOW - timedelta(days=2, hours=-1)),
        "ordering_provider": "Dr. Patel",
        "report_text": "HEAD ULTRASOUND\n\nCLINICAL INDICATION: Preterm infant screening.\n\nFINDINGS: No intraventricular hemorrhage. Ventricles normal in size. No periventricular leukomalacia. Normal anatomy.\n\nIMPRESSION: Normal head ultrasound.",
        "status": "read",
    })

    # BPA
    _insert(conn, "bpa_alerts", {
        "patient_id": pid, "alert_type": "neotherm_nec_pattern",
        "title": "NeoTherm Screening Alert — Pattern Consistent with NEC",
        "summary": "Abdominal thermal pattern shows regional cooling consistent with gut ischemia. CPTD: 2.8°C with peripheral vasoconstriction. Pattern correlates with NEC in conjunction with clinical findings.",
        "cptd_value": 2.8,
        "triggered_at": _ts(NOW - timedelta(hours=5)),
        "acknowledged_at": None, "acknowledged_by": None,
    })

    # Allergies
    _insert(conn, "allergies", {
        "patient_id": pid, "allergen": "Penicillin",
        "reaction": "Rash", "severity": "Moderate",
    })

    generate_io(conn, pid, 24)
    generate_growth(conn, pid, 3, 1680, 41.0, 28.5)


def _seed_williams(conn):
    pid = _insert(conn, "patients", {
        "mrn": "MRN0003", "first_name": "Bella", "last_name": "Williams",
        "dob": _ts(NOW - timedelta(days=2)), "sex": "F",
        "gestational_age_weeks": 36, "gestational_age_days": 0,
        "birth_weight_g": 2450, "current_weight_g": 2380,
        "current_length_cm": 46.0, "head_circumference_cm": 32.0,
        "admit_date": _ts(NOW - timedelta(days=2)),
        "acuity": "Level II", "bed": "3B",
        "admitting_diagnosis": "Rule out sepsis (maternal GBS+)",
        "attending": "Dr. Rodriguez", "code_status": "Full Code",
        "is_index_patient": 1, "neotherm_alert_active": 0,
    })

    generate_vitals(conn, pid, 48)
    generate_thermal(conn, pid, 48)

    generate_labs(conn, pid, [
        {"timestamp": _ts(NOW - timedelta(days=2)), "tests": [
            {"panel": "CBC", "test_name": "WBC", "value": 14.2, "unit": "K/uL", "ref_low": 5.0, "ref_high": 21.0, "flag": None},
            {"panel": "CBC", "test_name": "Hemoglobin", "value": 17.5, "unit": "g/dL", "ref_low": 13.0, "ref_high": 20.0, "flag": None},
            {"panel": "CBC", "test_name": "Platelets", "value": 268, "unit": "K/uL", "ref_low": 150, "ref_high": 400, "flag": None},
            {"panel": "CBC", "test_name": "Bands", "value": 3, "unit": "%", "ref_low": 0, "ref_high": 10, "flag": None},
            {"panel": "CRP", "test_name": "C-Reactive Protein", "value": 0.2, "unit": "mg/L", "ref_low": 0, "ref_high": 1.0, "flag": None},
            {"panel": "Blood Culture", "test_name": "Blood Culture (36h)", "value": None, "unit": "", "ref_low": None, "ref_high": None, "flag": None},
        ]},
    ])

    meds = [
        ("Ampicillin", "50 mg/kg", "IV", "q8h", NOW - timedelta(days=2), 8),
        ("Gentamicin", "4 mg/kg", "IV", "q24h", NOW - timedelta(days=2), 24),
    ]
    for drug, dose, route, freq, start, freq_h in meds:
        mid = _insert(conn, "medications", {
            "patient_id": pid, "drug_name": drug, "dose": dose,
            "route": route, "frequency": freq,
            "start_date": _ts(start), "end_date": None, "status": "Active",
        })
        generate_mar(conn, mid, start, freq_h)

    _insert(conn, "notes", {
        "patient_id": pid, "title": "Admission H&P",
        "note_type": "Admission H&P", "author": "Dr. Rodriguez",
        "timestamp": _ts(NOW - timedelta(days=2)),
        "body": "HISTORY OF PRESENT ILLNESS:\n36+0 week female infant born via SVD. Apgars 8/9. Admitted for sepsis evaluation due to maternal GBS colonization and inadequate intrapartum antibiotic prophylaxis.\n\nPHYSICAL EXAM:\nTemp 36.8, HR 138, RR 38, SpO2 98% RA. Well-appearing near-term infant.\nExam entirely normal. Good tone, active.\n\nASSESSMENT:\n1. Near-term infant\n2. Rule out GBS sepsis\n\nPLAN:\n1. Blood culture, CBC, CRP\n2. Empiric ampicillin/gentamicin x 48h\n3. If cultures negative at 36h, discontinue antibiotics and plan discharge",
        "status": "signed",
    })
    _insert(conn, "notes", {
        "patient_id": pid, "title": "Progress Note - DOL 2",
        "note_type": "Progress Note", "author": "Dr. Rodriguez",
        "timestamp": _ts(NOW - timedelta(hours=6)),
        "body": "SUBJECTIVE:\nInfant doing well. Feeding breast milk ad lib. Mother bonding well.\n\nOBJECTIVE:\nVS stable: HR 142, RR 40, SpO2 99% RA, Temp 36.9°C\nWeight 2380g (2.8% loss — normal physiologic)\nNeoTherm CPTD: 0.5°C — normal, stable thermal pattern\nBlood culture: Negative at 36 hours\nCBC/CRP: Normal\n\nASSESSMENT:\nWell-appearing near-term infant completing sepsis rule-out. Cultures negative.\n\nPLAN:\n1. Complete 48h antibiotic course today\n2. Plan discharge tomorrow if continues well\n3. Newborn screening completed\n4. Hearing screen before discharge",
        "status": "signed",
    })

    for desc, icd, onset_d, status in [
        ("Rule out sepsis (maternal GBS+)", "P36.0", 2, "active"),
        ("Maternal GBS colonization", "Z22.330", 2, "active"),
    ]:
        _insert(conn, "problems", {
            "patient_id": pid, "description": desc, "icd10": icd,
            "onset_date": (NOW - timedelta(days=onset_d)).strftime("%Y-%m-%d"),
            "status": status, "noted_by": "Dr. Rodriguez",
        })

    for text, cat, st, pri, hrs_ago in [
        ("Ampicillin 50 mg/kg IV q8h", "medication", "active", "routine", 48),
        ("Gentamicin 4 mg/kg IV q24h", "medication", "active", "routine", 48),
        ("Blood Culture x1", "lab", "completed", "routine", 48),
        ("CBC with Differential", "lab", "completed", "routine", 48),
        ("CRP", "lab", "completed", "routine", 48),
        ("Breast Milk ad lib", "diet", "active", "routine", 48),
        ("Daily Weight", "nursing", "active", "routine", 48),
    ]:
        _insert(conn, "orders", {
            "patient_id": pid, "order_text": text, "category": cat,
            "status": st, "priority": pri, "ordered_by": "Dr. Rodriguez",
            "ordered_at": _ts(NOW - timedelta(hours=hrs_ago)),
        })

    generate_io(conn, pid, 48)
    generate_growth(conn, pid, 2, 2450, 46.0, 32.0)


# ---------------------------------------------------------------------------
# Background Patients
# ---------------------------------------------------------------------------

def seed_background_patients(conn):
    backgrounds = [
        {"first": "Aiden", "last": "Martinez", "mrn": "MRN0004", "sex": "M", "ga_w": 30, "ga_d": 2, "bw": 1320, "bed": "1B", "dx": "Prematurity, RDS", "acuity": "Level III", "att": "Dr. Chen", "dol": 8},
        {"first": "Sophia", "last": "Johnson", "mrn": "MRN0005", "sex": "F", "ga_w": 34, "ga_d": 5, "bw": 2100, "bed": "1C", "dx": "Hyperbilirubinemia", "acuity": "Level II", "att": "Dr. Rodriguez", "dol": 3},
        {"first": "Liam", "last": "Brown", "mrn": "MRN0006", "sex": "M", "ga_w": 29, "ga_d": 1, "bw": 1180, "bed": "1D", "dx": "Prematurity, Apnea", "acuity": "Level III", "att": "Dr. Patel", "dol": 14},
        {"first": "Emma", "last": "Davis", "mrn": "MRN0007", "sex": "F", "ga_w": 35, "ga_d": 3, "bw": 2280, "bed": "2A", "dx": "Hypoglycemia", "acuity": "Level II", "att": "Dr. Rodriguez", "dol": 2},
        {"first": "Noah", "last": "Wilson", "mrn": "MRN0008", "sex": "M", "ga_w": 27, "ga_d": 4, "bw": 950, "bed": "2B", "dx": "Prematurity, PDA", "acuity": "Level III", "att": "Dr. Chen", "dol": 21},
        {"first": "Olivia", "last": "Moore", "mrn": "MRN0009", "sex": "F", "ga_w": 33, "ga_d": 0, "bw": 1850, "bed": "2D", "dx": "Feeding difficulty", "acuity": "Level II", "att": "Dr. Patel", "dol": 5},
        {"first": "Ethan", "last": "Taylor", "mrn": "MRN0010", "sex": "M", "ga_w": 31, "ga_d": 6, "bw": 1520, "bed": "3A", "dx": "Prematurity, RDS", "acuity": "Level III", "att": "Dr. Chen", "dol": 10},
        {"first": "Ava", "last": "Anderson", "mrn": "MRN0011", "sex": "F", "ga_w": 37, "ga_d": 2, "bw": 2680, "bed": "3C", "dx": "Neonatal jaundice", "acuity": "Level I", "att": "Dr. Rodriguez", "dol": 1},
        {"first": "Lucas", "last": "Thomas", "mrn": "MRN0012", "sex": "M", "ga_w": 28, "ga_d": 5, "bw": 1100, "bed": "3D", "dx": "Prematurity, BPD", "acuity": "Level III", "att": "Dr. Patel", "dol": 35},
    ]

    common_problems = {
        "Prematurity, RDS": [("Prematurity", "P07.3"), ("Respiratory Distress Syndrome", "P22.0")],
        "Hyperbilirubinemia": [("Neonatal jaundice", "P59.9")],
        "Prematurity, Apnea": [("Prematurity", "P07.3"), ("Apnea of prematurity", "P28.4")],
        "Hypoglycemia": [("Neonatal hypoglycemia", "P70.4")],
        "Prematurity, PDA": [("Prematurity", "P07.3"), ("Patent ductus arteriosus", "Q25.0")],
        "Feeding difficulty": [("Feeding difficulty", "P92.9")],
        "Neonatal jaundice": [("Neonatal jaundice", "P59.9")],
        "Prematurity, BPD": [("Prematurity", "P07.3"), ("Bronchopulmonary dysplasia", "P27.1")],
    }

    for bg in backgrounds:
        cw = bg["bw"] + random.randint(-50, 100)
        pid = _insert(conn, "patients", {
            "mrn": bg["mrn"], "first_name": bg["first"], "last_name": bg["last"],
            "dob": _ts(NOW - timedelta(days=bg["dol"])), "sex": bg["sex"],
            "gestational_age_weeks": bg["ga_w"], "gestational_age_days": bg["ga_d"],
            "birth_weight_g": bg["bw"], "current_weight_g": cw,
            "current_length_cm": round(35 + bg["ga_w"] * 0.3 + random.uniform(-1, 1), 1),
            "head_circumference_cm": round(22 + bg["ga_w"] * 0.25 + random.uniform(-0.5, 0.5), 1),
            "admit_date": _ts(NOW - timedelta(days=bg["dol"])),
            "acuity": bg["acuity"], "bed": bg["bed"],
            "admitting_diagnosis": bg["dx"], "attending": bg["att"],
            "code_status": "Full Code", "is_index_patient": 0,
            "neotherm_alert_active": 0,
        })

        generate_vitals(conn, pid, 24)
        generate_thermal(conn, pid, 24)

        # One normal CBC
        generate_labs(conn, pid, [
            {"timestamp": _ts(NOW - timedelta(days=bg["dol"])), "tests": [
                {"panel": "CBC", "test_name": "WBC", "value": round(random.uniform(8, 18), 1), "unit": "K/uL", "ref_low": 5.0, "ref_high": 21.0, "flag": None},
                {"panel": "CBC", "test_name": "Hemoglobin", "value": round(random.uniform(14, 19), 1), "unit": "g/dL", "ref_low": 13.0, "ref_high": 20.0, "flag": None},
                {"panel": "CBC", "test_name": "Platelets", "value": random.randint(180, 350), "unit": "K/uL", "ref_low": 150, "ref_high": 400, "flag": None},
                {"panel": "CRP", "test_name": "C-Reactive Protein", "value": round(random.uniform(0.1, 0.8), 1), "unit": "mg/L", "ref_low": 0, "ref_high": 1.0, "flag": None},
            ]},
        ])

        # 1-2 meds
        bg_meds = random.sample([
            ("Caffeine Citrate", "5 mg/kg", "IV", "q24h", 24),
            ("TPN", "Per pharmacy", "IV", "Continuous", 1),
            ("Vitamin D", "400 IU", "PO", "q24h", 24),
            ("Iron Supplement", "2 mg/kg", "PO", "q24h", 24),
        ], k=random.randint(1, 2))
        for drug, dose, route, freq, freq_h in bg_meds:
            mid = _insert(conn, "medications", {
                "patient_id": pid, "drug_name": drug, "dose": dose,
                "route": route, "frequency": freq,
                "start_date": _ts(NOW - timedelta(days=bg["dol"])),
                "end_date": None, "status": "Active",
            })
            generate_mar(conn, mid, NOW - timedelta(days=min(bg["dol"], 3)), freq_h)

        # Problems
        for desc, icd in common_problems.get(bg["dx"], []):
            _insert(conn, "problems", {
                "patient_id": pid, "description": desc, "icd10": icd,
                "onset_date": (NOW - timedelta(days=bg["dol"])).strftime("%Y-%m-%d"),
                "status": "active", "noted_by": bg["att"],
            })

        # Simple admission note
        _insert(conn, "notes", {
            "patient_id": pid, "title": "Admission H&P",
            "note_type": "Admission H&P", "author": bg["att"],
            "timestamp": _ts(NOW - timedelta(days=bg["dol"])),
            "body": f"HISTORY OF PRESENT ILLNESS:\n{bg['ga_w']}+{bg['ga_d']} week {bg['sex']} infant admitted for {bg['dx']}. Birth weight {bg['bw']}g.\n\nPHYSICAL EXAM:\nAge-appropriate exam. See nursing assessment for detailed vitals.\n\nASSESSMENT:\n{bg['dx']}\n\nPLAN:\nStandard monitoring and management per protocol.",
            "status": "signed",
        })

        # Orders
        _insert(conn, "orders", {
            "patient_id": pid, "order_text": "Daily Weight", "category": "nursing",
            "status": "active", "priority": "routine", "ordered_by": bg["att"],
            "ordered_at": _ts(NOW - timedelta(days=bg["dol"])),
        })

        generate_io(conn, pid, 24)
        generate_growth(conn, pid, bg["dol"], bg["bw"])

        # Random allergies
        if random.random() > 0.7:
            allergen = random.choice(["Latex", "Ibuprofen", "Sulfa drugs"])
            _insert(conn, "allergies", {
                "patient_id": pid, "allergen": allergen,
                "reaction": "Unknown", "severity": "Mild",
            })
