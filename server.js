import dotenv from "dotenv";
import express from "express";
import connectDB from "./src/db/dbconnect.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import Redis from "ioredis";

dotenv.config({ path: "./.env" });
const app = express();

connectDB();
var corsOptions = {
  origin: "https://chat-app-j86o.onrender.com",
  methods: ["GET, POST, PUT, DELETE, OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const pub = new Redis({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT,
  username: "default",
  password: process.env.AIVEN_PASSWORD,
});

const sub = new Redis({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT,
  username: "default",
  password: process.env.AIVEN_PASSWORD,
});

//routes import  user routes
import UserRouter from "./src/routes/User.routes.js";

app.use("/users", UserRouter);
//chats routes
import ChatRouter from "./src/routes/Chat.routes.js";
app.use("/chats", ChatRouter);

//message routes
import MessageRouter from "./src/routes/Message.routes.js";
import { decryptMessage, encryptMessage } from "./src/utils/encrypt.js";

app.use("/message", MessageRouter);

// -----------Deployment Code----------------

const _dirname1 = path.resolve();
if (process.env.NODE_ENV === "development") {
  app.use(express.static(path.join(_dirname1, "Frontend/Talk-a-tive/dist")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(_dirname1, "Frontend", "Talk-a-tive", "dist", "index.html")
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

const PORT = process.env.PORT || 3000;

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const server = app.listen(PORT, () => {
  console.log(`Server is listning on port : ${API_BASE_URL}`);
});

///************************************** socket  implemenetation ******************************************///
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://chat-app-j86o.onrender.com",
  },
});

await sub.subscribe("new message");

sub.on("message", (channel, data) => {
  const { newMessageRecieved, id } = JSON.parse(data);
  // const decryptedMessage = {
  //   ...newMessageRecieved, // copy all existing fields
  //   content: decryptMessage(newMessageRecieved.content), // replace only content
  // };

  io.to(id).emit("message recieved", newMessageRecieved);
});
io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    // console.log("user",userData._id);

    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    // console.log("hola",room);

    socket.join(room);
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop_typing", (room) => {
    socket.in(room).emit("stop_typing");
  });

  socket.on("new message", async (newMessageRecieved) => {
    // console.log(newMessageRecieved.content);

    //await pub.publish("new message",JSON.stringify({newMessageRecieved}))
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) {
        return;
      }
      //  console.log("user iD",user._id);

      var id = user._id;



      pub.publish("new message", JSON.stringify({ newMessageRecieved, id }));

    });
  });

  socket.off("disconnect", () => {
    console.log("user Disconnected");
    //socket.leave(userData._id)
  });
});
