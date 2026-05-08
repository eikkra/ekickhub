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



/* ELEMENTS */

const email =
document.getElementById("email")

const password =
document.getElementById("password")

const msg =
document.getElementById("msg")



/* PASSWORD SHOW */

document.getElementById("eyeBtn")
.onclick = ()=>{

if(password.type === "password"){

password.type = "text"

}else{

password.type = "password"

}

}



/* LOGIN */

document.getElementById("loginBtn")
.onclick = async ()=>{

msg.innerHTML =
"Please wait..."


try{

const result =
await signInWithEmailAndPassword(

auth,

email.value.trim(),

password.value.trim()

)

const user =
result.user



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



if(data.approved !== true){

msg.innerHTML =
"Waiting for admin approval"

return

}



/* ADMIN */

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

}



/* GOOGLE LOGIN */

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

const user =
result.user



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

}



/* FORGOT PASSWORD */

document.getElementById("forgotBtn")
.onclick = async ()=>{

if(!email.value){

msg.innerHTML =
"Enter your email first"

return

}


try{

await sendPasswordResetEmail(

auth,

email.value.trim()

)

msg.innerHTML =
"Password reset email sent"

}catch(error){

console.log(error)

msg.innerHTML =
error.message

}

}