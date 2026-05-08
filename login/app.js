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



window.login = async function(){

const msg =
document.getElementById("msg")

msg.innerHTML = "Please wait..."


const email =
document.getElementById("email").value

const password =
document.getElementById("password").value


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
"Account data not found"

return

}


const userData =
docSnap.data()


if(userData.approved !== true){

msg.innerHTML =
"Waiting for admin approval"

return

}


msg.innerHTML =
"Login successful"


}catch(error){

msg.innerHTML =
"Invalid email or password"

}

}



window.googleLogin = async function(){

const msg =
document.getElementById("msg")

msg.innerHTML =
"Please wait..."


try{

const provider =
new GoogleAuthProvider()

await signInWithPopup(
auth,
provider
)

window.location.href =
"../register/"


}catch(error){

msg.innerHTML =
error.message

}

}