// competition-center/app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, getDocs, doc, getDoc,
  addDoc, updateDoc, arrayUnion, serverTimestamp,
  query, where, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDwPilelp6BgHhHD8Hs_cHx96ZJNZdeYag",
  authDomain: "ekickhub-bd.firebaseapp.com",
  projectId: "ekickhub-bd",
  storageBucket: "ekickhub-bd.firebasestorage.app",
  messagingSenderId: "306381500871",
  appId: "1:306381500871:web:50e1cc59d823872328e9e2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ── STATE ── */
let currentUser = null;
let currentUserData = null;
let allComps = [];
let activeFilter = "all";
let activeComp = null;
let activeMatchId = null;
let cdIntervals = {};

/* ── AUTH ── */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      currentUserData = snap.data();
      const img = document.getElementById("tbImg");
      if (img && currentUserData.image) img.src = currentUserData.image;
    }
  }
  loadCompetitions();
});

/* ── LOAD COMPETITIONS ── */
async function loadCompetitions() {
  const grid = document.getElementById("compGrid");
  grid.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner"></i>Loading competitions…</div>';
  try {
    const snap = await getDocs(query(collection(db, "competitions"), orderBy("created_at", "desc")));
    allComps = [];
    snap.forEach(d => allComps.push({ id: d.id, ...d.data() }));
    renderComps(allComps);
  } catch (e) {
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Failed to load. Check Firestore rules.</p></div>';
  }
}

/* ── RENDER COMPS ── */
function renderComps(list) {
  const grid = document.getElementById("compGrid");
  if (!list.length) {
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-trophy"></i><p>No competitions found.</p></div>';
    return;
  }
  grid.innerHTML = "";
  list.forEach(c => {
    const statusInfo = getStatusInfo(c);
    const card = document.createElement("div");
    card.className = "cc";
    card.dataset.id = c.id;
    card.innerHTML = `
      <div class="cc-img-wrap">
        <img class="cc-img" src="${c.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=70'}" alt="">
        <div class="cc-img-over"></div>
        <span class="cc-status ${statusInfo.cls}">${statusInfo.label}</span>
        <span class="cc-type"><i class="fa-solid ${c.comp_type === 'pvp' ? 'fa-person-running' : 'fa-shield-halved'}"></i> ${c.comp_type === 'pvp' ? 'Player vs Player' : 'Club vs Club'}</span>
      </div>
      <div class="cc-body">
        <div class="cc-title">${c.name}</div>
        ${c.sponsor_name ? `<div class="cc-sponsor"><i class="fa-solid fa-handshake"></i> Sponsored by ${c.sponsor_name}</div>` : ''}
        <div class="cc-meta">
          <div class="cc-pill"><i class="fa-solid fa-users"></i>${c.registered || 0}/${c.max_players} Slots</div>
          <div class="cc-pill"><i class="fa-solid fa-layer-group"></i>${c.format}</div>
          <div class="cc-pill"><i class="fa-solid fa-gamepad"></i>${c.team_size}</div>
        </div>
        ${c.prize_bdt ? `<div class="cc-prize">
          <div class="cc-prize-item"><div class="pi-val">৳${Number(c.prize_bdt).toLocaleString()}</div><div class="pi-lbl">Prize Pool</div></div>
          ${c.prize_coins ? `<div class="cc-prize-item"><div class="pi-val" style="color:var(--gd)">${Number(c.prize_coins).toLocaleString()}</div><div class="pi-lbl">eKH Coins</div></div>` : ''}
        </div>` : ''}
        ${buildCountdown(c, statusInfo.status)}
        <button class="cc-btn ${statusInfo.status === 'registration' ? 'cc-btn-reg' : 'cc-btn-view'}" onclick="openDetail('${c.id}')">
          ${statusInfo.status === 'registration' ? '<i class="fa-solid fa-flag-checkered"></i> Register Now' : '<i class="fa-solid fa-eye"></i> View Details'}
        </button>
      </div>`;
    grid.appendChild(card);
    if (statusInfo.cdTarget) startCountdown(c.id, statusInfo.cdTarget, statusInfo.cdLabel, card);
  });
}

