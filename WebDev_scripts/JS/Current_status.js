


const heart_rate=document.getElementById("heart-rate")
const leg_position=document.getElementById("leg-position")
const head_position=document.getElementById("head-position")
const date_time=document.getElementById("date-time")
const seat_status=document.getElementById("Seat-status")
const air_quality=document.getElementById("air-quality")
const emergency=document.getElementById("emergency")

function change_data(time,element,parameter){
    
    if(element.textContent !==parameter){
        element.classList.add("text-transition")
        element.textContent=parameter
    }
    setTimeout(function(){
        element.classList.remove("text-transition")
    },time)
}



async function updater(time){
    let data=setInterval(function(){
            fetch("/data")
            .then(response => response.json())
            .then(data =>{
                change_data(1500,heart_rate,data.heartrate)
                change_data(1500,date_time,data.date)
                change_data(1500,head_position,data.head_position)
                change_data(1500,seat_status,data.seat_status)
                change_data(1500,leg_position,data.leg_position)
                change_data(1500,emergency,data.emergency)
                change_data(1500,air_quality,data.air_quality)
                
    })
    },time)}


updater(2000)

