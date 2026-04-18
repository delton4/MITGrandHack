# Thermal / Infrared Wound Monitoring Competitive Landscape

**Date:** March 2026
**Purpose:** Brutally honest assessment of every company doing thermal/infrared imaging for wound monitoring, surgical site infection detection, or postoperative wound surveillance.

---

## THE BOTTOM LINE (READ THIS FIRST)

**The user's skepticism is justified. Companies ARE building thermal imaging products for wound care. But there is a critical nuance:**

1. **Several companies already sell thermal imaging devices for wound assessment** -- WoundVision, Swift Medical, and MolecuLight all have commercial products with thermal/infrared modules.
2. **NONE of them do continuous, bedside, automated thermal monitoring of surgical sites.** They are all handheld, point-of-care, clinician-operated devices used during scheduled wound assessments.
3. **The gap that remains unaddressed:** A fixed thermal camera at the bedside that continuously monitors a surgical wound 24/7 and alerts clinicians to thermal changes indicative of developing SSI. Nobody is selling this.
4. **Why hasn't anyone built it?** Likely because (a) the research on thermal imaging for SSI, while promising, is based on small studies and has not been validated in large RCTs, (b) the clinical workflow for "continuous wound watching" doesn't exist yet in hospitals, and (c) the existing companies approached wound thermal imaging as a supplementary feature on handheld devices, not as a continuous surveillance system.

---

## TIER 1: COMPANIES THAT ACTUALLY SELL THERMAL/INFRARED WOUND IMAGING PRODUCTS

### 1. WoundVision -- Scout (THE CLOSEST COMPETITOR)

**What it does:** Combination digital camera + long-wave infrared (LWIR) camera in a single device. Captures both visual photos and thermal maps of wounds. Integrates with EMR via HL7/FHIR. Cloud-based HIPAA-compliant software. Primarily used for pressure injury detection and present-on-admission (POA) documentation.

**Thermal capability:** Real thermal imaging. Captures temperature data of wound and surrounding tissue. Particularly useful for detecting deep tissue injuries on dark skin tones where visual inspection fails.

**FDA status:** FDA-cleared as a combination digital/LWIR camera system.

**Hospital adoption:** Contracted supplier through HealthTrust (serves 1,600+ hospitals, 43,000+ member locations as of Nov 2024). Exact number of active hospital customers unknown. Based in Indianapolis, IN.

**Funding:** Private company. Exact funding not publicly disclosed. Appears to be a small/mid-size company.

**Price:** Not publicly disclosed. Company says "if a hospital can prevent just one or two serious bedsore cases, you've paid for the system."

**How it differs from a continuous bedside thermal camera:**
- **Handheld, not continuous.** Clinician picks it up, takes a thermal image during a wound assessment, puts it down.
- **Point-in-time, not longitudinal automated monitoring.** No continuous surveillance. No automated alerts.
- **Focused on pressure injuries and POA documentation,** not surgical site infection detection.
- **No AI/ML layer** for predicting infection from thermal trends.

**Competitive threat to a continuous thermal SSI monitor: MEDIUM.** WoundVision has the hardware and the hospital relationships. If they decided to pivot to continuous monitoring, they could. But their current product is fundamentally different in concept (point-of-care vs. continuous surveillance).

---

### 2. Swift Medical -- Swift Ray 1

**What it does:** Pocket-sized device that attaches to a smartphone. Captures three types of images simultaneously:
- Standard photographs (wound measurement)
- Infrared thermography (body heat / inflammation patterns)
- Bacterial fluorescence (violet light reveals bacterial colonization)

Pairs with Swift Skin and Wound software platform. AI-powered wound analysis.

**Thermal capability:** Yes, real LWIR thermal imaging. Can visualize vascular and inflammatory patterns in and around wounds.

**FDA status:** Swift Ray 1 is a Class I medical device. Swift Skin and Wound software is FDA-registered.

**Hospital adoption:** 4,000+ healthcare facilities in North America. 25,000+ monthly clinical users. 62 million+ patient encounters captured. 10-year track record (founded ~2015).

**Funding:** $54.6M total raised. Most recent: $8M USD round (Jan 2024) co-led by BDC Capital and Virgo Investment Group. Investors include Camford Capital, Graphite Ventures, Chrysalis Ventures, Claritas Capital. Based in Toronto, Canada.