function buildCountdown(c, status) {
  if (status === 'registration') {
    return `<div class="cc-cd"><div class="cc-cd-lbl">Registration ends in</div><div class="cd-boxes" id="cd-${c.id}">
      <div class="cd-box"><div class="cv">--</div><div class="cl">Days</div></div>
      <div class="cd-box"><div class="cv">--</div><div class="cl">Hours</div></div>
      <div class="cd-box"><div class="cv">--</div><div class="cl">Mins</div></div>
      <div class="cd-box"><div class="cv">--</div><div class="cl">Secs</div></div>
    </div></div>`;
  }
  if (status === 'upcoming') {
    return `<div class="cc-cd"><div class="cc-cd-lbl">Competition starts in</div><div class="cd-boxes" id="cd-${c.id}">
      <div class="cd-box"><div class="cv">--</div><div class="cl">Days</div></div>
      <div class="cd-box"><div class="cv">--</div><div class="cl">Hours</div></div>
      <div class="cd-box"><div class="cv">--</div><div class="cl">Mins</div></div>
      <div class="cd-box"><div class="cv">--</div><div class="cl">Secs</div></div>
    </div></div>`;
  }
  return '';
}

function startCountdown(id, targetDate, label, cardEl) {
  if (cdIntervals[id]) clearInterval(cdIntervals[id]);
  const boxes = document.querySelectorAll(`#cd-${id} .cv`);
  if (!boxes.length) return;
  const update = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) { clearInterval(cdIntervals[id]); loadCompetitions(); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (boxes[0]) boxes[0].textContent = String(d).padStart(2,'0');
    if (boxes[1]) boxes[1].textContent = String(h).padStart(2,'0');
    if (boxes[2]) boxes[2].textContent = String(m).padStart(2,'0');
    if (boxes[3]) boxes[3].textContent = String(s).padStart(2,'0');
  };
  update();
  cdIntervals[id] = setInterval(update, 1000);
}

function getStatusInfo(c) {
  const now = new Date();
  const regStart = c.reg_start ? new Date(c.reg_start) : null;
  const regEnd = c.reg_end ? new Date(c.reg_end) : null;
  const compStart = c.comp_start ? new Date(c.comp_start) : null;
  const compEnd = c.comp_end ? new Date(c.comp_end) : null;

  if (c.status === 'completed' || (compEnd && now > compEnd)) return { status:'completed', cls:'st-done', label:'Completed', cdTarget:null };
  if (c.status === 'live' || (compStart && now >= compStart && (!compEnd || now < compEnd))) return { status:'live', cls:'st-live', label:'🔴 Live', cdTarget:null };
  if (regStart && now >= regStart && regEnd && now < regEnd) return { status:'registration', cls:'st-reg', label:'Registration Open', cdTarget:c.reg_end, cdLabel:'Reg ends in' };
  if (compStart && now < compStart) return { status:'upcoming', cls:'st-up', label:'Upcoming', cdTarget:c.comp_start, cdLabel:'Starts in' };
  return { status:'upcoming', cls:'st-up', label:'Upcoming', cdTarget:null };
}

/* ── FILTER ── */
window.filterComps = (f, btn) => {
  activeFilter = f;
  document.querySelectorAll('.fb-btn').forEach(b => b.classList.remove('act','act-pk'));
  btn.classList.add('act');
  const q = document.getElementById('searchComp').value.toLowerCase();
  applyFilters(q);
};

window.searchComps = (v) => applyFilters(v.toLowerCase());

