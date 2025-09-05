import { Router } from "express";
import { acessChat, addToGroup, createGroupChat, fetchchats, getCHats, removeFromGroup, renameGroup } from "../controllers/Chat.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";


const router=Router()


router.route("/chats").get(getCHats)
router.route("/acessChat").post(verifyJwt,acessChat)
router.route("/fetchchats").get(verifyJwt,fetchchats)
router.route("/createGroupChat").post(verifyJwt,createGroupChat)
router.route("/renamegroup").put(verifyJwt,renameGroup)
router.route("/addToGroup").post(verifyJwt,addToGroup)
router.route("/removeFromGroup").post(verifyJwt,removeFromGroup)



export default router