**How it differs from a continuous bedside thermal camera:**
- **Handheld smartphone attachment**, not a fixed bedside camera.
- **Clinician-operated during assessments**, not continuous automated monitoring.
- **Primary focus is chronic wound management** (diabetic ulcers, pressure injuries), not acute postoperative SSI detection.
- **No continuous surveillance capability.** No automated thermal alerting.
- **Multimodal (thermal + fluorescence + visual)** -- combines three imaging modalities, but all are point-in-time.

**Competitive threat to a continuous thermal SSI monitor: MEDIUM-HIGH.** Swift Medical has significant market presence, proven thermal imaging in wounds, and a software platform. They have the technology building blocks to add continuous monitoring. Their 4,000-facility footprint is a real competitive moat. However, their entire product architecture is built around clinician-initiated assessments, not passive continuous surveillance.

---

### 3. MolecuLight -- DX Platform (Thermal Module)

**What it does:** Primarily a fluorescence imaging device that uses violet light to detect bacterial burden in wounds in real time. The DX platform added a thermal imaging module in 2024, making it a three-in-one device: fluorescence (bacteria) + thermal (inflammation/perfusion) + standard imaging (wound measurement).

**Thermal capability:** Yes. The DX thermal module quantifies skin temperature differences with +/-0.5C accuracy and visualizes variations with a dynamic thermal map. Added to the platform in 2024.

**FDA status:** Class II FDA-cleared (510(k)). Also FDA-qualified as a Medical Device Development Tool (MDDT) for wound measurement (Jan 2026). Added to ISWCAP 2022 Consensus Guidelines for optimizing prevention of surgical wound complications.

**Hospital adoption:** Growing across hospital inpatient/outpatient clinics, wound care clinics, podiatrists, mobile care, skilled nursing, long-term care. Exact number of facilities not publicly disclosed.

**Revenue:** Estimated $3.8-5M annual revenue (as of mid-2025). Small but growing.

**Funding:** $54.3M total raised. Latest: $27.5M Series C-II from Hayfin Capital (Jan 2025). Acquired by Photonamic (Jan 2025).

**SSI-specific evidence:** A clinical study found MolecuLight i:X improved sensitivity of detecting bacterial burden in surgical site wounds by 11.3-fold vs. clinical signs/symptoms alone. Exhibited at IPAWS Summit 2025 showcasing consensus on fluorescence imaging in surgical wound management.

**How it differs from a continuous bedside thermal camera:**
- **Handheld device**, not fixed bedside camera.
- **Primary value proposition is fluorescence (bacterial detection)**, not thermal imaging. Thermal is a supplementary module added recently.
- **Point-of-care, clinician-operated.** Not continuous surveillance.
- **Focuses on bacterial detection** -- competing more with wound cultures than with continuous monitoring.
- **Revenue is still small** (~$4M), indicating early commercial traction despite years in market.

**Competitive threat to a continuous thermal SSI monitor: LOW-MEDIUM.** MolecuLight's core technology is fluorescence, not thermal. Their thermal module is a secondary feature. They are not pursuing continuous monitoring. However, their surgical wound use case and clinical evidence for SSI detection make them relevant -- they've proven that imaging can detect SSI better than clinical assessment alone.

---

## TIER 2: COMPANIES WITH RELATED THERMAL/INFRARED MEDICAL IMAGING

### 4. Spectral AI (formerly Spectral MD) -- DeepView System

**What it does:** AI-powered multispectral imaging device that predicts burn wound healing potential on Day 1 post-injury. Combines multispectral imaging with proprietary AI algorithms. Non-invasive.

**Thermal capability:** Uses multispectral imaging (multiple wavelengths including near-infrared), not strictly thermal/LWIR imaging. Assesses tissue perfusion and viability.

**FDA status:** FDA Breakthrough Device Designation (2018). De Novo 510(k) submitted June 2025, currently under FDA review.

**Funding:** Massive BARDA backing: $27M over 22 months with options up to $92M total. Additional $20.6M from BARDA for burn wound training study. Public company (MDAI on Nasdaq).

**Hospital adoption:** Pre-commercial. In clinical trials. Not yet FDA-cleared for sale.