function applyFilters(q) {
  let list = allComps.filter(c => {
    const matchQ = !q || c.name.toLowerCase().includes(q) || (c.sponsor_name||'').toLowerCase().includes(q);
    if (!matchQ) return false;
    if (activeFilter === 'all') return true;
    const s = getStatusInfo(c).status;
    return s === activeFilter;
  });
  renderComps(list);
  // restart countdowns
  list.forEach(c => {
    const si = getStatusInfo(c);
    if (si.cdTarget) {
      const card = document.querySelector(`[data-id="${c.id}"]`);
      if (card) startCountdown(c.id, si.cdTarget, si.cdLabel, card);
    }
  });
}

/* ── OPEN DETAIL ── */
window.openDetail = async (id) => {
  activeComp = allComps.find(c => c.id === id);
  if (!activeComp) return;
  document.getElementById('detailModal').classList.add('open');
  document.getElementById('dm-title').textContent = activeComp.name;
  const heroImg = document.getElementById('dm-img');
  heroImg.src = activeComp.image_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=70';
  document.getElementById('dm-logo').src = activeComp.sponsor_logo || activeComp.image_url || heroImg.src;
  buildDetailMeta();
  switchTab('overview', document.querySelector('.cdm-tab'));
};

function buildDetailMeta() {
  const c = activeComp;
  const si = getStatusInfo(c);
  document.getElementById('dm-meta').innerHTML = `
    <span class="cdm-badge ${si.cls}">${si.label}</span>
    <span class="cdm-badge" style="background:rgba(0,255,225,.1);color:var(--c);border:1px solid rgba(0,255,225,.2)">${c.comp_type === 'pvp' ? '⚔ Player vs Player' : '🛡 Club vs Club'}</span>
    <span class="cdm-badge" style="background:rgba(255,255,255,.06);color:var(--mu2);border:1px solid var(--bdr2)">${c.format}</span>
    <span class="cdm-badge" style="background:rgba(255,255,255,.06);color:var(--mu2);border:1px solid var(--bdr2)">${c.team_size}</span>
  `;
}

window.closeDetail = () => { document.getElementById('detailModal').classList.remove('open'); activeComp = null; };

