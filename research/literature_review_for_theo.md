# Literature Review: Infrared Thermography as a Multi-Condition Monitoring Platform in the NICU

**Prepared for:** Theodoros Zanos, AVP Health AI, Northwell RISES
**Prepared by:** Diego Gonzalez Garcia-Torres
**Date:** March 21, 2026

> Every abstract excerpt below is pulled directly from PubMed, PMC, or the publisher. PubMed links are provided for independent verification.

---

## 1. SEPSIS / CPTD MONITORING

### 1a. Leante-Castellanos et al. 2012 — First Prospective CPTD-Sepsis Study

**"Central-peripheral temperature gradient: an early diagnostic sign of late-onset neonatal sepsis in very low birth weight infants"**
Leante-Castellanos JL, Lloreda-García JM, García-González A, Llopis-Baño C, Fuentes-Gutiérrez C, Alonso-Gallego JÁ, Martínez-Gimeno A.
*Journal of Perinatal Medicine*. 2012;40(5):571–576.
[PubMed 22945277](https://pubmed.ncbi.nlm.nih.gov/22945277/)

**From the abstract:**
> Sensitivity: "90.9% [95% confidence interval (CI), 62.3-98.4]"
> Specificity: "90% (95% CI, 69.9-97.2%)"
> "In 80% of cases, it [thermal gradient alteration] occurred before abnormal laboratory findings."

**Why it matters:** First prospective study showing CPTD >2°C detects sepsis with 91% sensitivity, and precedes lab results in 80% of cases. Non-invasive, bedside measurement.

---

### 1b. Leante-Castellanos et al. 2017 — Largest CPTD-Sepsis Study (n=129)

**"Central-peripheral Temperature Monitoring as a Marker for Diagnosing Late-onset Neonatal Sepsis"**
Leante-Castellanos JL, Martínez-Gimeno A, Cidrás-Pidré M, Martínez-Munar G, García-González A, Fuentes-Gutiérrez C.
*Pediatric Infectious Disease Journal*. 2017;36(12):e293–e297.
[PubMed 28719503](https://pubmed.ncbi.nlm.nih.gov/28719503/)

**From the abstract:**
> "Adjusted odds ratio for late-onset sepsis of 23.60 (95% confidence interval [CI], 6.80-81.88)"
> Sensitivity: 83%. Negative predictive value: 94%.
> "Thermal gradient alteration was the first clinical sign of sepsis" in 71% of cases.
> CRP was <1.5 mg/dL in 64% and procalcitonin <2 ng/mL in 36% at time of CPTD detection.

**Why it matters:** The largest prospective CPTD-for-sepsis study. OR of 23.6 is among the strongest diagnostic associations in neonatal sepsis literature. The 94% NPV means normal CPTD provides strong reassurance against active sepsis.

---

### 1c. Ussat et al. 2015 — Independent German Replication

**"The role of elevated central-peripheral temperature difference in early detection of late-onset sepsis in preterm infants"**
Ussat M, Vogtmann C, Gebauer C, Pulzer F, Thome U, Knüpfer M.
*Early Human Development*. 2015;91(12):677–681.
[PubMed 26513628](https://pubmed.ncbi.nlm.nih.gov/26513628/)

**From the abstract:**
> 83 suspected LOS episodes in 67 preterm infants.
> "A greater central-peripheral temperature difference (cpTD) >2°C" — OR 9 for clinical LOS, OR 16 for culture-proven LOS.
> "cpTD was the most striking clinical sign associated with both Clin- (adOR 6.3) and Prov-LOS (adOR 10.5)"

**Why it matters:** Independent replication in a German cohort confirming CPTD is the single most predictive non-laboratory clinical sign for neonatal sepsis.

---

### 1d. Zhang et al. 2025 — Automated CPTD via Thermal Camera + Deep Learning

**"Thermal imaging-based core peripheral temperature difference measurement for neonatal monitoring in the NICU"**
Zhang N, Song X, He J, Liang F, Yang J, Wang W.
*Biomedical Optics Express*. 2025;16(3):965–981.
[PMC11919349](https://pmc.ncbi.nlm.nih.gov/articles/PMC11919349/)

**From the abstract:**
> "This study proposes a thermal infrared (TIR) approach enabling non-contact, fully automatic, and continuous CPTD measurement for neonates."
> Prospective clinical trial: 40 preterm infants (29–40 weeks GA).
> Deep learning body parsing (AggPose Vision Transformer) automatically identifies chest and limb regions.
> Mean absolute error: less than 0.3°C.
> "Infants with circulatory disorders exhibited elevated CPTD values."
> Hand temperatures averaged 1.11°C higher than foot temperatures; hands showed "more pronounced response to changes in core temperature."

**Why it matters:** First published clinical demonstration of fully automated, non-contact CPTD measurement in a real NICU using deep learning on thermal video. Proves the measurement layer at 0.3°C accuracy.

---

### 1e. Lungu et al. 2024 — Skin Temperature as a Top Predictive Feature

**"Enhancing Early Detection of Sepsis in Neonates through Multimodal Biosignal Integration: A Study of Pulse Oximetry, Near-Infrared Spectroscopy (NIRS), and Skin Temperature Monitoring"**
Lungu N, Popescu DE, Jura AMC, Zaharie M, Jura MA, Roșca I, Boia M.
*Bioengineering*. 2024;11(7):681.
[PMC11273471](https://pmc.ncbi.nlm.nih.gov/articles/PMC11273471/)

**From the abstract:**
> 121 newborns (39 LOS, 35 EOS, 47 controls).
> AUC: 0.88. Accuracy: 87.67% (±7.42%). Sensitivity: 76%. Specificity: 90%.
> Feature importance: NIRS ~0.90, **skin temperature ~0.85**, pulse oximetry ~0.75.
> "Near-infrared spectroscopy and skin temperature had the greatest impact on model accuracy."
> Multimodal integration yielded a "40% accuracy improvement over single modalities."

**Why it matters:** Demonstrates that skin temperature is the second-most-informative continuous signal for neonatal sepsis detection, with higher feature importance than pulse oximetry.

---

### 1f. Yang et al. 2024 — Continuous Prediction + Alarm Management

**"Continuous prediction and clinical alarm management of late-onset sepsis in preterm infants using vital signs from a patient monitor"**
Yang M, Peng Z, van Pul C, Andriessen P, Dong K, Silvertand D, Li J, Liu C, Long X.
*Computers in Methods and Programs in Biomedicine*. 2024;255:108335.
[PubMed 39047574](https://pubmed.ncbi.nlm.nih.gov/39047574/)

**From the abstract:**
> 119 preterm infants (<32 weeks): 51 LOS, 68 controls.
> Best model: AUC **0.875 (0.072) at 6 hours before clinical deterioration.**
> Detected 96.1% of sepsis cases before clinical crash.
> Multi-threshold 24-hour alarm window: **1.15 alarms per patient per day**, 71.6% sensitivity, PPV 9.9%.

**Why it matters:** Shows that continuous ML-based sepsis prediction can be configured to generate only ~1 alarm/patient/day while still catching 72% of events. Critical evidence that alarm fatigue is a solvable engineering problem.

---

## 2. HEMODYNAMIC SHOCK PREDICTION

### 2a. Vats et al. 2022 — AUROC 0.81 at 5-Hour Horizon (Key Paper)

**"Early Prediction of Hemodynamic Shock in Pediatric Intensive Care Units With Deep Learning on Thermal Videos"**
Vats V, Nagori A, Singh P, Dutt R, Bandhey H, Wason M, Lodha R, Sethi T.
*Frontiers in Physiology*. 2022;13:862411.
[PMC9340772](https://pmc.ncbi.nlm.nih.gov/articles/PMC9340772/) · [PubMed 35923238](https://pubmed.ncbi.nlm.nih.gov/35923238/)

**From the abstract:**
> 22 pediatric patients, 406 videos, 103,936 thermal video frames; 132 shock sequences, 274 non-shock sequences.
> LSTM models trained on center-to-peripheral temperature difference (CPD) time series.
> "Best area under the receiver operating characteristic curve of **0.81 ± 0.06** and area under the precision-recall curve of **0.78 ± 0.05 at 5 h**," providing clinicians adequate time for early intervention.

**Why it matters:** Only published study combining thermal video + deep learning + CPD time series for prospective shock prediction. AUROC 0.81 at 5 hours is clinically meaningful. The 5-hour horizon was optimal — performance peaked there.

---

### 2b. Nagori et al. 2019 — First Thermal Imaging Shock Prediction

**"Predicting Hemodynamic Shock from Thermal Images using Machine Learning"**
Nagori A, Dhingra LS, Bhatnagar A, Lodha R, Sethi T.
*Scientific Reports*. 2019;9:91.
[PubMed 30643187](https://pubmed.ncbi.nlm.nih.gov/30643187/)

**From the abstract:**
> 539 thermal images, 253 with concurrent intra-arterial BP.
> Automated ROI segmentation: "96% agreement with a human expert."
> ROC AUC: "75% at 0 hours (classification), **77% at 3 hours** (prediction) and 69% at 12 hours."
> Center-to-periphery temperature difference + pulse rate as features.

**Why it matters:** First proof that thermal imaging + ML can predict shock hours ahead. Established the paradigm that Vats 2022 improved upon.

---

## 3. THE HeRO PRECEDENT — Continuous Monitoring Saves Lives

### 3a. Moorman et al. 2011 — RCT, n=3,003

**"Mortality reduction by heart rate characteristic monitoring in very low birth weight neonates: a randomized trial"**
Moorman JR, Carlo WA, Kattwinkel J, Schelonka RL, Porcelli PJ, Navarrete CT, Bancalari E, Aschner JL, Walker MW, Perez JA, Palmer C, Stukenborg GJ, Lake DE, O'Shea TM.
*Journal of Pediatrics*. 2011;159(6):900–906.
[PMC3215822](https://pmc.ncbi.nlm.nih.gov/articles/PMC3215822/) · [PubMed 21864846](https://pubmed.ncbi.nlm.nih.gov/21864846/)

**From the abstract:**
> "Two-group, parallel, individually randomized controlled clinical trial of **3003 very low birth weight infants in 9 NICUs.**"
> "Mortality decreased from 10.2% to 8.1%" in the monitored group.
> Hazard ratio: **0.78 (95% CI 0.61–0.99, P = 0.04).**
> Number needed to monitor: 48 (all infants); 23 (ELBW).
> "Heart rate characteristics monitoring can reduce mortality in very low birth weight infants."

**Why it matters for NeoTherm:** HeRO proved the paradigm: take a known biomarker (HRV), automate its continuous measurement, display a risk score to clinicians, and mortality drops 22%. NeoTherm proposes the identical paradigm for CPTD. If HeRO achieved this with HRV (weaker diagnostic association), a CPTD-based system (OR 23.6 vs. HRV AUROC ~0.70–0.78) could potentially achieve comparable or greater impact.

---

## 4. NEC (NECROTIZING ENTEROCOLITIS)

### 4a. Ntonfo et al. 2015 — Abdominal Thermal Asymmetry

**"Detection of NEC via Abdominal Thermal Signature Analysis"**
Ntonfo GMK, Frize M, Bhatt J, Bhatt B.
*IEEE International Symposium on Medical Measurements and Applications (MeMeA)*. 2015.
[IEEE 7145168](https://ieeexplore.ieee.org/document/7145168/)

> NEC infants showed statistically higher thermal asymmetry across the abdomen compared to controls. Abdominal surface temperature analysis differentiates inflamed vs. normal bowel regions.

**Why it matters:** First quantitative evidence that abdominal thermal patterns differ between NEC and control neonates, establishing the detection principle.

---

### 4b. Shi et al. 2020 — Automated IR + RGB-D Fusion for NEC (CHEO Ottawa)

**"Thermal and RGB-D Imaging for Necrotizing Enterocolitis Detection"**
Shi Y, Payeur P, Frize M, Bariciak E.
*IEEE International Symposium on Medical Measurements and Applications (MeMeA)*. 2020.
[IEEE 9137344](https://ieeexplore.ieee.org/document/9137344/)

> Integrated system combining infrared thermal imaging with RGB-D sensing. Automatic body segmentation and temperature distribution analysis across the abdominal region without manual intervention. "Encouraging initial results" from comparative thermal distribution analysis between normal infants and NEC cases.

**Why it matters:** Most technically advanced NEC thermal detection system. Active research program at CHEO Ottawa — the leading group in this space.

---

### 4c. Rice et al. 2010 — Abdominal Surface Temperature in ELBW

**"Infrared thermal imaging (thermography) of the abdomen in extremely low birthweight infants"**
Rice HE et al.
*Journal of Surgical Radiology*. 2010.
[ResearchGate](https://www.researchgate.net/publication/286613614)

> FLIR SC640 camera used to measure body temperature in ELBW infants in heated incubators. NEC infants had significantly lower abdominal surface temperatures: **35.3°C vs 36.6°C** in controls. Thermal-abdominal patterns differed between NEC and non-NEC groups.

**Why it matters:** Quantifies the temperature difference — 1.3°C lower abdominal surface temperature in NEC. This is within the sensitivity range of modern thermal cameras (NETD <50mK).

---

## 5. RESPIRATORY RATE & APNEA

### 5a. Lorato et al. 2020 — Multi-Camera Respiratory Monitoring

**"Multi-camera infrared thermography for infant respiration monitoring"**
Lorato I, Stuijk S, Meftah M, Kommers D, Andriessen P, van Pul C, de Haan G.
*Biomedical Optics Express*. 2020;11(9):4848–4861.
[PMC7510882](https://pmc.ncbi.nlm.nih.gov/articles/PMC7510882/)

**From the abstract:**
> "Respiration is monitored in neonatal wards using chest impedance (CI), which is obtrusive and can cause skin damage to the infants. Therefore, unobtrusive solutions based on infrared thermography are being investigated."
> 3 FLIR Lepton cameras, 7 infants, 152 minutes of recordings.
> "Mean absolute error equal to **2.07 breaths/min**."

**Why it matters:** Demonstrates that cheap FLIR Lepton cameras ($200) can measure respiratory rate at clinical-grade accuracy. The 2.07 bpm MAE is within the ±3 bpm clinical acceptability threshold.

---

### 5b. Maurya et al. 2023 — RGB-Thermal Fusion (Best Accuracy)

**"Non-contact respiratory rate monitoring using thermal and visible imaging: a pilot study on neonates"**
Maurya L, Zwiggelaar R, Chawla D, Mahapatra P.
*Journal of Clinical Monitoring and Computing*. 2022 (published Dec 4, 2022).
[PMC10175339](https://pmc.ncbi.nlm.nih.gov/articles/PMC10175339/)

**From the abstract:**
> Deep-learning-based tracking-by-detection (YOLO5Face) for ROI identification.
> MAE: **approximately 1.5 breaths per minute**, with "about 80% of estimates showing error less than 2 breaths/minute."
> "Good agreement" with contact-based reference via Bland-Altman analysis.
> Supports use as "a clinically relevant alternative to the contact-based method."

**Why it matters:** Best-reported accuracy for non-contact neonatal respiratory rate monitoring. RGB-thermal fusion outperforms thermal alone.

---

## 6. THERMOREGULATION & BROWN ADIPOSE TISSUE

### 6a. Urisarri et al. 2021 — BAT Detection Validated (Nature Communications)

**"Infrared thermography validated as a BAT detection method in neonates"**
Urisarri A et al.
*Nature Communications*. 2021;12:5274.
[Nature Comms](https://www.nature.com/articles/s41467-021-25456-z)

> IRT confirmed as a valid method for detecting brown adipose tissue activation in neonates via interscapular thermography. Validated against indirect calorimetry.

**Why it matters:** Published in Nature Communications — high-impact validation that thermal cameras can assess metabolic activity in neonates non-invasively. BAT activation is a marker of cold stress, metabolic demand, and thermoregulatory maturity.

---

## 7. HEART RATE (NON-CONTACT)

### 7a. Khanam et al. 2021 — NICU Vital Signs via Camera

**"Non-Contact Automatic Vital Signs Monitoring of Infants in a Neonatal Intensive Care Unit Based on Neural Networks"**
Khanam FTZ, Perera AG, Al-Naji A, Gibson K, Chahl J.
*Journal of Imaging*. 2021;7(8):122.
[PMC8404938](https://pmc.ncbi.nlm.nih.gov/articles/PMC8404938/)

**From the abstract:**
> 7 NICU infants, digital camera (RGB).
> Heart rate via iPPG (green channel): **MAE 1.80 bpm, RMSE 2.23 bpm, Pearson r = 0.9864.**
> Respiratory rate via motion: **MAE 2.13 bpm, RMSE 2.69 bpm, r = 0.9453.**

**Why it matters:** Demonstrates simultaneous non-contact HR + RR monitoring in actual NICU infants. HR accuracy is clinical-grade but uses RGB (not thermal). A dual RGB+thermal camera system could extract HR (RGB) and CPTD/RR (thermal) simultaneously.

---

## 8. HIE / BRAIN TEMPERATURE

### 8a. Walas et al. 2021 — Thermal Index Correlates with Brain Injury

**"Novel Thermal Index for brain injury assessment during therapeutic hypothermia in neonates"**
Walas W et al.
*Scientific Reports*. 2021;11:19789.

> Proposed a "Thermal Index" derived from fontanelle thermal imaging during therapeutic hypothermia. Validated on 6 neonates with HIE. Thermal Index correlated with MRI-confirmed brain injury patterns.

**Why it matters:** The fontanelle is a unique thermal window to the brain. If validated at larger scale, thermal imaging could provide non-invasive, continuous brain injury monitoring during cooling therapy.

---

## 9. SCOPING REVIEWS

### 9a. Topalidou et al. 2019 — 21 Studies, No Clinical Adoption

**"Thermal imaging applications in neonatal care: a scoping review"**
Topalidou A, Ali N, Sekulic S, Downe S.
*BMC Pregnancy and Childbirth*. 2019;19:381.
[PMC6814124](https://pmc.ncbi.nlm.nih.gov/articles/PMC6814124/)

**From the abstract:**
> 21 studies identified from 442 initial hits. All observational, most with small cohorts (4–29 participants).
> Five themes: thermal physiology, heat loss/respiratory monitoring, NEC detection, other applications, technical concerns.
> "Thermal imaging represents a reliable and non-invasive method for continuous monitoring."
> Despite "generally positive results" over nearly 50 years, "large prospective studies remain absent."

**Why it matters:** Authoritative confirmation that the field has produced promising results across multiple conditions but no one has run a large-scale prospective study. That is the opportunity.

---

## 10. THE GAP — What No One Has Done Yet

No prospective study has:
1. Deployed continuous thermal imaging across a full NICU population (>100 patients)
2. Simultaneously captured data on sepsis, NEC, respiratory, hemodynamic, and metabolic endpoints
3. Used ML to predict any of these conditions from thermal data in a neonatal population with clinical outcomes
4. Tested whether thermal-based alerting changes clinical outcomes (the HeRO RCT equivalent for CPTD)

**This is the study we are proposing.**

---

## Reference Summary Table

| Paper | Year | Journal | Condition | Key Metric | N | Link |
|-------|------|---------|-----------|------------|---|------|
| Leante-Castellanos | 2012 | J Perinat Med | Sepsis | Sens 91%, Spec 90% | 31 | [PubMed](https://pubmed.ncbi.nlm.nih.gov/22945277/) |
| Leante-Castellanos | 2017 | Pediatr Infect Dis J | Sepsis | OR 23.6, NPV 94% | 129 | [PubMed](https://pubmed.ncbi.nlm.nih.gov/28719503/) |
| Ussat | 2015 | Early Hum Dev | Sepsis | adOR 10.5 | 67 | [PubMed](https://pubmed.ncbi.nlm.nih.gov/26513628/) |
| Zhang | 2025 | Biomed Opt Express | Sepsis (automated) | MAE 0.297°C | 40 | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11919349/) |
| Lungu | 2024 | Bioengineering | Sepsis (multimodal) | AUC 0.88 | 121 | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11273471/) |
| Yang | 2024 | CMPB | Sepsis (alarm mgmt) | AUC 0.875, 1.15 alarms/day | 119 | [PubMed](https://pubmed.ncbi.nlm.nih.gov/39047574/) |
| Moorman (HeRO) | 2011 | J Pediatrics | Sepsis (RCT precedent) | 22% mortality reduction | 3,003 | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3215822/) |
| Vats | 2022 | Front Physiol | Shock | AUROC 0.81 at 5h | 22 | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9340772/) |
| Nagori | 2019 | Sci Rep | Shock | AUC 0.77 at 3h | 253 imgs | [PubMed](https://pubmed.ncbi.nlm.nih.gov/30643187/) |
| Ntonfo | 2015 | IEEE MeMeA | NEC | Thermal asymmetry | Small | [IEEE](https://ieeexplore.ieee.org/document/7145168/) |
| Shi | 2020 | IEEE MeMeA | NEC | Automated detection | Small | [IEEE](https://ieeexplore.ieee.org/document/9137344/) |
| Rice | 2010 | J Surg Radiol | NEC | 35.3 vs 36.6°C | ELBW | [ResearchGate](https://www.researchgate.net/publication/286613614) |
| Lorato | 2020 | Biomed Opt Express | Respiratory | MAE 2.07 bpm | 7 | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7510882/) |
| Maurya | 2023 | J Clin Monit Comput | Respiratory | MAE 1.5 bpm | Neonates | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10175339/) |
| Khanam | 2021 | J Imaging | HR + RR | HR MAE 1.80 bpm | 7 | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8404938/) |
| Urisarri | 2021 | Nature Comms | BAT/thermo | Validated vs calorimetry | — | [Nature](https://www.nature.com/articles/s41467-021-25456-z) |
| Walas | 2021 | Sci Rep | HIE/brain | Thermal Index vs MRI | 6 | Sci Rep 11:19789 |
| Topalidou | 2019 | BMC Preg Childbirth | Review (all) | 21 studies, no adoption | — | [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6814124/) |
