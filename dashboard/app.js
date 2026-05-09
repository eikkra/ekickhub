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
getDoc,
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

/* SIDEBAR */

const sidebar =
document.getElementById("sidebar")

document.getElementById("menuBtn")
.onclick = ()=>{

sidebar.classList.add("active")

}

document.getElementById("closeSidebar")
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

const snap =
await getDoc(docRef)

if(!snap.exists()) return

const data = snap.data()

document.getElementById("playerImage")
.src = data.image

document.getElementById("playerName")
.innerHTML = data.full_name

document.getElementById("playerId")
.innerHTML = data.player_id

document.getElementById("konamiId")
.innerHTML = data.konami_id

document.getElementById("deviceName")
.innerHTML = data.device_name

document.getElementById("playerCountry")
.innerHTML = data.country

document.getElementById("playerPosition")
.innerHTML = data.position

document.getElementById("fbLink")
.href = data.fb_id_url

if(data.dob){

const birthYear =
new Date(data.dob).getFullYear()

const currentYear =
new Date().getFullYear()

document.getElementById("playerAge")
.innerHTML =
currentYear - birthYear

}

/* EDIT PROFILE */

document.getElementById("editBtn")
.onclick = async ()=>{

const newName =
prompt("Full Name",data.full_name)

if(newName === null) return

const newKonami =
prompt("Konami ID",data.konami_id)

const newDevice =
prompt("Device Name",data.device_name)

const newPhone =
prompt("Phone Number",data.phone)

const newPosition =
prompt("Position",data.position)

const newDob =
prompt("DOB YYYY-MM-DD",data.dob)

const newFb =
prompt("FB URL",data.fb_id_url)

await updateDoc(docRef,{

full_name:newName,
konami_id:newKonami,
device_name:newDevice,
phone:newPhone,
position:newPosition,
dob:newDob,
fb_id_url:newFb

})

alert("Profile Updated")

location.reload()

}

})