**Relevance to SSI monitoring:** LOW. DeepView is focused on burn wound assessment, not surgical site infection. Different clinical use case, different imaging modality (multispectral vs. thermal), different workflow. However, the concept of "AI analyzing wound images to predict outcomes" is analogous.

---

### 5. Bruin Biometrics -- Provizio SEM Scanner

**What it does:** Handheld device that measures sub-epidermal moisture (SEM) to detect pressure injuries up to 5 days before they become visible. Uses capacitance sensors (NOT thermal imaging, NOT infrared).

**FDA status:** FDA-cleared. Specific ICD-10-PCS procedure code assigned by CMS (2024).

**Hospital adoption:** Named by Fast Company as one of 10 Most Innovative Medical Device Companies (March 2025). Scanned 1M+ patients since 2019 launch. ~50,000 pressure injuries prevented. Distribution through Arjo (equity investment + exclusive worldwide distribution).

**Funding:** Equity investment from Arjo. Digital Wound Management agreement with Premier, Inc.

**Relevance to SSI monitoring:** LOW. SEM scanning detects sub-surface moisture (a precursor to pressure injuries), not temperature. Not thermal imaging. Different technology, different clinical indication. However, the business model (handheld device for early wound/skin detection + hospital GPO distribution) is relevant as a market analog.

---

### 6. Kent Imaging -- SnapshotNIR

**What it does:** Near-infrared spectroscopy (NIRS) device that measures tissue oxygen saturation (StO2). Maps oxygenated/deoxygenated hemoglobin in microcirculation. Non-invasive, no patient contact, no injected dyes.

**Thermal capability:** NOT thermal imaging. Uses near-infrared spectroscopy (different technology). Measures tissue oxygenation, not temperature.

**FDA status:** FDA-cleared and Health Canada-cleared (2017).

**Hospital adoption:** Real-world evidence study: 19,192 wounds from 6,147 patients. Deployed in post-acute care settings.

**Relevance to SSI monitoring:** LOW-MEDIUM. Tissue oxygenation is relevant to wound healing assessment but is a different parameter than temperature. SnapshotNIR is a handheld device used during assessments, not continuous monitoring.

---

### 7. Kelvin Health

**What it does:** AI-powered thermal imaging analysis for vascular disease screening. Uses smartphone thermal cameras + proprietary AI to detect cardiovascular and inflammatory conditions.

**Thermal capability:** Yes, genuine thermal imaging + AI analysis.

**FDA status:** Pre-clinical / pre-regulatory. Currently raising $4.8M for regulatory clearance process.

**Funding:** Only $81.9K in grant funding raised so far. Very early stage. Based in Sofia, Bulgaria.

**Hospital adoption:** 1,300+ patients in observational studies across Europe and Argentina. Database of 9,500+ thermal images. No commercial product yet.

**Relevance to SSI monitoring:** LOW. Focused on vascular disease (cardiovascular), not wound/SSI. But demonstrates that thermal imaging + AI for disease detection is attracting startup attention.

---

### 8. ThermoHuman

**What it does:** AI-powered infrared thermography analysis platform. Detects body temperature asymmetries and patterns. "Plug and play" system: connect camera, get instant AI analysis in 30 seconds.

**Thermal capability:** Yes, real infrared thermography + AI software.

**Hospital adoption:** Clients in 40+ countries. Primarily sports medicine (LaLiga, Premier League, Bundesliga, MLS teams). 57 published scientific articles.

**Relevance to SSI monitoring:** LOW. Primary market is sports medicine and injury prevention, not wound care. However, their AI platform for analyzing thermal images is technically analogous. Based in Madrid, Spain.

---

### 9. Spectron IR

**What it does:** Sells dedicated medical infrared imaging camera systems (e.g., TyTron C-500). 640x480 resolution. Thermal sensitivity 0.01C. Medical-grade software.

**FDA status:** FDA 510(k) cleared (K032471).

**Hospital adoption:** Sells to functional/integrative medicine practitioners, research settings. Not specifically wound-care focused.

**Relevance to SSI monitoring:** LOW. General-purpose medical thermal camera manufacturer. Not building a wound-specific or SSI-specific product/platform.

---

### 10. Meditherm -- IRIS 640

**What it does:** Medical-grade thermal imaging camera system. 640x480 resolution, 0.01C sensitivity. Complete package with laptop and custom imaging software.

**FDA status:** FDA-registered Class I Medical Device.

