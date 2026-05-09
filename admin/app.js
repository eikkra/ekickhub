/* FIREBASE */

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
updateDoc
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

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

const db = getFirestore(app)

const approvalList =
document.getElementById("approvalList")

const userList =
document.getElementById("userList")

const msg =
document.getElementById("msg")

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

/* AUTH */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href =
"../login/"

return

}

loadUsers()

})

/* LOAD USERS */

async function loadUsers(){

approvalList.innerHTML = ""
userList.innerHTML = ""

const snapshot =
await getDocs(collection(db,"users"))

let total = 0
let pending = 0
let approved = 0
let admins = 0

snapshot.forEach(async(docSnap)=>{

const data = docSnap.data()

total++

if(data.approved === true){

approved++

}else{

pending++

}

if(
Array.isArray(data.roles) &&
data.roles.includes("admin")
){

admins++

}

/* APPROVAL LIST */

if(data.approved !== true){

approvalList.innerHTML += `

<div class="userCard">

<div class="userTop">

<img class="userImage"
src="${data.image}">

<div class="userInfo">

<div class="userName">
${data.full_name}
</div>

<div class="userId">
${data.player_id}
</div>

</div>

</div>

<div class="actionRow">

<button class="btn approve"
onclick="approveUser('${docSnap.id}')">

APPROVE

</button>

<button class="btn reject"
onclick="rejectUser('${docSnap.id}')">

REJECT

</button>

</div>

</div>

`

}

/* ALL USERS */

userList.innerHTML += `

<div class="userCard">

<div class="userTop">

<img class="userImage"
src="${data.image}">

<div class="userInfo">

<div class="userName">
${data.full_name}
</div>

<div class="userId">
${data.player_id}
</div>

<div class="userRole">

${(data.roles || [])
.map(role=>`
<div class="roleTag">
${role}
</div>
`).join("")}

</div>

</div>

</div>

<select class="roleSelect"
id="role-${docSnap.id}">

<option value="player">
Player
</option>

<option value="moderator">
Moderator
</option>

<option value="referee">
Referee
</option>

<option value="club_manager">
Club Manager
</option>

<option value="admin">
Admin
</option>

</select>

<div class="actionRow">

<button class="btn edit"
onclick="setRole('${docSnap.id}')">

UPDATE ROLE

</button>

</div>

</div>

`

})

document.getElementById("totalUsers")
.innerHTML = total

document.getElementById("pendingUsers")
.innerHTML = pending

document.getElementById("approvedUsers")
.innerHTML = approved

document.getElementById("admins")
.innerHTML = admins

}

/* APPROVE */

window.approveUser = async(id)=>{

await updateDoc(
doc(db,"users",id),
{
approved:true
}
)

msg.innerHTML =
"Player approved"

loadUsers()

}

/* REJECT */

window.rejectUser = async(id)=>{

await updateDoc(
doc(db,"users",id),
{
approved:false
}
)

msg.innerHTML =
"Player rejected"

loadUsers()

}

/* ROLE UPDATE */

window.setRole = async(id)=>{

const value =
document.getElementById(`role-${id}`).value

await updateDoc(
doc(db,"users",id),
{
roles:["player",value]
}
)

msg.innerHTML =
"Role updated"

loadUsers()

}

/* SWITCH TO PLAYER */

document.getElementById("switchPlayer")
.onclick = ()=>{

window.location.href =
"../dashboard/"

}

/* LOGOUT */

async function logoutNow(){

await signOut(auth)

window.location.href =
"../login/"

}

document.getElementById("logoutBtn")
.onclick = logoutNow

document.getElementById("logoutBtn2")
.onclick = logoutNow