/* ── TAB SWITCH ── */
window.switchTab = (tab, el) => {
  document.querySelectorAll('.cdm-tab').forEach(t => t.classList.remove('act'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('act'));
  if (el) el.classList.add('act');
  document.getElementById('tab-'+tab).classList.add('act');
  if (tab === 'overview') buildOverview();
  if (tab === 'participants') loadParticipants();
  if (tab === 'fixtures') loadFixtures();
  if (tab === 'standings') loadStandings();
  if (tab === 'bracket') loadBracket();
  if (tab === 'schedule') buildSchedule();
};

/* ── OVERVIEW ── */
function buildOverview() {
  const c = activeComp;
  document.getElementById('ov-info').innerHTML = `
    <div class="ov-card"><div class="ov-label">Status</div><div class="ov-val c">${getStatusInfo(c).label.toUpperCase()}</div></div>
    <div class="ov-card"><div class="ov-label">Format</div><div class="ov-val">${c.format}</div></div>
    <div class="ov-card"><div class="ov-label">Team Size</div><div class="ov-val">${c.team_size}</div></div>
    <div class="ov-card"><div class="ov-label">Max Slots</div><div class="ov-val">${c.registered||0} / ${c.max_players}</div></div>
    <div class="ov-card"><div class="ov-label">Reg. Start</div><div class="ov-val">${fmtDate(c.reg_start)}</div></div>
    <div class="ov-card"><div class="ov-label">Reg. End</div><div class="ov-val">${fmtDate(c.reg_end)}</div></div>
    <div class="ov-card"><div class="ov-label">Comp. Start</div><div class="ov-val">${fmtDate(c.comp_start)}</div></div>
    <div class="ov-card"><div class="ov-label">Est. Duration</div><div class="ov-val">${c.duration_days || '-'} Days</div></div>
    ${c.sponsor_name ? `<div class="ov-card"><div class="ov-label">Sponsor</div><div class="ov-val">${c.sponsor_name}</div></div>` : ''}
    ${c.timezone ? `<div class="ov-card"><div class="ov-label">Time Zone</div><div class="ov-val">${c.timezone}</div></div>` : ''}
  `;
  document.getElementById('ov-prize').innerHTML = `
    <div class="pr-card"><div class="pr-trophy">🥇</div><div class="pr-amount">${c.prize_bdt ? '৳'+Math.round(Number(c.prize_bdt)*(Number(c.prize_1st||50)/100)).toLocaleString() : '-'}</div><div class="pr-lbl">1st Place ${c.prize_1st||50}%</div></div>
    <div class="pr-card"><div class="pr-trophy">🥈</div><div class="pr-amount">${c.prize_bdt ? '৳'+Math.round(Number(c.prize_bdt)*(Number(c.prize_2nd||30)/100)).toLocaleString() : '-'}</div><div class="pr-lbl">2nd Place ${c.prize_2nd||30}%</div></div>
    <div class="pr-card"><div class="pr-trophy">🥉</div><div class="pr-amount">${c.prize_bdt ? '৳'+Math.round(Number(c.prize_bdt)*(Number(c.prize_3rd||20)/100)).toLocaleString() : '-'}</div><div class="pr-lbl">3rd Place ${c.prize_3rd||20}%</div></div>
  `;
  document.getElementById('ov-pts').innerHTML = `
    <div class="pt-card win"><div class="pt-val">3</div><div class="pt-lbl">Win</div></div>
    <div class="pt-card draw"><div class="pt-val">1</div><div class="pt-lbl">Draw</div></div>
    <div class="pt-card loss"><div class="pt-val">0</div><div class="pt-lbl">Loss</div></div>
  `;
  buildRegPanel();
}

function buildRegPanel() {
  const c = activeComp;
  const si = getStatusInfo(c);
  const panel = document.getElementById('reg-panel');
  const isReg = si.status === 'registration';
  const alreadyReg = currentUserData && Array.isArray(c.participants) && c.participants.includes(currentUser?.uid);

  panel.innerHTML = `<div class="reg-title"><i class="fa-solid fa-flag-checkered"></i>Registration</div>`;

  if (isReg && !alreadyReg) {
    panel.innerHTML += `
      <div class="rp-countdown"><div class="rp-cd-lbl">Registration closes in</div>
        <div class="rp-cd-boxes">
          <div class="rp-cd-box"><div class="v" id="rp-d">--</div><div class="l">Days</div></div>
          <div class="rp-cd-box"><div class="v" id="rp-h">--</div><div class="l">Hours</div></div>
          <div class="rp-cd-box"><div class="v" id="rp-m">--</div><div class="l">Mins</div></div>
          <div class="rp-cd-box"><div class="v" id="rp-s">--</div><div class="l">Secs</div></div>
        </div>
      </div>
      <div class="reg-fee-note"><i class="fa-solid fa-ticket"></i>
        Entry Fee: ${c.entry_fee_enabled ? '৳'+c.entry_fee_bdt : 'Free'}
      </div>
      <button class="reg-submit" id="reg-submit-btn" onclick="registerForComp()">
        <i class="fa-solid fa-flag-checkered"></i> Register Now
      </button>
      <div id="reg-msg" style="margin-top:10px;text-align:center;font-size:11px;color:var(--c);min-height:16px"></div>`;
    startRegCountdown(c.reg_end);
  } else if (alreadyReg) {
    panel.innerHTML += `<div style="text-align:center;padding:16px;background:rgba(57,255,20,.06);border:1px solid rgba(57,255,20,.2);border-radius:9px"><i class="fa-solid fa-circle-check" style="color:var(--g);font-size:22px;display:block;margin-bottom:8px"></i><div style="font-family:var(--fd);font-size:11px;color:var(--g);letter-spacing:1px">You are registered!</div></div>`;
  } else {
    panel.innerHTML += `<div style="text-align:center;color:var(--mu2);font-size:12px;padding:12px 0"><i class="fa-solid fa-lock" style="font-size:20px;display:block;margin-bottom:8px;color:var(--mu)"></i>${si.status === 'live' ? 'Competition is Live' : si.status === 'completed' ? 'Competition Ended' : 'Registration not open yet'}</div>`;
  }
}

function startRegCountdown(endDate) {
  const interval = setInterval(() => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) { clearInterval(interval); return; }
    const d = document.getElementById('rp-d');
    const h = document.getElementById('rp-h');
    const m = document.getElementById('rp-m');
    const s = document.getElementById('rp-s');
    if (!d) { clearInterval(interval); return; }
    const dd = Math.floor(diff/86400000), hh = Math.floor((diff%86400000)/3600000),
          mm = Math.floor((diff%3600000)/60000), ss = Math.floor((diff%60000)/1000);
    d.textContent = String(dd).padStart(2,'0');
    h.textContent = String(hh).padStart(2,'0');
    m.textContent = String(mm).padStart(2,'0');
    s.textContent = String(ss).padStart(2,'0');
  }, 1000);
}

