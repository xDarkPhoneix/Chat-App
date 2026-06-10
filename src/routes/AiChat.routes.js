import express from "express";
import {verifyJwt as protect } from "../middleware/auth.middleware.js";
import { handleAiChat } from "../controllers/AiChat.controller.js";

const router = express.Router();

router.post("/generate", protect, handleAiChat);

export default router;
