# NICU Thermal Camera Adoption & Competitive Landscape

**Compiled: March 2026**

---

## The Bottom Line

**No NICU in the world currently uses thermal cameras as part of routine clinical care.** No FDA-cleared or CE-marked thermal imaging device exists specifically for NICU use. No startup or major medical device company offers a commercial thermal monitoring product for neonates. This is a wide-open market.

---

## 1. Current State of Adoption

### Zero routine clinical deployments worldwide

A 2024 review (Frontiers in Pediatrics) states: *"Despite significant interest and general success of many of these studies, non-contact technologies have yet to be adopted into clinical practice."*

A 2025 systematic review (Pediatric Research) covering 60 observational studies confirmed: all thermal camera use in NICUs remains at the research/proof-of-concept stage.

### Hospitals where thermal imaging research has been conducted (not routine care):

| Hospital | Country | Research Focus |
|----------|---------|---------------|
| RWTH Aachen University Hospital | Germany | Respiratory monitoring, camera fusion, deep learning |
| Nanfang Hospital / Shenzhen University General Hospital | China | Core-peripheral temperature difference (2024, 40 preterm infants) |
| CHEO / Ottawa Hospital | Canada | NEC detection via thermal + RGB-D (NCT03994341, completed) |
| Duke University | USA | Abdominal thermography for NEC, thermoregulation |
| Selcuk University | Turkey | Deep learning health classification from thermal images |
| Nagasaki University | Japan | Neonatal thermography |
| Opole University Hospital | Poland | Thermal Index for brain injury during hypothermia |

---

## 2. FDA & Regulatory Status

### No neonatal-specific cleared devices

- **FDA product code LHQ** covers telethermographic systems for adjunctive use (Class I, 510k)
- General medical thermal cameras exist (FLIR, ICI, Optotherm, Meditherm, Med-Hot) but none are indicated for neonatal monitoring
- **Key limitation:** FDA-cleared thermal cameras can only be used adjunctively (paired with standard thermometer), not for independent diagnosis

### Regulatory pathways:
- **US FDA:** 21 CFR 884.2980(a) — Class I for adjunctive (510k), Class III for standalone diagnostic (PMA)
- **EU:** MDR 2017/745, typically Class IIa, requires Notified Body, CER, ISO 13485

---

## 3. What NICUs Currently Use (Standard Equipment)

| Parameter | Current Technology | Key Limitations |
|-----------|-------------------|-----------------|
| Temperature | Adhesive skin thermistor probes (servo-connected to incubator) | Skin damage, single-point measurement, requires adhesive on fragile skin |
| Heart Rate | 3-lead ECG electrodes with wired connection | Skin irritation, motion artifacts, cable entanglement |
| Respiratory Rate | Chest impedance (via ECG electrodes) | Cannot detect obstructive apnea, skin damage |
| SpO2 | Pulse oximetry (Masimo, Nellcor) wrap-around sensor | Adhesive issues, motion artifacts |
| Blood Pressure | Oscillometric cuff or arterial line | Intermittent (cuff) or invasive (arterial) |
| Brain | aEEG/CFM (Natus Olympic Brainz) | Requires electrode placement |
| Transcutaneous gases | TcPO2/TcPCO2 (Radiometer) | Requires heating element, rotation needed |

**Major NICU equipment manufacturers:** Philips, GE Healthcare, Dräger, Masimo, Natus, Nihon Kohden, Mindray

---

## 4. Commercial Products (None Thermal)

### Major NICU Manufacturers — No Thermal Camera Products

| Company | Relevant Products | Thermal Camera? |
|---------|-------------------|-----------------|
| **Dräger** | Babyleo incubators with ThermoMonitoring (contact probes for CPTD) | No — uses thermistor probes |
| **GE Healthcare** | Giraffe incubators/warmers with servo temperature control | No |
| **Philips** | SureSigns monitors, incubators | No |
| **Masimo** | Pulse oximetry (SofTouch, NeoPt-500 for <1kg neonates) | No |
| **Natus** | NICView webcam (parent viewing), Olympic Brainz, phototherapy | No |

### Adjacent Startups (Not Thermal Cameras)