/* ── REGISTER ── */
window.registerForComp = async () => {
  if (!currentUser || !currentUserData) { toast('Please login first','var(--pk)'); return; }
  const c = activeComp;
  if ((c.registered||0) >= c.max_players) { toast('Competition is full!','var(--rd)'); return; }
  const btn = document.getElementById('reg-submit-btn');
  const msg = document.getElementById('reg-msg');
  btn.disabled = true; btn.textContent = 'Registering…';
  try {
    await updateDoc(doc(db,'competitions',c.id), {
      participants: arrayUnion(currentUser.uid),
      registered: (c.registered||0) + 1
    });
    // Log in player profile
    await addDoc(collection(db,'competition_logs'), {
      uid: currentUser.uid,
      player_id: currentUserData.player_id,
      full_name: currentUserData.full_name,
      comp_id: c.id,
      comp_name: c.name,
      action: 'registered',
      timestamp: serverTimestamp()
    });
    activeComp.participants = [...(c.participants||[]), currentUser.uid];
    activeComp.registered = (c.registered||0)+1;
    toast('Registered successfully! 🎉');
    buildRegPanel();
  } catch(e) {
    msg.innerHTML = e.message;
    btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Register Now';
  }
};

/* ── PARTICIPANTS ── */
async function loadParticipants() {
  const grid = document.getElementById('part-grid');
  const c = activeComp;
  if (!c.participants || !c.participants.length) {
    grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-users"></i><p>No participants yet.</p></div>';
    return;
  }
  grid.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner"></i>Loading…</div>';
  const cards = await Promise.all(c.participants.map(async uid => {
    const snap = await getDoc(doc(db,'users',uid));
    return snap.exists() ? { uid, ...snap.data() } : null;
  }));
  grid.innerHTML = cards.filter(Boolean).map(p => `
    <div class="p-card">
      <div class="p-av"><img src="${p.image||'https://api.dicebear.com/7.x/adventurer/svg?seed='+p.uid+'&backgroundColor=0a1128'}" onerror="this.src='https://api.dicebear.com/7.x/adventurer/svg?seed=${p.uid}'"></div>
      <div class="p-name">${p.full_name||'–'}</div>
      <div class="p-id">${p.player_id||'–'}</div>
    </div>`).join('');
}

