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

/* USER */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href =
"../login/"

return

}

const docRef =
doc(db,"users",user.uid)

const docSnap =
await getDoc(docRef)

if(!docSnap.exists()){

alert("Profile not found")

return

}

const data =
docSnap.data()

/* PROFILE */

document.getElementById("profileImage")
.src = data.image

document.getElementById("playerName")
.innerHTML = data.full_name

document.getElementById("playerId")
.innerHTML = data.player_id

document.getElementById("konamiId")
.innerHTML = data.konami_id

document.getElementById("deviceName")
.innerHTML = data.device_name

/* FB */

document.getElementById("fbBtn")
.onclick = ()=>{

window.open(
data.fb_id_url,
"_blank"
)

}

/* RATING */

document.getElementById("rating")
.innerHTML =
data.rating || 56

/* STATS */

document.getElementById("matchPlayed")
.innerHTML =
data.match_played || 0

document.getElementById("wins")
.innerHTML =
data.wins || 0

document.getElementById("draws")
.innerHTML =
data.draws || 0

document.getElementById("losses")
.innerHTML =
data.losses || 0

document.getElementById("motm")
.innerHTML =
data.motm || 0

document.getElementById("hattrick")
.innerHTML =
data.hattrick || 0

document.getElementById("goals7")
.innerHTML =
data.goals7 || 0

/* WIN RATE */

const played =
data.match_played || 0

const wins =
data.wins || 0

let rate = 0

if(played > 0){

rate =
Math.round((wins / played) * 100)

}

document.getElementById("winrate")
.innerHTML =
rate + "%"

/* ROLE SWITCH */

const roleList =
document.getElementById("roleList")

if(Array.isArray(data.roles)){

data.roles.forEach((role)=>{

const div =
document.createElement("div")

div.className =
"sideItem"

div.innerHTML = `
<i class="fa-solid fa-shield"></i>
Switch to ${role}
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

roleList.appendChild(div)

})

}

})