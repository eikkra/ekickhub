import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getAuth,

GoogleAuthProvider,

signInWithPopup,

signInWithEmailAndPassword,

sendPasswordResetEmail

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

getFirestore,

doc,

getDoc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



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



/* PASSWORD SHOW */

const eye =
document.getElementById("eye")

const password =
document.getElementById("password")


eye.addEventListener("click",()=>{

if(password.type === "password"){

password.type = "text"

}else{

password.type = "password"

}

})



/* LOGIN */

document.getElementById("loginBtn")
.addEventListener("click",async()=>{

const msg =
document.getElementById("msg")

msg.innerHTML =
"Please wait..."


const email =
document.getElementById("email").value.trim()

const pass =
document.getElementById("password").value.trim()


if(!email || !pass){

msg.innerHTML =
"Enter email & password"

return

}


try{

const result =
await signInWithEmailAndPassword(
auth,
email,
pass
)

const user = result.user



/* FIRESTORE USER */

const docRef =
doc(db,"users",user.uid)

const docSnap =
await getDoc(docRef)


if(!docSnap.exists()){

msg.innerHTML =
"Profile not found"

return

}


const data =
docSnap.data()



/* APPROVAL */

if(data.approved !== true){

msg.innerHTML =
"Waiting for admin approval"

return

}



/* ROLE CHECK */

if(

Array.isArray(data.roles) &&

data.roles.includes("admin")

){

window.location.href =
"../admin/"

}else{

window.location.href =
"../dashboard/"

}



}catch(error){

console.log(error)

msg.innerHTML =
"Invalid email or password"

}

})



/* GOOGLE LOGIN */

document.getElementById("googleBtn")
.addEventListener("click",async()=>{

const msg =
document.getElementById("msg")

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

const user = result.user


const docRef =
doc(db,"users",user.uid)

const docSnap =
await getDoc(docRef)



if(!docSnap.exists()){

window.location.href =
"../register/"

return

}


const data =
docSnap.data()



if(data.approved !== true){

msg.innerHTML =
"Waiting for admin approval"

return

}



if(

Array.isArray(data.roles) &&

data.roles.includes("admin")

){

window.location.href =
"../admin/"

}else{

window.location.href =
"../dashboard/"

}



}catch(error){

console.log(error)

msg.innerHTML =
error.message

}

})



/* FORGOT PASSWORD */

document.getElementById("forgotBtn")
.addEventListener("click",async()=>{

const email =
document.getElementById("email").value.trim()

const msg =
document.getElementById("msg")


if(!email){

msg.innerHTML =
"Enter your email first"

return

}


try{

await sendPasswordResetEmail(
auth,
email
)

msg.innerHTML =
"Password reset link sent"

}catch(error){

console.log(error)

msg.innerHTML =
"Email not found"

}

})