**Hospital adoption:** Used in medical clinics, primarily for adjunctive breast cancer screening, circulatory/neurological assessments, veterinary diagnostics.

**Relevance to SSI monitoring:** LOW. Camera hardware vendor. Not building wound monitoring software or SSI detection. Could theoretically be used as hardware component.

---

## TIER 3: ADJACENT TECHNOLOGIES (NOT THERMAL BUT RELEVANT)

### 11. Healthy.io -- Minuteful for Wound

**What it does:** Smartphone-based wound monitoring using computer vision + colorimetric analysis. Patient self-scans wounds at home. AI automatically calibrates for scale, lighting, dimensions, 3D structure. FDA-registered.

**Thermal capability:** NO thermal imaging. RGB camera only.

**Relevance:** Demonstrates the market for AI wound monitoring but uses a completely different technology. Their remote/home-based monitoring model is relevant to post-discharge SSI surveillance.

---

### 12. ARANZ Medical -- Silhouette

**What it does:** 3D laser-based wound measurement, imaging, and documentation. FDA-cleared. Web-based central database. EMR integration. 70+ clinical studies.

**Thermal capability:** NO thermal imaging. Uses structured light/laser for 3D measurement.

**Hospital adoption:** VA facilities (since 2010), hospitals in New Zealand and globally.

**Relevance:** Gold standard for wound measurement documentation. Not thermal.

---

### 13. PixaMed

**What it does:** Wound care specialty EHR with automated imaging, wound measurement, assessment, and documentation. Integrates with Epic, Cerner, Athenahealth.

**Thermal capability:** NO thermal imaging. Digital camera-based.

**Relevance:** Wound care documentation platform. Could theoretically integrate thermal data. Based in Portland, OR.

---

### 14. Healogics

**What it does:** Largest wound care management company in the US. 5M+ wound database. WoundSuite software platform. Uses Swift Medical technology for photo measurement. Tissue Analytics AI for wound management.

**Thermal capability:** NO native thermal imaging. Uses Swift Medical's technology (which does include thermal in the Ray 1).

**Hospital adoption:** Massive -- manages wound care centers across hundreds of hospitals.

**Relevance:** Dominant wound care operator. If they adopted thermal monitoring technology, instant massive distribution. Partnership with Swift Medical already connects them to thermal imaging indirectly.

---

## TIER 4: TEMPERATURE PATCHES (CONTINUOUS BUT NOT IMAGING)

### 15. TempTraq (Blue Spark Technologies)

**What it does:** Disposable adhesive patch. Continuous axillary temperature monitoring via Bluetooth for up to 72 hours. Real-time alerts when temperature rises. FDA-cleared Class II medical device.

**Thermal capability:** Single-point temperature sensor (NOT thermal imaging). No spatial resolution. Cannot visualize a wound.

**Price:** ~$10/day. Covered by insurance.

