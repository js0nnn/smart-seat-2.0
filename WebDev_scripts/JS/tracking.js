


const latitude=document.getElementById("latitude")
const longitude=document.getElementById("longitude")
const mode_of_tracking=document.getElementById("track-mode")
const gps_btn=document.getElementById("gps")
const tower_btn=document.getElementById("tower")
const speed=document.getElementById("speed-value")
const altitude=document.getElementById("altitude-value")
const map_frame=document.getElementById("map")







function data_updater(data_type){

    fetch("/data")
    .then(response=>response.json())
    .then(data=>{


      
        latitude.textContent=data.latitude
        longitude.textContent=data.longitude
        mode_of_tracking.textContent=" Tracking by GPS coordinates"
        speed.textContent=data.speed
        altitude.textContent=data.altitude
      

    })
  
}

function map_runner(){
  fetch("/data")
  .then(response=>response.json())
  .then(data=>{
    map_frame.textContent=""
    map_frame.insertAdjacentHTML("afterbegin",
      `<iframe class="map_iframe"
                src="https://maps.google.com/maps?width=99%&amp;height=600&amp;hl=en&amp;q=${data.latitude},${data.longitude}&amp;ie=UTF8&amp;t=&amp;z=18&amp;iwloc=B&amp;output=embed" 
                frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>`
    )

    

  })
}

let gps_updater
let tower_updater


gps_updater=setInterval(()=>data_updater("gps"),1000)

document.addEventListener("DOMContentLoaded",()=>{
  map_runner()
})




gps_btn.addEventListener("click",function(){

   map_runner()
  
})


/*

tower_btn.addEventListener("click",function(){
  if(tower_updater || gps_updater){
    clearInterval(tower_updater)
    clearInterval(gps_updater)
  }

  tower_updater=setInterval(()=>data_updater("tower"),1000)
})

*/