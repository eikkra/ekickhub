import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
collection,
getDocs,
doc,
updateDoc,
deleteDoc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyDwPilelp6BgHhHD8Hs_cHx96ZJNZdeYag",
authDomain: "ekickhub-bd.firebaseapp.com",
projectId: "ekickhub-bd",
storageBucket: "ekickhub-bd.firebasestorage.app",
messagingSenderId: "306381500871",
appId: "1:306381500871:web:50e1cc59d823872328e9e2"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* LOAD USERS */

async function load(){

const snap = await getDocs(collection(db,"users"));

const box = document.getElementById("users");
box.innerHTML = "";

snap.forEach(docu=>{

const d = docu.data();

box.innerHTML += `

<tr>

<td>${d.full_name}</td>

<td>

<input value="${d.email}"
onchange="editEmail('${docu.id}',this.value)">

</td>

<td>

<div class="roleBox">

${(d.roles||[]).map(r=>`
<span class="roleTag">
${r}
<i onclick="removeRole('${docu.id}','${r}')"
class="fa fa-xmark"></i>
</span>
`).join("")}

</div>

<button class="btn role"
onclick="addRole('${docu.id}')">+ Role</button>

</td>

<td>

${d.banned ? "🚫 BANNED" : "ACTIVE"}

<button class="btn ban"
onclick="toggleBan('${docu.id}',${d.banned})">

Toggle

</button>

</td>

<td>

<button class="btn delete"
onclick="deleteUser('${docu.id}')">

Delete

</button>

</td>

</tr>

`;

});

}

/* EMAIL EDIT */

window.editEmail = async(id,email)=>{

await updateDoc(doc(db,"users",id),{
email
});

}

/* ROLE ADD */

window.addRole = async(id)=>{

const role = prompt("role (admin/moderator/manager/referee)");

const ref = doc(db,"users",id);
const snap = await getDoc(ref);
const data = snap.data();

let roles = data.roles || [];

if(!roles.includes(role)){
roles.push(role);
}

await updateDoc(ref,{roles});
load();

}

/* ROLE REMOVE */

window.removeRole = async(id,role)=>{

if(role === "player") return;

const ref = doc(db,"users",id);
const snap = await getDoc(ref);
const data = snap.data();

let roles = data.roles.filter(r=>r!==role);

await updateDoc(ref,{roles});
load();

}

/* BAN SYSTEM */

window.toggleBan = async(id,ban)=>{

await updateDoc(doc(db,"users",id),{
banned:!ban
});

load();

}

/* DELETE USER */

window.deleteUser = async(id)=>{

if(!confirm("Delete full user?")) return;

await deleteDoc(doc(db,"users",id));

load();

}

/* LOGOUT */

document.getElementById("logoutBtn")
.onclick = async()=>{

await signOut(auth);
location.href="../login/";

}

load();