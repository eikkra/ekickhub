import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getFirestore,
collection,
getDocs,
query,
orderBy,
addDoc

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

const db =
getFirestore(app)

/* ELEMENTS */

const competitionGrid =
document.getElementById("competitionGrid")

const searchInput =
document.getElementById("searchInput")

let allCompetitions = []

let currentTab = "registration"

/* LOAD COMPETITIONS */

async function loadCompetitions(){

competitionGrid.innerHTML = `

<div style="
padding:40px;
grid-column:1/-1;
text-align:center;
font-size:14px;
">

Loading competitions...

</div>

`

try{

const q =
query(
collection(db,"competitions"),
orderBy("created_at","desc")
)

const snapshot =
await getDocs(q)

allCompetitions = []

snapshot.forEach(doc=>{

allCompetitions.push({

id:doc.id,
...doc.data()

})

})

renderCompetitions()

}catch(error){

console.log(error)

competitionGrid.innerHTML = `

<div style="
padding:40px;
grid-column:1/-1;
text-align:center;
font-size:14px;
color:red;
">

Failed to load competitions

</div>

`

}

}

/* RENDER */

function renderCompetitions(){

competitionGrid.innerHTML = ""

const search =
searchInput.value.toLowerCase()

const filtered =
allCompetitions.filter(comp=>{

const matchTab =
comp.status === currentTab

const matchSearch =

comp.title
.toLowerCase()
.includes(search)

return matchTab && matchSearch

})

if(filtered.length === 0){

competitionGrid.innerHTML = `

<div style="
padding:40px;
grid-column:1/-1;
text-align:center;
font-size:14px;
">

No competition found

</div>

`

return

}

filtered.forEach(comp=>{

competitionGrid.innerHTML += `

<div class="competitionCard">

<img
class="compImage"
src="${comp.image}">

<div class="compBody">

<div class="compTitle">
${comp.title}
</div>

<div class="compType">
${comp.format}
</div>

<div class="compInfo">

<div>
👥 ${comp.slots}
</div>

<div>
🏆 ${comp.prize}
</div>

</div>

<div class="countdown"
id="count-${comp.id}">

Loading...

</div>

<button class="joinBtn">

JOIN NOW

</button>

</div>

</div>

`

})

startCountdowns(filtered)

}

/* COUNTDOWN */

function startCountdowns(data){

data.forEach(comp=>{

const el =
document.getElementById(
`count-${comp.id}`
)

if(!el) return

function update(){

const target =
new Date(comp.registration_date)
.getTime()

const now =
new Date().getTime()

const diff =
target - now

if(diff <= 0){

el.innerHTML =
"Registration Open"

return

}

const days =
Math.floor(diff/(1000*60*60*24))

const hours =
Math.floor((diff%(1000*60*60*24))/(1000*60*60))

const mins =
Math.floor((diff%(1000*60*60))/(1000*60))

const secs =
Math.floor((diff%(1000*60))/1000)

el.innerHTML =

`${days}D ${hours}H ${mins}M ${secs}S`

}

update()

setInterval(update,1000)

})

}

/* TABS */

document.querySelectorAll(".tabBtn")
.forEach(btn=>{

btn.onclick = ()=>{

document.querySelectorAll(".tabBtn")
.forEach(b=>{

b.classList.remove("active")

})

btn.classList.add("active")

currentTab =
btn.dataset.tab

renderCompetitions()

}

})

/* SEARCH */

searchInput
.addEventListener("input",()=>{

renderCompetitions()

})

/* START */

loadCompetitions()

/* MODAL */

const createModal =
document.getElementById("createModal")

document.getElementById("openCreateModal")
.onclick = ()=>{

createModal.classList.add("active")

}

document.getElementById("closeCreateModal")
.onclick = ()=>{

createModal.classList.remove("active")

}

/* CREATE COMPETITION */

document.getElementById("publishCompetition")
.onclick = async()=>{

const title =
document.getElementById("comp_title")
.value.trim()

const image =
document.getElementById("comp_image")
.value.trim()

const format =
document.getElementById("comp_format")
.value

const slots =
document.getElementById("comp_slots")
.value

const prize =
document.getElementById("comp_prize")
.value.trim()

const status =
document.getElementById("comp_status")
.value

const registration_date =
document.getElementById("comp_date")
.value

if(

!title ||
!image ||
!format ||
!slots ||
!prize ||
!registration_date

){

alert("Please fill all fields")

return

}

try{

await addDoc(
collection(db,"competitions"),
{

title,
image,
format,
slots,
prize,
status,
registration_date,

created_at:
new Date().toISOString()

})

alert("Competition Published")

createModal.classList.remove("active")

loadCompetitions()

}catch(error){

console.log(error)

alert(error.message)

}

}