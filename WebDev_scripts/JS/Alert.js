import { format } from "https://cdn.jsdelivr.net/npm/date-fns@2.28.0/esm/index.js";


const alert_now=document.getElementById("for-now")
const container=document.getElementById("alert-main-flex")
const old_alerts=document.getElementById("check-prior-alerts")



function status_provider(data,Normal,Abnormal){
    let result;
    if(data===0){
        result=Normal
    }else if(data===1){
        result=Abnormal
    }else{
        result="Invalid"
    }

    return result
}



let alert_date=null

function notifier(){
    

    
    const noti=setInterval(function(){

        fetch("/alerts")
        .then(response=>response.json())
        .then(data=>{
            if(alert_now){
                alert_now.remove()
            }
            
            data.forEach(element => {
                const changed_date=new Date(element.Date_and_time)
                const date=format(changed_date,"MM/dd/yyyy HH:mm:ss")
    
                if(date===alert_date){
                    return
                }
                    alert_date=date
                    container.insertAdjacentHTML("afterbegin",`
                    <div class="alert" id="alert">
                    <div class="date-time" id="date-time">Date and time : ${date}</div>
                    <div class="latitude" id="latitude">Latitude : ${element.latitude}</div>
                    <div class="longitude" id="longitude">Longitude :${element.longitude}</div>
                    <div class="heart-rate" id="heart-rate">Heart Rate :${element.Heart_Rate}</div>
                    <div class="breathing-rate" id="breathing-rate">SpO2 :${element.spo2}</div>
                    <div class="temperature" id="temperature">Body Temperature :${element.Temperature_Rate} </div>
                    <div class="drowsiness" id="drowsiness">Drowsiness :${element.Drowsiness_value} </div>
                    <div class="emergency-personal" id="emergency-personal">Emergency Personal Status : ${status_provider(element.emergency_status,"Emergency Services have been contacted"
                    ,"Emergency Services have not been contacted")}</div>
                    </div>
        `)
            
        
        })
               
                
    
     })
    },1000)

    
}


old_alerts.addEventListener("click",function(){
    window.location.href="Alerts_info.html"

})

setInterval(notifier,1000)



