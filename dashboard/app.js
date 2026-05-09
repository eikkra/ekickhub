import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
getDoc
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
.addEventListener("click",()=>{

sidebar.classList.add("active")

})

document.getElementById("closeBtn")
.addEventListener("click",()=>{

sidebar.classList.remove("active")

})

/* CLOSE OUTSIDE CLICK */

window.addEventListener("click",(e)=>{

if(
!sidebar.contains(e.target) &&
!document.getElementById("menuBtn").contains(e.target)
){
sidebar.classList.remove("active")
}

})

/* PROFILE */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href =
"../login/"

return

}

try{

const docRef =
doc(db,"users",user.uid)

const docSnap =
await getDoc(docRef)

if(!docSnap.exists()) return

const data =
docSnap.data()

/* DATA */

document.getElementById("playerImage")
.src = data.image || ""

document.getElementById("playerName")
.innerHTML = data.full_name || "Unknown"

document.getElementById("playerId")
.innerHTML = data.player_id || "-"

document.getElementById("konamiId")
.innerHTML = data.konami_id || "-"

document.getElementById("deviceName")
.innerHTML = data.device_name || "-"

document.getElementById("playerPlan")
.innerHTML = (data.plan || "free").toUpperCase()

document.getElementById("playerCountry")
.innerHTML = data.country || "Unknown"

document.getElementById("playerPosition")
.innerHTML = data.position || "-"

document.getElementById("fbLink")
.href = data.fb_id_url || "#"

/* AGE */

if(data.dob){

const birth =
new Date(data.dob)

const today =
new Date()

let age =
today.getFullYear() -
birth.getFullYear()

const m =
today.getMonth() -
birth.getMonth()

if(
m < 0 ||
(m === 0 && today.getDate() < birth.getDate())
){
age--
}

document.getElementById("playerAge")
.innerHTML =
`${age} YEARS`

}

/* RATING */

let rating = 78

document.getElementById("playerRating")
.innerHTML = rating

/* ROLE SWITCH */

const roleContainer =
document.getElementById("roleContainer")

roleContainer.innerHTML = ""

if(Array.isArray(data.roles)){

data.roles.forEach((role)=>{

const div =
document.createElement("div")

div.className =
"sideItem"

div.innerHTML = `

<i class="fa-solid fa-right-left"></i>

SWITCH TO ${role.toUpperCase()}

`

div.onclick = ()=>{

if(role === "admin"){

window.location.href =
"../admin/"

}else{

window.location.href =
"../dashboard/"

}

}

roleContainer.appendChild(div)

})

}

}catch(error){

console.log(error)

}

})