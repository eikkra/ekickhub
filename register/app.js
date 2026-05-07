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


// 🔥 FIREBASE CONFIG (IMPORTANT)
const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// 🚀 REGISTER FUNCTION
window.register = async function(){

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const position = document.getElementById("position").value;
  const phone = document.getElementById("phone").value;
  const district = document.getElementById("district").value;
  const image = document.getElementById("image").files[0];

  if(!name || !email || !password){
    alert("Fill all required fields");
    return;
  }

  try{

    // 1️⃣ AUTH CREATE
    const userCred = await createUserWithEmailAndPassword(auth,email,password);
    const user = userCred.user;

    // 2️⃣ IMAGE UPLOAD
    let imageURL = "";

    if(image){
      const imgRef = ref(storage,"players/"+user.uid);
      await uploadBytes(imgRef,image);
      imageURL = await getDownloadURL(imgRef);
    }

    // 3️⃣ SAVE DATA (Firestore)
    await setDoc(doc(db,"users",user.uid),{
      name:name,
      email:email,
      position:position,
      phone:phone,
      district:district,
      image:imageURL,
      role:"player",
      approved:false,
      plan:"free"
    });

    alert("Registered Successfully! Waiting for Admin Approval");

    window.location.href="login.html";

  }catch(error){
    alert(error.message);
  }

}