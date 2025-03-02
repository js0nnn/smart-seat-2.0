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
    
        fetch("/Drivers_log")
        .then(response => response.json())
        .then(data =>{
            if(awaiting_data){
                awaiting_data.remove() 
            }
            for(let i=0;i<data.length;i++){
                let date=new Date(data[i].Date_and_time)
                let formatted_date=format(date,"MM/dd/yyyy HH:mm:ss")
                value_updater(formatted_date,
                status_provider(data[i].Seat_Status,"Occupied","Unoccupied"),
                data[i].Heart_Rate,
                status_provider(data[i].Leg_Status,"Normal","Abnormal"),
                status_provider(data[i].Head_Status,"Normal","Abnormal"),
                status_provider(data[i].Alert_status,"Normal","Condition Check Required"))
                    
            }

        })
    
}





function value_updater(date_time,seat_status,heart_rate,head_position,leg_position,emergency){
    const table_body=document.getElementsByClassName("table-content")[0].getElementsByTagName("tbody")[0]

    const row   =table_body.insertRow()
    const cell1 =row.insertCell()
    const cell2 =row.insertCell()
    const cell3 =row.insertCell()
    const cell4 =row.insertCell()
    const cell5 =row.insertCell()
    const cell6 =row.insertCell()
    //const cell7 =row.insertCell()
    row.classList.add("loading-row")
    cell1.classList.add("Date-Time-Data")
    cell1.textContent=date_time
    cell2.textContent=seat_status
    cell3.textContent=heart_rate+" BPM"
    cell4.textContent=head_position
    cell5.textContent=leg_position
    cell6.textContent=emergency
    //cell7.textContent=air_quality
}


go_back_btn.addEventListener("click",function(){
    window.location.assign("./Drivers_Log_info.html")
})


updater()

