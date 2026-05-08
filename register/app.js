import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword
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



/* PASSWORD SHOW */

window.togglePass = function(){

const pass =
document.getElementById("password")

pass.type =
pass.type === "password"
? "text"
: "password"

}



/* IMAGE PREVIEW */

document.getElementById("image")
.addEventListener("change",(e)=>{

const file = e.target.files[0]

if(file){

const reader =
new FileReader()

reader.onload = ()=>{

const preview =
document.getElementById("preview")

preview.src = reader.result

preview.style.display = "block"

}

reader.readAsDataURL(file)

}

})



/* IMAGE COMPRESS */

async function compressImage(file){

return new Promise((resolve)=>{

const reader = new FileReader()

reader.readAsDataURL(file)

reader.onload = function(event){

const img = new Image()

img.src = event.target.result

img.onload = function(){

const canvas =
document.createElement("canvas")

const ctx =
canvas.getContext("2d")

canvas.width = 400
canvas.height = 500

ctx.drawImage(img,0,0,400,500)

canvas.toBlob(

(blob)=>{

resolve(blob)

},

'image/jpeg',

0.85

)

}

}

})

}



/* REGISTER */

window.registerUser = async function(){

const msg =
document.getElementById("msg")

msg.innerHTML =
"Please wait..."


try{

const full_name =
document.getElementById("full_name").value.trim()

const email =
document.getElementById("email").value.trim()

const password =
document.getElementById("password").value.trim()

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

const originalImage =
document.getElementById("image").files[0]



/* EMPTY CHECK */

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
!originalImage

){

msg.innerHTML =
"Please fill all fields"

return

}



/* PASSWORD LENGTH */

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
"Use Konami ID format: ASAD-005-000-111"

return

}



/* COMPRESS IMAGE */

const image =
await compressImage(originalImage)



/* CHECK DUPLICATE */

const snapshot =
await getDocs(collection(db,"users"))

let totalUsers = 0

let duplicate = false


snapshot.forEach((docItem)=>{

const data = docItem.data()

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



/* CREATE AUTH */

const result =
await createUserWithEmailAndPassword(
auth,
email,
password
)

const user = result.user



/* PLAYER ID */

const player_id =
`EKH-${String(totalUsers+1).padStart(6,'0')}`



/* IMAGE UPLOAD */

const imageRef =
ref(
storage,
`players/${Date.now()}.jpg`
)

await uploadBytes(
imageRef,
image
)

const imageUrl =
await getDownloadURL(imageRef)



/* SAVE USER */

await setDoc(
doc(db,"users",user.uid),
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
"Registration Successful. Waiting for admin approval."



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