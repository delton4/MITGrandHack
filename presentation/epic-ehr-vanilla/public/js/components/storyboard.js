// Epic EHR — Storyboard (Patient Demographics Banner)
const Storyboard = {
  render(el, patient, allergies, collapsed) {
    const dol = App.dayOfLife(patient.dob);
    const ga = App.gaDisplay(patient.gestational_age_weeks, patient.gestational_age_days);
    const sex = patient.sex === 'M' ? 'Male' : 'Female';
    const icon = patient.sex === 'M' ? '&#128118;' : '&#128118;';

    const allergyBadges = allergies.map(a => {
      const isNKDA = a.allergen.includes('No Known');
      return `<span class="allergy-badge ${isNKDA ? 'nkda' : ''}">${isNKDA ? 'NKDA' : a.allergen}</span>`;
    }).join('');

    const storyboard = document.createElement('div');
    storyboard.className = `storyboard ${collapsed ? 'collapsed' : ''}`;
    storyboard.innerHTML = `
      <div class="storyboard-photo">${icon}</div>
      <div class="storyboard-section">
        <div class="storyboard-name">${patient.last_name}, ${patient.first_name}</div>
        <div class="storyboard-mrn">${patient.mrn} &bull; DOB: ${App.formatDate(patient.dob)}</div>
      </div>
      <div class="storyboard-section">
        <div class="storyboard-detail">
          <span><strong>GA:</strong> ${ga} wk</span>
          <span><strong>DOL:</strong> ${dol}</span>
          <span><strong>Sex:</strong> ${sex}</span>
        </div>
        <div class="storyboard-detail">
          <span><strong>Wt:</strong> ${patient.current_weight_g}g</span>
          <span><strong>Len:</strong> ${patient.current_length_cm} cm</span>
          <span><strong>HC:</strong> ${patient.head_circumference_cm} cm</span>
        </div>
      </div>
      <div class="storyboard-section">
        <div class="storyboard-detail">
          <span><strong>Bed:</strong> ${patient.bed}</span>
          <span><strong>Code:</strong> ${patient.code_status}</span>
        </div>
        <div class="storyboard-detail">
          <span><strong>Attending:</strong> ${patient.attending}</span>
        </div>
      </div>
      <div class="storyboard-section">
        <div class="storyboard-allergies">${allergyBadges}</div>
        <div class="storyboard-fyi">
          ${patient.neotherm_alert_active ? '<span class="fyi-icon" title="NeoTherm Alert Active">&#9888;&#65039;</span>' : ''}
          ${patient.acuity === 'Level IV' ? '<span class="fyi-icon" title="Level IV Acuity">&#128308;</span>' : ''}
        </div>
      </div>
      <div class="storyboard-collapse-icon">${collapsed ? '&#9660;' : '&#9650;'}</div>
    `;

    storyboard.addEventListener('click', () => App.toggleStoryboard(patient.id));
    el.appendChild(storyboard);
  }
};
