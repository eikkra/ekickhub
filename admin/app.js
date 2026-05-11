import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyDwPilelp6BgHhHD8Hs_cHx96ZJNZdeYag",
  authDomain: "ekickhub-bd.firebaseapp.com",
  projectId: "ekickhub-bd",
  storageBucket: "ekickhub-bd.firebasestorage.app",
  messagingSenderId: "306381500871",
  appId: "1:306381500871:web:50e1cc59d823872328e9e2"

}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

const menuItems =
document.querySelectorAll(".menuItem")

const pageTitle =
document.getElementById("pageTitle")

menuItems.forEach(item=>{

item.onclick = ()=>{

menuItems.forEach(i=>{

i.classList.remove("active")

})

item.classList.add("active")

pageTitle.innerHTML =
item.innerText

}

})

async function loadStats(){

const usersSnap =
await getDocs(collection(db,"users"))

const competitionSnap =
await getDocs(collection(db,"competitions"))

const clubsSnap =
await getDocs(collection(db,"clubs"))

let running = 0

competitionSnap.forEach(doc=>{

if(doc.data().status === "running"){

running++

}

})



document.getElementById("totalPlayers")
.innerHTML = usersSnap.size


document.getElementById("totalCompetitions")
.innerHTML = competitionSnap.size


document.getElementById("totalClubs")
.innerHTML = clubsSnap.size


document.getElementById("runningEvents")
.innerHTML = running

}

loadStats()