/* ── FIXTURES / MATCHES ── */
async function loadFixtures() {
  const el = document.getElementById('fixtures-content');
  el.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner"></i>Loading…</div>';
  const c = activeComp;
  const snap = await getDocs(query(collection(db,'matches'), where('comp_id','==',c.id), orderBy('round'), orderBy('created_at')));
  const matches = []; snap.forEach(d => matches.push({ id:d.id, ...d.data() }));
  if (!matches.length) { el.innerHTML = '<div class="empty-state"><i class="fa-solid fa-futbol"></i><p>No fixtures generated yet.</p></div>'; return; }
  const byRound = {};
  matches.forEach(m => { if (!byRound[m.round]) byRound[m.round] = []; byRound[m.round].push(m); });
  el.innerHTML = Object.entries(byRound).map(([round, ms]) => `
    <div style="margin-bottom:18px">
      <div style="font-family:var(--fd);font-size:10px;font-weight:700;letter-spacing:2px;color:var(--or);margin-bottom:10px;text-transform:uppercase;display:flex;align-items:center;gap:7px"><i class="fa-solid fa-circle-dot"></i>${round}</div>
      ${ms.map(m => buildMatchCard(m)).join('')}
    </div>`).join('');
}

function buildMatchCard(m) {
  const canSubmit = currentUser && (m.p1_uid === currentUser.uid || m.p2_uid === currentUser.uid) && m.status !== 'completed';
  const isPriv = currentUserData && (currentUserData.roles||[]).some(r => ['admin','moderator','referee'].includes(r));
  const canEdit = isPriv && m.status !== 'locked';
  const statusMap = { pending:'mcs-pending', live:'mcs-live', completed:'mcs-done', locked:'mcs-done' };
  return `<div class="match-card" id="mc-${m.id}">
    <div class="mc-round"><i class="fa-solid fa-circle-dot"></i>${m.round} · ${m.group||''}</div>
    <div class="mc-teams">
      <div class="mc-team">
        <div class="mc-team-av">${m.p1_image ? `<img src="${m.p1_image}">` : '⚽'}</div>
        <div class="mc-team-name">${m.p1_name||'TBD'}</div>
        <div class="mc-status-badge" style="font-size:9px;color:var(--mu2)">${m.p1_id||''}</div>
      </div>
      <div style="text-align:center">
        <div class="mc-score">
          <span>${m.score_p1 !== undefined ? m.score_p1 : '–'}</span>
          <span>:</span>
          <span>${m.score_p2 !== undefined ? m.score_p2 : '–'}</span>
        </div>
        <span class="mc-status-badge ${statusMap[m.status]||'mcs-pending'}">${m.status||'Pending'}</span>
      </div>
      <div class="mc-team">
        <div class="mc-team-av">${m.p2_image ? `<img src="${m.p2_image}">` : '⚽'}</div>
        <div class="mc-team-name">${m.p2_name||'TBD'}</div>
        <div class="mc-status-badge" style="font-size:9px;color:var(--mu2)">${m.p2_id||''}</div>
      </div>
    </div>
    ${m.match_date ? `<div style="text-align:center;margin-top:8px;font-size:10px;color:var(--mu2)"><i class="fa-regular fa-clock"></i> ${fmtDate(m.match_date)}</div>` : ''}
    ${(canSubmit || canEdit) ? `<button class="mc-submit-btn" onclick="openScoreModal('${m.id}','${m.p1_name||'P1'}','${m.p2_name||'P2'}','${m.p1_uid||''}','${m.p2_uid||''}',${m.score_p1},${m.score_p2})">${canEdit && !canSubmit ? '<i class="fa-solid fa-pen"></i> Edit Score' : '<i class="fa-solid fa-futbol"></i> Submit Score'}</button>` : ''}
  </div>`;
}

/* ── SCORE MODAL ── */
let scoreMatchData = {};
window.openScoreModal = (id, n1, n2, uid1, uid2, s1, s2) => {
  scoreMatchData = { id, n1, n2, uid1, uid2 };
  document.getElementById('scoreModal').classList.add('open');
  document.getElementById('sm-teams').innerHTML = `
    <div class="sm-team"><div class="sm-team-name">${n1}</div><input type="number" class="sm-score-input" id="sco1" min="0" max="99" value="${s1>=0?s1:''}" placeholder="0"></div>
    <div class="sm-vs">:</div>
    <div class="sm-team"><div class="sm-team-name">${n2}</div><input type="number" class="sm-score-input" id="sco2" min="0" max="99" value="${s2>=0?s2:''}" placeholder="0"></div>`;
  document.getElementById('sm-msg').textContent = '';
};
window.closeScore = () => { document.getElementById('scoreModal').classList.remove('open'); scoreMatchData = {}; };

