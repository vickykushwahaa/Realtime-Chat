const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Chat = require("./models/Chat");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Chat API Running...");
});

// DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));


const PORT = process.env.PORT || 5000;
const http = require("http");
const { Server } = require("socket.io");

// create HTTP server
const server = http.createServer(app);

// socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});


io.on("connection", (socket) => {

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log("Socket joined chat room:", chatId);
  });

  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);

    io.to(data.chatId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

