//create mini-express app
const exp = require("express");
const userApp = exp.Router();
const bcryptjs=require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("./middlewares/verifyToken")
const expressAsyncHandler = require("express-async-handler")

//body parser middleware
userApp.use(exp.json());


//route to create new user
userApp.post("/user", expressAsyncHandler(async(req, res) => {
 
    //get usersCollectionObj
    let usersCollectionObj=req.app.get('usersCollectionObj')
    //get new user from req
    let newUser=req.body;
    //verify user's existance
    let existingUser=await usersCollectionObj.findOne({username:newUser.username})
    //if user not existed
    if(existingUser===null){
      // adding status to the newUser
    newUser.exists=true
      // hash the password
      let hashedPassword=await bcryptjs.hash(newUser.password,5)
      //replace plain paassword with hashed password
      newUser.password=hashedPassword;
      //create new user
      await usersCollectionObj.insertOne(newUser)
      res.send({message:"User creation success"})
    }
    else{
      res.send({message:'User already existed'})
    }
  }));
  
// route to login
  userApp.get('/user-login', expressAsyncHandler(async(req,res)=>{

    // get usersCollectionObj
    let usersCollectionObj=req.app.get('usersCollectionObj')
    // get the userOfDb
    let userCredObj = req.body;
    // verify the username
    let userOfDb= await usersCollectionObj.findOne({username:userCredObj.username})
    // if user is not found
    if(userOfDb===null){
      res.send({message:"username is invalid"})
    }else{
      // compare password
      let result = await bcryptjs.compare(userCredObj.password,userOfDb.password)
      // if password is not matched
      if(result===false){
        res.send({message:"password is invalid"})
      }
      // if password matches
      else{
        // create a token
        let signedToken=jwt.sign({username:userOfDb.username},'abcdef',{expiresIn:'1h'})
        //syntax sign({userPayload},secret key,{options(validity period)})
        // send token in res
        res.send({message:"login successful",token:signedToken,currentUser:userOfDb})
      }
    }
  }))

  //export userApp
module.exports=userApp;