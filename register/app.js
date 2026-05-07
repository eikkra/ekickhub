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
.addEventListener("change",function(e){

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


// GET VALUES
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



// VALIDATION
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



// KONAMI FORMAT
const konamiPattern =
/^[A-Z0-9]{4}-[0-9]{3}-[0-9]{3}-[0-9]{3}$/


if(!konamiPattern.test(konami_id)){

msg.innerHTML =
"Invalid Konami ID format"

return

}



// DUPLICATE CHECK
const { data: existing } =
await supabase
.from("players")
.select("*")
.or(
`email.eq.${email},
konami_id.eq.${konami_id},
fb_id_url.eq.${fb_id_url}`
)


if(existing.length > 0){

msg.innerHTML =
"Email, Konami ID or Facebook already used"

return

}



// CREATE AUTH
const { data, error } =
await supabase.auth.signUp({

email,
password

})


if(error){

msg.innerHTML =
error.message

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


// PLAYER ID
const player_id =
`${PREFIX}-${String(count + 1).padStart(6,'0')}`



// IMAGE UPLOAD
const fileName =
Date.now()+"-"+image.name


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



// IMAGE URL
const { data:imageData } =
supabase
.storage
.from("player-images")
.getPublicUrl(fileName)


const imageUrl =
imageData.publicUrl



// SAVE DATABASE
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
"Registration failed"

return

}



msg.innerHTML =
"Registration successful. Wait for admin approval."


setTimeout(()=>{

window.location.href="../login/"

},2500)

}