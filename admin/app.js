import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
signOut,
deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
collection,
getDocs,
doc,
getDoc,
updateDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE */
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

let currentAdmin = null;

/* AUTH CHECK */
onAuthStateChanged(auth, async (user) => {

if (!user) {
window.location.href = "../login/";
return;
}

const snap = await getDoc(doc(db, "users", user.uid));

if (!snap.exists()) return;

const data = snap.data();

if (!data.roles.includes("admin")) {
window.location.href = "../dashboard/";
return;
}

currentAdmin = user.uid;

loadUsers();

});

/* LOAD USERS */
async function loadUsers() {

const table = document.getElementById("userTable");
table.innerHTML = "";

const snap = await getDocs(collection(db, "users"));

let total = 0;
let pending = 0;
let banned = 0;

snap.forEach((d) => {

const data = d.data();
total++;

if (!data.approved) pending++;
if (data.banned) banned++;

const tr = document.createElement("tr");

tr.innerHTML = `

<td>${data.full_name || "-"}</td>

<td>${data.player_id || "-"}</td>

<td>

<input value="${data.email || ""}"
onchange="editEmail('${d.id}', this.value)"
style="padding:5px;background:#111;color:white;border:none;width:100%">

</td>

<td>

<div style="display:flex;gap:5px;flex-wrap:wrap">

${(data.roles || []).map(r => `
<span style="padding:4px 8px;background:#222;border-radius:10px;font-size:10px">
${r}
</span>
`).join("")}

<button onclick="addRole('${d.id}')"
style="background:#7c3aed;color:white;border:none;padding:5px;border-radius:8px">
+
</button>

</div>

</td>

<td>

${data.banned
? "<span style='color:red'>BANNED</span>"
: data.approved
? "<span style='color:#00ff99'>ACTIVE</span>"
: "<span style='color:orange'>PENDING</span>"}

</td>

<td>

<button onclick="approve('${d.id}')">Approve</button>
<button onclick="reject('${d.id}')">Reject</button>
<button onclick="ban('${d.id}', ${data.banned})">
${data.banned ? "Unban" : "Ban"}
</button>

<button onclick="del('${d.id}')"
style="background:red;color:white">
Delete
</button>

</td>

`;

table.appendChild(tr);

});

document.getElementById("totalUsers").innerText = total;
document.getElementById("pendingPlayers").innerText = pending;
document.getElementById("banned").innerText = banned;

}

/* APPROVE PLAYER */
window.approve = async (id) => {
await updateDoc(doc(db, "users", id), {
approved: true
});
loadUsers();
};

/* REJECT */
window.reject = async (id) => {
await deleteDoc(doc(db, "users", id));
loadUsers();
};

/* BAN SYSTEM */
window.ban = async (id, state) => {
await updateDoc(doc(db, "users", id), {
banned: !state
});
loadUsers();
};

/* EMAIL EDIT (ADMIN ONLY) */
window.editEmail = async (id, email) => {
await updateDoc(doc(db, "users", id), {
email
});
};

/* ROLE ADD (ADMIN ONLY) */
window.addRole = async (id) => {

const role = prompt("moderator / manager / referee / admin");
if (!role) return;

const ref = doc(db, "users", id);
const snap = await getDoc(ref);

let roles = snap.data().roles || [];

if (!roles.includes(role)) roles.push(role);

await updateDoc(ref, { roles });

loadUsers();

};

/* DELETE FULL USER */
window.del = async (id) => {

if (!confirm("Delete user completely?")) return;

await deleteDoc(doc(db, "users", id));

loadUsers();

};

/* SEARCH */
document.getElementById("searchInput").oninput = (e) => {

const v = e.target.value.toLowerCase();

document.querySelectorAll("#userTable tr").forEach(row => {
row.style.display = row.innerText.toLowerCase().includes(v) ? "" : "none";
});

};

/* LOGOUT */
document.getElementById("logoutBtn").onclick = async () => {
await signOut(auth);
window.location.href = "../login/";
};