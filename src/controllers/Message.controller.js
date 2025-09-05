import { Chats } from "../Models/Chat.Model.js";
import { Message } from "../Models/Message.Model.js";
import { User } from "../Models/User.Model.js";
import { API_ERROR } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { decryptMessage, encryptMessage } from "../utils/encrypt.js";

const sendMessage=asynchandler(async(req,res)=>{
      
    const {content,chatId}=req.body

    if(!content || !chatId){
        throw new API_ERROR(400,"chaId or content missing")
    }
    const encryptedMessage=encryptMessage(content)
   
    var newmessage={
        sender:req.user._id,
        content:encryptedMessage,
        chat:chatId
    }
   
    var message=await Message.create(newmessage)
    message=await message.populate("sender","name email")
     message=await message.populate("chat") 
     message=await User.populate(message,{
        path:"chat.users",
        select:"name pic email"
     })
    
    
      
    if(!message){
        throw new API_ERROR(500,"message was not created")
    }

  
//    const msg = message.map((m) => {
//       return {
//         ...m._doc, // keep other fields
//         content: decryptMessage(m.content), // decrypt content
//       };
//     });

    
    
    
    await Chats.findByIdAndUpdate( req.body.chatId,
        {
            latestMessage:message
        },
        {
            new :true
        }
    )
     message.content = decryptMessage(message.content);

    res.status(201).json(new ApiResponse(200,"Message send successfully",message))




})

const getAllMessage=asynchandler(async(req,res)=>{
try {

    const newmsg=await Message.find({
        chat:req.params.chatId
    }).populate("sender","name pic email")
    .populate("chat")

   const msg = newmsg.map((m) => {
      return {
        ...m._doc, // keep other fields
        content: decryptMessage(m.content), // decrypt content
      };
    });
    

    res.status(201).json(new ApiResponse(200,
        "Message fetched successfull",
        msg
    ))
    
} catch (error) {
    throw new API_ERROR(400,"Something went wrong while fetching chats")
}
 

})

export {
    sendMessage,
    getAllMessage
}