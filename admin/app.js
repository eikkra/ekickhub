// admin/app.js

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

if(!data.roles?.includes("admin")){

window.location.href =
"../dashboard/"
return

}

document.getElementById("adminName")
.innerHTML =
data.full_name

document.getElementById("adminImage")
.src =
data.image

/* ROLE SWITCH */

const roleButtons =
document.getElementById("roleButtons")

roleButtons.innerHTML = ""

const roles =
data.roles || []

roles.forEach(role=>{

let page = "../dashboard/"

if(role === "admin"){
page = "../admin/"
}

if(role === "moderator"){
page = "../moderator/"
}

if(role === "manager"){
page = "../manager/"
}

if(role === "referee"){
page = "../referee/"
}

roleButtons.innerHTML += `

<button onclick="window.location.href='${page}'">

${role.toUpperCase()}

</button>

`

})

loadDashboard()

})

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
${data.full_name}
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
${data.full_name}
</div>

</div>

</td>

<td>${data.player_id || "-"}</td>

<td>

<div class="roleWrap">

${(data.roles || []).map(role=>`

<div class="roleChip">

${role}

</div>

`).join("")}

</div>

</td>

<td>

<div class="actionBtns">

<button class="roleBtn"
onclick="addRole('${docItem.id}')">

Role

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

window.approveUser = async(uid)=>{

await updateDoc(
doc(db,"users",uid),
{
approved:true
}
)

loadDashboard()

}

window.rejectUser = async(uid)=>{

await deleteDoc(
doc(db,"users",uid)
)

loadDashboard()

}

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

document.getElementById("logoutBtn")
.onclick = async ()=>{

await signOut(auth)

window.location.href =
"../login/"

}