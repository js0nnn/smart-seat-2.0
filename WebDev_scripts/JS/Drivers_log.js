const awaiting_data= document.getElementById("awaiting-data-id")

let table_data;

function updater(time){
    let data=setInterval(function(){
        fetch("/data")
        .then(response => response.json())
        .then(data =>{
            value_updater(data.date,data.seat_status,data.heartrate,data.head_position,data.leg_position,data.air_quality,data.emergency)
            awaiting_data.remove()
        })
    },time)
}





function value_updater(date_time,seat_status,heart_rate,head_position,leg_position,air_quality,emergency){
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





updater(2000)