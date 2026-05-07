import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getStorage,
ref,
uploadBytes,
getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


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


// 🔥 INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// 🔥 IMAGE PREVIEW
document.getElementById("image")
.addEventListener("change", function(e){

const file = e.target.files[0];

if(file){

const reader = new FileReader();

reader.onload = function(){

const preview =
document.getElementById("preview");

preview.src = reader.result;

preview.style.display = "block";

}

reader.readAsDataURL(file);

}

});


// 🔥 REGISTER FUNCTION
window.register = async function(){

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

const image =
document.getElementById("image").files[0];


// VALIDATION
if(
!name ||
!email ||
!password ||
!position ||
!phone ||
!district
){

alert("Please fill all fields");

return;

}


try{

// 🔐 CREATE USER
const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);

const user = userCredential.user;


// 🖼 UPLOAD IMAGE
let imageURL = "";

if(image){

const storageRef = ref(
storage,
"players/" + user.uid
);

await uploadBytes(
storageRef,
image
);

imageURL =
await getDownloadURL(storageRef);

}


// 💾 SAVE USER DATA
await setDoc(
doc(db,"users",user.uid),
{

name:name,

email:email,

position:position,

phone:phone,

district:district,

image:imageURL,

role:"player",

plan:"free",

approved:false,

createdAt:new Date()

}
);


alert(
"Registration Successful! Waiting For Admin Approval"
);


// REDIRECT
window.location.href="../login/";


}catch(error){

alert(error.message);

}

}