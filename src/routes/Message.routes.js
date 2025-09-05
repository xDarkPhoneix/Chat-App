import { Router } from "express";
import { getAllMessage, sendMessage } from "../controllers/Message.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router=Router()

router.route("/sendmessage").post(verifyJwt,sendMessage)
router.route("/:chatId").get(verifyJwt,getAllMessage)


export default router