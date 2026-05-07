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

setDoc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// 🔥 FIREBASE CONFIG
const firebaseConfig = {

apiKey: "AIzaSyCDQw62DQSFFUUSk8l6dOqu2PDo9gYxq6U",

authDomain: "eikkra.firebaseapp.com",

projectId: "eikkra",

storageBucket: "eikkra.firebasestorage.app",

messagingSenderId: "969860834089",

appId: "1:969860834089:web:9b622da21ebced673e0d38",

measurementId: "G-LSG3R7V6YK"

};


// INIT
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);



// REGISTER
window.register = async function(){

const msg =
document.getElementById("msg");

msg.innerHTML = "Please wait...";


const name =
document.getElementById("name").value;

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

const position =
document.getElementById("position").value;

const phone =
document.getElementById("phone").value;

const district =
document.getElementById("district").value;



if(
!name ||
!email ||
!password ||
!position ||
!phone ||
!district
){

msg.innerHTML =
"Please fill all fields";

return;

}



try{

// CREATE USER
const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);

const user = userCredential.user;



// SAVE FIRESTORE
await setDoc(
doc(db,"users",user.uid),
{

name:name,

email:email,

position:position,

phone:phone,

district:district,

role:"player",

plan:"free",

approved:false,

createdAt:new Date()

}
);


msg.innerHTML =
"Registration Successful! Waiting For Approval";


setTimeout(()=>{

window.location.href="../login/";

},2000);


}catch(error){

// CUSTOM ERROR
if(
error.code ===
"auth/email-already-in-use"
){

msg.innerHTML =
"This email is already registered";

}

else{

msg.innerHTML =
"Registration failed. Try again.";

}

}

}