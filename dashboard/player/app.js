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
updateDoc
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

document.getElementById("logoutBtn")
.onclick = async ()=>{

await signOut(auth)

window.location.href = "../login/"

}

let currentData = null
let cropper = null

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

async function loadPublicProfile(uid){

const docSnap =
await getDoc(doc(db,"users",uid))

if(!docSnap.exists()) return

loadProfile(docSnap.data())

}

function loadProfile(data){

document.getElementById("playerImage").src =
data.image

document.getElementById("playerName").innerHTML =
data.full_name

document.getElementById("fbLink").href =
data.fb_id_url

document.getElementById("country").innerHTML =
"🌍 "+data.country

document.getElementById("position").innerHTML =
"🎮 "+data.position

document.getElementById("age").innerHTML =
"🎂 "+calculateAge(data.dob)

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

document.getElementById("edit_name").value =
data.full_name

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

function loadRoles(roles){

const roleList =
document.getElementById("roleList")

roleList.innerHTML = ""

roles.forEach(role=>{

const div =
document.createElement("div")

div.className = "sideItem"

div.innerHTML =
"🔄 "+role.toUpperCase()

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

document.getElementById("saveEdit")
.onclick = async()=>{

const user = auth.currentUser

if(!user) return

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

await updateDoc(doc(db,"users",user.uid),{

full_name:
document.getElementById("edit_name").value,

phone:
document.getElementById("edit_phone").value,

dob:
document.getElementById("edit_dob").value,

device_name:
document.getElementById("edit_device").value,

konami_id:
document.getElementById("edit_konami").value,

fb_id_url:
document.getElementById("edit_fb").value,

position:
document.getElementById("edit_position").value,

image:imageUrl

})

location.reload()

}