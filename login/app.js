import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const provider = new GoogleAuthProvider()

const result =
await signInWithPopup(auth,provider)

const user = result.user


const docRef = doc(db,"users",user.uid)

const docSnap = await getDoc(docRef)


if(!docSnap.exists()){

window.location.href = "../register/"

return

}


const userData = docSnap.data()


if(userData.approved !== true){

msg.innerHTML = "Waiting for admin approval"

return

}


if(userData.roles.includes("admin")){

window.location.href = "../admin/"

}else{

window.location.href = "../dashboard/"

}


}catch(error){

msg.innerHTML = error.message

}

}