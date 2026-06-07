// ─── ADD TO admin/app.js ───────────────────────────────────────────────────
// Competition Create Modal — paste this section into admin/app.js

import {
  addDoc, collection, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* OPEN/CLOSE MODAL */
window.openCompModal = () => {
  document.getElementById('compModal').classList.add('open');
  setTeamSizeRules();
};
window.closeCompModal = () => document.getElementById('compModal').classList.remove('open');

/* TEAM SIZE RULES */
window.setTeamSizeRules = () => {
  const ts = document.getElementById('cm-team-size').value;
  const sub = { '1vs1':'N/A', '2vs2':'Max 1 sub (2+1)', '11vs11':'Max 5 subs (11+5)', '6vs6':'Max 3 subs (6+3)' };
  const el = document.getElementById('cm-sub-note');
  if (el) el.textContent = sub[ts] || '';
};

/* CREATE COMPETITION */
window.createCompetition = async () => {
  const btn = document.getElementById('cm-save-btn');
  const msg = document.getElementById('cm-msg');
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    const get = id => document.getElementById(id)?.value || '';
    const data = {
      name: get('cm-name'),
      image_url: get('cm-image'),
      comp_type: get('cm-type'),          // pvp / cvc
      format: get('cm-format'),
      team_size: get('cm-team-size'),
      teams_for_club: get('cm-teams'),
      max_players: parseInt(get('cm-max-players')),
      max_groups: parseInt(get('cm-max-groups')),
      reg_start: get('cm-reg-start'),
      reg_end: get('cm-reg-end'),
      comp_start: get('cm-comp-start'),
      duration_days: parseInt(get('cm-duration')),
      timezone: get('cm-timezone'),
      entry_fee_enabled: get('cm-entry-fee') === 'true',
      entry_fee_bdt: get('cm-entry-fee') === 'true' ? parseInt(get('cm-fee-amount')) : 0,
      prize_bdt: parseInt(get('cm-prize-bdt')) || 0,
      prize_coins: parseInt(get('cm-prize-coins')) || 0,
      prize_1st: parseInt(get('cm-p1')) || 50,
      prize_2nd: parseInt(get('cm-p2')) || 30,
      prize_3rd: parseInt(get('cm-p3')) || 20,
      sponsor_name: get('cm-sponsor'),
      sponsor_logo: get('cm-sponsor-logo'),
      status: 'upcoming',
      participants: [],
      registered: 0,
      created_by: window._currentAdminUid || '',
      created_at: serverTimestamp()
    };
    if (!data.name) { msg.textContent = 'Competition name required'; btn.disabled=false; btn.textContent='Save Competition'; return; }
    await addDoc(collection(window._db, 'competitions'), data);
    msg.style.color = 'var(--g)';
    msg.textContent = '✅ Competition created!';
    setTimeout(() => { closeCompModal(); loadDashboard(); }, 1500);
  } catch(e) {
    msg.textContent = e.message;
    btn.disabled = false; btn.textContent = 'Save Competition';
  }
};
