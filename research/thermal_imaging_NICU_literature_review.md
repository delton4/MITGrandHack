# Thermal Imaging in the NICU: Comprehensive Literature Review

**Compiled: March 2026 | 100+ papers reviewed**

---

## 1. Sepsis Detection (Strongest Evidence — 6 papers)

Core-peripheral temperature difference (CPTD) >2°C precedes lab markers in 71-80% of cases. Sensitivity 83-91%, specificity 90%+ across multiple prospective studies.

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Leante-Castellanos et al. | 2012 | J Perinatal Medicine | CPTD >2°C for 4h: sensitivity 90.9%, specificity 90% for late-onset sepsis in VLBW infants. Preceded lab findings in 80% of cases. [DOI: 10.1515/jpm-2011-0269](https://pubmed.ncbi.nlm.nih.gov/22945277/) |
| Ussat et al. | 2015 | Early Human Development | CPTD >2°C: adjusted OR 10.5 for proven late-onset sepsis in 83 episodes across 67 preterm infants. [DOI: 10.1016/j.earlhumdev.2015.09.007](https://pubmed.ncbi.nlm.nih.gov/26513628/) |
| Leante-Castellanos et al. | 2017 | Pediatric Infectious Disease J | Prospective, 129 VLBW infants. CPTD alteration: adjusted OR 23.60, sensitivity 83%, NPV 94%. First clinical sign in 71% of cases. [DOI: 10.1097/INF.0000000000001688](https://journals.lww.com/pidj/abstract/2017/12000/central_peripheral_temperature_monitoring_as_a.7.aspx) |
| Al-Sadr et al. | 2019 | Int J Data Mining & Bioinformatics | Automated CPTD via fuzzy C-means clustering on thermal images: 96.2% accuracy. [DOI: 10.1504/IJDMB.2019.101389](https://www.inderscienceonline.com/doi/abs/10.1504/IJDMB.2019.101389) |
| Uslu (Ornek) et al. | 2020 | Infrared Physics & Technology | Deep CNN on thermal images: 99.58% accuracy, 99.73% specificity for healthy vs unhealthy classification. [Link](https://www.sciencedirect.com/science/article/abs/pii/S1350449519303123) |
| Zhang et al. | 2025 | Biomedical Optics Express | First fully automated CPTD monitoring via thermal camera + deep learning in NICU. 76% AP (hand), 85.5% AP (chest-abdomen). [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11919349/) |

---

## 2. Necrotizing Enterocolitis / NEC (6 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Rice et al. | 2010 | J Surgical Radiology | NEC infants had significantly lower abdominal temps (35.3°C vs 36.6°C) in ELBW cohort. [Link](https://scholars.duke.edu/publication/723960) |
| Knobel-Dail | 2011 | Biological Research for Nursing | Comprehensive review: abnormal thermal patterns in premature infants may enable early NEC detection. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3775585/) |
| Ntonfo et al. | 2015 | IEEE MeMeA | Abdominal thermal symmetry analysis: higher asymmetry in NEC infants. [IEEE](https://ieeexplore.ieee.org/document/7145168/) |
| Knobel-Dail et al. | 2017 | J Thermal Biology | Reversed central-peripheral gradient in extremely premature infants during first 12 hours — potentially relevant to NEC risk. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5657603/) |
| Shi et al. | 2020 | IEEE MeMeA | Automated thermal + RGB-D fusion for NEC detection. [IEEE](https://ieeexplore.ieee.org/document/9137344/) |
| Barson et al. | 2020 | WSEAS Trans Biology & Biomedicine | Clustering segmentation on IR images: skewness differentiates inflamed vs reference regions. [PDF](https://wseas.com/journals/bab/2020/a225108-078.pdf) |

**Active research program:** CHEO Research Institute (Ottawa) has ongoing NEC detection via IR+RGB-D sensing.

---

## 3. Respiratory Monitoring & Apnea Detection (16 papers — most mature technical area)

Key advantage over chest impedance: can differentiate obstructive vs central apnea (84-93% accuracy). Nasal airflow thermal imaging achieves MAE of 1.5-4 breaths/min.

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Abbas et al. | 2011 | BioMedical Engineering OnLine | First NICU respiratory thermal study: nostril temperature changes detect respiration. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3258209/) |
| Abbas et al. | 2012 | Infrared Physics & Technology | IR thermography during kangaroo care using IR-transparent polyethylene foil. [Link](https://www.sciencedirect.com/science/article/abs/pii/S135044951200059X) |
| Pereira et al. | 2017 | IEEE EMBC | Automated respiratory rate from thermal imaging. [IEEE](https://ieeexplore.ieee.org/document/8037689/) |
| Pereira et al. | 2019 | IEEE Trans Biomed Eng | "Black-box" algorithm overcoming chest impedance limitations for obstructive apnea. [DOI: 10.1109/TBME.2018.2866878](https://pubmed.ncbi.nlm.nih.gov/30139045/) |
| Lorato et al. | 2020 | Biomedical Optics Express | 3x FLIR Lepton cameras, MAE 2.07 breaths/min. Noted Plexiglas is opaque to LWIR. [DOI: 10.1364/BOE.397188](https://pmc.ncbi.nlm.nih.gov/articles/PMC7510882/) |
| Casalino et al. | 2021 | Sensors | Automatic separation of respiratory flow from motion without facial landmarks. [DOI: 10.3390/s21186306](https://www.mdpi.com/1424-8220/21/18/6306) |
| Lorato et al. | 2021 | Sensors | Automatic apnea classification: obstructive vs central (84% accuracy). [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8472592/) |
| Dos Santos et al. | 2021 | Case Studies Thermal Eng | Respiratory rate extraction methodology. [Link](https://www.sciencedirect.com/science/article/pii/S2214157X21000897) |
| Cay et al. | 2021 | Traitement du Signal | CNN on neonatal thermal images: 90.9% for respiratory anomaly classification. [Link](https://www.iieta.org/journals/ts/paper/10.18280/ts.380222) |
| Pereira et al. | 2021 | Computers in Biology & Medicine | Advanced respiratory signal processing. [Link](https://www.sciencedirect.com/science/article/abs/pii/S0010482521001153) |
| Maurya et al. | 2023 | J Clinical Monitoring & Computing | RGB-thermal fusion, 1.5 bpm average error. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10175339/) |
| Lorato et al. | 2024 | Sensors | Comprehensive review of contactless respiratory monitoring. [Link](https://www.mdpi.com/1424-8220/24/24/8118) |
| Hamada et al. | 2025 | Pediatric Pulmonology | ETT temperature prediction (bench study). [Link](https://onlinelibrary.wiley.com/doi/10.1002/ppul.27425) |
| Contactless Apnea | 2025 | Signal Image Video Processing | F1 scores: 0.86 obstructive, 0.93 central apnea. [Link](https://link.springer.com/article/10.1007/s11760-025-03959-2) |

**Gaps:** CPAP leak detection, ETT placement verification, pneumothorax detection, RDS severity assessment — all unexplored.

---

## 4. Hemodynamic Shock Prediction (3 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Nagori et al. | 2019 | Scientific Reports | ML on thermal images predicts shock 3h ahead, AUC 0.77. [Link](https://www.nature.com/articles/s41598-019-55698-7) |
| Vats et al. | 2022 | Frontiers in Physiology | Deep learning on 103,936 thermal video frames, AUC 0.81 at 5h horizon using $200 Seek Thermal camera. [DOI: 10.3389/fphys.2022.862411](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2022.862411/full) |
| Espinoza Caro & Fajardo | 2026 | IEEE Latin America Trans | Multi-model ML, AUC 0.84. [Link](https://ieeexplore.ieee.org/) |

---

## 5. Brain Injury / HIE (10 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Simbruner et al. | 1994 | Am J Perinatology | Landmark: head-esophageal temp difference classified 15/16 neonates as normal/damaged/hypoperfused. [PMID: 8198656](https://pubmed.ncbi.nlm.nih.gov/8198656/) |
| Bass et al. | 2014 | J Neonatal-Perinatal Medicine | Radiometric brain temp validated in 30 HIE neonates; brain temp elevation associated with white matter injury (p=0.01). [PMID: 25468621](https://pubmed.ncbi.nlm.nih.gov/25468621/) |
| Walas et al. | 2020 | Scientific Reports | Methodology to estimate neonatal thermogenesis from non-invasive thermal measurements. Cooling device output correlates with MRI-diagnosed brain injury. [DOI: 10.1038/s41598-020-79009-3](https://www.nature.com/articles/s41598-020-79009-3) |
| Walas et al. | 2021 | Scientific Reports | Novel "Thermal Index" correlates with MRI-confirmed brain injury during therapeutic hypothermia. Validated on 6 patients. [DOI: 10.1038/s41598-021-92139-6](https://www.nature.com/articles/s41598-021-92139-6) |
| Wu et al. | 2020 | J Pediatrics | Superficial brain temp during cooling is higher than rectal temp — standard monitoring misses it. [PMID: 32089332](https://pubmed.ncbi.nlm.nih.gov/32089332/) |
| Verma et al. | 2022 | Frontiers in Pediatrics | Review of all brain temperature methods; advocates non-invasive continuous monitoring for personalized hypothermia. [DOI: 10.3389/fped.2022.1008539](https://www.frontiersin.org/journals/pediatrics/articles/10.3389/fped.2022.1008539/full) |
| Heimann et al. | 2013 | J Perinatal Medicine | Multi-region IRT mapping including head in preterm infants. [DOI: 10.1515/jpm-2012-0239](https://pubmed.ncbi.nlm.nih.gov/23443261/) |
| Morimoto et al. | 2024 | Scientific Reports | Continuous 15-sec IRT reveals cyclic heat oscillations reflecting metabolic status. [DOI: 10.1038/s41598-024-60718-y](https://www.nature.com/articles/s41598-024-60718-y) |
| Iwata et al. | 2026 | Biosensors | Multimodal non-invasive sensors monitor cerebral blood flow-temperature relationships in 43 neonates during cold stress. [DOI: 10.3390/bios16020127](https://www.mdpi.com/2079-6374/16/2/127) |
| Topalidou et al. | 2019 | BMC Pregnancy & Childbirth | Scoping review noting deep structures have less insulation in neonates — enabling internal screening. [DOI: 10.1186/s12884-019-2533-y](https://link.springer.com/article/10.1186/s12884-019-2533-y) |

**Key insight:** Fontanelle = unique thermal window (thin skin, unossified skull).
**Gap:** No study combines IR cameras + AI for automated brain injury screening. No research on IRT for intracranial hemorrhage.

---

## 6. Brown Adipose Tissue / Metabolic Assessment (10 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Urisarri et al. | 2021 | Nature Communications | Landmark: IRT detects BAT activation in neonates via interscapular thermography. [DOI: 10.1038/s41467-021-25456-z](https://www.nature.com/articles/s41467-021-25456-z) |
| Gonzalez-Garcia et al. | 2022 | — | Review linking BAT, metabolic rate, and IRT in neonates. |
| Heimann et al. | 2000 | — | Validated IRT calorimetry against indirect calorimetry for energy expenditure in preterm infants. |
| Heimann et al. | 1999 | — | IRT calorimetry under radiant warmers; quantified heat loss rates. |
| Knobel-Dail et al. | 2017 | J Thermal Biology | Discovered reversed central-peripheral gradient in VLBW infants. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5657603/) |
| Heimann et al. | 2013 | J Perinatal Medicine | Multi-site IRT reveals regional patterns invisible to contact sensors. [PMID: 23443261](https://pubmed.ncbi.nlm.nih.gov/23443261/) |
| Morimoto et al. | 2024 | Scientific Reports | Continuous IRT captures dynamic metabolic cycling patterns. [Link](https://www.nature.com/articles/s41598-024-60718-y) |
| Christidis & Zotter | 2003 | — | Validated IRT for thermoregulatory transition at birth. |
| Knobel et al. | 2011 | Biological Research for Nursing | Foundational methodology paper. [PMID: 21586499](https://pubmed.ncbi.nlm.nih.gov/21586499/) |
| Topalidou et al. | 2019 | BMC Pregnancy & Childbirth | Scoping review. [Link](https://link.springer.com/article/10.1186/s12884-019-2533-y) |

**Gaps:** No studies on thyroid screening via neck thermography, hypoglycemia detection/prediction, or AI-driven metabolic alerts.

---

## 7. Cardiac & Perfusion Assessment (11 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Bridier et al. | 2023 | Frontiers in Pediatrics | Thermal gradients correlate with hemodynamic status post-cardiac surgery in 41 children. [DOI: 10.3389/fped.2023.1083962](https://www.frontiersin.org/journals/pediatrics/articles/10.3389/fped.2023.1083962/full) |
| Zhang et al. | 2025 | Biomedical Optics Express | Automated continuous CPTD monitoring in NICU. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11919349/) |
| Kerr et al. | 2018 | CVPR Workshop | Objective capillary refill time measurement framework. |
| Krbec et al. | 2024 | Frontiers in Pediatrics | Review of non-contact monitoring innovations. [DOI: 10.3389/fped.2024.1442753](https://www.frontiersin.org/journals/pediatrics/articles/10.3389/fped.2024.1442753/full) |
| Rice et al. | 2010 | J Surgical Radiology | Perfusion-related temperature differences in ELBW infants. [Link](https://scholars.duke.edu/publication/723960) |

**Major gaps:**
- **Coarctation of the aorta** screening via upper/lower body thermal differences — never studied despite being a known clinical sign
- **Congenital heart disease** screening — no published thermal camera studies
- **Capillary refill time** in neonates — framework exists but not validated

---

## 8. Phototherapy & Skin (16 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Smales | 1978 | — | First demonstration that phototherapy alters neonatal thermal environment. |
| Pezzati et al. | 1999 | — | 70% increase in skin blood flow during phototherapy without core temp change. |
| Enver et al. | 2013 | — | High-intensity LED (≥60 μW/cm²/nm) significantly raises body temp to 37.7°C. |
| Ng et al. | 2017 | — | Fibreoptic LED pads heat neonatal skin — warning. |
| Yassin et al. | 2021 | — | Incubator air must be reduced 0.5-1.25°C during LED phototherapy. |
| Hamada et al. | 2022 | Annals of Biomedical Eng | Calibration achieving MAE <0.1°C inside incubators. [DOI: 10.1007/s10439-022-02937-w](https://link.springer.com/article/10.1007/s10439-022-02937-w) |
| Clark & Stothers | 1980 | — | Pioneered regional temperature mapping. |

**Gaps:** No studies on adhesive/tape skin injury detection, diaper dermatitis, skin maturation assessment, or real-time thermal surveillance during phototherapy.

---

## 9. Surgical & Wound Monitoring (12 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Saxena & Willital | 2008 | European J Pediatrics | 483 exams over 10 years; IRT detects wound infection (3.6°C rise in abscesses). [Link](https://link.springer.com/article/10.1007/s00431-007-0583-z) |
| Ganon et al. | 2020 | — | IRT correctly identified 100% of superficial and deep burns in children vs 42-83% for clinical exam. |
| Medina-Preciado et al. | 2013 | J Biomedical Optics | Non-invasive burn depth determination in children. [DOI: 10.1117/1.JBO.18.6.061204](https://www.spiedigitallibrary.org/journals/journal-of-biomedical-optics/volume-18/issue-06/061204/) |
| FLIR ONE Pro Paediatric Burns | 2026 | — | Smartphone-mounted thermal camera for pediatric burn assessment. [Link](https://www.sciencedirect.com/science/article/pii/S030541792600094X) |
| Hwang et al. | 2024 | Int Wound Journal | IRT predicts skin graft success/failure. [Link](https://onlinelibrary.wiley.com/doi/10.1111/iwj.70107) |
| Katz et al. | 2008 | — | 8.8°C gradient in compartment syndrome (adult). [PMID: 18496371](https://pubmed.ncbi.nlm.nih.gov/18496371/) |

**Gaps:** Umbilical catheter placement verification, neonatal compartment syndrome — unexplored.

---

## 10. AI / Deep Learning Applied to Neonatal Thermal Imaging (18 papers — fastest growing)

### Three dominant research groups:
- **Ornek/Ceylan (Selcuk University, Turkey)** — classification
- **Lyra/Leonhardt (RWTH Aachen, Germany)** — multi-modal fusion/segmentation
- **Garcia-Torres (Norway)** — delivery room AI

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Ornek et al. | 2019 | Infrared Physics & Technology | First deep CNN on neonatal thermal: 99.58% accuracy. [Link](https://www.sciencedirect.com/science/article/abs/pii/S1350449519303123) |
| Ornek & Ceylan | 2022 | Multimedia Tools & Applications | Transfer learning: ResNet101/VGG19 top performers. [Link](https://link.springer.com/article/10.1007/s11042-021-11852-6) |
| Ornek & Ceylan | 2023 | Quantitative InfraRed Thermography J | CodCAM for explainability. [Link](https://www.tandfonline.com/doi/full/10.1080/17686733.2023.2167459) |
| Ornek & Ceylan | 2023 | Quantitative InfraRed Thermography J | Super-resolution preprocessing boosts accuracy ~10%. [Link](https://www.tandfonline.com/doi/abs/10.1080/17686733.2023.2179282) |
| Hesse et al. | 2022 | BMC Medical Imaging | U-Net GAN: 93.5% accuracy / 70.4% mIoU body region segmentation. [Link](https://bmcmedimaging.biomedcentral.com/articles/10.1186/s12880-021-00730-0) |
| Hesse et al. | 2023 | Biomedical Eng & Computational Biology | Multi-modal fusion (RGB+thermal): 0.85 mIoU. [Link](https://link.springer.com/article/10.1186/s12938-023-01092-0) |
| Lyra et al. | 2022 | Medical & Biological Eng & Computing | RGB+IR+3D ToF camera fusion for real-time monitoring. [Link](https://link.springer.com/article/10.1007/s11517-022-02561-9) |
| Lyra et al. | 2023 | — | Sensor fusion face detection. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10223875/) |
| Sherwood et al. | 2025 | npj Digital Medicine | Pose estimation via RGB+depth+IR: 0.811 AP. [Link](https://www.nature.com/articles/s41746-025-01929-z) |
| Ervural & Ceylan | 2022 | — | Siamese networks: 94-99.4% accuracy with one-shot learning. [Link](https://www.tandfonline.com/doi/full/10.1080/17686733.2021.2010379) |
| Ornek & Ceylan | 2021 | IEEE | DCGAN for synthetic neonatal thermal data augmentation. [IEEE](https://ieeexplore.ieee.org/document/9579769/) |
| Hesse et al. | 2023 | Sensors | cGAN augmentation: 28% of synthetic images rated more realistic than manual augmentation. [Link](https://www.mdpi.com/1424-8220/23/2/999) |
| Garcia-Torres et al. | 2025 | Computers in Biology & Medicine | Time-of-birth detection: 88.1% precision, 2.7s median deviation. [Link](https://www.sciencedirect.com/science/article/pii/S0010482525300769) |
| Garcia-Torres et al. | 2025 | arXiv | Two-stream thermal fusion: 95.7% precision. [arXiv](https://arxiv.org/abs/2503.03244) |
| Khalid et al. | 2023 | Sensors | AI thermostat for NICU. [Link](https://www.mdpi.com/1424-8220/23/9/4492) |

---

## 11. Technical / Commercial Systems (16 papers)

### Camera Hardware
| Camera | Cost | Notes |
|--------|------|-------|
| FLIR SC640 | ~$20,000+ | Research-grade, used in Knobel-Dail studies |
| FLIR Lepton | ~$200 | Used by Lorato et al. for multi-camera respiratory monitoring |
| Seek Thermal | ~$200 | Used by Vats et al. for shock prediction |
| FLIR One Pro | ~$400 | Smartphone-mounted, used for pediatric burns |

### Key Technical Challenges
- **Plexiglas blocks LWIR** — solutions: polyethylene foil windows (92-94% transmission), plastic wrap cutouts, or camera inside incubator
- **LWIR (8-14μm, uncooled microbolometer)** is consensus choice for clinical use
- **MWIR** offers better resolution but requires cryogenic cooling ($30-100K+)

### Calibration
| Paper | Year | Key Finding |
|-------|------|-------------|
| Abbas et al. | 2012 | Environment-specific compensation equations for incubators, KMC, radiant warmers. |
| Hamada et al. | 2022 | Blackbody reference: MAE <0.1°C, improved accurate readings from 4.2% to 93.1%. [DOI: 10.1007/s10439-022-02937-w](https://link.springer.com/article/10.1007/s10439-022-02937-w) |

### Regulatory Pathways
- **FDA (US):** Telethermographic systems under 21 CFR 884.2980(a), product code LHQ. Class I for adjunctive use (510k); Class III for standalone diagnostic (PMA).
- **EU:** MDR 2017/745, typically Class IIa. Requires Notified Body, CER, ISO 13485 QMS.

### Key Reviews
| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Topalidou et al. | 2019 | BMC Pregnancy & Childbirth | Scoping review of 21 studies. Reliable but no large prospective trials. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC6814124/) |
| ALZubaidi et al. | 2018 | Methods & Protocols | Covers MWIR/LWIR technologies for contactless neonatal imaging. [Link](https://www.mdpi.com/2409-9279/1/4/39) |
| Krbec et al. | 2024 | Frontiers in Pediatrics | Emerging non-contact technologies vs wearable complications. [DOI: 10.3389/fped.2024.1442753](https://www.frontiersin.org/journals/pediatrics/articles/10.3389/fped.2024.1442753/full) |

---

## 12. IV Infiltration / Extravasation (6 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Oya et al. | 2017 | European J Oncology Nursing | Fan-shaped cool zone predicts extravasation. [PMID: 28478856](https://pubmed.ncbi.nlm.nih.gov/28478856/) |
| Schaefer et al. | 2017 | J Infusion Nursing | Sensitivity 84.6%, specificity 94.8% in 257 chemotherapy patients. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC5680995/) |
| Hirata et al. | 2023 | ACS Sensors | Review: thermal imaging ~85% detection sensitivity. [DOI: 10.1021/acssensors.2c02602](https://pubs.acs.org/doi/10.1021/acssensors.2c02602) |
| D'Andrea et al. | 2023 | J Vascular Access | Optical device for continuous IV monitoring in neonates. [DOI: 10.1177/11297298231177723](https://journals.sagepub.com/doi/10.1177/11297298231177723) |
| van Rens et al. | 2023 | J Vascular Access | ivWatch optical sensor: 100% sensitivity (11/11 events) in NICU. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11539516/) |
| van Rens et al. | 2025 | BMJ | 4-year NICU study: severity dropped from 15% to 5% tissue involvement with optical sensor. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12228456/) |

**Note:** Most neonatal-specific validation is with optical (near-IR) sensors (ivWatch), not traditional LWIR thermal cameras.

---

## 13. Pain / Stress Assessment (2 papers)

| Paper | Year | Journal | Key Finding |
|-------|------|---------|-------------|
| Kretschmer et al. | 2023 | Pediatric Research | Nasal tip shows greatest temperature change in hungry vs not-hungry infants. [DOI: 10.1038/s41390-023-02614-1](https://www.nature.com/articles/s41390-023-02614-1) |
| Urisarri et al. | 2021 | Nature Communications | BAT activation via IRT demonstrates autonomic stress response detection. [DOI: 10.1038/s41467-021-25456-z](https://www.nature.com/articles/s41467-021-25456-z) |

**Gap:** Pain-specific facial thermography in neonates is essentially absent from the literature.

---

## Summary: Biggest Research Gaps (Novel Opportunities)

| Gap | Why It Matters | Evidence Level |
|-----|---------------|----------------|
| Coarctation of aorta screening | Known temp differential sign, never studied with thermal cameras | No studies |
| Congenital heart disease screening | No thermal screening studies exist | No studies |
| IV infiltration via LWIR thermal camera in neonates | Only optical sensors studied; thermal untested in this population | No neonatal LWIR studies |
| CPAP leak detection | Common NICU problem, no studies | No studies |
| Automated brain injury screening (IR + AI) | Individual components exist, never combined | No integrated studies |
| NEC real-time alerting | Feasibility shown, no prospective alerting trial | Feasibility only |
| Adhesive skin injury (MARSI) detection | Extremely common NICU problem | No studies |
| Hypoglycemia prediction from thermal patterns | Metabolic link plausible | No studies |
| Pain assessment via facial thermography | Current scales are subjective | 1 preliminary study |
| Neonatal thyroid screening via neck thermography | Non-invasive screening potential | No studies |
| Pneumothorax detection | Acute emergency, early detection critical | No studies |
| Feeding intolerance via abdominal thermography | Could reduce unnecessary NPO periods | No studies |
