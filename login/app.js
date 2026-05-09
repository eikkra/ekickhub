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

password.type =
password.type === "password"
? "text"
: "password"

}



/* LOGIN */

document.getElementById("loginBtn")
.onclick = async ()=>{

msg.innerHTML =
"Please wait..."


try{

const emailValue =
email.value.trim()

const passwordValue =
password.value.trim()



if(!emailValue || !passwordValue){

msg.innerHTML =
"Enter email & password"

return

}



/* FIREBASE LOGIN */

const result =
await signInWithEmailAndPassword(

auth,

emailValue,

passwordValue

)

const user =
result.user



/* GET USER DATA */

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



/* APPROVAL CHECK */

if(data.approved !== true){

msg.innerHTML =
"Waiting for admin approval"

return

}



/* ADMIN CHECK */

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



if(

error.code === "auth/invalid-credential" ||

error.code === "auth/wrong-password" ||

error.code === "auth/user-not-found"

){

msg.innerHTML =
"Invalid email or password"

}else if(

error.code === "auth/invalid-email"

){

msg.innerHTML =
"Invalid email format"

}else{

msg.innerHTML =
error.message

}

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



/* NO ACCOUNT */

if(!docSnap.exists()){

window.location.href =
"../register/"

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



/* FORGOT PASSWORD */

document.getElementById("forgotBtn")
.onclick = async ()=>{

const emailValue =
email.value.trim()


if(!emailValue){

msg.innerHTML =
"Enter your email first"

return

}


try{

await sendPasswordResetEmail(

auth,

emailValue

)

msg.innerHTML =
"Password reset email sent"

}catch(error){

console.log(error)

msg.innerHTML =
error.message

}

}