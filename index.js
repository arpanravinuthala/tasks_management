//CREATE EXPRESS APP
const exp=require('express')
const app=exp();
const cronJobs = require('./cronJobs');

//import MongoClient
const mngClient=require('mongodb').MongoClient;


//connecting to MongoDB server with mongo client
mngClient.connect('mongodb://127.0.0.1:27017/tasks_db')
.then(client=>{
    //get db obj
    let db=client.db('tasks_db')
    //get userscollection obj
    let usersCollectionObj=db.collection('usersCollection')
    // get tasksCollection obj
    let tasksCollectionObj=db.collection('tasksCollection')
    // get subtasksCollection obj
    let subtasksCollectionObj=db.collection('subtasksCollection')
    //share usersCollectionObj
    app.set('usersCollectionObj',usersCollectionObj)
    // share tasksCollectionObj
    app.set('tasksCollectionObj',tasksCollectionObj)
    // share subtasksCollectionObj
    app.set('subtasksCollectionObj',subtasksCollectionObj)
    console.log("Database connected successfully")
})
.catch(err=>console.log("err in db connect ",err))



const userApp=require("./apis/usersApi")
const tasksApp=require("./apis/tasksApi")
const subtasksApp=require('./apis/subtasksApi')


// Body parser middleware
app.use(exp.json());

//if path starts with /user-api, then forward req to userApi
app.use('/user-api',userApp)
// //if path starts with /product-api, then forward req to productApi
app.use('/tasks-api',tasksApp)
// // if path starts with /product-api, then forward req to productApi
app.use('/subtasks-api',subtasksApp)

// error handling using middleware
app.use((req,res,next)=>{
    res.send({message:"Invalid path"})
})


// error handling middleware
app.use((err,req,res,next)=>{
    res.send({message:"Error Occured",error:err.message})
})


//assign port number to HTTP Server
app.listen(3000,()=>console.log("server listening on port 3000..."))

// Pass app instance to cron jobs along with a dummy req object
// cronJobs.changeTaskPriority({ app, req: {} });
// cronJobs.initiateVoiceCalls({ app, req: {} });