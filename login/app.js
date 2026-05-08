import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

getAuth,

GoogleAuthProvider,

signInWithPopup,

signInWithEmailAndPassword

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



const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

const db = getFirestore(app)



/* PASSWORD SHOW */

window.togglePass = function(){

const pass =
document.getElementById("password")

pass.type =
pass.type === "password"
? "text"
: "password"

}



/* EMAIL LOGIN */

window.login = async function(){

const msg =
document.getElementById("msg")

msg.innerHTML =
"Please wait..."


const email =
document.getElementById("email").value.trim()

const password =
document.getElementById("password").value.trim()


try{

const result =
await signInWithEmailAndPassword(
auth,
email,
password
)

const user = result.user


const docRef =
doc(db,"users",user.uid)

const docSnap =
await getDoc(docRef)


if(!docSnap.exists()){

msg.innerHTML =
"Profile not found"

return

}


const userData =
docSnap.data()



/* APPROVAL CHECK */

if(userData.approved !== true){

msg.innerHTML =
"Your profile is waiting for admin approval"

return

}



/* ADMIN CHECK */

if(userData.roles.includes("admin")){

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

}



/* GOOGLE LOGIN */

window.googleLogin = async function(){

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



/* IF USER NOT REGISTERED */

if(!docSnap.exists()){

window.location.href =
"../register/"

return

}


const userData =
docSnap.data()



/* APPROVAL CHECK */

if(userData.approved !== true){

msg.innerHTML =
"Your profile is waiting for admin approval"

return

}



/* ROLE CHECK */

if(userData.roles.includes("admin")){

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