window.submitScore = async () => {
  const s1 = parseInt(document.getElementById('sco1').value);
  const s2 = parseInt(document.getElementById('sco2').value);
  const msg = document.getElementById('sm-msg');
  if (isNaN(s1)||isNaN(s2)||s1<0||s2<0) { msg.textContent = 'Enter valid scores'; return; }
  const btn = document.getElementById('sm-submit-btn');
  btn.disabled = true; btn.textContent = 'Submitting…';
  try {
    const isPriv = currentUserData && (currentUserData.roles||[]).some(r => ['admin','moderator','referee'].includes(r));
    const d = scoreMatchData;
    const winner = s1>s2 ? d.uid1 : s2>s1 ? d.uid2 : null;
    await updateDoc(doc(db,'matches',d.id), {
      score_p1: s1, score_p2: s2,
      winner_uid: winner,
      status: isPriv ? 'completed' : 'pending_confirm',
      submitted_by: currentUser.uid,
      submitted_by_role: isPriv ? 'staff' : 'player',
      submitted_at: serverTimestamp()
    });
    await addDoc(collection(db,'score_logs'), {
      match_id: d.id, comp_id: activeComp.id,
      score_p1: s1, score_p2: s2,
      submitted_by: currentUser.uid,
      submitted_by_name: currentUserData?.full_name,
      timestamp: serverTimestamp()
    });
    toast('Score submitted! ✅');
    closeScore();
    loadFixtures();
  } catch(e) { msg.textContent = e.message; btn.disabled=false; btn.innerHTML='<i class="fa-solid fa-paper-plane"></i> Submit Score'; }
};

