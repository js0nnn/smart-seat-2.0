


const end_time=document.getElementById("To_time")
const end_date=document.getElementById("end-date")
const start_date=document.getElementById("start-date")
const start_time=document.getElementById("From_time")
const button =document.getElementById("button")
const error=document.getElementById("error")

button.addEventListener("click", async function(){




    const start_time_value=start_time.value
    const end_time_value=end_time.value
    const start_date_value=start_date.value
    const end_date_value=end_date.value

    if(!start_date_value || !end_date_value || !end_date_value || !start_date_value){
        error.textContent="Invalid input"
        return
    }


    error.textContent=""
    
    try{
        await fetch("/alert_date_query",{

            method:"POST",
            headers:{
                "Content-Type" : "application/json"
            },
            body:JSON.stringify({start_date_value,start_time_value,end_date_value,end_time_value})
    
        })
        window.location.href="Alert_log.html"
    } catch(error){
        console.error(error)
    }
    
})

