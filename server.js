import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import connectDB from "./src/db/dbconnect.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import {initializeQueue} from "./src/controllers/Pdf.controller.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { connectRedis, getPub, getSub } from "./src/utils/redisConfig.js";


const app = express();

await connectDB();
await connectRedis();
initializeQueue();
var corsOptions = {
  origin: "https://chat-app-j86o.onrender.com", //
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import  user routes
import UserRouter from "./src/routes/User.routes.js";

app.use("/users", UserRouter);
//chats routes
import ChatRouter from "./src/routes/Chat.routes.js";
app.use("/chats", ChatRouter);

//pdf routes
import PdfRouter from "./src/routes/pdf.routes.js";
app.use("/api", PdfRouter);

//message routes
import MessageRouter from "./src/routes/Message.routes.js";
import { decryptMessage, encryptMessage } from "./src/utils/encrypt.js";

app.use("/message", MessageRouter);

//aichat routes
import AiChatRouter from "./src/routes/AiChat.routes.js";
app.use("/aichat", AiChatRouter);

// -----------Deployment Code----------------

const _dirname1 = path.resolve();
if (process.env.NODE_ENV === "development") {
  app.use(express.static(path.join(_dirname1, "Frontend/Talk-a-tive/dist")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(_dirname1, "Frontend", "Talk-a-tive", "dist", "index.html"),
    );
  });
} else {
  app.get("/", (req, res) => {
    res.send("server is ready");
  });
}

// -----------Deployment Code----------------

app.get("/", (req, res) => {
  res.send("server is ready");
});

app.get("/api/data", (req, res) => {
  res.send(chats);
});

app.get("/api/data/:id", (req, res) => {
  const singlechat = chats.find((e) => e._id == req.params.id);
  res.send(singlechat);
});

import { errorHandler } from "./src/middleware/error.middleware.js";
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";


const server = app.listen(PORT, () => {
  console.log(`Server is listning on port : ${API_BASE_URL}`);
});

///************************************** socket  implemenetation ******************************************///
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:5173", "https://chat-app-j86o.onrender.com"],
  },
});

io.adapter(createAdapter(getPub(), getSub()));

console.log("✅ Redis Socket Adapter Connected");

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData || !userData._id) {
      console.log("Setup failed: INVALID userData", userData);
      return;
    }
    console.log(`Socket ${socket.id} joining room: ${userData._id}`);
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    console.log(`Socket ${socket.id} joining chat room: ${room}`);
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop_typing", (room) => {
    socket.in(room).emit("stop_typing");
  });

  socket.on("new message", async (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) {
      return console.log("❌ chat.users not defined");
    }

    chat.users.forEach((user) => {
      // Skip sender
      if (user._id == newMessageRecieved.sender._id) {
        return;
      }

      console.log(`📤 Sending message to room ${user._id}`);

      // Redis adapter handles scaling automatically
      io.to(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("disconnect", () => {
    console.log("user Disconnected");
  });
});
