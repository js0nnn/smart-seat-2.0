import { format } from "https://cdn.jsdelivr.net/npm/date-fns@2.28.0/esm/index.js";


const awaiting_data= document.getElementById("awaiting-data-id")
const go_back_btn=document.getElementById("go-back-btn")
let table_data;


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


function updater(){



        fetch("/alert_log")
        .then(response => response.json())
        .then(data =>{
            if(awaiting_data){
                awaiting_data.remove()
            }
            for(let i=0;i<data.length;i++){
                let date=new Date(data[i].Date_and_time)
                let formatted_date=format(date,"MM/dd/yyyy HH:mm:ss")
                value_updater(formatted_date,
                data[i].latitude,
                data[i].longitude,
                data[i].Heart_Rate,
                data[i].Temperature_Rate,
                data[i].spo2,
                data[i].Drowsiness_value,
                status_provider(data[i].emergency_status,"Emergency Services have been contacted","Emergency Services have not been contacted")
                )
                  
            }

        })
    
}





function value_updater(date_time,latitude,longitude,heart_rate,Temperature,SpO2,drowsiness,emergency_status){
    const table_body=document.getElementsByClassName("table-content")[0].getElementsByTagName("tbody")[0]

    const row   =table_body.insertRow()
    const cell1 =row.insertCell()
    const cell2 =row.insertCell()
    const cell3 =row.insertCell()
    const cell4 =row.insertCell()
    const cell5 =row.insertCell()
    const cell6 =row.insertCell()
    const cell7 =row.insertCell()
    const cell8 =row.insertCell()

    row.classList.add("loading-row")
    cell1.classList.add("Date-Time-Data")
    cell1.textContent=date_time
    cell2.textContent=latitude
    cell3.textContent=longitude
    cell4.textContent=heart_rate+" BPM"
    cell5.textContent=SpO2
    cell6.textContent=Temperature
    cell7.textContent=drowsiness
    cell8.textContent=emergency_status
    //cell7.textContent=air_quality
}


go_back_btn.addEventListener("click",function(){
    window.location.assign("./Alerts_info.html")
})


updater()

