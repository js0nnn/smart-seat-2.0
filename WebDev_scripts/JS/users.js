



const name_tag=document.getElementById("name")
const phone_number=document.getElementById("number")
const add_btn=document.getElementById("submit-btn")
const remove_btn=document.getElementById("remove-btn")
const phone_list=document.getElementById("phone-list")
const error=document.getElementById("error")
const refresh=document.getElementById("refresh-btn")
const no_num=document.getElementById("no_num")

async function notifier(){
    
    await fetch("/contacts_db_read")
    .then(response=>response.json())
    .then(data=>{
        if(data.length>0){
            phone_list.innerHTML=""
            if(no_num){
                no_num.remove()
            }
        }
        else if(data.length===0)(
            phone_list.innerHTML='<div class="no_num" id="no_num">No numbers as of now</div>'
        )
        data.forEach(element=>{
            phone_list.insertAdjacentHTML("afterbegin",`
                <div class="data-append">                
                <span class="name-append">${element.name} : </span>
                <span class="number-append">${element.phone_number}</span>
                </div>`
            )
        })
    })
}

async function data_modifer(data){
    const name_data=name_tag.value
    const phone_number_data=phone_number.value
    const phone_number_check=/^\+91\d{10}$/.test(phone_number_data)
    const phone_number_substring=phone_number_data.substring(0,3)

    if(!name_data || !phone_number_data){
        error.textContent="Invalid input"
        return
    }

    if(phone_number_check===false){
        error.textContent="Invalid input"
        return
    }

    if(phone_number_data.length!=13 ){
        error.textContent="Invalid number length (max length=13)"
        return
    }

    if(phone_number_substring!=="+91"){
        error.textContent="Missing Country Code (India : +91)"
        return
    }
    
    error.textContent=""
    let response
    try{
        response=await fetch(data,{

            method:"POST",
            headers:{
                "Content-Type" : "application/json"
            },
            body:JSON.stringify({name_data,phone_number_data})
        })
            
        
    }catch(error){
        console.error(error)
    }


    const response_data=await response.json()
    if(response_data.error){
        error.textContent=response_data.error
        setTimeout(()=>
        error.textContent="",3000)
    }

 
}


document.addEventListener("DOMContentLoaded",function(){
    notifier()
})




add_btn.addEventListener("click",function(){
    data_modifer("/contacts_db_write_add")
    notifier()
})

remove_btn.addEventListener("click",function(){
    data_modifer("/contacts_db_write_del")
    notifier()

})

refresh.addEventListener("click",function(){
    notifier()

})




