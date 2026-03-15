# NeoTherm — Business Analysis & Strategy Notes

## MIT Grand Hack 2026 | Track 2: Virtual Diagnostic Interfaces

---

## 1. Value Proposition

**For NICU Medical Directors:**
> NeoTherm detects neonatal sepsis 5 hours before clinical signs appear. It costs $82,500/year for a 25-bed NICU and saves $1.14M. That's a 13.8x return. It pays for itself in 30 days.

**For Hospital CFOs:**
> NeoTherm generates $65K+/year in new CMS reimbursement per 25-bed NICU through Remote Patient Monitoring CPT codes — revenue that doesn't exist today.

**For Insurers (Medicaid/Commercial):**
> Each sepsis case avoided eliminates $32,954 in incremental cost. NeoTherm's 5-hour early detection reduces sepsis progression by 30%.

### Core Differentiators
- First and only continuous, non-contact, automated neonatal sepsis screening
- Works on all skin tones (thermal imaging, not visual assessment)
- No modification to existing incubators
- Zero new sensors on the baby — taps existing bedside monitors
- ML computer vision (YOLOv8-Pose) with thermal ROI segmentation
- Plugs into existing hospital infrastructure (Capsule, Health Connect, Epic)

---

## 2. The Problem

| Metric | Value | Source |
|---|---|---|
| Global neonatal sepsis deaths/year | ~680,000 | WHO |
| US NICU beds | 35,601 across 1,424 hospitals | PMC10197033 |
| US neonatal sepsis cases/year (suspected) | ~32,400 | CDC + literature |
| Late-onset sepsis cost increment per case | $32,954 | PMC9941343 |
| National annual cost of neonatal sepsis (US) | ~$1.07 billion | Calculated |
| NICU devices used off-label | 78% | Shah et al. |

### Why Current Detection Fails

| Method | Limitation |
|---|---|
| Blood culture (gold standard) | 24–72 hour turnaround |
| Clinical signs (temp instability, lethargy) | Appear late — reactive, not predictive |
| qSOFA / NEWS2 scores | Manual, intermittent, designed for adults |
| CRP / Procalcitonin labs | Invasive blood draw, 1–4h turnaround, low specificity in neonates |
| Capillary refill time (CRT) | Subjective, unreliable on dark skin |
| Adhesive contact probes | Damage premature skin. Single-point. Must be repositioned |
| Spot checks every 1–4 hours | Sepsis develops between readings |

**The gap:** No continuous, non-contact, automated sepsis screening system for neonates.

---

## 3. The Solution — Technology Stack

### 3.1 Clinical Mechanism

Sepsis causes microcirculatory dysfunction → peripheral vasoconstriction → measurable change in Core-Peripheral Temperature Difference (CPTD).

```
CPTD = T_core − T_peripheral
```

- **Normal:** CPTD < 2°C
- **Sepsis marker:** CPTD > 2°C sustained ≥ 4 hours
- Leante-Castellanos (2012, 2017): Sensitivity 83%, NPV 94%, first clinical sign in 71% of cases

### 3.2 Hardware — Updated Architecture (from Team Slides)

Four components using **existing hospital infrastructure**:

| Component | Specification | Status |
|---|---|---|
| **FLIR A400/A700** | Radiometric, 640x480, GigE Vision, ceiling-mounted above isolette | 510(k) cleared — Product Code LHQ |
| **Edge AI Box** | IEC 60601-1 certified, YOLOv8-Pose, CPTD computation, 24h local buffer | NeoTherm builds this |
| **InterSystems Health Connect** | HL7v2 ↔ FHIR R4 translation, message queue, audit log | Already at Northwell |
| **EHR Flowsheet** | CPTD + zone temps as vitals, BPA alerts on threshold | Epic Wave 2: May 30, 2026 |

**Key insight:** NeoTherm plugs into what Northwell already has — no new network topology, no cloud dependency, no custom EHR development.

### 3.3 ML Computer Vision Pipeline

The detection pipeline is built on ML computer vision:

1. **Frame Capture** — FLIR A400/A700 streams radiometric thermal data via GigE Vision
2. **YOLOv8-Pose Keypoint Detection** — Detects 17 COCO keypoints (shoulders, hips, wrists, ankles). Homography matrix maps RGB keypoints to thermal coordinates
3. **Body-Zone ROI Segmentation** — Core ROI (chest-abdomen from shoulder/hip keypoints), Peripheral ROIs (30x30px squares on wrist/ankle keypoints). Produces 5 temperature zones: core, left_hand, right_hand, left_foot, right_foot
4. **3-Tier Outlier Filtering** — Physiological bounds (25-42°C) → frame-to-frame jump rejection (>2°C) → rolling-window SD filter (>3 SD)
5. **CPTD Computation + Alert Classification** — 4-level alert: normal → warning → high → critical. Escalation after 5+ consecutive abnormal readings
6. **EHR Integration** — HL7v2 ORU messages via Capsule → Health Connect → Epic Flowsheet

### 3.4 Data Flow (HL7v2 Message)

Edge box emits standard HL7v2 ORU^R01 messages on hospital medical device VLAN. Capsule receives it identically to any bedside monitor.

**Phase 1:** Raw zone temperatures (core, L hand, R hand, L foot, R foot)
**Phase 2 adds:** CPTD value + alert level

### 3.5 FHIR R4 Integration (Phase 2-3)

FHIR resources posted to Health Connect's FHIR endpoint:
- **Observation:** CPTD values, zone temperatures
- **DiagnosticReport:** Aggregated sepsis risk over time window
- **Flag:** Real-time clinical alert
- **Encounter:** Links to active NICU admission
- **Device:** NeoTherm registration and calibration status

---

## 4. Regulatory Strategy — Three Phases

| Phase | Name | FDA Status | What It Does |
|---|---|---|---|
| **Phase 1 — Pilot** | Display & Record | **No FDA submission needed** — camera already 510(k) cleared, software is MDDS | Zone temps to flowsheet via Capsule. Physician off-label use is legal |
| **Phase 2 — Trending** | CPTD Trending | **FDA enforcement discretion** — historical vital sign trending | CPTD computation, BPA configured by hospital's Epic team, FHIR R4 write-back |
| **Phase 3 — Cleared** | AI Sepsis Warning | **510(k) or De Novo** — predicate: Sepsis ImmunoScore (DEN230036) | AI risk scoring, automated alerts, SMART on FHIR widget, multi-condition |

### Key Regulatory Findings

- Camera is already 510(k) cleared under product code LHQ (21 CFR 884.2980(a), Class I)
- Phase 1 software is display/store only — qualifies as MDDS
- Hospital-configured BPA alert rules are clinical practice, not manufacturer claims — no FDA clearance needed
- Sepsis ImmunoScore (DEN230036, April 2024) creates a predicate pathway for AI sepsis prediction
- TTI warning letter (Feb 2019): Camera clearance does NOT extend to bundled software — cautionary precedent
- NeoTherm labeled as "adjunctive tool" — does not replace clinical judgment (primary liability shield)
- Quality system: QMSR (effective Feb 2, 2026), design controls, CAPA, MDR reporting

---

## 5. Northwell Partnership — Dual-Champion Model

### Clinical Champion: Barry Weinberger, MD
- Associate Director, Neonatology — Cohen Children's Medical Center
- Direct NICU access at target deployment site
- Clinical PI for IRB protocol at Feinstein Institutes
- Neonatology expertise for validation study design

### Innovation & AI Champion: Theodoros Zanos, PhD
- AVP, Exploration and Innovation — Division of Health AI, Northwell (RISES)
- Leads 16-person health AI team across Northwell
- Navigates IT security, Health Connect integration
- Path to innovation funding and institutional buy-in

**Why dual-track matters:** Hospital pilots fail when they have clinical enthusiasm but no IT pathway, or innovation funding but no NICU access. Weinberger opens the clinical door; Zanos opens the institutional one.

### Northwell Infrastructure Already in Place

