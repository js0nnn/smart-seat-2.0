

const status_data=document.getElementById("driver-1-value")
const button=document.getElementById("btn-check")






function change_status(element,parameter,Normal,Abnormal){
    
    
        if(parameter===0){
            element.textContent=Normal
            
        }
        else if(parameter===1){
            element.textContent=Abnormal
            
        }
    
}




function notifer(){

    const noti=setInterval(function(){
    fetch("/data")
    .then(response => response.json())
    .then(data =>{ 
     change_status(status_data,data.Seat_Status,"Active","Inactive")
    })
    },1000)
}


button.addEventListener("click",function(){
    window.location.href="/HTML/Current_status.html"
})



notifer()