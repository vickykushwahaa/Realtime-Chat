const router = require("express").Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "_id email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "User fetch failed" });
  }
});

module.exports = router;
