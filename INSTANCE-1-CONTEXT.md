# Instance 1: NeoTherm System Design

## Resume Prompt
Copy-paste this to resume in a new Claude session:

> Resume the NeoTherm system design brainstorm. Read INSTANCE-1-CONTEXT.md for full context. We're at step 2 — asking clarifying questions. The first question is: What is NeoTherm's target for the MIT Grand Hack? (A) Hackathon demo/prototype, (B) Full system design spec, or (C) Both — full design but scope the hackathon deliverable to a demo slice.

## What's Been Done
1. Cloned and analyzed the Greek team's repo (`greek github project/Early-detection-of-neonatal-sepsis-using-thermal-images/`)
2. Ran codebase mapping — 7 docs in `.planning/codebase/` (STACK, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, INTEGRATIONS, CONCERNS)
3. Deep analysis of what's reusable vs not from Greek project (see below)
4. Started brainstorming skill workflow for NeoTherm system design

## What's Reusable From Greek Project
- **Clinical methodology:** Core-peripheral temperature gradient (CPTD) >3.5°C for sepsis detection
- **Zone mapping:** Zone 1 (core/shoulders), Zone 2 (arms/legs), Zone 3 (hands/feet)
- **HRNet-W48 for neonatal pose detection** — adult model works at 0.7 confidence threshold
- **Time-series CSV data** from 26 babies (baby_29 through baby_54) for validation
- **Alarm thresholds:** >3.5°C gradient, >38.5°C core temp, 5+ consecutive abnormal readings
- **Rejection criteria:** occlusions, incomplete anatomy, out-of-range temps

## What's NOT Reusable (Must Build Fresh)
- All code — hardcoded paths, no tests, research-grade scripts
- Manual homography alignment — needs automation or elimination
- Batch/offline processing — needs real-time pipeline
- No RGB camera dependency if possible (simplifies hardware)

## Key Research Context
- **No NICU in the world** currently uses thermal cameras clinically (wide-open market)
- **Dräger ThermoMonitoring** is the closest competitor — contact probes doing CPTD, but NO AI/automated alerting
- **FDA pathway:** Class I adjunctive use (510k) under product code LHQ
- **Clinical evidence:** CPTD >2°C sustained 4h: sensitivity 90.9%, specificity 90% (Leante-Castellanos 2012)
- **NeoTherm targets ALL neonates**, not just premature

## Brainstorm Progress
- [x] Explore project context
- [ ] **Ask clarifying questions** ← WE ARE HERE (question 1: hackathon scope A/B/C)
- [ ] Propose 2-3 approaches
- [ ] Present design for approval
- [ ] Write design doc
- [ ] Spec review loop
- [ ] User reviews spec
- [ ] Transition to implementation planning

## Key Memory
- Diego has no prior CV/ML experience — needs ground-up explanations
- NeoTherm targets all neonates, not just premature infants