/* ── STANDINGS ── */
async function loadStandings() {
  const el = document.getElementById('standings-content');
  el.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner"></i>Loading…</div>';
  const c = activeComp;
  const snap = await getDocs(query(collection(db,'matches'), where('comp_id','==',c.id), where('status','==','completed')));
  const matches = []; snap.forEach(d => matches.push({id:d.id,...d.data()}));
  if (!c.participants || !c.participants.length) { el.innerHTML = '<div class="empty-state"><i class="fa-solid fa-ranking-star"></i><p>No data yet.</p></div>'; return; }

  const stats = {};
  const initStat = (uid, name, pid) => { if (!stats[uid]) stats[uid] = {uid, name, pid, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0}; };

  matches.forEach(m => {
    if (!m.p1_uid||!m.p2_uid) return;
    initStat(m.p1_uid, m.p1_name, m.p1_id);
    initStat(m.p2_uid, m.p2_name, m.p2_id);
    const s1=m.score_p1||0, s2=m.score_p2||0;
    stats[m.p1_uid].p++; stats[m.p2_uid].p++;
    stats[m.p1_uid].gf+=s1; stats[m.p1_uid].ga+=s2;
    stats[m.p2_uid].gf+=s2; stats[m.p2_uid].ga+=s1;
    if (s1>s2){ stats[m.p1_uid].w++; stats[m.p2_uid].l++; stats[m.p1_uid].pts+=3; }
    else if (s2>s1){ stats[m.p2_uid].w++; stats[m.p1_uid].l++; stats[m.p2_uid].pts+=3; }
    else { stats[m.p1_uid].d++; stats[m.p2_uid].d++; stats[m.p1_uid].pts+=1; stats[m.p2_uid].pts+=1; }
  });

  const rows = Object.values(stats).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
  const rankCls = (i) => i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'';
  el.innerHTML = `<div style="overflow-x:auto"><table class="stand-table">
    <thead><tr><th>#</th><th>Player</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr></thead>
    <tbody>${rows.map((r,i)=>`<tr>
      <td class="${rankCls(i)}">${i+1}</td>
      <td><div style="display:flex;align-items:center;gap:7px"><div style="font-weight:700">${r.name||'–'}</div><div class="qualified">${i<2?'Qualified':''}</div></div></td>
      <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
      <td>${r.gf}</td><td>${r.ga}</td><td>${r.gf-r.ga>=0?'+':''}${r.gf-r.ga}</td>
      <td style="font-family:var(--fd);font-weight:700;color:var(--c)">${r.pts}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

/* ── BRACKET ── */
async function loadBracket() {
  const el = document.getElementById('bracket-content');
  el.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner"></i>Loading…</div>';
  const c = activeComp;
  const snap = await getDocs(query(collection(db,'matches'), where('comp_id','==',c.id), where('stage','in',['Round of 32','Round of 16','Quarterfinal','Semifinal','Final'])));
  const matches = []; snap.forEach(d => matches.push({id:d.id,...d.data()}));
  if (!matches.length) { el.innerHTML = '<div style="color:var(--mu2);text-align:center;padding:40px;font-size:12px">Bracket not available yet. Generated after Group Stage.</div>'; return; }
  const rounds = ['Round of 32','Round of 16','Quarterfinal','Semifinal','Final'];
  const byRound = {};
  rounds.forEach(r => { byRound[r] = matches.filter(m => m.stage===r); });
  el.innerHTML = rounds.filter(r=>byRound[r].length).map(r => `
    <div class="b-round">
      <div class="b-round-lbl">${r}</div>
      ${byRound[r].map(m=>`<div class="b-match">
        <div class="b-team ${m.winner_uid===m.p1_uid?'win':m.winner_uid?'lose':''}"><span>${m.p1_name||'TBD'}</span><span class="b-score">${m.score_p1>=0?m.score_p1:''}</span></div>
        <div class="b-sep"></div>
        <div class="b-team ${m.winner_uid===m.p2_uid?'win':m.winner_uid?'lose':''}"><span>${m.p2_name||'TBD'}</span><span class="b-score">${m.score_p2>=0?m.score_p2:''}</span></div>
      </div>`).join('')}
    </div>`).join('');
}

/* ── SCHEDULE ── */
function buildSchedule() {
  const c = activeComp;
  document.getElementById('schedule-content').innerHTML = `
    <div class="ov-grid">
      <div class="ov-card"><div class="ov-label">Registration Start</div><div class="ov-val c">${fmtDate(c.reg_start)}</div></div>
      <div class="ov-card"><div class="ov-label">Registration End</div><div class="ov-val c">${fmtDate(c.reg_end)}</div></div>
      <div class="ov-card"><div class="ov-label">Competition Start</div><div class="ov-val c">${fmtDate(c.comp_start)}</div></div>
      <div class="ov-card"><div class="ov-label">Estimated End</div><div class="ov-val">${c.duration_days ? fmtDate(new Date(new Date(c.comp_start).getTime()+c.duration_days*86400000).toISOString()) : '–'}</div></div>
      <div class="ov-card"><div class="ov-label">Time Zone</div><div class="ov-val">${c.timezone||'GMT+6 (Dhaka)'}</div></div>
      <div class="ov-card"><div class="ov-label">Duration</div><div class="ov-val">${c.duration_days||'–'} Days</div></div>
    </div>`;
}

/* ── UTILS ── */
function fmtDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleString('en-BD',{dateStyle:'medium',timeStyle:'short'});
}

let _tt;
window.toast = function(msg, col='var(--c)') {
  const t=document.getElementById('toast'), s=document.getElementById('toastMsg');
  s.textContent=msg; t.style.borderColor=col; t.style.color=col;
  t.classList.add('show'); clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('show'),3200);
};
