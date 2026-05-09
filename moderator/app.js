import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getAuth,
onAuthStateChanged,
signOut

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

getFirestore,
collection,
getDocs,
doc,
getDoc,
updateDoc,
deleteDoc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* FIREBASE */

const firebaseConfig = {

apiKey: "AIzaSyDwPilelp6BgHhHD8Hs_cHx96ZJNZdeYag",

authDomain: "ekickhub-bd.firebaseapp.com",

projectId: "ekickhub-bd",

storageBucket: "ekickhub-bd.firebasestorage.app",

messagingSenderId: "306381500871",

appId: "1:306381500871:web:50e1cc59d823872328e9e2"

};

const app =
initializeApp(firebaseConfig)

const auth =
getAuth(app)

const db =
getFirestore(app)

/* SIDEBAR */

const sidebar =
document.getElementById("sidebar")

document.getElementById("menuBtn")
.onclick = ()=>{

sidebar.classList.add("active")

}

document.getElementById("closeBtn")
.onclick = ()=>{

sidebar.classList.remove("active")

}

/* AUTH CHECK */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href =
"../login/"

return

}

const userRef =
doc(db,"users",user.uid)

const userSnap =
await getDoc(userRef)

if(!userSnap.exists()){

window.location.href =
"../login/"

return

}

const data =
userSnap.data()

/* ONLY MODERATOR */

if(
!Array.isArray(data.roles) ||
!data.roles.includes("moderator")
){

window.location.href =
"../dashboard/"

return

}

/* PROFILE */

document.getElementById("modName")
.innerHTML =
data.full_name || "Moderator"

document.getElementById("modImage")
.src =
data.image ||
"https://i.ibb.co/4pDNDk1/avatar.png"

/* LOAD USERS */

loadPending()

})

/* LOAD PENDING USERS */

async function loadPending(){

const table =
document.getElementById("pendingTable")

table.innerHTML = ""

const snap =
await getDocs(collection(db,"users"))

let pending = 0
let approved = 0

snap.forEach((docItem)=>{

const data =
docItem.data()

if(data.approved === true){

approved++

}else{

pending++

const tr =
document.createElement("tr")

tr.innerHTML = `

<td>

<div class="userFlex">

<img src="${data.image}">

<div>

<div class="playerName">
${data.full_name}
</div>

<div class="playerEmail">
${data.email}
</div>

</div>

</div>

</td>

<td>${data.player_id || "-"}</td>

<td>${data.country || "-"}</td>

<td>${data.position || "-"}</td>

<td>${data.konami_id || "-"}</td>

<td>

<div class="actionBtns">

<button class="acceptBtn"
onclick="approveUser('${docItem.id}')">

Approve

</button>

<button class="rejectBtn"
onclick="rejectUser('${docItem.id}')">

Reject

</button>

</div>

</td>

`

table.appendChild(tr)

}

})

document.getElementById("pendingCount")
.innerHTML = pending

document.getElementById("approvedCount")
.innerHTML = approved

}

/* APPROVE */

window.approveUser = async(uid)=>{

await updateDoc(

doc(db,"users",uid),

{
approved:true
}

)

loadPending()

}

/* REJECT */

window.rejectUser = async(uid)=>{

const confirmDelete =
confirm("Reject this player?")

if(!confirmDelete) return

await deleteDoc(
doc(db,"users",uid)
)

loadPending()

}

/* LOGOUT */

document.getElementById("logoutBtn")
.onclick = async ()=>{

await signOut(auth)

window.location.href =
"../login/"

}