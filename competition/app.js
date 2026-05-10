const competitionGrid =
document.getElementById("competitionGrid")

const sampleCompetitions = [

{
title:"eKick Ramadan Cup",
type:"32 PLAYER GROUP STAGE",
status:"registration",
image:"https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
players:"32",
prize:"10,000 Coins",
date:"2026-06-01T20:00:00"
},

{
title:"World Elite League",
type:"64 PLAYER LEAGUE",
status:"upcoming",
image:"https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200&auto=format&fit=crop",
players:"64",
prize:"25,000 Coins",
date:"2026-06-15T22:00:00"
},

{
title:"GOAT Championship",
type:"128 PLAYER KNOCKOUT",
status:"running",
image:"https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1200&auto=format&fit=crop",
players:"128",
prize:"50,000 Coins",
date:"2026-07-01T21:00:00"
}

]

function renderCompetitions(type="registration"){

competitionGrid.innerHTML = ""

const filtered =
sampleCompetitions.filter(
item=>item.status === type
)

filtered.forEach(comp=>{

competitionGrid.innerHTML += `

<div class="competitionCard">

<img class="compImage"
src="${comp.image}">

<div class="compBody">

<div class="compTitle">
${comp.title}
</div>

<div class="compType">
${comp.type}
</div>

<div class="compInfo">

<div>
👥 ${comp.players}
</div>

<div>
🏆 ${comp.prize}
</div>

</div>

<div class="countdown"
id="${comp.title.replaceAll(" ","")}">

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

function startCountdowns(data){

data.forEach(comp=>{

const el =
document.getElementById(
comp.title.replaceAll(" ","")
)

if(!el) return

function update(){

const target =
new Date(comp.date).getTime()

const now =
new Date().getTime()

const diff =
target - now

if(diff <= 0){

el.innerHTML =
"Competition Started"

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

renderCompetitions()

document.querySelectorAll(".tabBtn")
.forEach(btn=>{

btn.onclick = ()=>{

document.querySelectorAll(".tabBtn")
.forEach(b=>b.classList.remove("active"))

btn.classList.add("active")

renderCompetitions(
btn.dataset.tab
)

}

})