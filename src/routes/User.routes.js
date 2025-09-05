import { Router } from "express";
import { registerUser,loginUser, logoutUser, getallUser } from "../controllers/User.controler.js";
import { upload } from "../middleware/mutlter.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
     {
        name :"pic",
        maxCount:1
     }
    ]),
    
    registerUser)

 router.route("/login").post(loginUser)   
 router.route("/logout").post(verifyJwt,logoutUser)
 router.route("/getallUser").get(verifyJwt,getallUser)



export default router