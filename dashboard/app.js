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

document.getElementById("closeBtn")
.onclick = ()=>{

sidebar.classList.remove("active")

}

const editModal =
document.getElementById("editModal")

document.getElementById("editBtn")
.onclick = ()=>{

editModal.style.display = "flex"

}

let currentUID = null

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href = "../login/"
return

}

currentUID = user.uid

const docRef =
doc(db,"users",user.uid)

const snap =
await getDoc(docRef)

if(!snap.exists()) return

const data = snap.data()

document.getElementById("playerImage").src = data.image

document.getElementById("playerName").innerHTML = data.full_name

document.getElementById("playerId").innerHTML = data.player_id

document.getElementById("konamiId").innerHTML = data.konami_id

document.getElementById("deviceName").innerHTML = data.device_name

document.getElementById("playerCountry").innerHTML = data.country

document.getElementById("playerPosition").innerHTML = data.position

document.getElementById("fbLink").href = data.fb_id_url

/* AGE */

const birthYear =
new Date(data.dob).getFullYear()

const currentYear =
new Date().getFullYear()

document.getElementById("playerAge")
.innerHTML = currentYear - birthYear

/* EDIT */

document.getElementById("edit_name")
.value = data.full_name || ""

document.getElementById("edit_konami")
.value = data.konami_id || ""

document.getElementById("edit_device")
.value = data.device_name || ""

document.getElementById("edit_phone")
.value = data.phone || ""

document.getElementById("edit_dob")
.value = data.dob || ""

document.getElementById("edit_fb")
.value = data.fb_id_url || ""

document.getElementById("edit_position")
.value = data.position || ""

})

/* SAVE */

document.getElementById("saveBtn")
.onclick = async ()=>{

try{

const full_name =
document.getElementById("edit_name").value

const konami_id =
document.getElementById("edit_konami").value

const device_name =
document.getElementById("edit_device").value

const phone =
document.getElementById("edit_phone").value

const dob =
document.getElementById("edit_dob").value

const fb_id_url =
document.getElementById("edit_fb").value

const position =
document.getElementById("edit_position").value

let imageUrl = null

const imageFile =
document.getElementById("edit_image").files[0]

if(imageFile){

const imageRef =
ref(storage,`players/${currentUID}.jpg`)

await uploadBytes(
imageRef,
imageFile
)

imageUrl =
await getDownloadURL(imageRef)

}

const updateData = {

full_name,
konami_id,
device_name,
phone,
dob,
fb_id_url,
position

}

if(imageUrl){

updateData.image = imageUrl

}

await updateDoc(

doc(db,"users",currentUID),

updateData

)

alert("Profile Updated")

location.reload()

}catch(error){

alert(error.message)

}

}