// create mini express app
const exp=require('express');
const tasksApp=exp.Router();
const verifyToken = require("./middlewares/verifyToken");
const expressAsyncHandler = require('express-async-handler');

// body parser middleware
tasksApp.use(exp.json());

// create task
tasksApp.post('/tasks',verifyToken, expressAsyncHandler(async(req,res)=>{
    let tasksCollectionObj = req.app.get('tasksCollectionObj')
    // get task details
    let newTask = req.body
    // checking if task already exists
    let task = await tasksCollectionObj.findOne({taskId:newTask.taskId})
    if(task===null){
        newTask.exists=true
        await tasksCollectionObj.insertOne(newTask)
        res.send({message:'new Task created'})
    }else{
        res.send({message:'Task already exists'})
    }
   
}))


// read all tasks
tasksApp.get('/tasks',verifyToken, expressAsyncHandler(async(req,res)=>{

    // get tasksCollectionObj
    let tasksCollectionObj=req.app.get('tasksCollectionObj')
    // getting all the tasks
    let tasks =await tasksCollectionObj.find({exists:true}).toArray()
    res.send({message:"all tasks",payload:tasks})
}));


// read all tasks which are "TODO"
tasksApp.get('/tasks_todo',verifyToken, expressAsyncHandler(async(req,res)=>{

    // get tasksCollectionObj
    let tasksCollectionObj=req.app.get('tasksCollectionObj')
    // getting all the tasks
    let tasks =await tasksCollectionObj.find({exists:true, status:"TODO"}).toArray()
    res.send({message:"TODO tasks",payload:tasks})
}));


// read all tasks which are "DONE"
tasksApp.get('/tasks_done',verifyToken, expressAsyncHandler(async(req,res)=>{

    // get tasksCollectionObj
    let tasksCollectionObj=req.app.get('tasksCollectionObj')
    // getting all the tasks
    let tasks =await tasksCollectionObj.find({exists:true, status:"DONE"}).toArray()
    res.send({message:"DONE tasks",payload:tasks})
}));


// read a task by taskId
tasksApp.get('/tasks/:taskId',verifyToken, expressAsyncHandler(async(req,res)=>{

    // get tasksCollectionObj
    let tasksCollectionObj = req.app.get('tasksCollectionObj')
    // tasksId from url
    let urlTaskId = Number(req.params.taskId)
    // checking for the taskId
    let task = await tasksCollectionObj.findOne({taskId:urlTaskId,exists:true})
    if(task===null){
        res.send({message:"no task exists with that taskId"})
    }else{
        res.send({message:"task",payload:task})
    }
}))

// update task by taskId
tasksApp.put('/tasks/:taskId',verifyToken, expressAsyncHandler(async(req,res)=>{

    // get taskCollectionObj
    let tasksCollectionObj=req.app.get('tasksCollectionObj')
    // taskId from url
    let taskIdOfUrl = Number(req.params.taskId)
    // getting modidified task
    let modifiedtask=req.body
    // update
        await tasksCollectionObj.updateOne({taskId:taskIdOfUrl},
            {
            $set:
            {
                ...modifiedtask,
            }
        })
        res.send({message:"task modified"})
}))

// soft delete task
tasksApp.put('/tasks_del/:taskId',verifyToken, expressAsyncHandler(async(req,res)=>{
    
    // get tasksCollectionObj
    let tasksCollectionObj=req.app.get('tasksCollectionObj')
    // taskId from url
    let urlTaskId = Number(req.params.taskId)
    // check if taskId exists
    let task = await tasksCollectionObj.findOne({taskId:urlTaskId})
    if(task===null){
        res.send({message:"task not found"})
    }else{
        await tasksCollectionObj.updateOne({taskId:urlTaskId},{
            $set:{
                exists:false,
            }
        })
        res.send({message:"task deleted"})
    }
}))

// restore task
tasksApp.put('/tasks_res/:taskId',verifyToken, expressAsyncHandler(async(req,res) =>{

    // get tasksCollectionObj
    let tasksCollectionObj=req.app.get('tasksCollectionObj')
    // tasksId from url
    let urltaskId = Number(req.params.taskId);
    // console.log(urltaskId);
    // check if tasksId exists
    let task = await tasksCollectionObj.findOne({taskId:urltaskId})
    if(task===null){
        res.send({message:"task not found"})
    }else{
        await tasksCollectionObj.updateOne({taskId:urltaskId},{
            $set:{
                exists:true,
            }
        })
        res.send({message:"task restored"})
    }
}))



//export tasksApp
module.exports=tasksApp;