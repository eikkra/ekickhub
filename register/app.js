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



document.getElementById("image")
.addEventListener("change",function(e){

const file = e.target.files[0]

if(file){

const reader =
new FileReader()

reader.onload = function(){

const preview =
document.getElementById("preview")

preview.src = reader.result

preview.style.display = "block"

}

reader.readAsDataURL(file)

}

})



window.registerUser = async function(){

const msg =
document.getElementById("msg")

msg.innerHTML =
"Please wait..."


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

const image =
document.getElementById("image").files[0]



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
!image

){

msg.innerHTML =
"Please fill all fields"

return

}



const pattern =
/^[A-Z0-9]{4}-[0-9]{3}-[0-9]{3}-[0-9]{3}$/


if(!pattern.test(konami_id)){

msg.innerHTML =
"Invalid Konami ID"

return

}



try{

const usersSnapshot =
await getDocs(collection(db,"users"))


let totalUsers = 0

let duplicate = false


usersSnapshot.forEach(docItem=>{

const data = docItem.data()

totalUsers++


if(

data.konami_id === konami_id ||

data.fb_id_url === fb_id_url ||

data.email === email

){

duplicate = true

}

})


if(duplicate){

msg.innerHTML =
"Email or Konami ID already used"

return

}



// CREATE AUTH
const result =
await createUserWithEmailAndPassword(
auth,
email,
password
)


const user = result.user


const player_id =
`EKH-${String(totalUsers+1).padStart(6,'0')}`



// IMAGE UPLOAD
const imageRef =
ref(
storage,
`players/${Date.now()}-${image.name}`
)


await uploadBytes(
imageRef,
image
)


const imageUrl =
await getDownloadURL(imageRef)



// SAVE DATABASE
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

plan:"free"

}

)


msg.innerHTML =
"Registration successful. Wait for admin approval."


setTimeout(()=>{

window.location.href =
"../login/"

},2500)



}catch(error){

msg.innerHTML =
error.message

}

}