
const express=require('express')
const path =require('path')
const mysql =require('mysql2')
const date_fns=require('date-fns')


const PORT=3000
const server=express()
const db=mysql.createConnection("mysql://root:password@127.0.0.1:3306/driver_monitoring")
const alert_db=mysql.createConnection("mysql://root:password@127.0.0.1:3306/alerts")
const contact_db=mysql.createConnection("mysql://root:password@127.0.0.1:3306/contacts")

server.use(express.json())
server.use(express.static(path.join(__dirname)))


db.connect(function(err){
    if(err){
        console.error("Problem in connecting to the db : ",err)
        return
    }

    console.log("Connected to the db :) ")
})


alert_db.connect(function(err){
    if(err){
        console.error("Problem in connecting to the db : ",err)
        return
    }

    console.log("Connected to the alerts db :) ")
})

contact_db.connect(function(err){
    if(err){
        console.error("Problem in connecting to the db : ",err)
        return
    }

    console.log("Connected to the contacts db :) ")
})




server.get("/data",function(req,res){
    const query="SELECT*FROM sensor_readings WHERE Date_and_time IS NOT NULL ORDER BY Date_and_time DESC LIMIT 1"
    db.query(query,function(err,result){
        if(err){
            console.log("Error fetching the data :( ",err)
        }
        console.log(JSON.stringify(result[0]));
        res.json(result[0])
    })

})



server.post("/date_query",function(req,res){
    
    let data
    data =req.body
    server.locals.data=data
    res.sendStatus(200)
})

server.get("/Drivers_log",function(req,res){
    const data =server.locals.data
    const query=`SELECT * FROM sensor_readings WHERE Date_and_time BETWEEN '${data.start_date_value} ${data.start_time_value}:00' AND '${data.end_date_value} ${data.end_time_value}:00'`
    console.log(query)
    db.query(query,function(err,result){
        if(err){
            console.log("Error retriving data from db :(",err)
        }
        else{
            console.log(JSON.stringify(result));
            res.json(result)
        }
    })
})


server.post("/db_deletion",function(req,res){
    const passwd=req.body.passwd
    const preset_passwd="password"
    if(passwd===preset_passwd){
        const query ="DELETE FROM sensor_readings"
        db.query(query,function(err,result){
            if(err){
                console.log("Problem in doing the task",err)
            }else{
                console.log("Data in db is deleted")
            }
        })
        return res.status(200).json("Correct")
        
    }
    else if(passwd !=preset_passwd){
        
        return res.status(200).json("Incorrect")
        
    }
})

server.get("/alerts",function(req,res){
    res.setHeader('Cache-Control', 'no-store');
    const query="SELECT*FROM alerts WHERE Date_and_time IS NOT NULL ORDER BY Date_and_time DESC LIMIT 1"
    alert_db.query(query,function(err,result){
        if(err){
            console.log("Error in Fetching the data : ",err)
        }
        
        console.log(JSON.stringify(result));
        res.status(200).json(result)
        
    })
})


server.post("/alert_date_query",function(req,res){
    
    let alert_data
    alert_data =req.body
    console.log(alert_data)
    server.locals.alert_data=alert_data
    res.sendStatus(200)
})


server.get("/alert_log",function(req,res){
    const data =server.locals.alert_data
    const query=`SELECT * FROM alerts WHERE Date_and_time BETWEEN '${data.start_date_value} ${data.start_time_value}:00' AND '${data.end_date_value} ${data.end_time_value}:00'`
    console.log(query)
    alert_db.query(query,function(err,result){
        if(err){
            console.log("Error retriving data from db :(",err)
        }
        else{
            console.log(JSON.stringify(result));
            res.json(result)
        }
    })
})

server.post("/contacts_db_write_add",function(req,res){
    const data=req.body
    const name=data.name_data
    const phone_number=data.phone_number_data

    console.log(data)
    const add_query="INSERT INTO contacts(name,phone_number) VALUES(?,?)"
    const length_query="SELECT COUNT(*) FROM contacts"
    let length
    contact_db.query(length_query,function(err,result){
        if(err){
            console.log("Error retriving data from db :(",err)
        }
        else{
            length=result[0]['COUNT(*)']
        }

        if(length<5){
            
                contact_db.execute(add_query,[name,phone_number],function(err,result){
                    if(err){
                        console.error("Error adding data : ",err)
                        return
                    }
                    else{
                        console.log("Added data",result.insertId)
                    }
                })
            
        }
        else if(length>=5){
            res.status(403).send({error:"Exceeding limit,remove pre-existing number."})
        }

    })
})

server.post("/contacts_db_write_del",function(req,res){
    const data=req.body
    const name=data.name_data
    const phone_number=data.phone_number_data
    const del_query="DELETE FROM contacts WHERE name=? and phone_number=?"
    contact_db.execute(del_query,[name,phone_number],function(err,result){
        if(err){
            console.err("Error removing data : ",err)
            return
        }
        else{
            console.log("removing data")
        }
    })
})

server.get("/contacts_db_read",function(req,res){
    const query="SELECT * FROM contacts"
    contact_db.query(query,function(err,result){
        if(err){
            console.log("Error retriving data from db :(",err)
        }
        else{
            console.log(JSON.stringify(result));
            res.json(result)
        }
    })
})



server.listen(PORT,function(){
    console.log("Server is listening in port "+PORT)
})





    

