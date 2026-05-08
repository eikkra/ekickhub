import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getAuth,

GoogleAuthProvider,

signInWithPopup,

EmailAuthProvider,

linkWithCredential

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

getFirestore,

doc,

setDoc,

getDocs,

collection

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

getStorage,

ref,

uploadBytes,

getDownloadURL

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";



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

const storage =
getStorage(app)



/* ELEMENTS */

const msg =
document.getElementById("msg")

const emailInput =
document.getElementById("email")

const passwordInput =
document.getElementById("password")



/* PASSWORD SHOW */

document.getElementById("eyeBtn")
.onclick = ()=>{

passwordInput.type =
passwordInput.type === "password"
? "text"
: "password"

}



/* GOOGLE LOGIN */

let currentUser = null

document.getElementById("googleBtn")
.onclick = async ()=>{

msg.innerHTML =
"Please wait..."


try{

const provider =
new GoogleAuthProvider()

const result =
await signInWithPopup(
auth,
provider
)

currentUser =
result.user

emailInput.value =
currentUser.email

msg.innerHTML =
"Google connected successfully"

}catch(error){

console.log(error)

msg.innerHTML =
error.message

}

}



/* IMAGE COMPRESS */

async function compressImage(file){

return new Promise((resolve)=>{

const reader =
new FileReader()

reader.readAsDataURL(file)

reader.onload = (event)=>{

const img =
new Image()

img.src =
event.target.result

img.onload = ()=>{

const canvas =
document.createElement("canvas")

const ctx =
canvas.getContext("2d")

canvas.width = 400
canvas.height = 500

ctx.drawImage(
img,
0,
0,
400,
500
)

canvas.toBlob(

(blob)=>{

resolve(blob)

},

"image/jpeg",

0.82

)

}

}

})

}



/* REGISTER */

document.getElementById("registerBtn")
.onclick = async ()=>{

msg.innerHTML =
"Please wait..."


try{

if(!currentUser){

msg.innerHTML =
"Connect Google first"

return

}



/* GET VALUES */

const full_name =
document.getElementById("full_name").value.trim()

const email =
emailInput.value.trim()

const password =
passwordInput.value.trim()

const phone =
document.getElementById("phone").value.trim()

const district =
document.getElementById("district").value

const position =
document.getElementById("position").value

const konami_id =
document.getElementById("konami_id").value.trim()

const device_name =
document.getElementById("device_name").value.trim()

const fb_id_url =
document.getElementById("fb_id_url").value.trim()

const imageFile =
document.getElementById("image").files[0]



/* VALIDATION */

if(
!full_name ||
!email ||
!password ||
!phone ||
!district ||
!position ||
!konami_id ||
!device_name ||
!fb_id_url ||
!imageFile
){

msg.innerHTML =
"Please fill all fields"

return

}



/* PASSWORD */

if(password.length < 6){

msg.innerHTML =
"Password minimum 6 characters"

return

}



/* KONAMI FORMAT */

const konamiPattern =
/^[A-Z]{4}-[0-9]{3}-[0-9]{3}-[0-9]{3}$/


if(!konamiPattern.test(konami_id)){

msg.innerHTML =
"Format: ASDF-000-000-000"

return

}



/* IMAGE SIZE */

if(imageFile.size > 5 * 1024 * 1024){

msg.innerHTML =
"Image must be below 5MB"

return

}



/* CHECK DUPLICATE */

const snapshot =
await getDocs(
collection(db,"users")
)

let totalUsers = 0

let duplicate = false


snapshot.forEach((docItem)=>{

const data =
docItem.data()

totalUsers++


if(

data.email === email ||

data.konami_id === konami_id ||

data.fb_id_url === fb_id_url

){

duplicate = true

}

})


if(duplicate){

msg.innerHTML =
"Email / Konami ID / FB URL already used"

return

}



/* LINK PASSWORD */

const credential =
EmailAuthProvider.credential(
email,
password
)

await linkWithCredential(
currentUser,
credential
)



/* COMPRESS IMAGE */

msg.innerHTML =
"Compressing image..."


const compressed =
await compressImage(imageFile)



/* UPLOAD IMAGE */

msg.innerHTML =
"Uploading image..."


const imageRef =
ref(
storage,
`players/${Date.now()}.jpg`
)

await uploadBytes(
imageRef,
compressed
)

const imageUrl =
await getDownloadURL(imageRef)



/* PLAYER ID */

const player_id =
`EKH-${String(totalUsers+1).padStart(6,'0')}`



/* SAVE DATA */

msg.innerHTML =
"Saving profile..."


await setDoc(

doc(db,"users",currentUser.uid),

{

player_id,

full_name,

email,

phone,

district,

position,

konami_id,

device_name,

fb_id_url,

image:imageUrl,

approved:false,

roles:["player"],

plan:"free",

created_at:new Date().toISOString()

}

)



msg.innerHTML =
"Registration successful. Waiting for admin approval."



setTimeout(()=>{

window.location.href =
"../login/"

},2500)



}catch(error){

console.log(error)

msg.innerHTML =
error.message

}

}