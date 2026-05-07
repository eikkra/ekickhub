import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


// SUPABASE
const supabaseUrl =
'https://jwrgmkodoktzrmbyjyon.supabase.co'

const supabaseKey =
'sb_publishable_LmDSx8FcuURLN2KV6E5lzg_PUXpeu7j'

const supabase =
createClient(
supabaseUrl,
supabaseKey
)


// PLAYER ID PREFIX
const PREFIX = "EFH"


// IMAGE PREVIEW
document
.getElementById("image")
.addEventListener("change", function(e){

const file = e.target.files[0]

if(file){

const reader = new FileReader()

reader.onload = function(){

const preview =
document.getElementById("preview")

preview.src = reader.result

preview.style.display = "block"

}

reader.readAsDataURL(file)

}

})




// REGISTER
window.register = async function(){

const msg =
document.getElementById("msg")

msg.innerHTML = "Please wait..."


// VALUES
const full_name =
document.getElementById("full_name").value.trim()

const email =
document.getElementById("email").value.trim()

const password =
document.getElementById("password").value.trim()

const phone =
document.getElementById("phone").value.trim()

const district =
document.getElementById("district").value

const position =
document.getElementById("position").value

const konami_id =
document.getElementById("konami_id").value.trim()

const device_name =
document.getElementById("device_name").value.trim()

const fb_id_url =
document.getElementById("fb_id_url").value.trim()

const image =
document.getElementById("image").files[0]




// CHECK EMPTY
if(
!full_name ||
!email ||
!password ||
!phone ||
!district ||
!position ||
!konami_id ||
!device_name ||
!fb_id_url ||
!image
){

msg.innerHTML =
"Please fill all fields"

return

}



// KONAMI CHECK
const pattern =
/^[A-Z0-9]{4}-[0-9]{3}-[0-9]{3}-[0-9]{3}$/


if(!pattern.test(konami_id)){

msg.innerHTML =
"Invalid Konami ID format"

return

}



try{

// DUPLICATE CHECK
const { data: duplicateData } =
await supabase
.from("players")
.select("email, konami_id, fb_id_url")


const duplicate =
duplicateData.find(player =>

player.email === email ||

player.konami_id === konami_id ||

player.fb_id_url === fb_id_url

)


if(duplicate){

msg.innerHTML =
"Email, Konami ID or Facebook already used"

return

}



// CREATE AUTH
const { error: authError } =
await supabase.auth.signUp({

email,
password

})


if(authError){

msg.innerHTML =
authError.message

return

}



// PLAYER COUNT
const { count } =
await supabase
.from("players")
.select("*",{
count:'exact',
head:true
})



const player_id =
`${PREFIX}-${String(count + 1).padStart(6,'0')}`



// IMAGE NAME
const fileName =
`${Date.now()}-${image.name}`



// UPLOAD IMAGE
const { error: uploadError } =
await supabase
.storage
.from("player-images")
.upload(fileName,image)



if(uploadError){

msg.innerHTML =
"Image upload failed"

return

}



// GET IMAGE URL
const { data:imageData } =
supabase
.storage
.from("player-images")
.getPublicUrl(fileName)



const imageUrl =
imageData.publicUrl



// INSERT DATABASE
const { error: insertError } =
await supabase
.from("players")
.insert([{

player_id,

full_name,

email,

phone,

district,

position,

konami_id,

device_name,

fb_id_url,

image:imageUrl,

approved:false,

role:"player",

plan:"free"

}])


if(insertError){

msg.innerHTML =
"Database save failed"

return

}



msg.innerHTML =
"Registration successful. Waiting for approval."


setTimeout(()=>{

window.location.href="../login/"

},2500)



}catch(err){

msg.innerHTML =
"Something went wrong"

console.log(err)

}

}