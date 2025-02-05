
import { format } from 'https://cdn.jsdelivr.net/npm/date-fns@2.28.0/esm/index.js';


const date_time=document.getElementById("date-time")

const Head_Status=document.getElementById("Head-Status")
const Seat_Status=document.getElementById("Seat-Status")
const Vitals_Status=document.getElementById("Vital-Status")
const Leg_status =document.getElementById("Leg-status")
const tilt_status=document.getElementById("Tilt-Status")

const heart_rate_value=document.getElementById("Heart-rate")
const Drowsiness_value=document.getElementById("Drowsiness")
const Breathing_rate_value=document.getElementById("Breathing-rate")
const Temperature_rate_value=document.getElementById("Temperature-rate")

const hp1_value=document.getElementById("Head-1")
const hp2_value=document.getElementById("Head-2")

const leg1_value=document.getElementById("leg-1")
const leg2_value=document.getElementById("leg-2")
const leg3_value=document.getElementById("leg-3")
const leg4_value=document.getElementById("leg-4")



const tilt_value_x=document.getElementById("Tilt-x-values")
const tilt_value_y=document.getElementById("Tilt-y-values")
const tilt_value_z=document.getElementById("Tilt-z-values")

const Alerts=document.getElementById("Alerts")

function change_date(element,parameter){
    
    if(element.textContent !==parameter){
        let date=new Date(parameter)
        let formatted_date=format(date,"MM/dd/yyyy HH:mm:ss")
        element.textContent=formatted_date
    }
}

function change_status(element,parameter,Normal,Abnormal){
    
    if(element.textContent!==parameter){
        if(parameter===0){
            element.textContent=Normal
            
        }
        else if(parameter===1){
            element.textContent=Abnormal
            
        }
    }
}

function change_value(element,parameter,unit){
    if(element.textContent !==parameter){
        element.textContent=parameter+` ${unit}`
    }
}

function alerts(element,parameter){
    if(element.textContent !==parameter){
        if(parameter===0){
            element.classList.remove("abnormal")
            element.textContent="No Emergency"
            element.classList.add("normal")
            
        }
        else if(parameter===1){
            element.classList.remove("normal")
            element.textContent="Driver status check required kindly check the alerts tab"
            element.classList.add("abnormal")
        }
    }
}


async function updater(time){
    let data=setInterval(function(){
            fetch("/data")
            .then(response => response.json())
            .then(data =>{
                change_date(date_time,data.Date_and_time)

                change_status(Seat_Status,data.Seat_Status,"Occupied","Unoccupied")
                change_value(Drowsiness_value,data.Drowsiness_value," %")

                
                change_status(Vitals_Status,data.Vitals_Status,"Normal","Abnormal")
                change_value(heart_rate_value,data.Heart_Rate,"BPM")
                change_value(Breathing_rate_value,data.Breathing_Rate,"RR")
                change_value(Temperature_rate_value,data.Temperature_Rate,"C")

                change_status(Head_Status,data.Head_Status,"Normal","Abnormal")
                change_value(hp1_value,data.Head_Position1,"mm")
                change_value(hp2_value,data.Head_Position2,"mm")

                change_status(Leg_status,data.Leg_Status,"Normal","Abnormal")
                change_value(leg1_value,data.Leg_Status_1,"mm")
                change_value(leg2_value,data.Leg_Status_2,"mm")
                change_value(leg3_value,data.Leg_Status_3,"mm")
                change_value(leg4_value,data.Leg_Status_4,"mm")

                change_status(tilt_status,data.Tilt_status,"Normal","Abnormal")
                change_value(tilt_value_x,data.Tilt_X,"degrees")
                change_value(tilt_value_y,data.Tilt_Y,"degrees")
                change_value(tilt_value_z,data.Tilt_Z,"degrees")
                
                alerts(Alerts,data.Alert_status)
                
    })
    },time)}


updater(1000)

