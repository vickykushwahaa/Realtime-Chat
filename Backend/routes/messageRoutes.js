const express = require("express");
const Message = require("../models/Message");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;

    // validation
    if (!chatId || !senderId || !text) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ msg: "Invalid chatId" });
    }

    const message = await Message.create({
      chatId,
      senderId,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("MESSAGE SAVE ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