| Company | Technology | Status |
|---------|-----------|--------|
| **SurePulse VS** (Netherlands) | RGB camera-based iPPG for contactless HR/SpO2 | CE-marked, clinical evaluation in delivery room + NICU |
| **Sibel Health** (USA) | Wireless ANNE soft biosensors for neonatal vitals | FDA 510(k) cleared, deployed at Montreal Children's Hospital |
| **Bambi Medical** (Netherlands) | Wireless Bambi Belt for ECG/apnea via dEMG | CE-marked |
| **Neopenda** (USA/Uganda) | Low-cost wearable neoGuard (HR, RR, SpO2, temp) | Deployed in Ugandan hospitals |
| **BEMPU Health** (India) | $15 TempWatch wristband for hypothermia detection | TIME Top 25 Inventions 2017, Gates Foundation-funded |
| **smedo** (Germany) | High-frequency radar for contactless vitals | Pre-certification, backed by APEX Ventures |
| **raybaby** | Radar-based contactless baby monitoring | Early commercial |
| **EarlySense** (Hillrom/Baxter) | Under-mattress piezoelectric vital sign monitoring | Clinical validation complete |

### Note on "NeoTherm" Name Conflict
**VNG Medical (India)** makes a product called "NeoTherm" — but it is a therapeutic hypothermia cooling system (cooling mattress) for HIE treatment, **not** a thermal imaging device.

---

## 5. Thermal Cameras Used in Research (Off-the-Shelf)

| Camera | Approx. Cost | Used By |
|--------|-------------|---------|
| FLIR SC640 | $20,000+ | Knobel-Dail studies (Duke) |
| FLIR A35 | $5,000-10,000 | Aachen respiratory studies |
| FLIR Lepton 3.5 | ~$200 | Lorato multi-camera respiratory monitoring |
| Seek Thermal | ~$200 | Vats shock prediction study |
| FLIR One Pro | ~$400 | Pediatric burn assessment |
| Iray mini640 | ~$2,000 | Chinese CPTD study (2024) |
| InfraTec VarioCAM HD | $15,000+ | Neonatal thermal recording |

### Key Technical Barrier
**Incubator Plexiglas is opaque to LWIR (long-wave infrared).** Solutions documented:
- Polyethylene foil windows (92-94% LWIR transmission)
- Plastic wrap cutouts in incubator walls
- Camera placement inside incubator
- CaF₂ (calcium fluoride) infrared-transparent windows

No manufacturer has commercially addressed this.

---

## 6. Registered Clinical Trials

| Trial ID | Title | Status | Location |
|-----------|-------|--------|----------|
| NCT03994341 | NEC Thermography Infrared Imaging Study | **Completed** | CHEO & Ottawa Hospital, Canada |
| NCT00993564 | MRI Thermal Imaging of Infants During HIE Cooling | Completed | (MRI-based, not IR camera) |
| Nanfang Hospital (2024) | CPTD via thermal camera in preterm infants | Published | Shenzhen, China |
| Apgar-thermography study (2021-23) | Thermal patterns vs Apgar scores, 223 newborns | Published 2025 | Unnamed tertiary center |

**No currently recruiting trials for IR thermography in neonates were identified.**

---

## 7. Academic Research Centers with Active Programs

| Center | PI / Group | Focus | Funding |
|--------|-----------|-------|---------|
| **RWTH Aachen** (Germany) | Prof. Steffen Leonhardt | Camera fusion, deep learning, respiratory monitoring | Most prolific group |
| **Duke University** (USA) | Robin Knobel, PhD | Thermoregulation, NEC, incubator thermography | — |
| **CHEO / U Ottawa** (Canada) | Frize, Payeur, Bariciak | NEC detection via IR + RGB-D | — |
| **Selcuk / Konya Technical U** (Turkey) | Murat Ceylan | Deep CNNs for thermal classification | TUBITAK-funded |
| **MIT** | — | Multimodal radar + video neonatal vitals | 2025 thesis, clinical study at Tufts NICU |
| **UW-Madison / Georgia Tech** | — | MEDUSA multi-radar system | NSF-funded |
| **Opole University Hospital** (Poland) | Walas | Thermal Index for brain injury | — |
| **Nagasaki University** (Japan) | Morimoto | Continuous thermographic monitoring | — |

---

## 8. Clinical Guidelines

**No clinical guidelines or position statements currently mention or endorse thermal imaging for neonatal care.** This includes WHO, AAP, RCPCH, and ESPNIC.

WHO recommends normothermia (36.5-37.5°C) with standard thermometry only.

---

## 9. Patent Landscape

Relatively sparse. One key patent identified:
- **US8292798B2** — Incubator with infrared camera

