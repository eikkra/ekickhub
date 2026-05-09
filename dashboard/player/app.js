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
getDownloadURL,
deleteObject
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

let currentUserData = null

let cropper = null

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

/* EDIT OPEN */

document.getElementById("editProfileBtn")
.onclick = ()=>{

document.getElementById("editBox")
.classList.add("active")

sidebar.classList.remove("active")

}

/* CANCEL */

document.getElementById("cancelBtn")
.onclick = ()=>{

document.getElementById("editBox")
.classList.remove("active")

}

/* AUTH */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href =
"/login/"

return

}

const snap =
await getDoc(doc(db,"users",user.uid))

if(!snap.exists()) return

const data = snap.data()

currentUserData = data

/* PROFILE */

document.getElementById("playerImage")
.src = data.image

document.getElementById("playerName")
.innerHTML = data.full_name

document.getElementById("country")
.innerHTML = data.country

document.getElementById("position")
.innerHTML = data.position

document.getElementById("playerId")
.innerHTML = data.player_id

document.getElementById("konamiId")
.innerHTML = data.konami_id

document.getElementById("deviceName")
.innerHTML = data.device_name

document.getElementById("fbLink")
.href = data.fb_id_url

/* AGE */

if(data.dob){

const birthYear =
new Date(data.dob).getFullYear()

const age =
new Date().getFullYear() - birthYear

document.getElementById("age")
.innerHTML = age + " Years"

}

/* ROLE SWITCH */

if(Array.isArray(data.roles)){

document.getElementById("roleList")
.innerHTML =
data.roles.join(" , ")

}

/* EDIT FILL */

document.getElementById("edit_name").value =
data.full_name || ""

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

})

/* IMAGE CROP */

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
autoCropArea:1

})

}

reader.readAsDataURL(file)

}

/* SAVE */

document.getElementById("saveBtn")
.onclick = async ()=>{

const user = auth.currentUser

if(!user) return

let imageUrl =
currentUserData.image

/* IMAGE UPDATE */

const file =
document.getElementById("edit_image")
.files[0]

if(file && cropper){

const blob =
await new Promise((resolve)=>{

cropper.getCroppedCanvas({

width:500,
height:500

}).toBlob(

(blob)=>{

resolve(blob)

},

"image/jpeg",
0.82

)

})

/* DELETE OLD */

try{

const oldRef =
ref(storage,currentUserData.image)

await deleteObject(oldRef)

}catch(e){}

/* NEW IMAGE */

const imageRef =
ref(storage,
`players/${user.uid}.jpg`
)

await uploadBytes(
imageRef,
blob
)

imageUrl =
await getDownloadURL(imageRef)

}

/* UPDATE */

await updateDoc(

doc(db,"users",user.uid),

{

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

}

)

alert("Profile Updated")

location.reload()

}