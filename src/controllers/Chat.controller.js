import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { API_ERROR } from "../utils/ApiError.js";
import { Chats } from "../Models/Chat.Model.js";
import { User } from "../Models/User.Model.js";
import { json } from "express";
import mongoose from "mongoose";


const getCHats=asynchandler(async(req,res)=>{
    const chats = [
        {
          isGroupChat: false,
          users: [
            {
              name: "John Doe",
              email: "john@example.com",
            },
            {
              name: "Piyush",
              email: "piyush@example.com",
            },
          ],
          _id: "617a077e18c25468bc7c4dd4",
          chatName: "John Doe",
        },
        {
          isGroupChat: false,
          users: [
            {
              name: "Guest User",
              email: "guest@example.com",
            },
            {
              name: "Piyush",
              email: "piyush@example.com",
            },
          ],
          _id: "617a077e18c25468b27c4dd4",
          chatName: "Guest User",
        },
        {
          isGroupChat: false,
          users: [
            {
              name: "Anthony",
              email: "anthony@example.com",
            },
            {
              name: "Piyush",
              email: "piyush@example.com",
            },
          ],
          _id: "617a077e18c2d468bc7c4dd4",
          chatName: "Anthony",
        },
        {
          isGroupChat: true,
          users: [
            {
              name: "John Doe",
              email: "jon@example.com",
            },
            {
              name: "Piyush",
              email: "piyush@example.com",
            },
            {
              name: "Guest User",
              email: "guest@example.com",
            },
          ],
          _id: "617a518c4081150716472c78",
          chatName: "Friends",
          groupAdmin: {
            name: "Guest User",
            email: "guest@example.com",
          },
        },
        {
          isGroupChat: false,
          users: [
            {
              name: "Jane Doe",
              email: "jane@example.com",
            },
            {
              name: "Piyush",
              email: "piyush@example.com",
            },
          ],
          _id: "617a077e18c25468bc7cfdd4",
          chatName: "Jane Doe",
        },
        {
          isGroupChat: true,
          users: [
            {
              name: "John Doe",
              email: "jon@example.com",
            },
            {
              name: "Piyush",
              email: "piyush@example.com",
            },
            {
              name: "Guest User",
              email: "guest@example.com",
            },
          ],
          _id: "617a518c4081150016472c78",
          chatName: "Chill Zone",
          groupAdmin: {
            name: "Guest User",
            email: "guest@example.com",
          },
        },
      ];
      
   res.send(chats)

})

const acessChat=asynchandler(async(req,res)=>{
    const {userId}=req.body
    const myId=req.user._id
    if(!userId){
        throw new API_ERROR(401,"Please provide userId")
    }

    var isChat=await Chats.aggregate([
     { $match:{
        users:{
          $all:[ new mongoose.Types.ObjectId(req.user._id),new mongoose.Types.ObjectId(userId)]
        }
      }
    }

    ])
    isChat=await User.populate(isChat,{
       path:"users",
       select:"name email _id pic createdAt updatedAt"
  });
    

     isChat=await User.populate(isChat,{
            path:"latestMessage.sender",
            select:"name email"
        });
     
       
     if(isChat.length>0){
       
       
        
        res.status(201).send(isChat[0])
     }else {
           
      console.log("new chat created");
      
         var chatData={   
                chatName:"sender",
                isGroupChat:false,
                users:[req.user._id,userId]
              

            }
                   
      try {
        const createdChat= await Chats.create(chatData)
        const fullchat=await Chats.findOne({_id:createdChat._id}).populate("users","-password")
        
         
        res.status(201).send(fullchat)
     } catch (error) {

       throw new API_ERROR(400,"failed to create chat")
       
     }
    
    }
    
    
            
     



     
})

const fetchchats=asynchandler(async(req,res)=>{
   
   
   try {
     var allchat=await Chats.find({
         users:{$elemMatch:{$eq:req.user._id}}
     })
     .populate("users","-password")
     .populate("groupAdmin")
     .populate("latestMessage")
     .sort({updatedAt:-1})

     if(!allchat){
        throw new API_ERROR(401,"chats not found")
     }
     
    allchat= await User.populate(allchat,{
        path:"latestMessage.sender",
        select:"name email"
    })
     
   

     res.status(201).json(new ApiResponse(200,"fetched chat sucessfully",allchat))
 
   } catch (error) {
    throw new API_ERROR(400,"Something went wrong while fetching chats")
    
   }
    
})

const createGroupChat=asynchandler(async(req,res)=>{
  var name=req.body.name
  var users=JSON.parse(req.body.users)
  console.log(users,name);

  if(users.length<2){
    throw new API_ERROR(400,"More than two users are required to crate group")
  }

  users.push(req.user)

  const groupchat=await Chats.create({
    isGroupchat:true,
    chatName:name,
    users:users,
    groupAdmin:req.user
      


  })

  if(!groupchat){
    throw new API_ERROR(400,"Group chat was not created")
  }

  const fullchat=await Chats.findOne({_id:groupchat._id})
  .populate("users","-password")
  .populate("groupAdmin","-password")
  
 if(!fullchat){
  throw new API_ERROR(400,"group chat created but not fetched")
 }
   
 res.status(201).json(
  new ApiResponse(200,"Group Chat created sucessfully",fullchat)
 )


})

const renameGroup=asynchandler(async(req,res)=>{

  const {chatId,chatName}=req.body

  console.log(chatId,chatName);

 const updatedChat= await Chats.findByIdAndUpdate(
    chatId,
    {
      chatName
    },{
      new:true
    }
  ).populate("users","-password")
  .populate("groupAdmin","-password")

  if(!updatedChat){
    throw new API_ERROR(400,"chat name failed to update")
  }

  res.status(201).json(new ApiResponse(200,"chatName updated successfully",updatedChat))
  

})

const addToGroup=asynchandler(async(req,res)=>{
    const {chatId,userId}=req.body
    
  const newCHat=  await Chats.findByIdAndUpdate(
      chatId,
      {
        $push:{
          users:userId
        }
      },
      {
        new :true
      }
    ).populate("users","-password")
    .populate("groupAdmin","-password")
     
  

    if(!newCHat){
      throw new API_ERROR(400,"new member not added to group")
     }

     res.status(201).json(new ApiResponse(200,"Member add to group sucessfully",newCHat))

})


const removeFromGroup=asynchandler(async(req,res)=>{
  const {chatId,userId}=req.body
  
const newCHat=  await Chats.findByIdAndUpdate(
    chatId,
    {
      $pull:{
        users:userId
      }
    },
    {
      new :true
    }
  ).populate("users","-password")
  .populate("groupAdmin","-password")
   


  if(!newCHat){
    throw new API_ERROR(400,"new member not added to group")
   }

   res.status(201).json(new ApiResponse(200,"Member removed from group sucessfully",newCHat))

})

export {
    getCHats,
    acessChat,
    fetchchats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup
}