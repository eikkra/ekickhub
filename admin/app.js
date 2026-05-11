import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
getDocs,
addDoc
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

const competitionModal =
document.getElementById("competitionModal")

document.getElementById("openCompetitionModal")
.onclick = ()=>{

competitionModal.classList.add("active")

}

document.getElementById("closeModal")
.onclick = ()=>{

competitionModal.classList.remove("active")

}

document.getElementById("publishCompetition")
.onclick = async()=>{

const title =
document.getElementById("compTitle").value

const image =
document.getElementById("compImage").value

const type =
document.getElementById("compType").value

const slots =
document.getElementById("compSlots").value

const regStart =
document.getElementById("regStart").value

const matchStart =
document.getElementById("matchStart").value

const status =
document.getElementById("compStatus").value

if(
!title ||
!image ||
!slots ||
!regStart ||
!matchStart
){
alert("Fill all fields")
return
}

await addDoc(
collection(db,"competitions"),
{

title,
image,
type,
slots:Number(slots),
regStart,
matchStart,
status,

created_at:
new Date().toISOString()

}
)

alert("Competition Published")

competitionModal.classList.remove("active")

location.reload()

}