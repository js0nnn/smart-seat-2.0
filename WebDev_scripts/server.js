
const express=require('express')
const path =require('path')
const mysql =require('mysql2')

const PORT=3000
const server=express()
const db=mysql.createConnection("mysql://root:password@127.0.0.1:3306/raspberry_pi")

server.use(express.static(path.join(__dirname)))

db.connect(function(err){
    if(err){
        console.error("Problem in connecting to the db : ",err)
        return
    }

    console.log("Connected to the db :) ")
})


server.get("/data",function(req,res){
    const query="SELECT*FROM driver WHERE Date_and_time IS NOT NULL ORDER BY Date_and_time DESC LIMIT 1"
    db.query(query,function(err,result){
        if(err){
            console.log("Error fetching the data :( ",err)
        }
        console.log(JSON.stringify(result[0]))
        res.json(result[0])
    })

})

server.post("/query",function(req,res){

    const query_from_db=""
})




server.listen(PORT,function(){
    console.log("Server is listening in port "+PORT)
})





    

