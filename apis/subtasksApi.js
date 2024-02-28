// create mini express app
const exp=require('express');
const subtasksApp=exp.Router();
const verifyToken = require("./middlewares/verifyToken");
const expressAsyncHandler = require('express-async-handler');

// body parser middleware
subtasksApp.use(exp.json());

// create task
subtasksApp.post('/subtasks',verifyToken, expressAsyncHandler(async(req,res)=>{
    let subtasksCollectionObj = req.app.get('subtasksCollectionObj')
    // get product details
    let newsubtask = req.body
    // checking if task already exists
    let subtask = await subtasksCollectionObj.findOne({subtaskId:newsubtask.subtaskId})
    if(subtask===null){
        newsubtask.exists=true
        await subtasksCollectionObj.insertOne(newsubtask)
        res.send({message:'new SubTask created'})
    }else{
        res.send({message:'SubTask already exists'})
    }
   
}))


// read all subtasks
subtasksApp.get('/subtasks',verifyToken, expressAsyncHandler(async(req,res)=>{
    // get tasksCollectionObj
    let subtasksCollectionObj=req.app.get('subtasksCollectionObj')
    // getting all the tasks
    let subtasks =await subtasksCollectionObj.find({exists:true}).toArray()
    res.send({message:"all subtasks",payload:subtasks})
}));



// update subtask by taskId
subtasksApp.put('/subtasks/:subtaskId',verifyToken, expressAsyncHandler(async(req,res)=>{
    // get tasksCollectionObj
    let subtasksCollectionObj=req.app.get('subtasksCollectionObj')
    let tasksCollectionObj=req.app.get('tasksCollectionObj');
    // subtaskId from url
    let subtaskIdOfUrl = Number(req.params.subtaskId)
    // getting modidified task
    let modifiedStatus=req.body.status
    // update
        await subtasksCollectionObj.updateOne({subtaskId:subtaskIdOfUrl},
            {
            $set:
            {
                status: modifiedStatus
            }
        })
        let subtask = await subtasksCollectionObj.findOne({subtaskId:subtaskIdOfUrl});
        let count = await subtasksCollectionObj.countDocuments({ taskId: subtask.taskId, status:1 });
        if(count === 0){
            await tasksCollectionObj.updateOne({taskId:subtask.taskId},
               { 
                $set:
                {
                    status:"TODO"
                }
            })
        }
        else if(count <3){
            await tasksCollectionObj.updateOne({taskId:subtask.taskId},
                { 
                 $set:
                 {
                     status:"IN_PROGRESS"
                 }
             })
        }
        else{
            await tasksCollectionObj.updateOne({taskId:subtask.taskId},
                { 
                 $set:
                 {
                     status:"DONE"
                 }
             })
        }
        res.send({message:"subtask modified"})
}))

// soft delete task
subtasksApp.put('/subtasks_del/:subtaskId',verifyToken, expressAsyncHandler(async(req,res)=>{
    
    // get tasksCollectionObj
    let subtasksCollectionObj=req.app.get('subtasksCollectionObj')
    // taskId from url
    let urlsubtaskId = Number(req.params.subtaskId)
    // check if taskId exists
    let subtask = await subtasksCollectionObj.findOne({subtaskId:urlsubtaskId})
    if(subtask===null){
        res.send({message:"subtask not found"})
    }else{
        await subtasksCollectionObj.updateOne({subtaskId:urlsubtaskId},{
            $set:{
                exists:false,
            }
        })
        res.send({message:"subtask deleted"})
    }
}))


// restore task
subtasksApp.put('/subtasks_res/:subtaskId',verifyToken, expressAsyncHandler(async(req,res) =>{

    // get tasksCollectionObj
    let subtasksCollectionObj=req.app.get('subtasksCollectionObj')
    // tasksId from url
    let urlsubtaskId = Number(req.params.subtaskId);
    // check if subtasksId exists
    let subtask = await subtasksCollectionObj.findOne({subtaskId:urlsubtaskId})
    if(subtask===null){
        res.send({message:"subtask not found"})
    }else{
        await subtasksCollectionObj.updateOne({subtaskId:urlsubtaskId},{
            $set:{
                exists:true,
            }
        })
        res.send({message:"subtask restored"})
    }
}))

//export subtasksApp
module.exports=subtasksApp;