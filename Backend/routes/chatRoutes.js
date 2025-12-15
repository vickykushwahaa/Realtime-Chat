const express = require("express");
const Chat = require("../models/Chat");

const router = express.Router();

// create or get chat
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  let chat = await Chat.findOne({
    members: { $all: [senderId, receiverId] }
  });

  if (!chat) {
    chat = await Chat.create({
      members: [senderId, receiverId]
    });
  }

  res.json(chat);
});

module.exports = router;