| System | Role | Status |
|---|---|---|
| InterSystems Health Connect | Integration bus, HL7v2 ↔ FHIR R4 | Existing |
| Philips Capsule MDIP | Vendor-neutral device integration | Existing |
| Epic Hyperdrive | EHR — Wave 2 (Cohen Children's) May 30, 2026 | $1.2B investment |
| Feinstein Institutes | IRB for clinical validation | Existing |
| RISES (Health AI) | Innovation sponsor | Existing |

### Deployment Timeline (Aligned with Epic Rollout)

| Timeline | Milestone |
|---|---|
| Q2 2026 | Partnerships & IRB. Formalize with Weinberger + Zanos. BAA negotiation. Epic Wave 2 goes live May 30 |
| Q3 2026 | IT review & procurement. HECVAT + pen test. Procure camera + edge box. Epic stabilization period |
| Q4 2026 | Phase 1 pilot launch. 1–2 beds. Display-only thermal feed + zone temps in flowsheet |
| Q1–Q2 2027 | Expand to 6–10 beds. Add CPTD trending. BPA configured. Publish pilot results. FDA Pre-Sub |
| 2027–2028 | FDA submission with clinical data. Deploy AI alerting + SMART on FHIR widget. Expand to additional Northwell NICUs |

### Northwell Contract Stack

| Requirement | Details |
|---|---|
| BAA | Thermal images = PHI. 60-day breach reporting |
| IRB Protocol | Feinstein Institutes. Dual parental consent. NY Public Health Law Article 24-A |
| IT Security | SOC 2 Type II, HECVAT, pen test. Possibly HITRUST CSF for production |
| MSA / SaaS | License, SLAs (99.9% uptime), IP ownership, liability caps |
| DUA | If using pilot data for model training. Expert Determination de-identification |
| Clinical Engineering | Biomed validates IEC 60601-1. Capsule device type config |
| Insurance | E&O + Cyber ($2-5M each), Product Liability. Required by Northwell for any clinical vendor |

---

## 6. Three-Path Billing Model

### Path A: Device-as-a-Service Subscription

| Tier | Name | $/bed/mo | $/bed/yr | Includes |
|---|---|---|---|---|
| Tier 1 | Monitor | $150 | $1,800 | Hardware, consumables, basic thermal dashboard, manual ROI |
| **Tier 2** | **Detect** | **$275** | **$3,300** | **+ ML sepsis risk scoring, YOLOv8 auto-ROI, CPTD, HRV integration, alerts** |
| Tier 3 | Predict | $400 | $4,800 | + 5-hour predictive model, EHR integration (FHIR), multi-patient dashboard, research API |

- Core offering: Tier 2 at $275/bed/month
- OPEX not CAPEX — NICU director can approve (no capital committee)
- Same hardware, different software tiers → pure margin on upgrades
- 82%+ gross margins on recurring revenue

### Path B: CMS Remote Patient Monitoring (RPM) Reimbursement

NeoTherm qualifies under CMS RPM as a continuously monitoring medical device:

| CPT Code | Description | Reimbursement |
|---|---|---|
| 99453 | Initial setup + patient education | $19.32/patient (once) |
| 99454 | Device supply + daily data transmission (≥16 days/30-day period) | $55.72/patient/month |
| 99457 | First 20 min clinical staff review time | $50.18/patient/month |
| 99458 | Each additional 20 min review time | $41.17/patient/month |

**Per 25-bed NICU: ~$32K–65K/year in new CMS reimbursement** — revenue that doesn't exist today because hospitals have no qualifying RPM device in the NICU.

### Path C: Value-Based Outcomes Sharing

- Base subscription at reduced rate ($200/bed/month instead of $275)
- Performance bonus: 15% of documented sepsis-related cost savings
- 24-month minimum for outcomes measurement validity
- Third-party actuarial verification

### Combined Hospital ROI (25-bed NICU, Standard Tier 2)

| Item | Amount |
|---|---|
| Pays (subscription) | $82,500/year |
| Gets (CMS RPM revenue) | $31,987/year |
| Gets (sepsis cost savings) | $1,140,000/year |
| **Net benefit** | **$1,089,487/year** |
| **ROI** | **13.2x** |
| **Payback** | **< 30 days** |

---

## 7. TAM / SAM / SOM

| | Beds | Annual Revenue | Narrative |
|---|---|---|---|
| **TAM** | 35,601 | $117.5M | Every NICU bed needs this |
| **SAM** | 14,810 | $48.9M | Level III/IV + infrastructure + budget ready |
| **SOM (3-year)** | 2,200 | $7.9M | Direct sales + GPO capture |
| **Expansion** | — | $6–8B (adult ICU) | Same tech, new form factor |

### SAM Filters
- Level III + IV beds only: 84% (30,009 of 35,601)
- Infrastructure readiness: 90%
- Budget willingness: 55%
- Combined: 84% × 90% × 55% = 41.6%

### Market Context
- NICU market size (2025): $4.27B
- CAGR for monitoring devices: 13.25%
- Commercial thermal camera products for NICU: **0**
- Published studies on neonatal IRT: **100+** — none translated to clinical practice
- Sparse patent landscape — most IP exists as academic publications, not patents

---

## 8. Financial Forecasts

### Revenue Projection

| Year | New Beds | Total Active | ARR | Net Revenue |
|---|---|---|---|---|
| Y1 | 500 | 500 | $1.65M | $1.45M |
| Y2 | 1,300 | 1,800 | $5.94M | $5.23M |
| Y3 | 2,700 | 4,500 | $14.85M | $13.07M |
| Y4 | 3,500 | 8,000 | $26.40M | $23.23M |
| Y5 | 4,000 | 12,000 | $39.60M | $34.85M |

### Profitability

| | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| Net Revenue | $1.45M | $5.23M | $13.07M | $23.23M | $34.85M |
| Total Costs | $1.89M | $4.20M | $6.82M | $9.80M | $13.16M |
| **Net Income** | **-$440K** | **$1.03M** | **$6.25M** | **$13.43M** | **$21.69M** |
| **Net Margin** | -30% | 20% | 48% | 58% | 62% |

**Breakeven: Month 18 (mid-Year 2)**

### Unit Economics

| Metric | Value |
|---|---|
| Monthly subscription (blended) | $275/bed |
| Annual revenue per bed | $3,300 |
| Lifetime value per bed (3yr) | $9,900 |
| Customer acquisition cost | $1,500–$2,500/bed |
| LTV:CAC ratio | 4.0–6.6x |
| Gross margin on subscription | ~82% |

---

## 9. Hospital Financial Motivation — 5 Bleed Points

### Model: 25-bed Level III NICU, ~23 sepsis cases/year

| Bleed Point | Annual Cost |
|---|---|
| Direct treatment increment (23 × $33K) | $759,000 |
| Medicaid margin loss (12 cases × $13,200) | $160,000 |
| Bed opportunity cost (23 × 14 days × $7K/day) | $2,254,000 |
| CMS quality penalty exposure (0.5–2% Medicare) | $300K–$1.2M |
| Malpractice risk (amortized) | $150,000 |
| **TOTAL** | **$3.6M–$4.5M/year** |

### What NeoTherm Saves (30% reduction in sepsis progression)

| Category | Current | With NeoTherm | Savings |
|---|---|---|---|
| Direct treatment | $759K | $530K | $229K |
| Bed opportunity cost | $2.25M | $1.45M | $805K |
| Medicaid losses | $160K | $112K | $48K |
| Malpractice exposure | $150K | $90K | $60K |
| **Total savings** | | | **$1.14M/year** |

---

## 10. Competitive Landscape

| Category | Existing | NeoTherm |
|---|---|---|
| Continuous thermal NICU monitor | **None** | 24/7 overhead LWIR |
| Non-contact sepsis screening | **None commercial** | IRT + ML computer vision |
| Point-in-time IRT (research) | Handheld FLIR (E8, A600) | Automated, mounted, continuous |
| Early warning scores | qSOFA, NEWS2 (manual) | Automated, 5h lead time |
| NICU monitoring platforms | Philips, GE CARESCAPE | Complementary — they monitor vitals, not thermal gradients |

> "Non-contact technologies have yet to be adopted into clinical practice." — Frontiers Pediatrics (2024), 60 studies reviewed

**First-mover advantage.** Sparse patent landscape — significant opportunity for IP protection.

---

## 11. Clinical Evidence Base

| Claim | Evidence | Source |
|---|---|---|
| CPTD >2°C = sepsis marker | Leante-Castellanos (2012, 2017): n=129 VLBW, adj. OR 23.60, sensitivity 83%, NPV 94% | Pediatric Research |
| Automated CPTD via camera | Zhang et al. (2025): 40 preterm infants, MAE 0.297°C | Biomed Optics Express |
| Core-to-knee gradient predicts mortality | Lath et al. (2025): n=187, >8.85°F, p=0.003 | Emergency Medicine |
| 5-hour prediction window | Du et al. (2026): Systematic review, 11 studies, LSTM predicted shock 5h before onset | Emergency Medicine Int'l |
| IRT comparable to serum lactate | Hasanin et al. (2024): n=56, toe temp ≤25.5°C, 70% NPV | BMC Anesthesiology |
| Thermal patterns predict mortality | Kazune et al. (2023): n=81, OR 4.1 (95% CI: 1.2–8.9) | Bioengineering |
| Mottling validated by IRT | Ferraris et al. (2018): n=46, 30.7 vs 33.2°C, p=0.01 | — |
| PE window transmission | 92–94% LWIR through LDPE film (Aachen NIRT group, Lorato et al.) | RWTH Aachen |
| Zero clinical adoption | "Existing research is largely at an early developmental stage" | Stanley et al. (2024) |
| Camera FDA cleared | Product code LHQ, 21 CFR 884.2980(a), Class I, 14+ cleared devices | FDA PCD |
| AI sepsis predicate exists | Sepsis ImmunoScore (DEN230036, April 2024) — first AI sepsis tool via De Novo | FDA |
| 78% NICU devices off-label | Standard of care in neonatal medicine | Shah et al. |

---

## 12. Key Differences — Slides vs. Original Plan

| Dimension | Original Plan (NeoTherm_Full_Plan.md) | Team Slides (deck-slides.html) |
|---|---|---|
| Camera | FLIR Lepton 3.5 (160x120, $150 OEM) | FLIR A400/A700 (640x480, GigE Vision) |
| Camera FDA | Needs Med-Hot predicate | Already 510(k) cleared (LHQ) |
| Phase 1 FDA | Requires 510(k) submission | No submission needed — MDDS |
| FDA predicate | Med-Hot TotalVision (K171928) | Sepsis ImmunoScore (DEN230036) |
| Partnership | Med-Hot (12% revenue share) | Not mentioned — camera independent |
| Architecture | RPi 4 at bedside, SPI streaming | Edge AI Box + Capsule + Health Connect |
| EHR integration | Direct FHIR write to Epic | HL7v2 via Capsule → Health Connect → Epic |
| Mounting | Snap-in port cover replacement | Ceiling-mounted above isolette |
| Champions | Kevin Tracey (Feinstein CEO) | Weinberger (Neonatology) + Zanos (Health AI) |
| Pilot timing | Generic 12-month Phase 1 | Aligned with Epic Wave 2 (May 30, 2026) |
| Market data | $117.5M TAM (own calc) | $4.27B NICU market, 13.25% CAGR |

---

## 13. Go-To-Market Strategy

### Phase 1: Clinical Proof Pilot (Months 1–12)
- 3–5 academic Level IV NICUs (starting with Cohen Children's at Northwell)
- 30–50 prototype devices
- Budget: ~$450K (NIH SBIR Phase I + grants + angel)
- Deliverable: Prospective study (200+ neonates, 50+ sepsis events), FDA Pre-Sub

### Phase 2: Early Adopter Deployment (Months 12–24)
- Beachhead 20 hospitals
- 500 beds, $1.65M ARR
- Direct sales team (3 reps) targeting NICU Medical Directors

### Phase 3: Commercial Scale (Months 24–36)
- 100+ hospitals, 4,500 beds, $14.85M ARR
- GPO contracts: Vizient, Premier, HealthTrust

### Phase 4: National + Expansion (Months 36+)
- 300+ hospitals, ~12,000 beds, $39.6M ARR
- Adult post-op ICU version (same core tech, $6–8B TAM)

---

## 14. Key Statistics Quick Reference

| Stat | Value | Source |
|---|---|---|
| US NICU beds | 35,601 | PMC10197033 |
| Neonatal sepsis cases/year (US) | ~32,400 | CDC + lit. |
| Sepsis cost increment/case | $32,954 | PMC9941343 |
| National sepsis burden | ~$1.07B/year | Calculated |
| NICU market size (2025) | $4.27B | Market research |
| Monitoring devices CAGR | 13.25% | Market research |
| CPTD sensitivity for sepsis | 83% | Leante-Castellanos |
| CPTD NPV | 94% | Leante-Castellanos |
| IRT prediction lead time | 5 hours | Du et al. 2026 |
| Automated CPTD MAE | 0.297°C | Zhang et al. 2025 |
| Hospital ROI | 13.2x | Calculated |
| Payback period | < 30 days | Calculated |
| Year 3 ARR | $7.92M | Financial model |
| Year 5 ARR | $39.6M | Financial model |
| Breakeven | Month 18 | Financial model |

---

*Document prepared for MIT Grand Hack 2026. All statistics sourced from peer-reviewed papers in project repository, team slide decks, and publicly available market data.*
