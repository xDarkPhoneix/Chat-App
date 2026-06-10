import {Router} from "express"
import {upload} from "../middleware/mutlter.middleware.js"
import { uploadpdf,pdfchat } from "../controllers/Pdf.controller.js"
import { verifyJwt } from "../middleware/auth.middleware.js"


const router=Router()

router.post("/uploads",verifyJwt, upload.single("pdf"),uploadpdf)
router.post("/chat",verifyJwt,pdfchat)


export  default router