**Hospital adoption:** Clinical studies at University Hospitals Cleveland. Used for postoperative fever detection in pediatric surgery patients (appendicitis study at Monash Children's Hospital).

**Clinical evidence:** Detected fevers in 4 patients that were either missed (2 patients) or delayed >12 hours (2 patients) by standard episodic monitoring.

**Relevance to thermal SSI monitoring: MEDIUM.** TempTraq proves the clinical value of continuous temperature monitoring for postop patients. BUT it measures body temperature at a single point (armpit), not wound-site temperature. Cannot visualize spatial temperature patterns around a surgical incision. Cannot detect the localized thermal signatures of developing SSI.

---

### 16. SteadyTemp

**What it does:** Temperature sensor embedded in adhesive patch worn on chest/underarm. Continuous recording at predefined intervals.

**Relevance:** Similar to TempTraq. Single-point temperature, not wound imaging.

---

### 17. Verily (Alphabet/Google) Patch

**What it does:** Low-cost wearable continuous temperature monitoring device evaluated in outpatient settings. 90.2% sensitivity, 87.8% specificity for fever detection. Detected 14.3x more fever episodes than clinic-assessed measurements, with 4.3 hour median lead time.

**Relevance:** Demonstrates value of continuous temperature monitoring but is single-point body temperature, not wound thermal imaging.

---

## TIER 5: SMART BANDAGES (FUTURE COMPETITION -- MOSTLY PRE-COMMERCIAL)

### 18. iCares Smart Bandage (Caltech)

**What it does:** First smart bandage tested in 20 human patients with chronic wounds (2025). Monitors nitric oxide, hydrogen peroxide, oxygen, pH, and temperature. Can detect infection indicators 1-3 days before symptoms.

**Status:** Human pilot study completed. Intended for commercialization but no company/product yet. Manufacturing scalability being explored.

### 19. University of Arizona Smart Bandage

**What it does:** AI-enabled bandage for continuous wound monitoring. Predicts and treats infections early. Battery life challenge (10 hours on continuous WiFi/Bluetooth).

**Status:** Pre-clinical. Planning first human applications.

### 20. Purdue University Roll-to-Roll Smart Bandage

**What it does:** Smart bandages with colorimetric sensors for pH, temperature, and humidity. Manufactured via roll-to-roll process for low cost and scalability.

**Status:** Research/pre-commercial.

**Relevance of smart bandages:** These are 3-5+ years from market. If they work, they would monitor wounds directly via contact sensors. They would complement (not replace) thermal camera surveillance because: (a) they require direct wound contact, (b) they monitor only the bandaged area, (c) a camera can monitor any exposed wound without physical application.

---

## RESEARCH GROUPS DOING THERMAL + AI FOR SSI (PRE-COMMERCIAL)

### Rwanda Cesarean Section Study (University of Global Health Equity / Partners)
- 530 women, post-C-section, thermal images at ~Day 10
- CNN model: AUC=0.90, sensitivity=95%, specificity=84%
- Used smartphone-attached FLIR thermal camera
- Demonstrated thermal imaging + ML can predict SSI
- NOT commercialized

### UCSF Pilot (2024 Proposal)
- "The Wave of the Future: Using Long-Wave Infrared Thermography to Prevent Hospital Acquired Pressure Injuries"
- Proposed study using thermal cameras for pressure injury prevention
- Pre-data

### Various Academic Studies
- "Temperature gradient of -1C between periwound area and abdomen at Day 7 was associated with 3x increase in likelihood of SSI"
- "If secondary temperature peak during healing phase, infection has likely occurred"
- "Thermal imaging value for SSI diagnosis greatest in first days after surgery"
- Studies used FLIR cameras attached to smartphones -- handheld, clinician-operated

---

## COMPETITIVE MATRIX: WHO DOES WHAT

| Company | Thermal Imaging? | Continuous Monitoring? | SSI-Specific? | AI/ML Layer? | FDA Status | Hospital Customers | Funding |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **WoundVision Scout** | YES (LWIR) | NO (handheld) | NO (pressure injuries) | NO | FDA-cleared | Unknown (HealthTrust access to 1,600+ hospitals) | Private, undisclosed |
| **Swift Medical Ray 1** | YES (LWIR) | NO (handheld) | NO (chronic wounds) | YES (wound analysis) | Class I | 4,000+ facilities | $54.6M |
| **MolecuLight DX** | YES (thermal module) | NO (handheld) | Partial (bacterial in surgical wounds) | NO | Class II 510(k) | Growing, undisclosed | $54.3M |
| **Spectral AI DeepView** | Multispectral (not LWIR) | NO | NO (burns) | YES | Under FDA review | Pre-commercial | ~$92M BARDA |
| **Bruin Biometrics** | NO (capacitance) | NO (handheld) | NO (pressure injuries) | NO | FDA-cleared | 1M+ patients scanned | Arjo partnership |
| **Kent Imaging** | NO (NIRS) | NO (handheld) | NO (tissue oxygenation) | NO | FDA-cleared | 6,000+ patients studied | Private |
| **Kelvin Health** | YES | NO | NO (vascular) | YES | Pre-regulatory | Pre-commercial | $82K |
| **ThermoHuman** | YES | NO | NO (sports medicine) | YES | N/A | 40+ countries (sports) | Private |
| **TempTraq** | NO (single-point temp) | YES (72hr continuous) | NO (fever only) | NO | Class II FDA | Clinical studies | Private |
| **Smart Bandages (Caltech etc.)** | NO (contact sensors) | YES (concept) | Partial | Emerging | Pre-regulatory | Pre-commercial | Academic grants |
| **Hypothetical NeoTherm/postop product** | YES (LWIR) | YES (continuous bedside) | YES (SSI detection) | YES (predictive alerts) | Would need 510(k) | 0 | 0 |

---

## THE HONEST COMPETITIVE ASSESSMENT

### What exists today:
1. **Handheld thermal wound imaging devices** (WoundVision, Swift Medical, MolecuLight) -- these are commercial, FDA-cleared, and deployed in hospitals. They prove that thermal imaging adds clinical value in wound assessment. BUT they are all clinician-operated, point-of-care, intermittent-use devices.

2. **Continuous vital sign monitoring** (Masimo, GE, Philips, VitalConnect, Biobeat, etc.) -- these are dominant in postop monitoring. They measure temperature as ONE of 5-13 continuous parameters. BUT they use contact sensors measuring body temperature at a single point, not thermal imaging of the wound site.

3. **Continuous temperature patches** (TempTraq, SteadyTemp, Verily) -- these prove continuous temperature monitoring catches postop infections earlier. BUT they measure systemic body temperature, not wound-specific spatial temperature.

### What does NOT exist today (the actual gap):
**A fixed bedside thermal camera that continuously monitors a surgical wound site, uses AI to analyze temperature patterns/gradients, and alerts clinicians to developing SSI before clinical signs appear.**

This specific product concept sits at the intersection of three existing categories -- but nobody has combined them into one product.

### Why might the gap exist?
1. **Small clinical evidence base.** The Rwanda study (530 patients, AUC 0.90) and similar studies are promising but not definitive. No large-scale RCT has validated continuous thermal monitoring for SSI prediction.
2. **Workflow integration challenge.** Hospitals don't have a "continuous wound watching" workflow. Bedside cameras watching surgical sites raise privacy, consent, and practical concerns (patient movement, dressing changes, positioning).
3. **Reimbursement uncertainty.** No CPT code for "continuous thermal wound surveillance." TempTraq at $10/day gets insurance coverage for fever monitoring. A thermal camera system would need to justify its cost against existing alternatives.
4. **The SSI problem is "solved enough" by antibiotics.** Hospitals use prophylactic antibiotics + clinical assessment. The urgency for better SSI detection is real but hasn't created a burning-platform demand signal for thermal cameras specifically.
5. **Handheld devices are easier to sell.** WoundVision, Swift, and MolecuLight built handheld devices because they fit existing clinical workflows. A bedside camera requires new infrastructure, installation, and workflow changes.

### Why the gap might actually be an opportunity:
1. **The research evidence IS strong.** AUC 0.90 for SSI prediction, thermal changes detectable days before clinical signs, 3x infection risk with 1C temperature gradient -- this is solid biological signal.
2. **Continuous monitoring is the market trend.** Every major med-tech company is moving from spot-checks to continuous monitoring. Masimo, GE, Philips are all building continuous ward monitoring platforms.
3. **Nobody owns "continuous wound visualization."** The existing companies (WoundVision, Swift, MolecuLight) have handheld devices. A continuous bedside camera would be a genuinely new category.
4. **AI infrastructure is mature.** The ML pipeline for analyzing thermal images is well-established (Rwanda study used standard CNNs). The technical barriers are low.
5. **Cost of thermal cameras has plummeted.** FLIR Lepton modules are <$200. Raspberry Pi + FLIR = functional thermal monitoring prototype for <$500.

---

## SOURCES

- [MolecuLight Thermal Imaging for DX Platform](https://moleculight.com/news/moleculight-unveils-thermal-imaging-for-dx-platform-delivering-measurement-bacterial-thermal-assessment-in-one-device-and-showcases-clinical-evidence-at-sawc-spring/)
- [MolecuLight FDA MDDT Qualification](https://www.prnewswire.com/news-releases/fda-qualifies-moleculightdx-wound-measurement-as-a-medical-device-development-tool-mddt-for-evaluating-new-products-in-wound-care-302673289.html)
- [MolecuLight SSI Detection Study](https://moleculight.com/news/new-clinical-study-finds-moleculight-ix-point-of-care-imaging-improved-sensitivity/)
- [MolecuLight $27.5M Funding](https://www.prnewswire.com/news-releases/moleculight-secures-27-5-million-from-hayfin-a-leading-healthcare-institutional-investor-302342519.html)
- [MolecuLight Revenue Estimate](https://www.konaequity.com/company/moleculight-4863979924/)
- [Swift Medical Swift Ray 1](https://swiftmedical.com/swift-ray/)
- [Swift Medical Funding](https://www.businesswire.com/news/home/20240125235765/en/Swift-Medical-Announces-New-Financing-Round-to-Further-Enhance-Its-AI-Based-Wound-Care-Technology)
- [Swift Medical Thermal Imaging Case Series](https://swiftmedical.com/infrared-thermal-imaging-for-assessing-acute-inflammatory-changes/)
- [Swift Medical Fierce Healthcare Profile](https://www.fiercehealthcare.com/health-tech/digital-wound-care-tech-company-swift-medical-rolls-out-new-imaging-device)
- [WoundVision Scout](https://woundvision.com/wound-imaging-and-documentation-solutions/)
- [WoundVision HealthTrust Agreement](https://woundvision.com/healthtrust-supplier-wound-care/)
- [Spectral AI DeepView FDA Submission](https://www.globenewswire.com/news-release/2025/06/30/3107415/0/en/Spectral-AI-Announces-Submission-to-FDA-of-its-DeepView-System.html)
- [Spectral AI BARDA Funding](https://investors.spectral-ai.com/news-releases/news-release-details/barda-approval-additional-funding-206-million-execute-deepview)
- [Bruin Biometrics SEM Scanner](https://sem-scanner.com/)
- [Bruin Biometrics Fast Company Recognition](https://www.prnewswire.com/news-releases/fast-company-names-bruin-biometrics-developer-of-pressure-injury-detection-and-prevention-technology-one-of-worlds-10-most-innovative-medical-device-makers-302408606.html)
- [Kent Imaging SnapshotNIR](https://www.kentimaging.com/snapshotnir)
- [Kent Imaging Real-World Study](https://www.kentimaging.com/news-articles/publication-2025-real-world-evidence-study-uses-snapshotnir-on-4000-wounds-to-deliver-targeted-care-and-improve-wound-healing-outcomes)
- [Kelvin Health](https://www.trendingtopics.eu/kelvin-health-ai-thermal-imaging-startup-remote-screening/)
- [ThermoHuman](https://thermohuman.com/about)
- [Spectron IR Medical Cameras](https://spectronir.com/)
- [Meditherm IRIS 640](https://meditherm.com/iris-640-thermal-imaging-camera/)
- [TempTraq Clinical Evidence](https://temptraq.healthcare/continuous-temperature-monitoring-in-the-inpatient-setting-using-temptraq/)
- [TempTraq Postop Pediatric Study](https://supervisorconnect.med.monash.edu/projects/home-continuous-wireless-temperature-monitoring-using-temptraq%C2%AE-patch-children-discharged)
- [Verily Patch Fever Detection](https://pmc.ncbi.nlm.nih.gov/articles/PMC8577572/)
- [Caltech iCares Smart Bandage](https://www.diagnosticsworldnews.com/news/2025/05/27/smart-bandage-for-monitoring-chronic-wounds-moves-from-mice-to-humans)
- [Healthy.io Minuteful for Wound](https://healthy.io/services/wound/)
- [ARANZ Medical Silhouette](https://www.aranzmedical.com/)
- [PixaMed Platform](https://www.pixamed.com/)
- [Healogics WoundSuite](https://www.healogics.com/woundsuite-wound-care-software/)
- [Rwanda SSI Thermal Imaging Study](https://pubmed.ncbi.nlm.nih.gov/34892344/)
- [UCSF Thermal Imaging Pressure Injury Proposal](https://open-proposals.ucsf.edu/chv/cw-projects-2024/proposal/19197)
- [Temperature Monitoring for SSI Detection Review](https://www.mdpi.com/2076-3417/15/24/12856)
- [Comprehensive Scoping Review: IR Thermography for Wound Assessment](https://pmc.ncbi.nlm.nih.gov/articles/PMC12358192/)
- [Digital Wound Measurement Devices Market](https://www.mordorintelligence.com/industry-reports/digital-wound-measurement-devices-market)
- [Digital Wound Care Management Market ($10.82B by 2034)](https://www.novaoneadvisor.com/report/digital-wound-care-management-system-market)
- [SSI Control Market ($6.69B by 2030)](https://www.theglobeandmail.com/investing/markets/markets-news/GetNews/36819157/)
