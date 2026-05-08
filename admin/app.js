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

doc,

getDoc,

getDocs,

collection,

updateDoc

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



/* CHECK ADMIN */

onAuthStateChanged(auth, async(user)=>{

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



const userData =
userSnap.data()



if(

!Array.isArray(userData.roles) ||

!userData.roles.includes("admin")

){

window.location.href =
"../dashboard/"

return

}



loadUsers()

})



/* LOAD USERS */

async function loadUsers(){

const usersContainer =
document.getElementById("usersContainer")

usersContainer.innerHTML =
"Loading..."


const snapshot =
await getDocs(
collection(db,"users")
)



let total = 0
let pending = 0
let approved = 0

usersContainer.innerHTML = ""


snapshot.forEach((docItem)=>{

const data =
docItem.data()

const uid =
docItem.id

total++


if(data.approved){

approved++

}else{

pending++

}



/* ONLY SHOW PENDING */

if(data.approved === true){
return
}



const div =
document.createElement("div")

div.className =
"user"



div.innerHTML =

`

<img src="${data.image}">

<div class="info">

<h3>
${data.full_name}
</h3>

<p>
${data.player_id}
</p>

<p>
${data.country} | ${data.district}
</p>

<p>
${data.position}
</p>

<p>
${data.email}
</p>

</div>

<div class="actions">

<button
class="approve"
onclick="approveUser('${uid}')">

Approve

</button>

<button
class="adminBtn"
onclick="makeAdmin('${uid}')">

Make Admin

</button>

<button
class="reject"
onclick="rejectUser('${uid}')">

Reject

</button>

</div>

`


usersContainer.appendChild(div)

})



document.getElementById("totalUsers")
.innerHTML = total

document.getElementById("pendingUsers")
.innerHTML = pending

document.getElementById("approvedUsers")
.innerHTML = approved

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



/* MAKE ADMIN */

window.makeAdmin = async(uid)=>{

await updateDoc(

doc(db,"users",uid),

{

approved:true,

roles:["player","admin"]

}

)

loadUsers()

}



/* REJECT */

window.rejectUser = async(uid)=>{

await updateDoc(

doc(db,"users",uid),

{

approved:false

}

)

alert("User kept pending")

}



/* LOGOUT */

document.getElementById("logoutBtn")
.onclick = async()=>{

await signOut(auth)

window.location.href =
"../login/"

}