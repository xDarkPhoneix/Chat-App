import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const UserSchema = mongoose.Schema(
  {
    name: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
      unique:true
    },
    password: {
      type: "string",
      required: true,
    },
    pic: {
      type: "string",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
   
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save",async function (next) {
  if(!this.isModified()) return next();

  this.password= await bcrypt.hash(this.password,10)
  next()

 } )

 UserSchema.methods.isPasswordCorrect=async function(password){

   return  await bcrypt.compare(password,this.password)

 }

UserSchema.methods.generateAccessToken= function(){
  return jwt.sign({
    _id:this._id
  },
  "jhgusgasygysa",
  {
    expiresIn:"10d"
  }

)
}


 UserSchema.methods.generateRefreshToken= function (){
  return  jwt.sign(
    {
      _id:this._id,
    
    },
    "joijxoiioshhosi",
    {
      expiresIn:"10d"
    }
    
    
  )
 }



export const User = mongoose.model("User", UserSchema);
