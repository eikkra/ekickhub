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

/* AUTH */

let currentAdmin = null

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

if(
!Array.isArray(data.roles) ||
!data.roles.includes("admin")
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

loadUsers()

})

/* LOAD USERS */

async function loadUsers(){

const table =
document.getElementById("userTable")

table.innerHTML = ""

const snap =
await getDocs(collection(db,"users"))

let total = 0
let pending = 0
let admins = 0
let mods = 0

snap.forEach((docItem)=>{

const data =
docItem.data()

total++

if(data.approved !== true){

pending++

}

if(data.roles?.includes("admin")){

admins++

}

if(data.roles?.includes("moderator")){

mods++

}

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

<td>

<div class="roleWrap">

${renderRoles(
data.roles || [],
docItem.id
)}

</div>

</td>

<td>

${data.approved === true
? "Approved"
: "Pending"}

</td>

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

<button class="addRole"
onclick="addRolePrompt('${docItem.id}')">

Add Role

</button>

</div>

</td>

`

table.appendChild(tr)

})

document.getElementById("totalUsers")
.innerHTML = total

document.getElementById("pendingUsers")
.innerHTML = pending

document.getElementById("admins")
.innerHTML = admins

document.getElementById("mods")
.innerHTML = mods

}

/* RENDER ROLE */

function renderRoles(roles,uid){

return roles.map(role=>{

let className = "playerRole"

if(role === "admin"){

className = "adminRoleChip"

}

if(role === "moderator"){

className = "modRole"

}

if(role === "manager"){

className = "managerRole"

}

if(role === "referee"){

className = "refRole"

}

const removeBtn = role === "player"
? ""
: `<i class="fa-solid fa-xmark"
onclick="removeRole('${uid}','${role}')"></i>`

return `

<div class="roleChip ${className}">

${role}

${removeBtn}

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

loadUsers()

}

/* REJECT */

window.rejectUser = async(uid)=>{

const confirmDelete =
confirm("Delete this user?")

if(!confirmDelete) return

await deleteDoc(
doc(db,"users",uid)
)

loadUsers()

}

/* ADD ROLE */

window.addRolePrompt = async(uid)=>{

const role =
prompt(
"Enter role:\nmoderator\nmanager\nreferee\nadmin"
)

if(!role) return

const userRef =
doc(db,"users",uid)

const userSnap =
await getDoc(userRef)

const data =
userSnap.data()

let roles =
data.roles || []

if(!roles.includes(role)){

roles.push(role)

}

await updateDoc(userRef,{
roles
})

loadUsers()

}

/* REMOVE ROLE */

window.removeRole = async(uid,role)=>{

if(role === "player"){

alert("Player role can't remove")
return

}

/* SELF ADMIN REMOVE BLOCK */

if(
uid === currentAdmin &&
role === "admin"
){

alert("You can't remove your own admin role")
return

}

const userRef =
doc(db,"users",uid)

const userSnap =
await getDoc(userRef)

const data =
userSnap.data()

let roles =
data.roles || []

roles =
roles.filter(r=>r !== role)

await updateDoc(userRef,{
roles
})

loadUsers()

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