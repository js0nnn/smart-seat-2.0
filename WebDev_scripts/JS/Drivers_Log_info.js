


const end_time=document.getElementById("To_time")
const end_date=document.getElementById("end-date")
const start_date=document.getElementById("start-date")
const start_time=document.getElementById("From_time")
const button =document.getElementById("button")
const del_button =document.getElementById("button_del")
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
        await fetch("/date_query",{

            method:"POST",
            headers:{
                "Content-Type" : "application/json"
            },
            body:JSON.stringify({start_date_value,start_time_value,end_date_value,end_time_value})
    
        })
        window.location.href="Drivers_log.html"
    } catch(error){
        console.error(error)
    }
    
})

del_button.addEventListener("click",function(){
    const passwd=window.prompt("Please enter the password to delete the data in the databse")
    fetch("/db_deletion",{

        method:"POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body:JSON.stringify({passwd})
    }).then(res=>res.json())
    .then(data=>{
        if(data==="Correct"){
            alert("Password Correct Data in databse deleted")
        }
        else if (data==="Incorrect"){
            alert("Password Incorrect Try Again")
        }
    })

    
})
