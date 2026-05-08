import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
!full_name ||
!phone ||
!district ||
!position ||
!konami_id ||
!device_name ||
!fb_id_url ||
!image
){

msg.innerHTML = "Please fill all fields"

return

}


const pattern =
/^[A-Z0-9]{4}-[0-9]{3}-[0-9]{3}-[0-9]{3}$/


if(!pattern.test(konami_id)){

msg.innerHTML = "Invalid Konami ID"

return

}


const usersSnapshot =
await getDocs(collection(db,"users"))


let totalUsers = 0

let duplicate = false


usersSnapshot.forEach(docItem => {

const data = docItem.data()


totalUsers++


if(
data.konami_id === konami_id ||
data.fb_id_url === fb_id_url
){

duplicate = true

}

})


if(duplicate){

msg.innerHTML = "Duplicate Konami ID or Facebook URL"

return

}


const player_id =
`EKH-${String(totalUsers + 1).padStart(6,'0')}`


const imageRef =
ref