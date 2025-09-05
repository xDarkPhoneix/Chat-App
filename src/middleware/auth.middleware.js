import jwt from "jsonwebtoken"
import { asynchandler } from "../utils/asynchandler.js"
import { API_ERROR } from "../utils/ApiError.js"
import { User } from "../Models/User.Model.js"


export const  verifyJwt=asynchandler(async(req,res,next)=>{
 
  
   const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
  
  if(!token){
    throw new API_ERROR(401,"Unauthorized request")
  }

  const  decodedToken=jwt.verify(token,"jhgusgasygysa")

  const user=await User.findById(decodedToken?._id).select("-password")
  
  

  if(!user){
    throw new API_ERROR(401,"Unauthorized Acesss")
  }

  req.user=user
  
  
  next()



})