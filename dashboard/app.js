import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
signOut,
updateEmail,
EmailAuthProvider,
reauthenticateWithCredential
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
getDoc,
updateDoc,
query,
where,
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getStorage,
ref,
uploadBytes,
getDownloadURL
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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

const storage = getStorage(app)



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



/* MODAL */

document.getElementById("cancelEdit")
.onclick = ()=>{

document.getElementById("editModal")
.classList.remove("active")

}

document.getElementById("editBtn")
.onclick = ()=>{

document.getElementById("editModal")
.classList.add("active")

}



/* LOGOUT */

document.getElementById("logoutBtn")
.onclick = async ()=>{

await signOut(auth)

window.location.href = "../login/"

}



/* GLOBAL */

let currentData = null
let cropper = null



/* AUTH */

onAuthStateChanged(auth, async(user)=>{

if(!user){

const urlParams =
new URLSearchParams(window.location.search)

const uid = urlParams.get("uid")

if(uid){

loadPublicProfile(uid)

}else{

window.location.href = "../login/"

}

return

}

const docSnap =
await getDoc(doc(db,"users",user.uid))

if(!docSnap.exists()) return

const data = docSnap.data()

currentData = data

loadProfile(data)

loadRoles(data.roles || [])

})



/* PUBLIC PROFILE */

async function loadPublicProfile(uid){

const docSnap =
await getDoc(doc(db,"users",uid))

if(!docSnap.exists()) return

loadProfile(docSnap.data())

}



/* LOAD PROFILE */

function loadProfile(data){

document.getElementById("playerImage").src =
data.image

document.getElementById("playerName").innerHTML =
data.full_name

document.getElementById("fbLink").href =
data.fb_id_url

document.getElementById("country").innerHTML =
`<i class="fa-solid fa-earth-asia"></i> ${data.country}`

document.getElementById("position").innerHTML =
`<i class="fa-solid fa-gamepad"></i> ${data.position}`

document.getElementById("age").innerHTML =
`<i class="fa-solid fa-cake-candles"></i> ${calculateAge(data.dob)}`

document.getElementById("player_id").innerHTML =
data.player_id

document.getElementById("konami_id").innerHTML =
data.konami_id

document.getElementById("device_name").innerHTML =
data.device_name

document.getElementById("ratingFill").style.width =
"56%"

document.getElementById("ratingFill").innerHTML =
"56"



/* EDIT DATA */

document.getElementById("edit_name").value =
data.full_name || ""

document.getElementById("edit_email").value =
data.email || ""

document.getElementById("edit_phone").value =
data.phone || ""

document.getElementById("edit_dob").value =
data.dob || ""

document.getElementById("edit_device").value =
data.device_name || ""

document.getElementById("edit_konami").value =
data.konami_id || ""

document.getElementById("edit_fb").value =
data.fb_id_url || ""

document.getElementById("edit_position").value =
data.position || ""

}



/* AGE */

function calculateAge(dob){

if(!dob) return "N/A"

const birth =
new Date(dob)

const diff =
Date.now() - birth.getTime()

const age =
new Date(diff)

return Math.abs(age.getUTCFullYear()-1970)+"Y"

}



/* ROLES */

function loadRoles(roles){

const roleList =
document.getElementById("roleList")

roleList.innerHTML = ""

roles.forEach(role=>{

const div =
document.createElement("div")

div.className = "sideItem"

div.innerHTML =
`<i class="fa-solid fa-repeat"></i> ${role.toUpperCase()}`

div.onclick = ()=>{

if(role === "admin"){

window.location.href = "../admin/"

}else{

window.location.href = "../player/"

}

}

roleList.appendChild(div)

})

}



/* IMAGE */

document.getElementById("edit_image")
.onchange = (e)=>{

const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = ()=>{

document.getElementById("cropContainer")
.style.display = "block"

const image =
document.getElementById("preview")

image.src = reader.result

if(cropper){

cropper.destroy()

}

cropper = new Cropper(image,{

aspectRatio:1,
viewMode:1,
responsive:true

})

}

reader.readAsDataURL(file)

}



/* SAVE EDIT */

document.getElementById("saveEdit")
.onclick = async()=>{

const user = auth.currentUser

if(!user) return

try{

let imageUrl = currentData.image

const newEmail =
document.getElementById("edit_email").value
.trim()
.toLowerCase()

const currentPassword =
document.getElementById("current_password").value
.trim()

/* EMAIL CHANGE */

if(
newEmail &&
newEmail !== user.email
){

if(!currentPassword){

alert(
"Enter current password to change email"
)

return

}

const credential =
EmailAuthProvider.credential(
user.email,
currentPassword
)

await reauthenticateWithCredential(
user,
credential
)

await updateEmail(
user,
newEmail
)

}

/* EMAIL CHECK */

if(newEmail !== currentData.email){

const emailQuery =
query(
collection(db,"users"),
where("email","==",newEmail)
)

const emailSnap =
await getDocs(emailQuery)

if(!emailSnap.empty){

alert("Email already used")

return

}

await verifyBeforeUpdateEmail(user,newEmail)

alert(
"Verification email sent to your new email address. Please verify first."
)

return

}



/* KONAMI CHECK */

if(konami !== currentData.konami_id){

const konamiQuery =
query(
collection(db,"users"),
where("konami_id","==",konami)
)

const konamiSnap =
await getDocs(konamiQuery)

if(!konamiSnap.empty){

alert("Konami ID already used")

return

}

}



/* FB CHECK */

if(fb !== currentData.fb_id_url){

const fbQuery =
query(
collection(db,"users"),
where("fb_id_url","==",fb)
)

const fbSnap =
await getDocs(fbQuery)

if(!fbSnap.empty){

alert("Facebook URL already used")

return

}

}



/* IMAGE */

let imageUrl = currentData.image

if(cropper){

const blob =
await new Promise(resolve=>{

cropper.getCroppedCanvas({

width:500,
height:500

}).toBlob(resolve,"image/jpeg",0.82)

})

const imageRef =
ref(storage,`players/${user.uid}.jpg`)

await uploadBytes(imageRef,blob)

imageUrl =
await getDownloadURL(imageRef)

}



/* SAVE */

await updateDoc(doc(db,"users",user.uid),{

full_name:
document.getElementById("edit_name").value,

email:newEmail,

phone:
document.getElementById("edit_phone").value,

dob:
document.getElementById("edit_dob").value,

device_name:
document.getElementById("edit_device").value,

konami_id:konami,

fb_id_url:fb,

position:
document.getElementById("edit_position").value,

image:imageUrl

})

alert("Profile Updated")

location.reload()

}catch(error){

console.log(error)

if(error.code === "auth/requires-recent-login"){

alert("Please login again then change email")

}else{

alert(error.message)

}

}

}