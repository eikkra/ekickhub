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

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

const db = getFirestore(app)

/* SIDEBAR */

const menuBtn =
document.getElementById("menuBtn")

const sidebar =
document.getElementById("sidebar")

menuBtn.onclick = ()=>{

sidebar.classList.toggle("active")

}

/* LOAD PLAYER */

onAuthStateChanged(auth, async(user)=>{

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

if(!docSnap.exists()){

alert("Profile not found")

return

}

const data =
docSnap.data()

/* BASIC */

document.getElementById("playerImage")
.src =
data.image

document.getElementById("playerName")
.innerHTML =
data.full_name || "Player"

document.getElementById("playerID")
.innerHTML =
data.player_id || "-"

document.getElementById("konami")
.innerHTML =
data.konami_id || "-"

document.getElementById("device")
.innerHTML =
data.device_name || "-"

document.getElementById("role")
.innerHTML =
data.roles?.join(", ") || "player"

/* META */

document.getElementById("playerCountry")
.innerHTML =
`🌍 ${data.country || "Unknown"}`

document.getElementById("playerPosition")
.innerHTML =
`⚽ ${data.position || "-"}`

/* AGE */

if(data.dob){

const birthYear =
new Date(data.dob).getFullYear()

const currentYear =
new Date().getFullYear()

const age =
currentYear - birthYear

document.getElementById("playerAge")
.innerHTML =
`🎂 ${age}Y`

}

/* PLAN */

document.getElementById("playerPlan")
.innerHTML =
`💎 ${(data.plan || "FREE").toUpperCase()}`

/* FB */

document.getElementById("fbLink")
.href =
data.fb_id_url || "#"

/* RATING */

document.getElementById("rating")
.innerHTML =
data.rating || 56

}catch(error){

console.log(error)

alert(error.message)

}

})