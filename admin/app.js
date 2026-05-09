// admin/app.js

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getAuth,
onAuthStateChanged,
signOut,
deleteUser,
updateEmail

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

let currentAdmin = null

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

const ref =
doc(db,"users",user.uid)

const snap =
await getDoc(ref)

if(!snap.exists()){

window.location.href =
"../login/"
return

}

const data =
snap.data()

if(
!data.roles?.includes("admin")
){

window.location.href =
"../dashboard/"
return

}

currentAdmin = user.uid

document.getElementById("adminName")
.innerHTML =
data.full_name

document.getElementById("adminImage")
.src =
data.image

loadDashboard()

})

/* LOAD */

async function loadDashboard(){

const approvalTable =
document.getElementById("approvalTable")

const userTable =
document.getElementById("userTable")

approvalTable.innerHTML = ""
userTable.innerHTML = ""

const snap =
await getDocs(collection(db,"users"))

let total = 0
let pending = 0
let admins = 0
let banned = 0

snap.forEach((docItem)=>{

const data =
docItem.data()

total++

if(data.roles?.includes("admin")){

admins++

}

if(data.banned === true){

banned++

}

if(data.approved !== true){

pending++

approvalTable.innerHTML += `

<tr>

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

<td>

<div class="actionBtns">

<button class="approveBtn"
onclick="approveUser('${docItem.id}')">

Approve

</button>

<button class="rejectBtn"
onclick="rejectUser('${docItem.id}')">

Reject

</button>

</div>

</td>

</tr>

`

}

userTable.innerHTML += `

<tr>

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

<td>${data.player_id}</td>

<td>

<div class="roleWrap">

${renderRoles(
data.roles || [],
docItem.id
)}

</div>

</td>

<td>

${data.banned === true
? '<span class="banned">BANNED</span>'
: data.approved === true
? '<span class="approved">APPROVED</span>'
: '<span class="pending">PENDING</span>'
}

</td>

<td>

<div class="actionBtns">

<button class="roleBtn"
onclick="addRole('${docItem.id}')">

Role

</button>

<button class="editBtn"
onclick="editEmail('${docItem.id}')">

Email

</button>

${
data.banned === true
?

`<button class="unbanBtn"
onclick="toggleBan('${docItem.id}',false)">

Unban

</button>`

:

`<button class="banBtn"
onclick="toggleBan('${docItem.id}',true)">

Ban

</button>`
}

<button class="deleteBtn"
onclick="deleteProfile('${docItem.id}')">

Delete

</button>

</div>

</td>

</tr>

`

})

document.getElementById("totalUsers")
.innerHTML = total

document.getElementById("pendingUsers")
.innerHTML = pending

document.getElementById("admins")
.innerHTML = admins

document.getElementById("bannedUsers")
.innerHTML = banned

}

/* ROLE RENDER */

function renderRoles(roles,uid){

return roles.map(role=>{

let cls = "playerRole"

if(role === "admin") cls = "adminRole"
if(role === "moderator") cls = "modRole"
if(role === "manager") cls = "managerRole"
if(role === "referee") cls = "refRole"

const remove =
role === "player"
? ""
: `<i class="fa-solid fa-xmark"
onclick="removeRole('${uid}','${role}')"></i>`

return `

<div class="roleChip ${cls}">

${role}

${remove}

</div>

`

}).join("")

}

/* APPROVE */

window.approveUser = async(uid)=>{

await updateDoc(
doc(db,"users",uid),
{
approved:true
}
)

loadDashboard()

}

/* REJECT */

window.rejectUser = async(uid)=>{

const ok =
confirm("Reject player?")

if(!ok) return

await deleteDoc(
doc(db,"users",uid)
)

loadDashboard()

}

/* ROLE */

window.addRole = async(uid)=>{

const role =
prompt(
"admin / moderator / manager / referee"
)

if(!role) return

const ref =
doc(db,"users",uid)

const snap =
await getDoc(ref)

let roles =
snap.data().roles || []

if(!roles.includes(role)){

roles.push(role)

}

await updateDoc(ref,{roles})

loadDashboard()

}

window.removeRole = async(uid,role)=>{

if(role === "player"){

alert("Player role can't remove")
return

}

if(
uid === currentAdmin &&
role === "admin"
){

alert("Can't remove your own admin role")
return

}

const ref =
doc(db,"users",uid)

const snap =
await getDoc(ref)

let roles =
snap.data().roles || []

roles =
roles.filter(r=>r !== role)

await updateDoc(ref,{roles})

loadDashboard()

}

/* EMAIL EDIT */

window.editEmail = async(uid)=>{

const newEmail =
prompt("Enter new Gmail")

if(!newEmail) return

await updateDoc(

doc(db,"users",uid),

{
email:newEmail
}

)

alert(
"Firestore email updated.\nUser can now login using this email if Auth updated too."
)

loadDashboard()

}

/* BAN */

window.toggleBan = async(uid,status)=>{

await updateDoc(

doc(db,"users",uid),

{
banned:status
}

)

loadDashboard()

}

/* DELETE */

window.deleteProfile = async(uid)=>{

const ok =
confirm(
"Delete full player profile?"
)

if(!ok) return

await deleteDoc(
doc(db,"users",uid)
)

alert(
"Firestore profile deleted.\nAuth delete requires Firebase Admin SDK backend later."
)

loadDashboard()

}

/* SEARCH */

document.getElementById("searchInput")
.oninput = ()=>{

const value =
document.getElementById("searchInput")
.value.toLowerCase()

const rows =
document.querySelectorAll("#userTable tr")

rows.forEach(row=>{

row.style.display =
row.innerText.toLowerCase()
.includes(value)
? ""
: "none"

})

}

/* LOGOUT */

document.getElementById("logoutBtn")
.onclick = async ()=>{

await signOut(auth)

window.location.href =
"../login/"

}