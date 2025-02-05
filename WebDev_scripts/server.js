
const express=require('express')
const path =require('path')
const server=express()
const PORT=3000

function trucase_falsecase_data_gen(true_case,false_case){
    let result;
    if(Math.round(Math.random())===1){
        result=true_case
    }else{
        result=false_case
    }
    return result
}



function data_generator(time,max,min,callback){

    
    let rand=setInterval(function(){
    
    let date=new Date
    let real_time_date_data=date.toLocaleString()
    let heartrate_data=parseFloat((Math.random()*(max-min)+min)).toFixed(2)
    let seat_status_data=trucase_falsecase_data_gen("Occupied","Unoccupied")
    let leg_position_data=trucase_falsecase_data_gen("Normal","Abnormal")
    let head_position_data=trucase_falsecase_data_gen("Normal","Abnormal")
    let air_quality_data=trucase_falsecase_data_gen("Normal","Abnormal")
    let emergency_data;
    
    if(heartrate_data<=60 &&
        seat_status_data==="Occupied"&&
        leg_position_data==="Abnormal"&&
        head_position_data==="Abnormal"&&
        air_quality_data==="Abnormal"){
            emergency_data="Status check is needed"
        }else{
            emergency_data="No Emergency"
        }

    let final_data ={
        date:real_time_date_data,
        heartrate:heartrate_data,
        seat_status:seat_status_data,
        head_position:head_position_data,
        leg_position:leg_position_data,
        emergency:emergency_data,
        air_quality:air_quality_data,
    }
        callback(final_data)
    },time)
    
}
  



server.use(express.static(path.join(__dirname)))

server.listen(PORT,function(){
    console.log("Server is listening in port "+PORT)
})

server.get("/data",function(req,res){
    let data=data_generator(100,0,100,function(data){
        if(!res.headersSent){
            res.json(data)
        }
    })
})



    