Most IP exists as academic publications rather than patents → significant opportunity for IP protection in:
- Automated thermal monitoring algorithms
- AI for neonatal disease detection from thermal images
- Multi-modal fusion systems (thermal + RGB + depth)
- Incubator-compatible IR window solutions

---

## 10. Market Size

| Segment | 2025 Value | Projected | CAGR |
|---------|-----------|-----------|------|
| Neonatal Intensive Care Market | $4.27B | $7.87B (2034) | 7.03% |
| Fetal & Neonatal Monitoring | $9.81B | $13.64B (2030) | 6.81% |
| Neonatal monitoring devices specifically | — | — | **13.25%** |

Over 47% of upcoming developments focus on AI, cloud, and predictive analytics.

---

## 11. ivWatch Trajectory (Model for Go-to-Market)

ivWatch provides the best analog for how a NICU sensing product can move from concept to clinical adoption:

- **Technology:** Near-infrared optical sensor for IV infiltration detection
- **Regulatory:** FDA 510(k) cleared, CE-marked Class II
- **Scale (2024):** 300,000+ patients, 9M+ monitoring hours, 12+ countries, 53,000 patients in 2024 (33% YoY growth)
- **Adoption:** 3 of top 10 US children's hospitals
- **Clinical evidence:** 78-93% reduction in severe IV injuries in neonates, 35+ publications
- **Detection advantage:** Average 15 hours before clinician visual detection

---

## Strategic Implications for NeoTherm

### Favorable factors:
1. **Zero commercial competitors** in thermal camera NICU monitoring
2. **Large and growing market** ($4.27B NICU market, 13.25% CAGR for monitoring devices)
3. **Strong academic evidence** (100+ papers) but no clinical translation
4. **Industry trend** toward contactless, AI-enabled monitoring
5. **Sparse patent landscape** — room for IP protection
6. **Regulatory precedent** exists for adjunctive thermal devices (Class I, 510k)

### Key barriers to address:
1. **Incubator IR opacity** — need an engineering solution for Plexiglas blocking LWIR
2. **Motion artifacts** — 30-40% data exclusion in existing studies
3. **No predicate device** for standalone neonatal thermal monitoring (PMA pathway if going beyond adjunctive)
4. **Small sample sizes** in all published studies — need robust clinical validation
5. **Name conflict** — VNG Medical already uses "NeoTherm" for a different product

### Potential differentiation:
- Multi-condition detection from single thermal stream (sepsis + NEC + respiratory + perfusion)
- AI-powered real-time alerting (no existing system does this)
- Integration with existing NICU monitoring infrastructure
- Low-cost camera hardware ($200-400 range is now feasible)

Sources:
- [Frontiers in Pediatrics - Emerging innovations (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11528303/)
- [Pediatric Research - Systematic review (2025)](https://www.nature.com/articles/s41390-025-04469-0)
- [BMC Pregnancy & Childbirth - Scoping review (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6814124/)
- [ivWatch 2024 press release](https://www.ivwatch.com/2025/01/09/ivwatch-sees-record-industry-adoption-collects-prestigious-awards-in-2024/)
- [Renub - Neonatal IC Market](https://www.renub.com/neonatal-intensive-care-market-p.php)
- [Mordor Intelligence - Fetal & Neonatal Monitoring](https://www.mordorintelligence.com/industry-reports/global-fetal-and-neonatal-monitoring-market-industry)
- [RWTH Aachen NIRT Project](https://www.medit.hia.rwth-aachen.de/en/research/research/single/project/neonatal-infrared-thermography-imaging-114)
- [CHEO NEC Research](https://www.cheoresearch.ca/research/projects/infrared-imaging-tools-for-necrotizing-enterocolitis-nec-diagnosis-guided-by-rgb-d-sensing/)
- [Duke Thermoregulation Research](https://pmc.ncbi.nlm.nih.gov/articles/PMC3775585/)
- [VNG Medical NeoTherm](https://vngmedical.com/neonatal-neotherm-fullbody-cooling-system/)
- [SurePulse VS (Frontiers 2024)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11140120/)
- [Sibel Health FDA clearance](https://respiratory-therapy.com/products-treatment/monitoring-treatment/patient-monitoring-products/fda-clears-wireless-monitoring-platform-neonates-infants/)
- [BEMPU TempWatch](https://www.bempu.com/tempwatch)
- [Dräger ThermoMonitoring](https://www.draeger.com/en_me/Hospital/Neonatal-Care/Incubators-Thermoregulation)
